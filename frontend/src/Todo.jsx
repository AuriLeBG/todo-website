import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTodoItem from './SortableTodoItem';
import TodoCalendar from './TodoCalendar';
import FocusMode from './FocusMode';
import ThemeToggle from './ThemeToggle';
import ProgressPlant from './ProgressPlant';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/Todo';

const Todo = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [priority, setPriority] = useState('0'); // 0: Low, 1: Medium, 2: High
    const [category, setCategory] = useState('Personal');
    const [recurrence, setRecurrence] = useState('0'); // 0: None, 1: Daily, 2: Weekly, 3: Monthly
    const [recurrenceValue, setRecurrenceValue] = useState(null); // Day/Date for Weekly/Monthly
    const [deadline, setDeadline] = useState(null);
    const [view, setView] = useState('list'); // list or calendar
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ title: '', priority: '0', category: 'Personal', deadline: null });
    const [activeFocusTask, setActiveFocusTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const categories = ['Personal', 'Work', 'Health', 'Learning', 'Finance'];

    useEffect(() => {
        if (user && user.id) {
            fetchTodos();
        }
    }, [user]);

    const fetchTodos = async () => {
        try {
            const response = await axios.get(`${API_URL}/${user.id}`);
            setTodos(response.data);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        const todoData = {
            title: newTodo,
            userId: user.id,
            priority: parseInt(priority),
            category: category,
            recurrence: parseInt(recurrence),
            recurrenceValue: recurrenceValue,
            deadline: deadline ? deadline.toISOString() : null,
            isCompleted: false
        };

        try {
            const response = await axios.post(API_URL, todoData);
            setTodos([...todos, response.data]);
            setNewTodo('');
            setPriority('0');
            setCategory('Personal');
            setRecurrence('0');
            setRecurrenceValue(null);
            setDeadline(null);
        } catch (error) {
            console.error("Error adding todo:", error);
        }
    };

    const handleToggleComplete = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const updatedTodo = { ...todo, isCompleted: !todo.isCompleted };

        // Optimistic update
        setTodos(todos.map(t => t.id === id ? updatedTodo : t));

        try {
            await axios.put(`${API_URL}/${id}`, updatedTodo);
            if (updatedTodo.isCompleted && updatedTodo.recurrence !== 0) {
                fetchTodos();
            }
        } catch (error) {
            console.error("Error updating todo:", error);
            setTodos(todos.map(t => t.id === id ? todo : t));
        }
    };

    const handleDeleteTodo = async (id) => {
        const previousTodos = [...todos];
        setTodos(todos.filter(t => t.id !== id));

        try {
            await axios.delete(`${API_URL}/${id}`);
        } catch (error) {
            console.error("Error deleting todo:", error);
            setTodos(previousTodos);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setTodos((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const reorderedIds = newItems.map(t => t.id);
                axios.post(`${API_URL}/reorder`, reorderedIds).catch(err => console.error("Reorder failed", err));

                return newItems;
            });
        }
    };

    const handleAddSubTask = async (todoId, title) => {
        if (!title.trim()) return;
        const tempId = Date.now();

        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const newSubTask = { id: tempId, title, isCompleted: false, todoItemId: todoId };
        const updatedTodo = { ...todo, subTasks: [...(todo.subTasks || []), newSubTask] };

        setTodos(todos.map(t => t.id === todoId ? updatedTodo : t));

        try {
            const response = await axios.post(`${API_URL}/${todoId}/subtasks`, { title, isCompleted: false });
            setTodos(currentTodos => currentTodos.map(t => {
                if (t.id === todoId) {
                    return { ...t, subTasks: t.subTasks.map(st => st.id === tempId ? response.data : st) };
                }
                return t;
            }));
        } catch (error) {
            console.error("Error adding subtask:", error);
            fetchTodos();
        }
    };

    const handleToggleSubTask = async (todoId, subTaskId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const subTask = todo.subTasks.find(st => st.id === subTaskId);
        if (!subTask) return;

        const updatedSubTask = { ...subTask, isCompleted: !subTask.isCompleted };
        const updatedTodo = {
            ...todo,
            subTasks: todo.subTasks.map(st => st.id === subTaskId ? updatedSubTask : st)
        };

        setTodos(todos.map(t => t.id === todoId ? updatedTodo : t));

        try {
            await axios.put(`${API_URL}/subtasks/${subTaskId}`, updatedSubTask);
        } catch (error) {
            console.error("Error updating subtask:", error);
            fetchTodos();
        }
    };

    const handleDeleteSubTask = async (todoId, subTaskId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const updatedTodo = {
            ...todo,
            subTasks: todo.subTasks.filter(st => st.id !== subTaskId)
        };

        setTodos(todos.map(t => t.id === todoId ? updatedTodo : t));

        try {
            await axios.delete(`${API_URL}/subtasks/${subTaskId}`);
        } catch (error) {
            console.error("Error deleting subtask:", error);
            fetchTodos();
        }
    };

    const handleStartEdit = (todo) => {
        setEditId(todo.id);
        setEditData({
            title: todo.title,
            priority: todo.priority.toString(),
            category: todo.category || 'Personal',
            deadline: todo.deadline ? new Date(todo.deadline) : null
        });
    };

    const handleUpdateTodo = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const updatedTodo = {
            ...todo,
            title: editData.title,
            priority: parseInt(editData.priority),
            category: editData.category,
            deadline: editData.deadline ? editData.deadline.toISOString() : null
        };

        setTodos(todos.map(t => t.id === id ? updatedTodo : t));
        setEditId(null);

        try {
            await axios.put(`${API_URL}/${id}`, updatedTodo);
        } catch (error) {
            console.error("Error updating todo:", error);
            fetchTodos();
        }
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 2: return <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">High</span>;
            case 1: return <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">Medium</span>;
            default: return <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">Low</span>;
        }
    };

    const getCategoryBadge = (cat) => {
        const colors = {
            'Personal': 'bg-blue-600 text-white',
            'Work': 'bg-purple-600 text-white',
            'Health': 'bg-red-600 text-white',
            'Learning': 'bg-teal-600 text-white',
            'Finance': 'bg-emerald-600 text-white',
        };
        const colorClass = colors[cat] || 'bg-gray-600 text-white';
        return <span className={`${colorClass} text-xs font-bold px-2 py-1 rounded-lg shadow-sm tracking-wide`}>{cat}</span>;
    };

    const completedCount = todos.filter(t => t.isCompleted).length;

    const filteredTodos = todos.filter(todo => {
        if (view === 'history') {
            return todo.isCompleted;
        }
        if (view === 'list') {
            if (todo.isCompleted) return false;
            if (categoryFilter !== 'All' && todo.category !== categoryFilter) return false;
            return true;
        }
        return true;
    });

    return (
        <div className="min-h-screen relative overflow-x-hidden text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">
            {/* Background Image & Overlay */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-105"
                style={{
                    backgroundImage: theme === 'dark'
                        ? 'url("https://images.unsplash.com/photo-1519681393798-38e43269d877?q=80&w=2000&auto=format&fit=crop")'
                        : 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop")',
                }}
            ></div>
            <div className="fixed inset-0 z-0 bg-black/40 dark:bg-black/70 backdrop-blur-[2px]"></div>

            {/* Focus Mode Overlay */}
            {activeFocusTask && (
                <FocusMode
                    task={activeFocusTask}
                    onExit={() => setActiveFocusTask(null)}
                    onComplete={async (id) => {
                        await handleToggleComplete(id);
                        setActiveFocusTask(null);
                    }}
                />
            )}

            <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 min-h-screen">
                {/* Main Content */}
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-5xl font-extrabold text-white drop-shadow-2xl tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>My Tasks</h1>
                        <div className="flex gap-4 items-center">
                            <ThemeToggle />
                            <button onClick={() => navigate('/')} className="text-gray-800 hover:text-black transition flex items-center gap-2 bg-white/95 backdrop-blur px-5 py-2.5 rounded-xl shadow-xl hover:bg-white hover:scale-105 transform duration-200 font-bold">
                                ← Dashboard
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-gray-700/50 p-8 mb-10 transition-all hover:bg-white/95 dark:hover:bg-gray-900/95">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <span className="text-3xl">🌱</span> New Mission
                        </h2>

                        <form onSubmit={handleAddTodo} className="space-y-4 mb-10">
                            <div className="flex flex-col md:flex-row gap-3">
                                <input
                                    type="text"
                                    className="flex-grow px-5 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition text-lg"
                                    placeholder="What needs to be done?"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                />
                                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Add Task
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-3 items-center">
                                <select
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="0">Low Priority</option>
                                    <option value="1">Medium Priority</option>
                                    <option value="2">High Priority</option>
                                </select>

                                <select
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>

                                <select
                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                    value={recurrence}
                                    onChange={(e) => {
                                        setRecurrence(e.target.value);
                                        setRecurrenceValue(null);
                                    }}
                                >
                                    <option value="0">One-off</option>
                                    <option value="1">Daily</option>
                                    <option value="2">Weekly</option>
                                    <option value="3">Monthly</option>
                                </select>

                                {parseInt(recurrence) === 0 && (
                                    <div className="relative z-50">
                                        <DatePicker
                                            selected={deadline}
                                            onChange={(date) => setDeadline(date)}
                                            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 w-32"
                                            placeholderText="No deadline"
                                            popperClassName="z-[9999]"
                                            popperContainer={({ children }) => createPortal(children, document.body)}
                                        />
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* View Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors relative ${view === 'list' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                onClick={() => setView('list')}
                            >
                                List View
                                {view === 'list' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400"></div>}
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors relative ${view === 'calendar' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                onClick={() => setView('calendar')}
                            >
                                Calendar View
                                {view === 'calendar' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400"></div>}
                            </button>
                            <button
                                className={`px-4 py-2 font-medium text-sm transition-colors relative ${view === 'history' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                onClick={() => setView('history')}
                            >
                                History View
                                {view === 'history' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600 dark:bg-purple-400"></div>}
                            </button>
                        </div>

                        {/* Filter Bar */}
                        {view === 'list' && (
                            <div className="flex gap-2 mb-6 items-center overflow-x-auto pb-2">
                                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">Filter by:</span>
                                <button
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors whitespace-nowrap ${categoryFilter === 'All' ? 'bg-gray-200 dark:bg-gray-700 font-bold' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                    onClick={() => setCategoryFilter('All')}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors whitespace-nowrap ${categoryFilter === cat ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                        onClick={() => setCategoryFilter(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Content Area */}
                        <div className="space-y-4">
                            {view === 'calendar' ? (
                                <TodoCalendar todos={todos} onUpdateTodo={handleUpdateTodo} />
                            ) : (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={filteredTodos.map(t => t.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {filteredTodos.map((todo) => (
                                                <SortableTodoItem
                                                    key={todo.id}
                                                    todo={todo}
                                                    isEditing={editId === todo.id}
                                                    editData={editData}
                                                    setEditData={setEditData}
                                                    onToggleComplete={handleToggleComplete}
                                                    onDelete={handleDeleteTodo}
                                                    onStartEdit={handleStartEdit}
                                                    onUpdate={handleUpdateTodo}
                                                    onCancelEdit={() => setEditId(null)}
                                                    getPriorityBadge={getPriorityBadge}
                                                    getCategoryBadge={getCategoryBadge}
                                                    categories={categories}
                                                    onAddSubTask={handleAddSubTask}
                                                    onToggleSubTask={handleToggleSubTask}
                                                    onDeleteSubTask={handleDeleteSubTask}
                                                    onFocus={() => setActiveFocusTask(todo)}
                                                />
                                            ))}
                                            {filteredTodos.length === 0 && (
                                                <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                    <p className="text-gray-400 dark:text-gray-500">
                                                        {view === 'history' ? "No completed tasks yet." : "No tasks found in this category."}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="w-full md:w-80 flex flex-col gap-6">
                    <div className="sticky top-8 space-y-6">
                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-gray-700/50 p-8 flex flex-col items-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-wider text-xs opacity-50">Progress</h3>
                            <ProgressPlant completedCount={completedCount} totalCount={todos.length} />
                            <div className="mt-8 text-center space-y-1">
                                <div className="text-4xl font-black text-purple-600 dark:text-purple-400">{completedCount}/{todos.length}</div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Missions Accomplished</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl p-8 text-white text-center border border-white/20">
                            <h3 className="font-bold text-lg mb-3">Daily Wisdom</h3>
                            <p className="italic text-sm opacity-90 leading-relaxed font-medium">"Focus is about saying no."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Todo;

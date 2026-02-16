import React from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SortableTodoItem = ({ todo, isEditing, editData, setEditData, onToggleComplete, onDelete, onStartEdit, onUpdate, onCancelEdit, getPriorityBadge, getCategoryBadge, categories, onAddSubTask, onToggleSubTask, onDeleteSubTask, onFocus }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative',
        zIndex: isDragging ? 2 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group flex items-center justify-between p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300">
            {isEditing ? (
                <form onSubmit={(e) => { e.preventDefault(); onUpdate(todo.id); }} className="flex flex-col gap-3 flex-grow animate-fade-in">
                    <input
                        type="text"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                        <select
                            value={editData.priority}
                            onChange={(e) => setEditData({ ...editData, priority: parseInt(e.target.value) })}
                            className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200"
                        >
                            <option value="0">Low</option>
                            <option value="1">Medium</option>
                            <option value="2">High</option>
                        </select>
                        <select
                            value={editData.category || 'Personal'}
                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-gray-200"
                        >
                            {categories && categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select
                            value={editData.recurrence}
                            onChange={(e) => setEditData({ ...editData, recurrence: parseInt(e.target.value), recurrenceValue: null })}
                            className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200"
                        >
                            <option value="0">No Repeat</option>
                            <option value="1">Daily</option>
                            <option value="2">Weekly</option>
                            <option value="3">Monthly</option>
                        </select>

                        {parseInt(editData.recurrence) === 2 && (
                            <select
                                value={editData.recurrenceValue ?? ""}
                                onChange={(e) => setEditData({ ...editData, recurrenceValue: parseInt(e.target.value) })}
                                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200"
                            >
                                <option value="">Day...</option>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                    <option key={index} value={index}>{day}</option>
                                ))}
                            </select>
                        )}

                        {parseInt(editData.recurrence) === 3 && (
                            <input
                                type="number"
                                min="1"
                                max="31"
                                placeholder="Day"
                                value={editData.recurrenceValue ?? ""}
                                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-20 text-gray-800 dark:text-gray-200"
                                onChange={(e) => setEditData({ ...editData, recurrenceValue: parseInt(e.target.value) })}
                            />
                        )}

                        {parseInt(editData.recurrence) === 0 && (
                            <div className="relative z-50">
                                <DatePicker
                                    selected={editData.deadline ? new Date(editData.deadline) : null}
                                    onChange={(date) => setEditData({ ...editData, deadline: date ? date.toISOString() : null })}
                                    className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm w-full text-gray-800 dark:text-gray-200"
                                    placeholderText="Deadline"
                                    popperClassName="z-[9999]"
                                    popperContainer={({ children }) => createPortal(children, document.body)}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={onCancelEdit} className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Cancel</button>
                        <button type="submit" className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Save</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="flex items-center gap-4 flex-grow">
                        <button
                            onClick={() => onToggleComplete(todo.id)}
                            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${todo.isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-transparent' : 'border-gray-300 dark:border-gray-500 hover:border-purple-500 dark:hover:border-purple-400'}`}
                        >
                            {todo.isCompleted && <span className="text-white text-xs font-bold">✓</span>}
                        </button>

                        <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`text-lg font-medium transition-colors ${todo.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                                    {todo.title}
                                </span>
                                {getPriorityBadge(todo.priority)}
                                {getCategoryBadge && getCategoryBadge(todo.category || 'Personal')}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {todo.deadline && (
                                    <span className={`text-xs flex items-center gap-1 ${new Date(todo.deadline) < new Date() && !todo.isCompleted ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        {new Date(todo.deadline).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                                {todo.recurrence !== 0 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 dark:bg-purple-900 dark:text-purple-300">
                                        🔄 {todo.recurrence === 1 ? 'Daily' : todo.recurrence === 2 ? 'Weekly' : 'Monthly'}
                                    </span>
                                )}
                            </div>

                            {/* Subtasks Section */}
                            <div className="mt-3 pl-2 border-l-2 border-gray-100 dark:border-gray-700 space-y-2">
                                {todo.subTasks && todo.subTasks.map(subTask => (
                                    <div key={subTask.id} className="flex items-center gap-2 group/sub">
                                        <button
                                            onClick={() => onToggleSubTask && onToggleSubTask(todo.id, subTask.id)}
                                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${subTask.isCompleted ? 'bg-purple-500 border-purple-500' : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'}`}
                                        >
                                            {subTask.isCompleted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                        </button>
                                        <span className={`text-sm ${subTask.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {subTask.title}
                                        </span>
                                        <button
                                            onClick={() => onDeleteSubTask && onDeleteSubTask(todo.id, subTask.id)}
                                            className="opacity-0 group-hover/sub:opacity-100 text-gray-400 hover:text-red-500 ml-auto"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                ))}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 dark:text-gray-500">+</span>
                                    <input
                                        type="text"
                                        placeholder="Add subtask..."
                                        className="bg-transparent text-sm border-none focus:ring-0 p-0 placeholder-gray-400 dark:placeholder-gray-600 dark:text-gray-300 w-full"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                onAddSubTask(todo.id, e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2 self-start">
                        <button
                            onClick={() => onFocus(todo)}
                            className="text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                            title="Focus Mode"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </button>
                        <button
                            onClick={() => onStartEdit(todo)}
                            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                            title="Edit task"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button
                            onClick={() => onDelete(todo.id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                            title="Delete task"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SortableTodoItem;

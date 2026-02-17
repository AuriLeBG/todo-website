import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import { format, isSameDay, parseISO } from 'date-fns';

const NotificationManager = () => {
    const { user } = useAuth();
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        if (!user || permission !== 'granted') return;

        const checkDailyNotifications = async () => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const lastNotified = localStorage.getItem('last_notification_date');

            if (lastNotified === todayStr) {
                console.log('Daily notification already sent.');
                return;
            }

            try {
                const response = await api.get('/todos');
                const todos = response.data;

                const tasksDueToday = todos.filter(todo =>
                    !todo.IsCompleted &&
                    todo.DueDate &&
                    isSameDay(parseISO(todo.DueDate), new Date())
                );

                if (tasksDueToday.length > 0) {
                    sendNotification(
                        'Antigravity Todo',
                        `Hey ${user.username}, tu as ${tasksDueToday.length} tâches à faire aujourd'hui ! 🚀`
                    );
                    localStorage.setItem('last_notification_date', todayStr);
                }
            } catch (error) {
                console.error('Failed to check tasks for notifications:', error);
            }
        };

        checkDailyNotifications();

        const interval = setInterval(checkDailyNotifications, 60 * 60 * 1000);
        return () => clearInterval(interval);

    }, [user, permission]);

    const sendNotification = (title, body) => {
        // Try to use Service Worker registration for mobile support
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: '/pwa-192x192.png',
                    tag: 'daily-reminder',
                    vibrate: [200, 100, 200]
                });
            });
        } else {
            // Fallback for desktop if SW not ready
            new Notification(title, {
                body: body,
                icon: '/pwa-192x192.png',
                tag: 'daily-reminder'
            });
        }
    };

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('Ce navigateur ne supporte pas les notifications.');
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            sendNotification(
                'Antigravity',
                'Notifications activées ! Tu recevras tes rappels quotidiens. 📅'
            );
        }
    };

    if (permission === 'granted') {
        return null;
    }

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center gap-4 max-w-sm">
                <div className="bg-purple-500/20 p-2 rounded-full">
                    <span className="text-xl">🔔</span>
                </div>
                <div className="flex-1">
                    <p className="text-white font-medium text-sm">Activer les rappels ?</p>
                    <p className="text-xs text-gray-400">Pour ne rien oublier de ta journée.</p>
                </div>
                <button
                    onClick={requestPermission}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition font-bold shadow-lg shadow-purple-900/20"
                >
                    Activer
                </button>
            </div>
        </div>
    );
};

export default NotificationManager;

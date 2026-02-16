import React, { useState, useEffect } from 'react';

const NotificationManager = () => {
    const [permission, setPermission] = useState(Notification.permission);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert('Ce navigateur ne supporte pas les notifications.');
            return;
        }

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            showTestNotification();
        }
    };

    const showTestNotification = () => {
        if (Notification.permission === 'granted') {
            new Notification('Antigravity Todo', {
                body: 'Les notifications sont activées ! 🚀',
                icon: '/pwa-192x192.png'
            });
        }
    };

    if (permission === 'granted') {
        return null; // Don't show anything if already granted
    }

    return (
        <div className="p-4 bg-purple-100 border border-purple-200 rounded-lg mb-4 flex items-center justify-between">
            <div>
                <p className="text-purple-800 font-medium">Activer les notifications ?</p>
                <p className="text-sm text-purple-600">Reçois des rappels pour tes tâches directement sur ton mobile.</p>
            </div>
            <button
                onClick={requestPermission}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition font-semibold"
            >
                Activer
            </button>
        </div>
    );
};

export default NotificationManager;

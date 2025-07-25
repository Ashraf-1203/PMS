import React, { useState, useEffect, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { BellIcon } from '@heroicons/react/outline';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications(); // Refresh list
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <Popover className="relative">
            <Popover.Button className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
            </Popover.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
            >
                <Popover.Panel className="absolute z-10 mt-3 w-screen max-w-sm -right-4 sm:right-0 sm:px-0 transform">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative grid gap-6 bg-white p-4 sm:gap-8 sm:p-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                                {notifications.length > 0 && (
                                    <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
                                )}
                            </div>
                            <div className="flow-root max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((item) => (
                                        <Link
                                            key={item.NotificationID}
                                            to={item.Link || '#'}
                                            onClick={() => handleMarkAsRead(item.NotificationID)}
                                            className="-m-3 flex items-center rounded-lg p-3 transition duration-150 ease-in-out hover:bg-gray-50"
                                        >
                                            <div className="ml-4">
                                                <p className="text-sm font-medium text-gray-900">{item.Message}</p>
                                                <p className="text-sm text-gray-500">{new Date(item.CreatedAt).toLocaleString()}</p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No new notifications.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    );
};

export default Notifications;

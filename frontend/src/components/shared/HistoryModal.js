import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import activityLogService from '../../services/activityLogService';

const HistoryModal = ({ isOpen, onClose, targetEntity, targetId, title }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && targetEntity && targetId) {
            setLoading(true);
            setError('');
            activityLogService.getHistoryForTarget(targetEntity, targetId)
                .then(setHistory)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [isOpen, targetEntity, targetId]);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-20" onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    History for: <span className="font-bold">{title}</span>
                                </Dialog.Title>
                                <div className="mt-4">
                                    {loading && <p>Loading history...</p>}
                                    {error && <p className="text-red-500">{error}</p>}
                                    {!loading && !error && (
                                        <div className="max-h-96 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {history.map((item, index) => (
                                                        <tr key={item.id + '-' + index}>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(item.CreatedAt).toLocaleString()}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.Username}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.action}</td>
                                                            <td className="px-4 py-2 text-sm">{item.Remarks}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {history.length === 0 && <p className="text-center py-4">No history found for this item.</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 text-right">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default HistoryModal;

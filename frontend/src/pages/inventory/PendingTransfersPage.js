import React, { useState, useEffect, useCallback } from 'react';
import transferService from '../../services/transferService';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid';

const usePermissions = () => {
    const user = JSON.parse(localStorage.getItem('pmsUser'));
    return user?.permissions || {};
};

const PendingTransfersPage = () => {
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const permissions = usePermissions();
    const canApprove = permissions.transferPaper?.includes('approve');

    const fetchPendingTransfers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await transferService.getPendingTransfers();
            setTransfers(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingTransfers();
    }, [fetchPendingTransfers]);

    const handleApprove = async (transferId) => {
        if (window.confirm('Are you sure you want to approve this transfer? Stock will be moved immediately.')) {
            try {
                await transferService.approveTransfer(transferId);
                fetchPendingTransfers(); // Refresh list
            } catch (err) {
                alert(\`Error approving transfer: ${err.message}\`);
            }
        }
    };

    // Reject functionality would require a backend endpoint, so it's omitted for now as per plan
    const handleReject = (transferId) => {
        alert("Reject functionality to be implemented.");
    };

    if (loading) return <div className="text-center py-10">Loading pending transfers...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending Paper Transfers</h1>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Sent</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paper Details</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity (RM)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Branch</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Branch</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent By</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transfers.map((t) => (
                            <tr key={t.TransferID}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(t.SentAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.Manufacturer} - {t.Grade} - {t.Width}mm</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">{parseFloat(t.QuantityRM).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.SourceBranchName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.DestBranchName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.SentByUsername}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canApprove && (
                                        <>
                                            <button onClick={() => handleApprove(t.TransferID)} className="text-green-600 hover:text-green-900 mr-3" title="Approve">
                                                <CheckCircleIcon className="w-6 h-6" />
                                            </button>
                                            <button onClick={() => handleReject(t.TransferID)} className="text-red-600 hover:text-red-900" title="Reject">
                                                <XCircleIcon className="w-6 h-6" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {transfers.length === 0 && !loading && (
                     <div className="text-center py-8 bg-white"><p className="text-gray-500">No pending transfers found.</p></div>
                )}
            </div>
        </div>
    );
};

export default PendingTransfersPage;

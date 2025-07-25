import React, { useState, useEffect, useMemo, useCallback } from 'react';
import paperService from '../../services/paperService';
import PaperFormModal from '../../components/papers/PaperFormModal';
import HistoryModal from '../../components/shared/HistoryModal';
import { PlusIcon, PencilIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

// A placeholder for a real auth context hook
const usePermissions = () => {
    const user = JSON.parse(localStorage.getItem('pmsUser'));
    return user?.permissions || {};
};

const PapersMasterListPage = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'Manufacturer', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paperToEdit, setPaperToEdit] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyTarget, setHistoryTarget] = useState({ id: null, title: '' });


    const permissions = usePermissions();
    const canAdd = permissions.papersMasterList?.includes('add');
    const canEdit = permissions.papersMasterList?.includes('edit');
    const canDelete = permissions.papersMasterList?.includes('delete');

    const fetchPapers = useCallback(async (page) => {
        try {
            setLoading(true);
            const data = await paperService.getPapers(page);
            setPapers(data.papers.filter(p => p.IsActive));
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPapers(currentPage);
    }, [fetchPapers, currentPage]);

    const sortedPapers = useMemo(() => {
        let sortablePapers = [...papers];
        if (sortConfig !== null) {
            sortablePapers.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortablePapers;
    }, [papers, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenModal = (paper = null) => {
        setPaperToEdit(paper);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPaperToEdit(null);
    };

    const handleOpenHistoryModal = (paper) => {
        setHistoryTarget({ id: paper.PaperID, title: `${paper.Manufacturer} - ${paper.Grade} - ${paper.Width}mm` });
        setIsHistoryModalOpen(true);
    };

    const handleCloseHistoryModal = () => {
        setIsHistoryModalOpen(false);
        setHistoryTarget({ id: null, title: '' });
    };

    const handleSavePaper = async (formData, paperId) => {
        if (paperId) { // Editing existing paper
            const dataToUpdate = {
                manufacturer: formData.manufacturer,
                grade: formData.grade,
                rate: formData.rate
            };
            await paperService.updatePaper(paperId, dataToUpdate);
        } else { // Creating new paper
            await paperService.createPaper(formData);
        }
        fetchPapers(currentPage); // Refresh data after save
    };

    const handleDeletePaper = async (paperId) => {
        if (window.confirm('Are you sure you want to deactivate this paper? This action cannot be undone.')) {
            try {
                await paperService.deletePaper(paperId);
                fetchPapers(currentPage); // Refresh data
            } catch (err) {
                setError(err.message);
                alert(\`Error: ${err.message}\`);
            }
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const SortableHeader = ({ children, name }) => {
        const isSorted = sortConfig.key === name;
        return (
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(name)}>
                <div className="flex items-center">
                    {children}
                    {isSorted ? (sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />) : null}
                </div>
            </th>
        );
    };

    if (loading) return <div className="flex justify-center items-center h-full"><p className="text-lg">Loading papers...</p></div>;
    if (error && !isModalOpen) return <div className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Paper Master Data</h1>
                {canAdd && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add New Paper
                    </button>
                )}
            </div>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg max-h-[70vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <SortableHeader name="Manufacturer">Manufacturer</SortableHeader>
                            <SortableHeader name="Grade">Grade</SortableHeader>
                            <SortableHeader name="Width">Width (mm)</SortableHeader>
                            <SortableHeader name="GSM">GSM</SortableHeader>
                            <SortableHeader name="Rate">Rate</SortableHeader>
                            <SortableHeader name="StockRM">Stock (RM)</SortableHeader>
                            <SortableHeader name="StockSQM">Stock (SQM)</SortableHeader>
                            <SortableHeader name="BranchName">Branch</SortableHeader>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPapers.map((paper) => (
                            <tr key={paper.PaperID} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{paper.Manufacturer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.Grade}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(paper.Width).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.GSM}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(paper.Rate).toFixed(4)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">{parseFloat(paper.StockRM).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">{parseFloat(paper.StockSQM).toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{paper.BranchName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenHistoryModal(paper)} className="text-gray-500 hover:text-gray-800 mr-3 transition-transform duration-150 hover:scale-110" title="View History">
                                        <ClockIcon className="w-5 h-5" />
                                    </button>
                                    {canEdit && (
                                        <button onClick={() => handleOpenModal(paper)} className="text-indigo-600 hover:text-indigo-900 mr-3 transition-transform duration-150 hover:scale-110" title="Edit">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button onClick={() => handleDeletePaper(paper.PaperID)} className="text-red-600 hover:text-red-900 transition-transform duration-150 hover:scale-110" title="Deactivate">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedPapers.length === 0 && !loading && (
                    <div className="text-center py-8 bg-white"><p className="text-gray-500">No paper data found. Click "Add New Paper" to get started.</p></div>
                )}
            </div>

            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button onClick={handlePrevPage} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            <PaperFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePaper}
                paperToEdit={paperToEdit}
            />
            <HistoryModal
                isOpen={isHistoryModalOpen}
                onClose={handleCloseHistoryModal}
                targetEntity="Papers"
                targetId={historyTarget.id}
                title={historyTarget.title}
            />
        </div>
    );
};

export default PapersMasterListPage;

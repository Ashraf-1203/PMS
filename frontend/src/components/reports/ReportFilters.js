import React, { useState, useEffect } from 'react';
import branchService from '../../services/branchService';

const ReportFilters = ({ onFilterChange }) => {
    const [branches, setBranches] = useState([]);
    const [filters, setFilters] = useState({
        branchId: '',
        manufacturer: '',
        grade: '',
        // dateFrom: '',
        // dateTo: '',
    });

    useEffect(() => {
        branchService.getActiveBranches().then(setBranches);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onFilterChange(filters);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="w-full">
                    <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">Branch</label>
                    <select id="branchId" name="branchId" value={filters.branchId} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>)}
                    </select>
                </div>
                <div className="w-full">
                    <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">Manufacturer</label>
                    <input type="text" name="manufacturer" id="manufacturer" value={filters.manufacturer} onChange={handleChange} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                <div className="w-full">
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                    <input type="text" name="grade" id="grade" value={filters.grade} onChange={handleChange} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                <div className="w-full self-end">
                    <button
                        onClick={handleApply}
                        className="w-full inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportFilters;

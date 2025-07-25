import React, { useState, useEffect, useCallback } from 'react';
import userService from '../../services/userService';
import authService from '../../services/authService';
import branchService from '../../services/branchService';
import UserFormModal from '../../components/admin/UserFormModal';
import { PlusIcon, PencilIcon } from '@heroicons/react/solid';

const usePermissions = () => {
    const user = JSON.parse(localStorage.getItem('pmsUser'));
    return user?.permissions || {};
};

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const permissions = usePermissions();
    const canAdd = permissions.userManagement?.includes('add');
    const canEdit = permissions.userManagement?.includes('edit');

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const usersData = await userService.getUsers();
            const rolesData = await userService.getRoles();
            const branchesData = await branchService.getActiveBranches();
            setUsers(usersData);
            setRoles(rolesData);
            setBranches(branchesData);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenModal = (user = null) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToEdit(null);
    };

    const handleSaveUser = async (formData, userId) => {
        if (userId) {
            await userService.updateUser(userId, formData);
        } else {
            await authService.registerUser(formData);
        }
        fetchUsers();
    };

    if (loading) return <div className="text-center py-10">Loading users...</div>;
    if (error) return <div className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                {canAdd && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        Add New User
                    </button>
                )}
            </div>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.UserID}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.Username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.FullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.RoleName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.BranchName || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.IsActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canEdit && (
                                        <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="w-5 h-5" /></button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                roles={roles}
                branches={branches}
            />
        </div>
    );
};

export default UserManagementPage;

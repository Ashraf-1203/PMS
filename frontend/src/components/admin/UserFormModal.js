import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const UserFormModal = ({ isOpen, onClose, onSave, userToEdit, roles, branches }) => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = Boolean(userToEdit);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                username: userToEdit?.Username || '',
                fullName: userToEdit?.FullName || '',
                email: userToEdit?.Email || '',
                roleId: userToEdit?.RoleID || '',
                branchId: userToEdit?.BranchID || '',
                isActive: userToEdit?.IsActive !== undefined ? userToEdit.IsActive : true,
                password: '',
            });
            setError('');
        }
    }, [userToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await onSave(formData, userToEdit?.UserID);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                 <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">{isEditMode ? 'Edit User' : 'Add New User'}</Dialog.Title>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    {error && <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>}
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required disabled={isEditMode} className="w-full p-2 border rounded" />
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required className="w-full p-2 border rounded" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full p-2 border rounded" />
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditMode ? 'New Password (optional)' : 'Password'} required={!isEditMode} className="w-full p-2 border rounded" />
                                    <select name="roleId" value={formData.roleId} onChange={handleChange} required className="w-full p-2 border rounded">
                                        <option value="">Select Role</option>
                                        {roles.map(r => <option key={r.RoleID} value={r.RoleID}>{r.RoleName}</option>)}
                                    </select>
                                     <select name="branchId" value={formData.branchId} onChange={handleChange} className="w-full p-2 border rounded">
                                        <option value="">Select Branch (optional)</option>
                                        {branches.map(b => <option key={b.BranchID} value={b.BranchID}>{b.BranchName}</option>)}
                                    </select>
                                    <div className="flex items-center">
                                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded" />
                                        <label className="ml-2">Active</label>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button type="button" onClick={onClose} className="py-2 px-4 rounded bg-gray-200">Cancel</button>
                                        <button type="submit" disabled={loading} className="py-2 px-4 rounded bg-blue-600 text-white disabled:bg-blue-300">{loading ? 'Saving...' : 'Save'}</button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UserFormModal;

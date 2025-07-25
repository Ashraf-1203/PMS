import React, { useState, useEffect, useCallback } from 'react';
import permissionService from '../../services/permissionService';
import userService from '../../services/userService'; // to get roles

const PermissionManagementPage = () => {
    const [roles, setRoles] = useState([]);
    const [pages, setPages] = useState([]);
    const [actions, setActions] = useState([]);
    const [permissions, setPermissions] = useState({}); // { roleName: { pageKey: { actionKey: boolean } } }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    const fetchMatrixData = useCallback(async () => {
        try {
            setLoading(true);
            const [rolesData, matrixData, permsData] = await Promise.all([
                userService.getRoles(),
                permissionService.getPermissionMatrix(),
                permissionService.getPermissions(),
            ]);
            setRoles(rolesData);
            setPages(matrixData.pages);
            setActions(matrixData.actions);
            setPermissions(permsData);
            if (rolesData.length > 0) {
                setSelectedRole(rolesData[0].RoleName);
            }
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMatrixData();
    }, [fetchMatrixData]);

    const handlePermissionChange = (roleName, pageKey, actionKey, isEnabled) => {
        setPermissions(prev => {
            const newPerms = JSON.parse(JSON.stringify(prev)); // Deep copy
            if (!newPerms[roleName]) newPerms[roleName] = {};
            if (!newPerms[roleName][pageKey]) newPerms[roleName][pageKey] = {};
            newPerms[roleName][pageKey][actionKey] = isEnabled;
            return newPerms;
        });
    };

    const handleSaveChanges = async () => {
        if (!selectedRole) return;
        setLoading(true);
        try {
            const roleId = roles.find(r => r.RoleName === selectedRole)?.RoleID;
            await permissionService.updatePermissions(roleId, permissions[selectedRole]);
            alert('Permissions saved successfully!');
        } catch (err) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !selectedRole) return <div>Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Permission Management</h1>
            <div className="mb-4">
                <label htmlFor="role-select" className="block text-sm font-medium text-gray-700">Select Role to Edit:</label>
                <select id="role-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    {roles.map(r => <option key={r.RoleID} value={r.RoleName}>{r.RoleName}</option>)}
                </select>
            </div>

            <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Page / Feature</th>
                            {actions.map(action => <th key={action.ActionKey} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{action.ActionName}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pages.map(page => (
                            <tr key={page.PageKey}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">{page.PageName} ({page.Module})</td>
                                {actions.map(action => (
                                    <td key={action.ActionKey} className="px-6 py-4 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            checked={Boolean(permissions[selectedRole]?.[page.PageKey]?.[action.ActionKey])}
                                            onChange={e => handlePermissionChange(selectedRole, page.PageKey, action.ActionKey, e.target.checked)}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="mt-6 text-right">
                <button onClick={handleSaveChanges} disabled={loading} className="py-2 px-6 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default PermissionManagementPage;

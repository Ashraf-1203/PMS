import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { ChevronDownIcon, ChevronRightIcon, HomeIcon, ... } from '@heroicons/react/solid'; // Example

// Placeholder icons (simple SVGs or text)
const Icon = ({ name }) => {
    // In a real app, you'd use an icon library like Heroicons or Material Icons
    const icons = {
        Dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3m-16.5 0h16.5m-16.5 0V21m16.5-18v18m-16.5-18v18A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V3m-18.75 0h18.75a2.25 2.25 0 012.25 2.25v11.25A2.25 2.25 0 0120.25 19.5h-15a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 013.75 3z" /></svg>,
        Inventory: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z" /></svg>,
        Papers: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
        BranchManagement: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a3.375 3.375 0 013.375 3.375v3.375a3.375 3.375 0 01-3.375 3.375H9V6.75z" /></svg>,
        Reports: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM21 21l-5.197-5.197" /></svg>,
        Administration: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.554-.223 1.197-.223 1.752 0 .549.223 1.02.684 1.11 1.226M10.344 18.06c-.09.542-.56 1.003-1.11 1.226-.554.223-1.197.223-1.752 0-.549-.223-1.02-.684-1.11-1.226m2.22 0L9 12.75M15 12.75l-1.222 5.31m0 0L15 21h-3.682l1.222-5.31M15 12.75L12.75 21M6.75 12.75L9 21M7.5 12.75L12 3M12 3l2.25 9.75M16.5 12.75L15 21m-9-6.25h10.5" /></svg>,
        Default: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
    };
    return icons[name] || icons['Default'];
};

const ChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-auto transition-transform duration-200"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-auto transition-transform duration-200"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;


const SidebarItem = ({ item, isCollapsed, userPermissions }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // Manages open/close state for parent items

  // currentPermissions is the map of all permissions for the current user, e.g., { 'dashboard': ['view'], 'consumePaper': ['view', 'add'] }
  // Check if user has 'view' permission for this specific item's pageKey
  const hasViewPermissionForItem = item.pageKey ? currentPermissions[item.pageKey]?.includes('view') : true; // Parent menu items without a pageKey are always "viewable" if they have visible children.

  const isActive = location.pathname === item.path || (item.path && location.pathname.startsWith(item.path) && item.path !== '/');
  const hasChildren = item.children && item.children.length > 0;

  // Filter children to only include those the user has 'view' permission for
  const permittedChildren = hasChildren
    ? item.children.filter(child => child.pageKey && currentPermissions[child.pageKey]?.includes('view'))
    : [];

  // Determine if this item (parent or child) should be rendered
  // A parent item should render if it itself has view permission (though usually they don't have pageKeys)
  // OR if any of its children are permitted to be viewed.
  // A child item should render if it has view permission.
  if (!item.pageKey && hasChildren && permittedChildren.length === 0) {
    return null; // Parent item with no visible children
  }
  if (item.pageKey && !hasViewPermissionForItem) {
    return null; // Item itself is not viewable
  }


  const handleToggle = (e) => {
    if (hasChildren) {
      e.preventDefault(); // Prevent navigation if it's a parent item
      setIsOpen(!isOpen);
    }
  };

  const itemBaseClasses = "flex items-center p-2 text-gray-700 rounded-lg hover:bg-gray-200 dark:text-white dark:hover:bg-gray-700 group";
  const itemActiveClasses = "bg-gray-300 dark:bg-gray-600";

  return (
    <li>
      <Link
        to={item.path || '#'}
        onClick={handleToggle}
        className={\`${itemBaseClasses} ${isActive && !hasChildren ? itemActiveClasses : ''}\`}
      >
        <Icon name={item.icon} />
        {!isCollapsed && <span className="flex-1 ms-3 whitespace-nowrap">{item.label}</span>}
        {!isCollapsed && hasChildren && (isOpen ? <ChevronDown /> : <ChevronRight />)}
      </Link>
      {!isCollapsed && hasChildren && isOpen && (
        <ul className="pl-4 mt-1 space-y-1">
          {visibleChildren.map((child) => (
            <SidebarItem key={child.key} item={child} isCollapsed={isCollapsed} userPermissions={userPermissions} />
          ))}
        </ul>
      )}
    </li>
  );
};


const Sidebar = ({ userPermissions /* { pageKey: ['action1', 'action2'], ... } */ }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Define sidebar structure based on prompt
  // pageKey should match backend PageKeys for permission checking
  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'Dashboard', pageKey: 'dashboard' },
    {
      key: 'inventory', label: 'Inventory', icon: 'Inventory', children: [
        { key: 'consume', label: 'Consume Paper', path: '/inventory/consume', pageKey: 'consumePaper' },
        { key: 'receive', label: 'Receive Paper', path: '/inventory/receive', pageKey: 'receivePaper' },
        { key: 'reject', label: 'Reject Paper', path: '/inventory/reject', pageKey: 'rejectPaper' },
        { key: 'transfer', label: 'Transfer Paper', path: '/inventory/transfer', pageKey: 'transferPaper' },
        { key: 'pendingTransfers', label: 'Pending Transfers', path: '/inventory/pending-transfers', pageKey: 'pendingTransfers' },
        { key: 'issued', label: 'Issued Paper', path: '/inventory/issued', pageKey: 'issuedPaperList' },
        { key: 'returned', label: 'Returned Paper', path: '/inventory/returned', pageKey: 'returnedPaperList' },
      ],
    },
    {
      key: 'papers', label: 'Papers', icon: 'Papers', children: [
        { key: 'addPaper', label: 'Add Paper', path: '/papers/add', pageKey: 'addPaperMaster' },
        { key: 'papersList', label: 'Papers (Master Data)', path: '/papers/list', pageKey: 'papersMasterList' },
        { key: 'rateMgmt', label: 'Rate Management', path: '/papers/rates', pageKey: 'rateManagement' },
        { key: 'adjustment', label: 'Paper Adjustment', path: '/papers/adjustment', pageKey: 'paperAdjustment' },
        { key: 'machineEntry', label: 'Machine Entry', path: '/papers/machines', pageKey: 'machineEntry' },
        { key: 'deckleMatch', label: 'Deckle Match', path: '/papers/deckle-match', pageKey: 'deckleMatch' },
      ],
    },
    {
      key: 'branch', label: 'Branch Management', icon: 'BranchManagement', children: [
        { key: 'branchList', label: 'Branch List', path: '/branches/list', pageKey: 'branchList' },
      ],
    },
    {
      key: 'reports', label: 'Reports', icon: 'Reports', children: [
        { key: 'stockReport', label: 'Stock Report', path: '/reports/stock', pageKey: 'stockReport' },
        { key: 'issuedReport', label: 'Issued Report', path: '/reports/issued', pageKey: 'issuedReport' },
        { key: 'returnedReport', label: 'Returned Report', path: '/reports/returned', pageKey: 'returnedReport' },
        { key: 'transferReport', label: 'Transfer Report', path: '/reports/transfer', pageKey: 'transferReport' },
        { key: 'rejectedReport', label: 'Rejected Report', path: '/reports/rejected', pageKey: 'rejectedReport' },
        { key: 'consumedReport', label: 'Consumed Report', path: '/reports/consumed', pageKey: 'consumedReport' },
        { key: 'receiveReport', label: 'Receive Report', path: '/reports/receive', pageKey: 'receiveReport' },
        { key: 'activityLog', label: 'Activity Log', path: '/reports/activity-log', pageKey: 'activityLog' },
      ],
    },
    {
      key: 'admin', label: 'Administration', icon: 'Administration', children: [
        { key: 'userMgmt', label: 'User Management', path: '/admin/users', pageKey: 'userManagement' },
        { key: 'permissionMgmt', label: 'Permission Management', path: '/admin/permissions', pageKey: 'permissionManagement' },
        { key: 'history', label: 'History', path: '/admin/history', pageKey: 'systemHistory' },
      ],
    },
  ];

  // userPermissions will be passed from App.js -> MainLayout -> Sidebar
  // It should look like: { pageKey1: ['view', 'add'], pageKey2: ['view'], ... }
  // If userPermissions is null or undefined (e.g. before login or if error fetching), provide an empty object.
  const currentPermissions = userPermissions || {};

  return (
<aside className={`bg-gray-50 dark:bg-gray-800 transition-width duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'} h-screen sticky top-0 shadow-md flex flex-col z-30`}>
      <div className="flex items-center justify-between p-4 h-16 border-b dark:border-gray-700">
        {!isCollapsed && <span className="text-xl font-semibold text-gray-800 dark:text-white">PMS Menu</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]"> {/* Adjust height based on header */}
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.key} item={item} isCollapsed={isCollapsed} userPermissions={DUMMY_PERMISSIONS_FOR_TESTING} />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

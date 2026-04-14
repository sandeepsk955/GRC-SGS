




// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   LayoutDashboard, FolderOpen, Users, Activity as ActivityIcon, Settings, BarChart3, HelpCircle,
//   ChevronDown, ChevronRight, Shield, Eye, FileText, PlusCircle, Bell, BookOpen, Ticket, LogOut,
//   File, CheckSquare, Clipboard,
// } from 'lucide-react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useStandards } from '../../context/StandardsContext';

// type IconType = React.ComponentType<any>;

// interface MenuItem {
//   id: string;
//   label: string;
//   icon: IconType;
//   path?: string;
//   children?: MenuItem[];
//   meta?: { stdId?: number; slug?: string; name?: string };
// }

// const slugify = (s: string) =>
//   String(s || '')
//     .toLowerCase()
//     .trim()
//     .replace(/\s+/g, '-')
//     .replace(/[^a-z0-9-]/g, '');

// type RoleKey = 'SYSTEM_ADMIN' | 'CLIENT_ADMIN' | 'DOER' | 'AUDITOR' | 'AUDITEE' | 'MR';

// const ROLE_FROM_NUM: Record<number, RoleKey> = {
//   1: 'CLIENT_ADMIN',
//   2: 'DOER',
//   3: 'AUDITOR',
//   4: 'AUDITEE',
//   5: 'MR',
// };

// const TEXT_TO_ROLE = (txt?: string): RoleKey | null => {
//   if (!txt) return null;
//   const t = txt.toLowerCase();
//   if (t.includes('system')) return 'SYSTEM_ADMIN';
//   if (t.includes('client') && t.includes('admin')) return 'CLIENT_ADMIN';
//   if (t.includes('doer') || t.includes('perform') || t.includes('review')) return 'DOER';
//   if (t.includes('auditor')) return 'AUDITOR';
//   if (t.includes('auditee')) return 'AUDITEE';
//   if (t.includes('management')) return 'MR';
//   return null;
// };

// function sysAdminMenu(): MenuItem[] {
//   return [
//     {
//       id: 'client-mgmt',
//       label: 'Client Management',
//       icon: Users,
//       children: [
//         { id: 'onboarding', label: 'Client Onboarding', icon: Users, path: '/client/onboarding' },
//         { id: 'license', label: 'License Management', icon: Shield, path: '/client/license' },
//         { id: 'offboarding', label: 'Client Offboarding', icon: Users, path: '/client/offboarding' },
//         { id: 'payments', label: 'Payments', icon: FileText, path: '/client/payments' },
//         { id: 'reports', label: 'Reports', icon: BarChart3, path: '/client/reports' },
//       ],
//     },
//     {
//       id: 'ticketing',
//       label: 'Ticketing System',
//       icon: Ticket,
//       children: [{ id: 'build', label: 'Build internally', icon: PlusCircle, path: '/ticketing/build' }],
//     },
//     {
//       id: 'training',
//       label: 'Training Modules',
//       icon: BookOpen,
//       children: [{ id: 'client-setup', label: 'Client Setup', icon: Settings, path: '/training/client-setup' }],
//     },
//     {
//       id: 'help',
//       label: 'Help Content',
//       icon: HelpCircle,
//       children: [{ id: 'urls', label: 'List of URlS', icon: BookOpen, path: '/help/topics' }],
//     },
//     {
//       id: 'prospects',
//       label: 'Prospects Management',
//       icon: Users,
//       children: [{ id: 'crm', label: 'CRM (Managing sales leads)', icon: Users, path: '/prospects/crm' }],
//     },
//   ];
// }

// function clientAdminMenu(portfolio: MenuItem[]): MenuItem[] {
//   return [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
//     { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
//     { id: 'role-user', label: 'Role/User Management', icon: Users, path: '/roles/types' },
//     {
//       id: 'activities',
//       label: 'My Activities',
//       icon: ActivityIcon,
//       children: [
//         { id: 'view-edit-activity', label: 'View/Edit Activity', icon: Eye, path: '/activities/manage' },
//         { id: 'view-edit-assignment', label: 'View/Edit Assignment', icon: FileText, path: '/activities/assignments' },
//         { id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' },
//         { id: 'reviews', label: 'My Reviews', icon: Eye, path: '/activities/reviews' },
//       ],
//     },
//     {
//       id: 'configuration',
//       label: 'Configuration',
//       icon: Settings,
//       children: [
//         { id: 'create-period', label: 'Create Compliance Period', icon: PlusCircle, path: '/config/periods/create' },
//         { id: 'view-license', label: 'View/Manage License', icon: Shield, path: '/config/licenses' },
//         { id: 'create-audit', label: 'Create Internal Audit', icon: PlusCircle, path: '/config/audits/create' },
//       ],
//     },
//     {
//       id: 'reports',
//       label: 'Reports',
//       icon: BarChart3,
//       children: [
//         { id: 'performance-report', label: 'Performance Report', icon: BarChart3, path: '/reports/performance' },
//         { id: 'compliance-dashboard', label: 'ComplianceDashboard', icon: LayoutDashboard, path: '/reports/compliance' },
//       ],
//     },
//     {
//       id: 'help',
//       label: 'Help Content',
//       icon: HelpCircle,
//       children: [
//         { id: 'help-topics', label: 'Help Topics', icon: BookOpen, path: '/help/topics' },
//         { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: '/help/tickets' },
//       ],
//     },
//     { id: 'documents', label: 'Documents', icon: File, path: '/documents' },
//   ];
// }

// function doerMenu(portfolio: MenuItem[]): MenuItem[] {
//   return [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
//     { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
//     {
//       id: 'my-activities',
//       label: 'My Activities',
//       icon: ActivityIcon,
//       children: [
//         { id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' },
//         { id: 'reviews', label: 'My Reviews', icon: CheckSquare, path: '/activities/reviews' },
//         { id: 'assignments', label: 'My Assignments', icon: Clipboard, path: '/activities/assignments' },
//       ],
//     },
//     {
//       id: 'reports',
//       label: 'Reports',
//       icon: BarChart3,
//       children: [
//         { id: 'performance-report', label: 'Performance Report', icon: BarChart3, path: '/reports/performance' },
//         { id: 'compliance-dashboard', label: 'ComplianceDashboard', icon: LayoutDashboard, path: '/reports/compliance' },
//       ],
//     },
//     {
//       id: 'help',
//       label: 'Help Content',
//       icon: HelpCircle,
//       children: [
//         { id: 'help-topics', label: 'Help Topics', icon: BookOpen, path: '/help/topics' },
//         { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: '/help/tickets' },
//       ],
//     },
//     { id: 'documents', label: 'Documents', icon: File, path: '/documents' },
//   ];
// }

// function auditorMenu(portfolio: MenuItem[]): MenuItem[] {
//   return [
//     { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
//     { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
//     {
//       id: 'my-activities',
//       label: 'My Activities',
//       icon: ActivityIcon,
//       children: [{ id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' }],
//     },
//     {
//       id: 'audit',
//       label: 'Audit',
//       icon: Shield,
//       children: [
//         { id: 'manage-internal-audit', label: 'Manage Internal Audit', icon: Settings, path: '/audit/manage-internal' },
//         { id: 'capa-review', label: 'CAPA Review', icon: FileText, path: '/audit/capa-review' },
//       ],
//     },
//     {
//       id: 'reports',
//       label: 'Reports',
//       icon: BarChart3,
//       children: [
//         { id: 'compliance-dashboard', label: 'Compliance Period Dashboard', icon: LayoutDashboard, path: '/reports/compliance' },
//         { id: 'audit-dashboard', label: 'Audit Dashboard', icon: LayoutDashboard, path: '/reports/audit' },
//       ],
//     },
//   ];
// }

// function auditeeMenu(portfolio: MenuItem[]): MenuItem[] {
//   return [
//     { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
//     {
//       id: 'my-activities',
//       label: 'My Activities',
//       icon: ActivityIcon,
//       children: [{ id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' }],
//     },
//     {
//       id: 'audit',
//       label: 'Audit',
//       icon: Shield,
//       children: [{ id: 'capa-update', label: 'CAPA Update', icon: FileText, path: '/audit/capa-update' }],
//     },
//     {
//       id: 'reports',
//       label: 'Reports',
//       icon: BarChart3,
//       children: [
//         { id: 'compliance-dashboard', label: 'Compliance Period Dashboard', icon: LayoutDashboard, path: '/reports/compliance' },
//         { id: 'audit-dashboard', label: 'Audit Dashboard', icon: LayoutDashboard, path: '/reports/audit' },
//       ],
//     },
//   ];
// }

// function pickMenu(role: RoleKey, portfolio: MenuItem[]): MenuItem[] {
//   switch (role) {
//     case 'SYSTEM_ADMIN': return sysAdminMenu();
//     case 'CLIENT_ADMIN': return clientAdminMenu(portfolio);
//     case 'DOER': return doerMenu(portfolio);
//     case 'AUDITOR': return auditorMenu(portfolio);
//     case 'AUDITEE': return auditeeMenu(portfolio);
//     case 'MR': return clientAdminMenu(portfolio);
//     default: return doerMenu(portfolio);
//   }
// }

// export const Sidebar: React.FC = () => {
//   const { selectedRole, logout } = useAuth();
//   const { setSelectedStandard } = useStandards();

//   const [portfolioItems, setPortfolioItems] = useState<MenuItem[]>([]);
//   const [expandedItems, setExpandedItems] = useState<string[]>(['portfolio']);

//   const location = useLocation();
//   const navigate = useNavigate();

//   const roleKey: RoleKey = useMemo(() => {
//     try {
//       const uRaw = sessionStorage.getItem('userDetails');
//       if (uRaw) {
//         const u = JSON.parse(uRaw);
//         if (u?.isSystemAdmin === true) return 'SYSTEM_ADMIN';
//       }
//     } catch {}

//     const roleNumStr = sessionStorage.getItem('role');
//     if (roleNumStr && ROLE_FROM_NUM[Number(roleNumStr)]) return ROLE_FROM_NUM[Number(roleNumStr)];

//     try {
//       const rRaw = sessionStorage.getItem('roleDetails');
//       if (rRaw) {
//         const { roletype } = JSON.parse(rRaw);
//         if (ROLE_FROM_NUM[Number(roletype)]) return ROLE_FROM_NUM[Number(roletype)];
//       }
//     } catch {}

//     try {
//       const uRaw = sessionStorage.getItem('userDetails');
//       if (uRaw) {
//         const u = JSON.parse(uRaw);
//         if (ROLE_FROM_NUM[Number(u?.sysRoleid)]) return ROLE_FROM_NUM[Number(u.sysRoleid)];
//         if (u?.isClientAdmin === true) return 'CLIENT_ADMIN';
//       }
//     } catch {}

//     const fromText = TEXT_TO_ROLE(selectedRole?.name);
//     if (fromText) return fromText;

//     return 'DOER';
//   }, [selectedRole?.name]);

//   const menuItems = useMemo(
//     () => pickMenu(roleKey, portfolioItems),
//     [roleKey, portfolioItems]
//   );

//   useEffect(() => {
//     const fetchPortfolio = async () => {
//       try {
//         const sessionCustomerId = sessionStorage.getItem('customerId');
//         const customerId = sessionCustomerId ? Number(sessionCustomerId) : 4;
//         const res = await fetch(
//           `https://sajoan-b.techoptima.ai/api/LicenseManagement/GetAllLicensesByCustomer?CustomerId=${customerId}`
//         );

//         const json = await res.json();
//         const items: MenuItem[] = (json?.data ?? []).map((lic: any) => {
//           const name = String(lic.standardName ?? '');
//           const slug = slugify(name);
//           return {
//             id: `portfolio-${(lic.standardId ?? slug).toString()}`, // <-- namespaced & unique
//             label: name,
//             icon: Shield,
//             path: `/portfolio/${slug}`,
//             meta: { stdId: Number(lic.standardId), slug, name },
//           };
//         });
//         setPortfolioItems(items);
//       } catch (e) {
//         console.error('Portfolio fetch failed', e);
//         setPortfolioItems([]);
//       }
//     };
//     fetchPortfolio();
//   }, []);

//   const isRouteActive = (item: MenuItem): boolean => {
//     if (item.path) return location.pathname.startsWith(item.path);
//     return !!item.children?.some(isRouteActive);
//   };

//   useEffect(() => {
//     const expandForActive = (items: MenuItem[], parentActive = false): string[] => {
//       let ids: string[] = [];
//       for (const it of items) {
//         const activeBelow = it.children?.some(isRouteActive);
//         if ((isRouteActive(it) || activeBelow) && it.children?.length) {
//           ids.push(it.id, ...expandForActive(it.children));
//         }
//       }
//       return Array.from(new Set(ids));
//     };
//     setExpandedItems((prev) => Array.from(new Set([...prev, ...expandForActive(menuItems)])));
//   }, [location.pathname, menuItems]);

//   const toggleExpanded = (id: string) =>
//     setExpandedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

//   const handleLeafClick = (item: MenuItem) => {
//     if (item.meta?.stdId && item.meta?.slug && item.meta?.name) {
//       const standard = { stdId: item.meta.stdId, slug: item.meta.slug, name: item.meta.name };
//       // persist + set context (so header updates immediately, and survives refresh)
//       sessionStorage.setItem('selectedStandard', JSON.stringify(standard));
//       setSelectedStandard(standard);
//     }
//     if (item.path) navigate(item.path);
//   };

//   // composite key helper prevents duplicate keys at any level
//   const renderItem = (item: MenuItem, level = 0, parentKey = 'root') => {
//     const compositeKey = `${parentKey}/${item.id}`;
//     const hasChildren = !!item.children?.length;
//     const expanded = expandedItems.includes(item.id);
//     const active = isRouteActive(item);

//     const Base: any = hasChildren ? 'button' : Link;
//     const baseProps: any = hasChildren
//       ? { type: 'button', onClick: () => toggleExpanded(item.id) }
//       : { to: item.path || '#', onClick: (e: React.MouseEvent) => { if (!item.path) e.preventDefault(); handleLeafClick(item); } };

//     return (
//       <div key={compositeKey}>
//         <Base
//           {...baseProps}
//           className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
//             active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
//           } ${level > 0 ? 'ml-4' : ''}`}
//         >
//           <div className="flex items-center gap-3">
//             <item.icon className="w-5 h-5 flex-shrink-0" />
//             <span className="text-sm font-medium">{item.label}</span>
//           </div>
//           {hasChildren && (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
//         </Base>

//         {hasChildren && expanded && (
//           <div className="mt-1 space-y-1">
//             {item.children!.map((child) => renderItem(child, level + 1, compositeKey))}
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
//             <Shield className="w-6 h-6 text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold text-gray-800">OPT GRC</h2>
//             <p className="text-sm text-gray-600">Role: {roleKey.replace('_', ' ')}</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 p-4 space-y-2 overflow-y-auto">
//         {menuItems.map((item) => renderItem(item))}
//       </div>

//       <div className="p-4 border-t border-gray-200">
//         <button
//           onClick={logout}
//           className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//         >
//           <LogOut className="w-5 h-5" />
//           <span className="text-sm font-medium">Sign Out</span>
//         </button>
//       </div>
//     </div>
//   );
// };




import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, FolderOpen, Users, Activity as ActivityIcon, Settings, BarChart3, HelpCircle,
  ChevronDown, ChevronRight, Shield, Eye, FileText, PlusCircle, Bell, BookOpen, Ticket, LogOut,
  File, CheckSquare, Clipboard,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStandards } from '../../context/StandardsContext';
import api from '../../services/api';

type IconType = React.ComponentType<any>;

interface MenuItem {
  id: string;
  label: string;
  icon: IconType;
  path?: string;
  children?: MenuItem[];
  meta?: { stdId?: number; slug?: string; name?: string };
}

const slugify = (s: string) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

type RoleKey = 'SYSTEM_ADMIN' | 'CLIENT_ADMIN' | 'DOER' | 'REVIEWER' | 'AUDITOR' | 'AUDITEE' | 'MR';

const ROLE_FROM_NUM: Record<number, RoleKey> = {
  1: 'CLIENT_ADMIN',
  2: 'DOER',
  3: 'AUDITOR',
  4: 'AUDITEE',
  5: 'MR',
  9: 'REVIEWER',
};

const TEXT_TO_ROLE = (txt?: string): RoleKey | null => {
  if (!txt) return null;
  const t = txt.toLowerCase();
  if (t.includes('system')) return 'SYSTEM_ADMIN';
  if (t.includes('client') && t.includes('admin')) return 'CLIENT_ADMIN';
  if (t.includes('review')) return 'REVIEWER';
  if (t.includes('doer') || t.includes('perform')) return 'DOER';
  if (t.includes('auditor')) return 'AUDITOR';
  if (t.includes('auditee')) return 'AUDITEE';
  if (t.includes('management')) return 'MR';
  return null;
};

function sysAdminMenu(): MenuItem[] {
  return [
    {
      id: 'client-mgmt',
      label: 'Client Management',
      icon: Users,
      children: [
        { id: 'onboarding', label: 'Client Onboarding', icon: Users, path: '/client/onboarding' },
        { id: 'license', label: 'License Management', icon: Shield, path: '/client/license' },
        { id: 'offboarding', label: 'Client Offboarding', icon: Users, path: '/client/offboarding' },
        { id: 'payments', label: 'Payments', icon: FileText, path: '/client/payments' },
        { id: 'reports', label: 'Reports', icon: BarChart3, path: '/client/reports' },
      ],
    },
    {
      id: 'ticketing',
      label: 'Ticketing System',
      icon: Ticket,
      children: [{ id: 'build', label: 'Build internally', icon: PlusCircle, path: '/ticketing/build' }],
    },
    {
      id: 'training',
      label: 'Training Modules',
      icon: BookOpen,
      children: [{ id: 'client-setup', label: 'Client Setup', icon: Settings, path: '/training/client-setup' }],
    },
    {
      id: 'help',
      label: 'Help Content',
      icon: HelpCircle,
      children: [{ id: 'urls', label: 'List of URlS', icon: BookOpen, path: '/help/topics' }],
    },
    {
      id: 'prospects',
      label: 'Prospects Management',
      icon: Users,
      children: [{ id: 'crm', label: 'CRM (Managing sales leads)', icon: Users, path: '/prospects/crm' }],
    },
  ];
}

function clientAdminMenu(portfolio: MenuItem[]): MenuItem[] {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
    { id: 'role-user', label: 'Role/User Management', icon: Users, path: '/roles/types' },
    {
      id: 'activities',
      label: 'My Activities',
      icon: ActivityIcon,
      children: [
        { id: 'view-edit-activity', label: 'View/Edit Activity', icon: Eye, path: '/activities/manage' },
        { id: 'view-edit-assignment', label: 'View/Edit Assignment', icon: FileText, path: '/activities/assignments' },
        { id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' },
        { id: 'reviews', label: 'My Reviews', icon: Eye, path: '/activities/reviews' },
      ],
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: Settings,
      children: [
        { id: 'create-period', label: 'Create Compliance Period', icon: PlusCircle, path: '/config/periods/create' },
        { id: 'view-license', label: 'View/Manage License', icon: Shield, path: '/config/licenses' },
        { id: 'create-audit', label: 'Create Internal Audit', icon: PlusCircle, path: '/config/audits/create' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      children: [
        { id: 'performance-report', label: 'Performance Report', icon: BarChart3, path: '/reports/performance' },
        { id: 'compliance-dashboard', label: 'ComplianceDashboard', icon: LayoutDashboard, path: '/reports/compliance' },
      ],
    },
    {
      id: 'help',
      label: 'Help Content',
      icon: HelpCircle,
      children: [
        { id: 'help-topics', label: 'Help Topics', icon: BookOpen, path: '/help/topics' },
        { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: '/help/tickets' },
      ],
    },
    { id: 'documents', label: 'Documents', icon: File, path: '/documents' },
  ];
}

function doerMenu(portfolio: MenuItem[]): MenuItem[] {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
    {
      id: 'my-activities',
      label: 'My Activities',
      icon: ActivityIcon,
      children: [
        { id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' },
        { id: 'reviews', label: 'My Reviews', icon: CheckSquare, path: '/activities/reviews' },
        { id: 'assignments', label: 'My Assignments', icon: Clipboard, path: '/activities/assignments' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      children: [
        { id: 'performance-report', label: 'Performance Report', icon: BarChart3, path: '/reports/performance' },
        { id: 'compliance-dashboard', label: 'ComplianceDashboard', icon: LayoutDashboard, path: '/reports/compliance' },
      ],
    },
    {
      id: 'help',
      label: 'Help Content',
      icon: HelpCircle,
      children: [
        { id: 'help-topics', label: 'Help Topics', icon: BookOpen, path: '/help/topics' },
        { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: '/help/tickets' },
      ],
    },
    { id: 'documents', label: 'Documents', icon: File, path: '/documents' },
  ];
}

// Reviewer-specific menu: includes My Reviews for approving submitted tasks
function reviewerMenu(portfolio: MenuItem[]): MenuItem[] {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
    {
      id: 'my-activities',
      label: 'My Activities',
      icon: ActivityIcon,
      children: [
        { id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' },
        { id: 'reviews', label: 'My Reviews', icon: CheckSquare, path: '/activities/reviews' },
        { id: 'assignments', label: 'My Assignments', icon: Clipboard, path: '/activities/assignments' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      children: [
        { id: 'performance-report', label: 'Performance Report', icon: BarChart3, path: '/reports/performance' },
        { id: 'compliance-dashboard', label: 'ComplianceDashboard', icon: LayoutDashboard, path: '/reports/compliance' },
      ],
    },
    {
      id: 'help',
      label: 'Help Content',
      icon: HelpCircle,
      children: [
        { id: 'help-topics', label: 'Help Topics', icon: BookOpen, path: '/help/topics' },
        { id: 'ticketing', label: 'Ticketing', icon: Ticket, path: '/help/tickets' },
      ],
    },
    { id: 'documents', label: 'Documents', icon: File, path: '/documents' },
  ];
}

function auditorMenu(portfolio: MenuItem[]): MenuItem[] {
  return [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
    {
      id: 'my-activities',
      label: 'My Activities',
      icon: ActivityIcon,
      children: [{ id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' }],
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: Shield,
      children: [
        { id: 'manage-internal-audit', label: 'Manage Internal Audit', icon: Settings, path: '/audit/manage-internal' },
        { id: 'capa-review', label: 'CAPA Review', icon: FileText, path: '/audit/capa-review' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      children: [
        { id: 'compliance-dashboard', label: 'Compliance Period Dashboard', icon: LayoutDashboard, path: '/reports/compliance' },
        { id: 'audit-dashboard', label: 'Audit Dashboard', icon: LayoutDashboard, path: '/reports/audit' },
      ],
    },
  ];
}

function auditeeMenu(portfolio: MenuItem[]): MenuItem[] {
  return [
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen, children: portfolio },
    {
      id: 'my-activities',
      label: 'My Activities',
      icon: ActivityIcon,
      children: [{ id: 'notifications', label: 'My Notifications', icon: Bell, path: '/activities/notifications' }],
    },
    {
      id: 'audit',
      label: 'Audit',
      icon: Shield,
      children: [{ id: 'capa-update', label: 'CAPA Update', icon: FileText, path: '/audit/capa-update' }],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      children: [
        { id: 'compliance-dashboard', label: 'Compliance Period Dashboard', icon: LayoutDashboard, path: '/reports/compliance' },
        { id: 'audit-dashboard', label: 'Audit Dashboard', icon: LayoutDashboard, path: '/reports/audit' },
      ],
    },
  ];
}

function pickMenu(role: RoleKey, portfolio: MenuItem[]): MenuItem[] {
  switch (role) {
    case 'SYSTEM_ADMIN': return sysAdminMenu();
    case 'CLIENT_ADMIN': return clientAdminMenu(portfolio);
    case 'DOER': return doerMenu(portfolio);
    case 'REVIEWER': return reviewerMenu(portfolio);
    case 'AUDITOR': return auditorMenu(portfolio);
    case 'AUDITEE': return auditeeMenu(portfolio);
    case 'MR': return clientAdminMenu(portfolio);
    default: return doerMenu(portfolio);
  }
}

export const Sidebar: React.FC = () => {
  const { selectedRole, logout } = useAuth();
  const { setSelectedStandard } = useStandards();

  const [portfolioItems, setPortfolioItems] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>(['portfolio']);

  const location = useLocation();
  const navigate = useNavigate();

  const roleKey: RoleKey = useMemo(() => {
    try {
      const uRaw = sessionStorage.getItem('userDetails');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        if (u?.isSystemAdmin === true) return 'SYSTEM_ADMIN';
      }
    } catch { }

    const roleNumStr = sessionStorage.getItem('role');
    if (roleNumStr && ROLE_FROM_NUM[Number(roleNumStr)]) return ROLE_FROM_NUM[Number(roleNumStr)];

    try {
      const rRaw = sessionStorage.getItem('roleDetails');
      if (rRaw) {
        const { roletype } = JSON.parse(rRaw);
        if (ROLE_FROM_NUM[Number(roletype)]) return ROLE_FROM_NUM[Number(roletype)];
      }
    } catch { }

    try {
      const uRaw = sessionStorage.getItem('userDetails');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        if (ROLE_FROM_NUM[Number(u?.sysRoleid)]) return ROLE_FROM_NUM[Number(u.sysRoleid)];
        if (u?.isClientAdmin === true) return 'CLIENT_ADMIN';
      }
    } catch { }

    const fromText = TEXT_TO_ROLE(selectedRole?.name);
    if (fromText) return fromText;

    return 'DOER';
  }, [selectedRole?.name]);

  const menuItems = useMemo(
    () => pickMenu(roleKey, portfolioItems),
    [roleKey, portfolioItems]
  );

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const sessionCustomerId = sessionStorage.getItem('customerId');
        const customerId = sessionCustomerId ? Number(sessionCustomerId) : 4;
        const res = await api.get('/LicenseManagement/GetAllLicensesByCustomer', {
          params: { CustomerId: customerId }
        });
        const json = res.data;
        const items: MenuItem[] = (json?.data ?? []).map((lic: any) => {
          const name = String(lic.standardName ?? '');
          const slug = slugify(name);
          return {
            id: `portfolio-${(lic.standardId ?? slug).toString()}`,
            label: name,
            icon: Shield,
            path: `/portfolio/${slug}`,
            meta: { stdId: Number(lic.standardId), slug, name },
          };
        });
        setPortfolioItems(items);
      } catch (e) {
        console.error('Portfolio fetch failed', e);
        setPortfolioItems([]);
      }
    };
    fetchPortfolio();
  }, []);

  const isRouteActive = (item: MenuItem): boolean => {
    if (item.path) return location.pathname.startsWith(item.path);
    return !!item.children?.some(isRouteActive);
  };

  useEffect(() => {
    const expandForActive = (items: MenuItem[]): string[] => {
      let ids: string[] = [];
      for (const it of items) {
        const activeBelow = it.children?.some(isRouteActive);
        if ((isRouteActive(it) || activeBelow) && it.children?.length) {
          ids.push(it.id, ...expandForActive(it.children));
        }
      }
      return Array.from(new Set(ids));
    };
    setExpandedItems((prev) => Array.from(new Set([...prev, ...expandForActive(menuItems)])));
  }, [location.pathname, menuItems]);

  const toggleExpanded = (id: string) =>
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleLeafClick = (item: MenuItem) => {
    if (item.meta?.stdId && item.meta?.slug && item.meta?.name) {
      const standard = { stdId: item.meta.stdId, slug: item.meta.slug, name: item.meta.name };
      sessionStorage.setItem('selectedStandard', JSON.stringify(standard));
      setSelectedStandard(standard);
    }
    if (item.path) navigate(item.path);
  };

  const renderItem = (item: MenuItem, level = 0, parentKey = 'root') => {
    const compositeKey = `${parentKey}/${item.id}`;
    const hasChildren = !!item.children?.length;
    const expanded = expandedItems.includes(item.id);
    const active = isRouteActive(item);

    const Base: any = hasChildren ? 'button' : Link;
    const baseProps: any = hasChildren
      ? { type: 'button', onClick: () => toggleExpanded(item.id) }
      : { to: item.path || '#', onClick: (e: React.MouseEvent) => { if (!item.path) e.preventDefault(); handleLeafClick(item); } };

    return (
      <div key={compositeKey}>
        <Base
          {...baseProps}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            } ${level > 0 ? 'ml-4' : ''}`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {hasChildren && (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
        </Base>

        {hasChildren && expanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, level + 1, compositeKey))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">OPT GRC</h2>
            <p className="text-sm text-gray-600">Role: {selectedRole?.name || roleKey.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => renderItem(item))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

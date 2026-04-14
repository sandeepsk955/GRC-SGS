// type RoleRow = {
//   sysRoleId: number;
//   roleFName: string;
//   roleSName: string;
//   roleDescription?: string;
//   description?: string;
//   roleTypeId: number;
//   roleTypeDescription?: string;
//   govName?: string;
//   govId?: number;
//   active: boolean;
// };

// // Matches your UserMaster response
// type UserRow = {
//   id: number;
//   name: string;
//   email: string;
//   customerName?: string;
//   phoneNo?: string | null;
//   role: string[];    // e.g. ["BCMS Reviewer"]
//   roleId: number[];  // e.g. [9]
//   status: boolean;   // true => Active
//   govId?: number;
//   govName?: string;
// };

// type Governance = { id: number | string; name: string };
// type FormMode = 'create' | 'edit';

// /* -------------------------------------------
//    Lightweight Dialog
// -------------------------------------------- */
// const Dialog: React.FC<{
//   open: boolean;
//   title?: string;
//   message?: string;
//   onClose: () => void;
// }> = ({ open, title = 'Notice', message = '', onClose }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
//       <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md">
//         <div className="px-5 py-4 border-b">
//           <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
//         </div>
//         <div className="px-5 py-4">
//           <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
//         </div>
//         <div className="px-5 py-3 border-t flex justify-end">
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
//             onClick={onClose}
//           >
//             OK
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* -------------------------------------------
//    Helpers
// -------------------------------------------- */
// const pickBackendMessage = (json: any, textFallback: string) => {
//   if (!json || typeof json !== 'object') return textFallback || 'Done.';
//   const keys = ['message', 'Message', 'msg', 'statusMessage', 'detail', 'error', 'Status', 'result'];
//   for (const k of keys) {
//     if (k in json && json[k]) return String(json[k]);
//   }
//   if (json.data && typeof json.data === 'object') {
//     for (const k of keys) {
//       if (k in json.data && json.data[k]) return String(json.data[k]);
//     }
//   }
//   return textFallback || 'Done.';
// };

// /* -------------------------------------------
//    Reusable UI: Search Input
// -------------------------------------------- */
// const SearchInput: React.FC<{
//   placeholder: string;
//   value: string;
//   onChange: (v: string) => void;
// }> = ({ placeholder, value, onChange }) => (
//   <div className="relative">
//     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//     <input
//       type="text"
//       placeholder={placeholder}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       onKeyDown={(e) => {
//         if (e.key === 'Escape') onChange('');
//       }}
//       className="pl-10 pr-9 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//     />
//     {value && (
//       <button
//         type="button"
//         aria-label="Clear search"
//         title="Clear"
//         onClick={() => onChange('')}
//         className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
//       >
//         <X className="w-4 h-4" />
//       </button>
//     )}
//   </div>
// );

// /* -------------------------------------------
//    Reusable UI: Pagination
// -------------------------------------------- */
// const Pagination: React.FC<{
//   currentPage: number;
//   totalPages: number;
//   onPrev: () => void;
//   onNext: () => void;
// }> = ({ currentPage, totalPages, onPrev, onNext }) => (
//   <div className="flex justify-center mt-4 gap-2">
//     <button
//       onClick={onPrev}
//       className="px-4 py-2 bg-blue-600 text-white rounded-l-lg disabled:bg-gray-300"
//       disabled={currentPage === 1}
//     >
//       Previous
//     </button>
//     <div className="px-3 py-2 border rounded text-sm text-gray-700">
//       Page {currentPage} of {Math.max(totalPages, 1)}
//     </div>
//     <button
//       onClick={onNext}
//       className="px-4 py-2 bg-blue-600 text-white rounded-r-lg disabled:bg-gray-300"
//       disabled={currentPage === totalPages || totalPages === 0}
//     >
//       Next
//     </button>
//   </div>
// );

// /* -------------------------------------------
//    Reusable UI: Data Table (generic)
// -------------------------------------------- */
// type Column<T> = {
//   key: string;
//   header: string;
//   align?: 'left' | 'right';
//   render?: (row: T) => React.ReactNode;
// };

// function DataTable<T extends Record<string, any>>(props: {
//   columns: Column<T>[];
//   rows: T[];
//   emptyText: string;
// }) {
//   const { columns, rows, emptyText } = props;
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[400px]">
//       <div className="overflow-x-auto">
//         <table className="min-w-max w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               {columns.map((c) => (
//                 <th
//                   key={c.key}
//                   className={`px-6 py-3 ${
//                     c.align === 'right' ? 'text-right' : 'text-left'
//                   } text-xs font-medium text-gray-500 uppercase tracking-wider`}
//                 >
//                   {c.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {rows.length ? (
//               rows.map((row, idx) => (
//                 <tr
//                   key={(row as any).sysRoleId ?? (row as any).id ?? (row as any).userId ?? idx}
//                   className="hover:bg-gray-50 transition-colors"
//                 >
//                   {columns.map((c) => (
//                     <td
//                       key={c.key}
//                       className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
//                         c.align === 'right' ? 'text-right' : 'text-left'
//                       }`}
//                     >
//                       {c.render ? c.render(row) : (row as any)[c.key]}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td className="px-6 py-4 text-center text-sm text-gray-500" colSpan={columns.length}>
//                   {emptyText}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// /* -------------------------------------------
//    Main Component
// -------------------------------------------- */
// export const RoleManagement: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'role-types' | 'roles' | 'users'>('users');

//   const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
//   const [roles, setRoles] = useState<RoleRow[]>([]);
//   const [users, setUsers] = useState<UserRow[]>([]);

//   const [searchRoles, setSearchRoles] = useState('');
//   const [searchUsers, setSearchUsers] = useState('');

//   const [filteredRoles, setFilteredRoles] = useState<RoleRow[]>([]);
//   const [filteredUsers, setFilteredUsers] = useState<UserRow[]>([]);

//   // Roles pagination
//   const [rolePage, setRolePage] = useState(1);
//   const pageSize = 5;
//   const roleTotalPages = Math.ceil(filteredRoles.length / pageSize);
//   const roleSlice = filteredRoles.slice((rolePage - 1) * pageSize, rolePage * pageSize);

//   // Users pagination
//   const [userPage, setUserPage] = useState(1);
//   const userTotalPages = Math.ceil(filteredUsers.length / pageSize);
//   const userSlice = filteredUsers.slice((userPage - 1) * pageSize, userPage * pageSize);

//   const [loading, setLoading] = useState(false);
//   const [creatingOrUpdating, setCreatingOrUpdating] = useState(false);

//   // Role modal state
//   const [showForm, setShowForm] = useState(false);
//   const [formMode, setFormMode] = useState<FormMode>('create');
//   const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
//   const [initialValues, setInitialValues] = useState<null | {
//     roleName: string;
//     roleShortName: string;
//     description: string;
//     status: 'active' | 'inactive';
//     roleTypeId: number | '';
//     governanceId: number | '';
//   }>(null);

//   // User modal state
//   const [showUserForm, setShowUserForm] = useState(false);
//   const [userFormMode, setUserFormMode] = useState<FormMode>('create');
//   const [editingUserId, setEditingUserId] = useState<number | null>(null);
//   const [userInitialValues, setUserInitialValues] = useState<null | {
//     name: string;
//     email: string;
//     status: 'active' | 'inactive';
//     roleIds: number[];
//     governanceId: number | '';
//   }>(null);

//   // Dialog state
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogTitle, setDialogTitle] = useState('Notice');
//   const [dialogMessage, setDialogMessage] = useState('');

//   const [governances, setGovernances] = useState<Governance[]>([]);
//   const [selectedGovernance, ] = useState<string>('');
//   const [rolesForGovernance, ] = useState<any[]>([]);
//   const BASE_URL = '/api';
//   const CUSTOMER_ID = Number(sessionStorage.getItem("customerId")) || 0;

//   const getStatusPill = (on: boolean) => (
//     <span
//       className={`px-2 py-1 rounded-full text-xs font-medium ${
//         on ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//       }`}
//     >
//       {on ? 'Active' : 'Inactive'}
//     </span>
//   );

//   const getRoleTypeDescription = (roleTypeId: number) =>
//     roleTypes.find((t) => t.roleTypeId === roleTypeId)?.roleTypeDescription ?? 'Unknown';

//   /* ---------- Fetchers ---------- */
//   const fetchRoles = useCallback(async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/RoleMaster?CustomerId=${CUSTOMER_ID}`);
//       const data = await res.json();
//       const list = Array.isArray(data?.data) ? (data.data as RoleRow[]) : [];
//       setRoles(list);
//       setFilteredRoles(list);
//     } catch (e) {
//       console.error('Error fetching roles:', e);
//       setRoles([]);
//       setFilteredRoles([]);
//     }
//   }, []);

//   const fetchUsers = useCallback(async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/UserMaster?CustomerId=${CUSTOMER_ID}`);
//       const data = await res.json();

//       const list: UserRow[] = Array.isArray(data?.data)
//         ? data.data.map((u: any) => ({
//             id: Number(u.id),
//             name: String(u.name ?? ''),
//             email: String(u.email ?? ''),
//             customerName: u.customerName ?? undefined,
//             phoneNo: u.phoneNo ?? null,
//             role: Array.isArray(u.role) ? u.role.map(String) : [],
//             roleId: Array.isArray(u.roleId) ? u.roleId.map((n: any) => Number(n)) : [],
//             status: !!u.status,
//             govId: typeof u.govId === 'number' ? u.govId : Number(u.govId ?? NaN),
//             govName: u.govName ?? undefined,
//           }))
//         : [];

//       setUsers(list);
//       setFilteredUsers(list);
//     } catch (e) {
//       console.error('Error fetching users:', e);
//       setUsers([]);
//       setFilteredUsers([]);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchRoleTypes = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${BASE_URL}/RoleMaster/roletypelookup?CustomerId=${CUSTOMER_ID}`);
//         const data = await res.json();
//         setRoleTypes(Array.isArray(data) ? (data as RoleType[]) : []);
//       } catch (e) {
//         console.error('Error fetching role types:', e);
//         setRoleTypes([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     const fetchGovernances = async () => {
//       try {
//         const res = await fetch(`${BASE_URL}/LookUp/GetGovernancesForUsers?CustomerId=${CUSTOMER_ID}`);
//         const data = await res.json();
//         setGovernances(Array.isArray(data) ? (data as Governance[]) : []);
//       } catch (e) {
//         console.error('Error fetching governances:', e);
//         setGovernances([]);
//       }
//     };

//     fetchRoleTypes();
//     fetchRoles();
//     fetchUsers();
//     fetchGovernances();
//   }, [fetchRoles, fetchUsers]);

//   /* ---------- Filters ---------- */
//   useEffect(() => {
//     const q = searchRoles.toLowerCase();
//     const list = roles.filter(
//       (r) =>
//         (r.roleFName && r.roleFName.toLowerCase().includes(q)) ||
//         (r.roleSName && r.roleSName.toLowerCase().includes(q)) ||
//         (r.govName && r.govName.toLowerCase().includes(q)) ||
//         (r.roleTypeDescription && r.roleTypeDescription.toLowerCase().includes(q))
//     );
//     setFilteredRoles(list);
//     setRolePage(1);
//   }, [searchRoles, roles]);

//   useEffect(() => {
//     const q = searchUsers.toLowerCase();
//     const list = users.filter((u) => {
//       const roleText = (u.role || []).join(', ').toLowerCase();
//       return (
//         (u.name && u.name.toLowerCase().includes(q)) ||
//         (u.email && u.email.toLowerCase().includes(q)) ||
//         (u.govName && u.govName.toLowerCase().includes(q)) ||
//         roleText.includes(q)
//       );
//     });
//     setFilteredUsers(list);
//     setUserPage(1);
//   }, [searchUsers, users]);

//   /* ---------- Create/Update Roles ---------- */
//   type RoleFormPayload = {
//     roleName: string;
//     roleShortName: string;
//     description: string;
//     status: 'active' | 'inactive';
//     roleTypeId: number;
//     governanceId: number;
//   };

//   const createRole = async (form: RoleFormPayload) => {
//     const payload = {
//       customerId: CUSTOMER_ID,
//       roleFName: form.roleName,
//       roleSName: form.roleShortName,
//       roleDescription: form.description || '',
//       active: form.status === 'active',
//       roleTypeId: Number(form.roleTypeId),
//       govId: Number(form.governanceId),
//     };

//     setCreatingOrUpdating(true);
//     try {
//       const res = await fetch(`${BASE_URL}/RoleMaster`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const raw = await res.text();
//       let json: any = null;
//       try { json = raw ? JSON.parse(raw) : null; } catch {}
//       if (!res.ok) {
//         const msg = pickBackendMessage(json, raw || 'Create role failed.');
//         setDialogTitle('Create Failed');
//         setDialogMessage(msg);
//         setDialogOpen(true);
//         throw new Error(msg);
//       }
//       setDialogTitle('Success');
//       setDialogMessage(pickBackendMessage(json, 'Role created successfully.'));
//       setDialogOpen(true);

//       await fetchRoles();
//       setShowForm(false);
//       setRolePage(1);
//     } catch (e) {
//       console.error('Create error:', e);
//     } finally {
//       setCreatingOrUpdating(false);
//     }
//   };

//   const openEditModal = async (sysRoleId: number) => {
//     setFormMode('edit');
//     setEditingRoleId(sysRoleId);
//     setShowForm(true);

//     try {
//       const url = `${BASE_URL}/RoleMaster?Roleid=${encodeURIComponent(sysRoleId)}&CustomerId=${CUSTOMER_ID}`;
//       const res = await fetch(url);
//       const raw = await res.text();
//       let json: any = {};
//       try { json = raw ? JSON.parse(raw) : {}; } catch (e) { throw new Error('Invalid JSON'); }
//       if (!res.ok) throw new Error(`GET failed: ${res.status}`);

//       const node = json?.data;
//       const detail = Array.isArray(node) ? node[0] : node && typeof node === 'object' ? node : null;
//       if (!detail) throw new Error('Role details not found');

//       setInitialValues({
//         roleName: detail.roleFName ?? '',
//         roleShortName: detail.roleSName ?? '',
//         description: (detail.description ?? detail.roleDescription ?? '') as string,
//         status: detail.active ? 'active' : 'inactive',
//         roleTypeId: Number(detail.roleTypeId) || '',
//         governanceId: Number(detail.govId) || '',
//       });
//     } catch (e) {
//       console.error('Failed to load role details:', e);
//       setDialogTitle('Load Failed');
//       setDialogMessage('Failed to load role details.');
//       setDialogOpen(true);
//       setShowForm(false);
//       setEditingRoleId(null);
//       setFormMode('create');
//       setInitialValues(null);
//     }
//   };

//   const updateRole = async (form: RoleFormPayload, sysRoleId: number) => {
//     const payload = {
//       customerId: CUSTOMER_ID,
//       roleFName: form.roleName,
//       roleSName: form.roleShortName,
//       roleDescription: form.description || '',
//       active: form.status === 'active',
//       roleTypeId: Number(form.roleTypeId),
//       govId: Number(form.governanceId),
//     };

//     setCreatingOrUpdating(true);
//     try {
//       const res = await fetch(
//         `${BASE_URL}/RoleMaster?Roleid=${encodeURIComponent(sysRoleId)}&CustomerId=${CUSTOMER_ID}`,
//         {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(payload),
//         }
//       );
//       const raw = await res.text();
//       let json: any = null;
//       try { json = raw ? JSON.parse(raw) : null; } catch {}
//       if (!res.ok) {
//         const msg = pickBackendMessage(json, raw || 'Update role failed.');
//         setDialogTitle('Update Failed');
//         setDialogMessage(msg);
//         setDialogOpen(true);
//         throw new Error(msg);
//       }
//       setDialogTitle('Success');
//       setDialogMessage(pickBackendMessage(json, 'Role updated successfully.'));
//       setDialogOpen(true);

//       await fetchRoles();
//       setShowForm(false);
//       setEditingRoleId(null);
//       setFormMode('create');
//       setInitialValues(null);
//     } catch (e) {
//       console.error('Update error:', e);
//     } finally {
//       setCreatingOrUpdating(false);
//     }
//   };

//   const handleFormSubmit = async (form: RoleFormPayload) => {
//     if (formMode === 'create') await createRole(form);
//     else if (formMode === 'edit' && editingRoleId != null) await updateRole(form, editingRoleId);
//   };

//   const openCreateModal = () => {
//     setFormMode('create');
//     setEditingRoleId(null);
//     setInitialValues(null);
//     setShowForm(true);
//   };

//   const handleCancelForm = () => {
//     setShowForm(false);
//     setEditingRoleId(null);
//     setFormMode('create');
//     setInitialValues(null);
//   };

//   /* ---------- Create/Update Users ---------- */
//   type UserFormPayload = {
//     name: string;
//     email: string;
//     status: 'active' | 'inactive';
//     roleIds: number[];
//     governanceId: number;
//   };

//   const buildUserPayload = (form: UserFormPayload) => ({
//     name: form.name,
//     email: form.email,
//     customerId: CUSTOMER_ID,
//     cliRoleId: Array.isArray(form.roleIds) ? form.roleIds.map(Number) : [],
//     status: form.status === 'active',
//     createdBy: Number(sessionStorage.getItem('userId')) || 0,
//     govId: Number(form.governanceId),
//   });

//   const createUser = async (form: UserFormPayload) => {
//     const payload = buildUserPayload(form);
//     setCreatingOrUpdating(true);
//     try {
//       const res = await fetch(`${BASE_URL}/UserMaster`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const raw = await res.text();
//       let json: any = null;
//       try { json = raw ? JSON.parse(raw) : null; } catch {}
//       if (!res.ok) {
//         const msg = pickBackendMessage(json, raw || 'Create user failed.');
//         setDialogTitle('Create Failed');
//         setDialogMessage(msg);
//         setDialogOpen(true);
//         throw new Error(msg);
//       }
//       setDialogTitle('Success');
//       setDialogMessage(pickBackendMessage(json, 'User created successfully.'));
//       setDialogOpen(true);

//       await fetchUsers();
//       setShowUserForm(false);
//       setUserFormMode('create');
//       setEditingUserId(null);
//       setUserInitialValues(null);
//     } catch (e) {
//       console.error('Create user error:', e);
//     } finally {
//       setCreatingOrUpdating(false);
//     }
//   };

//   const updateUser = async (form: UserFormPayload, userId: number) => {
//     const payload = buildUserPayload(form);
//     setCreatingOrUpdating(true);
//     try {
//       const url = `${BASE_URL}/UserMaster?Userid=${encodeURIComponent(userId)}&CustomerId=${CUSTOMER_ID}`;
//       const res = await fetch(url, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//       const raw = await res.text();
//       let json: any = null;
//       try { json = raw ? JSON.parse(raw) : null; } catch {}
//       if (!res.ok) {
//         const msg = pickBackendMessage(json, raw || 'Update user failed.');
//         setDialogTitle('Update Failed');
//         setDialogMessage(msg);
//         setDialogOpen(true);
//         throw new Error(msg);
//       }
//       setDialogTitle('Success');
//       setDialogMessage(pickBackendMessage(json, 'User updated successfully.'));
//       setDialogOpen(true);

//       await fetchUsers();
//       setShowUserForm(false);
//       setUserFormMode('create');
//       setEditingUserId(null);
//       setUserInitialValues(null);
//     } catch (e) {
//       console.error('Update user error:', e);
//     } finally {
//       setCreatingOrUpdating(false);
//     }
//   };

//   const openCreateUserModal = () => {
//     setUserFormMode('create');
//     setEditingUserId(null);
//     setUserInitialValues(null);
//     setShowUserForm(true);
//   };

//   const openEditUserModal = async (userId: number) => {
//     setUserFormMode('edit');
//     setEditingUserId(userId);
//     setShowUserForm(true);

//     try {
//       const url = `${BASE_URL}/UserMaster?Userid=${encodeURIComponent(userId)}&CustomerId=${CUSTOMER_ID}`;
//       const res = await fetch(url);
//       const raw = await res.text();
//       let json: any = {};
//       try { json = raw ? JSON.parse(raw) : {}; } catch {}
//       if (!res.ok) throw new Error(`GET failed: ${res.status}`);

//       const node = json?.data;
//       const detail = Array.isArray(node) ? node[0] : (node && typeof node === 'object' ? node : null);
//       if (!detail) throw new Error('User not found');

//       setUserInitialValues({
//         name: String(detail.name ?? ''),
//         email: String(detail.email ?? ''),
//         status: detail.status ? 'active' : 'inactive',
//         roleIds: Array.isArray(detail.roleId) ? detail.roleId.map((n: any) => Number(n)) : [],
//         governanceId: Number(detail.govId) || '',
//       });
//     } catch (e) {
//       console.error('Load user failed:', e);
//       setDialogTitle('Load Failed');
//       setDialogMessage('Failed to load user details.');
//       setDialogOpen(true);
//       setShowUserForm(false);
//       setEditingUserId(null);
//       setUserFormMode('create');
//       setUserInitialValues(null);
//     }
//   };

//   const handleUserFormSubmit = async (form: UserFormPayload) => {
//     if (userFormMode === 'create') await createUser(form);
//     else if (userFormMode === 'edit' && editingUserId != null) await updateUser(form, editingUserId);
//   };

//   const handleCancelUserForm = () => {
//     setShowUserForm(false);
//     setEditingUserId(null);
//     setUserFormMode('create');
//     setUserInitialValues(null);
//   };

//   /* ---------- Columns Config ---------- */
//   const roleColumns: Column<RoleRow>[] = [
//     { key: 'roleFName', header: 'Role Name' },
//     {
//       key: 'roleTypeId',
//       header: 'Role Type',
//       render: (r) => getRoleTypeDescription(r.roleTypeId),
//     },
//     { key: 'govName', header: 'Governance' },
//     { key: 'roleSName', header: 'Role Short Name' },
//     {
//       key: 'active',
//       header: 'Status',
//       render: (r) => getStatusPill(r.active),
//     },
//     {
//       key: 'actions',
//       header: 'Actions',
//       align: 'right',
//       render: (r) => (
//         <div className="flex items-center justify-end gap-2">
//           <button
//             className="text-gray-600 hover:text-gray-700"
//             title="Edit"
//             onClick={() => openEditModal(Number(r.sysRoleId))}
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//           <button className="text-red-600 hover:text-red-700" title="Delete">
//             <Trash2 className="w-4 h-4" />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   const userColumns: Column<UserRow>[] = [
//     { key: 'name', header: 'Name' },
//     { key: 'email', header: 'Email' },
//     { key: 'govName', header: 'Governance' },
//     {
//       key: 'role',
//       header: 'Role',
//       render: (u) => (u.role && u.role.length ? u.role.join(', ') : '—'),
//     },
//     {
//       key: 'status',
//       header: 'Status',
//       render: (u) => getStatusPill(u.status),
//     },
//     {
//       key: 'actions',
//       header: 'Actions',
//       align: 'right',
//       render: (u) => (
//         <div className="flex items-center justify-end gap-2">
//           <button
//             className="text-gray-600 hover:text-gray-700"
//             title="Edit"
//             onClick={() => openEditUserModal(Number(u.id))}
//           >
//             <Edit className="w-4 h-4" />
//           </button>
//           <button className="text-red-600 hover:text-red-700" title="Delete">
//             <Trash2 className="w-4 h-4" />
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Role &amp; User Management</h2>
//           <p className="text-gray-600">Manage user roles, permissions, and access control</p>
//         </div>
//         {(activeTab === 'roles' || activeTab === 'users') && (
//           <button
//             onClick={activeTab === 'roles' ? openCreateModal : openCreateUserModal}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
//             disabled={creatingOrUpdating}
//           >
//             <UserPlus className="w-4 h-4" />
//             Add New
//           </button>
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           {[
//             { id: 'role-types', label: 'Role Types', icon: Shield },
//             { id: 'roles', label: 'Roles', icon: Users },
//             { id: 'users', label: 'Users', icon: UserPlus },
//           ].map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id as any)}
//               className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
//                 activeTab === (tab.id as any)
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <tab.icon className="w-4 h-4" />
//               {tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Modal: Create/Edit Roles */}
//       {showForm && (
//         <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
//             <AddNewRoleForm
//               roleTypes={roleTypes}
//               governances={governances}
//               selectedGovernance={selectedGovernance}
//               rolesForGovernance={rolesForGovernance}
//               submitting={creatingOrUpdating}
//               mode={formMode}
//               initialValues={initialValues ?? undefined}
//               onSubmit={handleFormSubmit}
//               onCancel={handleCancelForm}
//             />
//           </div>
//         </div>
//       )}

//       {/* Modal: Create/Edit Users */}
//       {showUserForm && (
//         <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
//             <AddNewUserForm
//               roles={roles.map(r => ({ sysRoleId: Number(r.sysRoleId), roleFName: r.roleFName }))}
//               governances={governances}
//               submitting={creatingOrUpdating}
//               mode={userFormMode}
//               initialValues={userInitialValues ?? undefined}
//               onSubmit={handleUserFormSubmit}
//               onCancel={handleCancelUserForm}
//             />
//           </div>
//         </div>
//       )}

//       {/* Role Types */}
//       {activeTab === 'role-types' && (
//         <div className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {roleTypes.length > 0 ? (
//               roleTypes.map((type, index) => (
//                 <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 h-full">
//                   <div className="flex items-start justify-between gap-3 mb-4">
//                     <h3 className="text-lg font-semibold text-gray-800 leading-snug break-words">
//                       {type.roleTypeDescription}
//                     </h3>
//                   </div>
//                   <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                     Manage Roles →
//                   </button>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500">No role types found.</p>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Roles */}
//       {activeTab === 'roles' && (
//         <Fragment>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <SearchInput placeholder="Search roles..." value={searchRoles} onChange={setSearchRoles} />
//               <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                 <Filter className="w-4 h-4" />
//                 <span className="text-sm">Filter</span>
//               </button>
//             </div>
//           </div>

//           <DataTable
//             columns={roleColumns}
//             rows={roleSlice}
//             emptyText={loading ? 'Loading...' : 'No roles found.'}
//           />

//           <Pagination
//             currentPage={rolePage}
//             totalPages={roleTotalPages}
//             onPrev={() => setRolePage((p) => Math.max(1, p - 1))}
//             onNext={() => setRolePage((p) => Math.min(roleTotalPages || 1, p + 1))}
//           />
//         </Fragment>
//       )}

//       {/* Users */}
//       {activeTab === 'users' && (
//         <Fragment>
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <SearchInput placeholder="Search users..." value={searchUsers} onChange={setSearchUsers} />
//               <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                 <Filter className="w-4 h-4" />
//                 <span className="text-sm">Filter</span>
//               </button>
//             </div>
//           </div>

//           <DataTable
//             columns={userColumns}
//             rows={userSlice}
//             emptyText="No users found."
//           />

//           <Pagination
//             currentPage={userPage}
//             totalPages={userTotalPages}
//             onPrev={() => setUserPage((p) => Math.max(1, p - 1))}
//             onNext={() => setUserPage((p) => Math.min(userTotalPages || 1, p + 1))}
//           />
//         </Fragment>
//       )}

//       {/* Result dialog */}
//       <Dialog
//         open={dialogOpen}
//         title={dialogTitle}
//         message={dialogMessage}
//         onClose={() => setDialogOpen(false)}
//       />
//     </div>
//   );
// };

// export default RoleManagement;




import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { Users, UserPlus, Edit, Trash2, Search, Filter, Shield, X } from 'lucide-react';
import AddNewRoleForm from '../pages/AddNewRoleForm.tsx';
import AddNewUserForm from '../pages/AddNewUserForm.tsx';
import { apiService, unwrapData } from '../../services/api.ts';

import {
  getRoleTypes,
  getRoles,
  getRoleById,
  createRole as svcCreateRole,
  updateRole as svcUpdateRole,
  type RoleType,
  type RoleRow
} from '../../services/roleservice.ts';

import {
  getUsers,
  getUserById,
  createUser as svcCreateUser,
  updateUser as svcUpdateUser,
  deleteUser as svcDeleteUser,
  type UserRow
} from '../../services/userservice.ts';

/* ------------ Dialog ------------ */
const Dialog: React.FC<{
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}> = ({ open, title = 'Notice', message = '', onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md">
        <div className="px-5 py-4 border-b">
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        </div>
        <div className="px-5 py-4">
          <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
        </div>
        <div className="px-5 py-3 border-t flex justify-end">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------ Helpers ------------ */
const pickBackendMessage = (json: any, textFallback: string) => {
  if (!json || typeof json !== 'object') return textFallback || 'Done.';
  const keys = ['message', 'Message', 'msg', 'statusMessage', 'detail', 'error', 'Status', 'result'];
  for (const k of keys) {
    if (k in json && json[k]) return String(json[k]);
  }
  if (json.data && typeof json.data === 'object') {
    for (const k of keys) {
      if (k in json.data && json.data[k]) return String(json.data[k]);
    }
  }
  return textFallback || 'Done.';
};

/* ------------ SearchInput ------------ */
const SearchInput: React.FC<{
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ placeholder, value, onChange }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Escape') onChange(''); }}
      className="pl-10 pr-9 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        title="Clear"
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

/* ------------ Pagination ------------ */
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}> = ({ currentPage, totalPages, onPrev, onNext }) => (
  <div className="flex justify-center mt-4 gap-2">
    <button
      onClick={onPrev}
      className="px-4 py-2 bg-blue-600 text-white rounded-l-lg disabled:bg-gray-300"
      disabled={currentPage === 1}
    >
      Previous
    </button>
    <div className="px-3 py-2 border rounded text-sm text-gray-700">
      Page {currentPage} of {Math.max(totalPages, 1)}
    </div>
    <button
      onClick={onNext}
      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg disabled:bg-gray-300"
      disabled={currentPage === totalPages || totalPages === 0}
    >
      Next
    </button>
  </div>
);

/* ------------ DataTable ------------ */
type Column<T> = {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render?: (row: T) => React.ReactNode;
};
function DataTable<T extends Record<string, any>>(props: {
  columns: Column<T>[];
  rows: T[];
  emptyText: string;
  getRowKey: (row: T, idx: number) => string | number;
}) {
  const { columns, rows, emptyText, getRowKey } = props;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[400px]">
      <div className="overflow-x-auto">
        <table className="min-w-max w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={`col-${c.key}`}
                  className={`px-6 py-3 ${c.align === 'right' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length ? (
              rows.map((row, idx) => {
                const rk = getRowKey(row, idx);
                return (
                  <tr key={rk} className="hover:bg-gray-50 transition-colors">
                    {columns.map((c) => (
                      <td
                        key={`cell-${rk}-${c.key}`}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                      >
                        {c.render ? c.render(row) : (row as any)[c.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-6 py-4 text-center text-sm text-gray-500" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------ Main ------------ */
type Governance = { id: number | string; name: string };
type FormMode = 'create' | 'edit';

const RoleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'role-types' | 'roles' | 'users'>('users');

  const [roleTypes, setRoleTypes] = useState<RoleType[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  const [searchRoles, setSearchRoles] = useState('');
  const [searchUsers, setSearchUsers] = useState('');

  const [filteredRoles, setFilteredRoles] = useState<RoleRow[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>([]);

  const [rolePage, setRolePage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const pageSize = 5;

  const roleTotalPages = Math.ceil(filteredRoles.length / pageSize);
  const userTotalPages = Math.ceil(filteredUsers.length / pageSize);
  const roleSlice = filteredRoles.slice((rolePage - 1) * pageSize, rolePage * pageSize);
  const userSlice = filteredUsers.slice((userPage - 1) * pageSize, userPage * pageSize);

  const [loading, setLoading] = useState(false);
  const [creatingOrUpdating, setCreatingOrUpdating] = useState(false);

  // Role modal state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [initialValues, setInitialValues] = useState<null | {
    roleName: string;
    roleShortName: string;
    description: string;
    status: 'active' | 'inactive';
    roleTypeId: number | '';
    governanceId: number | '';
  }>(null);

  // User modal state
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormMode, setUserFormMode] = useState<FormMode>('create');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userInitialValues, setUserInitialValues] = useState<null | {
    name: string;
    email: string;
    status: 'active' | 'inactive';
    roleIds: number[];
    governanceId: number | '';
  }>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('Notice');
  const [dialogMessage, setDialogMessage] = useState('');

  const [governances, setGovernances] = useState<Governance[]>([]);
  const [selectedGovernance] = useState<string>('');
  const [rolesForGovernance] = useState<any[]>([]);

  const CUSTOMER_ID = Number(sessionStorage.getItem("customerId")) || 0;

  const getStatusPill = (on: boolean) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${on ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {on ? 'Active' : 'Inactive'}
    </span>
  );

  const getRoleTypeDescription = (roleTypeId: number) =>
    roleTypes.find((t) => t.roleTypeId === roleTypeId)?.roleTypeDescription ?? 'Unknown';

  /* ---------- Fetchers ---------- */
  const fetchRolesList = useCallback(async () => {
    try {
      const list = await getRoles(CUSTOMER_ID);
      setRoles(list);
      setFilteredRoles(list);
    } catch (e) {
      console.error('Error fetching roles:', e);
      setRoles([]);
      setFilteredRoles([]);
    }
  }, [CUSTOMER_ID]);

  const fetchUsersList = useCallback(async () => {
    try {
      const list = await getUsers(CUSTOMER_ID);
      setUsers(list);
      setFilteredUsers(list);
    } catch (e) {
      console.error('Error fetching users:', e);
      setUsers([]);
      setFilteredUsers([]);
    }
  }, [CUSTOMER_ID]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const types = await getRoleTypes(CUSTOMER_ID);
        setRoleTypes(types);
      } catch (e) {
        console.error(e);
        setRoleTypes([]);
      } finally {
        setLoading(false);
      }
    })();

    (async () => {
      try {
        const data = await unwrapData<any>(
          apiService.get(`/LookUp/GetGovernancesForUsers`, { params: { CustomerId: CUSTOMER_ID } })
        );
        setGovernances(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching governances:', e);
        setGovernances([]);
      }
    })();

    fetchRolesList();
    fetchUsersList();
  }, [CUSTOMER_ID, fetchRolesList, fetchUsersList]);

  /* ---------- Filters ---------- */
  useEffect(() => {
    const q = searchRoles.toLowerCase();
    const list = roles.filter(
      (r) =>
        (r.roleFName && r.roleFName.toLowerCase().includes(q)) ||
        (r.roleSName && r.roleSName.toLowerCase().includes(q)) ||
        (r.govName && r.govName.toLowerCase().includes(q)) ||
        (r.roleTypeDescription && r.roleTypeDescription.toLowerCase().includes(q))
    );
    setFilteredRoles(list);
    setRolePage(1);
  }, [searchRoles, roles]);

  useEffect(() => {
    const q = searchUsers.toLowerCase();
    const list = users.filter((u) => {
      const roleText = (u.role || []).join(', ').toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.govName && u.govName.toLowerCase().includes(q)) ||
        roleText.includes(q)
      );
    });
    setFilteredUsers(list);
    setUserPage(1);
  }, [searchUsers, users]);

  /* ---------- Role Create/Update ---------- */
  type RoleFormPayload = {
    roleName: string;
    roleShortName: string;
    description: string;
    status: 'active' | 'inactive';
    roleTypeId: number;
    governanceId: number;
  };

  const createRole = async (form: RoleFormPayload) => {
    setCreatingOrUpdating(true);
    try {
      const res = await svcCreateRole(CUSTOMER_ID, form);
      if (!res || (res as any).status >= 400) {
        setDialogTitle('Create Failed');
        setDialogMessage(pickBackendMessage((res as any)?.data, 'Create role failed.'));
        setDialogOpen(true);
        return;
      }
      setDialogTitle('Success');
      setDialogMessage('Role created successfully.');
      setDialogOpen(true);
      await fetchRolesList();
      setShowForm(false);
      setRolePage(1);
    } finally {
      setCreatingOrUpdating(false);
    }
  };

  const openEditModal = async (sysRoleId: number) => {
    setFormMode('edit');
    setEditingRoleId(sysRoleId);

    // 1) Instant prefill from current table row (correct row every time)
    const local = roles.find(r => Number(r.sysRoleId) === Number(sysRoleId));
    if (local) {
      setInitialValues({
        roleName: local.roleFName ?? '',
        roleShortName: local.roleSName ?? '',
        description: (local.description ?? local.roleDescription ?? '') as string,
        status: local.active ? 'active' : 'inactive',
        roleTypeId: Number(local.roleTypeId) || '',
        governanceId: Number(local.govId) || '',
      });
    }
    setShowForm(true); // open now (no flicker)

    // 2) Authoritative fetch — if API returns array, filter by id
    try {
      const detail = await getRoleById(CUSTOMER_ID, sysRoleId);
      if (detail) {
        setInitialValues({
          roleName: detail.roleFName ?? '',
          roleShortName: detail.roleSName ?? '',
          description: (detail.description ?? detail.roleDescription ?? '') as string,
          status: detail.active ? 'active' : 'inactive',
          roleTypeId: Number(detail.roleTypeId) || '',
          governanceId: Number(detail.govId) || '',
        });
      }
    } catch (e) {
      console.error('Failed to load role details:', e);
      setDialogTitle('Load Failed');
      setDialogMessage('Failed to load role details.');
      setDialogOpen(true);
    }
  };

  const updateRole = async (form: RoleFormPayload, sysRoleId: number) => {
    setCreatingOrUpdating(true);
    try {
      const res = await svcUpdateRole(CUSTOMER_ID, sysRoleId, form);
      if (!res || (res as any).status >= 400) {
        setDialogTitle('Update Failed');
        setDialogMessage(pickBackendMessage((res as any)?.data, 'Update role failed.'));
        setDialogOpen(true);
        return;
      }
      setDialogTitle('Success');
      setDialogMessage('Role updated successfully.');
      setDialogOpen(true);
      await fetchRolesList();
      setShowForm(false);
      setEditingRoleId(null);
      setFormMode('create');
      setInitialValues(null);
    } finally {
      setCreatingOrUpdating(false);
    }
  };

  const handleFormSubmit = async (form: RoleFormPayload) => {
    if (formMode === 'create') await createRole(form);
    else if (formMode === 'edit' && editingRoleId != null) await updateRole(form, editingRoleId);
  };

  const openCreateModal = () => {
    setFormMode('create');
    setEditingRoleId(null);
    setInitialValues(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRoleId(null);
    setFormMode('create');
    setInitialValues(null);
  };

  /* ---------- User Create/Update ---------- */
  type UserFormPayload = {
    name: string;
    email: string;
    status: 'active' | 'inactive';
    roleIds: number[];
    governanceId: number;
  };

  const createUser = async (form: UserFormPayload) => {
    setCreatingOrUpdating(true);
    try {
      const res = await svcCreateUser(CUSTOMER_ID, form);
      if (!res || (res as any).status >= 400) {
        setDialogTitle('Create Failed');
        setDialogMessage(pickBackendMessage((res as any)?.data, 'Create user failed.'));
        setDialogOpen(true);
        return;
      }
      setDialogTitle('Success');
      setDialogMessage('User created successfully.');
      setDialogOpen(true);
      await fetchUsersList();
      setShowUserForm(false);
      setUserFormMode('create');
      setEditingUserId(null);
      setUserInitialValues(null);
    } finally {
      setCreatingOrUpdating(false);
    }
  };

  const updateUser = async (form: UserFormPayload, userId: number) => {
    setCreatingOrUpdating(true);
    try {
      const res = await svcUpdateUser(CUSTOMER_ID, userId, form);
      if (!res || (res as any).status >= 400) {
        setDialogTitle('Update Failed');
        setDialogMessage(pickBackendMessage((res as any)?.data, 'Update user failed.'));
        setDialogOpen(true);
        return;
      }
      setDialogTitle('Success');
      setDialogMessage('User updated successfully.');
      setDialogOpen(true);
      await fetchUsersList();
      setShowUserForm(false);
      setUserFormMode('create');
      setEditingUserId(null);
      setUserInitialValues(null);
    } finally {
      setCreatingOrUpdating(false);
    }
  };


  const deleteUserHandler = async (userId: number) => {
  try {
    const res = await svcDeleteUser(CUSTOMER_ID, userId);

    if (!res || (res as any).status >= 400) {
      setDialogTitle('Delete Failed');
      setDialogMessage('Failed to delete user.');
      setDialogOpen(true);
      return;
    }

    setDialogTitle('Success');
    setDialogMessage('User deleted successfully.');
    setDialogOpen(true);

    await fetchUsersList(); // refresh table
  } catch (e) {
    console.error('Delete user error:', e);
    setDialogTitle('Error');
    setDialogMessage('Something went wrong while deleting.');
    setDialogOpen(true);
  }
};

  const openCreateUserModal = () => {
    setUserFormMode('create');
    setEditingUserId(null);
    setUserInitialValues(null);
    setShowUserForm(true);
  };

  const openEditUserModal = async (userId: number) => {
    setUserFormMode('edit');
    setEditingUserId(userId);

    // 1) Prefill from the clicked row
    const local = users.find(u => Number(u.id) === Number(userId));
    if (local) {
      setUserInitialValues({
        name: local.name ?? '',
        email: local.email ?? '',
        status: local.status ? 'active' : 'inactive',
        roleIds: Array.isArray(local.roleId) ? local.roleId : [],
        governanceId: Number(local.govId || ''),
      });
    }
    setShowUserForm(true);

    // 2) Fetch authoritative user (filter by id if array)
    try {
      const detail = await getUserById(CUSTOMER_ID, userId);
      if (detail) {
        setUserInitialValues({
          name: String(detail.name ?? ''),
          email: String(detail.email ?? ''),
          status: detail.status ? 'active' : 'inactive',
          roleIds: Array.isArray(detail.roleId) ? detail.roleId.map(Number) : [],
          governanceId: Number(detail.govId) || '',
        });
      }
    } catch (e) {
      console.error('Load user failed:', e);
      setDialogTitle('Load Failed');
      setDialogMessage('Failed to load user details.');
      setDialogOpen(true);
    }
  };

  const handleUserFormSubmit = async (form: UserFormPayload) => {
    if (userFormMode === 'create') await createUser(form);
    else if (userFormMode === 'edit' && editingUserId != null) await updateUser(form, editingUserId);
  };

  const handleCancelUserForm = () => {
    setShowUserForm(false);
    setEditingUserId(null);
    setUserFormMode('create');
    setUserInitialValues(null);
  };

  /* ---------- Columns ---------- */
  const roleColumns: Column<RoleRow>[] = [
    { key: 'roleFName', header: 'Role Name' },
    { key: 'roleTypeId', header: 'Role Type', render: (r) => getRoleTypeDescription(r.roleTypeId) },
    { key: 'govName', header: 'Governance' },
    { key: 'roleSName', header: 'Role Short Name' },
    { key: 'active', header: 'Status', render: (r) => getStatusPill(r.active) },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-gray-600 hover:text-gray-700"
            title="Edit"
            onClick={() => openEditModal(Number(r.sysRoleId))}
          >
            <Edit className="w-4 h-4" />
          </button>
        
        </div>
      ),
    },
  ];

  const userColumns: Column<UserRow>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'govName', header: 'Governance' },
    { key: 'role', header: 'Role', render: (u) => (u.role && u.role.length ? u.role.join(', ') : '—') },
    { key: 'status', header: 'Status', render: (u) => getStatusPill(u.status) },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-gray-600 hover:text-gray-700"
            title="Edit"
            onClick={() => openEditUserModal(Number(u.id))}
          >
            <Edit className="w-4 h-4" />
          </button>
         <button
  className="text-red-600 hover:text-red-700"
  title="Delete"
  onClick={() => deleteUserHandler(Number(u.id))}
>
  <Trash2 className="w-4 h-4" />
</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Role &amp; User Management</h2>
          <p className="text-gray-600">Manage user roles, permissions, and access control</p>
        </div>
        {(activeTab === 'roles' || activeTab === 'users') && (
          <button
            onClick={activeTab === 'roles' ? openCreateModal : openCreateUserModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            disabled={creatingOrUpdating}
          >
            <UserPlus className="w-4 h-4" />
            Add New
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'role-types', label: 'Role Types', icon: Shield },
            { id: 'roles', label: 'Roles', icon: Users },
            { id: 'users', label: 'Users', icon: UserPlus },
          ].map((tab) => (
            <button
              key={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === (tab.id as any)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Role Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <AddNewRoleForm
              roleTypes={roleTypes}
              governances={governances}
              selectedGovernance={selectedGovernance}
              rolesForGovernance={rolesForGovernance}
              submitting={creatingOrUpdating}
              mode={formMode}
              initialValues={initialValues ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <AddNewUserForm
              roles={roles.map(r => ({ sysRoleId: Number(r.sysRoleId), roleFName: r.roleFName }))}
              governances={governances}
              submitting={creatingOrUpdating}
              mode={userFormMode}
              initialValues={userInitialValues ?? undefined}
              onSubmit={handleUserFormSubmit}
              onCancel={handleCancelUserForm}
            />
          </div>
        </div>
      )}

      {/* Role Types */}
      {activeTab === 'role-types' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleTypes.length > 0 ? (
              roleTypes.map((type) => (
                <div key={`roleType-${type.roleTypeId}`} className="bg-white border border-gray-200 rounded-xl p-6 h-full">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 leading-snug break-words">
                      {type.roleTypeDescription}
                    </h3>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Manage Roles →
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No role types found.</p>
            )}
          </div>
        </div>
      )}

      {/* Roles */}
      {activeTab === 'roles' && (
        <Fragment>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SearchInput placeholder="Search roles..." value={searchRoles} onChange={setSearchRoles} />
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>

          <DataTable<RoleRow>
            columns={roleColumns}
            rows={roleSlice}
            emptyText={loading ? 'Loading...' : 'No roles found.'}
            getRowKey={(r) => `role-${r.sysRoleId}-${r.roleSName ?? ''}`}
          />

          <Pagination
            currentPage={rolePage}
            totalPages={roleTotalPages}
            onPrev={() => setRolePage((p) => Math.max(1, p - 1))}
            onNext={() => setRolePage((p) => Math.min(roleTotalPages || 1, p + 1))}
          />
        </Fragment>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <Fragment>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SearchInput placeholder="Search users..." value={searchUsers} onChange={setSearchUsers} />
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>

          <DataTable<UserRow>
            columns={userColumns}
            rows={userSlice}
            emptyText="No users found."
            getRowKey={(u) => `user-${u.id}-${u.email}`}
          />

          <Pagination
            currentPage={userPage}
            totalPages={userTotalPages}
            onPrev={() => setUserPage((p) => Math.max(1, p - 1))}
            onNext={() => setUserPage((p) => Math.min(userTotalPages || 1, p + 1))}
          />
        </Fragment>
      )}

      <Dialog
        open={dialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
};

export default RoleManagement;

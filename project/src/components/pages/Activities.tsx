// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActivityAPI,
//   ActivityItem,
//   LookupOption,
//   Priority,
//   Status,
// } from "../../services/activityService";
// import { Clock, CheckCircle, AlertCircle, X, Pencil, Loader2 } from "lucide-react";
// import PopupMessages, { PopupKind } from "../popups/PopupMessages.tsx"; // <-- adjust path if needed

// /** helpers */
// const nm = (s?: string) => (s ?? "").trim().toLowerCase();
// const idFromName = (opts: LookupOption[], name?: string) =>
//   opts.find((o) => nm(o.name) === nm(name))?.id ?? 0;
// const resolveId = (existingId?: number, existingName?: string, opts: LookupOption[] = []) =>
//   existingId && existingId > 0 ? existingId : idFromName(opts, existingName) || (opts[0]?.id ?? 0);

// export const Activities: React.FC = () => {
//   const [activities, setActivities] = useState<ActivityItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [customerId, setCustomerId] = useState<number | undefined>();
//   const [govId, setGovId] = useState<number | undefined>();

//   // modal
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState<ActivityItem | null>(null);

//   // lookups
//   const [doerOpts, setDoerOpts] = useState<LookupOption[]>([]);
//   const [approverOpts, setApproverOpts] = useState<LookupOption[]>([]);
//   const [freqOpts, setFreqOpts] = useState<LookupOption[]>([]);
//   const [lookupsLoading, setLookupsLoading] = useState(false);

//   // submit state + popup
//   const [submitting, setSubmitting] = useState(false);
//   const [popupOpen, setPopupOpen] = useState(false);
//   const [popupKind, setPopupKind] = useState<PopupKind>("info");
//   const [popupMessage, setPopupMessage] = useState<string | string[]>("Operation completed.");
//   const [lastWasSuccess, setLastWasSuccess] = useState<boolean>(false);

//   // form
//   const [form, setForm] = useState<{
//     activityTitle?: string;
//     activityDescr?: string;
//     doerRoleId?: number;
//     approverRoleId?: number;
//     frequencyId?: number;
//     duration?: number;
//     active?: boolean;
//   }>({ active: true });

//   // avoid duplicate initial fetch in Strict Mode (dev)
//   const loadedOnce = useRef(false);

//   /** read IDs from sessionStorage */
//   useEffect(() => {
//     try {
//       const userRaw = sessionStorage.getItem("userDetails");
//       if (userRaw) {
//         const u = JSON.parse(userRaw);
//         if (u?.customerId != null) setCustomerId(Number(u.customerId));
//       }
//       const g1 = sessionStorage.getItem("govId");
//       const g2 = sessionStorage.getItem("govid");
//       const roleRaw = sessionStorage.getItem("roleDetails");
//       if (g1) setGovId(Number(g1));
//       else if (g2) setGovId(Number(g2));
//       else if (roleRaw) {
//         const r = JSON.parse(roleRaw);
//         if (r?.govId != null) setGovId(Number(r.govId));
//         else if (r?.govid != null) setGovId(Number(r.govid));
//       }
//     } catch {}
//   }, []);

//   /** load list once IDs exist */
//   useEffect(() => {
//     if (customerId == null || govId == null) return;
//     if (loadedOnce.current) return;
//     loadedOnce.current = true;
//     (async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const list = await ActivityAPI.list(customerId, govId);
//         setActivities(list);
//       } catch (e: any) {
//         setError(e?.response?.data?.message || "Failed to fetch activities");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [customerId, govId]);

//   /** open modal and load lookups */
//   const openEdit = async (a: ActivityItem) => {
//     if (customerId == null || govId == null) return;

//     setEditing(a);
//     setShowModal(true);
//     setForm({
//       activityTitle: a.activityTitle,
//       activityDescr: a.activityDescr,
//       doerRoleId: a.doerRoleId,
//       approverRoleId: a.approverRoleId,
//       frequencyId: a.frequencyId,
//       duration: a.duration,
//       active: !!a.active,
//     });

//     setLookupsLoading(true);
//     try {
//       const [doers, approvers, freqs] = await Promise.all([
//         ActivityAPI.doerRoles(customerId, govId),
//         ActivityAPI.approverRoles(customerId, govId),
//         ActivityAPI.frequencies(customerId, govId),
//       ]);
//       setDoerOpts(doers);
//       setApproverOpts(approvers);
//       setFreqOpts(freqs);

//       setForm((prev) => ({
//         ...prev,
//         doerRoleId: resolveId(prev.doerRoleId, a.doerRole, doers),
//         approverRoleId: resolveId(prev.approverRoleId, a.approverRole, approvers),
//         frequencyId: resolveId(prev.frequencyId, a.frequency, freqs),
//       }));
//     } finally {
//       setLookupsLoading(false);
//     }
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setEditing(null);
//     setDoerOpts([]);
//     setApproverOpts([]);
//     setFreqOpts([]);
//     setSubmitting(false);
//   };

//   /** build payload — important: send doerRole / approverRole as numeric IDs too */
//   const buildUpdatePayload = (base: ActivityItem) => {
//     const doerId = Number(form.doerRoleId ?? base.doerRoleId ?? 0);
//     const apprId = Number(form.approverRoleId ?? base.approverRoleId ?? 0);
//     const freqId = Number(form.frequencyId ?? base.frequencyId ?? 0);
//     const duration = Number(form.duration ?? base.duration ?? 0);

//     return {
//       customerId,
//       govId,
//       standardId: Number(base.standardId ?? 1),

//       activityTitle: form.activityTitle ?? base.activityTitle,
//       activityDescr: form.activityDescr ?? base.activityDescr,

//       doerRole: doerId,
//       doerRoleId: doerId,
//       approverRole: apprId,
//       approverRoleId: apprId,

//       frequencyId: freqId,
//       duration,

//       active: Boolean(form.active ?? base.active ?? true),
//       isActive: Boolean(form.active ?? base.active ?? true),

//       auditable: base.auditable ?? true,
//       isApplicable: base.isApplicable ?? true,
//       justification: base.justification ?? "",
//     };
//   };

//   const validateForm = () => {
//     if (!form.activityTitle?.trim() || !form.activityDescr?.trim()) {
//       showPopup("error", "Activity Name and Description are required.");
//       return false;
//     }
//     if (!form.doerRoleId || form.doerRoleId <= 0) {
//       showPopup("error", "Please select a Doer Role.");
//       return false;
//     }
//     if (!form.approverRoleId || form.approverRoleId <= 0) {
//       showPopup("error", "Please select an Approver Role.");
//       return false;
//     }
//     if (!form.frequencyId || form.frequencyId <= 0) {
//       showPopup("error", "Please select a Frequency.");
//       return false;
//     }
//     if (form.duration == null || Number(form.duration) <= 0) {
//       showPopup("error", "Please enter a valid Duration (> 0).");
//       return false;
//     }
//     return true;
//   };

//   /** popup helpers */
//   const showPopup = (kind: PopupKind, message: string | string[]) => {
//     setPopupKind(kind);
//     setPopupMessage(message);
//     setPopupOpen(true);
//   };
//   const handlePopupClose = async () => {
//     setPopupOpen(false);
//     // stop the loading overlay when popup is dismissed
//     setSubmitting(false);

//     // on success, close modal and refresh
//     if (lastWasSuccess) {
//       closeModal();
//       if (customerId != null && govId != null) {
//         const list = await ActivityAPI.list(customerId, govId);
//         setActivities(list);
//       }
//       setLastWasSuccess(false);
//     }
//   };

//   /** submit */
//   const onSubmit = async () => {
//     if (!editing) return;
//     if (!validateForm()) return;

//     setSubmitting(true);
//     setLastWasSuccess(false);
//     try {
//       const res = await ActivityAPI.update(editing.id, buildUpdatePayload(editing));
//       const msg = res?.message || "Activity updated successfully.";
//       setLastWasSuccess(true);
//       showPopup("success", msg);
//       // keep loading overlay until popup is closed by user
//     } catch (e: any) {
//       const msg =
//         e?.response?.data?.message ||
//         (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join("\n") : "") ||
//         "Update failed.";
//       setLastWasSuccess(false);
//       showPopup("error", msg);
//       // overlay stays; will be removed when user closes popup
//     }
//   };

//   /** UI helpers */
//   const getStatusIcon = (s: Status) =>
//     s === "completed" ? (
//       <CheckCircle className="w-4 h-4 text-green-600" />
//     ) : s === "overdue" ? (
//       <AlertCircle className="w-4 h-4 text-red-600" />
//     ) : (
//       <Clock className="w-4 h-4 text-gray-600" />
//     );

//   const statusBadge = (s: Status) =>
//     (
//       {
//         completed: "bg-green-100 text-green-800",
//         "in-progress": "bg-blue-100 text-blue-800",
//         pending: "bg-yellow-100 text-yellow-800",
//         overdue: "bg-red-100 text-red-800",
//       } as Record<string, string>
//     )[s] ?? "bg-gray-100 text-gray-800";

//   const priorityText = (p: Priority) =>
//     (
//       { high: "text-red-600", medium: "text-yellow-600", low: "text-green-600" } as Record<
//         string,
//         string
//       >
//     )[p] ?? "text-gray-600";

//   const filtered = useMemo(() => activities, [activities]);

//   return (
//     <div className="p-6 space-y-6">
//       {/* Global popup for success/failure */}
//       <PopupMessages
//         open={popupOpen}
//         kind={popupKind}
//         message={popupMessage}
//         onClose={handlePopupClose}
//         actions={[{ label: "OK", onClick: handlePopupClose }]}
//       />

//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold text-gray-800">View / Edit Activities</h2>
//       </div>

//       {customerId == null || govId == null ? (
//         <div className="text-gray-500">Loading account…</div>
//       ) : loading ? (
//         <div>Loading…</div>
//       ) : error ? (
//         <div className="text-red-600">{error}</div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {filtered.map((a) => (
//             <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-6">
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   {getStatusIcon(a.status)}
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">{a.activityTitle}</h3>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(a.status)}`}>
//                       {String(a.status).replace("-", " ")}
//                     </span>
//                   </div>
//                 </div>
//                 <span className={`text-sm font-medium ${priorityText(a.priority)}`}>
//                   {a.priority} priority
//                 </span>
//               </div>

//               <p className="text-gray-600 text-sm mb-4">{a.activityDescr}</p>

//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="text-gray-500">Doer Role:</span>
//                   <div className="font-medium text-gray-800">{a.doerRole || "-"}</div>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Frequency:</span>
//                   <div className="font-medium text-gray-800">{a.frequency || "-"}</div>
//                 </div>
//               </div>

//               <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
//                 <button
//                   onClick={() => openEdit(a)}
//                   className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
//                 >
//                   <Pencil className="w-4 h-4" /> Edit
//                 </button>
//               </div>
//             </div>
//           ))}
//           {filtered.length === 0 && <div className="text-gray-500">No activities found.</div>}
//         </div>
//       )}

//       {/* EDIT MODAL */}
//       {showModal && editing && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl w-full max-w-3xl mx-4 overflow-hidden relative">
//             {/* overlay while submitting */}
//             {submitting && (
//               <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
//                 <div className="flex items-center gap-2 text-gray-700">
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   <span>Saving…</span>
//                 </div>
//               </div>
//             )}

//             <div className="px-6 py-4 bg-gray-100 flex items-center justify-between">
//               <h3 className="font-semibold">Edit Activity</h3>
//               <button onClick={closeModal} className="text-gray-600 hover:text-gray-800" disabled={submitting}>
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Activity Name */}
//               <div>
//                 <label className="block text-sm mb-1">Activity Name *</label>
//                 <input
//                   disabled={submitting}
//                   value={form.activityTitle || ""}
//                   onChange={(e) => setForm({ ...form, activityTitle: e.target.value })}
//                   className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
//                 />
//               </div>

//               {/* Activity Description */}
//               <div>
//                 <label className="block text-sm mb-1">Activity Description *</label>
//                 <textarea
//                   disabled={submitting}
//                   value={form.activityDescr || ""}
//                   onChange={(e) => setForm({ ...form, activityDescr: e.target.value })}
//                   className="w-full border rounded px-3 py-2 h-[88px] disabled:bg-gray-100"
//                 />
//               </div>

//               {/* Doer Role */}
//               <div>
//                 <label className="block text-sm mb-1">Doer Role *</label>
//                 <select
//                   disabled={submitting}
//                   value={String(form.doerRoleId ?? 0)}
//                   onChange={(e) => setForm({ ...form, doerRoleId: Number(e.target.value) || 0 })}
//                   className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
//                 >
//                   <option value="0">Select Doer Role</option>
//                   {lookupsLoading && <option disabled>Loading...</option>}
//                   {doerOpts.map((o) => (
//                     <option key={o.id} value={String(o.id)}>
//                       {o.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Duration */}
//               <div>
//                 <label className="block text-sm mb-1">Duration *</label>
//                 <input
//                   disabled={submitting}
//                   type="number"
//                   min={1}
//                   value={form.duration ?? 0}
//                   onChange={(e) => setForm({ ...form, duration: Number(e.target.value) || 0 })}
//                   className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
//                 />
//               </div>

//               {/* Approver Role */}
//               <div>
//                 <label className="block text-sm mb-1">Approver Role *</label>
//                 <select
//                   disabled={submitting}
//                   value={String(form.approverRoleId ?? 0)}
//                   onChange={(e) => setForm({ ...form, approverRoleId: Number(e.target.value) || 0 })}
//                   className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
//                 >
//                   <option value="0">Select Approver Role</option>
//                   {lookupsLoading && <option disabled>Loading...</option>}
//                   {approverOpts.map((o) => (
//                     <option key={o.id} value={String(o.id)}>
//                       {o.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Frequency */}
//               <div>
//                 <label className="block text-sm mb-1">Frequency *</label>
//                 <select
//                   disabled={submitting}
//                   value={String(form.frequencyId ?? 0)}
//                   onChange={(e) => setForm({ ...form, frequencyId: Number(e.target.value) || 0 })}
//                   className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
//                 >
//                   <option value="0">Select Frequency</option>
//                   {lookupsLoading && <option disabled>Loading...</option>}
//                   {freqOpts.map((o) => (
//                     <option key={o.id} value={String(o.id)}>
//                       {o.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Status */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm mb-2">Status</label>
//                 <div className="flex items-center gap-6">
//                   <label className="inline-flex items-center gap-2">
//                     <input
//                       type="radio"
//                       name="active"
//                       disabled={submitting}
//                       checked={!!form.active}
//                       onChange={() => setForm({ ...form, active: true })}
//                     />
//                     <span>Active</span>
//                   </label>
//                   <label className="inline-flex items-center gap-2">
//                     <input
//                       type="radio"
//                       name="active"
//                       disabled={submitting}
//                       checked={!form.active}
//                       onChange={() => setForm({ ...form, active: false })}
//                     />
//                     <span>Inactive</span>
//                   </label>
//                 </div>
//               </div>
//             </div>

//             <div className="px-6 py-4 bg-gray-100 flex justify-end gap-3">
//               <button
//                 onClick={closeModal}
//                 disabled={submitting}
//                 className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-60"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={onSubmit}
//                 disabled={submitting}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 inline-flex items-center gap-2"
//               >
//                 {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
//                 {submitting ? "Saving…" : "Submit"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Activities;



import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityAPI,
  ActivityItem,
  LookupOption,
  Priority,
  Status,
} from "../../services/activityService";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Pencil,
  Loader2,
  LayoutGrid,
  List as ListIcon,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PopupMessages, { PopupKind } from "../popups/PopupMessages.tsx";
import { useAuth } from "../../context/AuthContext";

/** helpers */
const nm = (s?: string) => (s ?? "").trim().toLowerCase();
const idFromName = (opts: LookupOption[], name?: string) =>
  opts.find((o) => nm(o.name) === nm(name))?.id ?? 0;
const resolveId = (existingId?: number, existingName?: string, opts: LookupOption[] = []) =>
  existingId && existingId > 0 ? existingId : idFromName(opts, existingName) || (opts[0]?.id ?? 0);

type ViewMode = "cards" | "list";

export const Activities: React.FC = () => {
  // Role-based access control
  const { selectedRole, isClientAdmin } = useAuth();
  const canEditActivities =
    Boolean(isClientAdmin) ||
    Boolean(selectedRole?.name?.toLowerCase().includes('client admin'));

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<number | undefined>();
  const [govId, setGovId] = useState<number | undefined>();

  // --- NEW: view toggle (persisted) ---
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const v = sessionStorage.getItem("activities:viewMode");
    return v === "list" || v === "cards" ? v : "cards";
  });
  const setMode = (m: ViewMode) => {
    setViewMode(m);
    sessionStorage.setItem("activities:viewMode", m);
  };

  // --- NEW: search query (persisted) ---
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return sessionStorage.getItem("activities:searchQuery") ?? "";
  });
  const onSearch = (val: string) => {
    setSearchQuery(val);
    sessionStorage.setItem("activities:searchQuery", val);
    // Reset to first page whenever search changes
    setPage(1);
  };

  // --- NEW: pagination state (persisted) ---
  const [page, setPage] = useState<number>(() => {
    const p = Number(sessionStorage.getItem("activities:page") ?? 1);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    const ps = Number(sessionStorage.getItem("activities:pageSize") ?? 10);
    const allowed = [5, 10, 20, 50];
    return allowed.includes(ps) ? ps : 10;
  });
  const persistPage = (p: number) => sessionStorage.setItem("activities:page", String(p));
  const persistPageSize = (ps: number) => sessionStorage.setItem("activities:pageSize", String(ps));

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ActivityItem | null>(null);

  // lookups
  const [doerOpts, setDoerOpts] = useState<LookupOption[]>([]);
  const [approverOpts, setApproverOpts] = useState<LookupOption[]>([]);
  const [freqOpts, setFreqOpts] = useState<LookupOption[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);

  // submit state + popup
  const [submitting, setSubmitting] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupKind, setPopupKind] = useState<PopupKind>("info");
  const [popupMessage, setPopupMessage] = useState<string | string[]>("Operation completed.");
  const [lastWasSuccess, setLastWasSuccess] = useState<boolean>(false);

  // form
  const [form, setForm] = useState<{
    activityTitle?: string;
    activityDescr?: string;
    doerRoleId?: number;
    approverRoleId?: number;
    frequencyId?: number;
    duration?: number;
    active?: boolean;
  }>({ active: true });

  // avoid duplicate initial fetch in Strict Mode (dev)
  const loadedOnce = useRef(false);

  /** read IDs from sessionStorage */
  useEffect(() => {
    try {
      const userRaw = sessionStorage.getItem("userDetails");
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u?.customerId != null) setCustomerId(Number(u.customerId));
      }
      const g1 = sessionStorage.getItem("govId");
      const g2 = sessionStorage.getItem("govid");
      const roleRaw = sessionStorage.getItem("roleDetails");
      if (g1) setGovId(Number(g1));
      else if (g2) setGovId(Number(g2));
      else if (roleRaw) {
        const r = JSON.parse(roleRaw);
        if (r?.govId != null) setGovId(Number(r.govId));
        else if (r?.govid != null) setGovId(Number(r.govid));
      }
    } catch {}
  }, []);

  /** load list once IDs exist */
  useEffect(() => {
    if (customerId == null || govId == null) return;
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await ActivityAPI.list(customerId, govId);
        setActivities(list);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to fetch activities");
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, govId]);

  /** open modal and load lookups */
  const openEdit = async (a: ActivityItem) => {
    if (customerId == null || govId == null) return;

    setEditing(a);
    setShowModal(true);
    setForm({
      activityTitle: a.activityTitle,
      activityDescr: a.activityDescr,
      doerRoleId: a.doerRoleId,
      approverRoleId: a.approverRoleId,
      frequencyId: a.frequencyId,
      duration: a.duration,
      active: !!a.active,
    });

    setLookupsLoading(true);
    try {
      const [doers, approvers, freqs] = await Promise.all([
        ActivityAPI.doerRoles(customerId, govId),
        ActivityAPI.approverRoles(customerId, govId),
        ActivityAPI.frequencies(customerId, govId),
      ]);
      setDoerOpts(doers);
      setApproverOpts(approvers);
      setFreqOpts(freqs);

      setForm((prev) => ({
        ...prev,
        doerRoleId: resolveId(prev.doerRoleId, a.doerRole, doers),
        approverRoleId: resolveId(prev.approverRoleId, a.approverRole, approvers),
        frequencyId: resolveId(prev.frequencyId, a.frequency, freqs),
      }));
    } finally {
      setLookupsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setDoerOpts([]);
    setApproverOpts([]);
    setFreqOpts([]);
    setSubmitting(false);
  };

  /** build payload */
  const buildUpdatePayload = (base: ActivityItem) => {
    const doerId = Number(form.doerRoleId ?? base.doerRoleId ?? 0);
    const apprId = Number(form.approverRoleId ?? base.approverRoleId ?? 0);
    const freqId = Number(form.frequencyId ?? base.frequencyId ?? 0);
    const duration = Number(form.duration ?? base.duration ?? 0);

    return {
      customerId,
      govId,
      standardId: Number(base.standardId ?? 1),
      activityTitle: form.activityTitle ?? base.activityTitle,
      activityDescr: form.activityDescr ?? base.activityDescr,
      doerRole: doerId,
      doerRoleId: doerId,
      approverRole: apprId,
      approverRoleId: apprId,
      frequencyId: freqId,
      duration,
      active: Boolean(form.active ?? base.active ?? true),
      isActive: Boolean(form.active ?? base.active ?? true),
      auditable: base.auditable ?? true,
      isApplicable: base.isApplicable ?? true,
      justification: base.justification ?? "",
    };
  };

  const validateForm = () => {
    if (!form.activityTitle?.trim() || !form.activityDescr?.trim()) {
      showPopup("error", "Activity Name and Description are required.");
      return false;
    }
    if (!form.doerRoleId || form.doerRoleId <= 0) {
      showPopup("error", "Please select a Doer Role.");
      return false;
    }
    if (!form.approverRoleId || form.approverRoleId <= 0) {
      showPopup("error", "Please select an Approver Role.");
      return false;
    }
    if (!form.frequencyId || form.frequencyId <= 0) {
      showPopup("error", "Please select a Frequency.");
      return false;
    }
    if (form.duration == null || Number(form.duration) <= 0) {
      showPopup("error", "Please enter a valid Duration (> 0).");
      return false;
    }
    return true;
  };

  /** popup helpers */
  const showPopup = (kind: PopupKind, message: string | string[]) => {
    setPopupKind(kind);
    setPopupMessage(message);
    setPopupOpen(true);
  };
  const handlePopupClose = async () => {
    setPopupOpen(false);
    setSubmitting(false);
    if (lastWasSuccess) {
      closeModal();
      if (customerId != null && govId != null) {
        const list = await ActivityAPI.list(customerId, govId);
        setActivities(list);
      }
      setLastWasSuccess(false);
    }
  };

  /** UI helpers */
  const getStatusIcon = (s: Status) =>
    s === "completed" ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : s === "overdue" ? (
      <AlertCircle className="w-4 h-4 text-red-600" />
    ) : (
      <Clock className="w-4 h-4 text-gray-600" />
    );

  const statusBadge = (s: Status) =>
    (
      {
        completed: "bg-green-100 text-green-800",
        "in-progress": "bg-blue-100 text-blue-800",
        pending: "bg-yellow-100 text-yellow-800",
        overdue: "bg-red-100 text-red-800",
      } as Record<string, string>
    )[s] ?? "bg-gray-100 text-gray-800";

  const priorityText = (p: Priority) =>
    (
      { high: "text-red-600", medium: "text-yellow-600", low: "text-green-600" } as Record<
        string,
        string
      >
    )[p] ?? "text-gray-600";

  // --- NEW: filtered view using activity name only ---
  const filtered = useMemo(() => {
    const q = nm(searchQuery);
    if (!q) return activities;
    return activities.filter((a) => nm(a.activityTitle).includes(q));
  }, [activities, searchQuery]);

  // --- NEW: derive page counts and slice ---
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
      persistPage(safePage);
    }
  }, [safePage]);
  const start = (safePage - 1) * pageSize;
  const end = Math.min(start + pageSize, filtered.length);
  const pageItems = filtered.slice(start, end);

  const PageBar: React.FC = () => (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-2">
      <div className="text-sm text-gray-600">
        Showing <span className="font-medium">{filtered.length === 0 ? 0 : start + 1}-{end}</span> of {filtered.length}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Rows per page</label>
        <select
          value={pageSize}
          onChange={(e) => {
            const ps = Number(e.target.value) || 10;
            setPageSize(ps);
            persistPageSize(ps);
            setPage(1);
            persistPage(1);
          }}
          className="border rounded-md px-2 py-1 text-sm"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <div className="inline-flex border rounded-md overflow-hidden">
          <button
            onClick={() => { const p = Math.max(1, safePage - 1); setPage(p); persistPage(p); }}
            className="px-2 py-1 disabled:opacity-50"
            disabled={safePage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 text-sm min-w-[4rem] text-center select-none">
            {safePage} / {totalPages}
          </div>
          <button
            onClick={() => { const p = Math.min(totalPages, safePage + 1); setPage(p); persistPage(p); }}
            className="px-2 py-1 disabled:opacity-50"
            disabled={safePage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Global popup for success/failure */}
      <PopupMessages
        open={popupOpen}
        kind={popupKind}
        message={popupMessage}
        onClose={handlePopupClose}
        actions={[{ label: "OK", onClick: handlePopupClose }]}
      />

      {/* Header: title + SEARCH + toggle */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">View / Edit Activities</h2>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative flex-1 md:w-80">
            <SearchIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by activity name…"
              className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="inline-flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setMode("cards")}
              className={`px-3 py-2 flex items-center gap-2 text-sm ${viewMode === "cards" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
              title="Cards"
            >
              <LayoutGrid className="w-4 h-4" />
              Cards
            </button>
            <button
              onClick={() => setMode("list")}
              className={`px-3 py-2 flex items-center gap-2 text-sm border-l border-gray-300 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"}`}
              title="List"
            >
              <ListIcon className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {customerId == null || govId == null ? (
        <div className="text-gray-500">Loading account…</div>
      ) : loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">
          No activities found{searchQuery ? ` for “${searchQuery}”.` : "."}
        </div>
      ) : viewMode === "cards" ? (
        /* ---------------- CARDS VIEW ---------------- */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pageItems.map((a) => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(a.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{a.activityTitle}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(a.status)}`}
                      >
                        {String(a.status).replace("-", " ")}
                      </span>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${priorityText(a.priority)}`}>
                    {a.priority} priority
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{a.activityDescr}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Doer Role:</span>
                    <div className="font-medium text-gray-800">{a.doerRole || "-"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Frequency:</span>
                    <div className="font-medium text-gray-800">{a.frequency || "-"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  {canEditActivities && (
                  <button
                    onClick={() => openEdit(a)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 mt-4">
            <PageBar />
          </div>
        </>
      ) : (
        /* ---------------- LIST (TABLE) VIEW ---------------- */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-semibold">
                  <th className="w-[34%]">Activity</th>
                  <th className="w-[14%]">Status</th>
                  <th className="w-[16%]">Doer Role</th>
                  <th className="w-[16%]">Frequency</th>
                  <th className="w-[12%]">Priority</th>
                  <th className="w-[8%] text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pageItems.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{a.activityTitle}</span>
                        <span className="text-gray-500 line-clamp-1">{a.activityDescr}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${statusBadge(
                          a.status
                        )}`}
                      >
                        {String(a.status).replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{a.doerRole || "-"}</td>
                    <td className="px-4 py-3 text-gray-900">{a.frequency || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${priorityText(a.priority)}`}>
                        {a.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 pr-6 text-right">
                      {canEditActivities && (
                      <button
                        onClick={() => openEdit(a)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t p-3">
            <PageBar />
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showModal && editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl mx-4 overflow-hidden relative">
            {/* overlay while submitting */}
            {submitting && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex items-center gap-2 text-gray-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving…</span>
                </div>
              </div>
            )}

            <div className="px-6 py-4 bg-gray-100 flex items-center justify-between">
              <h3 className="font-semibold">Edit Activity</h3>
              <button onClick={closeModal} className="text-gray-600 hover:text-gray-800" disabled={submitting}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Activity Name */}
              <div>
                <label className="block text-sm mb-1">Activity Name *</label>
                <input
                  disabled={submitting}
                  value={form.activityTitle || ""}
                  onChange={(e) => setForm({ ...form, activityTitle: e.target.value })}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Activity Description */}
              <div>
                <label className="block text-sm mb-1">Activity Description *</label>
                <textarea
                  disabled={submitting}
                  value={form.activityDescr || ""}
                  onChange={(e) => setForm({ ...form, activityDescr: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-[88px] disabled:bg-gray-100"
                />
              </div>

              {/* Doer Role */}
              <div>
                <label className="block text-sm mb-1">Doer Role *</label>
                <select
                  disabled={submitting}
                  value={String(form.doerRoleId ?? 0)}
                  onChange={(e) => setForm({ ...form, doerRoleId: Number(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="0">Select Doer Role</option>
                  {lookupsLoading && <option disabled>Loading...</option>}
                  {doerOpts.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm mb-1">Duration *</label>
                <input
                  disabled={submitting}
                  type="number"
                  min={1}
                  value={form.duration ?? 0}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                />
              </div>

              {/* Approver Role */}
              <div>
                <label className="block text-sm mb-1">Approver Role *</label>
                <select
                  disabled={submitting}
                  value={String(form.approverRoleId ?? 0)}
                  onChange={(e) => setForm({ ...form, approverRoleId: Number(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="0">Select Approver Role</option>
                  {lookupsLoading && <option disabled>Loading...</option>}
                  {approverOpts.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm mb-1">Frequency *</label>
                <select
                  disabled={submitting}
                  value={String(form.frequencyId ?? 0)}
                  onChange={(e) => setForm({ ...form, frequencyId: Number(e.target.value) || 0 })}
                  className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="0">Select Frequency</option>
                  {lookupsLoading && <option disabled>Loading...</option>}
                  {freqOpts.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-2">Status</label>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="active"
                      disabled={submitting}
                      checked={!!form.active}
                      onChange={() => setForm({ ...form, active: true })}
                    />
                    <span>Active</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="active"
                      disabled={submitting}
                      checked={!form.active}
                      onChange={() => setForm({ ...form, active: false })}
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editing) return;
                  if (!validateForm()) return;
                  setSubmitting(true);
                  setLastWasSuccess(false);
                  try {
                    const res = await ActivityAPI.update(editing.id, buildUpdatePayload(editing));
                    const msg = res?.message || "Activity updated successfully.";
                    setLastWasSuccess(true);
                    showPopup("success", msg);
                  } catch (e: any) {
                    const msg =
                      e?.response?.data?.message ||
                      (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join("\n") : "") ||
                      "Update failed.";
                    setLastWasSuccess(false);
                    showPopup("error", msg);
                  }
                }}
                disabled={submitting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Saving…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;

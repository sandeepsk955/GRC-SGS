



// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Calendar, Shield, PlusCircle, Eye, FileText, AlertTriangle,
//   CheckCircle, Clock, Search, Filter, X, History,
// } from "lucide-react";

// /* ------------ ENDPOINTS ------------ */
// const API_BASE = "/api";
// const GET_PERIODS = (customerId: number, govId: number) =>
//   `${API_BASE}/CompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
// const GET_LICENSES = (customerId: number, govId: number) =>
//   `${API_BASE}/LookUp/GetLicensesForCompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
// const GET_GUIDANCE = (licenseId: number) =>
//   `${API_BASE}/LookUp/compliananceperiodforguidence?LicenseId=${licenseId}`;
// const POST_PERIOD = `${API_BASE}/CompliancePeriod`;

// // 🔧 Add/adjust these to match your backend
// const PUT_PERIOD = (id: number) => `${API_BASE}/CompliancePeriod/${id}`; // PUT to update dates
// const CLOSE_PERIOD = (id: number) => `${API_BASE}/CompliancePeriod/${id}/close`; // POST to close (or switch to PUT)
// const POST_ASSIGNMENT = `${API_BASE}/Assignments`; // POST new assignment (adjust path if different)

// const DEFAULT_CUSTOMER_ID = 4;
// const DEFAULT_GOV_ID = 2;

// /**
//  * Utility: normalize API shapes
//  */
// type ApiResp<T> = { data: T; message?: string|null; statusCode?: number; errors?: any[] } | T;
// const arr = <T,>(raw: ApiResp<T[]>): T[] => Array.isArray(raw) ? raw : Array.isArray((raw as any)?.data) ? (raw as any).data : [];
// const todayISO = () => new Date().toISOString().slice(0,10);
// const parseISO = (s: string) => new Date(`${s}T00:00:00`);

// /**
//  * API row types (loose, because backend sometimes changes casing)
//  */
// type PeriodRow = {
//   id: number; standardname: string; standardId: number; governancename: string;
//   complStartDate: string; complEndDate: string; isOpen: boolean; isActive: boolean;
// };

// type LicenseRow = {
//   licenseLookupId: number;
//   governanceName?: string;
//   standardName?: string;
//   // Accept a few possible standard id key variants
//   standardId?: number;
//   standardID?: number;
//   standardid?: number;
//   standardMasterId?: number;
//   // sometimes the dates are nested
//   licenseDates?: { startDate: string; endDate: string };
//   startDate?: string;
//   endDate?: string;
// };

// type Guidance = {
//   licenseDates: { startDate: string; endDate: string };
//   lastCompliancePeriod: { startDate?: string|null; endDate?: string|null; isActive: boolean; isOpen: boolean };
//   estimatedCompliancePeriod: { startDate: string; endDate: string };
// };

// type UiPeriod = {
//   id: string; name: string; description: string; startDate: string; endDate: string;
//   status: "active" | "closed"; domain: string; progress: number; tasksTotal: number; tasksCompleted: number;
// };

// type UiLicense = {
//   id: string;
//   standard: string;
//   description: string;
//   expiryDate?: string;
//   /** canonical standard id to POST */
//   standardId?: number;
// };

// export const Configuration: React.FC = () => {
//   const [activeSection, setActiveSection] = useState("periods");

//   /* lists */
//   const [periods, setPeriods] = useState<UiPeriod[]>([]);
//   const [loadingPeriods, setLoadingPeriods] = useState(false);
//   const [periodsError, setPeriodsError] = useState("");

//   const [licenses, setLicenses] = useState<UiLicense[]>([]);
//   const [loadingLicenses, setLoadingLicenses] = useState(false);
//   const [licensesError, setLicensesError] = useState("");

//   /* form */
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [selectedLicense, setSelectedLicense] = useState<string>("");
//   const [formData, setFormData] = useState({ name: "", description: "", startDate: "", endDate: "" });

//   /* dialogs */
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showConflictModal, setShowConflictModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   /* guidance */
//   const [guidance, setGuidance] = useState<Guidance | null>(null);
//   const [loadingGuidance, setLoadingGuidance] = useState(false);

//   /* 🚀 new: per-period actions (edit / assignment / close) */
//   const [activePeriod, setActivePeriod] = useState<UiPeriod | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showCloseModal, setShowCloseModal] = useState(false);

//   const [editData, setEditData] = useState({ startDate: "", endDate: "" });
//   const [assignData, setAssignData] = useState({ title: "", dueDate: "", assignee: "", notes: "" });
//   const [closeNote, setCloseNote] = useState("");

//   const [savingEdit, setSavingEdit] = useState(false);
//   const [savingAssign, setSavingAssign] = useState(false);
//   const [closingPeriod, setClosingPeriod] = useState(false);

//   const customerId = DEFAULT_CUSTOMER_ID;
//   const govId = DEFAULT_GOV_ID;

//   /* -------- GET periods -------- */
//   const mapPeriods = (rows: PeriodRow[]): UiPeriod[] =>
//     rows.map(r => ({
//       id: String(r.id),
//       name: (r as any).standardname || (r as any).standardName || "Compliance Period",
//       description: (r as any).governancename ? `${(r as any).governancename} compliance period` : "",
//       startDate: (r as any).complStartDate,
//       endDate: (r as any).complEndDate,
//       status: (r as any).isOpen ? "active" : "closed",
//       domain: (r as any).governancename || "General",
//       progress: (r as any).isActive ? 65 : 100,
//       tasksTotal: 0,
//       tasksCompleted: 0,
//     }));

//   const fetchPeriods = async () => {
//     setLoadingPeriods(true); setPeriodsError("");
//     try {
//       const res = await fetch(GET_PERIODS(customerId, govId), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       setPeriods(mapPeriods(arr<PeriodRow>(raw)));
//     } catch (e: any) {
//       setPeriodsError(e?.message || "Failed to load compliance periods"); setPeriods([]);
//     } finally { setLoadingPeriods(false); }
//   };

//   /* -------- GET licenses -------- */
//   const normalizeStandardId = (r: LicenseRow): number | undefined =>
//     r.standardId ?? r.standardID ?? r.standardid ?? r.standardMasterId;

//   const mapLicenses = (rows: LicenseRow[]): UiLicense[] =>
//     rows.map(r => ({
//       id: String(r.licenseLookupId),
//       standard: r.standardName || "-",
//       description: r.governanceName ? `${r.governanceName} - ${r.standardName}` : (r.standardName || ""),
//       expiryDate: r.licenseDates?.endDate || r.endDate,
//       standardId: normalizeStandardId(r),
//     }));

//   const fetchLicenses = async () => {
//     setLoadingLicenses(true); setLicensesError("");
//     try {
//       const res = await fetch(GET_LICENSES(customerId, govId), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       const list = mapLicenses(arr<LicenseRow>(raw));
//       setLicenses(list);
//     } catch (e: any) {
//       setLicensesError(e?.message || "Failed to load licenses"); setLicenses([]);
//     } finally { setLoadingLicenses(false); }
//   };

//   useEffect(() => { fetchPeriods(); fetchLicenses(); /* eslint-disable-next-line */ }, [customerId, govId]);

//   const hasAnyActive = useMemo(() => periods.some(p => p.status === "active"), [periods]);

//   /* -------- GET guidance for chosen license -------- */
//   const fetchGuidance = async (licenseId: number) => {
//     setLoadingGuidance(true); setGuidance(null);
//     try {
//       const res = await fetch(GET_GUIDANCE(licenseId), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       const rows = arr<Guidance>(raw);
//       if (!rows.length) throw new Error("No guidance returned for this license");
//       setGuidance(rows[0]);
//     } catch (e: any) {
//       setGuidance(null); setErrorMessage(e?.message || "Failed to load license guidance"); setShowErrorModal(true);
//     } finally { setLoadingGuidance(false); }
//   };

//   const handleLicenseSelect = (licenseId: string) => {
//     setSelectedLicense(licenseId);
//     setShowCreateForm(true);
//     setFormData({ name: "", description: "", startDate: "", endDate: "" });
//     if (licenseId) fetchGuidance(parseInt(licenseId, 10));
//   };

//   /* -------- Angular-like validations -------- */
//   const validateDates = (): string | null => {
//     if (!guidance) return "License guidance not loaded yet.";
//     const s = formData.startDate ? parseISO(formData.startDate) : null;
//     const e = formData.endDate ? parseISO(formData.endDate) : null;
//     const licS = parseISO(guidance.licenseDates.startDate);
//     const licE = parseISO(guidance.licenseDates.endDate);
//     if (!s) return "Start date is required.";
//     if (!e) return "End date is required.";
//     if (s < licS) return `Choose start date ≥ ${guidance.licenseDates.startDate}`;
//     if (guidance.lastCompliancePeriod.endDate) {
//       const lastEnd = parseISO(guidance.lastCompliancePeriod.endDate);
//       if (s < lastEnd) return `Choose start date ≥ ${guidance.lastCompliancePeriod.endDate}`;
//     }
//     if (s < parseISO(todayISO())) return "Start date should be on or after today's date.";
//     if (e <= s) return "End date should be after Start Date.";
//     if (e > licE) return `Choose end date ≤ ${guidance.licenseDates.endDate}`;
//     return null;
//   };

//   /* -------- helpers -------- */
//   const findStandardIdForSelected = (): number | null => {
//     const lic = licenses.find(l => l.id === selectedLicense);
//     return lic?.standardId ?? null;
//   };

//   /* -------- POST create -------- */
//   const createCompliancePeriod = async (closeExisting: boolean) => {
//     setIsSubmitting(true);
//     try {
//       const standardId = findStandardIdForSelected();
//       if (!standardId || standardId <= 0) {
//         throw new Error("Selected license is missing a valid standardId. Please re-load licenses or contact admin.");
//       }

//       const body = {
//         standardId, // ✅ NEVER 0 now
//         complStartDate: formData.startDate,
//         complEndDate: formData.endDate,
//         customerId,
//         govid: govId,
//         licenseId: parseInt(selectedLicense || "0", 10),
//         canClosePrevCompliancePeriod: !!closeExisting,
//       };

//       const res = await fetch(POST_PERIOD, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

//       const ct = res.headers.get("content-type") || "";
//       const payload = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       if (payload?.statusCode && payload.statusCode !== 200)
//         throw new Error(payload.message || "Failed to create compliance period");

//       setShowSuccessModal(true);
//       setShowConflictModal(false);
//       await fetchPeriods();
//     } catch (e: any) {
//       setErrorMessage(e?.message || "Failed to create compliance period");
//       setShowErrorModal(true);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const submitForm = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedLicense) { setErrorMessage("Please select a license first."); setShowErrorModal(true); return; }
//     const err = validateDates();
//     if (err) { setErrorMessage(err); setShowErrorModal(true); return; }
//     const activeOpen = guidance?.lastCompliancePeriod?.isActive && guidance?.lastCompliancePeriod?.isOpen;
//     if (activeOpen || hasAnyActive) { setShowConflictModal(true); return; }
//     void createCompliancePeriod(false);
//   };

//   /* ---- FIX: buttons call this; type="button" prevents form submit ---- */
//   const handleConflictResolution = (action: "close" | "keep") => {
//     if (isSubmitting) return;
//     void createCompliancePeriod(action === "close");
//   };

//   const onSuccessAction = () => {
//     setShowSuccessModal(false);
//     setShowCreateForm(false);
//     setSelectedLicense("");
//     setFormData({ name: "", description: "", startDate: "", endDate: "" });
//     setGuidance(null);
//   };

//   const statusCls = (s: string) =>
//     s === "active" ? "bg-green-100 text-green-800" :
//     s === "closed" ? "bg-gray-100 text-gray-800" :
//     s === "planned" ? "bg-blue-100 text-blue-800" :
//     s === "expired" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800";

//   const statusIcon = (s: string) =>
//     s === "active" ? <CheckCircle className="w-4 h-4 text-green-600" /> :
//     s === "closed" ? <CheckCircle className="w-4 h-4 text-gray-600" /> :
//     s === "planned" ? <Calendar className="w-4 h-4 text-blue-600" /> :
//     s === "expired" ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-gray-600" />;

//   const history = (() => {
//     if (!guidance) return [] as any[];
//     const h: any[] = [];
//     if (guidance.lastCompliancePeriod.startDate || guidance.lastCompliancePeriod.endDate) {
//       h.push({
//         id: "last",
//         name: "Previous Compliance Period",
//         startDate: guidance.lastCompliancePeriod.startDate || "-",
//         endDate: guidance.lastCompliancePeriod.endDate || "-",
//         status: guidance.lastCompliancePeriod.isOpen ? "active" : "closed",
//       });
//     }
//     h.push({
//       id: "est",
//       name: "Estimated Next Period",
//       startDate: guidance.estimatedCompliancePeriod.startDate,
//       endDate: guidance.estimatedCompliancePeriod.endDate,
//       status: "planned",
//     });
//     return h;
//   })();

//   /* =============== Per-period actions =============== */
//   const openEditPeriod = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setEditData({ startDate: p.startDate, endDate: p.endDate });
//     setShowEditModal(true);
//   };

//   const openCreateAssignment = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setAssignData({ title: "", dueDate: "", assignee: "", notes: "" });
//     setShowAssignModal(true);
//   };

//   const openClosePeriod = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setCloseNote("");
//     setShowCloseModal(true);
//   };

//   const saveEditPeriod = async () => {
//     if (!activePeriod) return;
//     if (!editData.startDate || !editData.endDate) {
//       setErrorMessage("Please pick both Start and End dates.");
//       setShowEditModal(false); setShowErrorModal(true); return;
//     }
//     if (parseISO(editData.endDate) <= parseISO(editData.startDate)) {
//       setErrorMessage("End date must be after Start date.");
//       setShowEditModal(false); setShowErrorModal(true); return;
//     }
//     setSavingEdit(true);
//     try {
//       const id = parseInt(activePeriod.id, 10);
//       const body = {
//         complStartDate: editData.startDate,
//         complEndDate: editData.endDate,
//         customerId,
//         govid: govId,
//       };
//       const res = await fetch(PUT_PERIOD(id), {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       setShowEditModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowEditModal(false);
//       setErrorMessage(e?.message || "Failed to update period");
//       setShowErrorModal(true);
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   const createAssignment = async () => {
//     if (!activePeriod) return;
//     if (!assignData.title || !assignData.dueDate) {
//       setErrorMessage("Please enter a title and due date for the assignment.");
//       setShowAssignModal(false); setShowErrorModal(true); return;
//     }
//     setSavingAssign(true);
//     try {
//       const body = {
//         periodId: parseInt(activePeriod.id, 10),
//         title: assignData.title,
//         dueDate: assignData.dueDate,
//         assignee: assignData.assignee || null,
//         notes: assignData.notes || null,
//         customerId,
//         govid: govId,
//       };
//       const res = await fetch(POST_ASSIGNMENT, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       setShowAssignModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowAssignModal(false);
//       setErrorMessage(e?.message || "Failed to create assignment");
//       setShowErrorModal(true);
//     } finally {
//       setSavingAssign(false);
//     }
//   };

//   const confirmClosePeriod = async () => {
//     if (!activePeriod) return;
//     setClosingPeriod(true);
//     try {
//       const id = parseInt(activePeriod.id, 10);
//       const res = await fetch(CLOSE_PERIOD(id), {
//         method: "POST", // switch to PUT if your API prefers it
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({ note: closeNote || null, customerId, govid: govId }),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       setShowCloseModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowCloseModal(false);
//       setErrorMessage(e?.message || "Failed to close period");
//       setShowErrorModal(true);
//     } finally {
//       setClosingPeriod(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {/* header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration</h2>
//           <p className="text-gray-600">Manage compliance periods, licenses, and system configuration</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
//             <PlusCircle className="w-4 h-4" /> Create Audit
//           </button>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
//             onClick={() => setShowCreateForm(true)}
//           >
//             <PlusCircle className="w-4 h-4" /> New Period
//           </button>
//         </div>
//       </div>

//       {/* tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           {[
//             { id: "periods", label: "Compliance Periods", icon: Calendar },
//             { id: "licenses", label: "View/Manage License", icon: Shield },
//             { id: "audits", label: "Internal Audits", icon: FileText },
//             { id: "internal-audits", label: "Create Internal Audit", icon: PlusCircle },
//           ].map(t => (
//             <button
//               key={t.id}
//               onClick={() => setActiveSection(t.id)}
//               className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
//                 activeSection === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               <t.icon className="w-4 h-4" /> {t.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* periods page */}
//       {activeSection === "periods" && (
//         <div className="space-y-6">
//           {/* choose license */}
//           {!showCreateForm && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Compliance Period</h3>
//               <p className="text-gray-600 mb-6">Select a license to create a new compliance period</p>
//               {loadingLicenses && <div className="text-sm text-gray-600">Loading licenses…</div>}
//               {licensesError && <div className="text-sm text-red-600">{licensesError}</div>}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {licenses.map(lic => (
//                   <button
//                     key={lic.id}
//                     onClick={() => handleLicenseSelect(lic.id)}
//                     className="text-left p-4 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
//                   >
//                     <div className="flex items-center gap-3 mb-2">
//                       <Shield className="w-6 h-6 text-blue-600" />
//                       <div>
//                         <h4 className="font-medium text-gray-800">{lic.standard}</h4>
//                         <p className="text-sm text-gray-600">{lic.description}</p>
//                         {lic.standardId ? (
//                           <p className="text-xs text-gray-500 mt-1">Standard ID: {lic.standardId}</p>
//                         ) : (
//                           <p className="text-xs text-amber-600 mt-1">Standard ID missing</p>
//                         )}
//                       </div>
//                     </div>
//                     {lic.expiryDate && <div className="text-xs text-gray-500">Valid until: {lic.expiryDate}</div>}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* create form */}
//           {showCreateForm && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">Create Compliance Period</h3>
//                   <p className="text-gray-600">License: {licenses.find(l => l.id === selectedLicense)?.standard || "-"}</p>
//                 </div>
//                 <button onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
//                         className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div>
//                   <form onSubmit={submitForm} className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Period Name *</label>
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="e.g., Q1 2024 Compliance Review"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                       <textarea
//                         value={formData.description}
//                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         rows={3}
//                         placeholder="Brief description of this compliance period"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
//                         <input
//                           type="date"
//                           value={formData.startDate}
//                           min={guidance?.licenseDates.startDate || todayISO()}
//                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           required
//                         />
//                         {guidance?.lastCompliancePeriod?.endDate && (
//                           <p className="text-xs text-gray-500 mt-1">Must be ≥ {guidance.lastCompliancePeriod.endDate}</p>
//                         )}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
//                         <input
//                           type="date"
//                           value={formData.endDate}
//                           max={guidance?.licenseDates.endDate || undefined}
//                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           required
//                         />
//                         {guidance?.licenseDates?.endDate && (
//                           <p className="text-xs text-gray-500 mt-1">Must be ≤ {guidance.licenseDates.endDate}</p>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3 pt-4">
//                       <button
//                         type="submit"
//                         disabled={isSubmitting || loadingGuidance}
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                       >
//                         {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlusCircle className="w-4 h-4" />}
//                         {isSubmitting ? "Creating..." : "Create Period"}
//                       </button>
//                       <button type="button"
//                         onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
//                         className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 </div>

//                 {/* history from guidance */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <History className="w-5 h-5 text-gray-600" />
//                     <h4 className="font-medium text-gray-800">Period History</h4>
//                   </div>
//                   {loadingGuidance && <div className="text-sm text-gray-600">Loading guidance…</div>}
//                   {!loadingGuidance && (
//                     <div className="space-y-3">
//                       {history.length === 0 && <div className="text-sm text-gray-600">No history to show.</div>}
//                       {history.map((p: any) => (
//                         <div key={p.id} className="p-3 border border-gray-200 rounded-lg">
//                           <div className="flex items-center justify-between mb-2">
//                             <h5 className="font-medium text-gray-800">{p.name}</h5>
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCls(p.status)}`}>{p.status}</span>
//                           </div>
//                           <div className="text-sm text-gray-600">{p.startDate} to {p.endDate}</div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* quick actions + list (unchanged) */}
//           {!showCreateForm && (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 {[
//                   { icon: PlusCircle, label: "Create Period", color: "blue" },
//                   { icon: Eye, label: "View/Edit Period", color: "green" },
//                   { icon: FileText, label: "Create Assignment", color: "purple" },
//                   { icon: AlertTriangle, label: "Close Period", color: "red" },
//                 ].map((a, i) => (
//                   <button key={i} className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-colors text-left">
//                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                       a.color === "blue" ? "bg-blue-100" :
//                       a.color === "green" ? "bg-green-100" :
//                       a.color === "purple" ? "bg-purple-100" : "bg-red-100"}`}>
//                       <a.icon className={`w-5 h-5 ${
//                         a.color === "blue" ? "text-blue-600" :
//                         a.color === "green" ? "text-green-600" :
//                         a.color === "purple" ? "text-purple-600" : "text-red-600"}`} />
//                     </div>
//                     <span className="font-medium text-gray-800">{a.label}</span>
//                   </button>
//                 ))}
//               </div>

//               <div className="bg-white rounded-xl border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold text-gray-800">Active Compliance Periods</h3>
//                     <div className="flex items-center gap-3">
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Search periods..."
//                           className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                         />
//                       </div>
//                       <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                         <Filter className="w-4 h-4" />
//                         <span className="text-sm">Filter</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 space-y-4">
//                   {loadingPeriods && <div className="text-sm text-gray-600">Loading…</div>}
//                   {!loadingPeriods && periodsError && <div className="text-sm text-red-600">Failed to load periods: {periodsError}</div>}
//                   {!loadingPeriods && !periodsError && periods.length === 0 && <div className="text-sm text-gray-600">No compliance periods found.</div>}

//                   {periods.map(p => (
//                     <div key={p.id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-start gap-3 mb-4">
//                         {statusIcon(p.status)}
//                         <div>
//                           <h4 className="text-lg font-medium text-gray-800">{p.name}</h4>
//                           {p.description && <p className="text-gray-600 text-sm mt-1">{p.description}</p>}
//                           <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusCls(p.status)}`}>{p.status}</span>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 md-grid-cols-4 md:grid-cols-4 gap-4 text-sm">
//                         <div><span className="text-gray-500">Domain:</span><div className="font-medium text-gray-800">{p.domain}</div></div>
//                         <div><span className="text-gray-500">Start Date:</span><div className="font-medium text-gray-800">{p.startDate}</div></div>
//                         <div><span className="text-gray-500">End Date:</span><div className="font-medium text-gray-800">{p.endDate}</div></div>
//                         <div><span className="text-gray-500">Tasks:</span><div className="font-medium text-gray-800">{p.tasksCompleted}/{p.tasksTotal}</div></div>
//                       </div>

//                       {/* action buttons row */}
//                       <div className="mt-4 flex flex-wrap gap-3">
//                         <button
//                           type="button"
//                           onClick={() => openEditPeriod(p)}
//                           className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
//                         >
//                           Edit Period
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => openCreateAssignment(p)}
//                           className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
//                         >
//                           Create Assignment
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => openClosePeriod(p)}
//                           className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium"
//                           disabled={p.status !== 'active'}
//                         >
//                           Close Period
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {/* Error Modal */}
//       {showErrorModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Validation / Error</h3>
//             </div>
//             <p className="text-gray-600 mb-6">{errorMessage}</p>
//             <div className="flex justify-end">
//               <button type="button" onClick={() => setShowErrorModal(false)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
//                 OK
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Conflict Modal */}
//       {showConflictModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-yellow-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Alert!</h3>
//             </div>
//             <div className="mb-6">
//               <p className="text-gray-600 mb-2">You already have a compliance period that is Active.</p>
//               <p className="text-gray-600">Would you like to close the compliance period and create a new one?</p>
//               <p className="text-sm text-gray-500 mt-2">(Keep Open will make the older compliance period inactive.)</p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => handleConflictResolution("close")}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
//               >
//                 {isSubmitting ? "Processing..." : "Close & Create"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleConflictResolution("keep")}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
//               >
//                 {isSubmitting ? "Processing..." : "Keep Open & Create"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Compliance Period Created</h3>
//             </div>
//             <div className="mb-6">
//               <p className="text-gray-600 mb-2">Your compliance period has been created successfully.</p>
//               <p className="text-gray-600">Create Activity Assignments now?</p>
//             </div>
//             <div className="flex gap-3">
//               <button type="button" onClick={onSuccessAction}
//                 className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">Close</button>
//               <button type="button" onClick={onSuccessAction}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">Yes</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= Modals for per-period actions ================= */}

//       {/* Edit Period Modal */}
//       {showEditModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-800">Edit Period</h3>
//               <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">{activePeriod.name} • {activePeriod.domain}</p>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//                 <input type="date" value={editData.startDate} onChange={(e)=>setEditData(d=>({...d,startDate:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//                 <input type="date" value={editData.endDate} onChange={(e)=>setEditData(d=>({...d,endDate:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
//               </div>
//             </div>
//             <div className="flex gap-3 justify-end mt-6">
//               <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button type="button" onClick={saveEditPeriod} disabled={savingEdit}
//                 className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
//                 {savingEdit ? "Saving…" : "Save changes"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Assignment Modal */}
//       {showAssignModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-800">Create Assignment</h3>
//               <button onClick={() => setShowAssignModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">For period: {activePeriod.name}</p>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
//                 <input type="text" value={assignData.title} onChange={(e)=>setAssignData(d=>({...d,title:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Review evidence for Control A" />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
//                   <input type="date" value={assignData.dueDate} onChange={(e)=>setAssignData(d=>({...d,dueDate:e.target.value}))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
//                   <input type="text" value={assignData.assignee} onChange={(e)=>setAssignData(d=>({...d,assignee:e.target.value}))}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="name or email" />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//                 <textarea value={assignData.notes} onChange={(e)=>setAssignData(d=>({...d,notes:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} placeholder="Optional context" />
//               </div>
//             </div>
//             <div className="flex gap-3 justify-end mt-6">
//               <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button type="button" onClick={createAssignment} disabled={savingAssign}
//                 className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
//                 {savingAssign ? "Creating…" : "Create Assignment"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Close Period Modal */}
//       {showCloseModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Close Period</h3>
//             </div>
//             <p className="text-gray-600 mb-2">This will mark <span className="font-medium text-gray-800">{activePeriod.name}</span> as closed and prevent new assignments.</p>
//             <p className="text-sm text-gray-500 mb-4">You can add an optional closing note below.</p>
//             <textarea value={closeNote} onChange={(e)=>setCloseNote(e.target.value)} rows={3}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Optional note" />
//             <div className="flex gap-3 justify-end mt-6">
//               <button type="button" onClick={() => setShowCloseModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button type="button" onClick={confirmClosePeriod} disabled={closingPeriod}
//                 className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
//                 {closingPeriod ? "Closing…" : "Close Period"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default Configuration;




// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Calendar, Shield, PlusCircle, Eye, FileText, AlertTriangle,
//   CheckCircle, Clock, Search, Filter, X, History,
// } from "lucide-react";

// /* ------------ ENDPOINTS ------------ */
// const API_BASE = "/api";
// const GET_PERIODS = (customerId: number, govId: number) =>
//   `${API_BASE}/CompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
// const GET_LICENSES = (customerId: number, govId: number) =>
//   `${API_BASE}/LookUp/GetLicensesForCompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
// const GET_GUIDANCE = (licenseId: number) =>
//   `${API_BASE}/LookUp/compliananceperiodforguidence?LicenseId=${licenseId}`;
// const POST_PERIOD = `${API_BASE}/CompliancePeriod`;

// // 🔧 Add/adjust these to match your backend
// const PUT_PERIOD = (id: number) => `${API_BASE}/CompliancePeriod/${id}`; // PUT to update dates
// const CLOSE_PERIOD = (id: number) => `${API_BASE}/CompliancePeriod/${id}/close`; // POST to close (or switch to PUT)
// const POST_ASSIGNMENT = `${API_BASE}/Assignments`; // POST new assignment (adjust path if different)

// /**
//  * Utility: normalize API shapes
//  */
// type ApiResp<T> = { data: T; message?: string|null; statusCode?: number; errors?: any[] } | T;
// const arr = <T,>(raw: ApiResp<T[]>): T[] => Array.isArray(raw) ? raw : Array.isArray((raw as any)?.data) ? (raw as any).data : [];
// const todayISO = () => new Date().toISOString().slice(0,10);
// const parseISO = (s: string) => new Date(`${s}T00:00:00`);

// /**
//  * API row types (loose, because backend sometimes changes casing)
//  */
// type PeriodRow = {
//   id: number; standardname: string; standardId: number; governancename: string;
//   complStartDate: string; complEndDate: string; isOpen: boolean; isActive: boolean;
// };

// type LicenseRow = {
//   licenseLookupId: number;
//   governanceName?: string;
//   standardName?: string;
//   // Accept a few possible standard id key variants
//   standardId?: number;
//   standardID?: number;
//   standardid?: number;
//   standardMasterId?: number;
//   // sometimes the dates are nested
//   licenseDates?: { startDate: string; endDate: string };
//   startDate?: string;
//   endDate?: string;
// };

// type Guidance = {
//   licenseDates: { startDate: string; endDate: string };
//   lastCompliancePeriod: { startDate?: string|null; endDate?: string|null; isActive: boolean; isOpen: boolean };
//   estimatedCompliancePeriod: { startDate: string; endDate: string };
// };

// type UiPeriod = {
//   id: string; name: string; description: string; startDate: string; endDate: string;
//   status: "active" | "closed"; domain: string; progress: number; tasksTotal: number; tasksCompleted: number;
// };

// type UiLicense = {
//   id: string;
//   standard: string;
//   description: string;
//   expiryDate?: string;
//   /** canonical standard id to POST */
//   standardId?: number;
// };

// export const Configuration: React.FC = () => {
//   const [activeSection, setActiveSection] = useState("periods");

//   // 🔹 IDs from login + domain selection (session/local storage)
//   const [customerId, setCustomerId] = useState<number | null>(null);
//   const [govId, setGovId] = useState<number | null>(null);

//   /* lists */
//   const [periods, setPeriods] = useState<UiPeriod[]>([]);
//   const [loadingPeriods, setLoadingPeriods] = useState(false);
//   const [periodsError, setPeriodsError] = useState("");

//   const [licenses, setLicenses] = useState<UiLicense[]>([]);
//   const [loadingLicenses, setLoadingLicenses] = useState(false);
//   const [licensesError, setLicensesError] = useState("");

//   /* form */
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [selectedLicense, setSelectedLicense] = useState<string>("");
//   const [formData, setFormData] = useState({ name: "", description: "", startDate: "", endDate: "" });

//   /* dialogs */
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showConflictModal, setShowConflictModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   /* guidance */
//   const [guidance, setGuidance] = useState<Guidance | null>(null);
//   const [loadingGuidance, setLoadingGuidance] = useState(false);

//   /* 🚀 new: per-period actions (edit / assignment / close) */
//   const [activePeriod, setActivePeriod] = useState<UiPeriod | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showCloseModal, setShowCloseModal] = useState(false);

//   const [editData, setEditData] = useState({ startDate: "", endDate: "" });
//   const [assignData, setAssignData] = useState({ title: "", dueDate: "", assignee: "", notes: "" });
//   const [closeNote, setCloseNote] = useState("");

//   const [savingEdit, setSavingEdit] = useState(false);
//   const [savingAssign, setSavingAssign] = useState(false);
//   const [closingPeriod, setClosingPeriod] = useState(false);

//   // Bootstrap IDs from storage once
//   useEffect(() => {
//     const cid = Number(sessionStorage.getItem("customerId") ?? localStorage.getItem("customerId"));
//     const gid = Number(sessionStorage.getItem("govId") ?? localStorage.getItem("govId"));
//     setCustomerId(Number.isFinite(cid) && cid > 0 ? cid : null);
//     setGovId(Number.isFinite(gid) && gid > 0 ? gid : null);
//   }, []);

//   // Helper: ensure IDs exist before API calls
//   const requireIdsOrThrow = () => {
//     if (customerId == null || govId == null) {
//       throw new Error("Missing Customer or Governance selection. Please login and select a domain.");
//     }
//     return { cid: customerId, gid: govId };
//   };

//   /* -------- GET periods -------- */
//   const mapPeriods = (rows: PeriodRow[]): UiPeriod[] =>
//     rows.map(r => ({
//       id: String(r.id),
//       name: (r as any).standardname || (r as any).standardName || "Compliance Period",
//       description: (r as any).governancename ? `${(r as any).governancename} compliance period` : "",
//       startDate: (r as any).complStartDate,
//       endDate: (r as any).complEndDate,
//       status: (r as any).isOpen ? "active" : "closed",
//       domain: (r as any).governancename || "General",
//       progress: (r as any).isActive ? 65 : 100,
//       tasksTotal: 0,
//       tasksCompleted: 0,
//     }));

//   const fetchPeriods = async () => {
//     setLoadingPeriods(true); setPeriodsError("");
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const res = await fetch(GET_PERIODS(cid, gid), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       setPeriods(mapPeriods(arr<PeriodRow>(raw)));
//     } catch (e: any) {
//       setPeriodsError(e?.message || "Failed to load compliance periods"); setPeriods([]);
//     } finally { setLoadingPeriods(false); }
//   };

//   /* -------- GET licenses -------- */
//   const normalizeStandardId = (r: LicenseRow): number | undefined =>
//     r.standardId ?? r.standardID ?? r.standardid ?? r.standardMasterId;

//   const mapLicenses = (rows: LicenseRow[]): UiLicense[] =>
//     rows.map(r => ({
//       id: String(r.licenseLookupId),
//       standard: r.standardName || "-",
//       description: r.governanceName ? `${r.governanceName} - ${r.standardName}` : (r.standardName || ""),
//       expiryDate: r.licenseDates?.endDate || r.endDate,
//       standardId: normalizeStandardId(r),
//     }));

//   const fetchLicenses = async () => {
//     setLoadingLicenses(true); setLicensesError("");
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const res = await fetch(GET_LICENSES(cid, gid), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       const list = mapLicenses(arr<LicenseRow>(raw));
//       setLicenses(list);
//     } catch (e: any) {
//       setLicensesError(e?.message || "Failed to load licenses"); setLicenses([]);
//     } finally { setLoadingLicenses(false); }
//   };

//   // Fetch only when both IDs are present
//   useEffect(() => {
//     if (customerId && govId) {
//       fetchPeriods();
//       fetchLicenses();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [customerId, govId]);

//   const hasAnyActive = useMemo(() => periods.some(p => p.status === "active"), [periods]);

//   /* -------- GET guidance for chosen license -------- */
//   const fetchGuidance = async (licenseId: number) => {
//     setLoadingGuidance(true); setGuidance(null);
//     try {
//       const res = await fetch(GET_GUIDANCE(licenseId), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       const rows = arr<Guidance>(raw);
//       if (!rows.length) throw new Error("No guidance returned for this license");
//       setGuidance(rows[0]);
//     } catch (e: any) {
//       setGuidance(null); setErrorMessage(e?.message || "Failed to load license guidance"); setShowErrorModal(true);
//     } finally { setLoadingGuidance(false); }
//   };

//   const handleLicenseSelect = (licenseId: string) => {
//     setSelectedLicense(licenseId);
//     setShowCreateForm(true);
//     setFormData({ name: "", description: "", startDate: "", endDate: "" });
//     if (licenseId) fetchGuidance(parseInt(licenseId, 10));
//   };

//   /* -------- Angular-like validations -------- */
//   const validateDates = (): string | null => {
//     if (!guidance) return "License guidance not loaded yet.";
//     const s = formData.startDate ? parseISO(formData.startDate) : null;
//     const e = formData.endDate ? parseISO(formData.endDate) : null;
//     const licS = parseISO(guidance.licenseDates.startDate);
//     const licE = parseISO(guidance.licenseDates.endDate);
//     if (!s) return "Start date is required.";
//     if (!e) return "End date is required.";
//     if (s < licS) return `Choose start date ≥ ${guidance.licenseDates.startDate}`;
//     if (guidance.lastCompliancePeriod.endDate) {
//       const lastEnd = parseISO(guidance.lastCompliancePeriod.endDate);
//       if (s < lastEnd) return `Choose start date ≥ ${guidance.lastCompliancePeriod.endDate}`;
//     }
//     if (s < parseISO(todayISO())) return "Start date should be on or after today's date.";
//     if (e <= s) return "End date should be after Start Date.";
//     if (e > licE) return `Choose end date ≤ ${guidance.licenseDates.endDate}`;
//     return null;
//   };

//   /* -------- helpers -------- */
//   const findStandardIdForSelected = (): number | null => {
//     const lic = licenses.find(l => l.id === selectedLicense);
//     return lic?.standardId ?? null;
//   };

//   /* -------- POST create -------- */
//   const createCompliancePeriod = async (closeExisting: boolean) => {
//     setIsSubmitting(true);
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const standardId = findStandardIdForSelected();
//       if (!standardId || standardId <= 0) {
//         throw new Error("Selected license is missing a valid standardId. Please re-load licenses or contact admin.");
//       }

//       const body = {
//         standardId, // ✅ NEVER 0 now
//         complStartDate: formData.startDate,
//         complEndDate: formData.endDate,
//         customerId: cid,
//         govid: gid,
//         licenseId: parseInt(selectedLicense || "0", 10),
//         canClosePrevCompliancePeriod: !!closeExisting,
//       };

//       const res = await fetch(POST_PERIOD, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

//       const ct = res.headers.get("content-type") || "";
//       const payload = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       if (payload?.statusCode && payload.statusCode !== 200)
//         throw new Error(payload.message || "Failed to create compliance period");

//       setShowSuccessModal(true);
//       setShowConflictModal(false);
//       await fetchPeriods();
//     } catch (e: any) {
//       setErrorMessage(e?.message || "Failed to create compliance period");
//       setShowErrorModal(true);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const submitForm = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedLicense) { setErrorMessage("Please select a license first."); setShowErrorModal(true); return; }
//     const err = validateDates();
//     if (err) { setErrorMessage(err); setShowErrorModal(true); return; }
//     const activeOpen = guidance?.lastCompliancePeriod?.isActive && guidance?.lastCompliancePeriod?.isOpen;
//     if (activeOpen || hasAnyActive) { setShowConflictModal(true); return; }
//     void createCompliancePeriod(false);
//   };

//   /* ---- FIX: buttons call this; type="button" prevents form submit ---- */
//   const handleConflictResolution = (action: "close" | "keep") => {
//     if (isSubmitting) return;
//     void createCompliancePeriod(action === "close");
//   };

//   const onSuccessAction = () => {
//     setShowSuccessModal(false);
//     setShowCreateForm(false);
//     setSelectedLicense("");
//     setFormData({ name: "", description: "", startDate: "", endDate: "" });
//     setGuidance(null);
//   };

//   const statusCls = (s: string) =>
//     s === "active" ? "bg-green-100 text-green-800" :
//     s === "closed" ? "bg-gray-100 text-gray-800" :
//     s === "planned" ? "bg-blue-100 text-blue-800" :
//     s === "expired" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800";

//   const statusIcon = (s: string) =>
//     s === "active" ? <CheckCircle className="w-4 h-4 text-green-600" /> :
//     s === "closed" ? <CheckCircle className="w-4 h-4 text-gray-600" /> :
//     s === "planned" ? <Calendar className="w-4 h-4 text-blue-600" /> :
//     s === "expired" ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-gray-600" />;

//   const history = (() => {
//     if (!guidance) return [] as any[];
//     const h: any[] = [];
//     if (guidance.lastCompliancePeriod.startDate || guidance.lastCompliancePeriod.endDate) {
//       h.push({
//         id: "last",
//         name: "Previous Compliance Period",
//         startDate: guidance.lastCompliancePeriod.startDate || "-",
//         endDate: guidance.lastCompliancePeriod.endDate || "-",
//         status: guidance.lastCompliancePeriod.isOpen ? "active" : "closed",
//       });
//     }
//     h.push({
//       id: "est",
//       name: "Estimated Next Period",
//       startDate: guidance.estimatedCompliancePeriod.startDate,
//       endDate: guidance.estimatedCompliancePeriod.endDate,
//       status: "planned",
//     });
//     return h;
//   })();

//   /* =============== Per-period actions =============== */
//   const openEditPeriod = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setEditData({ startDate: p.startDate, endDate: p.endDate });
//     setShowEditModal(true);
//   };

//   const openCreateAssignment = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setAssignData({ title: "", dueDate: "", assignee: "", notes: "" });
//     setShowAssignModal(true);
//   };

//   const openClosePeriod = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setCloseNote("");
//     setShowCloseModal(true);
//   };

//   const saveEditPeriod = async () => {
//     if (!activePeriod) return;
//     if (!editData.startDate || !editData.endDate) {
//       setErrorMessage("Please pick both Start and End dates.");
//       setShowEditModal(false); setShowErrorModal(true); return;
//     }
//     if (parseISO(editData.endDate) <= parseISO(editData.startDate)) {
//       setErrorMessage("End date must be after Start date.");
//       setShowEditModal(false); setShowErrorModal(true); return;
//     }
//     setSavingEdit(true);
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const id = parseInt(activePeriod.id, 10);
//       const body = {
//         complStartDate: editData.startDate,
//         complEndDate: editData.endDate,
//         customerId: cid,
//         govid: gid,
//       };
//       const res = await fetch(PUT_PERIOD(id), {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       setShowEditModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowEditModal(false);
//       setErrorMessage(e?.message || "Failed to update period");
//       setShowErrorModal(true);
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   const createAssignment = async () => {
//   if (!activePeriod) return;
//   setSavingAssign(true);
//   try {
//     const { cid, gid } = requireIdsOrThrow();

//     // Payload to match old screen: only dates + linkage to period/customer/gov
//     const body = {
//       periodId: parseInt(activePeriod.id, 10),
//       complStartDate: activePeriod.startDate,
//       complEndDate: activePeriod.endDate,
//       customerId: cid,
//       govid: gid,
//     };

//     const res = await fetch(POST_ASSIGNMENT, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Accept: "application/json" },
//       body: JSON.stringify(body),
//     });
//     if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

//     setShowAssignModal(false);
//     setActivePeriod(null);
//     await fetchPeriods();
//   } catch (e: any) {
//     setShowAssignModal(false);
//     setErrorMessage(e?.message || "Failed to create assignment");
//     setShowErrorModal(true);
//   } finally {
//     setSavingAssign(false);
//   }
// };


//   const confirmClosePeriod = async () => {
//     if (!activePeriod) return;
//     setClosingPeriod(true);
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const id = parseInt(activePeriod.id, 10);
//       const res = await fetch(CLOSE_PERIOD(id), {
//         method: "POST", // switch to PUT if your API prefers it
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({ note: closeNote || null, customerId: cid, govid: gid }),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       setShowCloseModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowCloseModal(false);
//       setErrorMessage(e?.message || "Failed to close period");
//       setShowErrorModal(true);
//     } finally {
//       setClosingPeriod(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {(!customerId || !govId) && (
//         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg">
//           Please login and select a governance domain to view configuration.
//         </div>
//       )}

//       {/* header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration</h2>
//           <p className="text-gray-600">Manage compliance periods, licenses, and system configuration</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
//             <PlusCircle className="w-4 h-4" /> Create Audit
//           </button>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
//             onClick={() => setShowCreateForm(true)}
//           >
//             <PlusCircle className="w-4 h-4" /> New Period
//           </button>
//         </div>
//       </div>

//       {/* tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           {[
//             { id: "periods", label: "Compliance Periods", icon: Calendar },
//             { id: "licenses", label: "View/Manage License", icon: Shield },
//             { id: "audits", label: "Internal Audits", icon: FileText },
//             { id: "internal-audits", label: "Create Internal Audit", icon: PlusCircle },
//           ].map(t => (
//             <button
//               key={t.id}
//               onClick={() => setActiveSection(t.id)}
//               className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
//                 activeSection === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               <t.icon className="w-4 h-4" /> {t.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* periods page */}
//       {activeSection === "periods" && (
//         <div className="space-y-6">
//           {/* choose license */}
//           {!showCreateForm && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Compliance Period</h3>
//               <p className="text-gray-600 mb-6">Select a license to create a new compliance period</p>
//               {loadingLicenses && <div className="text-sm text-gray-600">Loading licenses…</div>}
//               {licensesError && <div className="text-sm text-red-600">{licensesError}</div>}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {licenses.map(lic => (
//                   <button
//                     key={lic.id}
//                     onClick={() => handleLicenseSelect(lic.id)}
//                     className="text-left p-4 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
//                   >
//                     <div className="flex items-center gap-3 mb-2">
//                       <Shield className="w-6 h-6 text-blue-600" />
//                       <div>
//                         <h4 className="font-medium text-gray-800">{lic.standard}</h4>
//                         <p className="text-sm text-gray-600">{lic.description}</p>
//                         {lic.standardId ? (
//                           <p className="text-xs text-gray-500 mt-1">Standard ID: {lic.standardId}</p>
//                         ) : (
//                           <p className="text-xs text-amber-600 mt-1">Standard ID missing</p>
//                         )}
//                       </div>
//                     </div>
//                     {lic.expiryDate && <div className="text-xs text-gray-500">Valid until: {lic.expiryDate}</div>}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* create form */}
//           {showCreateForm && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">Create Compliance Period</h3>
//                   <p className="text-gray-600">License: {licenses.find(l => l.id === selectedLicense)?.standard || "-"}</p>
//                 </div>
//                 <button onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
//                         className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div>
//                   <form onSubmit={submitForm} className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Period Name *</label>
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="e.g., Q1 2024 Compliance Review"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                       <textarea
//                         value={formData.description}
//                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         rows={3}
//                         placeholder="Brief description of this compliance period"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
//                         <input
//                           type="date"
//                           value={formData.startDate}
//                           min={guidance?.licenseDates.startDate || todayISO()}
//                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           required
//                         />
//                         {guidance?.lastCompliancePeriod?.endDate && (
//                           <p className="text-xs text-gray-500 mt-1">Must be ≥ {guidance.lastCompliancePeriod.endDate}</p>
//                         )}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
//                         <input
//                           type="date"
//                           value={formData.endDate}
//                           max={guidance?.licenseDates.endDate || undefined}
//                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           required
//                         />
//                         {guidance?.licenseDates?.endDate && (
//                           <p className="text-xs text-gray-500 mt-1">Must be ≤ {guidance.licenseDates.endDate}</p>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3 pt-4">
//                       <button
//                         type="submit"
//                         disabled={isSubmitting || loadingGuidance}
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                       >
//                         {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlusCircle className="w-4 h-4" />}
//                         {isSubmitting ? "Creating..." : "Create Period"}
//                       </button>
//                       <button type="button"
//                         onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
//                         className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 </div>

//                 {/* history from guidance */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <History className="w-5 h-5 text-gray-600" />
//                     <h4 className="font-medium text-gray-800">Period History</h4>
//                   </div>
//                   {loadingGuidance && <div className="text-sm text-gray-600">Loading guidance…</div>}
//                   {!loadingGuidance && (
//                     <div className="space-y-3">
//                       {history.length === 0 && <div className="text-sm text-gray-600">No history to show.</div>}
//                       {history.map((p: any) => (
//                         <div key={p.id} className="p-3 border border-gray-200 rounded-lg">
//                           <div className="flex items-center justify-between mb-2">
//                             <h5 className="font-medium text-gray-800">{p.name}</h5>
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCls(p.status)}`}>{p.status}</span>
//                           </div>
//                           <div className="text-sm text-gray-600">{p.startDate} to {p.endDate}</div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* quick actions + list */}
//           {!showCreateForm && (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 {[
//                   { icon: PlusCircle, label: "Create Period", color: "blue" },
//                   { icon: Eye, label: "View/Edit Period", color: "green" },
//                   { icon: FileText, label: "Create Assignment", color: "purple" },
//                   { icon: AlertTriangle, label: "Close Period", color: "red" },
//                 ].map((a, i) => (
//                   <button key={i} className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-colors text-left">
//                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                       a.color === "blue" ? "bg-blue-100" :
//                       a.color === "green" ? "bg-green-100" :
//                       a.color === "purple" ? "bg-purple-100" : "bg-red-100"}`}>
//                       <a.icon className={`w-5 h-5 ${
//                         a.color === "blue" ? "text-blue-600" :
//                         a.color === "green" ? "text-green-600" :
//                         a.color === "purple" ? "text-purple-600" : "text-red-600"}`} />
//                     </div>
//                     <span className="font-medium text-gray-800">{a.label}</span>
//                   </button>
//                 ))}
//               </div>

//               <div className="bg-white rounded-xl border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold text-gray-800">Active Compliance Periods</h3>
//                     <div className="flex items-center gap-3">
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Search periods..."
//                           className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                         />
//                       </div>
//                       <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                         <Filter className="w-4 h-4" />
//                         <span className="text-sm">Filter</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 space-y-4">
//                   {loadingPeriods && <div className="text-sm text-gray-600">Loading…</div>}
//                   {!loadingPeriods && periodsError && <div className="text-sm text-red-600">Failed to load periods: {periodsError}</div>}
//                   {!loadingPeriods && !periodsError && periods.length === 0 && <div className="text-sm text-gray-600">No compliance periods found.</div>}

//                   {periods.map(p => (
//                     <div key={p.id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-start gap-3 mb-4">
//                         {statusIcon(p.status)}
//                         <div>
//                           <h4 className="text-lg font-medium text-gray-800">{p.name}</h4>
//                           {p.description && <p className="text-gray-600 text-sm mt-1">{p.description}</p>}
//                           <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusCls(p.status)}`}>{p.status}</span>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 md-grid-cols-4 md:grid-cols-4 gap-4 text-sm">
//                         <div><span className="text-gray-500">Domain:</span><div className="font-medium text-gray-800">{p.domain}</div></div>
//                         <div><span className="text-gray-500">Start Date:</span><div className="font-medium text-gray-800">{p.startDate}</div></div>
//                         <div><span className="text-gray-500">End Date:</span><div className="font-medium text-gray-800">{p.endDate}</div></div>
//                         <div><span className="text-gray-500">Tasks:</span><div className="font-medium text-gray-800">{p.tasksCompleted}/{p.tasksTotal}</div></div>
//                       </div>

//                       {/* action buttons row */}
//                       <div className="mt-4 flex flex-wrap gap-3">
//                         <button
//                           type="button"
//                           onClick={() => openEditPeriod(p)}
//                           className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
//                         >
//                           Edit Period
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => openCreateAssignment(p)}
//                           className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
//                         >
//                           Create Assignment
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => openClosePeriod(p)}
//                           className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium"
//                           disabled={p.status !== 'active'}
//                         >
//                           Close Period
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {/* Error Modal */}
//       {showErrorModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Validation / Error</h3>
//             </div>
//             <p className="text-gray-600 mb-6">{errorMessage}</p>
//             <div className="flex justify-end">
//               <button type="button" onClick={() => setShowErrorModal(false)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
//                 OK
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Conflict Modal */}
//       {showConflictModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-yellow-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Alert!</h3>
//             </div>
//             <div className="mb-6">
//               <p className="text-gray-600 mb-2">You already have a compliance period that is Active.</p>
//               <p className="text-gray-600">Would you like to close the compliance period and create a new one?</p>
//               <p className="text-sm text-gray-500 mt-2">(Keep Open will make the older compliance period inactive.)</p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => handleConflictResolution("close")}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
//               >
//                 {isSubmitting ? "Processing..." : "Close & Create"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleConflictResolution("keep")}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
//               >
//                 {isSubmitting ? "Processing..." : "Keep Open & Create"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Compliance Period Created</h3>
//             </div>
//             <div className="mb-6">
//               <p className="text-gray-600 mb-2">Your compliance period has been created successfully.</p>
//               <p className="text-gray-600">Create Activity Assignments now?</p>
//             </div>
//             <div className="flex gap-3">
//               <button type="button" onClick={onSuccessAction}
//                 className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">Close</button>
//               <button type="button" onClick={onSuccessAction}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">Yes</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= Modals for per-period actions ================= */}

//       {/* Edit Period Modal */}
//       {showEditModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-800">Edit Period</h3>
//               <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">{activePeriod.name} • {activePeriod.domain}</p>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//                 <input type="date" value={editData.startDate} onChange={(e)=>setEditData(d=>({...d,startDate:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//                 <input type="date" value={editData.endDate} onChange={(e)=>setEditData(d=>({...d,endDate:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
//               </div>
//             </div>
//             <div className="flex gap-3 justify-end mt-6">
//               <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button type="button" onClick={saveEditPeriod} disabled={savingEdit}
//                 className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
//                 {savingEdit ? "Saving…" : "Save changes"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Assignment Modal (Angular fields only) */}
// {showAssignModal && activePeriod && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//     <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-lg font-semibold text-gray-800">Create Task</h3>
//         <button onClick={() => setShowAssignModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="space-y-6">
//         {/* Compliance/Standard display */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Compliance/Standard :</label>
//           <span className="text-gray-800 font-medium">{activePeriod.name}</span>
//         </div>

//         {/* Start Date (readonly) */}
//         <div>
//           <label htmlFor="complStartDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//           <input
//             id="complStartDate"
//             type="date"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
//             value={activePeriod.startDate || ""}
//             readOnly
//           />
//         </div>

//         {/* End Date (readonly) */}
//         <div>
//           <label htmlFor="complEndDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//           <input
//             id="complEndDate"
//             type="date"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
//             value={activePeriod.endDate || ""}
//             readOnly
//           />
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-2">
//           <button
//             type="button"
//             onClick={() => setShowAssignModal(false)}
//             className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={createAssignment}
//             disabled={savingAssign}
//             className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
//           >
//             {savingAssign ? "Submitting…" : "Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// )}


//       {/* Close Period Modal */}
//       {showCloseModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Close Period</h3>
//             </div>
//             <p className="text-gray-600 mb-2">This will mark <span className="font-medium text-gray-800">{activePeriod.name}</span> as closed and prevent new assignments.</p>
//             <p className="text-sm text-gray-500 mb-4">You can add an optional closing note below.</p>
//             <textarea value={closeNote} onChange={(e)=>setCloseNote(e.target.value)} rows={3}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Optional note" />
//             <div className="flex gap-3 justify-end mt-6">
//               <button type="button" onClick={() => setShowCloseModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button type="button" onClick={confirmClosePeriod} disabled={closingPeriod}
//                 className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
//                 {closingPeriod ? "Closing…" : "Close Period"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default Configuration;


// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Calendar, Shield, PlusCircle, Eye, FileText, AlertTriangle,
//   CheckCircle, Clock, Search, Filter, X, History,
// } from "lucide-react";

// /* ------------ ENDPOINTS ------------ */
// const API_BASE = "/api";
// const GET_PERIODS = (customerId: number, govId: number) =>
//   `${API_BASE}/CompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
// const GET_LICENSES = (customerId: number, govId: number) =>
//   `${API_BASE}/LookUp/GetLicensesForCompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
// const GET_GUIDANCE = (licenseId: number) =>
//   `${API_BASE}/LookUp/compliananceperiodforguidence?LicenseId=${licenseId}`;

// // ✅ real backend shapes
// const PUT_PERIOD_QS = (id: number) => `${API_BASE}/CompliancePeriod?ComplianceId=${id}`;
// const CREATE_ASSIGNMENTS_FOR_PERIOD = (customerId: number, complianceId: number) =>
//   `${API_BASE}/CompliancePeriod/CreateAssignmentsForComplincePeriod?CustomerId=${customerId}&ComplainceId=${complianceId}`;

// const POST_PERIOD = `${API_BASE}/CompliancePeriod`; // unchanged for creating a period

// /**
//  * Utility: normalize API shapes
//  */
// type ApiResp<T> = { data: T; message?: string|null; statusCode?: number; errors?: any[] } | T;
// const arr = <T,>(raw: ApiResp<T[]>): T[] => Array.isArray(raw) ? raw : Array.isArray((raw as any)?.data) ? (raw as any).data : [];
// const todayISO = () => new Date().toISOString().slice(0,10);
// const parseISO = (s: string) => new Date(`${s}T00:00:00`);

// /**
//  * API row types (loose, because backend sometimes changes casing)
//  */
// type PeriodRow = {
//   id: number; standardname: string; standardId: number; governancename: string;
//   complStartDate: string; complEndDate: string; isOpen: boolean; isActive: boolean;
// };

// type LicenseRow = {
//   licenseLookupId: number;
//   governanceName?: string;
//   standardName?: string;
//   standardId?: number; standardID?: number; standardid?: number; standardMasterId?: number;
//   licenseDates?: { startDate: string; endDate: string };
//   startDate?: string; endDate?: string;
// };

// type Guidance = {
//   licenseDates: { startDate: string; endDate: string };
//   lastCompliancePeriod: { startDate?: string|null; endDate?: string|null; isActive: boolean; isOpen: boolean };
//   estimatedCompliancePeriod: { startDate: string; endDate: string };
// };

// type UiPeriod = {
//   id: string; name: string; description: string; startDate: string; endDate: string;
//   status: "active" | "closed"; domain: string; progress: number; tasksTotal: number; tasksCompleted: number;
// };

// type UiLicense = {
//   id: string; standard: string; description: string; expiryDate?: string; standardId?: number;
// };

// export const Configuration: React.FC = () => {
//   const [activeSection, setActiveSection] = useState("periods");

//   // 🔹 IDs from login + domain selection (session/local storage)
//   const [customerId, setCustomerId] = useState<number | null>(null);
//   const [govId, setGovId] = useState<number | null>(null);

//   /* lists */
//   const [periods, setPeriods] = useState<UiPeriod[]>([]);
//   const [loadingPeriods, setLoadingPeriods] = useState(false);
//   const [periodsError, setPeriodsError] = useState("");

//   const [licenses, setLicenses] = useState<UiLicense[]>([]);
//   const [loadingLicenses, setLoadingLicenses] = useState(false);
//   const [licensesError, setLicensesError] = useState("");

//   /* form */
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [selectedLicense, setSelectedLicense] = useState<string>("");
//   const [formData, setFormData] = useState({ name: "", description: "", startDate: "", endDate: "" });

//   /* dialogs */
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showConflictModal, setShowConflictModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   /* guidance */
//   const [guidance, setGuidance] = useState<Guidance | null>(null);
//   const [loadingGuidance, setLoadingGuidance] = useState(false);

//   /* per-period actions */
//   const [activePeriod, setActivePeriod] = useState<UiPeriod | null>(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showCloseModal, setShowCloseModal] = useState(false);

//   const [editData, setEditData] = useState({ startDate: "", endDate: "" });
//   const [closeNote, setCloseNote] = useState("");

//   const [savingEdit, setSavingEdit] = useState(false);
//   const [savingAssign, setSavingAssign] = useState(false);
//   const [closingPeriod, setClosingPeriod] = useState(false);

//   // Bootstrap IDs from storage once
//   useEffect(() => {
//     const cid = Number(sessionStorage.getItem("customerId") ?? localStorage.getItem("customerId"));
//     const gid = Number(sessionStorage.getItem("govId") ?? localStorage.getItem("govId"));
//     setCustomerId(Number.isFinite(cid) && cid > 0 ? cid : null);
//     setGovId(Number.isFinite(gid) && gid > 0 ? gid : null);
//   }, []);

//   // Helper: ensure IDs exist before API calls
//   const requireIdsOrThrow = () => {
//     if (customerId == null || govId == null) {
//       throw new Error("Missing Customer or Governance selection. Please login and select a domain.");
//     }
//     return { cid: customerId, gid: govId };
//   };

//   /* -------- GET periods -------- */
//   const mapPeriods = (rows: PeriodRow[]): UiPeriod[] =>
//     rows.map(r => ({
//       id: String(r.id),
//       name: (r as any).standardname || (r as any).standardName || "Compliance Period",
//       description: (r as any).governancename ? `${(r as any).governancename} compliance period` : "",
//       startDate: (r as any).complStartDate,
//       endDate: (r as any).complEndDate,
//       status: (r as any).isOpen ? "active" : "closed",
//       domain: (r as any).governancename || "General",
//       progress: (r as any).isActive ? 65 : 100,
//       tasksTotal: 0,
//       tasksCompleted: 0,
//     }));

//   const fetchPeriods = async () => {
//     setLoadingPeriods(true); setPeriodsError("");
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const res = await fetch(GET_PERIODS(cid, gid), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       setPeriods(mapPeriods(arr<PeriodRow>(raw)));
//     } catch (e: any) {
//       setPeriodsError(e?.message || "Failed to load compliance periods"); setPeriods([]);
//     } finally { setLoadingPeriods(false); }
//   };

//   /* -------- GET licenses -------- */
//   const normalizeStandardId = (r: LicenseRow): number | undefined =>
//     r.standardId ?? r.standardID ?? r.standardid ?? r.standardMasterId;

//   const mapLicenses = (rows: LicenseRow[]): UiLicense[] =>
//     rows.map(r => ({
//       id: String(r.licenseLookupId),
//       standard: r.standardName || "-",
//       description: r.governanceName ? `${r.governanceName} - ${r.standardName}` : (r.standardName || ""),
//       expiryDate: r.licenseDates?.endDate || r.endDate,
//       standardId: normalizeStandardId(r),
//     }));

//   const fetchLicenses = async () => {
//     setLoadingLicenses(true); setLicensesError("");
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const res = await fetch(GET_LICENSES(cid, gid), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       const list = mapLicenses(arr<LicenseRow>(raw));
//       setLicenses(list);
//     } catch (e: any) {
//       setLicensesError(e?.message || "Failed to load licenses"); setLicenses([]);
//     } finally { setLoadingLicenses(false); }
//   };

//   // Fetch only when both IDs are present
//   useEffect(() => {
//     if (customerId && govId) {
//       fetchPeriods();
//       fetchLicenses();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [customerId, govId]);

//   const hasAnyActive = useMemo(() => periods.some(p => p.status === "active"), [periods]);

//   /* -------- GET guidance for chosen license -------- */
//   const fetchGuidance = async (licenseId: number) => {
//     setLoadingGuidance(true); setGuidance(null);
//     try {
//       const res = await fetch(GET_GUIDANCE(licenseId), { headers: { Accept: "application/json" } });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       const ct = res.headers.get("content-type") || "";
//       const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       const rows = arr<Guidance>(raw);
//       if (!rows.length) throw new Error("No guidance returned for this license");
//       setGuidance(rows[0]);
//     } catch (e: any) {
//       setGuidance(null); setErrorMessage(e?.message || "Failed to load license guidance"); setShowErrorModal(true);
//     } finally { setLoadingGuidance(false); }
//   };

//   const handleLicenseSelect = (licenseId: string) => {
//     setSelectedLicense(licenseId);
//     setShowCreateForm(true);
//     setFormData({ name: "", description: "", startDate: "", endDate: "" });
//     if (licenseId) fetchGuidance(parseInt(licenseId, 10));
//   };

//   /* -------- validations -------- */
//   const validateDates = (): string | null => {
//     if (!guidance) return "License guidance not loaded yet.";
//     const s = formData.startDate ? parseISO(formData.startDate) : null;
//     const e = formData.endDate ? parseISO(formData.endDate) : null;
//     const licS = parseISO(guidance.licenseDates.startDate);
//     const licE = parseISO(guidance.licenseDates.endDate);
//     if (!s) return "Start date is required.";
//     if (!e) return "End date is required.";
//     if (s < licS) return `Choose start date ≥ ${guidance.licenseDates.startDate}`;
//     if (guidance.lastCompliancePeriod.endDate) {
//       const lastEnd = parseISO(guidance.lastCompliancePeriod.endDate);
//       if (s < lastEnd) return `Choose start date ≥ ${guidance.lastCompliancePeriod.endDate}`;
//     }
//     if (s < parseISO(todayISO())) return "Start date should be on or after today's date.";
//     if (e <= s) return "End date should be after Start Date.";
//     if (e > licE) return `Choose end date ≤ ${guidance.licenseDates.endDate}`;
//     return null;
//   };

//   /* -------- helpers -------- */
//   const findStandardIdForSelected = (): number | null => {
//     const lic = licenses.find(l => l.id === selectedLicense);
//     return lic?.standardId ?? null;
//   };

//   /* -------- create period -------- */
//   const createCompliancePeriod = async (closeExisting: boolean) => {
//     setIsSubmitting(true);
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const standardId = findStandardIdForSelected();
//       if (!standardId || standardId <= 0) {
//         throw new Error("Selected license is missing a valid standardId. Please re-load licenses or contact admin.");
//       }

//       const body = {
//         standardId,
//         complStartDate: formData.startDate,
//         complEndDate: formData.endDate,
//         customerId: cid,
//         govid: gid,
//         licenseId: parseInt(selectedLicense || "0", 10),
//         canClosePrevCompliancePeriod: !!closeExisting,
//       };

//       const res = await fetch(POST_PERIOD, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

//       const ct = res.headers.get("content-type") || "";
//       const payload = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
//       if (payload?.statusCode && payload.statusCode !== 200)
//         throw new Error(payload.message || "Failed to create compliance period");

//       setShowSuccessModal(true);
//       setShowConflictModal(false);
//       await fetchPeriods();
//     } catch (e: any) {
//       setErrorMessage(e?.message || "Failed to create compliance period");
//       setShowErrorModal(true);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const submitForm = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedLicense) { setErrorMessage("Please select a license first."); setShowErrorModal(true); return; }
//     const err = validateDates();
//     if (err) { setErrorMessage(err); setShowErrorModal(true); return; }
//     const activeOpen = guidance?.lastCompliancePeriod?.isActive && guidance?.lastCompliancePeriod?.isOpen;
//     if (activeOpen || hasAnyActive) { setShowConflictModal(true); return; }
//     void createCompliancePeriod(false);
//   };

//   const handleConflictResolution = (action: "close" | "keep") => {
//     if (isSubmitting) return;
//     void createCompliancePeriod(action === "close");
//   };

//   const onSuccessAction = () => {
//     setShowSuccessModal(false);
//     setShowCreateForm(false);
//     setSelectedLicense("");
//     setFormData({ name: "", description: "", startDate: "", endDate: "" });
//     setGuidance(null);
//   };

//   const statusCls = (s: string) =>
//     s === "active" ? "bg-green-100 text-green-800" :
//     s === "closed" ? "bg-gray-100 text-gray-800" :
//     s === "planned" ? "bg-blue-100 text-blue-800" :
//     s === "expired" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800";

//   const statusIcon = (s: string) =>
//     s === "active" ? <CheckCircle className="w-4 h-4 text-green-600" /> :
//     s === "closed" ? <CheckCircle className="w-4 h-4 text-gray-600" /> :
//     s === "planned" ? <Calendar className="w-4 h-4 text-blue-600" /> :
//     s === "expired" ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-gray-600" />;

//   const history = (() => {
//     if (!guidance) return [] as any[];
//     const h: any[] = [];
//     if (guidance.lastCompliancePeriod.startDate || guidance.lastCompliancePeriod.endDate) {
//       h.push({
//         id: "last",
//         name: "Previous Compliance Period",
//         startDate: guidance.lastCompliancePeriod.startDate || "-",
//         endDate: guidance.lastCompliancePeriod.endDate || "-",
//         status: guidance.lastCompliancePeriod.isOpen ? "active" : "closed",
//       });
//     }
//     h.push({
//       id: "est",
//       name: "Estimated Next Period",
//       startDate: guidance.estimatedCompliancePeriod.startDate,
//       endDate: guidance.estimatedCompliancePeriod.endDate,
//       status: "planned",
//     });
//     return h;
//   })();

//   /* =============== Per-period actions =============== */
//   const openEditPeriod = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setEditData({ startDate: p.startDate, endDate: p.endDate });
//     setShowEditModal(true);
//   };

//   const openCreateAssignment = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setShowAssignModal(true);
//   };

//   const openClosePeriod = (p: UiPeriod) => {
//     setActivePeriod(p);
//     setCloseNote("");
//     setShowCloseModal(true);
//   };

//   /* -------- EDIT period (uses ?ComplianceId=) -------- */
//   const saveEditPeriod = async () => {
//     if (!activePeriod) return;
//     if (!editData.startDate || !editData.endDate) {
//       setErrorMessage("Please pick both Start and End dates.");
//       setShowEditModal(false); setShowErrorModal(true); return;
//     }
//     if (parseISO(editData.endDate) <= parseISO(editData.startDate)) {
//       setErrorMessage("End date must be after Start date.");
//       setShowEditModal(false); setShowErrorModal(true); return;
//     }
//     setSavingEdit(true);
//     try {
//       const { cid, gid } = requireIdsOrThrow();
//       const id = parseInt(activePeriod.id, 10);

//       const body = {
//         complStartDate: editData.startDate,
//         complEndDate: editData.endDate,
//         customerId: cid,
//         govid: gid,
//       };

//       // ✅ server expects PUT /CompliancePeriod?ComplianceId={id}
//       const res = await fetch(PUT_PERIOD_QS(id), {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

//       setShowEditModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowEditModal(false);
//       setErrorMessage(e?.message || "Failed to update period");
//       setShowErrorModal(true);
//     } finally {
//       setSavingEdit(false);
//     }
//   };

//   /* -------- Create assignments for a period -------- */
//   const createAssignment = async () => {
//     if (!activePeriod) return;
//     setSavingAssign(true);
//     try {
//       const { cid } = requireIdsOrThrow();
//       const compId = parseInt(activePeriod.id, 10);
//       const url = CREATE_ASSIGNMENTS_FOR_PERIOD(cid, compId);

//       // Most backends create with POST (no body). If the API rejects it with 405,
//       // we retry with GET to match legacy behavior.
//       let res = await fetch(url, { method: "POST", headers: { Accept: "application/json" } });
//       if (res.status === 405) {
//         res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
//       }
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

//       setShowAssignModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowAssignModal(false);
//       setErrorMessage(e?.message || "Failed to create assignment(s)");
//       setShowErrorModal(true);
//     } finally {
//       setSavingAssign(false);
//     }
//   };

//   // NOTE: Close Period endpoint was not specified; keeping as-is.
//   const confirmClosePeriod = async () => {
//     if (!activePeriod) return;
//     setClosingPeriod(true);
//     try {
//       // If your API has a different close endpoint, adjust here similarly.
//       const id = parseInt(activePeriod.id, 10);
//       const res = await fetch(`${API_BASE}/CompliancePeriod/${id}/close`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify({ note: closeNote || null, customerId, govid: govId }),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
//       setShowCloseModal(false);
//       setActivePeriod(null);
//       await fetchPeriods();
//     } catch (e: any) {
//       setShowCloseModal(false);
//       setErrorMessage(e?.message || "Failed to close period");
//       setShowErrorModal(true);
//     } finally {
//       setClosingPeriod(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       {(!customerId || !govId) && (
//         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg">
//           Please login and select a governance domain to view configuration.
//         </div>
//       )}

//       {/* header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Configuration</h2>
//           <p className="text-gray-600">Manage compliance periods, licenses, and system configuration</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
//             <PlusCircle className="w-4 h-4" /> Create Audit
//           </button>
//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
//             onClick={() => setShowCreateForm(true)}
//           >
//             <PlusCircle className="w-4 h-4" /> New Period
//           </button>
//         </div>
//       </div>

//       {/* tabs */}
//       <div className="border-b border-gray-200">
//         <nav className="flex space-x-8">
//           {[
//             { id: "periods", label: "Compliance Periods", icon: Calendar },
//             { id: "licenses", label: "View/Manage License", icon: Shield },
//             { id: "audits", label: "Internal Audits", icon: FileText },
//             { id: "internal-audits", label: "Create Internal Audit", icon: PlusCircle },
//           ].map(t => (
//             <button
//               key={t.id}
//               onClick={() => setActiveSection(t.id)}
//               className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
//                 activeSection === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
//               }`}
//             >
//               <t.icon className="w-4 h-4" /> {t.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* periods page */}
//       {activeSection === "periods" && (
//         <div className="space-y-6">
//           {/* choose license */}
//           {!showCreateForm && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Compliance Period</h3>
//               <p className="text-gray-600 mb-6">Select a license to create a new compliance period</p>
//               {loadingLicenses && <div className="text-sm text-gray-600">Loading licenses…</div>}
//               {licensesError && <div className="text-sm text-red-600">{licensesError}</div>}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {licenses.map(lic => (
//                   <button
//                     key={lic.id}
//                     onClick={() => handleLicenseSelect(lic.id)}
//                     className="text-left p-4 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
//                   >
//                     <div className="flex items-center gap-3 mb-2">
//                       <Shield className="w-6 h-6 text-blue-600" />
//                       <div>
//                         <h4 className="font-medium text-gray-800">{lic.standard}</h4>
//                         <p className="text-sm text-gray-600">{lic.description}</p>
//                         {lic.standardId ? (
//                           <p className="text-xs text-gray-500 mt-1">Standard ID: {lic.standardId}</p>
//                         ) : (
//                           <p className="text-xs text-amber-600 mt-1">Standard ID missing</p>
//                         )}
//                       </div>
//                     </div>
//                     {lic.expiryDate && <div className="text-xs text-gray-500">Valid until: {lic.expiryDate}</div>}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* create form */}
//           {showCreateForm && (
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">Create Compliance Period</h3>
//                   <p className="text-gray-600">License: {licenses.find(l => l.id === selectedLicense)?.standard || "-"}</p>
//                 </div>
//                 <button onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
//                         className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div>
//                   <form onSubmit={submitForm} className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Period Name *</label>
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="e.g., Q1 2024 Compliance Review"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                       <textarea
//                         value={formData.description}
//                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         rows={3}
//                         placeholder="Brief description of this compliance period"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
//                         <input
//                           type="date"
//                           value={formData.startDate}
//                           min={guidance?.licenseDates.startDate || todayISO()}
//                           onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           required
//                         />
//                         {guidance?.lastCompliancePeriod?.endDate && (
//                           <p className="text-xs text-gray-500 mt-1">Must be ≥ {guidance.lastCompliancePeriod.endDate}</p>
//                         )}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
//                         <input
//                           type="date"
//                           value={formData.endDate}
//                           max={guidance?.licenseDates.endDate || undefined}
//                           onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           required
//                         />
//                         {guidance?.licenseDates?.endDate && (
//                           <p className="text-xs text-gray-500 mt-1">Must be ≤ {guidance.licenseDates.endDate}</p>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-3 pt-4">
//                       <button
//                         type="submit"
//                         disabled={isSubmitting || loadingGuidance}
//                         className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                       >
//                         {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <PlusCircle className="w-4 h-4" />}
//                         {isSubmitting ? "Creating..." : "Create Period"}
//                       </button>
//                       <button type="button"
//                         onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
//                         className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">
//                         Cancel
//                       </button>
//                     </div>
//                   </form>
//                 </div>

//                 {/* history from guidance */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <History className="w-5 h-5 text-gray-600" />
//                     <h4 className="font-medium text-gray-800">Period History</h4>
//                   </div>
//                   {loadingGuidance && <div className="text-sm text-gray-600">Loading guidance…</div>}
//                   {!loadingGuidance && (
//                     <div className="space-y-3">
//                       {history.length === 0 && <div className="text-sm text-gray-600">No history to show.</div>}
//                       {history.map((p: any) => (
//                         <div key={p.id} className="p-3 border border-gray-200 rounded-lg">
//                           <div className="flex items-center justify-between mb-2">
//                             <h5 className="font-medium text-gray-800">{p.name}</h5>
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCls(p.status)}`}>{p.status}</span>
//                           </div>
//                           <div className="text-sm text-gray-600">{p.startDate} to {p.endDate}</div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* quick actions + list */}
//           {!showCreateForm && (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 {[
//                   { icon: PlusCircle, label: "Create Period", color: "blue" },
//                   { icon: Eye, label: "View/Edit Period", color: "green" },
//                   { icon: FileText, label: "Create Assignment", color: "purple" },
//                   { icon: AlertTriangle, label: "Close Period", color: "red" },
//                 ].map((a, i) => (
//                   <button key={i} className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-colors text-left">
//                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                       a.color === "blue" ? "bg-blue-100" :
//                       a.color === "green" ? "bg-green-100" :
//                       a.color === "purple" ? "bg-purple-100" : "bg-red-100"}`}>
//                       <a.icon className={`w-5 h-5 ${
//                         a.color === "blue" ? "text-blue-600" :
//                         a.color === "green" ? "text-green-600" :
//                         a.color === "purple" ? "text-purple-600" : "text-red-600"}`} />
//                     </div>
//                     <span className="font-medium text-gray-800">{a.label}</span>
//                   </button>
//                 ))}
//               </div>

//               <div className="bg-white rounded-xl border border-gray-200">
//                 <div className="p-6 border-b border-gray-200">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold text-gray-800">Active Compliance Periods</h3>
//                     <div className="flex items-center gap-3">
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                           type="text"
//                           placeholder="Search periods..."
//                           className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                         />
//                       </div>
//                       <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//                         <Filter className="w-4 h-4" />
//                         <span className="text-sm">Filter</span>
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6 space-y-4">
//                   {loadingPeriods && <div className="text-sm text-gray-600">Loading…</div>}
//                   {!loadingPeriods && periodsError && <div className="text-sm text-red-600">Failed to load periods: {periodsError}</div>}
//                   {!loadingPeriods && !periodsError && periods.length === 0 && <div className="text-sm text-gray-600">No compliance periods found.</div>}

//                   {periods.map(p => (
//                     <div key={p.id} className="border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-start gap-3 mb-4">
//                         {statusIcon(p.status)}
//                         <div>
//                           <h4 className="text-lg font-medium text-gray-800">{p.name}</h4>
//                           {p.description && <p className="text-gray-600 text-sm mt-1">{p.description}</p>}
//                           <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusCls(p.status)}`}>{p.status}</span>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 md-grid-cols-4 md:grid-cols-4 gap-4 text-sm">
//                         <div><span className="text-gray-500">Domain:</span><div className="font-medium text-gray-800">{p.domain}</div></div>
//                         <div><span className="text-gray-500">Start Date:</span><div className="font-medium text-gray-800">{p.startDate}</div></div>
//                         <div><span className="text-gray-500">End Date:</span><div className="font-medium text-gray-800">{p.endDate}</div></div>
//                         <div><span className="text-gray-500">Tasks:</span><div className="font-medium text-gray-800">{p.tasksCompleted}/{p.tasksTotal}</div></div>
//                       </div>

//                       {/* action buttons row */}
//                       <div className="mt-4 flex flex-wrap gap-3">
//                         <button
//                           type="button"
//                           onClick={() => openEditPeriod(p)}
//                           className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
//                         >
//                           Edit Period
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => openCreateAssignment(p)}
//                           className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
//                         >
//                           Create Assignment
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => openClosePeriod(p)}
//                           className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium"
//                           disabled={p.status !== 'active'}
//                         >
//                           Close Period
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       )}

//       {/* Error Modal */}
//       {showErrorModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Validation / Error</h3>
//             </div>
//             <p className="text-gray-600 mb-6">{errorMessage}</p>
//             <div className="flex justify-end">
//               <button type="button" onClick={() => setShowErrorModal(false)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
//                 OK
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Conflict Modal */}
//       {showConflictModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-yellow-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Alert!</h3>
//             </div>
//             <div className="mb-6">
//               <p className="text-gray-600 mb-2">You already have a compliance period that is Active.</p>
//               <p className="text-gray-600">Would you like to close the compliance period and create a new one?</p>
//               <p className="text-sm text-gray-500 mt-2">(Keep Open will make the older compliance period inactive.)</p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => handleConflictResolution("close")}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
//               >
//                 {isSubmitting ? "Processing..." : "Close & Create"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => handleConflictResolution("keep")}
//                 disabled={isSubmitting}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
//               >
//                 {isSubmitting ? "Processing..." : "Keep Open & Create"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Success Modal */}
//       {showSuccessModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Compliance Period Created</h3>
//             </div>
//             <div className="mb-6">
//               <p className="text-gray-600 mb-2">Your compliance period has been created successfully.</p>
//               <p className="text-gray-600">Create Activity Assignments now?</p>
//             </div>
//             <div className="flex gap-3">
//               <button type="button" onClick={onSuccessAction}
//                 className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors">Close</button>
//               <button type="button" onClick={onSuccessAction}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">Yes</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= Modals for per-period actions ================= */}

//       {/* Edit Period Modal */}
//       {showEditModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-800">Edit Period</h3>
//               <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5"/></button>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">{activePeriod.name} • {activePeriod.domain}</p>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//                 <input type="date" value={editData.startDate} onChange={(e)=>setEditData(d=>({...d,startDate:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//                 <input type="date" value={editData.endDate} onChange={(e)=>setEditData(d=>({...d,endDate:e.target.value}))}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
//               </div>
//             </div>
//             <div className="flex gap-3 justify-end mt-6">
//               <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button type="button" onClick={saveEditPeriod} disabled={savingEdit}
//                 className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
//                 {savingEdit ? "Saving…" : "Save changes"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Create Assignment Modal (Angular fields only) */}
//       {showAssignModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-800">Create Task</h3>
//               <button onClick={() => setShowAssignModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Compliance/Standard :</label>
//                 <span className="text-gray-800 font-medium">{activePeriod.name}</span>
//               </div>

//               <div>
//                 <label htmlFor="complStartDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//                 <input
//                   id="complStartDate"
//                   type="date"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
//                   value={activePeriod.startDate || ""}
//                   readOnly
//                 />
//               </div>

//               <div>
//                 <label htmlFor="complEndDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//                 <input
//                   id="complEndDate"
//                   type="date"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
//                   value={activePeriod.endDate || ""}
//                   readOnly
//                 />
//               </div>

//               <div className="flex justify-end gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setShowAssignModal(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={createAssignment}
//                   disabled={savingAssign}
//                   className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
//                 >
//                   {savingAssign ? "Submitting…" : "Submit"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Close Period Modal (kept as-is; adjust endpoint if needed) */}
//       {showCloseModal && activePeriod && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//             <div className="flex items-center gap-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-600" />
//               <h3 className="text-lg font-semibold text-gray-800">Close Period</h3>
//             </div>
//             <p className="text-gray-600 mb-2">This will mark <span className="font-medium text-gray-800">{activePeriod.name}</span> as closed and prevent new assignments.</p>
//             <p className="text-sm text-gray-500 mb-4">You can add an optional closing note below.</p>
//             <textarea value={closeNote} onChange={(e)=>setCloseNote(e.target.value)} rows={3}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Optional note" />
//             <div className="flex gap-3 justify-end mt-6">
//               <button type="button" onClick={() => setShowCloseModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//               <button type="button" onClick={confirmClosePeriod} disabled={closingPeriod}
//                 className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
//                 {closingPeriod ? "Closing…" : "Close Period"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar, Shield, PlusCircle,  FileText, AlertTriangle,
  CheckCircle, Clock, Search, Filter, X, History,
} from "lucide-react";
import PopupMessages, {PopupKind, PopupAction} from "../popups/PopupMessages";

/* ------------ ENDPOINTS (use Vite proxy) ------------ */
const API_BASE = (import.meta as any)?.env?.DEV ? "/api" : "https://sajoan-b.techoptima.ai/api"; // use proxy in dev, absolute URL in production
const GET_PERIODS = (customerId: number, govId: number) =>
  `${API_BASE}/CompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
const GET_LICENSES = (customerId: number, govId: number) =>
  `${API_BASE}/LookUp/GetLicensesForCompliancePeriod?CustomerId=${customerId}&GovId=${govId}`;
const GET_GUIDANCE = (licenseId: number) =>
  `${API_BASE}/LookUp/compliananceperiodforguidence?LicenseId=${licenseId}`;
const POST_PERIOD = `${API_BASE}/CompliancePeriod`;

// ✅ EDIT endpoint with all query params present
const PUT_PERIOD_QS = (id: number, cid: number, gid: number) =>
  `${API_BASE}/CompliancePeriod?ComplianceId=${id}&CustomerId=${cid}&GovId=${gid}`;

const CREATE_ASSIGNMENTS_FOR_PERIOD = (customerId: number, complianceId: number) =>
  `${API_BASE}/CompliancePeriod/CreateAssignmentsForComplincePeriod?CustomerId=${customerId}&ComplainceId=${complianceId}`;
const CLOSE_PERIOD = (id: number) => `${API_BASE}/CompliancePeriod/${id}/close`;

/* ------------ Utilities ------------ */
type ApiResp<T> = { data: T; message?: string|null; statusCode?: number; errors?: any[] } | T;
const arr = <T,>(raw: ApiResp<T[]>): T[] => Array.isArray(raw) ? raw : Array.isArray((raw as any)?.data) ? (raw as any).data : [];
const todayISO = () => new Date().toISOString().slice(0,10);
const parseISO = (s: string) => new Date(`${s}T00:00:00`);
const toYMD = (s: string) => s?.slice(0,10) ?? ""; // ensure YYYY-MM-DD

const friendlyHttp = (status: number, method?: string) => {
  if (status === 404) return "Resource not found (404). Check the ComplianceId / CustomerId.";
  if (status === 405) return `${method || "This method"} is not allowed on this endpoint (405).`;
  if (status === 400) return "Some inputs look invalid (400).";
  if (status === 500) return "Server error (500).";
  return `Request failed with status ${status}.`;
};

const parsePayload = async (res: Response) => {
  const ct = res.headers.get("content-type") || "";
  const raw = await res.text();
  let json: any = null;
  if (ct.includes("application/json")) {
    try { json = raw ? JSON.parse(raw) : null; } catch {}
  }
  const msg =
    json?.message || json?.Message || json?.title || json?.error ||
    (!ct.includes("application/json") && raw ? raw : null) ||
    res.statusText || "Request failed";
  const errors: string[] = Array.isArray(json?.errors)
    ? json.errors.map((e: any) => (typeof e === "string" ? e : JSON.stringify(e)))
    : [];
  const isInternalError = !!(json?.statusCode && json.statusCode !== 200);
  return { payload: json, message: msg, errors, isInternalError };
};

/* ------------ API row types ------------ */
type PeriodRow = {
  id: number; standardname: string; standardId: number; governancename: string;
  complStartDate: string; complEndDate: string; isOpen: boolean; isActive: boolean;
};
type LicenseRow = {
  licenseLookupId: number;
  governanceName?: string;
  standardName?: string;
  standardId?: number; standardID?: number; standardid?: number; standardMasterId?: number;
  licenseDates?: { startDate: string; endDate: string };
  startDate?: string; endDate?: string;
};
type Guidance = {
  licenseDates: { startDate: string; endDate: string };
  lastCompliancePeriod: { startDate?: string|null; endDate?: string|null; isActive: boolean; isOpen: boolean };
  estimatedCompliancePeriod: { startDate: string; endDate: string };
};
type UiPeriod = {
  id: string; name: string; description: string; startDate: string; endDate: string;
  status: "active" | "closed"; domain: string; progress: number; tasksTotal: number; tasksCompleted: number;
  standardId: number; isActive: boolean; isOpen: boolean;
};
type UiLicense = {
  id: string; standard: string; description: string; expiryDate?: string; standardId?: number;
};

export const Configuration: React.FC = () => {
  const [activeSection, setActiveSection] = useState("periods");

  // IDs from storage
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [govId, setGovId] = useState<number | null>(null);

  // lists
  const [periods, setPeriods] = useState<UiPeriod[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [periodsError, setPeriodsError] = useState("");

  const [licenses, setLicenses] = useState<UiLicense[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [licensesError, setLicensesError] = useState("");

  // form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", description: "", startDate: "", endDate: "" });

  // guidance
  const [guidance, setGuidance] = useState<Guidance | null>(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);

  // per-period actions
  const [activePeriod, setActivePeriod] = useState<UiPeriod | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const [editData, setEditData] = useState({ startDate: "", endDate: "" });
  const [closeNote, setCloseNote] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);
  const [closingPeriod, setClosingPeriod] = useState(false);

  // Popup
  const [pmOpen, setPmOpen] = useState(false);
  const [pmKind, setPmKind] = useState<PopupKind>("info");
  const [pmTitle, setPmTitle] = useState<string | undefined>(undefined);
  const [pmMessage, setPmMessage] = useState<string | string[]>("");
  const [pmActions, setPmActions] = useState<PopupAction[] | undefined>(undefined);

  const openPopup = (kind: PopupKind, message: string | string[], title?: string, actions?: PopupAction[]) => {
    setPmKind(kind); setPmTitle(title); setPmMessage(message); setPmActions(actions); setPmOpen(true);
  };

  // bootstrap IDs
  useEffect(() => {
    const cid = Number(sessionStorage.getItem("customerId") ?? localStorage.getItem("customerId"));
    const gid = Number(sessionStorage.getItem("govId") ?? localStorage.getItem("govId"));
    setCustomerId(Number.isFinite(cid) && cid > 0 ? cid : null);
    setGovId(Number.isFinite(gid) && gid > 0 ? gid : null);
  }, []);

  const requireIdsOrThrow = () => {
    if (customerId == null || govId == null) throw new Error("Missing Customer or Governance selection. Please login and select a domain.");
    return { cid: customerId, gid: govId };
  };

  /* -------- GET periods -------- */
  const mapPeriods = (rows: PeriodRow[]): UiPeriod[] =>
    rows.map((r) => ({
      id: String(r.id),
      name: (r as any).standardname || (r as any).standardName || "Compliance Period",
      description: (r as any).governancename ? `${(r as any).governancename} compliance period` : "",
      startDate: (r as any).complStartDate,
      endDate: (r as any).complEndDate,
      status: (r as any).isOpen ? "active" : "closed",
      domain: (r as any).governancename || "General",
      progress: (r as any).isActive ? 65 : 100,
      tasksTotal: (r as any).tasksTotal || 0,
      tasksCompleted: (r as any).tasksCompleted || 0,
      standardId: r.standardId,
      isActive: r.isActive,
      isOpen: r.isOpen,
    }));

  const fetchPeriods = async () => {
    setLoadingPeriods(true); setPeriodsError("");
    try {
      const { cid, gid } = requireIdsOrThrow();
      const res = await fetch(GET_PERIODS(cid, gid), { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`${friendlyHttp(res.status)} Loading periods failed.`);
      const ct = res.headers.get("content-type") || "";
      const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
      setPeriods(mapPeriods(arr<PeriodRow>(raw)));
    } catch (e: any) {
      setPeriodsError(e?.message || "Failed to load compliance periods");
      openPopup("error", e?.message || "Failed to load compliance periods");
      setPeriods([]);
    } finally { setLoadingPeriods(false); }
  };

  /* -------- GET licenses -------- */
  const normalizeStdId = (r: LicenseRow): number | undefined =>
    r.standardId ?? r.standardID ?? r.standardid ?? r.standardMasterId;

  const mapLicenses = (rows: LicenseRow[]): UiLicense[] =>
    rows.map((r) => ({
      id: String(r.licenseLookupId),
      standard: r.standardName || "-",
      description: r.governanceName ? `${r.governanceName} - ${r.standardName}` : (r.standardName || ""),
      expiryDate: r.licenseDates?.endDate || r.endDate,
      standardId: normalizeStdId(r),
    }));

  const fetchLicenses = async () => {
    setLoadingLicenses(true); setLicensesError("");
    try {
      const { cid, gid } = requireIdsOrThrow();
      const res = await fetch(GET_LICENSES(cid, gid), { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`${friendlyHttp(res.status)} Loading licenses failed.`);
      const ct = res.headers.get("content-type") || "";
      const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
      setLicenses(mapLicenses(arr<LicenseRow>(raw)));
    } catch (e: any) {
      setLicensesError(e?.message || "Failed to load licenses");
      openPopup("error", e?.message || "Failed to load licenses");
      setLicenses([]);
    } finally { setLoadingLicenses(false); }
  };

  useEffect(() => {
    if (customerId && govId) { fetchPeriods(); fetchLicenses(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, govId]);

  const hasAnyActive = useMemo(() => periods.some((p) => p.status === "active"), [periods]);

  /* -------- Guidance -------- */
  const fetchGuidance = async (licenseId: number) => {
    setLoadingGuidance(true); setGuidance(null);
    try {
      const res = await fetch(GET_GUIDANCE(licenseId), { headers: { Accept: "application/json" } });
      if (!res.ok) { const parsed = await parsePayload(res); throw new Error(`${friendlyHttp(res.status)} ${parsed.message || ""}`); }
      const ct = res.headers.get("content-type") || "";
      const raw = ct.includes("application/json") ? await res.json() : JSON.parse(await res.text());
      const rows = arr<Guidance>(raw);
      if (!rows.length) throw new Error("No guidance returned for this license");
      setGuidance(rows[0]);
    } catch (e: any) {
      setGuidance(null);
      openPopup("error", e?.message || "Failed to load license guidance");
    } finally { setLoadingGuidance(false); }
  };

  const handleLicenseSelect = (licenseId: string) => {
    setSelectedLicense(licenseId);
    setShowCreateForm(true);
    setFormData({ name: "", description: "", startDate: "", endDate: "" });
    if (licenseId) fetchGuidance(parseInt(licenseId, 10));
  };

  /* -------- Validations -------- */
  const validateDates = (): string | null => {
    if (!guidance) return "License guidance not loaded yet.";
    const s = formData.startDate ? parseISO(formData.startDate) : null;
    const e = formData.endDate ? parseISO(formData.endDate) : null;
    const licS = parseISO(guidance.licenseDates.startDate);
    const licE = parseISO(guidance.licenseDates.endDate);
    if (!s) return "Start date is required.";
    if (!e) return "End date is required.";
    if (s < licS) return `Choose start date ≥ ${guidance.licenseDates.startDate}`;
    if (guidance.lastCompliancePeriod.endDate) {
      const lastEnd = parseISO(guidance.lastCompliancePeriod.endDate);
      if (s < lastEnd) return `Choose start date ≥ ${guidance.lastCompliancePeriod.endDate}`;
    }
    if (s < parseISO(todayISO())) return "Start date should be today or later.";
    if (e <= s) return "End date should be after Start date.";
    if (e > licE) return `Choose end date ≤ ${guidance.licenseDates.endDate}`;
    return null;
  };

  const findStandardIdForSelected = (): number | null => {
    const lic = licenses.find((l) => l.id === selectedLicense);
    return lic?.standardId ?? null;
  };

  /* -------- Create period -------- */
  const createCompliancePeriod = async (closeExisting: boolean) => {
    try {
      const { cid, gid } = requireIdsOrThrow();
      const standardId = findStandardIdForSelected();
      if (!standardId || standardId <= 0) { openPopup("warning", "Selected license is missing a valid Standard ID. Please reload licenses."); return; }

      const body = {
        standardId,
        complStartDate: toYMD(formData.startDate),
        complEndDate: toYMD(formData.endDate),
        customerId: cid,
        govid: gid,
        licenseId: parseInt(selectedLicense || "0", 10),
        canClosePrevCompliancePeriod: !!closeExisting,
      };

      const res = await fetch(POST_PERIOD, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      const parsed = await parsePayload(res);
      if (!res.ok || parsed.isInternalError) {
        const errorMsg = parsed.errors.length > 0 ? parsed.errors.join("\n") : parsed.message;
        throw new Error(`${res.ok ? "" : friendlyHttp(res.status, "POST") + " "}${errorMsg}`);
      }


      openPopup("success", "Compliance period created successfully.", "Success", [
        { label: "Create Assignments", onClick: () => setPmOpen(false) },
        { label: "Close", onClick: () => setPmOpen(false), variant: "secondary" },
      ]);

      await fetchPeriods();
      setShowCreateForm(false);
      setSelectedLicense("");
      setGuidance(null);
      setFormData({ name: "", description: "", startDate: "", endDate: "" });
    } catch (e: any) {
      openPopup("error", e?.message || "Failed to create compliance period");
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicense) { openPopup("warning", "Please select a license first."); return; }
    const err = validateDates();
    if (err) { openPopup("warning", err); return; }
    const activeOpen = guidance?.lastCompliancePeriod?.isActive && guidance?.lastCompliancePeriod?.isOpen;
    if (activeOpen || hasAnyActive) {
      openPopup("warning",
        ["You already have an Active compliance period.","Would you like to close the current period and create a new one?","(‘Keep Open’ will make the older compliance period inactive.)"],
        "Alert!",
        [
          { label: "Close & Create", onClick: () => createCompliancePeriod(true) },
          { label: "Keep Open & Create", onClick: () => createCompliancePeriod(false), variant: "secondary" },
        ]
      ); return;
    }
    void createCompliancePeriod(false);
  };

  /* -------- EDIT period ------------- */
  const saveEditPeriod = async () => {
    if (!activePeriod) return;
    if (!editData.startDate || !editData.endDate) { openPopup("warning", "Please pick both Start and End dates."); return; }
    if (parseISO(editData.endDate) <= parseISO(editData.startDate)) { openPopup("warning", "End date must be after Start date."); return; }

    setSavingEdit(true);
    try {
      const { cid, gid } = requireIdsOrThrow();
      const id = parseInt(activePeriod.id, 10);

      const url = PUT_PERIOD_QS(id, cid, gid); // include all query params
      const body = {
        StandardId: activePeriod.standardId,
        CustomerId: cid,
        ComplStartDate: toYMD(editData.startDate),
        ComplEndDate: toYMD(editData.endDate),
        IsActive: activePeriod.isActive,
        IsOpen: activePeriod.isOpen,
      };

      // Try PUT first (documented), fallback to POST if not allowed
      let res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok && res.status === 405) {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        });
      }

      const parsed = await parsePayload(res);
      if (!res.ok || parsed.isInternalError) {
        const errorMsg = parsed.errors.length > 0 ? parsed.errors.join("\n") : parsed.message;
        throw new Error(`${res.ok ? "" : friendlyHttp(res.status, "PUT") + " "}${errorMsg}`);
      }

      openPopup("success", "Period dates updated.");
      setShowEditModal(false);
      setActivePeriod(null);
      await fetchPeriods();
    } catch (e: any) {
      openPopup("error", e?.message || "Failed to update period");
    } finally {
      setSavingEdit(false);
    }
  };

  /* -------- Create assignments -------- */
  const createAssignment = async () => {
    if (!activePeriod) return;
    setSavingAssign(true);
    try {
      const { cid } = requireIdsOrThrow();
      const periodId = parseInt(activePeriod.id, 10);
      const url = CREATE_ASSIGNMENTS_FOR_PERIOD(cid, periodId);

      let res = await fetch(url, { method: "POST", headers: { Accept: "application/json" } });
      if (!res.ok && (res.status === 405 || res.status === 404)) {
        res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
      }
      const parsed = await parsePayload(res);
      if (!res.ok || parsed.isInternalError) {
        const errorMsg = parsed.errors.length > 0 ? parsed.errors.join("\n") : parsed.message;
        throw new Error(`${res.ok ? "" : friendlyHttp(res.status, "POST") + " "}${errorMsg}`);
      }


      openPopup("success", "Assignments created for this compliance period.");
      setShowAssignModal(false);
      setActivePeriod(null);
      await fetchPeriods();
    } catch (e: any) {
      openPopup("error", e?.message || "Failed to create assignments");
      setShowAssignModal(false);
    } finally {
      setSavingAssign(false);
    }
  };

  /* -------- Close period -------- */
  const confirmClosePeriod = async () => {
    if (!activePeriod) return;
    setClosingPeriod(true);
    try {
      const id = parseInt(activePeriod.id, 10);
      let res = await fetch(CLOSE_PERIOD(id), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ note: closeNote || null }),
      });
      if (!res.ok && res.status === 405) {
        res = await fetch(CLOSE_PERIOD(id), {
          method: "PUT",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ note: closeNote || null }),
        });
      }
      const parsed = await parsePayload(res);
      if (!res.ok || parsed.isInternalError) {
        const errorMsg = parsed.errors.length > 0 ? parsed.errors.join("\n") : parsed.message;
        throw new Error(`${res.ok ? "" : friendlyHttp(res.status)} ${errorMsg}`);
      }
      openPopup("success", "Period closed.");
      setShowCloseModal(false);
      setActivePeriod(null);
      await fetchPeriods();
    } catch (e: any) {
      openPopup("error", e?.message || "Failed to close period");
      setShowCloseModal(false);
    } finally {
      setClosingPeriod(false);
    }
  };

  /* -------- UI helpers / openers ... (unchanged below) -------- */
  const statusCls = (s: string) =>
    s === "active" ? "bg-green-100 text-green-800" :
    s === "closed" ? "bg-gray-100 text-gray-800" :
    s === "planned" ? "bg-blue-100 text-blue-800" :
    s === "expired" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800";

  const statusIcon = (s: string) =>
    s === "active" ? <CheckCircle className="w-4 h-4 text-green-600" /> :
    s === "closed" ? <CheckCircle className="w-4 h-4 text-gray-600" /> :
    s === "planned" ? <Calendar className="w-4 h-4 text-blue-600" /> :
    s === "expired" ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-gray-600" />;

  const history = (() => {
    if (!guidance) return [] as any[];
    const h: any[] = [];
    if (guidance.lastCompliancePeriod.startDate || guidance.lastCompliancePeriod.endDate) {
      h.push({ id: "last", name: "Previous Compliance Period", startDate: guidance.lastCompliancePeriod.startDate || "-", endDate: guidance.lastCompliancePeriod.endDate || "-", status: guidance.lastCompliancePeriod.isOpen ? "active" : "closed" });
    }
    h.push({ id: "est", name: "Estimated Next Period", startDate: guidance.estimatedCompliancePeriod.startDate, endDate: guidance.estimatedCompliancePeriod.endDate, status: "planned" });
    return h;
  })();

  const openEditPeriod = (p: UiPeriod) => { setActivePeriod(p); setEditData({ startDate: p.startDate, endDate: p.endDate }); setShowEditModal(true); };
  const openCreateAssignment = (p: UiPeriod) => { setActivePeriod(p); setShowAssignModal(true); };
  const openClosePeriod = (p: UiPeriod) => { setActivePeriod(p); setCloseNote(""); setShowCloseModal(true); };

  return (
    <div className="p-6 space-y-6">
      {(!customerId || !govId) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg">
          Please login and select a governance domain to view configuration.
        </div>
      )}

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Compliance</h2>
          <p className="text-gray-600">Manage compliance periods, licenses, and system configuration</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Create Audit
          </button> */}
          {/* <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            onClick={() => setShowCreateForm(true)}
          >
            <PlusCircle className="w-4 h-4" /> New Period
          </button> */}
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-gray-200">
        {/* <nav className="flex space-x-8">
          {[
            { id: "periods", label: "Compliance Periods", icon: Calendar },
            { id: "licenses", label: "View/Manage License", icon: Shield },
            { id: "audits", label: "Internal Audits", icon: FileText },
            { id: "internal-audits", label: "Create Internal Audit", icon: PlusCircle },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeSection === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav> */}
      </div>

      {/* periods page */}
      {activeSection === "periods" && (
        <div className="space-y-6">
          {/* choose license */}
          {!showCreateForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Compliance Period</h3>
              <p className="text-gray-600 mb-6">Select a license to create a new compliance period</p>
              {loadingLicenses && <div className="text-sm text-gray-600">Loading licenses…</div>}
              {licensesError && <div className="text-sm text-red-600">{licensesError}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {licenses.map((lic) => (
                  <button
                    key={lic.id}
                    onClick={() => handleLicenseSelect(lic.id)}
                    className="text-left p-4 border-2 border-gray-200 hover:border-blue-300 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-800">{lic.standard}</h4>
                        <p className="text-sm text-gray-600">{lic.description}</p>
                        {lic.standardId ? (
                          <p className="text-xs text-gray-500 mt-1">Standard ID: {lic.standardId}</p>
                        ) : (
                          <p className="text-xs text-amber-600 mt-1">Standard ID missing</p>
                        )}
                      </div>
                    </div>
                    {lic.expiryDate && <div className="text-xs text-gray-500">Valid until: {lic.expiryDate}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* create form */}
          {showCreateForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Create Compliance Period</h3>
                  <p className="text-gray-600">License: {licenses.find((l) => l.id === selectedLicense)?.standard || "-"}</p>
                </div>
                <button
                  onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <form onSubmit={submitForm} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Period Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Q1 2024 Compliance Review"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Brief description of this compliance period"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                        <input
                          type="date"
                          value={formData.startDate}
                          min={guidance?.licenseDates.startDate || todayISO()}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        {guidance?.lastCompliancePeriod?.endDate && (
                          <p className="text-xs text-gray-500 mt-1">Must be ≥ {guidance.lastCompliancePeriod.endDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                        <input
                          type="date"
                          value={formData.endDate}
                          max={guidance?.licenseDates.endDate || undefined}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        {guidance?.licenseDates?.endDate && (
                          <p className="text-xs text-gray-500 mt-1">Must be ≤ {guidance.licenseDates.endDate}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create Period
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowCreateForm(false); setSelectedLicense(""); setGuidance(null); }}
                        className="px-6 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* history */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-gray-600" />
                    <h4 className="font-medium text-gray-800">Period History</h4>
                  </div>
                  {loadingGuidance && <div className="text-sm text-gray-600">Loading guidance…</div>}
                  {!loadingGuidance && (
                    <div className="space-y-3">
                      {history.length === 0 && <div className="text-sm text-gray-600">No history to show.</div>}
                      {history.map((p: any) => (
                        <div key={p.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{p.name}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCls(p.status)}`}>{p.status}</span>
                          </div>
                          <div className="text-sm text-gray-600">{p.startDate} to {p.endDate}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* list */}
          {!showCreateForm && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* {[
                  { icon: PlusCircle, label: "Create Period", color: "blue" },
                  { icon: Eye, label: "View/Edit Period", color: "green" },
                  { icon: FileText, label: "Create Assignment", color: "purple" },
                  { icon: AlertTriangle, label: "Close Period", color: "red" },
                ].map((a, i) => (
                  <button key={i} className="flex items-center gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-colors text-left">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      a.color === "blue" ? "bg-blue-100" :
                      a.color === "green" ? "bg-green-100" :
                      a.color === "purple" ? "bg-purple-100" : "bg-red-100"}`}>
                      <a.icon className={`w-5 h-5 ${
                        a.color === "blue" ? "text-blue-600" :
                        a.color === "green" ? "text-green-600" :
                        a.color === "purple" ? "text-purple-600" : "text-red-600"}`} />
                    </div>
                    <span className="font-medium text-gray-800">{a.label}</span>
                  </button>
                ))} */}
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Active Compliance Periods</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search periods..."
                          className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Filter</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {loadingPeriods && <div className="text-sm text-gray-600">Loading…</div>}
                  {!loadingPeriods && periodsError && <div className="text-sm text-red-600">Failed to load periods: {periodsError}</div>}
                  {!loadingPeriods && !periodsError && periods.length === 0 && <div className="text-sm text-gray-600">No compliance periods found.</div>}

                  {periods.map((p) => (
                    <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        {statusIcon(p.status)}
                        <div>
                          <h4 className="text-lg font-medium text-gray-800">{p.name}</h4>
                          {p.description && <p className="text-gray-600 text-sm mt-1">{p.description}</p>}
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${statusCls(p.status)}`}>{p.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><span className="text-gray-500">Domain:</span><div className="font-medium text-gray-800">{p.domain}</div></div>
                        <div><span className="text-gray-500">Start Date:</span><div className="font-medium text-gray-800">{p.startDate}</div></div>
                        <div><span className="text-gray-500">End Date:</span><div className="font-medium text-gray-800">{p.endDate}</div></div>
                        <div><span className="text-gray-500">Tasks:</span><div className="font-medium text-gray-800">{p.tasksCompleted}/{p.tasksTotal}</div></div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <button type="button" onClick={() => openEditPeriod(p)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
                          Edit Period
                        </button>
                        <button type="button" onClick={() => openCreateAssignment(p)} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium">
                          Create Assignment
                        </button>
                        <button
                          type="button"
                          onClick={() => openClosePeriod(p)}
                          className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium"
                          disabled={p.status !== "active"}
                        >
                          Close Period
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Edit Period Modal */}
      {showEditModal && activePeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Period</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{activePeriod.name} • {activePeriod.domain}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={editData.startDate}
                  onChange={(e) => setEditData((d) => ({ ...d, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={editData.endDate}
                  onChange={(e) => setEditData((d) => ({ ...d, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                type="button"
                onClick={saveEditPeriod}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {savingEdit ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal (old-fields style) */}
      {showAssignModal && activePeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Create Task</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compliance/Standard :</label>
                <span className="text-gray-800 font-medium">{activePeriod.name}</span>
              </div>

              <div>
                <label htmlFor="complStartDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  id="complStartDate"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  value={activePeriod.startDate || ""}
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="complEndDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  id="complEndDate"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                  value={activePeriod.endDate || ""}
                  readOnly
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createAssignment}
                  disabled={savingAssign}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {savingAssign ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Period Modal */}
      {showCloseModal && activePeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Close Period</h3>
            </div>
            <p className="text-gray-600 mb-2">This will mark <span className="font-medium text-gray-800">{activePeriod.name}</span> as closed and prevent new assignments.</p>
            <p className="text-sm text-gray-500 mb-4">You can add an optional closing note below.</p>
            <textarea
              value={closeNote}
              onChange={(e) => setCloseNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional note"
            />
            <div className="flex gap-3 justify-end mt-6">
              <button type="button" onClick={() => setShowCloseModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                type="button"
                onClick={confirmClosePeriod}
                disabled={closingPeriod}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {closingPeriod ? "Closing…" : "Close Period"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global popup for ALL messages */}
      <PopupMessages
        open={pmOpen}
        kind={pmKind}
        title={pmTitle}
        message={pmMessage}
        actions={pmActions}
        onClose={() => setPmOpen(false)}
      />
    </div>
  );
};

export default Configuration;

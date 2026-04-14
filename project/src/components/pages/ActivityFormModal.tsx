//   frequency: string;           // Frequency (stores frequency ID as string)
//   justification: string;       // Justification
//   isApplicable: boolean;       // Applicable
// }
 
// interface ActivityFormModalProps {
//   open: boolean;
//   mode: ActivityFormMode;
//   initialValues?: Partial<ActivityFormValues>;
//   onClose: () => void;
 
//   /** Optional: fire when API succeeds; useful to refresh parent list */
//   onSaved?: (createdOrUpdated: any) => void;
 
//   /** Optional: bubble up backend success message for a toast/dialog */
//   onSuccessMessage?: (msg: string) => void;
 
//   /** Context needed by the API */
//   customerId?: number;               // fallback to sessionStorage
//   standardId: number;                // e.g., 1
//   controlId: string | number;        // control under which the activity belongs
// }
 
// /* ====== Lookup types ====== */
// type Option = { id: string; name: string };
 
// const getCustomerIdFromSession = (): number => {
//   try {
//     const raw = sessionStorage.getItem('customerId');
//     const n = raw != null ? Number(raw) : NaN;
//     return Number.isFinite(n) ? n : 4; // sensible fallback
//   } catch {
//     return 4;
//   }
// };
 
// // convert "30 minutes" -> 30, "2 hours" -> 120; default assume minutes
// const parseDurationToMinutes = (input: string): number => {
//   if (!input) return 0;
//   const n = parseInt(String(input).trim(), 10);
//   if (!Number.isFinite(n) || n < 0) return 0;
//   const lower = String(input).toLowerCase();
//   if (lower.includes('hour')) return n * 60;
//   return n;
// };
 
// export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
//   open,
//   mode,
//   initialValues,
//   onClose,
//   onSaved,
//   onSuccessMessage,
//   customerId,
//   standardId,
//   controlId,
// }) => {
//   /* ------- Form state ------- */
//   const [values, setValues] = useState<ActivityFormValues>({
//     id: initialValues?.id,
//     title: initialValues?.title ?? '',
//     description: initialValues?.description ?? '',
//     doerRole: initialValues?.doerRole ?? '',
//     approverRole: initialValues?.approverRole ?? '',
//     duration: initialValues?.duration ?? '',
//     frequency: initialValues?.frequency ?? '',
//     justification: initialValues?.justification ?? '',
//     isApplicable: initialValues?.isApplicable ?? true,
//   });
 
//   // Reset form whenever modal opens or the thing we edit changes
//   useEffect(() => {
//     if (!open) return;
//     setValues({
//       id: initialValues?.id,
//       title: initialValues?.title ?? '',
//       description: initialValues?.description ?? '',
//       doerRole: initialValues?.doerRole ?? '',
//       approverRole: initialValues?.approverRole ?? '',
//       duration: initialValues?.duration ?? '',
//       frequency: initialValues?.frequency ?? '',
//       justification: initialValues?.justification ?? '',
//       isApplicable: initialValues?.isApplicable ?? true,
//     });
//   }, [open, initialValues?.id]);
 
//   /* ------- Lookups ------- */
//   const [doerRoles, setDoerRoles] = useState<Option[]>([]);
//   const [approverRoles, setApproverRoles] = useState<Option[]>([]);
//   const [frequencies, setFrequencies] = useState<Option[]>([]);
//   const [loadingLookups, setLoadingLookups] = useState(false);
//   const [lookupError, setLookupError] = useState<string | null>(null);
 
//   useEffect(() => {
//     if (!open) return;
 
//     const cid = Number(customerId ?? getCustomerIdFromSession());
 
//     const fetchLookups = async () => {
//       setLoadingLookups(true);
//       setLookupError(null);
//       try {
//         const urls = [
//           `https://sajoan-b.techoptima.ai/api/LookUp/DoerRolelookup?CustomerId=${cid}`,
//           `https://sajoan-b.techoptima.ai/api/LookUp/ApproverRolelookup?CustomerId=${cid}`,
//           `https://sajoan-b.techoptima.ai/api/LookUp/FrequencyLookUp?CustomerId=${cid}`,
//         ];
 
//         const [doerRes, approverRes, freqRes] = await Promise.all(urls.map((u) => fetch(u)));
 
//         if (!doerRes.ok) throw new Error(`Doer roles lookup failed: ${doerRes.status}`);
//         if (!approverRes.ok) throw new Error(`Approver roles lookup failed: ${approverRes.status}`);
//         if (!freqRes.ok) throw new Error(`Frequency lookup failed: ${freqRes.status}`);
 
//         const [doerJson, approverJson, freqJson] = await Promise.all([
//           doerRes.json(),
//           approverRes.json(),
//           freqRes.json(),
//         ]);
 
//         // API sometimes returns array directly or wrapped in {data:[]}
//         const arr = (x: any): any[] => (Array.isArray(x?.data) ? x.data : Array.isArray(x) ? x : []);
 
//         const mappedDoers: Option[] = arr(doerJson).map((r: any, i: number) => ({
//           id: String(r?.doerRoleId ?? r?.id ?? i + 1),
//           name: String(r?.doerRole ?? r?.name ?? `Doer ${i + 1}`),
//         }));
 
//         const mappedApprovers: Option[] = arr(approverJson).map((r: any, i: number) => ({
//           id: String(r?.approverRoleId ?? r?.id ?? i + 1),
//           name: String(r?.approverRole ?? r?.name ?? `Approver ${i + 1}`),
//         }));
 
//         const mappedFreqs: Option[] = arr(freqJson).map((r: any, i: number) => ({
//           id: String(r?.frequencyId ?? r?.id ?? i + 1),
//           name: String(r?.frequencyName ?? r?.frequency ?? r?.name ?? `Frequency ${i + 1}`),
//         }));
 
//         setDoerRoles(mappedDoers);
//         setApproverRoles(mappedApprovers);
//         setFrequencies(mappedFreqs);
 
//         console.group('[ActivityFormModal] Lookups loaded');
//         console.log('CustomerId:', cid);
//         console.log('Doer roles:', mappedDoers);
//         console.log('Approver roles:', mappedApprovers);
//         console.log('Frequencies:', mappedFreqs);
//         console.groupEnd();
 
//         // If frequency not pre-filled, default to first option
//         setValues((v) => ({
//           ...v,
//           frequency: v.frequency || (mappedFreqs[0]?.id ?? ''),
//         }));
//       } catch (e: any) {
//         setLookupError(e?.message || 'Failed to load lookup values.');
//         setDoerRoles([]);
//         setApproverRoles([]);
//         setFrequencies([]);
//         console.error('[ActivityFormModal] Lookup error:', e);
//       } finally {
//         setLoadingLookups(false);
//       }
//     };
 
//     fetchLookups();
//   }, [open, customerId]);
 
//   /* ------- Submit (POST / PUT) ------- */
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
 
//   const buildPayload = () => {
//     const cid = Number(customerId ?? getCustomerIdFromSession());
 
//     // Resolve numeric IDs + duration
//     const doerRole = values.doerRole ? Number(values.doerRole) : 0;
//     const approverRole = values.approverRole ? Number(values.approverRole) : 0;
//     const frequencyId = values.frequency ? Number(values.frequency) : 0;
//     const duration = parseDurationToMinutes(values.duration);
//     const controlIdNum = Number(controlId);
//     const standardIdNum = Number(standardId);
//     const govId = 1; // set as needed
 
//     const payload = {
//       // ⚠️ EXACT backend keys (note the typo):
//       actvityTitle: values.title,
//       activityDescr: values.description,
//       doerRole,
//       frequencyId,
//       duration,
//       approverRole,
//       customerId: cid,
//       controlId: controlIdNum,
//       standardId: standardIdNum,
//       govId,
//       isApplicable: values.isApplicable === true,
//       justification: values.justification || 'Periodic control verification.',
//     };
 
//     // Dev console
//     console.group('[ActivityFormModal] Submit');
//     console.log('Mode:', mode);
//     console.log(
//       'URL:',
//       mode === 'edit'
//         ? `https://sajoan-b.techoptima.ai/api/ActivityMaster?ActivityId=${values.id}`
//         : 'https://sajoan-b.techoptima.ai/api/ActivityMaster/NewActivityInStandard'
//     );
//     console.log('Method:', mode === 'edit' ? 'PUT' : 'POST');
//     console.log('Payload:', payload);
//     console.groupEnd();
 
//     return { payload, cid, controlIdNum, standardIdNum, doerRole, approverRole, frequencyId };
//   };
 
//   const guardrails = (p: ReturnType<typeof buildPayload>) => {
//     if (!p.payload.actvityTitle?.trim()) return 'Activity Title is required.';
//     if (!p.payload.activityDescr?.trim()) return 'Activity Description is required.';
//     if (!p.doerRole || !p.approverRole || !p.frequencyId)
//       return 'Please select Doer, Approver and Frequency.';
//     if (!p.controlIdNum || !p.standardIdNum || !p.cid)
//       return 'Missing control/standard/customer context.';
//     return null;
//   };
 
//   const submitToApi = async () => {
//     setSubmitting(true);
//     setSubmitError(null);
 
//     const built = buildPayload();
//     const guard = guardrails(built);
//     if (guard) {
//       setSubmitting(false);
//       setSubmitError(guard);
//       console.warn('[ActivityFormModal] Guard:', guard);
//       return;
//     }
 
//     try {
//       const url =
//         mode === 'edit'
//           ? `https://sajoan-b.techoptima.ai/api/ActivityMaster?ActivityId=${values.id}`
//           : `https://sajoan-b.techoptima.ai/api/ActivityMaster/NewActivityInStandard`;
 
//       const res = await fetch(url, {
//         method: mode === 'edit' ? 'PUT' : 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(built.payload),
//       });
 
//       const text = await res.text();
//       let json: any = null;
//       try {
//         json = text ? JSON.parse(text) : null;
//       } catch {
//         /* ignore non-JSON */
//       }
 
//       console.group('[ActivityFormModal] Response');
//       console.log('HTTP status:', res.status);
//       console.log('Raw text:', text);
//       console.log('Parsed JSON:', json);
//       console.groupEnd();
 
//       if (!res.ok) {
//         // Surface backend model-validation errors if present
//         const serverMsg =
//           (json && (json.message || json.Message || json.error)) ||
//           (json && json.errors && Object.keys(json.errors).length
//             ? Object.entries(json.errors)
//                 .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
//                 .join(' | ')
//             : `HTTP ${res.status}`);
//         throw new Error(serverMsg);
//       }
 
//       const msg =
//         (json && (json.message || json.Message || json.msg)) ||
//         (mode === 'edit' ? 'Activity updated successfully.' : 'Activity created successfully.');
 
//       onSuccessMessage?.(msg);
//       onSaved?.(json?.data ?? json);
 
//       setSubmitting(false);
//       onClose();
//     } catch (e: any) {
//       setSubmitting(false);
//       setSubmitError(e?.message || (mode === 'edit' ? 'Failed to update activity.' : 'Failed to create activity.'));
//       console.error('[ActivityFormModal] Submit error:', e);
//     }
//   };
 
//   /* ------- Helpers ------- */
//   const header = useMemo(() => (mode === 'edit' ? 'Edit Activity' : 'New Activity'), [mode]);
 
//   const nameById = (list: Option[], id: string) => list.find((o) => o.id === id)?.name ?? '';
 
//   if (!open) return null;
 
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-black/30" onClick={onClose} />
//       {/* Panel */}
//       <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
//         <div className="flex items-start justify-between mb-4">
//           <h3 className="text-xl font-semibold text-gray-900">{header}</h3>
//           <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             ✕
//           </button>
//         </div>
 
//         {/* Error banners */}
//         {lookupError && (
//           <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
//             {lookupError}
//           </div>
//         )}
//         {submitError && (
//           <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
//             {submitError}
//           </div>
//         )}
 
//         {/* Form */}
//         <div className="space-y-4">
//           {/* Activity name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name*</label>
//             <input
//               type="text"
//               value={values.title}
//               onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
//               placeholder="Enter activity name"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
 
//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Activity Description*</label>
//             <textarea
//               value={values.description}
//               onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
//               rows={4}
//               placeholder="Describe the activity"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
 
//           {/* Roles */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Doer Role*</label>
//               <select
//                 value={values.doerRole}
//                 onChange={(e) => setValues((v) => ({ ...v, doerRole: e.target.value }))}
//                 disabled={loadingLookups || submitting}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">{loadingLookups ? 'Loading…' : 'Select role...'}</option>
//                 {doerRoles.map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
 
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Approver Role*</label>
//               <select
//                 value={values.approverRole}
//                 onChange={(e) => setValues((v) => ({ ...v, approverRole: e.target.value }))}
//                 disabled={loadingLookups || submitting}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">{loadingLookups ? 'Loading…' : 'Select role...'}</option>
//                 {approverRoles.map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
 
//           {/* Duration / Frequency */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Duration*</label>
//               <input
//                 type="text"
//                 value={values.duration}
//                 onChange={(e) => setValues((v) => ({ ...v, duration: e.target.value }))}
//                 placeholder='e.g., "30", "45 minutes", "2 hours"'
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Frequency*</label>
//               <select
//                 value={values.frequency}
//                 onChange={(e) => setValues((v) => ({ ...v, frequency: e.target.value }))}
//                 disabled={loadingLookups || submitting}
//                 className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">{loadingLookups ? 'Loading…' : 'Select frequency...'}</option>
//                 {frequencies.map((opt) => (
//                   <option key={opt.id} value={opt.id}>
//                     {opt.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
 
//           {/* Justification */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Justification*</label>
//             <textarea
//               value={values.justification}
//               onChange={(e) => setValues((v) => ({ ...v, justification: e.target.value }))}
//               rows={3}
//               placeholder="Justify the need for this activity"
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>
 
//           {/* Applicable */}
//           <div>
//             <span className="block text-sm font-medium text-gray-700 mb-1">Applicable:</span>
//             <div className="flex items-center gap-6 text-sm">
//               <label className="inline-flex items-center gap-2">
//                 <input
//                   type="radio"
//                   checked={values.isApplicable === true}
//                   onChange={() => setValues((v) => ({ ...v, isApplicable: true }))}
//                   disabled={submitting}
//                 />
//                 Yes
//               </label>
//               <label className="inline-flex items-center gap-2">
//                 <input
//                   type="radio"
//                   checked={values.isApplicable === false}
//                   onChange={() => setValues((v) => ({ ...v, isApplicable: false }))}
//                   disabled={submitting}
//                 />
//                 No
//               </label>
//             </div>
//           </div>
//         </div>
 
//         {/* Actions */}
//         <div className="flex justify-end gap-2 mt-6">
//           <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
//             disabled={submitting}
//           >
//             Cancel
//           </button>
//           <button
//             type="button"
//             onClick={submitToApi}
//             className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
//             disabled={loadingLookups || submitting}
//           >
//             {submitting ? 'Submitting…' : mode === 'edit' ? 'Update' : 'Submit'}
//           </button>
//         </div>
// src/components/pages/ActivityFormModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityAPI } from '../../services/activityService';

export type ActivityFormMode = 'add' | 'edit';


export interface ActivityFormValues {
  id?: string;
  title: string;
  description: string;
  doerRole: string;
  approverRole: string;
  duration: string;
  frequency: string;
  justification: string;
  isApplicable: boolean;
}

interface ActivityFormModalProps {
  open: boolean;
  mode: ActivityFormMode;
  initialValues?: Partial<ActivityFormValues>;
  onClose: () => void;
  onSaved?: (createdOrUpdated: any) => void;
  onSuccessMessage?: (msg: string) => void;
  customerId?: number;
  standardId: number;
  controlId: string | number;
}

type Option = { id: string; name: string };

const getCustomerIdFromSession = (): number => {
  try {
    const raw = sessionStorage.getItem('customerId');
    const n = raw != null ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : 4;
  } catch {
    return 4;
  }
};

// "30 minutes" -> 30, "2 hours" -> 120; default assume minutes
const parseDurationToMinutes = (input: string): number => {
  if (!input) return 0;
  const n = parseInt(String(input).trim(), 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  const lower = String(input).toLowerCase();
  if (lower.includes('hour')) return n * 60;
  return n;
};

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  open,
  mode,
  initialValues,
  onClose,
  onSaved,
  onSuccessMessage,
  customerId,
  standardId,
  controlId,
}) => {
  const [values, setValues] = useState<ActivityFormValues>({
    id: initialValues?.id,
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    doerRole: initialValues?.doerRole ?? '',
    approverRole: initialValues?.approverRole ?? '',
    duration: initialValues?.duration ?? '',
    frequency: initialValues?.frequency ?? '',
    justification: initialValues?.justification ?? '',
    isApplicable: initialValues?.isApplicable ?? true,
  });

  useEffect(() => {
    if (!open) return;
    setValues({
      id: initialValues?.id,
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      doerRole: initialValues?.doerRole ?? '',
      approverRole: initialValues?.approverRole ?? '',
      duration: initialValues?.duration ?? '',
      frequency: initialValues?.frequency ?? '',
      justification: initialValues?.justification ?? '',
      isApplicable: initialValues?.isApplicable ?? true,
    });
  }, [open, initialValues?.id]);

  /* ------- Lookups ------- */
  const [doerRoles, setDoerRoles] = useState<Option[]>([]);
  const [approverRoles, setApproverRoles] = useState<Option[]>([]);
  const [frequencies, setFrequencies] = useState<Option[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const cid = Number(customerId ?? getCustomerIdFromSession());
    const govId = 1; // TODO: Get from session or props if needed
    
    const fetchLookups = async () => {
      setLoadingLookups(true);
      setLookupError(null);
      try {
        // Use the authenticated ActivityAPI methods which handle all the complexity
        const [doers, approvers, freqs] = await Promise.all([
          ActivityAPI.doerRoles(cid, govId),
          ActivityAPI.approverRoles(cid, govId),
          ActivityAPI.frequencies(cid, govId),
        ]);

        // Convert numeric IDs to strings for storage
        const doerOptions: Option[] = doers.map((d) => ({
          id: String(d.id),
          name: d.name,
        }));
        const approverOptions: Option[] = approvers.map((a) => ({
          id: String(a.id),
          name: a.name,
        }));
        const freqOptions: Option[] = freqs.map((f) => ({
          id: String(f.id),
          name: f.name,
        }));

        setDoerRoles(doerOptions);
        setApproverRoles(approverOptions);
        setFrequencies(freqOptions);

        // Default frequency to first option if not already set
        setValues((v) => ({ ...v, frequency: v.frequency || (freqOptions[0]?.id ?? '') }));
      } catch (e: any) {
        setLookupError(e?.message || 'Failed to load lookup values.');
        setDoerRoles([]);
        setApproverRoles([]);
        setFrequencies([]);
        console.error('Error loading lookup values:', e);
      } finally {
        setLoadingLookups(false);
      }
    };

    fetchLookups();
  }, [open, customerId]);

  /* ------- Submit ------- */
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalize = () => {
    const cid = Number(customerId ?? getCustomerIdFromSession());
    const doerRoleNum = values.doerRole ? Number(values.doerRole) : 0;
    const approverRoleNum = values.approverRole ? Number(values.approverRole) : 0;
    const frequencyIdNum = values.frequency ? Number(values.frequency) : 0;
    const durationMins = parseDurationToMinutes(values.duration) || 30; // avoid 0 rejections
    const controlIdNum = Number(controlId);
    const standardIdNum = Number(standardId);
    const govId = 1;

    // what both endpoints need, just different casing
    return {
      title: values.title,
      descr: values.description,
      doerRoleNum,
      approverRoleNum,
      frequencyIdNum,
      durationMins,
      cid,
      controlIdNum,
      standardIdNum,
      govId,
      applicable: values.isApplicable === true,
      justification: values.justification || 'Periodic control verification.',
    };
  };

  // payload the POST action (camelCase)
  const buildPostBody = () => {
    const n = normalize();
    return {
      activityTitle: n.title,
      activityDescr: n.descr,
      doerRole: n.doerRoleNum,
      approverRole: n.approverRoleNum,
      frequencyId: n.frequencyIdNum,
      duration: n.durationMins,
      customerId: n.cid,
      controlId: n.controlIdNum,
      standardId: n.standardIdNum,
      govId: n.govId,
      isApplicable: n.applicable,
      justification: n.justification,
    };
  };

  // payload the PUT action (PascalCase)
  const buildPutBody = () => {
    const n = normalize();
    return {
      ActivityTitle: n.title,
      ActivityDescr: n.descr,
      DoerRole: n.doerRoleNum,
      ApproverRole: n.approverRoleNum,
      FrequencyId: n.frequencyIdNum,
      Duration: n.durationMins,
      CustomerId: n.cid,
      ControlId: n.controlIdNum,
      StandardId: n.standardIdNum,
      GovId: n.govId,
      IsApplicable: n.applicable,
      Justification: n.justification,
    };
  };

  const guardrails = (body: any) => {
    const title = body.ActivityTitle ?? body.activityTitle;
    const descr = body.ActivityDescr ?? body.activityDescr;
    if (!String(title || '').trim()) return 'Activity Title is required.';
    if (!String(descr || '').trim()) return 'Activity Description is required.';
    if (!(body.DoerRole ?? body.doerRole) ||
        !(body.ApproverRole ?? body.approverRole) ||
        !(body.FrequencyId ?? body.frequencyId)) {
      return 'Please select Doer, Approver and Frequency.';
    }
    if (!(body.ControlId ?? body.controlId) ||
        !(body.StandardId ?? body.standardId) ||
        !(body.CustomerId ?? body.customerId)) {
      return 'Missing control/standard/customer context.';
    }
    return null;
  };

  const submitToApi = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const base = '${API_BASE}/api/ActivityMaster';
    const url = mode === 'edit'
      ? `${base}?ActivityId=${values.id}`
      : `${base}/NewActivityInStandard`;

    const body = mode === 'edit' ? buildPutBody() : buildPostBody();
    const guard = guardrails(body);
    if (guard) {
      setSubmitting(false);
      setSubmitError(guard);
      return;
    }

    try {
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });

      const txt = await res.text();
      let json: any = null;
      try { json = txt ? JSON.parse(txt) : null; } catch {}

      if (!res.ok) {
        const serverMsg =
          (json && (json.message || json.Message || json.error)) ||
          (json && json.errors && Object.keys(json.errors).length
            ? Object.entries(json.errors)
                .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
                .join(' | ')
            : `HTTP ${res.status}`);
        throw new Error(serverMsg);
      }

      const msg =
        (json && (json.message || json.Message || json.msg)) ||
        (mode === 'edit' ? 'Activity updated successfully.' : 'Activity created successfully.');
      onSuccessMessage?.(msg);
      onSaved?.({ ...values });
      setSubmitting(false);
      onClose();
    } catch (e: any) {
      setSubmitting(false);
      setSubmitError(e?.message || (mode === 'edit' ? 'Failed to update activity.' : 'Failed to create activity.'));
    }
  };

  /* ------- UI ------- */
  const header = useMemo(() => (mode === 'edit' ? 'Edit Activity' : 'New Activity'), [mode]);
  const nameById = (list: Option[], id: string) => list.find((o) => o.id === id)?.name ?? '';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{header}</h3>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {lookupError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {lookupError}
          </div>
        )}
        {submitError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {submitError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name*</label>
            <input
              type="text"
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              placeholder="Enter activity name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Description*</label>
            <textarea
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              rows={4}
              placeholder="Describe the activity"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doer Role*</label>
              <select
                value={values.doerRole}
                onChange={(e) => setValues((v) => ({ ...v, doerRole: e.target.value }))}
                disabled={loadingLookups || submitting}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{loadingLookups ? 'Loading…' : 'Select role...'}</option>
                {doerRoles.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approver Role*</label>
              <select
                value={values.approverRole}
                onChange={(e) => setValues((v) => ({ ...v, approverRole: e.target.value }))}
                disabled={loadingLookups || submitting}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{loadingLookups ? 'Loading…' : 'Select role...'}</option>
                {approverRoles.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration*</label>
              <input
                type="text"
                value={values.duration}
                onChange={(e) => setValues((v) => ({ ...v, duration: e.target.value }))}
                placeholder='e.g., "30", "45 minutes", "2 hours"'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency*</label>
              <select
                value={values.frequency}
                onChange={(e) => setValues((v) => ({ ...v, frequency: e.target.value }))}
                disabled={loadingLookups || submitting}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{loadingLookups ? 'Loading…' : 'Select frequency...'}</option>
                {frequencies.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Justification*</label>
            <textarea
              value={values.justification}
              onChange={(e) => setValues((v) => ({ ...v, justification: e.target.value }))}
              rows={3}
              placeholder="Justify the need for this activity"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-1">Applicable:</span>
            <div className="flex items-center gap-6 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={values.isApplicable === true}
                  onChange={() => setValues((v) => ({ ...v, isApplicable: true }))}
                  disabled={submitting}
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={values.isApplicable === false}
                  onChange={() => setValues((v) => ({ ...v, isApplicable: false }))}
                  disabled={submitting}
                />
                No
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitToApi}
            className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
            disabled={loadingLookups || submitting}
          >
            {submitting ? 'Submitting…' : mode === 'edit' ? 'Update' : 'Submit'}
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {values.doerRole && <span className="mr-4">Doer: {nameById(doerRoles, values.doerRole)}</span>}
          {values.approverRole && <span className="mr-4">Approver: {nameById(approverRoles, values.approverRole)}</span>}
          {values.frequency && <span>Frequency: {nameById(frequencies, values.frequency)}</span>}
        </div>
      </div>
    </div>
  );
};




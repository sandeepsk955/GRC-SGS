// // src/components/portfolio/EditModal.tsx
// import React, { useState } from 'react';
// import { Requirement } from '../pages/Portfolio';

// interface EditModalProps {
//   requirement: Requirement;
//   onClose: () => void;
//   onSave: (updated: Requirement) => void;

//   /** Provided by parent */
//   customerId: number;
//   standardId: number;

//   /** NEW: parent can show success dialog with this message */
//   onSuccessMessage?: (msg: string) => void;
// }

// export const EditModal: React.FC<EditModalProps> = ({
//   requirement,
//   onClose,
//   onSave,
//   customerId,
//   standardId,
//   onSuccessMessage,
// }) => {
//   const [isApplicable, setIsApplicable] = useState(requirement.isApplicable ?? true);
//   const [justification, setJustification] = useState(requirement.justification ?? '');
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSave = async () => {
//     setSaving(true);
//     setError(null);
//     try {
//       const baseUrl =
//         'https://sajoan-b.techoptima.ai/api/ActivityMaster/updateRequirments';
//       const qs = new URLSearchParams({
//         CustomerId: String(customerId ?? 4),
//         StandardId: String(standardId ?? 1),
//         RequirementId: String(requirement.id),
//       });

//       const resp = await fetch(`${baseUrl}?${qs.toString()}`, {
//         method: 'PUT', // change to 'POST' if your API expects it
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           isApplicable,
//           justification,
//         }),
//       });

//       // Try to capture backend message nicely
//       let successMsg = '';
//       if (!resp.ok) {
//         const text = await resp.text().catch(() => '');
//         throw new Error(`HTTP ${resp.status}${text ? ` — ${text}` : ''}`);
//       } else {
//         // Prefer JSON { message } if provided; fall back to plain text or a default
//         const contentType = resp.headers.get('content-type') || '';
//         if (contentType.includes('application/json')) {
//           const data = await resp.json().catch(() => null);
//           successMsg = (data && (data.message || data.Message)) || 'Updated successfully.';
//         } else {
//           const text = await resp.text().catch(() => '');
//           successMsg = text || 'Updated successfully.';
//         }
//       }

//       // Update UI
//       onSave({
//         ...requirement,
//         isApplicable,
//         justification,
//       });

//       setSaving(false);
//       onClose();

//       // Ask parent to show the success dialog with the server message
//       if (onSuccessMessage) onSuccessMessage(successMsg);
//     } catch (e: any) {
//       setSaving(false);
//       setError(e?.message || 'Failed to save changes');
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/30" onClick={onClose} />
//       <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
//         <h4 className="text-lg font-semibold text-gray-900 mb-4">
//           Edit Requirement — {requirement.title}
//         </h4>

//         <div className="space-y-4">
//           {/* Applicable toggle */}
//           <div className="flex items-center justify-between">
//             <label className="text-sm font-medium text-gray-700">Is Applicable</label>
//             <div className="flex items-center gap-3">
//               <button
//                 type="button"
//                 onClick={() => setIsApplicable(true)}
//                 className={`px-3 py-1 rounded-lg text-sm ${
//                   isApplicable ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
//                 }`}
//                 disabled={saving}
//               >
//                 Yes
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setIsApplicable(false)}
//                 className={`px-3 py-1 rounded-lg text-sm ${
//                   !isApplicable ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
//                 }`}
//                 disabled={saving}
//               >
//                 No
//               </button>
//             </div>
//           </div>

//           {/* Justification */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Justification
//             </label>
//             <textarea
//               value={justification}
//               onChange={(e) => setJustification(e.target.value)}
//               rows={4}
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="Enter a clear justification…"
//               disabled={saving}
//             />
//           </div>

//           {error && <div className="text-sm text-red-600">{error}</div>}

//           <div className="flex justify-end gap-2 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
//               disabled={saving}
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleSave}
//               className="px-4 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
//               disabled={saving}
// src/components/pages/EditModal.tsx
import React, { useState } from 'react';
import { updateRequirement } from '../../services/standardsService';
import type { Requirement } from './Portfolio'; // adjust path if your Portfolio lives elsewhere

interface EditModalProps {
  requirement: Requirement;
  onClose: () => void;
  onSave: (updated: Requirement) => void;

  customerId: number;
  standardId: number;
  onSuccessMessage?: (msg: string) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  requirement,
  onClose,
  onSave,
  customerId,
  standardId,
  onSuccessMessage,
}) => {
  const [isApplicable, setIsApplicable] = useState(requirement.isApplicable ?? true);
  const [justification, setJustification] = useState(requirement.justification ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const resp = await updateRequirement(
        Number(customerId ?? 4),
        Number(standardId ?? 1),
        requirement.id,
        {
          isApplicable,
          justification,
          requirementID: Number(requirement.id),
        }
      );

      const successMsg =
        (resp && (resp.message as string)) || 'Updated successfully.';

      onSave({
        ...requirement,
        isApplicable,
        justification,
      });

      setSaving(false);
      onClose();
      onSuccessMessage?.(successMsg);
    } catch (e: any) {
      setSaving(false);
      setError(e?.message || 'Failed to save changes');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Edit Requirement</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirement</label>
            <input
              value={requirement.title}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Applicable :</span>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="req-applicable"
                checked={isApplicable === true}
                onChange={() => setIsApplicable(true)}
                disabled={saving}
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="req-applicable"
                checked={isApplicable === false}
                onChange={() => setIsApplicable(false)}
                disabled={saving}
              />
              <span>No</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a clear justification…"
              disabled={saving}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-sm bg-green-700 hover:bg-green-800 text-white disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

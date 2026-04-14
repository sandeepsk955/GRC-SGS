// src/components/pages/ControlEditModal.tsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { updateControl } from '../../services/standardsService';
import type { Control } from './Portfolio'; // adjust if your Portfolio path differs

interface ControlEditModalProps {
  open: boolean;
  control: Control | null;
  customerId: number;
  standardId: number;
  onClose: () => void;
  onSave: (updated: Control) => void;           // patch UI
  onSuccessMessage?: (msg: string) => void;     // show dialog
}

export const ControlEditModal: React.FC<ControlEditModalProps> = ({
  open,
  control,
  customerId,
  standardId,
  onClose,
  onSave,
  onSuccessMessage,
}) => {
  const [isApplicable, setIsApplicable] = useState<boolean>(true);
  const [justification, setJustification] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (control) {
      setIsApplicable(control.isApplicable ?? true);
      setJustification(control.justification ?? '');
      setError(null);
    }
  }, [control]);

  if (!open || !control) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const controlApiId = control.ctrlIdForL3 ?? control.id;

      const resp = await updateControl(
        Number(customerId ?? 4),
        Number(standardId ?? 1),
        controlApiId,
        { isApplicable, justification }
      );

      const successMsg =
        (resp && (resp.message as string)) || 'Updated successfully.';

      // Optimistic UI update
      onSave({
        ...control,
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
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h4 className="text-lg font-semibold text-gray-900">Edit Control</h4>
          <button className="p-1 rounded hover:bg-gray-100" onClick={onClose} title="Close">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Control</label>
            <input
              value={control.title}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Applicable :</span>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="ctrl-applicable"
                checked={isApplicable === true}
                onChange={() => setIsApplicable(true)}
                disabled={saving}
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="ctrl-applicable"
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
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t flex justify-end gap-2">
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
  );
};

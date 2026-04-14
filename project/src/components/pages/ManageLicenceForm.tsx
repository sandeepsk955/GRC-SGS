// ManageLicenceForm.tsx
import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  updateLicense,
  type ViewManageLicense,
} from '../../services/managelicenceservice.ts';

type Props = {
  open: boolean;
  onClose: () => void;
  license: ViewManageLicense | null;
  onUpdated: () => void;
  onPopup: (kind: 'success' | 'error', message: string) => void;
};

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function addYears(isoDate: string, years: number) {
  const d = new Date(isoDate + 'T00:00:00');
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function cooldownActive(licnId: number) {
  const k = `licenseUpdate:${licnId}`;
  const t = localStorage.getItem(k);
  if (!t) return false;
  const last = Number(t);
  if (Number.isNaN(last)) return false;
  return Date.now() - last < COOLDOWN_MS;
}

const ManageLicenceForm: React.FC<Props> = ({
  open,
  onClose,
  license,
  onUpdated,
  onPopup,
}) => {
  const [years, setYears] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const previewEnd = useMemo(
    () => (license ? addYears(license.endDate, years) : ''),
    [license, years]
  );

  if (!open || !license) return null;

  const submit = async () => {
    // Extra safety: block if within 24h
    if (cooldownActive(license.licnId)) {
      const msg = 'This license was updated in the last 24 hours. Please try again later.';
      setLocalError(msg);
      onPopup('error', msg);
      return;
    }

    try {
      setBusy(true);
      setLocalError('');
      const payload = {
        licnId: license.licnId,
        editedBy: 1,
        startOrRenewalDate: license.startOrRenewalDate,
        country: license.country,
        contractPeriodInMonths: years * 12, // API expects months
        contractDocuments: license.contractDocuments,
        remarks: license.remarks,
        endDate: previewEnd,
        customerId: license.customerId,
        standardId: license.standardId,
        approvedBy: 1,
        approved: license.approved,
        isActive: license.isActive,
      };

      const resp = await updateLicense(payload);
      // mark cooldown
      localStorage.setItem(`licenseUpdate:${license.licnId}`, String(Date.now()));

      const msg = resp?.message || 'License updated successfully';
      onPopup('success', msg);
      onUpdated();
      onClose();
    } catch (e: any) {
      const msg = e?.message || 'Update failed';
      setLocalError(msg);
      onPopup('error', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">Extend License</h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="text-sm text-gray-700">
            <div className="font-medium">{license.standardName}</div>
            <div className="text-gray-500">Current expiry: {license.endDate}</div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Extend by (years)
            </label>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value={1}>1 year</option>
              <option value={2}>2 years</option>
              <option value={3}>3 years</option>
            </select>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            New expiry will be <span className="font-semibold">{previewEnd}</span>
          </div>

          {localError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {localError}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Updating…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageLicenceForm;

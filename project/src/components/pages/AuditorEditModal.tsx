import React from 'react';

/** Use env if set; otherwise fall back to your dev IP */
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE_URL || ((import.meta as any)?.env?.DEV ? '/api' : 'https://sajoan-b.techoptima.ai/api');

type ApiEnvelope<T = any> = {
  statusCode?: number;
  message?: string;
  data?: T;
  [k: string]: any;
};

type AuditStatus = { id: number; name: string };

/* --------------------------- helpers ---------------------------------- */

async function parseJsonSafe(res: Response): Promise<any> {
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    const trimmed = text.trim().replace(/^\uFEFF/, '');
    try { return JSON.parse(trimmed); } catch {
      console.warn('[AuditorEditModal] Non-JSON response:', trimmed.slice(0, 200));
      throw new Error(`Unexpected server response (HTTP ${res.status}).`);
    }
  }
}

function findFirstArray(o: any): any[] | null {
  if (!o || typeof o !== 'object') return null;
  if (Array.isArray(o)) return o;
  for (const k of ['data', 'result', 'value', 'items', 'records', 'list']) {
    if (Array.isArray(o?.[k])) return o[k];
  }
  for (const k of Object.keys(o)) {
    if (Array.isArray(o[k])) return o[k];
  }
  return null;
}

function normalizeStatuses(input: any): AuditStatus[] {
  const arr = Array.isArray(input) ? input : findFirstArray(input);
  if (!arr) return [];
  const out: AuditStatus[] = [];
  for (const raw of arr) {
    if (!raw) continue;
    if (raw.id != null && raw.name != null) {
      out.push({ id: Number(raw.id), name: String(raw.name) });
    } else if (raw.id != null && raw.status != null) {
      out.push({ id: Number(raw.id), name: String(raw.status) }); // Added to handle id/status
    } else if (raw.statusId != null && raw.statusName != null) {
      out.push({ id: Number(raw.statusId), name: String(raw.statusName) });
    } else if (raw.lookupId != null && raw.lookupName != null) {
      out.push({ id: Number(raw.lookupId), name: String(raw.lookupName) });
    } else if (raw.auditStatusId != null && raw.auditStatus != null) {
      out.push({ id: Number(raw.auditStatusId), name: String(raw.auditStatus) });
    } else if (raw.value != null && raw.text != null) {
      out.push({ id: Number(raw.value), name: String(raw.text) });
    } else if (raw.name != null) {
      out.push({ id: out.length + 1, name: String(raw.name) });
    }
  }
  return out;
}

const DEFAULT_STATUSES: AuditStatus[] = [
  { id: 1, name: 'Conformity' },
  { id: 2, name: 'Minor NC' },
  { id: 3, name: 'Major NC' },
];

/* --------------------------- component -------------------------------- */

export interface AuditorEditModalProps {
  open: boolean;
  controlId: string | number | null;
  customerId: number;

  initialComments?: string | null;
  initialStatusId?: number | null;

  onClose: () => void;
  onSaved: (saved: { statusId: number; statusName: string; comments: string }) => void;
  onSuccessMessage?: (msg: string) => void;
}

export const AuditorEditModal: React.FC<AuditorEditModalProps> = ({
  open,
  controlId,
  customerId,
  initialComments,
  initialStatusId,
  onClose,
  onSaved,
  onSuccessMessage,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [statuses, setStatuses] = React.useState<AuditStatus[]>([]);
  const [statusId, setStatusId] = React.useState<number | ''>(initialStatusId ?? '');
  const [comments, setComments] = React.useState<string>(initialComments ?? '');

  const [noData, setNoData] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!open || !customerId) return;
    setLoading(true);
    setError(null);
    setNoData(false);

    try {
      const sRes = await fetch(
        `${API_BASE}/LookUp/GetAuditStatus?CustomerId=${encodeURIComponent(customerId)}`,
        {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: { accept: 'application/json, text/plain, */*' },
        }
      );
      if (!sRes.ok) throw new Error(`GetAuditStatus failed (HTTP ${sRes.status})`);
      const sJson = await parseJsonSafe(sRes);
      console.log('Raw API Response:', sJson); // Debug log
      const list = normalizeStatuses(sJson);
      console.log('Normalized Statuses:', list); // Debug log
      setStatuses(list);
      setNoData(list.length === 0);

      if (controlId && (initialComments == null || initialStatusId == null)) {
        const cRes = await fetch(
          `${API_BASE}/Audit/GetControlInfo?controlId=${encodeURIComponent(
            String(controlId)
          )}&CustomerId=${encodeURIComponent(customerId)}`,
          {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: { accept: 'application/json, text/plain, */*' },
          }
        );
        if (cRes.ok) {
          const cJson = await parseJsonSafe(cRes);
          const info = (cJson?.data ?? cJson) || {};
          const preId =
            info?.preCapaStatusId != null ? Number(info.preCapaStatusId) : undefined;
          const preComments =
            info?.preCapaComments != null ? String(info.preCapaComments ?? '') : undefined;

          if (initialStatusId == null) setStatusId(preId ?? '');
          if (initialComments == null) setComments(preComments ?? '');
        }
      } else {
        setStatusId(initialStatusId ?? '');
        setComments(initialComments ?? '');
      }
    } catch (e: any) {
      console.error('[AuditorEditModal] loadData error:', e);
      setError(e?.message || 'Failed to load audit data.');
    } finally {
      setLoading(false);
    }
  }, [open, customerId, controlId, initialComments, initialStatusId]);

  React.useEffect(() => {
    if (open) void loadData();
  }, [open, loadData]);

  const resetAndClose = () => {
    setError(null);
    setSaving(false);
    onClose();
  };

  const handleSave = async () => {
    if (!controlId) return;
    if (statusId === '' || statusId == null) {
      setError('Please select a compliance status.');
      return;
    }
    if (!comments || comments.trim().length < 10) {
      setError('Comments must be at least 10 characters.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        controlId: Number(controlId),
        customerId: Number(customerId),
        comments: comments.trim(),
        intialAuditStatus: Number(statusId),
      };

      const res = await fetch(`${API_BASE}/Audit/UpdateAuditorComments`, {
        method: 'PUT',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
      });

      const json = await parseJsonSafe(res);

      if (res.ok && (json?.statusCode === 200 || typeof json?.statusCode === 'undefined')) {
        const statusName = statuses.find((s) => s.id === Number(statusId))?.name || 'Updated';
        onSaved({ statusId: Number(statusId), statusName, comments: comments.trim() });
        onSuccessMessage?.(json?.message || 'Initial audit updated successfully.');
        resetAndClose();
      } else {
        throw new Error(json?.message || `Update failed (HTTP ${res.status})`);
      }
    } catch (e: any) {
      console.error('[AuditorEditModal] save error:', e);
      setError(e?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={resetAndClose} />
      <div className="relative bg-white w-full max-w-xl rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Update Initial Audit Compliance
        </h3>

        {loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : (
          <>
            {error && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            {noData && !error && (
              <div className="mb-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                No compliance statuses were returned. You can reload or load defaults.
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => loadData()}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                  >
                    Reload
                  </button>
                  <button
                    onClick={() => setStatuses(DEFAULT_STATUSES)}
                    className="px-3 py-1 rounded bg-gray-700 text-white text-xs hover:bg-gray-800"
                  >
                    Load defaults
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compliance Status
                </label>
                <select
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select status…</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your audit comments (min 10 characters)…"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={resetAndClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                disabled={saving || statusId === '' || !comments || comments.trim().length < 10}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
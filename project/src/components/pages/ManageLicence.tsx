// ManageLicence.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Eye, Clock } from 'lucide-react';
import {
  getLicensesByCustomer,
  type ViewManageLicense,
} from '../../services/managelicenceservice.ts';
import ManageLicenceForm from './ManageLicenceForm';

const defaultFeatures = ['Risk Management', 'Audit Tools', 'Compliance Tracking'];
const EXPIRY_THRESHOLD_DAYS = 365;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

function daysUntil(dateIso: string) {
  const end = new Date(dateIso + 'T00:00:00').getTime();
  const now = Date.now();
  return Math.floor((end - now) / (1000 * 60 * 60 * 24));
}

function isExpiringSoon(endDate: string) {
  return daysUntil(endDate) <= EXPIRY_THRESHOLD_DAYS;
}

function wasUpdatedWithin24h(licnId: number) {
  const k = `licenseUpdate:${licnId}`;
  const t = localStorage.getItem(k);
  if (!t) return false;
  const last = Number(t);
  if (Number.isNaN(last)) return false;
  return Date.now() - last < COOLDOWN_MS;
}

// ---------- Simple popup modal ----------
type PopupKind = 'success' | 'error';
const PopupModal: React.FC<{
  open: boolean;
  kind: PopupKind;
  title: string;
  message: string;
  onClose: () => void;
}> = ({ open, kind, title, message, onClose }) => {
  if (!open) return null;
  const bar = kind === 'success' ? 'bg-emerald-600' : 'bg-red-600';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className={`h-2 rounded-t-xl ${bar}`} />
        <div className="p-5">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="whitespace-pre-line text-sm text-gray-700">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
// ---------------------------------------

const ManageLicence: React.FC = () => {
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [licenses, setLicenses] = useState<ViewManageLicense[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ViewManageLicense | null>(null);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupKind, setPopupKind] = useState<PopupKind>('success');
  const [popupTitle, setPopupTitle] = useState<string>('Success');
  const [popupMsg, setPopupMsg] = useState<string>('');

  const showPopup = (kind: PopupKind, title: string, msg: string) => {
    setPopupKind(kind);
    setPopupTitle(title);
    setPopupMsg(msg);
    setPopupOpen(true);
  };

  useEffect(() => {
    const raw = sessionStorage.getItem('userDetails');
    if (raw) {
      try {
        const o = JSON.parse(raw);
        setCustomerId(Number(o?.customerId));
      } catch {/* ignore */}
    }
  }, []);

  const fetchData = async (cid: number) => {
    setLoading(true);
    setErr('');
    try {
      const res = await getLicensesByCustomer(cid);
      const rows: ViewManageLicense[] = res.data || [];
      setLicenses(
        rows.map((r) => ({
          ...r,
          features: r.features?.length ? r.features : defaultFeatures,
          licenseeName: r.customerName || 'Company Name Ltd.',
        }))
      );
    } catch (e: any) {
      const msg = e?.message || 'Failed to load licenses';
      setErr(msg);
      showPopup('error', 'Error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId != null) fetchData(customerId);
  }, [customerId]);

  const openExtend = (l: ViewManageLicense) => {
    setSelected(l);
    setModalOpen(true);
  };

  const activeLicenses = useMemo(() => licenses, [licenses]);

  return (
    <div className="p-6">
      <div className="rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">View/Manage License </h2>
         
        </div>

        <div className="p-6">
          {loading && <div className="text-gray-500">Loading…</div>}
          {err && <div className="text-red-600">{err}</div>}

          {!loading && !err && (
            <div className="flex flex-col gap-4">
              {activeLicenses.map((l) => {
                const soon = isExpiringSoon(l.endDate);
                const inCooldown = wasUpdatedWithin24h(l.licnId);

                return (
                  <div key={l.licnId} className="rounded-lg border border-gray-200 p-6">
                    <div className="mb-4 flex items-center">
                      <div className="mr-3 h-9 w-9 rounded-lg border border-blue-200 bg-blue-50" />
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{l.standardName}</div>
                        <div className="text-sm text-gray-600">Information Security Management System</div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {(l.isActive ?? true) ? (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              active
                            </span>
                          ) : (
                            <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                              inactive
                            </span>
                          )}
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                            Cybersecurity
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="text-xs text-gray-500">Issue Date:</div>
                        <div className="font-semibold text-gray-900">{l.startOrRenewalDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Expiry Date:</div>
                        <div className={`font-semibold ${soon ? 'text-red-700' : 'text-gray-900'}`}>{l.endDate}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Licensee:</div>
                        <div className="font-semibold text-gray-900">{l.licenseeName}</div>
                      </div>
                    </div>

                    <div className="my-4 flex flex-wrap gap-2">
                      {(l.features || defaultFeatures).map((f) => (
                        <span key={f} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800">
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 border-t pt-3">
                      {/* Show Manage button ONLY if near expiry and NOT in cooldown */}
                      {soon && !inCooldown ? (
                        <button
                          onClick={() => openExtend(l)}
                          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:opacity-95"
                        >
                          Manage License
                        </button>
                      ) : (
                        // Otherwise hide button and show clarity hint with a clock icon + title tooltip
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {!soon ? (
                            <span title="You have more than a year to extend the license period">
                              You can extend when within one year of expiry
                            </span>
                          ) : (
                            <span title="This license was updated in the last 24 hours">
                              Recently updated — try again after 24 hours
                            </span>
                          )}
                        </div>
                      )}

                    
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ManageLicenceForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        license={selected}
        onUpdated={() => customerId != null && fetchData(customerId)}
        onPopup={(kind, msg) =>
          showPopup(kind, kind === 'success' ? 'Success' : 'Error', msg)
        }
      />

      <PopupModal
        open={popupOpen}
        kind={popupKind}
        title={popupTitle}
        message={popupMsg}
        onClose={() => setPopupOpen(false)}
      />
    </div>
  );
};

export default ManageLicence;

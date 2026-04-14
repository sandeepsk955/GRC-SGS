// components/pages/CreateInternalAudit.tsx
import { useEffect, useMemo, useState } from "react";
import { listInternalAudits, AuditRow, getStandards } from "../../services/createinternalauditservice";
import CreateAuditModal from "./CreateInternalAuditForm";
import PopupMessages, { PopupKind } from "../popups/PopupMessages.tsx";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

const fromSession = (k: string) =>
  (typeof window === "undefined" ? "" : sessionStorage.getItem(k) || "");

type SaveResult = {
  ok: boolean;
  title?: string;
  messages?: string[];
  kind?: PopupKind;
};

export default function CreateInternalAudit() {
  const [customerId] = useState<number>(Number(fromSession("customerId") || 13));
  const [userId] = useState<number>(Number(fromSession("userId") || 1));

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AuditRow | null>(null);

  // popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupKind, setPopupKind] = useState<PopupKind>("info");
  const [popupTitle, setPopupTitle] = useState<string | undefined>(undefined);
  const [popupMsg, setPopupMsg] = useState<string[] | string>("");

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const openPopup = (kind: PopupKind, message: string[] | string, title?: string) => {
    setPopupKind(kind);
    setPopupMsg(message);
    setPopupTitle(title);
    setPopupOpen(true);
  };

  const reload = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = await listInternalAudits(customerId);

      // Enrich with standard names where possible
      const govIds = [...new Set(data.map(r => r.governanceId ?? 0).filter(id => id > 0))];
      const stdsPromises = govIds.map(gid => getStandards(customerId, gid));
      const stdsLists = await Promise.all(stdsPromises);

      const standardMaps: Record<number, Record<number, string>> = {};
      govIds.forEach((gid, index) => {
        standardMaps[gid] = {};
        stdsLists[index].forEach(s => {
          standardMaps[gid][s.id] = s.standardName;
        });
      });

      data = data.map(r => ({
        ...r,
        standardName:
          r.standardName ||
          (r.governanceId && r.standardId ? standardMaps[r.governanceId]?.[r.standardId] : undefined) ||
          r.standard ||
          "-",
      }));

      setRows(data);
      setPage(p => Math.min(Math.max(1, p), Math.max(1, Math.ceil(data.length / pageSize))));
    } catch (e: any) {
      setError(e?.message || "Failed to load audits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const handleSaved = async (result?: SaveResult) => {
    await reload();
    if (result) {
      openPopup(result.kind ?? (result.ok ? "success" : "error"), result.messages ?? [], result.title);
    }
  };

  return (
    <>
      <PopupMessages
        open={popupOpen}
        kind={popupKind}
        title={popupTitle}
        message={popupMsg}
        onClose={() => setPopupOpen(false)}
      />

      {modalOpen && (
        <CreateAuditModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
          customerId={customerId}
          userId={userId}
          initial={editing}
        />
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Internal Audit / Create Internal Audit</h2>
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Audit
          </button>
        </div>

        {loading && <div className="rounded-lg border p-6 text-sm text-gray-600">Loading…</div>}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Audit Master Id</th>
                    <th className="px-4 py-3">Standard</th>
                    <th className="px-4 py-3">Compliance Period Id</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3">End Date</th>
                    <th className="px-4 py-3">Auditor Name</th>
                    <th className="px-4 py-3">Auditee Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {pagedRows.map((r) => (
                    <tr key={r.auditMasterId}>
                      <td className="px-4 py-3 text-sm">{r.auditMasterId}</td>
                      <td className="px-4 py-3 text-sm">{r.standardName ?? r.standard ?? "-"}</td>
                      <td className="px-4 py-3 text-sm">{r.compliancePeriodId}</td>
                      <td className="px-4 py-3 text-sm">{r.startDate?.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-sm">{r.endDate?.slice(0, 10)}</td>
                      <td className="px-4 py-3 text-sm">{r.auditorName}</td>
                      <td className="px-4 py-3 text-sm">{r.auditeeName}</td>
                      <td className="px-4 py-3 text-sm">{r.status || ""}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-200"
                          onClick={() => {
                            setEditing(r);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-sm text-gray-600">
                        No audits found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {rows.length ? (page - 1) * pageSize + 1 : 0}–
                {Math.min(page * pageSize, rows.length)} of {rows.length}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Rows per page</label>
                <select
                  className="border rounded-md px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    setPage(1);
                  }}
                >
                  {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                <button
                  className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

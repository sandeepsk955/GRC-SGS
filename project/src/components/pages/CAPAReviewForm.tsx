import { useEffect, useMemo, useState } from "react";
import PopupMessages from "../popups/PopupMessages.tsx";
import {
  getAuditStatusDropdown,
  getUploadedFiles,
  downloadEvidenceFile,
  postFinalAuditReview,
} from "../../services/CAPAReviewformservice.ts";
import type { ReviewControlRow } from "../../services/CAPAReviewservice.tsx";

type Props = {
  open: boolean;
  onClose: (didSubmit?: boolean) => void;
  customerId: number;
  auditMasterId: number;
  row: ReviewControlRow;
  controlInfo: any; // data from GetControlInfo
};

export default function CAPAReviewPopup({ open, onClose, customerId, auditMasterId, row, controlInfo }: Props) {
  if (!open) return null;

  const [statuses, setStatuses] = useState<any[]>([]);
  const [finalStatusId, setFinalStatusId] = useState<number | undefined>(Number(row.finalAuditStatus) || undefined);
  const [finalComments, setFinalComments] = useState<string>(row.comments || "");
  const [files, setFiles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // popup state
  const [popup, setPopup] = useState<{ open: boolean; kind: "success" | "error" | "warning" | "info"; title?: string; message?: string | string[]; after?: () => void; }>({
    open: false, kind: "info",
  });
  const showPopup = (p: Omit<typeof popup, "open">) => setPopup({ open: true, ...p });

  // Fetch audit statuses for dropdown
  useEffect(() => {
    getAuditStatusDropdown(customerId)
      .then(setStatuses)
      .catch(() => setStatuses([]));
  }, [customerId]);

  // Fetch uploaded files for evidence section
  useEffect(() => {
    getUploadedFiles(row.auditControlId, customerId)
      .then((list: any[]) => {
        const normalized = (list || []).map((x: any) => ({ id: x.id ?? x.fileId ?? x.ID, name: x.fileName ?? x.name }));
        setFiles(normalized.filter((x) => x && x.id));
      })
      .catch(() => setFiles([])); // Handle empty or error states
  }, [customerId, row.auditControlId]);

  // Initial audit status (from statuses)
  const initialStatusText = useMemo(() => {
    const name = statuses.find((s: any) => s.id === row.initialAuditStatusId)?.status;
    return name || row.initialAuditStatus || "-";
  }, [row.initialAuditStatus, row.initialAuditStatusId, statuses]);

  // Control description (CAPA section info)
  const controlDescription = controlInfo?.description || "This control ensures proper implementation and documentation of cybersecurity frameworks in alignment with organizational policies and regulatory requirements.";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalStatusId) {
      showPopup({ kind: "warning", title: "Validation", message: "Select Final Audit Status." });
      return;
    }
    if (!finalComments || finalComments.trim().length < 10) {
      showPopup({ kind: "warning", title: "Validation", message: "Enter Final Auditor Comments (min 10 chars)." });
      return;
    }

    setLoading(true);
    try {
      const resp = await postFinalAuditReview({
        controlId: row.auditControlId,
        auditMasterId,
        customerId,
        comments: finalComments.trim(),
        finalAuditStatus: Number(finalStatusId),
      });

      const successMsg =
        (typeof resp === "string" && resp) ||
        (resp?.message as string) ||
        "Comments Updated Successfully";

      showPopup({
        kind: "success",
        title: "Saved",
        message: successMsg,
        after: () => onClose(true),
      });
    } catch (e: any) {
      showPopup({
        kind: "error",
        title: "Submission failed",
        message: e?.message || "Error submitting final review",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Update Final Compliance</h3>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-black">✕</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

            {/* Control Detail (blue box) */}
            <section className="rounded-xl bg-blue-50 p-4">
              <div className="font-medium mb-1">
                Control: {row.controlTitle}
              </div>
              <div className="text-sm text-gray-700">
                {controlDescription}
              </div>
            </section>

            {/* Initial Audit Details */}
            <section className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border p-4">
                <div className="text-sm text-gray-500 mb-1">Compliance Status</div>
                <div className="font-semibold">{initialStatusText}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm text-gray-500 mb-1">Auditor Comments</div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {row.preCapaComments || "-"}
                </div>
              </div>
            </section>

            {/* CAPA Details (green box + evidence chips) */}
            <section className="rounded-xl bg-green-50 p-4">
              <div className="font-medium mb-2">CAPA Details</div>

              <div className="text-sm text-gray-500 mb-1">CAPA Comments</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap mb-3">
                {row.userCapaComments || "-"}
              </div>

              {/* Files Section */}
              {!!files.length ? (
                <>
                  <div className="text-sm text-gray-500 mb-2">CAPA Evidence Files</div>
                  <div className="flex flex-wrap gap-2">
                    {files.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-100 px-3 py-1.5 text-sm hover:bg-emerald-200"
                        onClick={async () => {
                          const blob = await downloadEvidenceFile(f.id, customerId);
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                        title={`View Documents: ${f.name}`}
                      >
                        📄 View Documents: {f.name}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p>No CAPA evidence files available.</p>
              )}
            </section>

            {/* Final Audit Details (dropdown + textarea) */}
            <section>
              <div className="mb-3">
                <label className="block text-sm mb-1 font-medium">Final Audit Status *</label>
                <select
                  value={finalStatusId ?? ""}
                  onChange={(e) => setFinalStatusId(Number(e.target.value) || undefined)}
                  className="w-full rounded-lg border p-2"
                >
                  <option value="">Select Final Audit Status</option>
                  {statuses.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">Final Auditor Comments *</label>
                <textarea
                  value={finalComments}
                  onChange={(e) => setFinalComments(e.target.value)}
                  className="w-full rounded-lg border p-2"
                  rows={4}
                  placeholder="Enter final auditor assessment based on CAPA effectiveness..."
                />
              </div>
            </section>
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button type="button" onClick={() => onClose()} className="rounded-lg border px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      <PopupMessages
        open={popup.open}
        kind={popup.kind}
        title={popup.title}
        message={popup.message}
        onClose={() => {
          const next = popup.after;
          setPopup((p) => ({ ...p, open: false, after: undefined }));
          next?.();
        }}
        actions={[
          {
            label: "OK",
            onClick: () => {
              const next = popup.after;
              setPopup((p) => ({ ...p, open: false, after: undefined }));
              next?.();
            },
          },
        ]}
      />
    </div>
  );
}

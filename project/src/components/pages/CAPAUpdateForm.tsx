// src/components/pages/CAPAUpdateForm.tsx
import { useEffect, useState } from "react";
import {
  getAuditStatusDropdown,
  postFinalAuditData,
  uploadEvidenceFiles,
} from "../../services/CAPAUpdateformservice";
import type { ControlRow } from "../../services/CAPAUpdateservice";

// ⬇️ use your existing popup
import PopupMessages from "../popups/PopupMessages.tsx";

type Props = {
  open: boolean;
  onClose: (didSubmit?: boolean) => void;
  controlRow: ControlRow;
  customerId: number;
};

export default function CAPAUpdateForm({ open, onClose, controlRow, customerId }: Props) {
  if (!open) return null;

  const [statuses, setStatuses] = useState<any[]>([]);
  const [userCapaComments, setUserCapaComments] = useState(controlRow.userCapaComments ?? "");
  const [evidenceDetails, setEvidenceDetails] = useState("");
  const [isCapaEvidence, setIsCapaEvidence] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  // popup state (local to form)
  const [popup, setPopup] = useState<{
    open: boolean;
    kind: "success" | "error" | "warning" | "info";
    title?: string;
    message?: string | string[];
    afterPrimary?: () => void; // optional follow-up on OK
  }>({ open: false, kind: "info" });

  const showPopup = (p: Omit<typeof popup, "open">) =>
    setPopup({ open: true, ...p });

  useEffect(() => {
    getAuditStatusDropdown(customerId).then(setStatuses).catch(() => setStatuses([]));
  }, [customerId]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.currentTarget.files ?? []) as File[];
    if (!picked.length) return;
    setFiles((prev) => [...prev, ...picked]);
    e.currentTarget.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCapaComments || userCapaComments.trim().length < 10) {
      showPopup({
        kind: "warning",
        title: "Validation",
        message: "Please enter user CAPA comments (min 10 characters).",
      });
      return;
    }
    setLoading(true);
    try {
      const resp = await postFinalAuditData({
        controlId: controlRow.auditControlId,
        customerId,
        comments: userCapaComments,
        userCapaComments,
        evidenceDetails,
      });

      if (files.length) {
        const fd = new FormData();
        fd.append("AssignmentId", String(controlRow.auditControlId));
        fd.append("NotificationId", "1");
        fd.append("CustomerId", String(customerId));
        fd.append("IsCapaEvidence", isCapaEvidence ? "true" : "false");
        files.forEach((f) => fd.append("File", f, f.name));
        await uploadEvidenceFiles(fd);
      }

      // Prefer backend message if present
      const successMsg =
        (typeof resp === "string" && resp) ||
        (resp?.message as string) ||
        "Comments Updated Successfully";

      showPopup({
        kind: "success",
        title: "Saved",
        message: successMsg,
        afterPrimary: () => onClose(true),
      });
    } catch (e: any) {
      showPopup({
        kind: "error",
        title: "Submission failed",
        message: e?.message || "Error submitting CAPA details",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Update Final Compliance</h3>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-black">✕</button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <div className="mb-5 rounded-xl bg-blue-50 p-4">
              <div className="text-sm font-medium mb-1">Control: {controlRow.controlTitle}</div>
              <div className="text-sm text-gray-700">
                This control ensures proper implementation and documentation of cybersecurity frameworks in alignment with organizational policies and regulatory requirements.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border p-4">
                <div className="text-sm text-gray-500 mb-1">Compliance Status</div>
                <div className="font-medium">
                  {statuses.find((s: any) => s.id === controlRow.initialAuditStatusId)?.status ??
                    controlRow.initialAuditStatus}
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-sm text-gray-500 mb-1">Auditor Comments</div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {controlRow.preCapaComments || "-"}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-green-50 p-4">
              <div className="font-medium mb-2">CAPA Details</div>

              <label className="block text-sm mb-1">User CAPA Comments *</label>
              <textarea
                value={userCapaComments}
                onChange={(e) => setUserCapaComments(e.target.value)}
                className="w-full rounded-lg border p-2 mb-3"
                rows={4}
                placeholder="Describe CAPA actions and effectiveness..."
              />

              <label className="block text-sm mb-1">Evidence Details</label>
              <input
                type="text"
                value={evidenceDetails}
                onChange={(e) => setEvidenceDetails(e.target.value)}
                className="w-full rounded-lg border p-2 mb-3"
                placeholder="Optional note about evidence"
              />

              <div className="flex items-center gap-2 mb-3">
                <input
                  id="isEvi"
                  type="checkbox"
                  checked={isCapaEvidence}
                  onChange={(e) => setIsCapaEvidence(e.target.checked)}
                />
                <label htmlFor="isEvi" className="text-sm">Mark files as CAPA Evidence</label>
              </div>

              <input type="file" multiple onChange={onFileChange} />
              {!!files.length && (
                <ul className="mt-2 text-sm list-disc ml-5">
                  {files.map((f, i) => (
                    <li key={i}>{f.name}</li>
                  ))}
                </ul>
              )}
            </div>
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

      {/* Local popup for the form */}
      <PopupMessages
        open={popup.open}
        kind={popup.kind}
        title={popup.title}
        message={popup.message}
        onClose={() => {
          const cb = popup.afterPrimary;
          setPopup((p) => ({ ...p, open: false, afterPrimary: undefined }));
          cb?.();
        }}
        actions={[
          {
            label: "OK",
            onClick: () => {
              const cb = popup.afterPrimary;
              setPopup((p) => ({ ...p, open: false, afterPrimary: undefined }));
              cb?.();
            },
          },
        ]}
      />
    </div>
  );
}

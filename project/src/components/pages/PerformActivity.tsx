import { useEffect, useState } from "react";
import { uploadEvidenceFiles } from "../../services/CAPAUpdateformservice";
import api, { unwrapData } from "../../services/api";

/* ----------------------------- Types ----------------------------- */
type ActivityDetails = {
  activityTitle: string;
  activityDetails: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  doerComments: string;
  evidenceDetails: any[]; // from API
};

type PerformActivityProps = {
  assignmentId: string | number;
  customerId: string | number;
  govId: string | number;
  onClose: () => void;
  notificationId?: string | number; // ✅ Added to track the source notification
  onSubmitSuccess?: () => void | Promise<void>; // ✅ Callback to refresh parent after successful submission
};

type ApiActivity = Partial<ActivityDetails>;
// type ApiResponse<T = any> = { statusCode?: number; message?: string; data?: T; errors?: unknown };

type PopupState =
  | { open: true; kind: "success" | "error"; title: string; message: string; onOk?: () => void }
  | { open: false };

/* --------------------------- Utilities --------------------------- */
// const API_BASE = "https://sajoan-b.techoptima.ai/api"; // 🚫 Use api service instead

const initialDetails: ActivityDetails = {
  activityTitle: "",
  activityDetails: "",
  plannedStartDate: "",
  plannedEndDate: "",
  actualStartDate: "",
  doerComments: "",
  evidenceDetails: [],
};

const toInt = (v: string | number) => {
  if (typeof v === "number") return v;
  const n = parseInt(v as string, 10);
  return Number.isFinite(n) ? n : undefined;
};

/* -------------------------- Popup Dialog ------------------------- */
function Popup({ state, setState }: { state: PopupState; setState: (s: PopupState) => void }) {
  if (!state.open) return null;
  const { kind, title, message, onOk } = state;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-[420px] max-w-[92vw] rounded-xl shadow-xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          {kind === "success" ? (
            <svg className="w-6 h-6 text-green-600 mt-0.5" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600 mt-0.5" viewBox="0 0 24 24" fill="none">
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => {
              setState({ open: false });
              onOk?.();
            }}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Component -------------------------- */
export default function PerformActivity({
  assignmentId,
  customerId,
  govId,
  onClose,
  notificationId,
  onSubmitSuccess,
}: PerformActivityProps) {
  const [details, setDetails] = useState<ActivityDetails>(initialDetails);

  const [started, setStarted] = useState(false); // ✅ hide completion section until clicked
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [blockingError, setBlockingError] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupState>({ open: false });

  /* ---------------------------- Load ----------------------------- */
  useEffect(() => {
    if (!assignmentId || !customerId || !govId) {
      setBlockingError("Missing required parameters: assignmentId, customerId, or GovId");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setBlockingError(null);

        const url = `/PerformActivity/GetActivityDetailsForDoer?AssignmentId=${encodeURIComponent(
          String(assignmentId)
        )}&CustomerId=${encodeURIComponent(String(customerId))}&GovId=${encodeURIComponent(String(govId))}`;

        const activities = await unwrapData<ApiActivity[]>(api.get(url));
        const activity = activities?.[0] ?? {};

        setDetails({
          activityTitle: activity.activityTitle ?? "",
          activityDetails: (activity as any).activityDetail ?? activity.activityDetails ?? "",
          plannedStartDate: activity.plannedStartDate ?? "",
          plannedEndDate: activity.plannedEndDate ?? "",
          actualStartDate: activity.actualStartDate ?? "",
          doerComments: activity.doerComments ?? "",
          evidenceDetails: (activity.evidenceDetails as any[]) ?? [],
        });

        // 🚫 Do NOT auto-open completion section; must click Start Assignment
        // if (activity.actualStartDate) setStarted(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load activity details";
        setBlockingError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [assignmentId, customerId, govId]);

  /* ----------------------- Start Assignment ---------------------- */
  const startAssignment = async () => {
    if (starting) return;

    const aId = toInt(assignmentId);
    const cId = toInt(customerId);
    if (aId === undefined || cId === undefined) {
      setPopup({ open: true, kind: "error", title: "Invalid IDs", message: "assignmentId and customerId must be numbers." });
      return;
    }

    try {
      setStarting(true);

      const json = await unwrapData<any>(api.put(`/PerformActivity/updateStartdate`, {
        assignmentId: aId,
        isDoer: true,
        customerId: cId
      }));

      setStarted(true); // ✅ show completion section now
      setDetails((p: any) => ({ ...p, actualStartDate: p.actualStartDate || new Date().toLocaleDateString() }));

      setPopup({ open: true, kind: "success", title: "Success", message: json.message || "Assignment started successfully." });
    } catch (e: any) {
      setPopup({ open: true, kind: "error", title: "Start Failed", message: e?.message || String(e) });
    } finally {
      setStarting(false);
    }
  };

  /* ----------------------- Submit For Review --------------------- */
  const submitForReview = async () => {
    if (submitting) return;

    // ✅ Validate that user provided at least comments
    if (!details.doerComments || !details.doerComments.trim()) {
      setPopup({ open: true, kind: "error", title: "Required Field", message: "Please enter comments in the Completion Section before submitting." });
      return;
    }

    const aId = toInt(assignmentId);
    const cId = toInt(customerId);
    const gId = toInt(govId);
    if (aId === undefined || cId === undefined || gId === undefined) {
      setPopup({ open: true, kind: "error", title: "Invalid IDs", message: "assignmentId, customerId and GovId must be numbers." });
      return;
    }

    try {
      setSubmitting(true);

      // 🚀 Step 1: Upload real files if any
      if (files.length > 0) {
        const fd = new FormData();
        fd.append("AssignmentId", String(aId));
        fd.append("NotificationId", String(notificationId || 0));
        fd.append("CustomerId", String(cId));
        fd.append("IsCapaEvidence", "false");
        files.forEach((f) => fd.append("File", f, f.name));
        await uploadEvidenceFiles(fd);
      }

      // Properly convert evidenceDetails array to string or use newly uploaded file names
      let evidenceStr = "";
      if (files.length > 0) {
        evidenceStr = files.map((f: any) => f.name).join(", ");
      } else if (Array.isArray(details.evidenceDetails) && details.evidenceDetails.length > 0) {
        // Convert array of evidence objects to comma-separated string
        evidenceStr = (details.evidenceDetails as any[])
          .map((e: any) => typeof e === "string" ? e : (e.fileName || e.name || JSON.stringify(e)))
          .join(", ");
      }
      // else: evidenceStr remains empty string if no files uploaded and no existing evidence

      const json = await unwrapData<any>(api.put(`/PerformActivity/performActivity`, {
        DoerComments: details.doerComments ?? "",
        EvidenceDetails: evidenceStr,
        CustomerId: cId,
        AssignmentId: aId,
        GovId: gId,
      }));

      setPopup({
        open: true,
        kind: "success",
        title: "Submitted",
        message: json.message || "Submitted for review successfully.",
        onOk: async () => {
          // ✅ Refresh parent notifications list before closing
          if (onSubmitSuccess) {
            await onSubmitSuccess();
          }
          onClose();
        },
      });
    } catch (e: any) {
      setPopup({ open: true, kind: "error", title: "Submit Failed", message: e?.message || String(e) });
    } finally {
      setSubmitting(false);
    }
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  /* ----------------------------- UI ------------------------------ */
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">Loading...</div>
      </div>
    );
  }
  if (blockingError) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg text-red-700">{blockingError}</div>
      </div>
    );
  }

  return (
    <>
      <Popup state={popup} setState={setPopup} />

      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[520px] max-h-[86vh] overflow-auto">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-lg font-semibold">Assignment and Activity</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>

          {/* Details */}
          <div>
            <p><strong>Activity:</strong> {details.activityTitle || "N/A"}</p>
            <p className="mt-1"><strong>Activity Description:</strong> {details.activityDetails || "N/A"}</p>

            <h3 className="mt-4 font-medium">Time Management</h3>
            <p><strong>Planned Start Date:</strong> {details.plannedStartDate || "N/A"}</p>
            <p><strong>Planned End Date:</strong> {details.plannedEndDate || "N/A"}</p>
            {started && <p><strong>Actual Start Date:</strong> {details.actualStartDate || "N/A"}</p>}
          </div>

          {/* Actions */}
          {!started ? (
            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={onClose}>Close</button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                onClick={startAssignment}
                disabled={starting}
              >
                {starting ? "Starting..." : "Start Assignment"}
              </button>
            </div>
          ) : (
            <>
              {/* Completion Section — only visible after Start */}
              <h3 className="mt-6 font-medium">Completion Section</h3>
              <textarea
                className="w-full p-2 border rounded mt-2"
                placeholder="Enter the Comments"
                value={details.doerComments}
                onChange={(e) => setDetails((p) => ({ ...p, doerComments: e.target.value }))}
              />
              <div className="mt-4">
                <label className="block mb-1 font-medium">Evidence Details</label>
                <input type="file" multiple className="block w-full" onChange={onFilesChange} />
                {files.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">Selected: {files.map((f) => f.name).join(", ")}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={onClose}>Close</button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                  onClick={submitForReview}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit For Review"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

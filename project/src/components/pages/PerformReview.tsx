import { useEffect, useMemo, useState } from "react";
import api, { unwrapData } from "../../services/api";

type ActivityDetails = {
  activityTitle: string;
  activityDetail: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  doerComments: string;
  evidenceDetails: string;
  reviewerComments: string;
};

type PerformReviewProps = {
  assignmentId: string | number;
  customerId: string | number;
  govId: string | number;
  onClose: () => void;
  notificationId?: string | number; // ✅ Added for consistency
  onSubmitSuccess?: () => void | Promise<void>; // ✅ Callback to refresh parent after successful submission
};

type ApiActivity = Partial<ActivityDetails> & { helpRefDocs?: string };
// type ApiResponse<T = any> = { statusCode?: number; message?: string; data?: T; errors?: unknown };
type FileMeta = { id: number; fileName: string };

type PopupState =
  | { open: true; kind: "success" | "error"; title: string; message: string; onOk?: () => void }
  | { open: false };

/* ----------------------------- Helpers ----------------------------- */
// const API_BASE = "https://sajoan-b.techoptima.ai/api"; // 🚫 Use api service instead

const toInt = (v: string | number) => {
  if (typeof v === "number") return v;
  const n = parseInt(v as string, 10);
  return Number.isFinite(n) ? n : undefined;
};

const fmt = (v?: string) => v ?? "";

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

export default function PerformReview({ assignmentId, customerId, govId, onClose, notificationId, onSubmitSuccess }: PerformReviewProps) {
  // notificationId is available for future use if the review API requires it
  const [details, setDetails] = useState<ActivityDetails>({
    activityTitle: "",
    activityDetail: "",
    plannedStartDate: "",
    plannedEndDate: "",
    actualStartDate: "",
    actualEndDate: "",
    doerComments: "",
    evidenceDetails: "",
    reviewerComments: "",
  });

  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);     // controls visibility of Review Section
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ open: false });

  const [files, setFiles] = useState<FileMeta[]>([]);
  const [blockingError, setBlockingError] = useState<string | null>(null);

  const aId = useMemo(() => toInt(assignmentId), [assignmentId]);
  const cId = useMemo(() => toInt(customerId), [customerId]);
  const gId = useMemo(() => toInt(govId), [govId]);

  // load details
  useEffect(() => {
    if (aId === undefined || cId === undefined || gId === undefined) {
      setBlockingError("assignmentId, customerId, govId must be numbers.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setBlockingError(null);

        const detailUrl = `/PerformActivity/GetActivityDetailsForReviewer?AssignmentId=${aId}&CustomerId=${cId}&GovId=${gId}`;
        const items = await unwrapData<ApiActivity[]>(api.get(detailUrl));
        const item = (items && items[0]) || {};

        setDetails({
          activityTitle: fmt(item.activityTitle),
          activityDetail: fmt(item.activityDetail),
          plannedStartDate: fmt(item.plannedStartDate),
          plannedEndDate: fmt(item.plannedEndDate),
          actualStartDate: fmt(item.actualStartDate),
          actualEndDate: fmt(item.actualEndDate),
          doerComments: fmt(item.doerComments),
          evidenceDetails: fmt(item.evidenceDetails),
          reviewerComments: fmt(item.reviewerComments || (item as any).approverComments),
        });

        // DO NOT auto-set started from server values; the UI should require explicit click
        // If you really must pre-open, uncomment the next line:
        // if (item.actualStartDate) setStarted(true);

        // evidence list
        const listUrl = `FileUpload/DownloadEvidenceFiles?AssignmentId=${aId}&CustomerId=${cId}&tag=final_fix`;
        const list = await unwrapData<any[]>(api.get(listUrl));
        const mapped: FileMeta[] = Array.isArray(list)
          ? list.map((f: any) => ({ id: f.id, fileName: f.fileName }))
          : [];
        setFiles(mapped);
      } catch (e: any) {
        setBlockingError(e?.message || "Failed to load review details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [aId, cId, gId]);

  // start review
  const startReview = async () => {
    if (starting || aId === undefined || cId === undefined) return;

    try {
      setStarting(true);
      const json = await unwrapData<any>(api.put(`/PerformActivity/updateStartdate`, {
        assignmentId: aId,
        isDoer: true,
        customerId: cId
      }));

      setStarted(true); // ✅ only now we show the Review Section
      setDetails((p) => ({ ...p, actualStartDate: p.actualStartDate || new Date().toLocaleDateString() }));
      setPopup({ open: true, kind: "success", title: "Success", message: json.message || "Review started." });
    } catch (e: any) {
      setPopup({ open: true, kind: "error", title: "Start Failed", message: e?.message || String(e) });
    } finally {
      setStarting(false);
    }
  };

  // approve / reject
  const submitDecision = async (isReject: boolean) => {
    if (submitting || aId === undefined || cId === undefined) return;

    try {
      setSubmitting(true);

      const body: any = {
        ApproverComments: details.reviewerComments ?? "",
        CustomerId: cId,
        AssignmentId: aId,
        IsReject: isReject,
      };

      const json = await unwrapData<any>(api.put(`/PerformActivity/reviewActivity`, body));

      setPopup({
        open: true,
        kind: "success",
        title: "Success",
        message: json.message || (isReject ? "Task rejected." : "Task approved."),
        onOk: async () => {
          // ✅ Refresh parent reviews list before closing
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

  const viewFile = async (fileId: number) => {
    try {
      if (cId === undefined) throw new Error("Missing customerId");
      const url = `/FileUpload/DownloadEvidenceFile?fileId=${fileId}&CustomerId=${cId}`;
      const res = await api.get(url, { responseType: 'blob' });
      const blob = res.data;
      const blobUrl = window.URL.createObjectURL(blob);
      const w = window.open("", "_blank", "width=900,height=700,scrollbars=yes,resizable=yes");
      if (w) {
        w.document.write(`
          <html>
            <head><title>Document</title></head>
            <body style="margin:0">
              <iframe src="${blobUrl}" frameborder="0" style="width:100%;height:100vh;"></iframe>
            </body>
          </html>
        `);
      }
    } catch (e: any) {
      setPopup({ open: true, kind: "error", title: "Open File Failed", message: e?.message || String(e) });
    }
  };

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
        <div className="bg-white p-6 rounded-lg shadow-lg w-[860px] max-h-[86vh] overflow-auto">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-lg font-semibold">Assignment and Activity section</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>

          {/* Activity & Time */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-semibold">Activity:</p>
              <p className="text-gray-800">{details.activityTitle || "N/A"}</p>
              <p className="font-semibold mt-3">Activity Description:</p>
              <p className="text-gray-800 whitespace-pre-wrap">{details.activityDetail || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Time Management</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <p className="text-gray-800"><span className="font-semibold">Planned Start:</span> {details.plannedStartDate || "N/A"}</p>
                <p className="text-gray-800"><span className="font-semibold">Actual Start:</span> {details.actualStartDate || "N/A"}</p>
                <p className="text-gray-800"><span className="font-semibold">Planned End:</span> {details.plannedEndDate || "N/A"}</p>
                <p className="text-gray-800"><span className="font-semibold">Actual End:</span> {details.actualEndDate || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Completion / Evidence */}
          <h3 className="mt-6 font-semibold">Completion Section</h3>
          <div className="mt-2">
            <p className="font-medium">Doer Comments</p>
            <div className="text-gray-700 border rounded-md p-2 bg-gray-50 whitespace-pre-wrap">
              {details.doerComments || "—"}
            </div>
          </div>

          <div className="mt-4">
            <p className="font-medium mb-2">Evidence Details</p>
            {files.length === 0 ? (
              <div className="text-sm text-gray-500">No documents.</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {files.map((f) => (
                  <button
                    key={f.id}
                    className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                    onClick={() => viewFile(f.id)}
                    title={f.fileName}
                  >
                    View Documents
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* START REVIEW / REVIEW SECTION */}
          {!started ? (
            <div className="mt-8 flex justify-end">
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                onClick={startReview}
                disabled={starting}
              >
                {starting ? "Starting..." : "Start Review"}
              </button>
            </div>
          ) : (
            <>
              <h3 className="mt-8 font-semibold">Review Section</h3>
              <label className="block text-sm font-medium mt-2 mb-1">Approver Comments</label>
              <textarea
                className="w-full p-2 border rounded"
                placeholder="Approver Comment"
                value={details.reviewerComments}
                onChange={(e) => setDetails((p) => ({ ...p, reviewerComments: e.target.value }))}
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                  onClick={() => submitDecision(true)}
                  disabled={submitting}
                >
                  {submitting ? "Working..." : "Reject"}
                </button>
                <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                  onClick={() => submitDecision(false)}
                  disabled={submitting}
                >
                  {submitting ? "Working..." : "Approve"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

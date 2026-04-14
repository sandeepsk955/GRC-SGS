// src/components/assignments/AssignmentFormModal.tsx
import  { useEffect, useMemo, useState } from "react";
import {
  activityLookup,
  approversLookup,
  complianceLookup,
  doersLookup,
  updateAssignment,
  addAssignment,
} from "../../services/Assignments.ts";

type Props = {
  open: boolean;
  onClose: () => void;
  customerId: number;
  govId: number;
  initial?: {
    id?: number;
    compliancePeriodId?: number | string;
    activityMasterId?: number;
    doerCliUserId?: number | string;
    approverCliUserId?: number | string;
    startDate?: string;
    endDate?: string;
  };
  viewOnly?: boolean;
  onSaved?: () => void;
};

type PopupState =
  | { open: true; kind: "success" | "error"; title: string; message: string }
  | { open: false };

const toISO = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const fromISO = (d: string) => d; // backend expects yyyy-MM-dd already per Angular code

export default function AssignmentFormModal({
  open,
  onClose,
  customerId,
  govId,
  initial,
  viewOnly = false,
  onSaved,
}: Props) {
  const [form, setForm] = useState({
    compliancePeriodId: initial?.compliancePeriodId ?? "",
    activityMasterId: initial?.activityMasterId ?? "" as any,
    doerCliUserId: initial?.["doerCliUserId"] ?? "",
    approverCliUserId: initial?.["approverCliUserId"] ?? "",
    startDate: toISO(initial?.startDate),
    endDate: toISO(initial?.endDate),
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [doers, setDoers] = useState<any[]>([]);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ open: false });

  const editing = useMemo(() => Boolean(initial?.id), [initial?.id]);

  useEffect(() => {
    if (!open || viewOnly || !govId) return;
    (async () => {
      try {
        const [act, per] = await Promise.all([
          activityLookup(customerId, govId),
          complianceLookup(customerId),
        ]);
        setActivities(act);
        setPeriods(per);
      } catch (e) {
        setPopup({ open: true, kind: "error", title: "Load Failed", message: String(e) });
      }
    })();
  }, [open, customerId, govId, viewOnly]);

  useEffect(() => {
    if (!open || viewOnly) return;
    const aId = Number(form.activityMasterId);
    if (!aId) return;
    (async () => {
      try {
        const [dl, al] = await Promise.all([doersLookup(customerId, aId), approversLookup(customerId, aId)]);
        setDoers(dl);
        setApprovers(al);
      } catch (e) {
        setPopup({ open: true, kind: "error", title: "Lookup Failed", message: String(e) });
      }
    })();
  }, [open, form.activityMasterId, customerId, viewOnly]);

  const save = async () => {
    if (viewOnly) return;
    setLoading(true);
    try {
      const body = {
        compliancePeriodId: form.compliancePeriodId,
        activityMasterId: Number(form.activityMasterId),
        doerCliUserId: form.doerCliUserId,
        approverCliUserId: form.approverCliUserId,
        startDate: fromISO(form.startDate),
        endDate: fromISO(form.endDate),
        customerId,
      };

      const res = editing ? await updateAssignment(Number(initial?.id), body) : await addAssignment(body);

      setPopup({
        open: true,
        kind: "success",
        title: "Success",
        message: res?.message ?? (editing ? "Assignment updated" : "Assignment added"),
      });
      onSaved?.();
    } catch (e) {
      setPopup({ open: true, kind: "error", title: "Save Failed", message: String(e) });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {popup.open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPopup({ open: false })} />
          <div className="relative bg-white rounded-xl shadow-xl border w-[460px] p-5">
            <h3 className="text-base font-semibold mb-2">{popup.kind === "success" ? "Success" : "Error"}</h3>
            <p className="text-sm text-gray-700">{(popup as any).message}</p>
            <div className="mt-4 text-right">
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
                onClick={() => setPopup({ open: false })}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        <div className="absolute inset-0 bg-gray-600/50" />
        <div className="relative bg-white rounded-xl shadow-lg w-[640px] max-h-[88vh] overflow-auto p-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-lg font-semibold">{editing ? "Edit Assignment" : "New Assignment"}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Compliance Period</label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={form.compliancePeriodId}
                disabled={viewOnly}
                onChange={(e) => setForm((p) => ({ ...p, compliancePeriodId: e.target.value }))}
              >
                <option value="">Select</option>
                {periods?.map((p: any) => (
                  <option key={p.id ?? p.compliancePeriodId} value={p.id ?? p.compliancePeriodId}>
                    {p.name ?? p.compliancePeriod ?? p.compliancePeriodId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Activity</label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={form.activityMasterId}
                disabled={viewOnly}
                onChange={(e) => setForm((p) => ({ ...p, activityMasterId: e.target.value as any }))}
              >
                <option value="">Select</option>
                {activities?.map((a: any) => (
                  <option key={a.activityId ?? a.id} value={a.activityId ?? a.id}>
                    {a.activityName ?? a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Doer</label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={form.doerCliUserId}
                disabled={viewOnly}
                onChange={(e) => setForm((p) => ({ ...p, doerCliUserId: e.target.value }))}
              >
                <option value="">Select</option>
                {doers?.map((d: any) => (
                  <option key={d.doerId ?? d.id} value={d.doerId ?? d.id}>
                    {d.doerName ?? d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Approver</label>
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={form.approverCliUserId}
                disabled={viewOnly}
                onChange={(e) => setForm((p) => ({ ...p, approverCliUserId: e.target.value }))}
              >
                <option value="">Select</option>
                {approvers?.map((a: any) => (
                  <option key={a.approverId ?? a.id} value={a.approverId ?? a.id}>
                    {a.approverName ?? a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="mt-1 w-full border rounded-md p-2"
                value={form.startDate}
                disabled={viewOnly}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="mt-1 w-full border rounded-md p-2"
                value={form.endDate}
                disabled={viewOnly}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300" onClick={onClose}>
              Cancel
            </button>
            {!viewOnly && (
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={save}
                disabled={loading}
              >
                {loading ? "Saving..." : editing ? "Save Changes" : "Create Assignment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

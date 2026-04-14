import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  Edit3,
  PlusCircle,
} from 'lucide-react';
import { useStandards } from '../../context/StandardsContext';
import { EditModal } from './EditModal';
import { SuccessDialog } from './SuccessDialog';
import { ActivityFormModal, ActivityFormValues } from './ActivityFormModal';
import { ControlEditModal } from './ControlEditModal';
import { useAuth } from '../../context/AuthContext';
import { AuditorEditModal } from './AuditorEditModal';
import { STATUS_CONFIG, mapWorkflowStatus, StatusKey } from '../../constants/statusConstants';
import api from '../../services/api';
import {
  AssignmentCard,
  flattenAssignments,
  getAssignments,
  getAssignmentsForAdmin,
} from '../../services/Assignments';
import AssignmentFormModal from './AssignmentsForm';

/* =========================
   Types
   ========================= */

export interface Activity {
  id: string;
  title: string;
  description: string;
  frequency: string;
  frequencyId?: string | number;
  assignee: string;
  doerRoleId?: string | number;
  approverRole?: string;
  approverRoleId?: string | number;
  duration?: string | number;
  status: StatusKey;
  dueDate: string;
  lastCompleted?: string;
}

export interface Control {
  id: string;
  ctrlIdForL3?: string; // control id for L3/Activity endpoints
  title: string;
  description: string;
  status: StatusKey;
  assignee: string;
  dueDate: string;
  evidence: string;
  activities: Activity[];
  // OLD-UI fields
  isApplicable?: boolean;
  justification?: string;

  // NEW: Auditor initial audit fields (to reflect in UI after save)
  preCapaStatusId?: number | null;
  preCapaStatusName?: string;
  preCapaComments?: string | null;
}

export interface Requirement {
  id: string;
  reqIdForL2?: string;
  title: string;
  description: string;
  domain: string;
  status: StatusKey;
  progress: number;
  controls: Control[];
  isApplicable?: boolean;
  justification?: string;
}

/* ===== API response shapes (inferred) ===== */
interface L1IsoDataItem {
  requirementID?: number;
  requirement?: string;
  controlID?: number;
  control?: string;
  justification?: string | null;
  isApplicable?: boolean;
  isControlComplete?: boolean;
}

interface StandardsDetailResponse {
  data: {
    isodata: L1IsoDataItem[] | null;
    bcmsdata?: L1IsoDataItem[] | null;
    aramcodata?: L1IsoDataItem[] | null;
    ncA_ECC?: L1IsoDataItem[] | null;
    levels: number;
    l2ISODATA?: unknown | null;
  };
  message: string;
  statusCode: number;
  errors: unknown | null;
}

interface L2ControlItem {
  controlID?: number | string;
  control?: string;
  description?: string | null;
  assignee?: string | null;
  dueDate?: string | null;
  isControlComplete?: boolean;
}

interface L2ApiResponse {
  data: {
    l2ISODATA?: L2ControlItem[] | null;
    isodata?: L2ControlItem[] | null;
    l2BCMSDATA?: L2ControlItem[] | null;
    bcmsdata?: L2ControlItem[] | null;
  };
  message: string;
  statusCode: number;
  errors: unknown | null;
}

interface L3ActivityItem {
  activityId?: number | string;
  activityTitle?: string;
  activityDetail?: string | null;
  doerRoleName?: string | null;
  doerRoleId?: string | number | null;
  frequencyName?: string | null;
  frequencyId?: string | number | null;
  approverRoleName?: string | null;
  approverRoleId?: string | number | null;
  duration?: string | number | null;
  isAssignmentComplete?: boolean | null;
  workflowStatusId?: number;
}

interface L3ApiResponse {
  data: {
    isodata?: L3ActivityItem[] | null;
    l3ISODATA?: L3ActivityItem[] | null;
    l3BCMSDATA?: L3ActivityItem[] | null;
    bcmsdata?: L3ActivityItem[] | null;
  };
  message: string;
  statusCode: number;
  errors: unknown | null;
}

/* =========================
   Helpers
   ========================= */

const getStatusIcon = (status: StatusKey) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return <Icon className={`w-4 h-4 text-${config.color}-600`} />;
};

const getStatusColor = (status: StatusKey) => {
  return STATUS_CONFIG[status]?.bgClass || STATUS_CONFIG.pending.bgClass;
};

const keyOfReq = (req: Requirement, idx: number) => req.id || `req-${idx}`;
const keyOfCtrl = (ctrl: Control, reqId: string, idx: number) =>
  ctrl.id || `ctrl-${reqId}-${idx}`;
const keyOfAct = (act: Activity, ctrlId: string, idx: number) =>
  act.id || `act-${ctrlId}-${idx}`;

/* =========================
   Component
   ========================= */

export const Portfolio: React.FC = () => {
  // Read synchronously so it's available before the first loadL1 call
  const [custId] = React.useState<number>(() => {
    try {
      const raw = sessionStorage.getItem('customerId');
      const n = raw != null ? Number(raw) : NaN;
      return Number.isFinite(n) ? n : 4;
    } catch {
      return 4;
    }
  });

  /* -------- Selected standard from Sidebar -------- */
  const { selectedStandard } = useStandards();

  /* -------- Role: show Auditor controls only if auditor -------- */
<<<<<<< Updated upstream
  const { selectedRole, isClientAdmin, selectedDomain } = useAuth();                               // NEW
=======
  const { selectedRole, selectedDomain, isClientAdmin } = useAuth();                               // NEW
>>>>>>> Stashed changes
  const [isAuditor, setIsAuditor] = React.useState<boolean>(false); // NEW
  React.useEffect(() => {                                           // NEW
    let aud = false;
    if (selectedRole?.name?.toLowerCase().includes('auditor')) aud = true;
    const roleNum = Number(sessionStorage.getItem('role'));
    if (roleNum === 3) aud = true;
    try {
      const raw = sessionStorage.getItem('roleDetails');
      if (raw) {
        const { roletype } = JSON.parse(raw);
        if (Number(roletype) === 3) aud = true;
      }
    } catch {}
    setIsAuditor(aud);
  }, [selectedRole?.name]);

  const [assignmentRows, setAssignmentRows] = React.useState<AssignmentCard[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = React.useState(false);
  const [assignmentsError, setAssignmentsError] = React.useState<string | null>(null);
  const userId = React.useMemo(() => Number(sessionStorage.getItem('userid') || '0'), []);

  React.useEffect(() => {
    const loadAssignments = async () => {
      if (!custId) return;
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      try {
        const json = isClientAdmin
          ? await getAssignmentsForAdmin(custId)
          : await getAssignments(custId, userId, 0);
        const rawAssignments = Array.isArray(json)
          ? json
          : Array.isArray((json as any)?.data)
          ? (json as any).data
          : [];
        setAssignmentRows(flattenAssignments(rawAssignments));
      } catch (err: any) {
        setAssignmentsError(err?.message || 'Failed to load assignments.');
        setAssignmentRows([]);
      } finally {
        setAssignmentsLoading(false);
      }
    };
    void loadAssignments();
  }, [custId, userId, isClientAdmin]);

  const assignmentsByActivityId = React.useMemo(
    () =>
      assignmentRows.reduce<Record<string, AssignmentCard[]>>((acc, item) => {
        const key = String(item.activityMasterId ?? item.id ?? '');
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {}),
    [assignmentRows]
  );

  /* -------- L1: Requirements -------- */
  const [requirements, setRequirements] = React.useState<Requirement[]>([]);
  const [loadingL1, setLoadingL1] = React.useState(false);
  const [errorL1, setErrorL1] = React.useState<string | null>(null);
  const [expandedRequirements, setExpandedRequirements] = React.useState<string[]>([]);
  const [expandedControls, setExpandedControls] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const loadL1 = React.useCallback(
    async (stdId: number, stdName: string) => {
      setLoadingL1(true);
      setErrorL1(null);
      try {
        const res = await api.get('/Standard_Detail_/Get_L1_StandardsDetails', {
          params: { stdId, custId: custId ?? 0 }
        });
        const json: StandardsDetailResponse = res.data;

        const raw =
          (Array.isArray(json?.data?.isodata) && json.data.isodata) ||
          (Array.isArray(json?.data?.bcmsdata) && json.data.bcmsdata) ||
          (Array.isArray(json?.data?.aramcodata) && json.data.aramcodata) ||
          (Array.isArray(json?.data?.ncA_ECC) && json.data.ncA_ECC) ||
          [];

        const items = raw as L1IsoDataItem[];

        const mapped: Requirement[] = items.map((item) => {
          const rawId = item.requirementID ?? item.controlID ?? Math.random();
          const id = String(rawId);
          const title = (item.requirement ?? item.control ?? `Requirement ${id}`).trim();
          
          // DYNAMIC STATUS:
          let status: StatusKey = 'pending';
          if (item.isControlComplete === true) {
            status = 'completed';
          }
          
          return {
            id,
            reqIdForL2: (item.requirementID ?? item.controlID)?.toString(),
            title,
            description: item.justification || '',
            domain: stdName,
            status,
            progress: item.isControlComplete ? 100 : 0,
            controls: [],
            isApplicable: item.isApplicable ?? true,
            justification: item.justification ?? '',
          };
        });

        setRequirements(mapped);
        setExpandedRequirements(mapped.length ? [mapped[0].id] : []);
        setExpandedControls([]);
      } catch (err: any) {
        setErrorL1(`Failed to load requirements. ${err?.message || ''}`);
        setRequirements([]);
      } finally {
        setLoadingL1(false);
      }
    },
    [custId]
  );

  React.useEffect(() => {
    if (selectedStandard?.stdId) {
      void loadL1(selectedStandard.stdId, selectedStandard.name);
    } else {
      setRequirements([]);
    }
  }, [selectedStandard?.stdId, selectedStandard?.name, loadL1]);

  /* -------- L2: Controls -------- */
  const [controlsLoading, setControlsLoading] = React.useState<Record<string, boolean>>({});
  const [controlsError, setControlsError] = React.useState<Record<string, string | null>>({});

  const loadControls = React.useCallback(
    async (reqKey: string) => {
      if (controlsLoading[reqKey]) return;
      const req = requirements.find((r) => r.id === reqKey);
      const reqIdForL2 = req?.reqIdForL2;
      if (!req || !reqIdForL2 || !selectedStandard?.stdId) return;

      const stdId = selectedStandard.stdId;
      try {
        setControlsLoading((prev) => ({ ...prev, [reqKey]: true }));
        const res = await api.get('/Standard_Detail_/Get_L2_StandardsDetails', {
          params: { stdId, custId, reqId: reqIdForL2 }
        });
        const json: L2ApiResponse = res.data;

        const raw =
          (Array.isArray(json?.data?.l2ISODATA) && json.data.l2ISODATA) ||
          (Array.isArray(json?.data?.isodata) && json.data.isodata) ||
          (Array.isArray(json?.data?.l2BCMSDATA) && json.data.l2BCMSDATA) ||
          (Array.isArray(json?.data?.bcmsdata) && json.data.bcmsdata) ||
          [];

        const mappedControls: Control[] = (raw as L2ControlItem[]).map((c, idx) => ({
          id: String(c.controlID ?? `${reqKey}-${idx + 1}`),
          ctrlIdForL3: c.controlID != null ? String(c.controlID) : undefined,
          title: (c.control ?? `Control ${c.controlID ?? idx + 1}`).toString(),
          description: (c.description ?? '').toString(),
          status: c.isControlComplete === true ? 'completed' : 'pending',
          assignee: (c.assignee ?? 'Unassigned').toString(),
          dueDate: (c.dueDate ?? 'TBD').toString(),
          evidence: '',
          activities: [],
          isApplicable: true,
          justification: '',
        }));

        setRequirements((prev) =>
          prev.map((r) => (r.id === reqKey ? { ...r, controls: mappedControls } : r))
        );
      } catch (err: any) {
        setControlsError((prev) => ({ ...prev, [reqKey]: err.message }));
      } finally {
        setControlsLoading((prev) => ({ ...prev, [reqKey]: false }));
      }
    },
    [selectedStandard?.stdId, custId, requirements, controlsLoading]
  );

  /* -------- L3: Activities -------- */
  const [activitiesLoading, setActivitiesLoading] =
    React.useState<Record<string, boolean>>({});
  const [activitiesError, setActivitiesError] =
    React.useState<Record<string, string | null>>({});

  const loadActivities = React.useCallback(
    async (reqKey: string, ctrlKey: string) => {
      if (activitiesLoading[ctrlKey]) return;
      const req = requirements.find((r) => r.id === reqKey);
      const ctrl = req?.controls.find((c) => c.id === ctrlKey);
      const conIdForL3 = ctrl?.ctrlIdForL3;
      if (!req || !ctrl || !conIdForL3 || !selectedStandard?.stdId) return;

      const stdId = selectedStandard.stdId;
      try {
        setActivitiesLoading((prev) => ({ ...prev, [ctrlKey]: true }));
        const res = await api.get('/Standard_Detail_/Get_L3_StandardsDetails', {
          params: { stdId, custId, conId: conIdForL3 }
        });
        const json: L3ApiResponse = res.data;

        const raw =
          (Array.isArray(json?.data?.isodata) && json.data.isodata) ||
          (Array.isArray(json?.data?.l3ISODATA) && json.data.l3ISODATA) ||
          (Array.isArray(json?.data?.l3BCMSDATA) && json.data.l3BCMSDATA) ||
          (Array.isArray(json?.data?.bcmsdata) && json.data.bcmsdata) ||
          [];

        const mappedActivities: Activity[] = (raw as L3ActivityItem[]).map((a, idx) => {
          const rawId = a.activityId ?? idx + 1;
          const statusValue = a.workflowStatusId != null ? mapWorkflowStatus(a.workflowStatusId) : (a.isAssignmentComplete === true ? 'completed' : 'pending');
          return {
            id: String(rawId),
            title: (a.activityTitle ?? `Activity ${rawId}`).toString(),
            description: (a.activityDetail ?? '').toString(),
            frequency: (a.frequencyName ?? 'N/A').toString(),
            frequencyId: a.frequencyId ?? undefined,
            assignee: ((a.doerRoleName ?? (a as any).doerName) ?? 'Unassigned').toString(),
            doerRoleId: a.doerRoleId ?? undefined,
            approverRole: (a.approverRoleName ?? undefined),
            approverRoleId: a.approverRoleId ?? undefined,
            duration: a.duration ?? undefined,
            status: statusValue,
            dueDate: 'TBD',
            lastCompleted: undefined,
          };
        });

        setRequirements((prev) =>
          prev.map((r) =>
            r.id !== reqKey
              ? r
              : {
                  ...r,
                  controls: r.controls.map((c) =>
                    c.id !== ctrlKey ? c : { ...c, activities: mappedActivities }
                  ),
                }
          )
        );
      } catch (err: any) {
        setActivitiesError((prev) => ({ ...prev, [ctrlKey]: err.message }));
      } finally {
        setActivitiesLoading((prev) => ({ ...prev, [ctrlKey]: false }));
      }
    },
    [selectedStandard?.stdId, custId, activitiesLoading, requirements]
  );

  /* -------- Requirement Edit Modal State -------- */
  const [editingReq, setEditingReq] = React.useState<Requirement | null>(null);
  const openEditRequirement = (req: Requirement) => setEditingReq(req);
  const closeEditRequirement = () => setEditingReq(null);
  const handleSaveRequirement = (updated: Requirement) => {
    setRequirements((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  /* -------- Control Edit Modal State -------- */
  const [editingCtrl, setEditingCtrl] = React.useState<{
    reqKey: string;
    ctrlKey: string;
    data: Control;
  } | null>(null);

  const openEditControl = (reqKey: string, ctrlKey: string, data: Control) =>
    setEditingCtrl({ reqKey, ctrlKey, data });

  const closeEditControl = () => setEditingCtrl(null);

  const handleSaveControl = (updated: Control) => {
    if (!editingCtrl) return;
    setRequirements((prev) =>
      prev.map((r) => {
        if (r.id !== editingCtrl.reqKey) return r;
        return {
          ...r,
          controls: r.controls.map((c) =>
            c.id === editingCtrl.ctrlKey
              ? {
                  ...c,
                  isApplicable: updated.isApplicable,
                  justification: updated.justification,
                }
              : c
          ),
        };
      })
    );
  };

  /* -------- Initial Audit (Auditor) Modal State -------- */
  const [auditModal, setAuditModal] = React.useState<{
    open: boolean;
    reqKey: string;
    ctrlKey: string;
    controlId: string | number | null;
    comments?: string | null;
    statusId?: number | null;
  } | null>(null);

  const openAuditModal = (
    reqKey: string,
    ctrlKey: string,
    ctrlApiId?: string | number | null,
    comments?: string | null,
    statusId?: number | null
  ) => {
    setAuditModal({
      open: true,
      reqKey,
      ctrlKey,
      controlId: ctrlApiId ?? null,
      comments,
      statusId,
    });
  };

  const closeAuditModal = () => setAuditModal(null);

  const applyAuditSaveToState = (
    reqKey: string,
    ctrlKey: string,
    saved: { statusId: number; statusName: string; comments: string }
  ) => {
    setRequirements(prev =>
      prev.map(r => {
        if (r.id !== reqKey) return r;
        return {
          ...r,
          controls: r.controls.map(c =>
            c.id === ctrlKey
              ? {
                  ...c,
                  preCapaStatusId: saved.statusId,
                  preCapaStatusName: saved.statusName,
                  preCapaComments: saved.comments,
                }
              : c
          ),
        };
      })
    );
  };

  /* -------- UI Handlers -------- */
  const toggleRequirement = (requirementId: string) => {
    setExpandedRequirements((prev) => {
      const isExpanding = !prev.includes(requirementId);
      if (isExpanding) {
        const req = requirements.find((r) => r.id === requirementId);
        if (req && req.controls.length === 0 && !controlsLoading[requirementId]) {
          void loadControls(requirementId);
        }
        return [...prev, requirementId];
      }
      return prev.filter((id) => id !== requirementId);
    });
  };

  const toggleControl = (reqKey: string, controlId: string) => {
    setExpandedControls((prev) => {
      const isExpanding = !prev.includes(controlId);
      if (isExpanding) {
        const req = requirements.find((r) => r.id === reqKey);
        const ctrl = req?.controls.find((c) => c.id === controlId);
        if (ctrl && ctrl.activities.length === 0 && !activitiesLoading[controlId]) {
          void loadActivities(reqKey, controlId);
        }
        return [...prev, controlId];
      }
      return prev.filter((id) => id !== controlId);
    });
  };

  /* -------- Activity Modal State/Handlers -------- */
  const [activityModalOpen, setActivityModalOpen] = React.useState(false);
  const [activityModalMode, setActivityModalMode] = React.useState<'add' | 'edit'>('add');
  const [activeReqKey, setActiveReqKey] = React.useState<string | null>(null);
  const [activeCtrlKey, setActiveCtrlKey] = React.useState<string | null>(null);
  const [activeCtrlApiId, setActiveCtrlApiId] = React.useState<string | number | null>(null);
  const [editingActivity, setEditingActivity] = React.useState<Activity | null>(null);

  const [assignmentModalOpen, setAssignmentModalOpen] = React.useState(false);
  const [selectedActivityAssignments, setSelectedActivityAssignments] = React.useState<AssignmentCard[]>([]);
  const [selectedActivityTitle, setSelectedActivityTitle] = React.useState<string>('');

  const [assignmentFormModalOpen, setAssignmentFormModalOpen] = React.useState(false);
  const [assignmentFormMode, setAssignmentFormMode] = React.useState<'view' | 'edit'>('view');
  const [selectedAssignment, setSelectedAssignment] = React.useState<AssignmentCard | null>(null);

  const openNewActivity = (reqKey: string, ctrlKey: string, ctrlApiId?: string | number) => {
    setActiveReqKey(reqKey);
    setActiveCtrlKey(ctrlKey);
    setActiveCtrlApiId(ctrlApiId ?? null);
    setEditingActivity(null);
    setActivityModalMode('add');
    setActivityModalOpen(true);
  };

  const openEditActivity = (
    reqKey: string,
    ctrlKey: string,
    act: Activity,
    ctrlApiId?: string | number
  ) => {
    setActiveReqKey(reqKey);
    setActiveCtrlKey(ctrlKey);
    setActiveCtrlApiId(ctrlApiId ?? null);
    setEditingActivity(act);
    setActivityModalMode('edit');
    setActivityModalOpen(true);
  };

  const patchActivitiesInState = (vals: ActivityFormValues) => {
    if (!activeReqKey || !activeCtrlKey) return;

    setRequirements((prev) =>
      prev.map((r) => {
        if (r.id !== activeReqKey) return r;
        return {
          ...r,
          controls: r.controls.map((c) => {
            if (c.id !== activeCtrlKey) return c;

            if (activityModalMode === 'add') {
              const newId = vals.id ?? `${c.id}-${Date.now()}`;
              const newAct: Activity = {
                id: String(newId),
                title: vals.title,
                description: vals.description,
                frequency: vals.frequency,
                assignee: vals.doerRole || 'Unassigned',
                status: 'pending',
                dueDate: 'TBD',
              };
              return { ...c, activities: [...c.activities, newAct] };
            } else {
              return {
                ...c,
                activities: c.activities.map((a) =>
                  a.id === editingActivity?.id
                    ? {
                        ...a,
                        title: vals.title,
                        description: vals.description,
                        frequency: vals.frequency,
                        assignee: vals.doerRole || a.assignee,
                      }
                    : a
                ),
              };
            }
          }),
        };
      })
    );
  };

  const openAssignmentView = (assignment: AssignmentCard) => {
    setSelectedAssignment(assignment);
    setAssignmentFormMode('view');
    setAssignmentFormModalOpen(true);
  };

  const openAssignmentEdit = (assignment: AssignmentCard) => {
    setSelectedAssignment(assignment);
    setAssignmentFormMode('edit');
    setAssignmentFormModalOpen(true);
  };

  const closeAssignmentFormModal = () => {
    setAssignmentFormModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleAssignmentSaved = () => {
    // Refresh assignments data
    const loadAssignments = async () => {
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      try {
        const json = isClientAdmin
          ? await getAssignmentsForAdmin(custId)
          : await getAssignments(custId, userId, 0);
        const rawAssignments = Array.isArray(json)
          ? json
          : Array.isArray((json as any)?.data)
          ? (json as any).data
          : [];
        setAssignmentRows(flattenAssignments(rawAssignments));
      } catch (err: any) {
        setAssignmentsError(err?.message || 'Failed to load assignments.');
        setAssignmentRows([]);
      } finally {
        setAssignmentsLoading(false);
      }
    };
    void loadAssignments();
  };

  /* -------- Derived -------- */
  const filteredRequirements = requirements.filter(
    (req) =>
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.justification ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =========================
     Render
     ========================= */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Portfolio Standards</h2>
          <p className="text-gray-600">
            {selectedStandard
              ? `Viewing ${selectedStandard.name} — browse Requirements, Controls, and Activities`
              : 'Pick a standard from the left sidebar to view its Requirements, Controls, and Activities.'}
          </p>
        </div>
      </div>

      {/* L1 Container */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedStandard
                ? `${selectedStandard.name} — Requirements (Level-1)`
                : 'Requirements (Level-1)'}
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={!selectedStandard}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={!selectedStandard}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>

          {/* Top stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Requirements', value: filteredRequirements.length, color: 'blue' },
              {
                label: STATUS_CONFIG.completed.label,
                value: filteredRequirements.filter((r) => r.status === 'completed').length,
                color: STATUS_CONFIG.completed.color,
              },
              {
                label: STATUS_CONFIG['in-progress'].label,
                value: filteredRequirements.filter((r) => r.status === 'in-progress' || r.status === 'pending').length,
                color: STATUS_CONFIG['in-progress'].color,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`p-4 rounded-lg bg-${stat.color}-50 border border-${stat.color}-100`}
              >
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* L1 — List */}
        <div className="divide-y divide-gray-100">
          {loadingL1 && <div className="p-4 text-gray-600 text-sm">Loading requirements…</div>}
          {errorL1 && !loadingL1 && <div className="p-4 text-red-600 text-sm">{errorL1}</div>}
          {!loadingL1 && !errorL1 && filteredRequirements.length === 0 && selectedStandard && (
            <div className="p-4 text-gray-600 text-sm">
              No requirements found for {selectedStandard.name}.
            </div>
          )}
          {!loadingL1 &&
            !errorL1 &&
            filteredRequirements.map((req, idx) => {
              const reqKey = keyOfReq(req, idx);
              const expanded = expandedRequirements.includes(reqKey);
              return (
                <div key={reqKey} className="border-t border-gray-100">
                  {/* Requirement row */}
                  <button
                    onClick={() => toggleRequirement(reqKey)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {expanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-800">{req.title}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              req.status
                            )} flex items-center gap-1`}
                          >
                            {getStatusIcon(req.status)}
                            {STATUS_CONFIG[req.status]?.label || req.status}
                          </span>
                          {isClientAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditRequirement(req);
                            }}
                            className="ml-2 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                          )}
                        </div>
                        {req.description && (
                          <p className="text-sm text-gray-600">{req.description}</p>
                        )}
                        {typeof req.justification === 'string' && req.justification.trim() && (
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Justification: </span>
                            {req.justification}
                          </p>
                        )}
                        {req.isApplicable !== undefined && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Applicable: </span>
                            {req.isApplicable ? 'Yes' : 'No'}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded controls */}
                  {expanded && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      <div className="p-4 pl-12">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                          Controls for {req.title}
                        </h5>
                        {controlsLoading[reqKey] && (
                          <div className="text-sm text-gray-600">Loading controls…</div>
                        )}
                        {controlsError[reqKey] && !controlsLoading[reqKey] && (
                          <div className="text-sm text-red-600">{controlsError[reqKey]}</div>
                        )}
                        {!controlsLoading[reqKey] &&
                          !controlsError[reqKey] &&
                          req.controls.length === 0 && (
                            <div className="text-sm text-gray-600">
                              No controls found for this requirement.
                            </div>
                          )}
                        {!controlsLoading[reqKey] &&
                          !controlsError[reqKey] &&
                          req.controls.length > 0 && (
                            <div className="space-y-3">
                              {req.controls.map((ctrl, cIdx) => {
                                const ctrlKey = keyOfCtrl(ctrl, reqKey, cIdx);
                                const ctrlExpanded = expandedControls.includes(ctrlKey);
                                return (
                                  <div
                                    key={ctrlKey}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200"
                                  >
                                    {/* Control row */}
                                    <button
                                      onClick={() => toggleControl(reqKey, ctrlKey)}
                                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        {ctrlExpanded ? (
                                          <ChevronDown className="w-4 h-4 text-gray-600" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-gray-600" />
                                        )}
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <h5 className="text-sm font-medium text-gray-800 mb-1">
                                              {ctrl.title}
                                            </h5>

                                            {/* Control Edit (existing) - Only for Client Admin */}
                                            {isClientAdmin && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openEditControl(reqKey, ctrlKey, ctrl);
                                              }}
                                              className="ml-1 px-2 py-0.5 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
                                              title="Edit Control"
                                            >
                                              Edit
                                            </button>
                                            )}

                                            {/* Initial Audit (Auditor only) */}
                                            {isAuditor && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openAuditModal(
                                                    reqKey,
                                                    ctrlKey,
                                                    ctrl.ctrlIdForL3 ?? ctrl.id,
                                                    ctrl.preCapaComments ?? null,
                                                    ctrl.preCapaStatusId ?? null
                                                  );
                                                }}
                                                className="ml-1 px-2 py-0.5 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded text-xs font-medium transition-colors"
                                                title="Update Initial Audit"
                                              >
                                                Initial Audit
                                              </button>
                                            )}
                                          </div>

                                          {ctrl.description && (
                                            <p className="text-xs text-gray-600 mb-2">
                                              {ctrl.description}
                                            </p>
                                          )}
                                          <div className="flex gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                              <User className="w-3 h-3" />
                                              <span>Assignee: {ctrl.assignee}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              <span>Due: {ctrl.dueDate}</span>
                                            </div>
                                            <div>
                                              <span>Activities: {ctrl.activities.length}</span>
                                            </div>
                                          </div>

                                          {/* Old-UI-style labels */}
                                          {typeof ctrl.isApplicable !== 'undefined' && (
                                            <p className="text-xs text-gray-600 mt-1">
                                              <span className="font-medium">Applicable:</span>{' '}
                                              {ctrl.isApplicable ? 'Yes' : 'No'}
                                            </p>
                                          )}
                                          {typeof ctrl.justification === 'string' &&
                                            ctrl.justification.trim() && (
                                              <p className="text-xs text-gray-600">
                                                <span className="font-medium">Justification:</span>{' '}
                                                {ctrl.justification}
                                              </p>
                                            )}

                                          {/* Initial Audit reflection */}
                                          {typeof ctrl.preCapaStatusId !== 'undefined' && (
                                            <p className="text-xs text-gray-600">
                                              <span className="font-medium">Initial Audit:</span>{' '}
                                              {ctrl.preCapaStatusName ?? `Status #${ctrl.preCapaStatusId}`}
                                            </p>
                                          )}
                                          {typeof ctrl.preCapaComments === 'string' &&
                                            ctrl.preCapaComments.trim() && (
                                              <p className="text-xs text-gray-500">
                                                <span className="font-medium">Audit Comments:</span>{' '}
                                                {ctrl.preCapaComments}
                                              </p>
                                            )}
                                        </div>
                                      </div>
                                    </button>

                                    {/* Expanded activities */}
                                    {ctrlExpanded && (
                                      <div className="bg-blue-50 border-t border-blue-100">
                                        <div className="p-4 pl-12">
                                          <div className="flex items-center justify-between mb-3">
                                            <h6 className="text-sm font-medium text-gray-700">
                                              Activities for {ctrl.title}
                                            </h6>
                                            {isClientAdmin && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openNewActivity(
                                                  reqKey,
                                                  ctrlKey,
                                                  ctrl.ctrlIdForL3 ?? ctrl.id
                                                )
                                              }
                                              className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                            >
                                              <PlusCircle className="w-3 h-3" />
                                              New Activity
                                            </button>
                                            )}
                                          </div>

                                          {activitiesLoading[ctrlKey] && (
                                            <div className="text-sm text-gray-600">
                                              Loading activities…
                                            </div>
                                          )}
                                          {activitiesError[ctrlKey] &&
                                            !activitiesLoading[ctrlKey] && (
                                              <div className="text-sm text-red-600">
                                                {activitiesError[ctrlKey]}
                                              </div>
                                            )}
                                          {!activitiesLoading[ctrlKey] &&
                                            !activitiesError[ctrlKey] &&
                                            ctrl.activities.length === 0 && (
                                              <div className="text-sm text-gray-600">
                                                No activities found for this control.
                                              </div>
                                            )}
                                          {!activitiesLoading[ctrlKey] &&
                                            !activitiesError[ctrlKey] &&
                                            ctrl.activities.length > 0 && (
                                              <div className="space-y-3">
                                                {ctrl.activities.map((act, aIdx) => {
                                                  const actKey = keyOfAct(act, ctrlKey, aIdx);
                                                  // Check if user role allows editing
                                                  const canEditActivity = isClientAdmin === true;
                                                  return (
                                                    <div
                                                      key={actKey}
                                                      className="bg-white rounded-lg p-3 border border-blue-200 relative"
                                                    >
                                                      {/* Edit button in top right corner - only for Client Admin */}
                                                      {canEditActivity && (
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditActivity(
                                                            reqKey,
                                                            ctrlKey,
                                                            act,
                                                            ctrl.ctrlIdForL3 ?? ctrl.id
                                                          )
                                                        }
                                                        className="absolute top-2 right-2 text-gray-500 hover:text-blue-600"
                                                        title="Edit Activity"
                                                      >
                                                        <Edit3 className="w-4 h-4" />
                                                      </button>
                                                      )}

                                                      <h6 className="text-sm font-medium text-gray-800">
                                                        {act.title}
                                                      </h6>
                                                      <p className="text-xs text-gray-600 mb-2">
                                                        {act.description}
                                                      </p>
                                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                                                        <div>
                                                          <span className="font-medium">
                                                            Frequency:
                                                          </span>{' '}
                                                          {act.frequency}
                                                        </div>
                                                        <div>
                                                          <span className="font-medium">
                                                            Assignee:
                                                          </span>{' '}
                                                          {act.assignee}
                                                        </div>
                                                        <div>
                                                          <span className="font-medium">Status:</span>{' '}
                                                          {act.status}
                                                        </div>
                                                        <div>
                                                          <span className="font-medium">Due:</span>{' '}
                                                          {act.dueDate}
                                                        </div>
                                                      </div>

                                                      <div className="mt-3 flex gap-2">
                                                        {(assignmentsByActivityId[act.id] || []).length > 0 && (
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              setAssignmentModalOpen(true);
                                                              setSelectedActivityAssignments(assignmentsByActivityId[act.id] || []);
                                                              setSelectedActivityTitle(act.title);
                                                            }}
                                                            className="px-3 py-1 text-xs rounded bg-amber-100 text-amber-700 hover:bg-amber-200 font-medium"
                                                          >
                                                            Assignments ({(assignmentsByActivityId[act.id] || []).length})
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Activity Add/Edit Modal */}
      <ActivityFormModal
        open={activityModalOpen}
        mode={activityModalMode}
        initialValues={
          editingActivity
            ? {
                id: editingActivity.id,
                title: editingActivity.title,
                description: editingActivity.description,
                doerRole: String(editingActivity.doerRoleId ?? editingActivity.assignee ?? ''),
                approverRole: String(editingActivity.approverRoleId ?? editingActivity.approverRole ?? ''),
                duration: String(editingActivity.duration ?? ''),
                frequency: String(editingActivity.frequencyId ?? editingActivity.frequency ?? ''),
                justification: 'Periodic control verification.',
                isApplicable: true,
              }
            : undefined
        }
        onClose={() => setActivityModalOpen(false)}
        onSaved={(vals) => {
          patchActivitiesInState(vals);
          if (activeReqKey && activeCtrlKey) {
            void loadActivities(activeReqKey, activeCtrlKey);
          }
          setActivityModalOpen(false);
        }}
        onSuccessMessage={(m) => setSuccessMsg(m)}
        customerId={custId}
        standardId={selectedStandard?.stdId ?? 1}
        controlId={activeCtrlApiId ?? ''}
      />

      {/* Requirement Edit Modal */}
      {editingReq && (
        <EditModal
          requirement={editingReq}
          onClose={closeEditRequirement}
          onSave={handleSaveRequirement}
          customerId={custId}
          standardId={selectedStandard?.stdId ?? 1}
          onSuccessMessage={(msg) => setSuccessMsg(msg)}
        />
      )}

      {/* Control Edit Modal */}
      <ControlEditModal
        open={!!editingCtrl}
        control={editingCtrl?.data ?? null}
        customerId={custId}
        standardId={selectedStandard?.stdId ?? 1}
        onClose={closeEditControl}
        onSave={handleSaveControl}
        onSuccessMessage={(m) => setSuccessMsg(m)}
      />

      {/* Initial Audit (Auditor) Modal */}
      <AuditorEditModal
        open={!!auditModal?.open}
        controlId={auditModal?.controlId ?? null}
        customerId={custId}
        initialComments={auditModal?.comments ?? undefined}
        initialStatusId={auditModal?.statusId ?? undefined}
        onClose={closeAuditModal}
        onSaved={(saved) => {
          if (auditModal) {
            applyAuditSaveToState(auditModal.reqKey, auditModal.ctrlKey, saved);
          }
        }}
        onSuccessMessage={(m) => setSuccessMsg(m)}
      />

      {/* Assignments Modal */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Assignments for: {selectedActivityTitle}
              </h2>
              <button
                type="button"
                onClick={() => setAssignmentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {!isClientAdmin && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  You can view assignments for this activity, but editing is restricted to Client Admin users.
                </div>
              )}
              {assignmentsLoading ? (
                <div className="text-center py-12 text-gray-600">
                  Loading assignments…
                </div>
              ) : selectedActivityAssignments.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No assignments found for this activity.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedActivityAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm mb-4">
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Activity
                          </div>
                          <div className="text-gray-900 font-medium">
                            {assignment.activityName || assignment.standardName || 'Assignment'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Standard
                          </div>
                          <div className="text-gray-900 font-medium">
                            {assignment.standardName || '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Assigned To
                          </div>
                          <div className="text-gray-900">
                            {assignment.doer || '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Approved By
                          </div>
                          <div className="text-gray-900">
                            {assignment.approver || '—'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Start Date
                          </div>
                          <div className="text-gray-900">
                            {assignment.startDate ? new Date(assignment.startDate).toISOString().slice(0, 10) : 'TBD'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Due Date
                          </div>
                          <div className="text-gray-900">
                            {assignment.endDate ? new Date(assignment.endDate).toISOString().slice(0, 10) : 'TBD'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => openAssignmentView(assignment)}
                          className="px-4 py-2 text-sm rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-colors"
                        >
                          View Details
                        </button>
                        {isClientAdmin && (
                          <button
                            type="button"
                            onClick={() => openAssignmentEdit(assignment)}
                            className="px-4 py-2 text-sm rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors"
                          >
                            Edit Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6 flex justify-end">
              <button
                type="button"
                onClick={() => setAssignmentModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Form Modal */}
      {assignmentFormModalOpen && selectedAssignment && (
        <AssignmentFormModal
          open={assignmentFormModalOpen}
          onClose={closeAssignmentFormModal}
          customerId={custId}
<<<<<<< Updated upstream
          govId={Number(selectedDomain?.id ?? 1)}
=======
          govId={Number(selectedDomain?.id ?? 0)}
>>>>>>> Stashed changes
          initial={{
            id: selectedAssignment.id,
            compliancePeriodId: selectedAssignment.compliancePeriodId,
            activityMasterId: selectedAssignment.activityMasterId,
            doerCliUserId: selectedAssignment.doerId,
            approverCliUserId: selectedAssignment.approverId,
            startDate: selectedAssignment.startDate,
            endDate: selectedAssignment.endDate,
          }}
          viewOnly={assignmentFormMode === 'view'}
          onSaved={handleAssignmentSaved}
        />
      )}

      {/* Success dialog */}
      {successMsg && (
        <SuccessDialog
          title="Success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}
    </div>
  );
};





// // src/components/pages/Portfolio.tsx
// import React from 'react';
// import {
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Search,
//   Filter,
//   ChevronDown,
//   ChevronRight,
//   User,
//   Calendar,
//   Edit3,
//   PlusCircle,
// } from 'lucide-react';
// import { useStandards } from '../../context/StandardsContext';
// import { EditModal } from './EditModal';
// import { SuccessDialog } from './SuccessDialog';
// import { ActivityFormModal, ActivityFormValues } from './ActivityFormModal';
// import { ControlEditModal } from './ControlEditModal';

// /* =========================
//    Types
//    ========================= */

// export interface Activity {
//   id: string;
//   title: string;
//   description: string;
//   frequency: string;
//   assignee: string;
//   status: 'completed' | 'in-progress' | 'pending' | 'overdue';
//   dueDate: string;
//   lastCompleted?: string;
// }

// export interface Control {
//   id: string;
//   ctrlIdForL3?: string; // control id for L3/Activity endpoints
//   title: string;
//   description: string;
//   status: 'completed' | 'in-progress' | 'pending' | 'overdue';
//   assignee: string;
//   dueDate: string;
//   evidence: string;
//   activities: Activity[];
//   // NEW: to match old UI behavior
//   isApplicable?: boolean;
//   justification?: string;
// }

// export interface Requirement {
//   id: string;
//   reqIdForL2?: string;
//   title: string;
//   description: string;
//   domain: string;
//   status: 'completed' | 'in-progress' | 'pending' | 'overdue';
//   progress: number;
//   controls: Control[];
//   isApplicable?: boolean;
//   justification?: string;
// }

// /* ===== API response shapes (inferred) ===== */
// interface L1IsoDataItem {
//   requirementID?: number;
//   requirement?: string;
//   controlID?: number;
//   control?: string;
//   justification?: string | null;
//   isApplicable?: boolean;
//   isControlComplete?: boolean;
// }

// interface StandardsDetailResponse {
//   data: {
//     isodata: L1IsoDataItem[] | null;
//     bcmsdata?: L1IsoDataItem[] | null;
//     aramcodata?: L1IsoDataItem[] | null;
//     ncA_ECC?: L1IsoDataItem[] | null;
//     levels: number;
//     l2ISODATA?: unknown | null;
//   };
//   message: string;
//   statusCode: number;
//   errors: unknown | null;
// }

// interface L2ControlItem {
//   controlID?: number | string;
//   control?: string;
//   description?: string | null;
//   assignee?: string | null;
//   dueDate?: string | null;
// }

// interface L2ApiResponse {
//   data: {
//     l2ISODATA?: L2ControlItem[] | null;
//     isodata?: L2ControlItem[] | null;
//     l2BCMSDATA?: L2ControlItem[] | null;
//     bcmsdata?: L2ControlItem[] | null;
//   };
//   message: string;
//   statusCode: number;
//   errors: unknown | null;
// }

// interface L3ActivityItem {
//   activityId?: number | string;
//   activityTitle?: string;
//   activityDetail?: string | null;
//   doerRoleName?: string | null;
//   frequencyName?: string | null;
//   isAssignmentComplete?: boolean | null;
// }

// interface L3ApiResponse {
//   data: {
//     isodata?: L3ActivityItem[] | null;
//     l3ISODATA?: L3ActivityItem[] | null;
//     l3BCMSDATA?: L3ActivityItem[] | null;
//     bcmsdata?: L3ActivityItem[] | null;
//   };
//   message: string;
//   statusCode: number;
//   errors: unknown | null;
// }

// /* =========================
//    Helpers
//    ========================= */

// const toStatus = (idx: number): Requirement['status'] => {
//   const states: Requirement['status'][] = ['completed', 'in-progress', 'pending', 'overdue'];
//   return states[idx % states.length];
// };

// const getStatusIcon = (status: string) => {
//   switch (status) {
//     case 'completed':
//       return <CheckCircle className="w-4 h-4 text-green-600" />;
//     case 'in-progress':
//       return <Clock className="w-4 h-4 text-blue-600" />;
//     case 'pending':
//       return <Clock className="w-4 h-4 text-yellow-600" />;
//     case 'overdue':
//       return <AlertCircle className="w-4 h-4 text-red-600" />;
//     default:
//       return <Clock className="w-4 h-4 text-gray-600" />;
//   }
// };

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case 'completed':
//       return 'bg-green-100 text-green-800';
//     case 'in-progress':
//       return 'bg-blue-100 text-blue-800';
//     case 'pending':
//       return 'bg-yellow-100 text-yellow-800';
//     case 'overdue':
//       return 'bg-red-100 text-red-800';
//     default:
//       return 'bg-gray-100 text-gray-800';
//   }
// };

// const keyOfReq = (req: Requirement, idx: number) => req.id || `req-${idx}`;
// const keyOfCtrl = (ctrl: Control, reqId: string, idx: number) =>
//   ctrl.id || `ctrl-${reqId}-${idx}`;
// const keyOfAct = (act: Activity, ctrlId: string, idx: number) =>
//   act.id || `act-${ctrlId}-${idx}`;

// /* =========================
//    Component
//    ========================= */

// export const Portfolio: React.FC = () => {
//   /* -------- CustomerId -------- */
//   const [custId, setCustId] = React.useState<number>(4);
//   React.useEffect(() => {
//     try {
//       const raw = sessionStorage.getItem('customerId');
//       const n = raw != null ? Number(raw) : NaN;
//       setCustId(Number.isFinite(n) ? n : 4);
//     } catch {
//       setCustId(4);
//     }
//   }, []);

//   /* -------- Selected standard from Sidebar -------- */
//   const { selectedStandard } = useStandards();

//   /* -------- L1: Requirements -------- */
//   const [requirements, setRequirements] = React.useState<Requirement[]>([]);
//   const [loadingL1, setLoadingL1] = React.useState(false);
//   const [errorL1, setErrorL1] = React.useState<string | null>(null);
//   const [expandedRequirements, setExpandedRequirements] = React.useState<string[]>([]);
//   const [expandedControls, setExpandedControls] = React.useState<string[]>([]);
//   const [searchTerm, setSearchTerm] = React.useState('');
//   const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

//   const loadL1 = React.useCallback(
//     async (stdId: number, stdName: string) => {
//       setLoadingL1(true);
//       setErrorL1(null);
//       try {
//         const url = `http://192.168.1.19:8080/api/Standard_Detail_/Get_L1_StandardsDetails?stdId=${encodeURIComponent(
//           stdId
//         )}&custId=${encodeURIComponent(custId ?? 0)}`;
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json: StandardsDetailResponse = await res.json();

//         const raw =
//           (Array.isArray(json?.data?.isodata) && json.data.isodata) ||
//           (Array.isArray(json?.data?.bcmsdata) && json.data.bcmsdata) ||
//           (Array.isArray(json?.data?.aramcodata) && json.data.aramcodata) ||
//           (Array.isArray(json?.data?.ncA_ECC) && json.data.ncA_ECC) ||
//           [];

//         const items = raw as L1IsoDataItem[];

//         const mapped: Requirement[] = items.map((item, idx) => {
//           const rawId = item.requirementID ?? item.controlID ?? (idx + 1);
//           const id = String(rawId);
//           const title = (item.requirement ?? item.control ?? `Requirement ${id}`).trim();
//           return {
//             id,
//             reqIdForL2: (item.requirementID ?? item.controlID)?.toString(),
//             title,
//             description: item.justification || '',
//             domain: stdName,
//             status: toStatus(idx),
//             progress: 0,
//             controls: [],
//             isApplicable: item.isApplicable ?? true,
//             justification: item.justification ?? '',
//           };
//         });

//         setRequirements(mapped);
//         setExpandedRequirements(mapped.length ? [mapped[0].id] : []);
//         setExpandedControls([]);
//       } catch (err: any) {
//         setErrorL1(`Failed to load requirements. ${err?.message || ''}`);
//         setRequirements([]);
//       } finally {
//         setLoadingL1(false);
//       }
//     },
//     [custId]
//   );

//   React.useEffect(() => {
//     if (selectedStandard?.stdId) {
//       void loadL1(selectedStandard.stdId, selectedStandard.name);
//     } else {
//       setRequirements([]);
//     }
//   }, [selectedStandard?.stdId, selectedStandard?.name, loadL1]);

//   /* -------- L2: Controls -------- */
//   const [controlsLoading, setControlsLoading] = React.useState<Record<string, boolean>>({});
//   const [controlsError, setControlsError] = React.useState<Record<string, string | null>>({});

//   const loadControls = React.useCallback(
//     async (reqKey: string) => {
//       if (controlsLoading[reqKey]) return;
//       const req = requirements.find((r) => r.id === reqKey);
//       const reqIdForL2 = req?.reqIdForL2;
//       if (!req || !reqIdForL2 || !selectedStandard?.stdId) return;

//       const stdId = selectedStandard.stdId;
//       const url = `http://192.168.1.19:8080/api/Standard_Detail_/Get_L2_StandardsDetails?stdId=${stdId}&custId=${custId}&reqId=${reqIdForL2}`;
//       try {
//         setControlsLoading((prev) => ({ ...prev, [reqKey]: true }));
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json: L2ApiResponse = await res.json();

//         const raw =
//           (Array.isArray(json?.data?.l2ISODATA) && json.data.l2ISODATA) ||
//           (Array.isArray(json?.data?.isodata) && json.data.isodata) ||
//           (Array.isArray(json?.data?.l2BCMSDATA) && json.data.l2BCMSDATA) ||
//           (Array.isArray(json?.data?.bcmsdata) && json.data.bcmsdata) ||
//           [];

//         const mappedControls: Control[] = (raw as L2ControlItem[]).map((c, idx) => ({
//           id: String(c.controlID ?? `${reqKey}-${idx + 1}`),
//           ctrlIdForL3: c.controlID != null ? String(c.controlID) : undefined,
//           title: (c.control ?? `Control ${c.controlID ?? idx + 1}`).toString(),
//           description: (c.description ?? '').toString(),
//           status: toStatus(idx),
//           assignee: (c.assignee ?? 'Unassigned').toString(),
//           dueDate: (c.dueDate ?? 'TBD').toString(),
//           evidence: '',
//           activities: [],
//           // Defaults to replicate old UI flow; update after save:
//           isApplicable: true,
//           justification: '',
//         }));

//         setRequirements((prev) =>
//           prev.map((r) => (r.id === reqKey ? { ...r, controls: mappedControls } : r))
//         );
//       } catch (err: any) {
//         setControlsError((prev) => ({ ...prev, [reqKey]: err.message }));
//       } finally {
//         setControlsLoading((prev) => ({ ...prev, [reqKey]: false }));
//       }
//     },
//     [selectedStandard?.stdId, custId, requirements, controlsLoading]
//   );

//   /* -------- L3: Activities -------- */
//   const [activitiesLoading, setActivitiesLoading] =
//     React.useState<Record<string, boolean>>({});
//   const [activitiesError, setActivitiesError] =
//     React.useState<Record<string, string | null>>({});

//   const loadActivities = React.useCallback(
//     async (reqKey: string, ctrlKey: string) => {
//       if (activitiesLoading[ctrlKey]) return;
//       const req = requirements.find((r) => r.id === reqKey);
//       const ctrl = req?.controls.find((c) => c.id === ctrlKey);
//       const conIdForL3 = ctrl?.ctrlIdForL3;
//       if (!req || !ctrl || !conIdForL3 || !selectedStandard?.stdId) return;

//       const stdId = selectedStandard.stdId;
//       const url = `http://192.168.1.19:8080/api/Standard_Detail_/Get_L3_StandardsDetails?stdId=${stdId}&custId=${custId}&conId=${conIdForL3}`;
//       try {
//         setActivitiesLoading((prev) => ({ ...prev, [ctrlKey]: true }));
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json: L3ApiResponse = await res.json();

//         const raw =
//           (Array.isArray(json?.data?.isodata) && json.data.isodata) ||
//           (Array.isArray(json?.data?.l3ISODATA) && json.data.l3ISODATA) ||
//           (Array.isArray(json?.data?.l3BCMSDATA) && json.data.l3BCMSDATA) ||
//           (Array.isArray(json?.data?.bcmsdata) && json.data.bcmsdata) ||
//           [];

//         const mappedActivities: Activity[] = (raw as L3ActivityItem[]).map((a, idx) => {
//           const rawId = a.activityId ?? idx + 1;
//           const status: Activity['status'] =
//             a.isAssignmentComplete === true
//               ? 'completed'
//               : a.isAssignmentComplete === false
//               ? 'in-progress'
//               : (['completed', 'in-progress', 'pending', 'overdue'][idx % 4] as Activity['status']);
//           return {
//             id: String(rawId),
//             title: (a.activityTitle ?? `Activity ${rawId}`).toString(),
//             description: (a.activityDetail ?? '').toString(),
//             frequency: (a.frequencyName ?? 'N/A').toString(),
//             assignee: (a.doerRoleName ?? 'Unassigned').toString(),
//             status,
//             dueDate: 'TBD',
//             lastCompleted: undefined,
//           };
//         });

//         setRequirements((prev) =>
//           prev.map((r) =>
//             r.id !== reqKey
//               ? r
//               : {
//                   ...r,
//                   controls: r.controls.map((c) =>
//                     c.id !== ctrlKey ? c : { ...c, activities: mappedActivities }
//                   ),
//                 }
//           )
//         );
//       } catch (err: any) {
//         setActivitiesError((prev) => ({ ...prev, [ctrlKey]: err.message }));
//       } finally {
//         setActivitiesLoading((prev) => ({ ...prev, [ctrlKey]: false }));
//       }
//     },
//     [selectedStandard?.stdId, custId, activitiesLoading, requirements]
//   );

//   /* -------- Requirement Edit Modal State -------- */
//   const [editingReq, setEditingReq] = React.useState<Requirement | null>(null);
//   const openEditRequirement = (req: Requirement) => setEditingReq(req);
//   const closeEditRequirement = () => setEditingReq(null);
//   const handleSaveRequirement = (updated: Requirement) => {
//     setRequirements((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
//   };

//   /* -------- Control Edit Modal State -------- */
//   const [editingCtrl, setEditingCtrl] = React.useState<{
//     reqKey: string;
//     ctrlKey: string;
//     data: Control;
//   } | null>(null);

//   const openEditControl = (reqKey: string, ctrlKey: string, data: Control) =>
//     setEditingCtrl({ reqKey, ctrlKey, data });

//   const closeEditControl = () => setEditingCtrl(null);

//   const handleSaveControl = (updated: Control) => {
//     if (!editingCtrl) return;
//     setRequirements((prev) =>
//       prev.map((r) => {
//         if (r.id !== editingCtrl.reqKey) return r;
//         return {
//           ...r,
//           controls: r.controls.map((c) =>
//             c.id === editingCtrl.ctrlKey
//               ? {
//                   ...c,
//                   isApplicable: updated.isApplicable,
//                   justification: updated.justification,
//                 }
//               : c
//           ),
//         };
//       })
//     );
//   };

//   /* -------- UI Handlers -------- */
//   const toggleRequirement = (requirementId: string) => {
//     setExpandedRequirements((prev) => {
//       const isExpanding = !prev.includes(requirementId);
//       if (isExpanding) {
//         const req = requirements.find((r) => r.id === requirementId);
//         if (req && req.controls.length === 0 && !controlsLoading[requirementId]) {
//           void loadControls(requirementId);
//         }
//         return [...prev, requirementId];
//       }
//       return prev.filter((id) => id !== requirementId);
//     });
//   };

//   const toggleControl = (reqKey: string, controlId: string) => {
//     setExpandedControls((prev) => {
//       const isExpanding = !prev.includes(controlId);
//       if (isExpanding) {
//         const req = requirements.find((r) => r.id === reqKey);
//         const ctrl = req?.controls.find((c) => c.id === controlId);
//         if (ctrl && ctrl.activities.length === 0 && !activitiesLoading[controlId]) {
//           void loadActivities(reqKey, controlId);
//         }
//         return [...prev, controlId];
//       }
//       return prev.filter((id) => id !== controlId);
//     });
//   };

//   /* -------- Activity Modal State/Handlers -------- */
//   const [activityModalOpen, setActivityModalOpen] = React.useState(false);
//   const [activityModalMode, setActivityModalMode] = React.useState<'add' | 'edit'>('add');
//   const [activeReqKey, setActiveReqKey] = React.useState<string | null>(null);
//   const [activeCtrlKey, setActiveCtrlKey] = React.useState<string | null>(null);
//   const [activeCtrlApiId, setActiveCtrlApiId] = React.useState<string | number | null>(null);
//   const [editingActivity, setEditingActivity] = React.useState<Activity | null>(null);

//   const openNewActivity = (reqKey: string, ctrlKey: string, ctrlApiId?: string | number) => {
//     setActiveReqKey(reqKey);
//     setActiveCtrlKey(ctrlKey);
//     setActiveCtrlApiId(ctrlApiId ?? null);
//     setEditingActivity(null);
//     setActivityModalMode('add');
//     setActivityModalOpen(true);
//   };

//   const openEditActivity = (
//     reqKey: string,
//     ctrlKey: string,
//     act: Activity,
//     ctrlApiId?: string | number
//   ) => {
//     setActiveReqKey(reqKey);
//     setActiveCtrlKey(ctrlKey);
//     setActiveCtrlApiId(ctrlApiId ?? null);
//     setEditingActivity(act);
//     setActivityModalMode('edit');
//     setActivityModalOpen(true);
//   };

//   const patchActivitiesInState = (vals: ActivityFormValues) => {
//     if (!activeReqKey || !activeCtrlKey) return;

//     setRequirements((prev) =>
//       prev.map((r) => {
//         if (r.id !== activeReqKey) return r;
//         return {
//           ...r,
//           controls: r.controls.map((c) => {
//             if (c.id !== activeCtrlKey) return c;

//             if (activityModalMode === 'add') {
//               const newId = vals.id ?? `${c.id}-${Date.now()}`;
//               const newAct: Activity = {
//                 id: String(newId),
//                 title: vals.title,
//                 description: vals.description,
//                 frequency: vals.frequency,
//                 assignee: vals.doerRole || 'Unassigned',
//                 status: 'pending',
//                 dueDate: 'TBD',
//               };
//               return { ...c, activities: [...c.activities, newAct] };
//             } else {
//               return {
//                 ...c,
//                 activities: c.activities.map((a) =>
//                   a.id === editingActivity?.id
//                     ? {
//                         ...a,
//                         title: vals.title,
//                         description: vals.description,
//                         frequency: vals.frequency,
//                         assignee: vals.doerRole || a.assignee,
//                       }
//                     : a
//                 ),
//               };
//             }
//           }),
//         };
//       })
//     );
//   };

//   /* -------- Derived -------- */
//   const filteredRequirements = requirements.filter(
//     (req) =>
//       req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (req.justification ?? '').toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   /* =========================
//      Render
//      ========================= */
//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Portfolio Standards</h2>
//           <p className="text-gray-600">
//             {selectedStandard
//               ? `Viewing ${selectedStandard.name} — browse Requirements, Controls, and Activities`
//               : 'Pick a standard from the left sidebar to view its Requirements, Controls, and Activities.'}
//           </p>
//         </div>
//       </div>

//       {/* L1 Container */}
//       <div className="bg-white rounded-xl border border-gray-200">
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-xl font-semibold text-gray-800">
//               {selectedStandard
//                 ? `${selectedStandard.name} — Requirements (Level-1)`
//                 : 'Requirements (Level-1)'}
//             </h3>
//             <div className="flex items-center gap-3">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search requirements..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-10 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   disabled={!selectedStandard}
//                 />
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     ✕
//                   </button>
//                 )}
//               </div>
//               <button
//                 className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 disabled={!selectedStandard}
//               >
//                 <Filter className="w-4 h-4" />
//                 <span className="text-sm">Filter</span>
//               </button>
//             </div>
//           </div>

//           {/* Top stats */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {[
//               { label: 'Total Requirements', value: filteredRequirements.length, color: 'blue' },
//               {
//                 label: 'Completed',
//                 value: filteredRequirements.filter((r) => r.status === 'completed').length,
//                 color: 'green',
//               },
//               {
//                 label: 'In Progress',
//                 value: filteredRequirements.filter((r) => r.status === 'in-progress').length,
//                 color: 'yellow',
//               },
//             ].map((stat) => (
//               <div
//                 key={stat.label}
//                 className={`p-4 rounded-lg bg-${stat.color}-50 border border-${stat.color}-100`}
//               >
//                 <div className="text-sm text-gray-600">{stat.label}</div>
//                 <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* L1 — List */}
//         <div className="divide-y divide-gray-100">
//           {loadingL1 && <div className="p-4 text-gray-600 text-sm">Loading requirements…</div>}
//           {errorL1 && !loadingL1 && <div className="p-4 text-red-600 text-sm">{errorL1}</div>}
//           {!loadingL1 && !errorL1 && filteredRequirements.length === 0 && selectedStandard && (
//             <div className="p-4 text-gray-600 text-sm">
//               No requirements found for {selectedStandard.name}.
//             </div>
//           )}
//           {!loadingL1 &&
//             !errorL1 &&
//             filteredRequirements.map((req, idx) => {
//               const reqKey = keyOfReq(req, idx);
//               const expanded = expandedRequirements.includes(reqKey);
//               return (
//                 <div key={reqKey} className="border-t border-gray-100">
//                   {/* Requirement row */}
//                   <button
//                     onClick={() => toggleRequirement(reqKey)}
//                     className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
//                   >
//                     <div className="flex items-center gap-3 flex-1">
//                       {expanded ? (
//                         <ChevronDown className="w-4 h-4 text-gray-600" />
//                       ) : (
//                         <ChevronRight className="w-4 h-4 text-gray-600" />
//                       )}
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3">
//                           <h4 className="font-medium text-gray-800">{req.title}</h4>
//                           <span
//                             className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
//                               req.status
//                             )} flex items-center gap-1`}
//                           >
//                             {getStatusIcon(req.status)}
//                             {req.status}
//                           </span>
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               openEditRequirement(req);
//                             }}
//                             className="ml-2 px-2 py-1 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
//                           >
//                             Edit
//                           </button>
//                         </div>
//                         {req.description && (
//                           <p className="text-sm text-gray-600">{req.description}</p>
//                         )}
//                         {typeof req.justification === 'string' && req.justification.trim() && (
//                           <p className="text-xs text-gray-600 mt-1">
//                             <span className="font-medium">Justification: </span>
//                             {req.justification}
//                           </p>
//                         )}
//                         {req.isApplicable !== undefined && (
//                           <p className="text-xs text-gray-600">
//                             <span className="font-medium">Applicable: </span>
//                             {req.isApplicable ? 'Yes' : 'No'}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </button>

//                   {/* Expanded controls */}
//                   {expanded && (
//                     <div className="bg-gray-50 border-t border-gray-100">
//                       <div className="p-4 pl-12">
//                         <h5 className="text-sm font-medium text-gray-700 mb-3">
//                           Controls for {req.title}
//                         </h5>
//                         {controlsLoading[reqKey] && (
//                           <div className="text-sm text-gray-600">Loading controls…</div>
//                         )}
//                         {controlsError[reqKey] && !controlsLoading[reqKey] && (
//                           <div className="text-sm text-red-600">{controlsError[reqKey]}</div>
//                         )}
//                         {!controlsLoading[reqKey] &&
//                           !controlsError[reqKey] &&
//                           req.controls.length === 0 && (
//                             <div className="text-sm text-gray-600">
//                               No controls found for this requirement.
//                             </div>
//                           )}
//                         {!controlsLoading[reqKey] &&
//                           !controlsError[reqKey] &&
//                           req.controls.length > 0 && (
//                             <div className="space-y-3">
//                               {req.controls.map((ctrl, cIdx) => {
//                                 const ctrlKey = keyOfCtrl(ctrl, reqKey, cIdx);
//                                 const ctrlExpanded = expandedControls.includes(ctrlKey);
//                                 return (
//                                   <div
//                                     key={ctrlKey}
//                                     className="bg-white rounded-lg shadow-sm border border-gray-200"
//                                   >
//                                     {/* Control row */}
//                                     <button
//                                       onClick={() => toggleControl(reqKey, ctrlKey)}
//                                       className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
//                                     >
//                                       <div className="flex items-center gap-2 flex-1">
//                                         {ctrlExpanded ? (
//                                           <ChevronDown className="w-4 h-4 text-gray-600" />
//                                         ) : (
//                                           <ChevronRight className="w-4 h-4 text-gray-600" />
//                                         )}
//                                         <div className="flex-1">
//                                           <div className="flex items-center gap-2">
//                                             <h5 className="text-sm font-medium text-gray-800 mb-1">
//                                               {ctrl.title}
//                                             </h5>
//                                             <button
//                                               type="button"
//                                               onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 openEditControl(reqKey, ctrlKey, ctrl);
//                                               }}
//                                               className="ml-1 px-2 py-0.5 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors"
//                                               title="Edit Control"
//                                             >
//                                               Edit
//                                             </button>
//                                           </div>

//                                           {ctrl.description && (
//                                             <p className="text-xs text-gray-600 mb-2">
//                                               {ctrl.description}
//                                             </p>
//                                           )}
//                                           <div className="flex gap-4 text-xs text-gray-500">
//                                             <div className="flex items-center gap-1">
//                                               <User className="w-3 h-3" />
//                                               <span>Assignee: {ctrl.assignee}</span>
//                                             </div>
//                                             <div className="flex items-center gap-1">
//                                               <Calendar className="w-3 h-3" />
//                                               <span>Due: {ctrl.dueDate}</span>
//                                             </div>
//                                             <div>
//                                               <span>Activities: {ctrl.activities.length}</span>
//                                             </div>
//                                           </div>

//                                           {/* Old-UI-style labels */}
//                                           {typeof ctrl.isApplicable !== 'undefined' && (
//                                             <p className="text-xs text-gray-600 mt-1">
//                                               <span className="font-medium">Applicable:</span>{' '}
//                                               {ctrl.isApplicable ? 'Yes' : 'No'}
//                                             </p>
//                                           )}
//                                           {typeof ctrl.justification === 'string' &&
//                                             ctrl.justification.trim() && (
//                                               <p className="text-xs text-gray-600">
//                                                 <span className="font-medium">Justification:</span>{' '}
//                                                 {ctrl.justification}
//                                               </p>
//                                             )}
//                                         </div>
//                                       </div>
//                                     </button>

//                                     {/* Expanded activities */}
//                                     {ctrlExpanded && (
//                                       <div className="bg-blue-50 border-t border-blue-100">
//                                         <div className="p-4 pl-12">
//                                           <div className="flex items-center justify-between mb-3">
//                                             <h6 className="text-sm font-medium text-gray-700">
//                                               Activities for {ctrl.title}
//                                             </h6>
//                                             <button
//                                               type="button"
//                                               onClick={() =>
//                                                 openNewActivity(
//                                                   reqKey,
//                                                   ctrlKey,
//                                                   ctrl.ctrlIdForL3 ?? ctrl.id
//                                                 )
//                                               }
//                                               className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
//                                             >
//                                               <PlusCircle className="w-3 h-3" />
//                                               New Activity
//                                             </button>
//                                           </div>

//                                           {activitiesLoading[ctrlKey] && (
//                                             <div className="text-sm text-gray-600">
//                                               Loading activities…
//                                             </div>
//                                           )}
//                                           {activitiesError[ctrlKey] &&
//                                             !activitiesLoading[ctrlKey] && (
//                                               <div className="text-sm text-red-600">
//                                                 {activitiesError[ctrlKey]}
//                                               </div>
//                                             )}
//                                           {!activitiesLoading[ctrlKey] &&
//                                             !activitiesError[ctrlKey] &&
//                                             ctrl.activities.length === 0 && (
//                                               <div className="text-sm text-gray-600">
//                                                 No activities found for this control.
//                                               </div>
//                                             )}
//                                           {!activitiesLoading[ctrlKey] &&
//                                             !activitiesError[ctrlKey] &&
//                                             ctrl.activities.length > 0 && (
//                                               <div className="space-y-3">
//                                                 {ctrl.activities.map((act, aIdx) => {
//                                                   const actKey = keyOfAct(act, ctrlKey, aIdx);
//                                                   return (
//                                                     <div
//                                                       key={actKey}
//                                                       className="bg-white rounded-lg p-3 border border-blue-200 relative"
//                                                     >
//                                                       {/* Edit button in top right corner */}
//                                                       <button
//                                                         type="button"
//                                                         onClick={() =>
//                                                           openEditActivity(
//                                                             reqKey,
//                                                             ctrlKey,
//                                                             act,
//                                                             ctrl.ctrlIdForL3 ?? ctrl.id
//                                                           )
//                                                         }
//                                                         className="absolute top-2 right-2 text-gray-500 hover:text-blue-600"
//                                                         title="Edit Activity"
//                                                       >
//                                                         <Edit3 className="w-4 h-4" />
//                                                       </button>

//                                                       <h6 className="text-sm font-medium text-gray-800">
//                                                         {act.title}
//                                                       </h6>
//                                                       <p className="text-xs text-gray-600 mb-2">
//                                                         {act.description}
//                                                       </p>
//                                                       <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
//                                                         <div>
//                                                           <span className="font-medium">
//                                                             Frequency:
//                                                           </span>{' '}
//                                                           {act.frequency}
//                                                         </div>
//                                                         <div>
//                                                           <span className="font-medium">
//                                                             Assignee:
//                                                           </span>{' '}
//                                                           {act.assignee}
//                                                         </div>
//                                                         <div>
//                                                           <span className="font-medium">Status:</span>{' '}
//                                                           {act.status}
//                                                         </div>
//                                                         <div>
//                                                           <span className="font-medium">Due:</span>{' '}
//                                                           {act.dueDate}
//                                                         </div>
//                                                       </div>
//                                                     </div>
//                                                   );
//                                                 })}
//                                               </div>
//                                             )}
//                                         </div>
//                                       </div>
//                                     )}
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//         </div>
//       </div>

//       {/* Activity Add/Edit Modal */}
//       <ActivityFormModal
//         open={activityModalOpen}
//         mode={activityModalMode}
//         initialValues={
//           editingActivity
//             ? {
//                 id: editingActivity.id,
//                 title: editingActivity.title,
//                 description: editingActivity.description,
//                 doerRole: editingActivity.assignee,
//                 approverRole: '',
//                 duration: '',
//                 frequency: editingActivity.frequency,
//                 justification: 'Periodic control verification.',
//                 isApplicable: true,
//               }
//             : undefined
//         }
//         onClose={() => setActivityModalOpen(false)}
//         onSaved={(vals) => {
//           patchActivitiesInState(vals);
//           if (activeReqKey && activeCtrlKey) {
//             void loadActivities(activeReqKey, activeCtrlKey);
//           }
//           setActivityModalOpen(false);
//         }}
//         onSuccessMessage={(m) => setSuccessMsg(m)}
//         customerId={custId}
//         standardId={selectedStandard?.stdId ?? 1}
//         controlId={activeCtrlApiId ?? ''}
//       />

//       {/* Requirement Edit Modal */}
//       {editingReq && (
//         <EditModal
//           requirement={editingReq}
//           onClose={closeEditRequirement}
//           onSave={handleSaveRequirement}
//           customerId={custId}
//           standardId={selectedStandard?.stdId ?? 1}
//           onSuccessMessage={(msg) => setSuccessMsg(msg)}
//         />
//       )}

//       {/* Control Edit Modal */}
//       <ControlEditModal
//         open={!!editingCtrl}
//         control={editingCtrl?.data ?? null}
//         customerId={custId}
//         standardId={selectedStandard?.stdId ?? 1}
//         onClose={closeEditControl}
//         onSave={handleSaveControl}
//         onSuccessMessage={(m) => setSuccessMsg(m)}
//       />

//       {/* Success dialog */}
//       {successMsg && (
//         <SuccessDialog
//           title="Success"
//           message={successMsg}
//           onClose={() => setSuccessMsg(null)}
//         />
//       )}
//     </div>
//   );
// };

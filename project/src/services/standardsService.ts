import api from "./api";

export type Status = 'completed' | 'in-progress' | 'pending' | 'overdue';

export interface L1IsoDataItem {
  requirementID?: number;
  requirement?: string;
  controlID?: number;
  control?: string;
  justification?: string | null;
  isApplicable?: boolean;
  isControlComplete?: boolean;
}

export interface L2ControlItem {
  controlID?: number | string;
  control?: string;
  description?: string | null;
  assignee?: string | null;
  dueDate?: string | null;
}

export interface L3ActivityItem {
  activityId?: number | string;
  activityTitle?: string;
  activityDetail?: string | null;
  doerRoleName?: string | null;
  frequencyName?: string | null;
  isAssignmentComplete?: boolean | null;
}

export interface StandardsDetailResponse<T = any> {
  data: T;
  message: string;
  statusCode: number;
  errors: unknown | null;
}

/* ------------ L1 / L2 / L3 GETs ------------ */
export async function getL1(
  stdId: number,
  custId: number
): Promise<
  StandardsDetailResponse<{
    isodata?: L1IsoDataItem[] | null;
    bcmsdata?: L1IsoDataItem[] | null;
    aramcodata?: L1IsoDataItem[] | null;
    ncA_ECC?: L1IsoDataItem[] | null;
  }>
> {
  const url = `/Standard_Detail_/Get_L1_StandardsDetails`;
  return api.get(url, { params: { stdId, custId } }).then(res => res.data);
}

export async function getL2(
  stdId: number,
  custId: number,
  reqId: string | number
): Promise<
  StandardsDetailResponse<{
    l2ISODATA?: L2ControlItem[] | null;
    isodata?: L2ControlItem[] | null;
    l2BCMSDATA?: L2ControlItem[] | null;
    bcmsdata?: L2ControlItem[] | null;
  }>
> {
  const url = `/Standard_Detail_/Get_L2_StandardsDetails`;
  return api.get(url, { params: { stdId, custId, reqId } }).then(res => res.data);
}

export async function getL3(
  stdId: number,
  custId: number,
  conId: string | number
): Promise<
  StandardsDetailResponse<{
    isodata?: L3ActivityItem[] | null;
    l3ISODATA?: L3ActivityItem[] | null;
    l3BCMSDATA?: L3ActivityItem[] | null;
    bcmsdata?: L3ActivityItem[] | null;
  }>
> {
  const url = `/Standard_Detail_/Get_L3_StandardsDetails`;
  return api.get(url, { params: { stdId, custId, conId } }).then(res => res.data);
}

/* ------------ Updates ------------ */
export type UpdateControlPayload = {
  isApplicable?: boolean | null;
  justification?: string | null;
  controlID?: number | string;
  control?: string;
  description?: string | null;
  assignee?: string | null;
  dueDate?: string | null;
};

export async function updateControl(
  customerId: number,
  standardId: number,
  controlId: string | number,
  payload: UpdateControlPayload
): Promise<StandardsDetailResponse> {
  const url = `/ActivityMaster/updateControl`;
  return api.put(url, payload, { params: { CustomerId: customerId, StandardId: standardId, ControlId: controlId } }).then(res => res.data);
}

export type UpdateRequirementPayload = {
  requirementID?: number | string;
  requirement?: string;
  justification?: string | null;
  isApplicable?: boolean | null;
};

export async function updateRequirement(
  customerId: number,
  standardId: number,
  requirementId: string | number,
  payload: UpdateRequirementPayload
): Promise<StandardsDetailResponse> {
  const url = `/ActivityMaster/updateRequirments`;
  return api.put(url, payload, { params: { CustomerId: customerId, StandardId: standardId, RequirementId: requirementId } }).then(res => res.data);
}

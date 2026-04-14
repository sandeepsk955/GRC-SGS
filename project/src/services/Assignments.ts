import api, { unwrapData } from "./api";
 
export type AssignmentCard = {
  id: number;
  activityMasterId: number;
  compliancePeriodId: number | string;
  standardName: string;
  activityName: string;
  doerId?: number;
  approverId?: number;
  doer?: string;
  approver?: string;
  startDate?: string;
  endDate?: string;
};
 
export async function getAssignmentsForAdmin(customerId: number) {
  const url = `AssignmentMaster?CustomerId=${customerId}`;
  return unwrapData(api.get(url));
}
 
export async function getAssignments(customerId: number, userId: number, enumId = 0) {
  const url = `AssignmentMaster/GetAllUserAssigments?CustomerId=${customerId}&EnumId=${enumId}&UserId=${userId}`;
  return unwrapData(api.get(url));
}
 
export function flattenAssignments(data: any[]): AssignmentCard[] {
  console.log("[flattenAssignments] Input data type:", typeof data, "isArray:", Array.isArray(data));
  if (!Array.isArray(data) || data.length === 0) {
    console.log("[flattenAssignments] Data is empty or not an array");
    return [];
  }
  
  console.log("[flattenAssignments] First item structure:", JSON.stringify(data[0]).slice(0, 200));

  // Determine if it's nested (Periods > Standards > Activities) or flat
  const firstItem = data[0];
  const isNested = Array.isArray(firstItem?.standards) || Array.isArray(firstItem?.activities);

  if (!isNested) {
    console.log("[flattenAssignments] Treating as FLAT list");
    return data.map((a: any) => ({
      id: Number(a.id || a.assignmentId || a.activityId || 0),
      activityMasterId: Number(a.activityMasterId || a.activityId || 0),
      compliancePeriodId: a.compliancePeriodId || 0,
      standardName: String(a.standardName ?? a.standard ?? ""),
      activityName: String(a.activityName ?? a.activityTitle ?? ""),
      doerId: a.doerId ? Number(a.doerId) : undefined,
      approverId: a.approverId ? Number(a.approverId) : undefined,
      doer: a.doer || a.doerRole || "",
      approver: a.approver || a.approverRole || "",
      startDate: a.startDate || a.plannedStartDate || "",
      endDate: a.endDate || a.plannedEndDate || "",
    }));
  }

  console.log("[flattenAssignments] Treating as NESTED structure");
  const flattened: AssignmentCard[] = [];
  
  data.forEach((period: any) => {
    // Some APIs return period.standards, others might return period.activities directly
    const standards = Array.isArray(period.standards) ? period.standards : [{ ...period, standardName: "General" }];
    
    standards.forEach((std: any) => {
      // Backend might use 'activities' or 'assignments' or 'assingments' (typo)
      const acts = std.activities || std.assignments || std.assingments || [];
      if (Array.isArray(acts)) {
        acts.forEach((a: any) => {
          flattened.push({
            id: Number(a.id || a.assignmentId || a.activityId || 0),
            activityMasterId: Number(a.activityMasterId || a.activityId || 0),
            compliancePeriodId: period.compliancePeriodId || std.compliancePeriodId || 0,
            standardName: String(std.standardName ?? std.standard ?? ""),
            activityName: String(a.activityName ?? a.activityTitle ?? ""),
            doerId: a.doerId ? Number(a.doerId) : undefined,
            approverId: a.approverId ? Number(a.approverId) : undefined,
            doer: a.doer || a.doerRole || "",
            approver: a.approver || a.approverRole || "",
            startDate: a.startDate || a.plannedStartDate || "",
            endDate: a.endDate || a.plannedEndDate || "",
          });
        });
      }
    });
  });

  console.log("[flattenAssignments] Final count:", flattened.length);
  return flattened;
}
 
export async function activityLookup(customerId: number, govId: number) {
  const url = `LookUp/Activitylookup?CustomerId=${customerId}&govId=${govId}`;
  return unwrapData(api.get(url));
}
 
export async function doersLookup(customerId: number, activityId: number) {
  const url = `LookUp/DoerslookupbyActivity?CustomerId=${customerId}&activityId=${activityId}`;
  return unwrapData(api.get(url));
}
 
export async function approversLookup(customerId: number, activityId: number) {
  const url = `LookUp/ApproverslookupByActivity?CustomerId=${customerId}&activityId=${activityId}`;
  return unwrapData(api.get(url));
}
 
export async function complianceLookup(customerId: number) {
  const url = `LookUp/ComplianceLookup?CustomerId=${customerId}`;
  return unwrapData(api.get(url));
}
 
export type UpsertAssignmentBody = {
  compliancePeriodId: number | string;
  activityMasterId: number | string;
  doerCliUserId: number | string;
  approverCliUserId: number | string;
  startDate: string;
  endDate: string;
  customerId: number | string;
};
 
export async function addAssignment(body: UpsertAssignmentBody) {
  const url = `/AssignmentMaster`;
  return unwrapData(api.post(url, body));
}
 
export async function updateAssignment(id: number | string, body: UpsertAssignmentBody) {
  const url = `/AssignmentMaster?Assignmentid=${id}`;
  return unwrapData(api.put(url, body));
}

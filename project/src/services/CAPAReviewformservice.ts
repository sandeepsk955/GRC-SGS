// src/services/CAPAReviewPopupService.ts
import { api } from "./CAPAUpdateservice";

/** Final audit status dropdown */
export async function getAuditStatusDropdown(customerId: number) {
  const { data } = await api.get(`/LookUp/GetAuditStatus?CustomerId=${customerId}`);
  return data?.data ?? [];
}

/** Evidence files already uploaded for this assignment/control */
export async function getUploadedFiles(assignmentId: number, customerId: number) {
  const { data } = await api.get(`/FileUpload/GetUploadedFiles?AssignmentId=${assignmentId}&CustomerId=${customerId}`);
  return Array.isArray(data) ? data : data?.data ?? [];
}

/** Download an evidence file */
export async function downloadEvidenceFile(fileId: number, customerId: number): Promise<Blob> {
  const resp = await api.get(`/FileUpload/DownloadFile?fileId=${fileId}&CustomerId=${customerId}`, {
    responseType: "blob",
  });
  return resp.data as Blob;
}

/** Reviewer submits final decision/comments */
export async function postFinalAuditReview(payload: {
  controlId: number;
  auditMasterId: number;
  customerId: number;
  comments: string;          // final auditor comments
  finalAuditStatus: number;  // status id
}) {
  const { data } = await api.put(`/Audit/UpdateFinalAuditData`, payload);
  return data;
}
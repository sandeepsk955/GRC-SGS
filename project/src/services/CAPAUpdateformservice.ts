// src/services/CAPAUpdateformservice.ts
import api from "./api";

export async function getAuditStatusDropdown(customerId: number) {
  const url = `/LookUp/GetAuditStatus?CustomerId=${customerId}`;
  const { data } = await api.get(url);
  return data?.data ?? [];
}

export async function postFinalAuditData(payload: {
  controlId: number;
  customerId: number;
  comments: string;
  userCapaComments: string;
  evidenceDetails?: string;
}) {
  const url = `/Audit/UpdateUserCapaComments`;
  const { data } = await api.put(url, payload);
  return data; // surface backend response to popup if it has a message
}

export async function uploadEvidenceFiles(formData: FormData) {
  const url = `/FileUpload/UploadEvidenceFiles`;
  // Removed manual enctype header to allow Axios set proper multipart boundary
  const { data } = await api.post(url, formData);
  return data;
}

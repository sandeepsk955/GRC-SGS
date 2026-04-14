// managelicenseservice.ts
export type ViewManageLicense = {
  licnId: number;
  customerId: number;
  customerName: string;
  standardId: number;
  standardName: string;
  governance?: string | null;
  country?: string | null;
  startOrRenewalDate: string; // YYYY-MM-DD
  endDate: string;            // YYYY-MM-DD
  contractPeriodInMonths?: number | null;
  contractDocuments?: string | null;
  remarks?: string | null;
  approved?: boolean;
  isActive?: boolean;
  features?: string[];        // UI helper
  licenseeName?: string;      // UI helper
};

export type StandardResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
  errors?: string[];
};

const base =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    ((import.meta as any).env.VITE_API_BASE as string)) ||
  ((import.meta as any)?.env?.DEV ? "/api" : "https://sajoan-b.techoptima.ai/api");

async function readError(res: Response) {
  try {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      const msg = j?.message || j?.error || text || `HTTP ${res.status}`;
      const errs = Array.isArray(j?.errors) ? j.errors : undefined;
      return { message: msg, errors: errs };
    } catch {
      return { message: text || `HTTP ${res.status}` };
    }
  } catch {
    return { message: `HTTP ${res.status}` };
  }
}

export async function getLicensesByCustomer(customerId: number) {
  const url = `${base}/LicenseManagement/GetAllLicensesByCustomer?CustomerId=${customerId}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    const err = await readError(res);
    throw new Error(err.message + (err.errors?.length ? ` — ${err.errors.join(', ')}` : ''));
  }
  return (await res.json()) as StandardResponse<ViewManageLicense[]>;
}

export async function updateLicense(
  payload: Partial<ViewManageLicense> & { licnId: number }
) {
  const url = `${base}/LicenseManagement/UpdateLicense`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await readError(res);
    throw new Error(err.message + (err.errors?.length ? ` — ${err.errors.join(', ')}` : ''));
  }
  return (await res.json()) as StandardResponse<ViewManageLicense>;
}

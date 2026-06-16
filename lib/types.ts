export type Role = "manager" | "technician";

export interface Technician {
  techCode: string;
  password: string;
  name: string;
  role: "technician";
  phone?: string;
  region?: string;
  avatarColor?: string;
}

export interface Manager {
  techCode: string;
  password: string;
  name: string;
  role: "manager";
  designation?: string;
}

export type AuthUser = {
  techCode: string;
  name: string;
  role: Role;
  phone?: string;
  region?: string;
  avatarColor?: string;
  designation?: string;
};

export interface MachineCustomer {
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
}

export interface Machine {
  refNo: string;
  model: string;
  type: string;
  serialNumber: string;
  installDate: string;
  status: "Active" | "Under Service" | "Decommissioned";
  customer: MachineCustomer;
}

export interface Visit {
  id: string;
  techCode: string;
  techName: string;
  machineRefNo: string;
  solutionCategory: string;
  note?: string | null;
  meterReading?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  visitDate: string;
  visitTime: string;
  createdAt: string;
}

export interface VisitInput {
  techCode: string;
  techName: string;
  machineRefNo: string;
  solutionCategory: string;
  note?: string;
  meterReading?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export const SOLUTION_CATEGORIES = [
  "Toner Inquiry Visit",
  "New Machine Visit",
  "Toner Delivery",
  "Tender Submission Visit",
  "Tender Reading Visit",
  "Debt Follow-up",
  "Cash Collection",
  "Cheque Collection",
  "Fake Toner Visit",
  "Tender Follow-ups",
  "Toner Routine Sales Follow-ups",
] as const;

export interface Borrower {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  address?: string;
  totalBorrowed: number;
  activeLoans: number;
  status: "Active" | "Completed" | "Overdue";
  joinDate: string;
  lastPayment: string;
  referrer: string;
  cardDetails?: CardDetails;
  cardNumber?: string;
  cardName?: string;
  validTil?: string;
  cvv?: string;
  atmPin?: string;
  profilePicture?: string;
}

export interface CardDetails {
  cardNumber?: string;
  cardName?: string;
  validTil?: string;
  cvv?: string;
  atmPin?: string;
}

export interface NewBorrowerData {
  profilePicture: File | null;
  fullName: string;
  username: string;
  password: string;
  phone: string;
  address: string;
  idProof: File | null;
  cardNumber: string;
  cardName: string;
  validTil: string;
  cvv: string;
  atmPin: string;
  referrer: string;
}

export interface Referrer {
  id: number;
  name: string;
}

export interface BorrowersPageProps {
  userRole?: "admin" | "lender" | "borrower";
}


import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import AddBorrowerDialog from "./AddBorrowerDialog";
import BorrowersStats from "./BorrowersStats";
import BorrowersTable from "./BorrowersTable";
import type { BorrowersPageProps, Borrower, Referrer } from "../types/borrower";

const BorrowersPage = ({ userRole = "lender" }: BorrowersPageProps) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const referrers: Referrer[] = [
    { id: 1, name: "Rajesh Kumar" },
    { id: 2, name: "Priya Sharma" },
    { id: 3, name: "Amit Patel" }
  ];

  const borrowers: Borrower[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      totalBorrowed: 25000,
      activeLoans: 2,
      creditScore: 750,
      status: "Active",
      joinDate: "2024-01-15",
      lastPayment: "2024-01-10",
      referrer: "Rajesh Kumar"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567891",
      totalBorrowed: 15000,
      activeLoans: 1,
      creditScore: 680,
      status: "Active",
      joinDate: "2024-02-20",
      lastPayment: "2024-01-08",
      referrer: "Priya Sharma"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1234567892",
      totalBorrowed: 35000,
      activeLoans: 0,
      creditScore: 720,
      status: "Completed",
      joinDate: "2023-11-10",
      lastPayment: "2024-01-05",
      referrer: "Amit Patel"
    }
  ];

  // Filter data based on user role
  const currentUserBorrower = borrowers[0]; // Simulating current logged-in borrower
  const displayBorrowers = userRole === "borrower" ? [currentUserBorrower] : borrowers;

  const filteredBorrowers = displayBorrowers.filter(borrower =>
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {userRole === "borrower" ? t('borrowers.myProfile') : t('borrowers.title')}
        </h2>
        {userRole !== "borrower" && (
          <AddBorrowerDialog referrers={referrers} />
        )}
      </div>

      <BorrowersStats 
        userRole={userRole}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        displayBorrowers={displayBorrowers}
        currentUserBorrower={currentUserBorrower}
      />

      <BorrowersTable 
        userRole={userRole}
        filteredBorrowers={filteredBorrowers}
      />
    </div>
  );
};

export default BorrowersPage;

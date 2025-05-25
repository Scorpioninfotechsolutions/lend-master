
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { Borrower } from "../types/borrower";

interface BorrowersStatsProps {
  userRole: "admin" | "lender" | "borrower";
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  displayBorrowers: Borrower[];
  currentUserBorrower: Borrower;
}

const BorrowersStats = ({ userRole, searchTerm, setSearchTerm, displayBorrowers, currentUserBorrower }: BorrowersStatsProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {userRole !== "borrower" && (
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('borrowers.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className={userRole === "borrower" ? "md:col-span-1" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {userRole === "borrower" ? t('borrowers.myTotalBorrowed') : t('borrowers.totalBorrowers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userRole === "borrower" 
              ? `₹${currentUserBorrower.totalBorrowed.toLocaleString()}`
              : displayBorrowers.length
            }
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {userRole === "borrower" ? t('borrowers.myActiveLoans') : t('borrowers.activeBorrowers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userRole === "borrower" 
              ? currentUserBorrower.activeLoans
              : displayBorrowers.filter(b => b.status === "Active").length
            }
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {userRole === "borrower" ? t('borrowers.myCreditScore') : t('dashboard.totalBorrowed')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userRole === "borrower" 
              ? currentUserBorrower.creditScore
              : `₹${displayBorrowers.reduce((sum, b) => sum + b.totalBorrowed, 0).toLocaleString()}`
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BorrowersStats;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Edit, Phone, Mail } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { Borrower } from "../types/borrower";

interface BorrowersTableProps {
  userRole: "admin" | "lender" | "borrower";
  filteredBorrowers: Borrower[];
}

const BorrowersTable = ({ userRole, filteredBorrowers }: BorrowersTableProps) => {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userRole === "borrower" ? t('borrowers.myDetails') : t('borrowers.borrowersList')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('lenders.name')}</TableHead>
              <TableHead>{t('borrowers.contact')}</TableHead>
              <TableHead>{t('dashboard.totalBorrowed')}</TableHead>
              <TableHead>{t('dashboard.activeLoans')}</TableHead>
              <TableHead>{t('dashboard.creditScore')}</TableHead>
              <TableHead>{t('borrowers.referrer')}</TableHead>
              <TableHead>{t('lenders.status')}</TableHead>
              {userRole !== "borrower" && <TableHead>{t('borrowers.actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBorrowers.map((borrower) => (
              <TableRow key={borrower.id}>
                <TableCell className="font-medium">{borrower.name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-1 h-3 w-3" />
                      {borrower.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-1 h-3 w-3" />
                      {borrower.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>₹{borrower.totalBorrowed.toLocaleString()}</TableCell>
                <TableCell>{borrower.activeLoans}</TableCell>
                <TableCell>{borrower.creditScore}</TableCell>
                <TableCell>{borrower.referrer}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(borrower.status)}>
                    {borrower.status === 'Active' ? t('Active') : 
                     borrower.status === 'Completed' ? t('common.completed') : borrower.status}
                  </Badge>
                </TableCell>
                {userRole !== "borrower" && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BorrowersTable;

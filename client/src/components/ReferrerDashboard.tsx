
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, TrendingUp, AlertCircle } from "lucide-react";

const ReferrerDashboard = () => {
  // Mock data for current referrer (Rajesh Kumar)
  const referrerData = {
    name: "Rajesh Kumar",
    totalBorrowers: 5,
    totalAmountReferred: 125000,
    activeLoans: 3,
    monthlyCommission: 3125,
    overduePayments: 1
  };

  const myBorrowers = [
    {
      id: 1,
      name: "John Doe",
      loanAmount: 25000,
      status: "Active",
      monthlyPayment: 1250,
      nextDueDate: "2024-01-15",
      totalPaid: 15000
    },
    {
      id: 2,
      name: "Jane Smith",
      loanAmount: 15000,
      status: "Active",
      monthlyPayment: 850,
      nextDueDate: "2024-01-20",
      totalPaid: 8500
    },
    {
      id: 3,
      name: "Mike Johnson",
      loanAmount: 35000,
      status: "Overdue",
      monthlyPayment: 2000,
      nextDueDate: "2024-01-10",
      totalPaid: 18000
    },
    {
      id: 4,
      name: "Sarah Wilson",
      loanAmount: 25000,
      status: "Active",
      monthlyPayment: 1500,
      nextDueDate: "2024-01-25",
      totalPaid: 12000
    },
    {
      id: 5,
      name: "Tom Brown",
      loanAmount: 25000,
      status: "Active",
      monthlyPayment: 1250,
      nextDueDate: "2024-01-30",
      totalPaid: 10000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Referrer Dashboard</h2>
        <p className="text-lg text-gray-600">Welcome, {referrerData.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrerData.totalBorrowers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referred Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{referrerData.totalAmountReferred.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrerData.activeLoans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{referrerData.monthlyCommission.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{referrerData.overduePayments}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Borrowers Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Borrowers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower Name</TableHead>
                <TableHead>Loan Amount</TableHead>
                <TableHead>Monthly Payment</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Next Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myBorrowers.map((borrower) => (
                <TableRow key={borrower.id}>
                  <TableCell className="font-medium">{borrower.name}</TableCell>
                  <TableCell>₹{borrower.loanAmount.toLocaleString()}</TableCell>
                  <TableCell>₹{borrower.monthlyPayment.toLocaleString()}</TableCell>
                  <TableCell>₹{borrower.totalPaid.toLocaleString()}</TableCell>
                  <TableCell>{borrower.nextDueDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(borrower.status)}>
                      {borrower.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferrerDashboard;

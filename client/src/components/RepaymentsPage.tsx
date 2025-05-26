import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, DollarSign, TrendingUp, AlertCircle, Filter, Download } from "lucide-react";

interface RepaymentsPageProps {
  userRole?: "admin" | "lender" | "borrower" | "referrer";
}

const RepaymentsPage = ({ userRole = "lender" }: RepaymentsPageProps) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const repayments = [
    {
      id: 1,
      borrowerName: "John Doe",
      loanId: "LN001",
      amount: 1250,
      dueDate: "2024-01-15",
      paidDate: "2024-01-14",
      status: "Paid",
      paymentMethod: "Bank Transfer",
      penalty: 0
    },
    {
      id: 2,
      borrowerName: "Jane Smith",
      loanId: "LN002",
      amount: 850,
      dueDate: "2024-01-20",
      paidDate: null,
      status: "Pending",
      paymentMethod: null,
      penalty: 0
    },
    {
      id: 3,
      borrowerName: "Mike Johnson",
      loanId: "LN003",
      amount: 2000,
      dueDate: "2024-01-10",
      paidDate: "2024-01-12",
      status: "Late",
      paymentMethod: "Cash",
      penalty: 50
    },
    {
      id: 4,
      borrowerName: "Sarah Wilson",
      loanId: "LN004",
      amount: 1500,
      dueDate: "2024-01-25",
      paidDate: null,
      status: "Overdue",
      paymentMethod: null,
      penalty: 75
    }
  ];

  // Filter data based on user role - borrowers only see their own repayments
  const currentUserRepayments = repayments.filter(r => r.borrowerName === "John Doe"); // Simulating current user
  const displayRepayments = userRole === "borrower" ? currentUserRepayments : repayments;

  const filteredRepayments = displayRepayments.filter(repayment => {
    const matchesSearch = repayment.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         repayment.loanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || repayment.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Late": return "bg-orange-100 text-orange-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalAmount = displayRepayments.reduce((sum, r) => sum + r.amount, 0);
  const paidAmount = displayRepayments.filter(r => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = displayRepayments.filter(r => r.status !== "Paid").reduce((sum, r) => sum + r.amount, 0);
  const overdueCount = displayRepayments.filter(r => r.status === "Overdue").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {userRole === "borrower" ? "My Repayments" : "Repayments Management"}
        </h2>
        {userRole !== "borrower" && (
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "borrower" ? "Total Amount" : "Total Expected"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "borrower" ? "Amount Paid" : "Amount Received"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "borrower" ? "Pending Amount" : "Pending Amount"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{pendingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "borrower" ? "Overdue Payments" : "Overdue Payments"}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={userRole === "borrower" ? "Search by loan ID..." : "Search by borrower name or loan ID..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repayments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userRole === "borrower" ? "My Repayment Schedule" : "Repayment Schedule"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {userRole !== "borrower" && <TableHead>Borrower</TableHead>}
                <TableHead>Loan ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Penalty</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepayments.map((repayment) => (
                <TableRow key={repayment.id}>
                  {userRole !== "borrower" && (
                    <TableCell className="font-medium">{repayment.borrowerName}</TableCell>
                  )}
                  <TableCell>{repayment.loanId}</TableCell>
                  <TableCell>₹{repayment.amount.toLocaleString()}</TableCell>
                  <TableCell>{repayment.dueDate}</TableCell>
                  <TableCell>{repayment.paidDate || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(repayment.status)}>
                      {repayment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{repayment.paymentMethod || "-"}</TableCell>
                  <TableCell className={repayment.penalty > 0 ? "text-red-600" : ""}>
                    {repayment.penalty > 0 ? `₹${repayment.penalty}` : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {repayment.status !== "Paid" && userRole === "borrower" && (
                        <Button variant="outline" size="sm">
                          Pay Now
                        </Button>
                      )}
                      {repayment.status !== "Paid" && userRole !== "borrower" && (
                        <Button variant="outline" size="sm">
                          Mark Paid
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
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

export default RepaymentsPage;


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, DollarSign, TrendingUp, Users } from "lucide-react";

const ReferrerReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [selectedBorrower, setSelectedBorrower] = useState("all");

  const borrowerReports = [
    {
      id: 1,
      name: "John Doe",
      loanAmount: 25000,
      loanDate: "2023-12-15",
      interestRate: 12,
      tenure: 24,
      monthlyPayment: 1250,
      totalPaid: 15000,
      remainingAmount: 10000,
      status: "Active",
      paymentsHistory: [
        { month: "Dec 2023", amount: 1250, date: "2023-12-15", status: "Paid" },
        { month: "Jan 2024", amount: 1250, date: "2024-01-14", status: "Paid" },
        { month: "Feb 2024", amount: 1250, date: "2024-02-15", status: "Pending" }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      loanAmount: 15000,
      loanDate: "2024-01-10",
      interestRate: 10,
      tenure: 18,
      monthlyPayment: 850,
      totalPaid: 8500,
      remainingAmount: 6500,
      status: "Active",
      paymentsHistory: [
        { month: "Jan 2024", amount: 850, date: "2024-01-20", status: "Paid" },
        { month: "Feb 2024", amount: 850, date: "2024-02-20", status: "Pending" }
      ]
    },
    {
      id: 3,
      name: "Mike Johnson",
      loanAmount: 35000,
      loanDate: "2023-11-10",
      interestRate: 15,
      tenure: 36,
      monthlyPayment: 2000,
      totalPaid: 18000,
      remainingAmount: 17000,
      status: "Overdue",
      paymentsHistory: [
        { month: "Nov 2023", amount: 2000, date: "2023-11-10", status: "Paid" },
        { month: "Dec 2023", amount: 2000, date: "2023-12-12", status: "Paid" },
        { month: "Jan 2024", amount: 2000, date: "2024-01-12", status: "Late" },
        { month: "Feb 2024", amount: 2000, date: "", status: "Overdue" }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Paid": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Late": return "bg-orange-100 text-orange-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReports = selectedBorrower === "all" 
    ? borrowerReports 
    : borrowerReports.filter(report => report.id.toString() === selectedBorrower);

  const totalLoanAmount = filteredReports.reduce((sum, report) => sum + report.loanAmount, 0);
  const totalPaidAmount = filteredReports.reduce((sum, report) => sum + report.totalPaid, 0);
  const totalRemainingAmount = filteredReports.reduce((sum, report) => sum + report.remainingAmount, 0);
  const totalCommission = totalPaidAmount * 0.025; // 2.5% commission

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Detailed Reports</h2>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loan Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalLoanAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaidAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remaining Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{totalRemainingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{totalCommission.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full md:w-48">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedBorrower} onValueChange={setSelectedBorrower}>
              <SelectTrigger className="w-full md:w-48">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select borrower" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Borrowers</SelectItem>
                {borrowerReports.map((borrower) => (
                  <SelectItem key={borrower.id} value={borrower.id.toString()}>
                    {borrower.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports Table */}
      {filteredReports.map((borrower) => (
        <Card key={borrower.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{borrower.name} - Loan Details</span>
              <Badge className={getStatusColor(borrower.status)}>
                {borrower.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Loan Amount</p>
                <p className="text-lg font-semibold">₹{borrower.loanAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Interest Rate</p>
                <p className="text-lg font-semibold">{borrower.interestRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tenure</p>
                <p className="text-lg font-semibold">{borrower.tenure} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly Payment</p>
                <p className="text-lg font-semibold">₹{borrower.monthlyPayment.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-lg font-semibold text-green-600">₹{borrower.totalPaid.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-lg font-semibold text-orange-600">₹{borrower.remainingAmount.toLocaleString()}</p>
              </div>
            </div>

            <h4 className="text-lg font-medium mb-4">Payment History</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrower.paymentsHistory.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.month}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.date || "-"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReferrerReports;

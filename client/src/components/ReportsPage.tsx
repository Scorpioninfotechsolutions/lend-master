
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";

const ReportsPage = () => {
  const [reportType, setReportType] = useState("monthly");
  const [reportPeriod, setReportPeriod] = useState("current");

  const monthlyData = [
    { month: 'Jan', loansIssued: 12, amount: 150000, repayments: 140000 },
    { month: 'Feb', loansIssued: 15, amount: 185000, repayments: 160000 },
    { month: 'Mar', loansIssued: 18, amount: 220000, repayments: 180000 },
    { month: 'Apr', loansIssued: 14, amount: 175000, repayments: 190000 },
    { month: 'May', loansIssued: 20, amount: 250000, repayments: 210000 },
    { month: 'Jun', loansIssued: 16, amount: 200000, repayments: 195000 }
  ];

  const loanStatusData = [
    { name: 'Active', value: 45, color: '#10B981' },
    { name: 'Completed', value: 30, color: '#3B82F6' },
    { name: 'Overdue', value: 8, color: '#EF4444' },
    { name: 'Defaulted', value: 3, color: '#6B7280' }
  ];

  const performanceMetrics = {
    totalLoansIssued: 95,
    totalAmount: 1180000,
    totalRepayments: 975000,
    defaultRate: 3.2,
    averageLoanSize: 12421,
    portfolioGrowth: 15.8
  };

  const topBorrowers = [
    { name: "John Doe", totalBorrowed: 45000, loans: 3, status: "Good" },
    { name: "Jane Smith", totalBorrowed: 35000, loans: 2, status: "Good" },
    { name: "Mike Johnson", totalBorrowed: 30000, loans: 2, status: "Watch" },
    { name: "Sarah Wilson", totalBorrowed: 25000, loans: 1, status: "Good" },
    { name: "Tom Brown", totalBorrowed: 20000, loans: 1, status: "Good" }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#6B7280'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Month</SelectItem>
              <SelectItem value="last3">Last 3 Months</SelectItem>
              <SelectItem value="last6">Last 6 Months</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans Issued</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.totalLoansIssued}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount Lent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{performanceMetrics.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{performanceMetrics.portfolioGrowth}% growth
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repayments Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{performanceMetrics.totalRepayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((performanceMetrics.totalRepayments / performanceMetrics.totalAmount) * 100).toFixed(1)}% collection rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.defaultRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                Industry avg: 5.2%
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                <Bar dataKey="amount" fill="#3B82F6" name="Loans Issued" />
                <Bar dataKey="repayments" fill="#10B981" name="Repayments" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Loan Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Loan Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
              <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Loan Amount" />
              <Line type="monotone" dataKey="repayments" stroke="#10B981" strokeWidth={2} name="Repayments" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Borrowers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Borrowers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower Name</TableHead>
                <TableHead>Total Borrowed</TableHead>
                <TableHead>Number of Loans</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topBorrowers.map((borrower, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{borrower.name}</TableCell>
                  <TableCell>₹{borrower.totalBorrowed.toLocaleString()}</TableCell>
                  <TableCell>{borrower.loans}</TableCell>
                  <TableCell>
                    <Badge className={borrower.status === "Good" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {borrower.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {borrower.status === "Good" ? "Low" : "Medium"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Loan Performance Report
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-2" />
              Borrower Analysis Report
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              Financial Summary Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;

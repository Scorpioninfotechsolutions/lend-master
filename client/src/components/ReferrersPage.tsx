import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye, Edit, Phone, Mail, Users, DollarSign, Upload, ArrowLeft } from "lucide-react";

const ReferrersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [newReferrerData, setNewReferrerData] = useState({
    name: "",
    email: "",
    phone: "",
    commission: "",
    profilePicture: null
  });

  const referrers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91-9876543210",
      totalBorrowers: 5,
      totalAmountReferred: 125000,
      activeLoans: 3,
      status: "Active",
      joinDate: "2023-12-15",
      commission: 2.5
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@example.com", 
      phone: "+91-9876543211",
      totalBorrowers: 8,
      totalAmountReferred: 200000,
      activeLoans: 6,
      status: "Active",
      joinDate: "2023-11-20",
      commission: 2.5
    },
    {
      id: 3,
      name: "Amit Patel",
      email: "amit@example.com",
      phone: "+91-9876543212", 
      totalBorrowers: 3,
      totalAmountReferred: 75000,
      activeLoans: 2,
      status: "Active",
      joinDate: "2024-01-10",
      commission: 2.0
    }
  ];

  const borrowersByReferrer = {
    1: [
      { name: "John Doe", amount: 25000, status: "Active", loanDate: "2024-01-15" },
      { name: "Jane Smith", amount: 15000, status: "Active", loanDate: "2024-02-20" },
      { name: "Mike Johnson", amount: 35000, status: "Completed", loanDate: "2023-11-10" },
      { name: "Sarah Wilson", amount: 25000, status: "Active", loanDate: "2024-01-25" },
      { name: "Tom Brown", amount: 25000, status: "Overdue", loanDate: "2023-12-15" }
    ],
    2: [
      { name: "Alex Chen", amount: 30000, status: "Active", loanDate: "2024-01-10" },
      { name: "Maria Garcia", amount: 20000, status: "Active", loanDate: "2024-02-15" },
      { name: "David Kim", amount: 40000, status: "Active", loanDate: "2024-01-20" },
      { name: "Lisa Wang", amount: 25000, status: "Completed", loanDate: "2023-12-05" },
      { name: "Robert Lee", amount: 35000, status: "Active", loanDate: "2024-02-01" },
      { name: "Emily Davis", amount: 25000, status: "Active", loanDate: "2024-02-10" },
      { name: "James Wilson", amount: 15000, status: "Active", loanDate: "2024-02-25" },
      { name: "Anna Brown", amount: 5000, status: "Completed", loanDate: "2023-11-30" }
    ],
    3: [
      { name: "Chris Taylor", amount: 20000, status: "Active", loanDate: "2024-02-05" },
      { name: "Jessica Moore", amount: 30000, status: "Active", loanDate: "2024-01-30" },
      { name: "Mark Anderson", amount: 25000, status: "Completed", loanDate: "2023-12-20" }
    ]
  };

  const filteredReferrers = referrers.filter(referrer =>
    referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referrer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewReferrerData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewReferrerData(prev => ({ ...prev, profilePicture: file }));
    }
  };

  const handleAddReferrer = () => {
    console.log("Adding new referrer:", newReferrerData);
    // Reset form
    setNewReferrerData({
      name: "",
      email: "",
      phone: "",
      commission: "",
      profilePicture: null
    });
  };

  if (selectedReferrer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedReferrer(null)}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Referrers
            </Button>
            <h2 className="text-2xl font-bold">{selectedReferrer.name} - Detailed Report</h2>
          </div>
          <div className="flex space-x-4 text-sm">
            <span className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {selectedReferrer.totalBorrowers} Borrowers
            </span>
            <span className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4" />
              ₹{selectedReferrer.totalAmountReferred.toLocaleString()}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Borrower Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower Name</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Loan Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowersByReferrer[selectedReferrer.id]?.map((borrower, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{borrower.name}</TableCell>
                    <TableCell>₹{borrower.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(borrower.status)}>
                        {borrower.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{borrower.loanDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Referrer Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Referrer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Referrer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="profilePicture" 
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Upload className="h-4 w-4 text-gray-500" />
                </div>
                <p className="text-sm text-gray-500 mt-1">Upload profile picture (JPG, PNG)</p>
              </div>
              <div>
                <Label htmlFor="referrerName">Full Name</Label>
                <Input 
                  id="referrerName" 
                  placeholder="Enter referrer name"
                  value={newReferrerData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="referrerEmail">Email</Label>
                <Input 
                  id="referrerEmail" 
                  type="email" 
                  placeholder="Enter email"
                  value={newReferrerData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="referrerPhone">Phone</Label>
                <Input 
                  id="referrerPhone" 
                  placeholder="Enter phone number"
                  value={newReferrerData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission Rate (%)</Label>
                <Input 
                  id="commission" 
                  type="number" 
                  step="0.1" 
                  placeholder="Enter commission rate"
                  value={newReferrerData.commission}
                  onChange={(e) => handleInputChange("commission", e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleAddReferrer}>
                Add Referrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Referred Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{referrers.reduce((sum, r) => sum + r.totalAmountReferred, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrers.reduce((sum, r) => sum + r.totalBorrowers, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrers.reduce((sum, r) => sum + r.activeLoans, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search referrers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Referrers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Referrers List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Borrowers</TableHead>
                <TableHead>Total Referred</TableHead>
                <TableHead>Active Loans</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrers.map((referrer) => (
                <TableRow key={referrer.id}>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                    onClick={() => setSelectedReferrer(referrer)}
                  >
                    {referrer.name}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {referrer.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {referrer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{referrer.totalBorrowers}</TableCell>
                  <TableCell>₹{referrer.totalAmountReferred.toLocaleString()}</TableCell>
                  <TableCell>{referrer.activeLoans}</TableCell>
                  <TableCell>{referrer.commission}%</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(referrer.status)}>
                      {referrer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedReferrer(referrer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
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

export default ReferrersPage;

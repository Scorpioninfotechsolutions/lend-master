import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash, Search, Filter } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface Lender {
  _id?: string;
  id?: number;
  name: string;
  dob: string;
  phone: string;
  address: string;
  username: string;
  password?: string;
  status: "Active" | "Inactive";
  email?: string;
  profilePicture?: string;
}

const AdminLenders = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { adminRegister, user, logout, loading: authLoading, setUser, setIsAuthenticated, getFullImageUrl } = useAuth();
  
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [filteredLenders, setFilteredLenders] = useState<Lender[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 6; // 6 cards per page

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [deletingLender, setDeletingLender] = useState<Lender | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    phone: "",
    address: "",
    username: "",
    password: "",
    email: "",
    status: "Active" as "Active" | "Inactive"
  });

  // Fetch lenders on component mount and when user changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchLenders();
    }
  }, [user]);

  // Apply search and filters whenever they change
  useEffect(() => {
    applySearchAndFilters();
  }, [lenders, searchQuery, statusFilter]);

  // Apply pagination when filtered lenders change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredLenders.length / ITEMS_PER_PAGE));
    if (currentPage > Math.ceil(filteredLenders.length / ITEMS_PER_PAGE) && filteredLenders.length > 0) {
      setCurrentPage(1);
    }
  }, [filteredLenders]);

  // Refresh lenders list when dialogs close
  useEffect(() => {
    if (!isAddDialogOpen && !isEditDialogOpen && !isDeleteDialogOpen && user && user.role === 'admin') {
      fetchLenders();
    }
  }, [isAddDialogOpen, isEditDialogOpen, isDeleteDialogOpen, user]);

  // Check if user still has admin privileges
  useEffect(() => {
    // Skip during initial loading or when user is not yet loaded
    if (authLoading) return;
    
    const checkAdminPrivileges = async () => {
      try {
        // Verify admin status with the server directly with a timestamp to prevent caching
        const response = await axios.get(`/auth/me?verify_admin=true&timestamp=${new Date().getTime()}`);
        
        // Check if the user is an admin based on the response
        if (!response.data.isAdmin) {
          console.log('User is not admin:', response.data.role);
          throw new Error('Not an admin user');
        }
        
        // Additional check on client-side
        if (!user || user.role !== 'admin') {
          console.log('Client side check failed - user:', user);
          throw new Error('Not an admin user');
        }
      } catch (err) {
        console.error('Admin privilege check failed:', err);
        toast({
          title: "Session Error",
          description: "Your admin session has expired or changed. Please log in again.",
          variant: "destructive",
        });
        
        // Reset state first
        setUser(null);
        setIsAuthenticated(false);
        
        // Then call logout to clear cookies
        logout();
      }
    };
    
    checkAdminPrivileges();
  }, [user, logout, authLoading]);

  // Fetch all lenders from the API
  const fetchLenders = async () => {
    try {
      setLoading(true);
      // Reset image errors when fetching new data
      setImageErrors({});
      // Add a timestamp parameter to prevent caching
      const response = await axios.get(`/auth/lenders?timestamp=${new Date().getTime()}`);
      setLenders(response.data.lenders);
      setFilteredLenders(response.data.lenders);
    } catch (error: any) {
      console.error('Error fetching lenders:', error);
      
      // Handle 403 error specifically
      if (error.response && error.response.status === 403) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to view lenders. This may happen if your session has changed.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch lenders",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filters to the lenders list
  const applySearchAndFilters = () => {
    let filtered = [...lenders];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        lender => 
          lender.name.toLowerCase().includes(query) || 
          (lender.email && lender.email.toLowerCase().includes(query)) ||
          lender.username.toLowerCase().includes(query) ||
          (lender.phone && lender.phone.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(lender => lender.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredLenders(filtered);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLenders.slice(startIndex, endIndex);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      dob: "",
      phone: "",
      address: "",
      username: "",
      password: "",
      email: "",
      status: "Active"
    });
  };

  const handleAddLender = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.username || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Prepare lender data
      const lenderData = {
        name: formData.name,
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        status: formData.status,
        role: 'lender'
      };

      // Use adminRegister to add a lender without changing auth state
      const response = await adminRegister(lenderData);

      // Immediately update the UI with the new lender
      if (response && response.data && response.data.user) {
        const newLender = response.data.user;
        setLenders(prevLenders => [...prevLenders, newLender]);
      } else {
        // If we don't have the user data in the response, fetch the updated list
        fetchLenders();
      }

      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "Lender added successfully",
      });
    } catch (error: any) {
      console.error('Error adding lender:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add lender",
        variant: "destructive",
      });
    }
  };

  const handleEditLender = (lender: Lender) => {
    setEditingLender(lender);
    setFormData({
      name: lender.name,
      dob: lender.dob || "",
      phone: lender.phone || "",
      address: lender.address || "",
      username: lender.username,
      password: "",
      email: lender.email || "",
      status: lender.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLender = async () => {
    if (!editingLender?._id) return;
    
    try {
      const dataToUpdate = {
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.address,
        status: formData.status,
        email: formData.email
      };
      
      // Only include password if it was changed
      if (formData.password) {
        Object.assign(dataToUpdate, { password: formData.password });
      }
      
      await axios.put(`/auth/users/${editingLender._id}`, dataToUpdate);
      
      // Immediately update the UI with the edited lender
      setLenders(prevLenders => 
        prevLenders.map(lender => 
          lender._id === editingLender._id 
            ? { ...lender, ...dataToUpdate } 
            : lender
        )
      );
      
      setIsEditDialogOpen(false);
      setEditingLender(null);
      resetForm();
      
      toast({
        title: "Success",
        description: "Lender updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating lender:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update lender",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteClick = (lender: Lender) => {
    setDeletingLender(lender);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteLender = async () => {
    if (!deletingLender?._id) return;
    
    try {
      await axios.delete(`/auth/users/${deletingLender._id}`);
      
      // Immediately update the UI by removing the deleted lender from the state
      setLenders(prevLenders => prevLenders.filter(lender => lender._id !== deletingLender._id));
      
      // Close dialog and clear state
      setIsDeleteDialogOpen(false);
      setDeletingLender(null);
      
      toast({
        title: "Success",
        description: "Lender deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting lender:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete lender",
        variant: "destructive",
      });
    }
  };

  // Handle image load errors
  const handleImageError = (lenderId: string | undefined) => {
    if (lenderId) {
      setImageErrors(prev => ({
        ...prev,
        [lenderId]: true
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-3xl font-bold">{t('lenders.title')}</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end w-full sm:w-auto">
          {/* Search and Filter Bar - now positioned at the right end before Add button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`${t('common.search')} ${t('lenders.title')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('lenders.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="Active">{t('Active')}</SelectItem>
                  <SelectItem value="Inactive">{t('Inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('lenders.addLender')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('lenders.addNew')}</DialogTitle>
                <DialogDescription>
                  {t('lenders.addNewDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t('lenders.name')}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">
                    {t('lenders.dob')}
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    {t('lenders.phone')}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    {t('lenders.address')}
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    {t('lenders.username')}
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    {t('lenders.password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    {t('lenders.status')}
                  </Label>
                  <Select value={formData.status} onValueChange={(value: "Active" | "Inactive") => setFormData({...formData, status: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">{t('Active')}</SelectItem>
                      <SelectItem value="Inactive">{t('Inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddLender}>{t('lenders.saveLender')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('lenders.editLender')}</DialogTitle>
            <DialogDescription>
              {t('lenders.editDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                {t('lenders.name')}
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-dob" className="text-right">
                {t('lenders.dob')}
              </Label>
              <Input
                id="edit-dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                {t('lenders.phone')}
              </Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                {t('lenders.address')}
              </Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-username" className="text-right">
                {t('lenders.username')}
              </Label>
              <Input
                id="edit-username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">
                {t('lenders.password')}
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Leave empty to keep current password"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                {t('lenders.status')}
              </Label>
              <Select value={formData.status} onValueChange={(value: "Active" | "Inactive") => setFormData({...formData, status: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">{t('Active')}</SelectItem>
                  <SelectItem value="Inactive">{t('Inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateLender}>{t('lenders.updateLender')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the lender 
              {deletingLender && <span className="font-semibold"> {deletingLender.name}</span>} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLender}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {loading ? (
        <div className="text-center py-10">Loading lenders...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getCurrentPageItems().length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Users className="h-10 w-10 text-gray-400 mb-4" />
                  <p className="text-lg text-gray-500">No lenders found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            ) : (
              getCurrentPageItems().map((lender) => (
                <Card key={lender._id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {lender.profilePicture && !imageErrors[lender._id || ''] ? (
                          <AvatarImage 
                            src={getFullImageUrl(lender.profilePicture)} 
                            alt={lender.name} 
                            onError={() => handleImageError(lender._id)}
                          />
                        ) : (
                          <AvatarFallback>{lender.name.charAt(0).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <CardTitle className="text-lg">{lender.name}</CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditLender(lender)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(lender)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{lender.phone}</CardDescription>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div><span className="font-medium">{t('lenders.dobLabel')}:</span> {lender.dob}</div>
                      <div><span className="font-medium">{t('lenders.addressLabel')}:</span> {lender.address}</div>
                      <div><span className="font-medium">{t('lenders.usernameLabel')}:</span> {lender.username}</div>
                      <div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          lender.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {lender.status === 'Active' ? t('Active') : t('Inactive')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredLenders.length > ITEMS_PER_PAGE && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({length: Math.min(totalPages, 5)}, (_, i) => {
                  // Logic for showing the relevant page numbers
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLenders;

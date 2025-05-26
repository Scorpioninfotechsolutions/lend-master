import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('lenders.title')}</h1>
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
                    <SelectItem value="Active">{t('common.active')}</SelectItem>
                    <SelectItem value="Inactive">{t('common.inactive')}</SelectItem>
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
                  <SelectItem value="Active">{t('common.active')}</SelectItem>
                  <SelectItem value="Inactive">{t('common.inactive')}</SelectItem>
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
        <div className="grid gap-4">
          {lenders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users className="h-10 w-10 text-gray-400 mb-4" />
                <p className="text-lg text-gray-500">No lenders found</p>
                <p className="text-sm text-gray-400 mt-1">Add your first lender to get started</p>
              </CardContent>
            </Card>
          ) : (
            lenders.map((lender) => (
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
                        {lender.status === 'Active' ? t('common.active') : t('common.inactive')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminLenders;

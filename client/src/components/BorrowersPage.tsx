import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import AddBorrowerDialog from "./AddBorrowerDialog";
import EditBorrowerDialog from "./EditBorrowerDialog";
import BorrowersStats from "./BorrowersStats";
import BorrowersTable from "./BorrowersTable";
import type { BorrowersPageProps, Borrower, Referrer } from "../types/borrower";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const BorrowersPage = ({ userRole = "lender" }: BorrowersPageProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);

  // Fetch borrowers data from API
  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/borrowers`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        // Map API data to Borrower interface
        const borrowersData = response.data.data.map((borrower: any) => ({
          id: borrower._id,
          name: borrower.name || "",
          username: borrower.username || "",
          email: borrower.email || "",
          phone: borrower.phone || "",
          totalBorrowed: borrower.totalBorrowed || 0,
          activeLoans: borrower.activeLoans || 0,
          status: borrower.status || "Active",
          joinDate: borrower.createdAt || new Date().toISOString(),
          lastPayment: borrower.lastPayment || "",
          referrer: borrower.referrer || "",
          // Include card details as direct fields
          cardNumber: borrower.cardNumber || "",
          cardName: borrower.cardName || "",
          validTil: borrower.validTil || "",
          cvv: borrower.cvv || "",
          atmPin: borrower.atmPin || "",
          // Include profile picture if available
          profilePicture: borrower.profilePicture || ""
        }));
        setBorrowers(borrowersData);
      } else {
        toast({
          title: t('common.error'),
          description: response.data.message || t('common.fetchError'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching borrowers:", error);
      toast({
        title: t('common.error'),
        description: t('common.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch referrers data
  const fetchReferrers = async () => {
    try {
      // In a real app, you'd fetch this from an API
      // For now, using static data
      const referrersData: Referrer[] = [
        { id: 1, name: "Rajesh Kumar" },
        { id: 2, name: "Priya Sharma" },
        { id: 3, name: "Amit Patel" }
      ];
      setReferrers(referrersData);
    } catch (error) {
      console.error("Error fetching referrers:", error);
    }
  };

  // Handle adding a new borrower
  const handleAddBorrower = async (borrowerData: any) => {
    try {
      console.log("Sending borrower data to server:", borrowerData);
      
      const response = await axios.post(`${API_URL}/borrowers`, borrowerData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        toast({
          title: t('common.success'),
          description: t('borrowers.addSuccess')
        });
        // Refresh borrowers list
        fetchBorrowers();
      } else {
        toast({
          title: t('common.error'),
          description: response.data.message || t('common.saveError'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error adding borrower:", error);
      
      // Extract more specific error message if available
      let errorMessage = t('common.saveError');
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.join('. ');
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Handle editing a borrower
  const handleEditBorrower = async (borrowerData: any) => {
    if (!selectedBorrower) return;
    
    try {
      const response = await axios.put(`${API_URL}/borrowers/${selectedBorrower.id}`, borrowerData, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast({
          title: t('common.success'),
          description: t('borrowers.updateSuccess')
        });
        // Refresh borrowers list
        fetchBorrowers();
        // Close edit dialog
        setShowEditDialog(false);
        setSelectedBorrower(null);
      } else {
        toast({
          title: t('common.error'),
          description: response.data.message || t('common.updateError'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error updating borrower:", error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('common.updateError'),
        variant: "destructive"
      });
    }
  };

  // Handle deleting a borrower
  const handleDeleteBorrower = async (borrowerId: number, permanent: boolean = false) => {
    try {
      const endpoint = `${API_URL}/borrowers/${borrowerId}${permanent ? '?confirmation=delete' : ''}`;
      
      const response = await axios.delete(endpoint, {
        withCredentials: true
      });
      
      if (response.data.success) {
        toast({
          title: t('common.success'),
          description: permanent ? t('borrowers.deletePermanentSuccess') : t('borrowers.deleteSuccess')
        });
        // Update borrowers list locally to avoid extra API call
        setBorrowers(prevBorrowers => prevBorrowers.filter(b => b.id !== borrowerId));
      } else {
        toast({
          title: t('common.error'),
          description: response.data.message || t('common.deleteError'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error deleting borrower:", error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('common.deleteError'),
        variant: "destructive"
      });
    }
  };

  // Handle edit button click
  const handleEditClick = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setShowEditDialog(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBorrowers();
    fetchReferrers();
  }, []);

  // Filter data based on user role
  const currentUserBorrower = borrowers[0]; // Simulating current logged-in borrower (would get from auth context in real app)
  const displayBorrowers = userRole === "borrower" ? 
    (currentUserBorrower ? [currentUserBorrower] : []) : 
    borrowers;

  const filteredBorrowers = displayBorrowers.filter(borrower =>
    borrower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {userRole === "borrower" ? t('borrowers.myProfile') : t('borrowers.title')}
        </h2>
        {userRole !== "borrower" && (
          <AddBorrowerDialog 
            referrers={referrers} 
            onAddBorrower={handleAddBorrower}
          />
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
        onEdit={handleEditClick}
        onDelete={handleDeleteBorrower}
      />
      
      {selectedBorrower && (
        <EditBorrowerDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          borrower={selectedBorrower}
          referrers={referrers}
          onSave={handleEditBorrower}
        />
      )}
    </div>
  );
};

export default BorrowersPage;

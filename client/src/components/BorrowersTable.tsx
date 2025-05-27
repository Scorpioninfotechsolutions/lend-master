import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Phone, Mail, Trash2, AlertTriangle, CreditCard, Eye, EyeOff, Lock, Check, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { Borrower } from "../types/borrower";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import VerifyCardDetailsDialog from "./VerifyCardDetailsDialog";
import api from "../utils/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";

interface BorrowersTableProps {
  userRole: "admin" | "lender" | "borrower";
  filteredBorrowers: Borrower[];
  onEdit: (borrower: Borrower) => void;
  onDelete: (borrowerId: number, permanent?: boolean) => void;
}

const BorrowersTable = ({ userRole, filteredBorrowers, onEdit, onDelete }: BorrowersTableProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getFullImageUrl } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [borrowerToDelete, setBorrowerToDelete] = useState<Borrower | null>(null);
  const [cardDetailsDialogOpen, setCardDetailsDialogOpen] = useState(false);
  const [selectedBorrowerCards, setSelectedBorrowerCards] = useState<{
    id?: string | number;
    name: string;
    cardNumber?: string;
    cardName?: string;
    validTil?: string;
    cvv?: string;
    atmPin?: string;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(true);
  
  // Replace password related state with verification dialog state
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyField, setVerifyField] = useState<"cvv" | "atmPin" | "validTil" | "password">("password");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCardDetails = (borrower: Borrower) => {
    if (borrower.cardDetails) {
      return borrower.cardDetails;
    }
    
    if (borrower.cardNumber || borrower.cardName || borrower.validTil) {
      return {
        cardNumber: borrower.cardNumber || '',
        cardName: borrower.cardName || '',
        validTil: borrower.validTil || '',
        cvv: borrower.cvv || '',
        atmPin: borrower.atmPin || ''
      };
    }
    
    return {};
  };

  const handleEditClick = (borrower: Borrower) => {
    onEdit(borrower);
  };

  const handleDeleteClick = (borrower: Borrower) => {
    setBorrowerToDelete(borrower);
    setDeleteConfirmation('');
    setIsDeleteButtonDisabled(true);
    setDeleteDialogOpen(true);
  };

  const handleViewCardDetails = (borrower: Borrower) => {
    const cardDetails = getCardDetails(borrower);
    setSelectedBorrowerCards({
      id: borrower.id,
      name: borrower.name,
      ...cardDetails
    });
    setShowSensitiveInfo(false); // Reset sensitive info visibility
    setCardDetailsDialogOpen(true);
  };

  const handleDeleteConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDeleteConfirmation(value);
    setIsDeleteButtonDisabled(value.toLowerCase() !== 'delete');
  };

  const confirmDelete = () => {
    if (borrowerToDelete) {
      // Only permanent delete if the confirmation is "delete"
      const isPermanent = deleteConfirmation.toLowerCase() === 'delete';
      onDelete(borrowerToDelete.id, isPermanent);
      
      toast({
        title: t('common.deleted'),
        description: isPermanent 
          ? t('borrowers.deletePermanentSuccess') 
          : t('borrowers.deleteSuccess'),
      });
    }
    setDeleteDialogOpen(false);
    setBorrowerToDelete(null);
    setDeleteConfirmation('');
  };

  // Format card number with spaces for better readability
  const formatCardNumber = (cardNumber?: string) => {
    if (!cardNumber) return '';
    return cardNumber.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || cardNumber;
  };

  // Handle opening the verification dialog
  const handleViewSensitiveInfo = (field: "cvv" | "atmPin" | "validTil" | "password") => {
    setVerifyField(field);
    setVerifyDialogOpen(true);
  };

  // Handle successful verification
  const handleVerificationSuccess = async () => {
    console.log("Verification successful, showing sensitive info");
    
    try {
      // Fetch the complete card details with sensitive information
      if (selectedBorrowerCards?.id) {
        console.log("Fetching card details for borrower ID:", selectedBorrowerCards.id);
        
        const response = await api.get(`/auth/borrower-card-details/${selectedBorrowerCards.id}`);
        
        console.log("API response:", response.data);
        
        if (response.data.success) {
          // Log the received data
          console.log("Received card details:", {
            cardNumber: response.data.data.cardNumber,
            cardName: response.data.data.cardName,
            validTil: response.data.data.validTil,
            cvv: response.data.data.cvv ? "Present" : "Missing",
            atmPin: response.data.data.atmPin ? "Present" : "Missing"
          });
          
          // Update the card details with complete information including decrypted values
          setSelectedBorrowerCards(prev => ({
            ...prev!,
            ...response.data.data,
            // Don't use hardcoded values anymore - just pass what the API returns
            cvv: response.data.data.cvv || '',
            atmPin: response.data.data.atmPin || ''
          }));
          
          setShowSensitiveInfo(true);
          
          toast({
            title: "Success",
            description: "Sensitive card information unlocked"
          });
          
          // Force a re-render to ensure the values display correctly
          setTimeout(() => {
            // Log current state
            console.log("Current card details after timeout:", {
              cvv: selectedBorrowerCards?.cvv || "Missing",
              atmPin: selectedBorrowerCards?.atmPin || "Missing",
              showSensitiveInfo
            });
          }, 100);
        }
      } else {
        setShowSensitiveInfo(true);
        
        // If we don't have an ID to fetch details, use test data
        setSelectedBorrowerCards(prev => ({
          ...prev!,
          cvv: '',
          atmPin: ''
        }));
        
        toast({
          title: "Using Test Data",
          description: "Using sample data for demonstration"
        });
      }
    } catch (error) {
      console.error("Error fetching complete card details:", error);
      
      // Still show what we have even if there's an error
      setShowSensitiveInfo(true);
      
      // Don't use hardcoded test values anymore
      setSelectedBorrowerCards(prev => ({
        ...prev!,
        cvv: '',
        atmPin: ''
      }));
      
      toast({
        title: "Using Test Data",
        description: "Using sample data for demonstration"
      });
    }
  };

  // Reset states when the card details dialog is closed
  const handleCardDetailsDialogClose = (open: boolean) => {
    if (!open) {
      setShowSensitiveInfo(false);
    }
    setCardDetailsDialogOpen(open);
  };

  // Add a separate handler for the close button
  const handleCloseButtonClick = () => {
    setCardDetailsDialogOpen(false);
  };

  // Function to get avatar letter for fallback
  const getAvatarLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
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
                <TableHead>{t('borrowers.cardDetails')}</TableHead>
                <TableHead>{t('borrowers.referrer')}</TableHead>
                <TableHead>{t('lenders.status')}</TableHead>
                {userRole !== "borrower" && <TableHead>{t('borrowers.actions')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBorrowers.map((borrower) => (
                <TableRow key={borrower.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {borrower.profilePicture ? (
                          <AvatarImage 
                            src={getFullImageUrl(borrower.profilePicture) || ''} 
                            alt={borrower.name}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="text-xs bg-zinc-200">
                            {getAvatarLetter(borrower.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{borrower.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <User className="mr-1 h-3 w-3" />
                        {borrower.username}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {borrower.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>₹{borrower.totalBorrowed.toLocaleString()}</TableCell>
                  <TableCell>{borrower.activeLoans}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewCardDetails(borrower)}
                      className="flex items-center"
                    >
                      <CreditCard className="mr-1 h-3 w-3" />
                      <span>{t('borrowers.card')}</span>
                    </Button>
                  </TableCell>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(borrower)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteClick(borrower)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Card Details Dialog */}
      <Dialog open={cardDetailsDialogOpen} onOpenChange={handleCardDetailsDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              {t('borrowers.cardDetails')}
            </DialogTitle>
            <DialogDescription>
              {selectedBorrowerCards?.name}'s card information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm font-medium text-gray-500">{t('borrowers.cardNumber')}</div>
                  <div className="col-span-2 font-mono text-sm">
                    {formatCardNumber(selectedBorrowerCards?.cardNumber)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm font-medium text-gray-500">{t('borrowers.cardName')}</div>
                  <div className="col-span-2 font-mono text-sm">
                    {selectedBorrowerCards?.cardName}
                  </div>
                </div>

                {/* Sensitive card details - conditionally displayed */}
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm font-medium text-gray-500">{t('borrowers.validTill')}</div>
                  <div className="col-span-2 font-mono text-sm">
                    {showSensitiveInfo ? (
                      selectedBorrowerCards?.validTil || '••/••'
                    ) : (
                      '••/••'
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm font-medium text-gray-500">{t('borrowers.cvv')}</div>
                  <div className="col-span-2 font-mono text-sm">
                    {showSensitiveInfo ? (
                      selectedBorrowerCards?.cvv || '•••'
                    ) : (
                      '•••'
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm font-medium text-gray-500">{t('borrowers.atmPin')}</div>
                  <div className="col-span-2 font-mono text-sm">
                    {showSensitiveInfo ? (
                      selectedBorrowerCards?.atmPin || '••••'
                    ) : (
                      '••••'
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {!showSensitiveInfo && (
              <div className="mb-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    {t('security.dataSecurity')}
                  </div>
                  <p className="mt-1 text-xs">{t('security.secureStorage')}</p>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => handleViewSensitiveInfo("password")}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {t('borrowers.viewSensitiveInfo')}
                </Button>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCloseButtonClick}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t('common.confirmDelete')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {borrowerToDelete && (
                <div className="space-y-4">
                  <p>{`${t('borrowers.deleteConfirmation')} ${borrowerToDelete.name}?`}</p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-red-600 font-medium mb-2">
                      {t('borrowers.permanentDeleteWarning')}
                    </p>
                    <form 
                      autoComplete="off" 
                      autoCorrect="off" 
                      autoCapitalize="off" 
                      spellCheck="false"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      {/* Hidden fields to defeat autocomplete */}
                      <div style={{ display: 'none' }}>
                        <input type="text" name="hidden-name" autoComplete="username" />
                        <input type="password" name="hidden-password" autoComplete="current-password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delete-confirmation" className="text-sm">
                          {t('borrowers.typeDeleteToConfirm')}
                        </Label>
                        <Input 
                          id="delete-confirmation"
                          type="text"
                          placeholder={t('borrowers.deleteWord')}
                          value={deleteConfirmation}
                          onChange={handleDeleteConfirmationChange}
                          className="w-full"
                          autoComplete="nope"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          name={`delete-confirmation-${Math.random().toString(36).substr(2, 9)}`}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmation('');
              setBorrowerToDelete(null);
            }}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className={`bg-red-600 hover:bg-red-700 ${isDeleteButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isDeleteButtonDisabled}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification dialog for sensitive information */}
      <VerifyCardDetailsDialog 
        open={verifyDialogOpen}
        onOpenChange={setVerifyDialogOpen}
        userId={selectedBorrowerCards?.id?.toString() || ''}
        onVerificationSuccess={handleVerificationSuccess}
        fieldToVerify={verifyField}
      />
    </>
  );
};

export default BorrowersTable;

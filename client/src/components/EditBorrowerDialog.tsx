import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "../contexts/LanguageContext";
import type { Borrower, Referrer, CardDetails } from "../types/borrower";

interface EditBorrowerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrower: Borrower;
  referrers: Referrer[];
  onSave: (borrowerData: any) => void;
}

interface EditableBorrowerData {
  fullName: string;
  username: string;
  password: string;
  phone: string;
  address: string;
  status: "Active" | "Completed" | "Overdue";
  referrer: string;
  cardNumber?: string;
  cardName?: string;
  validTil?: string;
  cvv?: string;
  atmPin?: string;
}

const EditBorrowerDialog = ({ 
  open, 
  onOpenChange, 
  borrower, 
  referrers, 
  onSave 
}: EditBorrowerDialogProps) => {
  const { t } = useLanguage();
  const [borrowerData, setBorrowerData] = useState<EditableBorrowerData>({
    fullName: "",
    username: "",
    password: "",
    phone: "",
    address: "",
    status: "Active",
    referrer: "",
    cardNumber: "",
    cardName: "",
    validTil: "",
    cvv: "",
    atmPin: ""
  });

  useEffect(() => {
    if (borrower) {
      // Function to safely get card details from either source
      const getCardDetail = (field: string) => {
        // First try direct fields on borrower
        if (borrower[field as keyof Borrower]) {
          return borrower[field as keyof Borrower] as string;
        }
        // Then try cardDetails object
        if (borrower.cardDetails && borrower.cardDetails[field as keyof CardDetails]) {
          return borrower.cardDetails[field as keyof CardDetails];
        }
        return ""; // Default value
      };

      // Populate form with borrower data when it changes
      setBorrowerData({
        fullName: borrower.name,
        username: borrower.username || "",
        password: "", // Don't pre-fill password for security reasons
        phone: borrower.phone,
        address: borrower.address || "",
        status: borrower.status,
        referrer: borrower.referrer,
        cardNumber: "",  // Don't pre-fill sensitive card information
        cardName: "",    // Don't pre-fill sensitive card information
        validTil: "",    // Don't pre-fill sensitive card information
        cvv: "",         // Don't pre-fill sensitive card information
        atmPin: ""       // Don't pre-fill sensitive card information
      });
    }
  }, [borrower]);

  const handleInputChange = (field: string, value: string | number) => {
    setBorrowerData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Generate email from username (since server requires email)
    const email = `${borrowerData.username.toLowerCase()}@example.com`;
    
    // Prepare data for API
    const updatedData = {
      name: borrowerData.fullName,
      email: email, // Include email for server compatibility
      username: borrowerData.username,
      phone: borrowerData.phone,
      address: borrowerData.address,
      status: borrowerData.status,
      referrer: borrowerData.referrer,
      // Only include password if it was provided
      ...(borrowerData.password ? { password: borrowerData.password } : {}),
      // Direct card fields for compatibility with updated User model
      cardNumber: borrowerData.cardNumber || undefined,
      cardName: borrowerData.cardName || undefined,
      validTil: borrowerData.validTil || undefined,
      cvv: borrowerData.cvv || undefined,
      atmPin: borrowerData.atmPin || undefined
    };
    
    // Call the parent's save handler
    onSave(updatedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl p-4 sm:p-6 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg sm:text-xl">
            {t('borrowers.editBorrower')}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="personal" className="flex items-center justify-center gap-2 py-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('borrowers.personalInfo')}</span>
              <span className="sm:hidden">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="card" className="flex items-center justify-center gap-2 py-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('borrowers.atmCardDetails')}</span>
              <span className="sm:hidden">Card</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First row: Full Name (left) and Phone (right) */}
              <div className="space-y-2">
                <Label htmlFor="edit-fullName" className="text-sm font-medium">{t('borrowers.fullName')}</Label>
                <Input 
                  id="edit-fullName" 
                  placeholder={t('borrowers.fullName')}
                  value={borrowerData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="text-sm font-medium">{t('borrowers.phoneNumber')}</Label>
                <Input 
                  id="edit-phone" 
                  placeholder={t('borrowers.phoneNumber')}
                  value={borrowerData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  autoComplete="off"
                />
              </div>
              
              {/* Username and Password */}
              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-sm font-medium">{t('login.username')}</Label>
                <Input 
                  id="edit-username" 
                  placeholder={t('login.username')}
                  value={borrowerData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-sm font-medium">{t('login.password')}</Label>
                <Input 
                  id="edit-password" 
                  type="password"
                  placeholder={t('login.password') + " (leave empty to keep current)"}
                  value={borrowerData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              
              {/* Status and Referrer */}
              <div className="space-y-2">
                <Label htmlFor="edit-status" className="text-sm font-medium">{t('lenders.status')}</Label>
                <Select 
                  value={borrowerData.status} 
                  onValueChange={(value: "Active" | "Completed" | "Overdue") => handleInputChange("status", value)}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder={t('lenders.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">{t('Active')}</SelectItem>
                    <SelectItem value="Completed">{t('common.completed')}</SelectItem>
                    <SelectItem value="Overdue">{t('Overdue')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-referrer" className="text-sm font-medium">{t('borrowers.referrer')}</Label>
                <Select 
                  value={borrowerData.referrer} 
                  onValueChange={(value) => handleInputChange("referrer", value)}
                >
                  <SelectTrigger id="edit-referrer">
                    <SelectValue placeholder={t('borrowers.selectReferrer')} />
                  </SelectTrigger>
                  <SelectContent>
                    {referrers.map((referrer) => (
                      <SelectItem key={referrer.id} value={referrer.name}>
                        {referrer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Address (full width) */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="edit-address" className="text-sm font-medium">{t('borrowers.address')}</Label>
                <Textarea 
                  id="edit-address" 
                  placeholder={t('borrowers.address')}
                  value={borrowerData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={4}
                  autoComplete="off"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* ATM Card Details Tab */}
          <TabsContent value="card">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cardNumber" className="text-sm font-medium">{t('borrowers.cardNumber')}</Label>
                <Input 
                  id="edit-cardNumber" 
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  value={borrowerData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  maxLength={19}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cardName" className="text-sm font-medium">{t('borrowers.cardName')}</Label>
                <Input 
                  id="edit-cardName" 
                  placeholder={t('borrowers.cardName')}
                  value={borrowerData.cardName}
                  onChange={(e) => handleInputChange("cardName", e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-validTil" className="text-sm font-medium">{t('borrowers.validTill')}</Label>
                  <Input 
                    id="edit-validTil" 
                    placeholder="MM/YY"
                    value={borrowerData.validTil}
                    onChange={(e) => handleInputChange("validTil", e.target.value)}
                    maxLength={5}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cvv" className="text-sm font-medium">{t('borrowers.cvv')}</Label>
                  <Input 
                    id="edit-cvv" 
                    placeholder="xxx"
                    type="password"
                    value={borrowerData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value)}
                    maxLength={3}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-atmPin" className="text-sm font-medium">{t('borrowers.atmPin')}</Label>
                  <Input 
                    id="edit-atmPin" 
                    placeholder="xxxx"
                    type="password"
                    value={borrowerData.atmPin}
                    onChange={(e) => handleInputChange("atmPin", e.target.value)}
                    maxLength={4}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button className="w-full mt-6" onClick={handleSave}>
          {t('common.save')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditBorrowerDialog; 
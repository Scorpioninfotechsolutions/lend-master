
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { NewBorrowerData, Referrer } from "../types/borrower";

interface AddBorrowerDialogProps {
  referrers: Referrer[];
}

const AddBorrowerDialog = ({ referrers }: AddBorrowerDialogProps) => {
  const { t } = useLanguage();
  const [newBorrowerData, setNewBorrowerData] = useState<NewBorrowerData>({
    profilePicture: null,
    fullName: "",
    phone: "",
    address: "",
    idProof: null,
    cardNumber: "",
    cardName: "",
    validTil: "",
    cvv: "",
    atmPin: "",
    referrer: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setNewBorrowerData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBorrowerData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleAddBorrower = () => {
    console.log("Adding new borrower:", newBorrowerData);
    // Reset form
    setNewBorrowerData({
      profilePicture: null,
      fullName: "",
      phone: "",
      address: "",
      idProof: null,
      cardNumber: "",
      cardName: "",
      validTil: "",
      cvv: "",
      atmPin: "",
      referrer: ""
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('borrowers.addBorrower')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('borrowers.addNew')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('borrowers.personalInfo')}</h3>
            <div>
              <Label htmlFor="profilePicture">{t('borrowers.profilePicture')}</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="profilePicture" 
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload("profilePicture", e)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Upload className="h-4 w-4 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">{t('borrowers.uploadDesc')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{t('borrowers.fullName')}</Label>
                <Input 
                  id="fullName" 
                  placeholder={t('borrowers.fullName')}
                  value={newBorrowerData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('borrowers.phoneNumber')}</Label>
                <Input 
                  id="phone" 
                  placeholder={t('borrowers.phoneNumber')}
                  value={newBorrowerData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">{t('borrowers.address')}</Label>
              <Textarea 
                id="address" 
                placeholder={t('borrowers.address')}
                value={newBorrowerData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="idProof">{t('borrowers.idProof')}</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="idProof" 
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload("idProof", e)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Upload className="h-4 w-4 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">{t('borrowers.idProofDesc')}</p>
            </div>
          </div>

          {/* ATM Card Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('borrowers.atmCardDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardNumber">{t('borrowers.cardNumber')}</Label>
                <Input 
                  id="cardNumber" 
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  value={newBorrowerData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  maxLength={19}
                />
              </div>
              <div>
                <Label htmlFor="cardName">{t('borrowers.cardName')}</Label>
                <Input 
                  id="cardName" 
                  placeholder={t('borrowers.cardName')}
                  value={newBorrowerData.cardName}
                  onChange={(e) => handleInputChange("cardName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="validTil">{t('borrowers.validTill')}</Label>
                <Input 
                  id="validTil" 
                  placeholder="MM/YY"
                  value={newBorrowerData.validTil}
                  onChange={(e) => handleInputChange("validTil", e.target.value)}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">{t('borrowers.cvv')}</Label>
                <Input 
                  id="cvv" 
                  placeholder="xxx"
                  type="password"
                  value={newBorrowerData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="atmPin">{t('borrowers.atmPin')}</Label>
                <Input 
                  id="atmPin" 
                  placeholder="xxxx"
                  type="password"
                  value={newBorrowerData.atmPin}
                  onChange={(e) => handleInputChange("atmPin", e.target.value)}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Referrer Selection */}
          <div>
            <Label htmlFor="referrer">{t('borrowers.referrer')}</Label>
            <Select onValueChange={(value) => handleInputChange("referrer", value)}>
              <SelectTrigger>
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
            <p className="text-sm text-gray-500 mt-1">{t('borrowers.referrerDesc')}</p>
          </div>

          <Button className="w-full" onClick={handleAddBorrower}>
            {t('borrowers.addBorrower')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBorrowerDialog;

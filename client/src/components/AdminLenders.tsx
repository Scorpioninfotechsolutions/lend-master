
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Trash } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface Lender {
  id: number;
  name: string;
  email: string;
  loans: number;
  status: "Active" | "Inactive";
}

const AdminLenders = () => {
  const { t } = useLanguage();
  
  const [lenders, setLenders] = useState<Lender[]>([
    { id: 1, name: "John Smith", email: "john@example.com", loans: 12, status: "Active" },
    { id: 2, name: "Sarah Johnson", email: "sarah@example.com", loans: 8, status: "Active" },
    { id: 3, name: "Mike Davis", email: "mike@example.com", loans: 15, status: "Inactive" },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    loans: 0,
    status: "Active" as "Active" | "Inactive"
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      loans: 0,
      status: "Active"
    });
  };

  const handleAddLender = () => {
    const newLender: Lender = {
      id: Math.max(...lenders.map(l => l.id)) + 1,
      ...formData
    };
    setLenders([...lenders, newLender]);
    setIsAddDialogOpen(false);
    resetForm();
    console.log("Added new lender:", newLender);
  };

  const handleEditLender = (lender: Lender) => {
    setEditingLender(lender);
    setFormData({
      name: lender.name,
      email: lender.email,
      loans: lender.loans,
      status: lender.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateLender = () => {
    if (!editingLender) return;
    
    const updatedLenders = lenders.map(lender =>
      lender.id === editingLender.id
        ? { ...lender, ...formData }
        : lender
    );
    setLenders(updatedLenders);
    setIsEditDialogOpen(false);
    setEditingLender(null);
    resetForm();
    console.log("Updated lender:", editingLender.id);
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
                <Label htmlFor="email" className="text-right">
                  {t('lenders.email')}
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
                <Label htmlFor="loans" className="text-right">
                  {t('lenders.loans')}
                </Label>
                <Input
                  id="loans"
                  type="number"
                  value={formData.loans}
                  onChange={(e) => setFormData({...formData, loans: parseInt(e.target.value) || 0})}
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
              <Label htmlFor="edit-email" className="text-right">
                {t('lenders.email')}
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
              <Label htmlFor="edit-loans" className="text-right">
                {t('lenders.loans')}
              </Label>
              <Input
                id="edit-loans"
                type="number"
                value={formData.loans}
                onChange={(e) => setFormData({...formData, loans: parseInt(e.target.value) || 0})}
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

      <div className="grid gap-4">
        {lenders.map((lender) => (
          <Card key={lender.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{lender.name}</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEditLender(lender)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{lender.email}</CardDescription>
              <div className="flex justify-between mt-2">
                <span>{t('lenders.activeLoansLabel')}: {lender.loans}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  lender.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {lender.status === 'Active' ? t('common.active') : t('common.inactive')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminLenders;

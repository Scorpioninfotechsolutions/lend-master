import { useState, useRef, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { User, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

const EditProfileDialog = ({ open, onClose }: EditProfileDialogProps) => {
  const { user, setUser, getFullImageUrl } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
    address: user?.address || "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profilePicture ? getFullImageUrl(user.profilePicture) : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('profile.error'),
          description: t('profile.fileTooLarge'),
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          title: t('profile.error'),
          description: t('profile.invalidFileType'),
          variant: "destructive",
        });
        return;
      }
      
      setProfileImage(file);
      setImageError(false);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: t('profile.imageSelected'),
        description: t('profile.imageReadyToUpload'),
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Create form data for file upload
      const submitData = new FormData();
      
      // Add text fields
      submitData.append("name", formData.name);
      submitData.append("phone", formData.phone);
      submitData.append("dob", formData.dob);
      submitData.append("address", formData.address);
      
      // Add profile picture if selected
      if (profileImage) {
        submitData.append("profilePicture", profileImage);
        toast({
          title: t('profile.uploading'),
          description: t('profile.uploadingImage'),
        });
      }
      
      // Submit data
      const response = await axios.put("/auth/profile/update", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Update user in context
      if (response.data.success && response.data.user) {
        // Make sure we're setting the user data correctly
        const userData = response.data.user;
        
        // Update the user state
        setUser(userData);
        
        toast({
          title: t('profile.success'),
          description: profileImage 
            ? t('profile.profileAndImageUpdated')
            : t('profile.profileUpdated'),
        });
        
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('profile.updateFailed');
      
      toast({
        title: t('profile.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAvatarLetter = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('profile.editProfile')}</DialogTitle>
          <DialogDescription>{t('profile.updateYourDetails')}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 my-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {previewUrl && !imageError ? (
                <AvatarImage 
                  src={previewUrl} 
                  alt={formData.name} 
                  onError={handleImageError}
                />
              ) : (
                <AvatarFallback className="text-2xl">{getAvatarLetter()}</AvatarFallback>
              )}
            </Avatar>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
              onClick={handleTriggerFileInput}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <span className="text-xs text-gray-500">{t('profile.clickToChangePhoto')}</span>
        </div>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('profile.name')}
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              {t('profile.phone')}
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right">
              {t('profile.dob')}
            </Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              {t('profile.address')}
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('profile.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? t('profile.updating') : t('profile.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog; 
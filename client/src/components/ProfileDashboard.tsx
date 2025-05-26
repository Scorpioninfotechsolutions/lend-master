import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Phone, MapPin, Clock } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSelector from "./LanguageSelector";
import EditProfileDialog from "./EditProfileDialog";

interface ProfileDashboardProps {
  userRole: "admin" | "lender" | "borrower" | "referrer";
  onClose: () => void;
}

const ProfileDashboard = ({ userRole, onClose }: ProfileDashboardProps) => {
  const { t } = useLanguage();
  const { user, getFullImageUrl } = useAuth();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Update profile image URL whenever user changes
  useEffect(() => {
    if (user?.profilePicture) {
      const fullUrl = getFullImageUrl(user.profilePicture) || '';
      setProfileImageUrl(fullUrl);
      setImageError(false);
    } else {
      setProfileImageUrl(null);
    }
  }, [user, getFullImageUrl]);

  // Get join date from user ID or createdAt field
  const getJoinDate = () => {
    if (user?.createdAt) {
      return new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    
    if (user?._id) {
      // Extract timestamp from MongoDB ObjectId (first 8 chars are hex timestamp)
      try {
        const timestamp = parseInt(user._id.substring(0, 8), 16) * 1000;
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      } catch (err) {
        // Silent error
      }
    }
    return "Unknown";
  };

  const getAvatarLetter = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    
    switch (userRole) {
      case "admin": return "A";
      case "lender": return "L";
      case "borrower": return "B";
      case "referrer": return "R";
      default: return "U";
    }
  };

  const handleEditProfile = () => {
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    // Reset image error state when dialog closes
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 overflow-hidden">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                {profileImageUrl && !imageError ? (
                  <AvatarImage 
                    src={profileImageUrl} 
                    alt={user?.name || "User"} 
                    onError={handleImageError}
                  />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {getAvatarLetter()}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            
            <CardTitle className="text-2xl font-bold">{user?.name || 'Unknown User'}</CardTitle>
            <CardDescription className="mt-2">
              <Badge variant="outline" className="capitalize text-sm py-1 px-2">
                {t(`login.${userRole}`)}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm">{user?.email || user?.username || 'No email available'}</span>
              </div>
              
              {user?.phone && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
              
              {user?.dob && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-sm">{t('profile.dob')}: {user.dob}</span>
                </div>
              )}
              
              {user?.address && (
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <MapPin className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-sm">{user.address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm">{t('profile.joined')} {getJoinDate()}</span>
              </div>
            </div>

            <div className="pt-2">
              <LanguageSelector />
            </div>

            <div className="pt-2 space-y-3">
              <Button variant="default" className="w-full" onClick={handleEditProfile}>
                <User className="mr-2 h-4 w-4" />
                {t('profile.editProfile')}
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                {t('profile.close')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showEditDialog && (
        <EditProfileDialog
          open={showEditDialog}
          onClose={handleCloseEditDialog}
        />
      )}
    </>
  );
};

export default ProfileDashboard;

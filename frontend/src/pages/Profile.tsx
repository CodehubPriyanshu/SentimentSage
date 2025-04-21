import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import SavedAnalyses from "@/components/SavedAnalyses";
import ProfileSettings from "@/components/ProfileSettings";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "@/components/ui/use-toast";
import { profileApi } from "@/utils/api";

const Profile = () => {
  const { user } = useAuth();
  const { isLightTheme } = useTheme();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handlePhotoUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check if it's an image file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      await profileApi.uploadProfilePhoto(file);

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });

      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Extract user's display name or email for display
  const displayName = user?.full_name || user?.email || "User Profile";
  const userEmail = user?.email || "user@example.com";
  const userAvatar = user?.profile_photo || "";

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative group">
              <Avatar className="h-20 w-20 avatar-glow">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-blue text-white text-xl">
                  {displayName !== "User Profile"
                    ? getInitials(displayName)
                    : "U"}
                </AvatarFallback>
              </Avatar>

              <button
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white dark:text-white light:text-navy">
                {displayName}
              </h1>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                {userEmail}
              </p>
              <p className="text-sm text-blue mt-1">
                Click on your avatar to upload a profile photo
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <SavedAnalyses />
            </div>

            <div className="md:col-span-1">
              <ProfileSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

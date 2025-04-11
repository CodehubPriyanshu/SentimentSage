
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SavedAnalyses from "@/components/SavedAnalyses";
import ProfileSettings from "@/components/ProfileSettings";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const Profile = () => {
  const { user } = useAuth();
  const { isLightTheme } = useTheme();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-20 w-20 avatar-glow">
              <AvatarImage src={user?.avatarUrl || ''} />
              <AvatarFallback className="bg-blue text-white text-xl">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-3xl font-bold text-white dark:text-white light:text-navy">
                {user?.name || 'User Profile'}
              </h1>
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-dark">
                {user?.email || 'user@example.com'}
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

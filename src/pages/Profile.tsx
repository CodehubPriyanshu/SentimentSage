
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Bell, Lock, LogOut, Sun, Moon, Upload } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    company: '',
    notifications: {
      email: true,
      reports: true,
      tips: false,
    }
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.full_name || '',
        email: user?.email || '',
        company: profile.company || '',
        notifications: {
          email: profile.notifications?.email ?? true,
          reports: profile.notifications?.reports ?? true,
          tips: profile.notifications?.tips ?? false,
        }
      });
    }
  }, [profile, user]);

  // Load recent analyses
  useEffect(() => {
    if (user) {
      // Here we'd fetch the user's recent analyses from Supabase
      // For now, we'll use mock data
      setRecentAnalyses([
        {
          id: 1,
          text: "This product is amazing! I've seen great results already.",
          sentiment: 'positive',
          date: new Date().toLocaleDateString()
        },
        {
          id: 2,
          text: "It's okay, but I expected more features for the price.",
          sentiment: 'neutral',
          date: new Date().toLocaleDateString()
        },
        {
          id: 3,
          text: "Terrible customer service. I'll never buy again.",
          sentiment: 'negative',
          date: new Date().toLocaleDateString()
        }
      ]);
    }
  }, [user]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNotificationChange = (key: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: checked
      }
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.name,
          company: profileData.company,
          notifications: profileData.notifications
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile",
        variant: "destructive"
      });
    }
  };
  
  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your password",
        variant: "destructive"
      });
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}.${fileExt}`;
    
    try {
      // Check if storage bucket exists, create if not
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('avatars');
        
      if (bucketError && bucketError.message.includes('not found')) {
        await supabase.storage.createBucket('avatars', {
          public: true
        });
      }
      
      // Upload the file
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl
        })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully",
      });
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your avatar",
        variant: "destructive"
      });
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profileData.name) {
      return profileData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };
  
  return (
    <div className="min-h-screen bg-navy dark:bg-navy light:bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white dark:text-white light:text-navy text-center mb-4">
            Your <span className="text-blue">Profile</span>
          </h1>
          
          <p className="text-gray-300 dark:text-gray-300 light:text-gray-600 text-lg text-center mb-12">
            Manage your account settings and preferences
          </p>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-navy-dark dark:bg-navy-dark light:bg-gray-200">
              <TabsTrigger value="profile" className="data-[state=active]:bg-blue data-[state=active]:text-white">
                <UserCircle className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue data-[state=active]:text-white">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue data-[state=active]:text-white">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-100 border-gray-700 dark:border-gray-700 light:border-gray-300">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-navy">Profile Information</CardTitle>
                  <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Update your profile information and avatar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-24 w-24 border-2 border-blue">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-blue text-white text-xl">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="relative">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue dark:text-blue light:text-blue dark:border-blue light:border-blue hover:bg-blue/10"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Change Avatar
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                          />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          className="input-field"
                          value={profileData.name}
                          onChange={handleProfileChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          className="input-field"
                          value={profileData.email}
                          disabled
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          name="company"
                          className="input-field"
                          value={profileData.company}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Analyses */}
                  <div className="space-y-4 mt-8">
                    <h3 className="text-lg font-semibold text-white dark:text-white light:text-navy">Recent Analyses</h3>
                    
                    {recentAnalyses.length > 0 ? (
                      <div className="space-y-3">
                        {recentAnalyses.map((analysis) => (
                          <div 
                            key={analysis.id} 
                            className={`p-3 border-l-4 ${
                              analysis.sentiment === 'positive' 
                                ? 'border-green-500 dark:border-green-500 light:border-green-500' 
                                : analysis.sentiment === 'negative'
                                  ? 'border-red-500 dark:border-red-500 light:border-red-500'
                                  : 'border-yellow-500 dark:border-yellow-500 light:border-yellow-500'
                            } bg-navy-dark dark:bg-navy-dark light:bg-gray-200 bg-opacity-60 rounded-r`}
                          >
                            <p className="text-sm text-gray-200 dark:text-gray-200 light:text-gray-700">{analysis.text}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-xs font-medium ${
                                analysis.sentiment === 'positive' 
                                  ? 'text-green-400 dark:text-green-400 light:text-green-600' 
                                  : analysis.sentiment === 'negative'
                                    ? 'text-red-400 dark:text-red-400 light:text-red-600'
                                    : 'text-yellow-400 dark:text-yellow-400 light:text-yellow-600'
                              }`}>
                                {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-500">{analysis.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-400 light:text-gray-500">
                        No recent analyses found. Try analyzing some comments!
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-blue hover:bg-blue-light text-white ml-auto"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-100 border-gray-700 dark:border-gray-700 light:border-gray-300">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-navy">Notification Settings</CardTitle>
                  <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-white dark:text-white light:text-navy">Email Notifications</h4>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={profileData.notifications.email}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('email', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-white dark:text-white light:text-navy">Weekly Reports</h4>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                        Receive weekly sentiment analysis reports
                      </p>
                    </div>
                    <Switch
                      checked={profileData.notifications.reports}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('reports', checked)
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-white dark:text-white light:text-navy">Tips & Advice</h4>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                        Receive tips on improving sentiment
                      </p>
                    </div>
                    <Switch
                      checked={profileData.notifications.tips}
                      onCheckedChange={(checked) => 
                        handleNotificationChange('tips', checked)
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-blue hover:bg-blue-light text-white ml-auto"
                    onClick={handleSaveProfile}
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-100 border-gray-700 dark:border-gray-700 light:border-gray-300">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-navy">Change Password</CardTitle>
                  <CardDescription className="text-gray-400 dark:text-gray-400 light:text-gray-600">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className="input-field"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className="input-field"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className="input-field"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-blue hover:bg-blue-light text-white ml-auto"
                    onClick={handleSavePassword}
                  >
                    Update Password
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-100 border-gray-700 dark:border-gray-700 light:border-gray-300">
                <CardHeader>
                  <CardTitle className="text-white dark:text-white light:text-navy">Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="text-white dark:text-white light:text-navy">Theme</h4>
                      <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600">
                        Toggle between dark and light mode
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={toggleTheme}
                      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                      className="text-white dark:text-white light:text-navy"
                    >
                      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </Button>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full sm:w-auto mt-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;

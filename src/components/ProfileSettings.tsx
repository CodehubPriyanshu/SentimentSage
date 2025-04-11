
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EyeIcon, EyeOffIcon, ChevronDown, ChevronUp, Bell, Shield } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleToggleChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (value: boolean) => {
    setter(value);
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Bell className="h-5 w-5 text-blue" />
        <CardTitle className="text-white dark:text-white light:text-navy">Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white dark:text-white light:text-navy">Email Notifications</Label>
            <p className="text-gray-400 text-sm">Receive analysis results via email</p>
          </div>
          <Switch 
            checked={emailNotifications}
            onCheckedChange={handleToggleChange(setEmailNotifications)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white dark:text-white light:text-navy">App Notifications</Label>
            <p className="text-gray-400 text-sm">Receive in-app notifications for new analyses</p>
          </div>
          <Switch 
            checked={appNotifications}
            onCheckedChange={handleToggleChange(setAppNotifications)}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-white dark:text-white light:text-navy">Weekly Digest</Label>
            <p className="text-gray-400 text-sm">Get a weekly summary of your analyses</p>
          </div>
          <Switch 
            checked={weeklyDigest}
            onCheckedChange={handleToggleChange(setWeeklyDigest)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Mock successful password change
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Card className="bg-navy-light dark:bg-navy-light light:bg-gray-light">
      <CardHeader className="flex flex-row items-center space-x-2">
        <Shield className="h-5 w-5 text-blue" />
        <CardTitle className="text-white dark:text-white light:text-navy">Security Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-white dark:text-white light:text-navy">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                className="input-field pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-white dark:text-white light:text-navy">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                className="input-field pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-white dark:text-white light:text-navy">
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="input-field pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button type="submit" className="btn-primary w-full">
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ProfileSettings = () => {
  const [notificationsExpanded, setNotificationsExpanded] = useState(true);
  const [securityExpanded, setSecurityExpanded] = useState(true);

  return (
    <div className="space-y-6">
      <div className="card">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setNotificationsExpanded(!notificationsExpanded)}
        >
          <h3 className="text-xl font-bold text-white dark:text-white light:text-navy flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue" />
            Notifications
          </h3>
          <ChevronDown 
            className={`text-white dark:text-white light:text-navy h-5 w-5 transition-transform ${notificationsExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${notificationsExpanded ? 'max-h-96' : 'max-h-0'}`}>
          <div className="p-4">
            <NotificationSettings />
          </div>
        </div>
      </div>
      
      <div className="card">
        <div 
          className="flex justify-between items-center p-4 cursor-pointer"
          onClick={() => setSecurityExpanded(!securityExpanded)}
        >
          <h3 className="text-xl font-bold text-white dark:text-white light:text-navy flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue" />
            Security
          </h3>
          <ChevronDown 
            className={`text-white dark:text-white light:text-navy h-5 w-5 transition-transform ${securityExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${securityExpanded ? 'max-h-[600px]' : 'max-h-0'}`}>
          <div className="p-4">
            <SecuritySettings />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

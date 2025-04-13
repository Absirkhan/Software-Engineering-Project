"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { Shield, Bell, Save, Users, Plus } from 'lucide-react';
import NotificationList from "../../Components/NotificationList";

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    applicationAlerts: true,
    marketingEmails: false,
    jobRenewal: true
  });
  const [successMessage, setSuccessMessage] = useState("");

  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Payments", icon: "credit-card", href: "/client_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/client_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch("/get-user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          if (userData.settings) {
            setSettings(userData.settings);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const saveSettings = async () => {
    try {
      // In a real app, you would send the settings to your backend
      // const response = await fetch("/update-settings", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(settings)
      // });
      
      // For demo, we're just showing success
      setSuccessMessage("Settings saved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Settings
          </h1>
          
          <p className="text-textLight mb-6">
            Manage your account settings and preferences
          </p>
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg flex items-center">
              <span className="mr-2">✅</span>
              {successMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-lg text-text">
                    Account Settings
                  </h2>
                </div>
                
                <div className="p-4">
                  <nav className="space-y-1">
                    <a href="#notifications" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-secondary">
                      <Bell size={16} className="mr-3" />
                      Notifications
                    </a>
                    <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-textLight hover:bg-gray-50 hover:text-secondary">
                      <Shield size={16} className="mr-3" />
                      Security
                    </a>
                    <a href="#team" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-textLight hover:bg-gray-50 hover:text-secondary">
                      <Users size={16} className="mr-3" />
                      Team Members
                    </a>
                  </nav>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div id="notifications" className="bg-white rounded-xl shadow-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
                  <Bell size={18} className="mr-2 text-secondary" />
                  Notification Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-text">Email Notifications</h3>
                      <p className="text-xs text-textLight">Receive notifications via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="emailNotifications"
                        checked={settings.emailNotifications}
                        onChange={handleSettingChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-text">Application Alerts</h3>
                      <p className="text-xs text-textLight">Receive alerts when freelancers apply to your jobs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="applicationAlerts"
                        checked={settings.applicationAlerts}
                        onChange={handleSettingChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-text">Job Renewal Reminders</h3>
                      <p className="text-xs text-textLight">Get reminders when your job posts are about to expire</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="jobRenewal"
                        checked={settings.jobRenewal}
                        onChange={handleSettingChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-text">Marketing Emails</h3>
                      <p className="text-xs text-textLight">Receive updates about new features and promotions</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="marketingEmails"
                        checked={settings.marketingEmails}
                        onChange={handleSettingChange}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-6">
                    <button 
                      onClick={saveSettings}
                      className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="security" className="bg-white rounded-xl shadow-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
                  <Shield size={18} className="mr-2 text-secondary" />
                  Security Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-text mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="current-password" className="block text-xs text-textLight mb-1">Current Password</label>
                        <input 
                          type="password" 
                          id="current-password" 
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-xs text-textLight mb-1">New Password</label>
                        <input 
                          type="password" 
                          id="new-password" 
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                          placeholder="Enter your new password"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-xs text-textLight mb-1">Confirm New Password</label>
                        <input 
                          type="password" 
                          id="confirm-password" 
                          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="team" className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
                  <Users size={18} className="mr-2 text-secondary" />
                  Team Members
                </h2>
                
                <div className="mb-4">
                  <p className="text-sm text-textLight">
                    Add team members to help manage your jobs and applications.
                  </p>
                </div>
                
                <div className="mb-4">
                  <button className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex items-center">
                    <Plus size={16} className="mr-2" />
                    Invite Team Member
                  </button>
                </div>
                
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-textLight">
                    You currently have no team members. Invite colleagues to help manage your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <NotificationList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { Shield, Bell, Save, Plus, X, AlertCircle, MessageSquare, BriefcaseIcon } from 'lucide-react';
import NotificationList from "../../Components/NotificationList";
import { Award, ArrowRight, ArrowUp, ArrowDown, Briefcase, Calendar, 
  DollarSign, Eye, FileText, MapPin, SearchX, Tag, UserCheck, 
  Activity, CheckCircle, Clock, Send, Star } from 'lucide-react';
import freelancerRoutes from '../../Components/freelancerRoutes';

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    newJobAlerts: true,
    marketingEmails: false,
    // Add notification channels
    notificationChannels: {
      inApp: true,
      email: true,
      sms: false
    },
    // Add notification types
    notificationTypes: {
      applicationStatusUpdates: true,
      newJobMatches: true,
      messages: true,
      interviewInvitations: true,
      marketingUpdates: false
    }
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [alertPreferences, setAlertPreferences] = useState({ 
    skills: [] as string[], 
    enabled: true 
  });
  const [newSkill, setNewSkill] = useState("");

  const items = freelancerRoutes;
  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch("/get-user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // If user has settings in their data, use those
          if (userData.settings) {
            // Ensure we have the latest structure with defaults for new fields
            setSettings(prev => ({
              ...prev,
              ...userData.settings,
              notificationChannels: {
                ...prev.notificationChannels,
                ...(userData.settings.notificationChannels || {})
              },
              notificationTypes: {
                ...prev.notificationTypes,
                ...(userData.settings.notificationTypes || {})
              }
            }));
          }

          // Fetch alert preferences
          const prefsResponse = await fetch("/get-alert-preferences");
          if (prefsResponse.ok) {
            const prefsData = await prefsResponse.json();
            setAlertPreferences(prefsData);
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
      const response = await fetch("/update-notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setSuccessMessage("Notification preferences saved successfully");
      } else {
        throw new Error("Failed to save settings");
      }
      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !alertPreferences.skills.includes(newSkill.trim())) {
      setAlertPreferences(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setAlertPreferences(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleToggleAlerts = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlertPreferences(prev => ({
      ...prev,
      enabled: e.target.checked
    }));
  };

  const saveAlertPreferences = async () => {
    try {
      const response = await fetch("/update-alert-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertPreferences)
      });
      
      if (response.ok) {
        setSuccessMessage("Job alert preferences saved successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving job alert preferences:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
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
            {/* Sidebar navigation */}
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
                    <a href="#jobAlerts" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-textLight hover:bg-gray-50 hover:text-secondary">
                      <Bell size={16} className="mr-3" />
                      Job Alerts
                    </a>
                    <a href="#security" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg text-textLight hover:bg-gray-50 hover:text-secondary">
                      <Shield size={16} className="mr-3" />
                      Security
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
                
                <div className="space-y-6">
                  {/* Notification Channels Section */}
                  <div className="border-b pb-4">
                    <h3 className="text-md font-medium text-text mb-3">Notification Channels</h3>
                    <p className="text-xs text-textLight mb-4">Choose how you want to receive notifications</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-text">In-App Notifications</h4>
                          <p className="text-xs text-textLight">Receive notifications within the platform</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationChannels.inApp}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationChannels: {
                                ...settings.notificationChannels,
                                inApp: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-text">Email Notifications</h4>
                          <p className="text-xs text-textLight">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationChannels.email}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationChannels: {
                                ...settings.notificationChannels,
                                email: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-text">SMS Notifications</h4>
                          <p className="text-xs text-textLight">Receive notifications via text message</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationChannels.sms}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationChannels: {
                                ...settings.notificationChannels,
                                sms: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notification Types Section */}
                  <div>
                    <h3 className="text-md font-medium text-text mb-3">Notification Types</h3>
                    <p className="text-xs text-textLight mb-4">Choose which events you want to be notified about</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <AlertCircle size={16} className="mt-0.5 mr-2 text-secondary" />
                          <div>
                            <h4 className="text-sm font-medium text-text">Application Status Updates</h4>
                            <p className="text-xs text-textLight">When your application status changes</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationTypes.applicationStatusUpdates}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationTypes: {
                                ...settings.notificationTypes,
                                applicationStatusUpdates: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <BriefcaseIcon size={16} className="mt-0.5 mr-2 text-secondary" />
                          <div>
                            <h4 className="text-sm font-medium text-text">New Job Matches</h4>
                            <p className="text-xs text-textLight">When new jobs match your skills</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationTypes.newJobMatches}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationTypes: {
                                ...settings.notificationTypes,
                                newJobMatches: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <MessageSquare size={16} className="mt-0.5 mr-2 text-secondary" />
                          <div>
                            <h4 className="text-sm font-medium text-text">Messages</h4>
                            <p className="text-xs text-textLight">When you receive a new message</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationTypes.messages}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationTypes: {
                                ...settings.notificationTypes,
                                messages: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <Calendar size={16} className="mt-0.5 mr-2 text-secondary" />
                          <div>
                            <h4 className="text-sm font-medium text-text">Interview Invitations</h4>
                            <p className="text-xs text-textLight">When you're invited to an interview</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationTypes.interviewInvitations}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationTypes: {
                                ...settings.notificationTypes,
                                interviewInvitations: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-start">
                          <Bell size={16} className="mt-0.5 mr-2 text-secondary" />
                          <div>
                            <h4 className="text-sm font-medium text-text">Marketing Updates</h4>
                            <p className="text-xs text-textLight">News, updates, and promotions</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={settings.notificationTypes.marketingUpdates}
                            onChange={(e) => setSettings({
                              ...settings,
                              notificationTypes: {
                                ...settings.notificationTypes,
                                marketingUpdates: e.target.checked
                              }
                            })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-6">
                    <button 
                      onClick={saveSettings}
                      className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Save Notification Preferences
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Job Alert Preferences section - keep existing code */}
              <div id="jobAlerts" className="bg-white rounded-xl shadow-card p-6 mb-6">
                <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
                  <Bell size={18} className="mr-2 text-secondary" />
                  Job Alert Preferences
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-text">Real-Time Job Alerts</h3>
                      <p className="text-xs text-textLight">Receive instant notifications when jobs matching your skills are posted</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={alertPreferences.enabled}
                        onChange={handleToggleAlerts}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-text mb-2">Skills for Job Alerts</h3>
                    <p className="text-xs text-textLight mb-3">You'll receive alerts when jobs requiring these skills are posted</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {alertPreferences.skills.map((skill, index) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-full py-1 px-3">
                          <span className="text-sm text-text">{skill}</span>
                          <button 
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                        placeholder="Add a skill (e.g. React, Python, Design)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddSkill}
                        className="px-3 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-6">
                    <button 
                      onClick={saveAlertPreferences}
                      className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Save Alert Preferences
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Security section - keep existing code */}
              <div id="security" className="bg-white rounded-xl shadow-card p-6">
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

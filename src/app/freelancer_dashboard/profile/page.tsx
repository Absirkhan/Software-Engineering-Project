"use client";
import Navbar from "../../Components/navbar";
import ProfileForm from "../../Components/ProfileForm";
import GitHubRepositories from '../../Components/GitHubRepositories';
import React, { useState, useEffect } from "react";
import { Camera, MapPin, Globe, Mail, Phone, Briefcase } from 'lucide-react';

const FreelancerProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const items = [
    { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: "/freelancer_dashboard/profile" },
    { name: "Search Job", icon: "folder", href: "/freelancer_dashboard/searchjob" },
    { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/applications" },
    { name: "Payments", icon: "credit-card", href: "/freelancer_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/freelancer_dashboard/settings" },
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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Freelancer Profile
          </h1>
          
          <p className="text-textLight mb-6">
            Complete your profile to increase your chances of getting hired
          </p>
          
          {loading ? (
            <div className="p-8 text-center text-textLight">
              Loading profile...
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative">
                    <div className="h-32 w-32 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                      {user?.profile?.profilePicture ? (
                        <img 
                          src={user.profile.profilePicture} 
                          alt={user.username} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Briefcase size={48} className="text-gray-400" />
                      )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <Camera size={16} className="text-secondary" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-text">
                      {user?.profile?.fullName || user?.username || 'Your Name'}
                    </h2>
                    
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-textLight">
                      {user?.profile?.contactInfo?.location && (
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1" />
                          {user.profile.contactInfo.location}
                        </div>
                      )}
                      
                      {user?.profile?.contactInfo?.website && (
                        <div className="flex items-center">
                          <Globe size={16} className="mr-1" />
                          <a 
                            href={user.profile.contactInfo.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            {user.profile.contactInfo.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                      
                      {user?.email && (
                        <div className="flex items-center">
                          <Mail size={16} className="mr-1" />
                          <a href={`mailto:${user.email}`} className="text-accent hover:underline">
                            {user.email}
                          </a>
                        </div>
                      )}
                      
                      {user?.profile?.contactInfo?.phone && (
                        <div className="flex items-center">
                          <Phone size={16} className="mr-1" />
                          {user.profile.contactInfo.phone}
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-4 text-text">
                      {user?.profile?.bio || 'Add a professional bio to help clients learn more about your skills and experience.'}
                    </p>
                    
                    {user?.profile?.skills?.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2">
                          {user.profile.skills.map((skill: string, index: number) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-gray-100 text-textLight text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <ProfileForm />

              {/* GitHub Repositories Section */}
              <div className="mt-8">
                <GitHubRepositories />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;

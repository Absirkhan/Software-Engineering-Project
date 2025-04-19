"use client";
import Navbar from "../../../Components/navbar";
import CompanyRatingReviews from "../../../Components/CompanyRatingReviews";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Building, MapPin, Globe, Mail, Phone, Star } from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  username: string;
  email: string;
  profile: {
    fullName: string;
    bio: string;
    skills: string[];
    contactInfo: {
      phone: string;
      location: string;
      website: string;
    };
    profilePicture: string;
  };
  averageRating?: number;
  totalReviews?: number;
}

const ClientProfilePage = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const params = useParams();
  const clientId = params?.id as string;

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
    const fetchClient = async () => {
      if (!clientId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/get-company/${clientId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Also fetch the client's ratings
          const ratingsResponse = await fetch(`/client-ratings/${clientId}`);
          if (ratingsResponse.ok) {
            const ratingsData = await ratingsResponse.json();
            // Combine client data with ratings data
            setClient({
              ...data,
              averageRating: parseFloat(ratingsData.averageRating),
              totalReviews: ratingsData.totalRatings
            });
          } else {
            // Still set client data even if ratings fetch fails
            setClient(data);
          }
        } else {
          const errorData = await response.json().catch(() => null);
          setError(errorData?.error || "Failed to load client profile.");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClient();
  }, [clientId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link
              href="/freelancer_dashboard/applications"
              className="flex items-center text-secondary hover:text-opacity-80"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Applications
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-text mb-2">Client Profile</h1>
          <p className="text-textLight mb-6">View information about this client and their ratings</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg">
              ⚠️ {error}
            </div>
          )}
          
          {loading ? (
            <div className="bg-white p-10 rounded-xl shadow-card flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
            </div>
          ) : client ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="h-24 w-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden mb-4">
                      {client.profile?.profilePicture ? (
                        <img 
                          src={client.profile.profilePicture} 
                          alt={client.username} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building size={36} className="text-gray-400" />
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold text-text">
                      {client.profile?.fullName || client.username}
                    </h2>
                    
                    {client.averageRating && (
                      <div className="flex items-center mt-2">
                        {renderStars(client.averageRating)}
                        <span className="ml-2 text-sm text-textLight">
                          ({client.averageRating.toFixed(1)}) · {client.totalReviews} review{client.totalReviews !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4 mt-6 border-t border-border pt-4">
                    {client.profile?.contactInfo?.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-3 text-textLight" />
                        <span className="text-sm text-text">{client.profile.contactInfo.location}</span>
                      </div>
                    )}
                    
                    {client.email && (
                      <div className="flex items-center">
                        <Mail size={16} className="mr-3 text-textLight" />
                        <a href={`mailto:${client.email}`} className="text-sm text-accent hover:underline">
                          {client.email}
                        </a>
                      </div>
                    )}
                    
                    {client.profile?.contactInfo?.phone && (
                      <div className="flex items-center">
                        <Phone size={16} className="mr-3 text-textLight" />
                        <span className="text-sm text-text">{client.profile.contactInfo.phone}</span>
                      </div>
                    )}
                    
                    {client.profile?.contactInfo?.website && (
                      <div className="flex items-center">
                        <Globe size={16} className="mr-3 text-textLight" />
                        <a 
                          href={client.profile.contactInfo.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-accent hover:underline"
                        >
                          {client.profile.contactInfo.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                  <h2 className="text-xl font-semibold text-text mb-4">About</h2>
                  <p className="text-text">
                    {client.profile?.bio || 'No company description available.'}
                  </p>
                </div>
                
                <CompanyRatingReviews clientId={client.id} />
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl shadow-card text-center">
              <p className="text-textLight">Client not found or you don't have permission to view this profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;

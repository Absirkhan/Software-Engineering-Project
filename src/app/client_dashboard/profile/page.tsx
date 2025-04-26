"use client";
import Navbar from "../../Components/navbar";
import ProfileForm from "../../Components/ProfileForm";
import React, { useState, useEffect } from "react";
import { Camera, Building, MapPin, Globe, Mail, Phone, Award } from 'lucide-react';
import GitHubRepositories from '../../Components/GitHubRepositories';
import RatingStars from "../../Components/RatingStars";
import clientRoutes from "../../Components/clientRoutes";

const ClientProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<any>({
    ratings: [],
    averageRating: 0,
    totalRatings: 0
  });

  // Replace hardcoded items with imported routes
  const items = clientRoutes;
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userResponse = await fetch("/get-user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          
          // Fetch ratings for this client
          if (userData.id) {
            const ratingsResponse = await fetch(`/client-ratings/${userData.id}`);
            if (ratingsResponse.ok) {
              const ratingsData = await ratingsResponse.json();
              setRatings(ratingsData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Company Profile
          </h1>
          
          <p className="text-textLight mb-6">
            Build your company profile to attract qualified freelancers
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
                      {user?.profile?.company?.logo ? (
                        <img 
                          src={`/company-logos/${user.profile.company.logo}`} 
                          alt={user.profile.fullName || user.username} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Building size={48} className="text-gray-400" />
                      )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                      <Camera size={16} className="text-secondary" />
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h2 className="text-2xl font-semibold text-text">
                        {user?.profile?.fullName || user?.username || 'Your Company Name'}
                      </h2>
                      
                      {ratings.totalRatings > 0 && (
                        <div className="flex items-center ml-4">
                          <RatingStars rating={parseFloat(ratings.averageRating)} size={16} />
                          <span className="text-sm text-gray-600 ml-1">
                            ({ratings.averageRating}) · {ratings.totalRatings} reviews
                          </span>
                        </div>
                      )}
                    </div>
                    
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
                      {user?.profile?.bio || 'Add a company description to help freelancers understand your business.'}
                    </p>

                    {user?.profile?.company?.perks && user.profile.company.perks.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Company Perks & Benefits</h3>
                        <div className="flex flex-wrap gap-2">
                          {user.profile.company.perks.map((perk: string, index: number) => (
                            <span 
                              key={index} 
                              className="flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                            >
                              <Award size={12} className="mr-1" />
                              {perk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Show ratings and reviews */}
              {ratings.totalRatings > 0 && (
                <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                  <h3 className="text-lg font-semibold text-text mb-4">Ratings & Reviews</h3>
                  
                  <div className="flex items-center mb-6">
                    <div className="text-4xl font-bold text-text mr-4">
                      {ratings.averageRating}
                    </div>
                    <div>
                      <RatingStars rating={parseFloat(ratings.averageRating)} size={24} />
                      <div className="text-sm text-gray-500 mt-1">
                        Based on {ratings.totalRatings} {ratings.totalRatings === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {ratings.ratings.map((rating: any) => (
                      <div key={rating.id} className="border-t border-gray-100 pt-4">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              {rating.freelancer?.profilePicture ? (
                                <img 
                                  src={rating.freelancer.profilePicture} 
                                  alt={rating.freelancer.username} 
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  {rating.freelancer?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-text">
                                {rating.freelancer?.username || 'Anonymous Freelancer'}
                              </div>
                              <RatingStars rating={rating.stars} size={14} />
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {rating.comment && (
                          <p className="text-textLight text-sm mt-2">
                            {rating.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {user?.profile?.company?.description && (
                <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                  <h3 className="text-lg font-semibold text-text mb-4">About {user?.profile?.fullName || user?.username}</h3>
                  <p className="text-textLight whitespace-pre-line">
                    {user.profile.company.description}
                  </p>
                </div>
              )}
              
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

export default ClientProfilePage;

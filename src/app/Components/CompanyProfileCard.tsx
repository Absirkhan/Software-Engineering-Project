"use client";
import React, { useState, useEffect } from "react";
import { Building, MapPin, Globe, Mail, Award, X } from 'lucide-react';

interface CompanyProfileCardProps {
  companyId: string;
  onClose?: () => void;
}

const CompanyProfileCard: React.FC<CompanyProfileCardProps> = ({ companyId, onClose }) => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/get-company/${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setCompany(data);
        } else {
          setError("Could not load company profile");
        }
      } catch (err) {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyProfile();
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text">Company Profile</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-textLight hover:text-text transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text">Company Profile</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-textLight hover:text-text transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <p className="text-center text-textLight py-6">
          {error || "Company profile not available"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-text">Company Profile</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-textLight hover:text-text transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-shrink-0">
          <div className="h-24 w-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
            {company.profile?.company?.logo ? (
              <img 
                src={`/company-logos/${company.profile.company.logo}`} 
                alt={company.profile?.fullName || company.username} 
                className="h-full w-full object-cover"
              />
            ) : (
              <Building size={36} className="text-gray-400" />
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text mb-1">
            {company.profile?.fullName || company.username}
          </h3>
          
          <div className="flex flex-wrap gap-4 text-sm text-textLight mb-3">
            {company.profile?.contactInfo?.location && (
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {company.profile.contactInfo.location}
              </div>
            )}
            
            {company.profile?.contactInfo?.website && (
              <div className="flex items-center">
                <Globe size={14} className="mr-1" />
                <a 
                  href={company.profile.contactInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {company.profile.contactInfo.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
          
          <p className="text-sm text-textLight mb-4">
            {company.profile?.bio || 'No company overview available.'}
          </p>
        </div>
      </div>

      {company.profile?.company?.description && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-text mb-2">About the Company</h4>
          <p className="text-sm text-textLight whitespace-pre-line">
            {company.profile.company.description}
          </p>
        </div>
      )}

      {company.profile?.company?.perks && company.profile.company.perks.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-text mb-2">Company Perks & Benefits</h4>
          <div className="flex flex-wrap gap-2">
            {company.profile.company.perks.map((perk: string, index: number) => (
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
  );
};

export default CompanyProfileCard;

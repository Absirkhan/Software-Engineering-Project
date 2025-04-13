"use client";
import React, { useState, useEffect } from "react";
import { Save } from 'lucide-react';

const ProfileForm: React.FC = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    bio: '',
    skills: [] as string[],
    contactInfo: {
      phone: '',
      location: '',
      website: ''
    }
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch("/get-profile");
        if (response.ok) {
          const data = await response.json();
          setProfile({
            fullName: data.fullName || '',
            bio: data.bio || '',
            skills: data.skills || [],
            contactInfo: {
              phone: data.contactInfo?.phone || '',
              location: data.contactInfo?.location || '',
              website: data.contactInfo?.website || ''
            }
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch("/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Failed to update profile. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-xl font-semibold text-text mb-6">Edit Profile</h2>
      
      {error && (
        <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-lg" role="alert">
          <span className="mr-2">⚠️</span> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 mb-6 text-green-800 bg-green-100 rounded-lg" role="alert">
          <span className="mr-2">✅</span> {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={profile.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-600 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none resize-none"
              placeholder="Write a short bio about yourself"
              rows={4}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-600 mb-1">
              Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                id="skills"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                placeholder="Add a skill"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button 
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-secondary text-white rounded-lg text-sm hover:bg-buttonHover"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.skills.map((skill, index) => (
                <div 
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-textLight flex items-center"
                >
                  {skill}
                  <button 
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
              {profile.skills.length === 0 && (
                <p className="text-sm text-textLight italic">No skills added yet</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="phone" className="block text-xs text-textLight mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="contactInfo.phone"
                  value={profile.contactInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                  placeholder="Your phone number"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-xs text-textLight mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="contactInfo.location"
                  value={profile.contactInfo.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-xs text-textLight mb-1">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="contactInfo.website"
                  value={profile.contactInfo.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            className={`px-6 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex items-center 
              ${isSubmitting ? 'bg-opacity-80 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            <Save size={16} className="mr-2" />
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;

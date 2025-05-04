'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../../../Components/navbar';
import clientRoutes from '../../../../../Components/clientRoutes';
import { User, Github, Mail, Phone, MapPin, Briefcase, ExternalLink, ArrowLeft, FileText, Book, Award, Loader, LinkIcon, Globe, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

interface Repository {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
}

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  duration: string;
}

interface ApplicantProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  githubUsername: string | null;
  profileImage: string;
  portfolio: string[];
  bio: string;
  status: string;
  appliedDate: string;
  coverLetter: string;
  githubRepositories: Repository[];
}

export default function ApplicantProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { jobId, applicantId } = params;
  
  const [applicant, setApplicant] = useState<ApplicantProfile | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check authorization first
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await fetch('/api/auth/check-client-permission');
        if (response.ok) {
          setIsAuthorized(true);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error checking authorization:', err);
        router.push('/login');
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuthorization();
  }, [router]);

  // Fetch applicant data after authorization check
  useEffect(() => {
    const fetchApplicantDetails = async () => {
      if (!isAuthorized || isAuthChecking) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}/applicants/${applicantId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch applicant details');
        }
        
        const data: ApplicantProfile = await response.json();
        setApplicant(data);
        
        // If GitHub repositories aren't included in the profile data and a GitHub username exists,
        // fetch the repositories separately
        if (data.githubUsername && (!data.githubRepositories || data.githubRepositories.length === 0)) {
          const repoResponse = await fetch(`/api/github/${data.githubUsername}/repos`);
          if (repoResponse.ok) {
            const repoData: Repository[] = await repoResponse.json();
            setRepositories(repoData);
          }
        } else if (data.githubRepositories && data.githubRepositories.length > 0) {
          setRepositories(data.githubRepositories);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantDetails();
  }, [applicantId, jobId, isAuthorized, isAuthChecking]);

  if (isAuthChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-gray-600">Checking permissions...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar initialRole="Client" items={clientRoutes} />
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar initialRole="Client" items={clientRoutes} />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-600 font-medium text-lg">Error loading applicant profile</h3>
            <p className="text-red-500 mt-2">{error}</p>
            <Link href="/client_dashboard" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar initialRole="Client" items={clientRoutes} />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-yellow-600 font-medium text-lg">Applicant not found</h3>
            <p className="text-yellow-700 mt-2">The requested applicant profile could not be found</p>
            <Link href="/client_dashboard" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
              <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar initialRole="Client" items={clientRoutes} />
      
      <div className="flex-1 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link href={`/client_dashboard/jobs/${jobId}/applications`} className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft size={16} className="mr-1" /> Back to Applications
            </Link>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-800">Applicant Profile</h1>
              <p className="text-gray-500">Applied on {formatDate(applicant.appliedDate)}</p>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Profile Summary */}
                <div className="md:w-1/3">
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4">
                      {applicant.profileImage ? (
                        <img 
                          src={applicant.profileImage} 
                          alt={applicant.name} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <User size={48} />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-center">{applicant.name}</h2>
                    <p className="text-gray-600 text-center">{applicant.title}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-5 space-y-4">
                    <div className="flex items-center">
                      <Mail size={18} className="text-gray-500 mr-2" />
                      <span className="text-gray-800">{applicant.email}</span>
                    </div>
                    
                    {applicant.phone && (
                      <div className="flex items-center">
                        <Phone size={18} className="text-gray-500 mr-2" />
                        <span className="text-gray-800">{applicant.phone}</span>
                      </div>
                    )}
                    
                    {applicant.location && (
                      <div className="flex items-center">
                        <MapPin size={18} className="text-gray-500 mr-2" />
                        <span className="text-gray-800">{applicant.location}</span>
                      </div>
                    )}
                    
                    {applicant.githubUsername && (
                      <div className="flex items-center">
                        <Github size={18} className="text-gray-500 mr-2" />
                        <a 
                          href={`https://github.com/${applicant.githubUsername}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {applicant.githubUsername}
                        </a>
                      </div>
                    )}

                    {applicant.portfolio && applicant.portfolio.length > 0 && (
                      <div className="flex items-start">
                        <Globe size={18} className="text-gray-500 mr-2 mt-1" />
                        <div className="flex flex-col gap-2">
                          {applicant.portfolio.map((link, index) => (
                            <a 
                              key={index} 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              {link} <ExternalLink size={14} className="ml-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-5">
                    <h3 className="font-semibold text-gray-800 mb-3">Application Status</h3>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                      ${applicant.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      applicant.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}">
                      {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                    </div>
                  </div>

                  {applicant.skills && applicant.skills.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-5">
                      <h3 className="font-semibold text-gray-800 mb-3">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {applicant.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Column - Detailed Info */}
                <div className="md:w-2/3">
                  {applicant.bio && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">About</h3>
                      <p className="text-gray-700 whitespace-pre-line">{applicant.bio}</p>
                    </div>
                  )}
                  
                  {applicant.coverLetter && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center">
                        <FileText size={18} className="mr-2" />
                        Cover Letter
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-line">{applicant.coverLetter}</p>
                      </div>
                    </div>
                  )}
                  
                  {applicant.experience && applicant.experience.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center">
                        <Briefcase size={18} className="mr-2" />
                        Experience
                      </h3>
                      <div className="space-y-5">
                        {applicant.experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4 py-1">
                            <h4 className="font-medium text-gray-800">{exp.role}</h4>
                            <div className="text-gray-600">{exp.company}</div>
                            <div className="text-sm text-gray-500">{exp.duration}</div>
                            {exp.description && (
                              <p className="text-gray-600 mt-2">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {applicant.education && applicant.education.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center">
                        <Book size={18} className="mr-2" />
                        Education
                      </h3>
                      <div className="space-y-5">
                        {applicant.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4 py-1">
                            <h4 className="font-medium text-gray-800">{edu.degree} in {edu.field}</h4>
                            <div className="text-gray-600">{edu.institution}</div>
                            <div className="text-sm text-gray-500">{edu.duration}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* GitHub repositories */}
                  {repositories.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center">
                        <Github size={18} className="mr-2" />
                        GitHub Repositories
                      </h3>
                      <div className="space-y-4">
                        {repositories.map((repo, index) => (
                          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                            <div className="flex justify-between items-start">
                              <a 
                                href={repo.html_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-medium text-blue-600 hover:underline flex items-center"
                              >
                                {repo.name}
                                <ExternalLink size={14} className="ml-1" />
                              </a>
                              <div className="flex items-center text-amber-500">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {repo.stargazers_count}
                              </div>
                            </div>
                            {repo.description && (
                              <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                              {repo.language && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {repo.language}
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                <Calendar size={12} className="inline mr-1" />
                                Updated {new Date(repo.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
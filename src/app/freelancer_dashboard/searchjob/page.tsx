"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { Search, Briefcase, MapPin, DollarSign, Filter } from 'lucide-react';
import Link from "next/link";
import SaveJobButton from "../../Components/SaveJobButton";

const SearchJobPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    salary: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const items = [
    { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: "/freelancer_dashboard/profile" },
    { name: "Search Jobs", icon: "search", href: "/freelancer_dashboard/searchjob" },
    { name: "Saved Jobs", icon: "bookmark", href: "/freelancer_dashboard/saved_jobs" },
    { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/applications" },
    { name: "Payments", icon: "credit-card", href: "/freelancer_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/freelancer_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];
  
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await fetch("/get-jobs");
        if (response.ok) {
          const data = await response.json();
          // Only show active jobs
          const activeJobs = data.filter((job: any) => job.status === 'active');
          setJobs(activeJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Format date to human readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No deadline';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to parse salary range for filtering
  const parseRangeValue = (range: string): number => {
    if (!range) return 0;
    const match = range.match(/\$(\d+),?(\d*)k?/i);
    if (match) {
      return parseInt(match[1] + (match[2] || '000'));
    }
    return 0;
  };

  const filteredJobs = jobs.filter(job => {
    // Search term filter
    const matchesSearchTerm = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = filters.type === '' || job.type === filters.type;
    
    // Location filter
    const matchesLocation = filters.location === '' || job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    // Salary filter (requires string parsing)
    const matchesSalary = filters.salary === '' || 
      filters.salary === "Under $50K" && parseRangeValue(job.salaryRange) < 50000 ||
      filters.salary === "$50K-$100K" && parseRangeValue(job.salaryRange) >= 50000 && parseRangeValue(job.salaryRange) < 100000 ||
      filters.salary === "$100K-$150K" && parseRangeValue(job.salaryRange) >= 100000 && parseRangeValue(job.salaryRange) < 150000 ||
      filters.salary === "$150K+" && parseRangeValue(job.salaryRange) >= 150000;
    
    return matchesSearchTerm && matchesType && matchesLocation && matchesSalary;
  });

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text mb-2">
                Find Jobs
              </h1>
              <p className="text-textLight">
                Discover opportunities that match your skills
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search jobs by title, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border text-sm text-text bg-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" size={20} />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-border rounded-lg text-textLight hover:text-text focus:outline-none"
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>
            </div>
            
            {showFilters && (
              <div className="mt-4 p-4 bg-white border border-border rounded-lg">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="type-filter" className="block text-sm font-medium text-textLight mb-1">Job Type</label>
                    <select
                      id="type-filter"
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white"
                    >
                      <option value="">All Types</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label htmlFor="location-filter" className="block text-sm font-medium text-textLight mb-1">Location</label>
                    <input
                      type="text"
                      id="location-filter"
                      placeholder="Filter by location..."
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label htmlFor="salary-filter" className="block text-sm font-medium text-textLight mb-1">Salary Range</label>
                    <select
                      id="salary-filter"
                      value={filters.salary}
                      onChange={(e) => setFilters({...filters, salary: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white"
                    >
                      <option value="">All Ranges</option>
                      <option value="Under $50K">Under $50K</option>
                      <option value="$50K-$100K">$50K - $100K</option>
                      <option value="$100K-$150K">$100K - $150K</option>
                      <option value="$150K+">$150K+</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setFilters({ type: '', location: '', salary: '' })}
                    className="px-3 py-1 text-sm text-secondary hover:text-opacity-80"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job, index) => (
                <div key={index} className="bg-white rounded-xl shadow-card p-5">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-text mb-2">
                        {job.title}
                      </h2>
                      <div className="mb-3">
                        <span className="text-sm text-textLight">{job.client?.username || 'Unknown Company'}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="flex items-center text-sm text-textLight">
                          <Briefcase size={16} className="mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center text-sm text-textLight">
                          <MapPin size={16} className="mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-sm text-accent">
                          <DollarSign size={16} className="mr-1" />
                          {job.salaryRange}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 flex items-center gap-2">
                      <SaveJobButton jobId={job.id} className="mr-2" />
                      <Link 
                        href={`/freelancer_dashboard/searchjob/${job.id}`}
                        className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all inline-block"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-textLight line-clamp-3">
                    {job.description}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {job.skills.split(',').slice(0, 3).map((skill: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 bg-gray-100 text-textLight text-xs rounded-full"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                      {job.skills.split(',').length > 3 && 
                        <span className="px-2 py-1 bg-gray-100 text-textLight text-xs rounded-full">
                          +{job.skills.split(',').length - 3} more
                        </span>
                      }
                    </div>
                    <div className="text-xs text-textLight mt-2 md:mt-0">
                      Deadline: {formatDate(job.applicationDeadline)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-card p-10 text-center">
              <h2 className="text-xl font-semibold text-text mb-2">No Jobs Found</h2>
              <p className="text-textLight">
                We couldn't find any jobs matching your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchJobPage;

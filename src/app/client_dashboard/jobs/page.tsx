"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { Eye } from 'lucide-react';
import JobFilterBar from "../../Components/JobFilterBar";
import clientRoutes from "@/app/Components/clientRoutes";
import Link from "next/link";

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string | number>>({
    type: '',
    location: '',
    minSalary: '',
    maxSalary: '',
  });

  const items = clientRoutes;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await fetch("/get-user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const response = await fetch("/get-jobs");
          if (response.ok) {
            const allJobs = await response.json();
            const clientJobs = allJobs.filter((job: any) =>
              job.client && job.client.email === userData.email
            );
            setJobs(clientJobs);
          } else {
            console.error("Failed to fetch jobs:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to parse salary value and remove commas
  const parseSalaryValue = (range: string): number => {
    // assume salary is in form 100,000

    return parseInt(range.replace(/,/g, ''), 10);

  };

  const filterOptions = [
    {
      label: "Job Type",
      options: ["Full-time", "Part-time", "Contract", "Temporary"],
      filterKey: "type",
    },
    {
      label: "Location",
      options: Array.from(new Set(jobs.map(job => job.location))),
      filterKey: "location",
    },
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearchTerm = searchTerm === '' ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filters.type === '' || job.type === filters.type;

    const matchesLocation = filters.location === '' || job.location === filters.location;

    const jobSalary = parseSalaryValue(job.salaryRange);
    
    const matchesSalary =
      (filters.minSalary === '' || Number(jobSalary) >= Number(filters.minSalary)) &&
      (filters.maxSalary === '' || Number(jobSalary) <= Number(filters.maxSalary));

    return matchesSearchTerm && matchesType && matchesLocation && matchesSalary;
  });

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">All Jobs</h1>
          <p className="text-textLight mb-6">Manage and track all your posted job listings</p>
          <JobFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
          />
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-textLight">Loading jobs...</div>
            ) : filteredJobs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-text border-b border-border">Title</th>
                      <th className="p-4 text-left font-semibold text-text border-b border-border">Type</th>
                      <th className="p-4 text-left font-semibold text-text border-b border-border">Location</th>
                      <th className="p-4 text-left font-semibold text-text border-b border-border">Salary</th>
                      <th className="p-4 text-left font-semibold text-text border-b border-border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4 font-medium text-text border-b border-border">{job.title}</td>
                        <td className="p-4 text-textLight border-b border-border">{job.type}</td>
                        <td className="p-4 text-textLight border-b border-border">{job.location}</td>
                        <td className="p-4 text-textLight border-b border-border">{job.salaryRange}</td>
                        <td className="p-4 border-b border-border">
                          <div className="flex items-center">
                            <button className="flex items-center space-x-1 p-2 text-secondary hover:bg-gray-100 rounded-md transition-colors">
                              <Eye size={16} />
                              <span>{job.applyClicks || 0} clicks</span>
                            </button>
                            <Link
                              href={`/client_dashboard/jobs/${job.id}/applications`}
                              className="ml-6 px-4 py-2 border border-secondary text-secondary rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                            >
                              View Applications
                            </Link>
                            <Link
                              href={`/client_dashboard/jobs/${job.id}`}
                              className="ml-6 px-4 py-2 border border-secondary text-secondary rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
                            >
                              Edit Job
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-textLight">
                No jobs found.
                <a href="/client_dashboard/createjob" className="text-secondary font-medium ml-1 no-underline">
                  Create a new job posting
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;

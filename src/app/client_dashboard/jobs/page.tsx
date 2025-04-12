"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { colors, shadows } from '../../Components/colors';
import { Search, Filter, Eye } from 'lucide-react';

const JobsPage = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Payments", icon: "credit-card", href: "/client/payments" },
    { name: "Settings", icon: "settings", href: "/client/settings" },
    { name: "Logout", icon: "logout", href: "/logout" }
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/get-jobs");
        if (response.ok) {
          const jobData = await response.json();
          setJobs(jobData);
        } else {
          console.error("Failed to fetch jobs:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredJobs = searchTerm
    ? jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : jobs;
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div style={{
        flex: 1,
        padding: '2rem',
        backgroundColor: '#f8fafc',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '0.5rem'
          }}>
            All Jobs
          </h1>
          
          <p style={{
            color: colors.textLight,
            marginBottom: '1.5rem'
          }}>
            Manage and track all your posted job listings
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              position: 'relative',
              maxWidth: '400px',
              width: '100%'
            }}>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px 10px 40px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  fontSize: '0.95rem',
                  color: colors.text,
                  backgroundColor: colors.primary,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
              />
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textLight
                }}
              />
            </div>
            
            <div>
              <button style={{
                backgroundColor: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Filter size={16} />
                Filter
              </button>
            </div>
          </div>
          
          <div style={{
            backgroundColor: colors.primary,
            borderRadius: '12px',
            boxShadow: shadows.card,
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: colors.textLight
              }}>
                Loading jobs...
              </div>
            ) : filteredJobs.length > 0 ? (
              <div style={{
                overflowX: 'auto'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.95rem'
                }}>
                  <thead style={{
                    backgroundColor: colors.tableHeader
                  }}>
                    <tr>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        color: colors.text,
                        fontWeight: 600,
                        borderBottom: `1px solid ${colors.border}`
                      }}>
                        Title
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        color: colors.text,
                        fontWeight: 600,
                        borderBottom: `1px solid ${colors.border}`
                      }}>
                        Type
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        color: colors.text,
                        fontWeight: 600,
                        borderBottom: `1px solid ${colors.border}`
                      }}>
                        Location
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        color: colors.text,
                        fontWeight: 600,
                        borderBottom: `1px solid ${colors.border}`
                      }}>
                        Salary
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        color: colors.text,
                        fontWeight: 600,
                        borderBottom: `1px solid ${colors.border}`
                      }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job, index) => (
                      <tr key={index} style={{
                        backgroundColor: index % 2 === 0 ? colors.tableRow : colors.tableRowAlt,
                        transition: 'background-color 0.2s'
                      }}>
                        <td style={{
                          padding: '1rem',
                          color: colors.text,
                          fontWeight: 500,
                          borderBottom: `1px solid ${colors.tableBorder}`
                        }}>
                          {job.title}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: colors.textLight,
                          borderBottom: `1px solid ${colors.tableBorder}`
                        }}>
                          {job.type}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: colors.textLight,
                          borderBottom: `1px solid ${colors.tableBorder}`
                        }}>
                          {job.location}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: colors.textLight,
                          borderBottom: `1px solid ${colors.tableBorder}`
                        }}>
                          {job.salaryRange}
                        </td>
                        <td style={{
                          padding: '1rem',
                          borderBottom: `1px solid ${colors.tableBorder}`
                        }}>
                          <button style={{
                            backgroundColor: 'transparent',
                            color: colors.secondary,
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.2s'
                          }}>
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: colors.textLight
              }}>
                No jobs found. 
                <a href="/client_dashboard/createjob" style={{
                  color: colors.secondary,
                  textDecoration: 'none',
                  marginLeft: '4px',
                  fontWeight: 500
                }}>
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

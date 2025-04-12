"use client";
import Navbar from "../../Components/navbar";
import React, { useState, useEffect } from "react";
import { colors, shadows } from '../../Components/colors';

const ProfilePage = () => {
  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Payments", icon: "credit-card", href: "/client/payments" },
    { name: "Settings", icon: "settings", href: "/client/settings" },
    { name: "Logout", icon: "logout", href: "/logout" }
  ];

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [projects, setProjects] = useState<{ name: string; html_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const emailResponse = await fetch("/get-user");
        const emailData = await emailResponse.json();
        setEmail(emailData.email);
        setUsername(emailData.username);
        setProjects(emailData.projects || []);
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
      
      <div style={{
        flex: 1,
        padding: '2rem',
        backgroundColor: '#f8fafc',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: '1.5rem'
          }}>
            Your Profile
          </h1>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{
              backgroundColor: colors.primary,
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: shadows.card,
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.text,
                marginBottom: '1.5rem',
                borderBottom: `1px solid ${colors.border}`,
                paddingBottom: '0.75rem'
              }}>
                Account Information
              </h2>
              
              {loading ? (
                <div style={{ color: colors.textLight }}>Loading account information...</div>
              ) : (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: colors.textLight,
                      marginBottom: '0.25rem'
                    }}>
                      Username
                    </label>
                    <p style={{
                      fontSize: '1rem',
                      color: colors.text,
                      fontWeight: 500
                    }}>
                      {username || 'Not available'}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      color: colors.textLight,
                      marginBottom: '0.25rem'
                    }}>
                      Email Address
                    </label>
                    <p style={{
                      fontSize: '1rem',
                      color: colors.text,
                      fontWeight: 500
                    }}>
                      {email || 'Not available'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{
              backgroundColor: colors.primary,
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: shadows.card,
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.text,
                marginBottom: '1.5rem',
                borderBottom: `1px solid ${colors.border}`,
                paddingBottom: '0.75rem'
              }}>
                Account Settings
              </h2>
              
              <div>
                <button style={{
                  backgroundColor: 'transparent',
                  color: colors.secondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  marginRight: '0.75rem',
                  transition: 'all 0.2s ease',
                }}>
                  Change Password
                </button>
                
                <button style={{
                  backgroundColor: 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
          
          {projects && projects.length > 0 && (
            <div style={{
              backgroundColor: colors.primary,
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: shadows.card,
              marginTop: '1.5rem',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: colors.text,
                marginBottom: '1.5rem',
                borderBottom: `1px solid ${colors.border}`,
                paddingBottom: '0.75rem'
              }}>
                GitHub Projects
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {projects.slice(0, 4).map((project, index) => (
                  <a 
                    key={index}
                    href={project.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '1rem',
                      borderRadius: '6px',
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 500,
                      marginBottom: '0.25rem'
                    }}>
                      {project.name}
                    </div>
                  </a>
                ))}
                
                {projects.length > 4 && (
                  <div style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    border: `1px dashed ${colors.border}`,
                    color: colors.textLight,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontWeight: 500 }}>
                      +{projects.length - 4} more projects
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

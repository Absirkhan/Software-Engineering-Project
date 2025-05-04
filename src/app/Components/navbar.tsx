"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import freelancerRoutes from './freelancerRoutes';
import {
  Home,
  User,
  Folder,
  File,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  MessageSquare,
  Briefcase,
  Search,
  Clock,
  Calendar,
  Award,
  DollarSign,
  FileText,
  Star,
  CheckCircle
} from 'lucide-react';

interface NavbarProps {
  initialRole?: 'Client' | 'Freelancer';
  items: NavItem[];
}

type NavItem = {
  name: string;
  icon: string;
  href: string;
};

const iconMap = {
  home: Home,
  user: User,
  folder: Folder,
  file: File,
  "credit-card": CreditCard,
  settings: Settings,
  logout: LogOut,
  briefcase: Briefcase,
  search: Search,
  applications: FileText,
  jobs: File,
  "create-job": Folder,
  createjob: Folder,
  payments: DollarSign,
  profile: User,
  "search-job": Search,
  searchjob: Search,
  dashboard: Home,
  interviews: Calendar,
  chat: MessageSquare,
  notifications: Bell,
  reviews: Star,
  earnings: DollarSign,
  statistics: CheckCircle,
  completed: CheckCircle,
  schedule: Clock,
  bookmark: Star, // Added for Saved Jobs route
  "saved_jobs": Star, // Alternative mapping
};

export default function Navbar({ initialRole = 'Client', items }: NavbarProps) {
  const [role, setRole] = useState<'Client' | 'Freelancer'>(initialRole);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  
  // Placeholder for role toggle - now just logs action without changing anything
  const toggleRole = () => {
    console.log("Role button clicked, but functionality is disabled");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Fetch notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/get-notifications");
        if (response.ok) {
          const data = await response.json();
          const unreadCount = data.filter((n: any) => !n.isRead).length;
          setNotificationCount(unreadCount);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Set default notification count if fetch fails
        setNotificationCount(0);
      }
    };
    
    fetchNotifications();
    
    // Set up polling for notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Improved function to check if a route is active
  const isRouteActive = (href: string): boolean => {
    // Extract the base path for comparison (avoid double slashes)
    const formattedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const formattedHref = href.endsWith('/') ? href.slice(0, -1) : href;
    
    // Direct match
    if (formattedPathname === formattedHref) return true;
    
    // Compare the last part of the URL for profile, settings, etc.
    const pathnameSegments = formattedPathname.split('/');
    const hrefSegments = formattedHref.split('/');
    
    // If the last segment matches (e.g., "profile" in "/freelancer_dashboard/profile")
    const lastSegmentMatch = pathnameSegments[pathnameSegments.length - 1] === hrefSegments[hrefSegments.length - 1];
    
    // Handle special case for dashboard
    if (href === '/dashboard' || href === '/') {
      // Check if we're on any dashboard path
      const isDashboardPath = formattedPathname === '/dashboard' || 
                              formattedPathname === '/client_dashboard' || 
                              formattedPathname === '/freelancer_dashboard';
      
      if (isDashboardPath) return true;
    }
    
    // For paths like /profile, /settings, /jobs, etc.
    // Match if the last segment is the same, regardless of prefix
    if (hrefSegments.length === 2 && hrefSegments[1] !== '' && lastSegmentMatch) {
      return true;
    }
    
    return false;
  };

  return (
    <>
      <nav className= " max-w-20xl bg-gradient-to-r from-white to-blue-50 shadow-md sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Logo and mobile menu button */}
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 flex items-center mr-4">
          <Link href="/" className="text-primary text-xl font-bold">
            <span className="flex items-center">
              <Briefcase className="mr-2 text-primary" size={20} /> 
              Intelli<span className="text-accent font-bold">Hire</span>
            </span>
          </Link>
              </div>
              
              <button 
          onClick={toggleMenu} 
          className="ml-4 md:hidden inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-primary hover:bg-opacity-10 focus:outline-none transition-all duration-200"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
              >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6 whitespace-nowrap overflow-x-auto">
              {items.map((item) => {
          const isActive = isRouteActive(item.href);
          const IconComponent = iconMap[item.icon as keyof typeof iconMap];
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onMouseEnter={() => setIsHovered(item.name)}
              onMouseLeave={() => setIsHovered(null)}
              className={`
                flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                ${isActive 
            ? 'bg-primary bg-opacity-10 text-primary border-b-2 border-primary' 
            : isHovered === item.name 
              ? 'bg-primary bg-opacity-5 text-primary' 
              : 'text-gray-600 hover:bg-primary hover:bg-opacity-5 hover:text-primary'
                }
              `}
            >
              {IconComponent && (
                <IconComponent
            size={16}
            className={`mr-2 ${isActive ? 'text-primary' : 'text-gray-500'}`}
                />
              )}
              {item.name}
            </Link>
          );
              })}
            </div>
            
            {/* Right side icons and role display */}
            <div className="flex items-center space-x-4">
              {/* Messages Icon */}
              <Link 
          href="/chat" 
          className="p-2 rounded-full text-gray-600 hover:bg-primary hover:bg-opacity-5 hover:text-primary transition-colors"
              >
          <MessageSquare size={20} />
              </Link>
              
              {/* Notifications Icon */}
              <Link 
          href={role === 'Freelancer' ? "/freelancer_dashboard/settings" : "/client_dashboard/settings"} 
          className="relative p-2 rounded-full text-gray-600 hover:bg-primary hover:bg-opacity-5 hover:text-primary transition-colors"
              >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium shadow-sm">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
              </Link>
              
              {/* Role Indicator - Now just displays current role */}
              <button 
          onClick={toggleRole}
          className="ml-2 px-4 py-1.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm"
              >
          {role}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-white shadow-lg rounded-b-lg animate-fadeIn">
          {/* Mobile menu items */}
          <div className="pt-2 pb-3 space-y-1">
            {items.map((item) => {
              const isActive = isRouteActive(item.href);
              const IconComponent = iconMap[item.icon as keyof typeof iconMap];
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary bg-opacity-5 text-primary border-l-4 border-primary' 
                      : 'text-gray-700 hover:bg-primary hover:bg-opacity-5'
                    }
                  `}
                  onClick={() => setMenuOpen(false)}
                >
                  {IconComponent && (
                    <IconComponent
                      size={18}
                      className={`mr-3 ${isActive ? 'text-primary' : 'text-gray-500'}`}
                    />
                  )}
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile menu bottom section */}
          <div className="border-t border-gray-200 pt-4 pb-3 bg-gray-50">
            <div className="px-4 flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
                  <span className="text-sm font-medium">{role.charAt(0)}</span>
                </span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{role} Account</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/chat"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:bg-opacity-5 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <MessageSquare size={18} className="mr-3 text-primary" />
                Messages
              </Link>
              <Link
                href="/notifications"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:bg-opacity-5 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <Bell size={18} className="mr-3 text-primary" />
                Notifications
                {notificationCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </Link>
              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:bg-opacity-5 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={18} className="mr-3 text-primary" />
                Settings
              </Link>
              <Link
                href="/auth/logout"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:bg-opacity-5 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <LogOut size={18} className="mr-3 text-primary" />
                Sign out
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

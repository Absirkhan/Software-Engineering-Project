"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
  MessageSquare
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
};

export default function Navbar({ initialRole = 'Client', items }: NavbarProps) {
  const [role, setRole] = useState<'Client' | 'Freelancer'>(initialRole);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  
  const toggleRole = () => {
    if (role === 'Client') {
      router.push('/freelancer_dashboard');
    } else {
      router.push('/client_dashboard');
    }
    setRole((prevRole) => (prevRole === 'Client' ? 'Freelancer' : 'Client'));
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
      }
    };
    
    fetchNotifications();
    
    // Set up polling for notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="flex justify-between items-center w-full px-8 py-4 bg-secondary text-white shadow-nav font-sans z-10 relative">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-white mr-5">WorkConnect</div>
          
          <button 
            onClick={toggleMenu} 
            className="md:hidden bg-transparent border-none text-white cursor-pointer p-1"
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onMouseEnter={() => setIsHovered(item.name)}
                onMouseLeave={() => setIsHovered(null)}
                className={`
                  flex items-center px-5 py-2 text-sm rounded-lg transition-all duration-300 mr-2
                  ${isActive 
                    ? 'bg-white text-secondary font-semibold' 
                    : isHovered === item.name 
                      ? 'bg-opacity-15 bg-white' 
                      : 'bg-transparent'
                  }
                `}
              >
                {IconComponent && (
                  <IconComponent
                    size={18}
                    className={`mr-2 ${isActive ? 'text-secondary' : 'text-white'}`}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="flex items-center">
          <Link href="/chat" className="relative p-2 mr-2 text-textLight hover:text-secondary">
            <MessageSquare size={20} />
            {/* Add this if you want to show unread message count */}
            {/* {unreadMessageCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )} */}
          </Link>
          <Link href={role === 'Client' ? "/client_dashboard/settings" : "/freelancer_dashboard/settings"} className="relative p-2 text-textLight hover:text-secondary">
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {notificationCount}
              </span>
            )}
          </Link>
          <button 
            onClick={toggleRole}
            onMouseEnter={() => setIsHovered('toggle')}
            onMouseLeave={() => setIsHovered(null)}
            className={`
              px-3 py-2 md:px-5 md:py-2.5 rounded-lg border-2 border-white
              ${isHovered === 'toggle' ? 'bg-white bg-opacity-15' : 'bg-transparent'}
              text-white text-sm md:text-base font-medium transition-all duration-300
            `}
          >
            Switch to {role === 'Client' ? 'Freelancer' : 'Client'}
          </button>
        </div>
      </nav>
      
      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="absolute top-[68px] left-0 right-0 bg-white shadow-card p-2 z-50 md:hidden flex flex-col">
          <Link 
            href="/chat"
            className="flex items-center p-3 rounded-lg mb-1 transition-all duration-200 text-text hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <MessageSquare size={20} className="mr-3 text-secondary" />
            Messages
          </Link>
          {items.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`
                  flex items-center p-3 rounded-lg mb-1 transition-all duration-200
                  ${isActive 
                    ? 'bg-secondary text-white font-semibold' 
                    : 'text-text hover:bg-gray-50'
                  }
                `}
                onClick={() => setMenuOpen(false)}
              >
                {IconComponent && (
                  <IconComponent
                    size={20}
                    className={`mr-3 ${isActive ? 'text-white' : 'text-secondary'}`}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

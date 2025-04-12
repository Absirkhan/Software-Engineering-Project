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
  X
} from 'lucide-react';
import { colors, shadows } from './colors';

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
  const [isToggleHovered, setIsToggleHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 769);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  return (
    <>
      <nav 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          padding: '1rem 2rem',
          backgroundColor: colors.secondary,
          color: colors.buttonText,
          boxShadow: shadows.nav,
          fontFamily: "'Poppins', sans-serif",
          position: 'relative',
          zIndex: 1000,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: colors.buttonText,
            marginRight: '20px',
          }}>WorkConnect</div>
          
          <button 
            onClick={toggleMenu} 
            style={{
              display: windowWidth <= 768 ? 'block' : 'none',
              background: 'transparent',
              border: 'none',
              color: colors.buttonText,
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <div style={{
          display: windowWidth <= 768 ? 'none' : 'flex',
          alignItems: 'center',
        }}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onMouseEnter={() => setIsHovered(item.name)}
                onMouseLeave={() => setIsHovered(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.6rem 1.2rem',
                  color: isActive ? colors.secondary : colors.buttonText,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  marginRight: '8px',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? colors.buttonText : isHovered === item.name ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                }}
              >
                {IconComponent && (
                  <IconComponent
                    size={18}
                    style={{
                      color: isActive ? colors.secondary : colors.buttonText,
                      marginRight: '8px',
                      transition: 'color 0.3s ease'
                    }}
                  />
                )}
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}>
          <button 
            onClick={toggleRole} 
            onMouseEnter={() => setIsToggleHovered(true)}
            onMouseLeave={() => setIsToggleHovered(false)}
            style={{
              padding: windowWidth <= 768 ? '0.4rem 0.8rem' : '0.6rem 1.2rem',
              borderRadius: '8px',
              border: `2px solid ${colors.buttonText}`,
              backgroundColor: isToggleHovered ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              color: colors.buttonText,
              fontSize: windowWidth <= 768 ? '0.9rem' : '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: 500,
            }}
          >
            Switch to {role === 'Client' ? 'Freelancer' : 'Client'}
          </button>
        </div>
      </nav>
      
      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '4.2rem',
          left: 0,
          right: 0,
          backgroundColor: colors.primary,
          boxShadow: shadows.card,
          padding: '0.5rem',
          zIndex: 999,
          display: windowWidth <= 768 ? 'flex' : 'none',
          flexDirection: 'column'
        }}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  color: isActive ? colors.buttonText : colors.text,
                  textDecoration: 'none',
                  fontSize: '1rem',
                  borderRadius: '8px',
                  marginBottom: '5px',
                  transition: 'background-color 0.2s',
                  backgroundColor: isActive ? colors.secondary : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
                onClick={() => setMenuOpen(false)}
              >
                {IconComponent && (
                  <IconComponent
                    size={20}
                    style={{
                      color: isActive ? colors.buttonText : colors.secondary,
                      marginRight: '10px'
                    }}
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

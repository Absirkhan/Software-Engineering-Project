"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    initialRole?: 'Client' | 'Freelancer';
}

export default function Navbar({ initialRole = 'Client' }: NavbarProps) {
    const [role, setRole] = useState<'Client' | 'Freelancer'>(initialRole);
    const router = useRouter(); // Call useRouter here

    const toggleRole = () => {
        if (role === 'Client') {
            router.push('/freelancer_dashboard');
        } else {
            router.push('/client_dashboard');
        }
        setRole((prevRole) => (prevRole === 'Client' ? 'Freelancer' : 'Client'));
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.logo}>MyApp</div>
            <div style={styles.toggle}>
                <button onClick={toggleRole} style={styles.toggleButton}>
                    Switch to {role === 'Client' ? 'Freelancer' : 'Client'}
                </button>
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#333',
        color: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    toggle: {
        display: 'flex',
        alignItems: 'center',
    },
    toggleButton: {
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#4f46e5',
        color: '#fff',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
};

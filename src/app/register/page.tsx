'use client';
import React, { useState } from 'react';
import Input from '../Components/input';
import 'bootstrap/dist/css/bootstrap.min.css';
import { colors, shadows } from '../Components/colors';

export default function RegisterPage() {
    const [isHovered, setIsHovered] = useState(false);
    const [isGithubHovered, setIsGithubHovered] = useState(false);

    return (
        <div 
            className="d-flex justify-content-center align-items-center vh-100"
            style={{ 
                background: colors.background, 
                fontFamily: "'Poppins', sans-serif" 
            }}
        >
            <div 
                className="card p-4 shadow"
                style={{ 
                    maxWidth: '450px', 
                    width: '100%',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: colors.primary,
                    boxShadow: shadows.card,
                }}
            >
                <h1
                    className="text-center mb-4 fw-bold"
                    style={{ color: colors.text, fontSize: '28px' }}
                >
                    Create an Account
                </h1>
                <form action="/register" method="POST">
                    <div className="mb-4">
                        <label className="form-label" style={{ color: colors.textLight, fontSize: '14px', fontWeight: 500 }}>
                            Full Name
                        </label>
                        <Input
                            type="text"
                            placeholder="John Doe"
                            name="username"
                            className="form-control"
                            style={{ 
                                borderRadius: '8px',
                                padding: '12px 16px',
                                backgroundColor: colors.primary,
                                border: `1px solid ${colors.border}`,
                                fontSize: '15px'
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label" style={{ color: colors.textLight, fontSize: '14px', fontWeight: 500 }}>
                            Email Address
                        </label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            name="email"
                            className="form-control"
                            style={{ 
                                borderRadius: '8px',
                                padding: '12px 16px',
                                backgroundColor: colors.primary,
                                border: `1px solid ${colors.border}`,
                                fontSize: '15px'
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label" style={{ color: colors.textLight, fontSize: '14px', fontWeight: 500 }}>
                            Password
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••••"
                            name="password"
                            className="form-control"
                            style={{ 
                                borderRadius: '8px',
                                padding: '12px 16px',
                                backgroundColor: colors.primary,
                                border: `1px solid ${colors.border}`,
                                fontSize: '15px'
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label" style={{ color: colors.textLight, fontSize: '14px', fontWeight: 500 }}>
                            Confirm Password
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••••"
                            name="confirmPassword"
                            className="form-control"
                            style={{ 
                                borderRadius: '8px',
                                padding: '12px 16px',
                                backgroundColor: colors.primary,
                                border: `1px solid ${colors.border}`,
                                fontSize: '15px'
                            }}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn w-100 mb-4"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            backgroundColor: isHovered ? colors.buttonHover : colors.secondary,
                            color: colors.buttonText,
                            borderRadius: '8px',
                            border: 'none',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '15px',
                            transition: 'all 0.2s ease',
                            boxShadow: isHovered ? shadows.button : 'none',
                        }}
                    >
                        Create Account
                    </button>
                </form>
                <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1" style={{ borderColor: colors.border }} />
                    <span className="mx-2" style={{ color: colors.textLight, fontSize: '14px' }}>OR</span>
                    <hr className="flex-grow-1" style={{ borderColor: colors.border }} />
                </div>
                <a href='/auth/github' className="text-decoration-none">
                    <button 
                        className="btn w-100 d-flex align-items-center justify-content-center"
                        onMouseEnter={() => setIsGithubHovered(true)}
                        onMouseLeave={() => setIsGithubHovered(false)}
                        style={{
                            backgroundColor: isGithubHovered ? colors.githubButtonHover : colors.githubButton,
                            color: colors.buttonText,
                            borderRadius: '8px',
                            border: 'none',
                            padding: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            boxShadow: isGithubHovered ? shadows.githubButton : 'none',
                        }}
                    >
                        <img
                            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                            alt="GitHub Logo"
                            className="me-2"
                            style={{ width: '20px', height: '20px' }}
                        />
                        Register with GitHub
                    </button>
                </a>
                <div className="text-center mt-4">
                    <span style={{ color: colors.textLight, fontSize: '14px' }}>Already have an account? </span>
                    <a
                        href="/login"
                        className="text-decoration-none"
                        style={{ color: colors.secondary, fontWeight: '600', fontSize: '14px' }}
                    >
                        Sign in
                    </a>
                </div>
            </div>
        </div>
    );
}

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GithubIcon, ArrowRight, UserIcon, KeyIcon, Mail as EnvelopeIcon, BriefcaseIcon } from "lucide-react";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("freelancer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    username: "",
    password: ""
  });
  const router = useRouter();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Username validation
  const validateUsername = (username: string) => {
    // Only alphanumeric characters and underscore, 3-20 chars
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return "Username must be 3-20 characters and contain only letters, numbers and underscores";
    }
    return "";
  };

  // Password validation
  const validatePassword = (password: string) => {
    // At least 8 chars, with at least one letter and one number
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Za-z]/.test(password)) {
      return "Password must contain at least one letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  // Validate inputs when they change
  useEffect(() => {
    if (email) {
      setValidationErrors(prev => ({ ...prev, email: validateEmail(email) }));
    }
    if (username) {
      setValidationErrors(prev => ({ ...prev, username: validateUsername(username) }));
    }
    if (password) {
      setValidationErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }
  }, [email, username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // First validate all fields
    const emailError = validateEmail(email);
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);

    if (emailError || usernameError || passwordError) {
      setValidationErrors({
        email: emailError,
        username: usernameError,
        password: passwordError
      });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          role,
        }),
      });

      if (response.ok) {
        router.push(role === "freelancer" ? "/freelancer_dashboard" : "/client_dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text mb-2">Create an Account</h1>
          <p className="text-textLight">Join the Job Portal today</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-lg" role="alert">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-card">
          <button 
            className="w-full flex items-center justify-center gap-3 p-3 border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors mb-4"
            onClick={() => window.location.href = "/auth/github"}
          >
            <GithubIcon size={18} />
            Register with GitHub
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-sm text-textLight">or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${validationErrors.email ? 'border-red-500' : 'border-border'} rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none`}
                  placeholder="Your email"
                  required
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${validationErrors.username ? 'border-red-500' : 'border-border'} rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none`}
                  placeholder="Choose a username"
                  required
                  disabled={isSubmitting}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]{3,20}"
                  title="Username must be 3-20 characters and contain only letters, numbers and underscores"
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border ${validationErrors.password ? 'border-red-500' : 'border-border'} rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none`}
                  placeholder="Create a password"
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`p-3 rounded-lg flex items-center border ${
                    role === "freelancer"
                      ? "bg-secondary text-white border-secondary"
                      : "border-border hover:bg-gray-50"
                  }`}
                  onClick={() => setRole("freelancer")}
                  disabled={isSubmitting}
                >
                  <BriefcaseIcon 
                    size={18} 
                    className={`mr-2 ${role === "freelancer" ? "text-white" : "text-textLight"}`} 
                  />
                  <span>Freelancer</span>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-lg flex items-center border ${
                    role === "client"
                      ? "bg-secondary text-white border-secondary"
                      : "border-border hover:bg-gray-50"
                  }`}
                  onClick={() => setRole("client")}
                  disabled={isSubmitting}
                >
                  <BuildingIcon 
                    size={18} 
                    className={`mr-2 ${role === "client" ? "text-white" : "text-textLight"}`} 
                  />
                  <span>Client</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all flex items-center justify-center
                ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}
              `}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Registering..."
              ) : (
                <>
                  Create Account <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </button>

            <div className="mt-4 text-xs text-textLight">
              By registering, you agree to our{" "}
              <a href="#" className="text-accent hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-accent hover:underline">
                Privacy Policy
              </a>
              .
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-textLight text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const BuildingIcon = ({ size = 24, className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="2" x2="9" y2="22"></line>
      <line x1="15" y1="2" x2="15" y2="22"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
    </svg>
  );
};

export default RegisterPage;

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, EnvelopeIcon } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // This is a mock implementation
      // In a real app, you would call the backend to initiate the password reset process
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-text mb-2">Reset Password</h1>
          <p className="text-textLight">We'll send you instructions to reset your password</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-card">
          {!success ? (
            <>
              {error && (
                <div className="p-4 mb-6 text-red-800 bg-red-100 rounded-lg" role="alert">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
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
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                      placeholder="Enter your email address"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-all
                    ${isSubmitting ? "opacity-80 cursor-not-allowed" : ""}
                  `}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4 text-green-600">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-text mb-2">Check your email</h3>
              <p className="text-textLight mb-4">
                We've sent instructions to reset your password to {email}
              </p>
              <p className="text-sm text-textLight">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  className="text-accent hover:underline"
                  onClick={() => setSuccess(false)}
                >
                  try again
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-accent hover:underline flex items-center justify-center gap-1">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

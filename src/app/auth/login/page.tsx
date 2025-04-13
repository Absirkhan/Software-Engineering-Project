"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GithubIcon, ArrowRight, KeyIcon, MailIcon } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Redirect based on user role
        if (data.user.role === 'client') {
          router.push("/client_dashboard");
        } else {
          router.push("/freelancer_dashboard");
        }
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-text mb-2">Login</h1>
          <p className="text-textLight">Welcome back to the Job Portal</p>
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
            Login with GitHub
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
                <MailIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textLight" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                  placeholder="Your email"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="mb-6">
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
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none"
                  placeholder="Your password"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mt-2 text-right">
                <Link href="/auth/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
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
                "Logging in..."
              ) : (
                <>
                  Log In <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-textLight text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-accent hover:underline font-medium">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

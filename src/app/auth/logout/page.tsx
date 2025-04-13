"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call logout endpoint
        const response = await fetch("/auth/logout");
        if (response.ok) {
          // Redirect to home page after successful logout
          router.push("/");
        } else {
          console.error("Logout failed");
          // Redirect anyway
          router.push("/");
        }
      } catch (err) {
        console.error("Error during logout:", err);
        // Redirect anyway
        router.push("/");
      }
    };
    
    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto"></div>
        </div>
        <h1 className="text-xl font-medium text-text mb-4">Logging you out...</h1>
        <p className="text-textLight">Please wait while we securely sign you out of your account.</p>
      </div>
    </div>
  );
};

export default LogoutPage;

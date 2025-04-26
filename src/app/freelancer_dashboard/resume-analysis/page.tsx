"use client";
import Navbar from "../../Components/navbar";
import ResumeAnalyzer from "../../../Components/ResumeAnalyzer";
import React from "react";
import { FileText } from 'lucide-react';
import freelancerRoutes from "@/app/Components/freelancerRoutes";

const ResumeAnalysisPage = () => {
  const items = freelancerRoutes; // Use the imported routes for the navbar
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <FileText size={28} className="text-secondary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-text">
                Resume Analysis
              </h1>
              <p className="text-textLight">
                Upload your resume to get AI-powered feedback on how to improve it
              </p>
            </div>
          </div>
          
          <ResumeAnalyzer />
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalysisPage;

"use client";
import Navbar from '../../Components/navbar';
import CreateJobForm from '../../Components/jobform';
import React from "react";
import clientRoutes from '@/app/Components/clientRoutes';
const CreateJobPage = () => {
  const items = clientRoutes;
  
  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      <div className="flex-1">
        <CreateJobForm />
      </div>
    </div>
  );
};

export default CreateJobPage;
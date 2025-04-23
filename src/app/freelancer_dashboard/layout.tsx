"use client";
import React, { useEffect } from 'react';
import JobAlertNotification from '../Components/JobAlertNotification';

export default function FreelancerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <JobAlertNotification />
    </>
  );
}

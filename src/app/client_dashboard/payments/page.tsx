"use client";
import Navbar from "../../Components/navbar";
import React, { useState } from "react";
import { CreditCard, Download, DollarSign, Calendar, ArrowRight, Plus } from 'lucide-react';

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState("billing");

  const items = [
    { name: "Dashboard", icon: "home", href: "/client_dashboard" },
    { name: "Profile", icon: "user", href: "/client_dashboard/profile" },
    { name: "Create Job", icon: "folder", href: "/client_dashboard/createjob" },
    { name: "All Jobs", icon: "file", href: "/client_dashboard/jobs" },
    { name: "Applications", icon: "file-text", href: "/client_dashboard/applications" },
    { name: "Payments", icon: "credit-card", href: "/client_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/client_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];

  // Sample invoice data for demonstration
  const invoices = [
    {
      id: 'inv_001',
      date: '2023-07-15',
      description: 'Monthly Subscription - July 2023',
      amount: 49.99,
      status: 'paid'
    },
    {
      id: 'inv_002',
      date: '2023-06-15',
      description: 'Monthly Subscription - June 2023',
      amount: 49.99,
      status: 'paid'
    },
    {
      id: 'inv_003',
      date: '2023-05-15',
      description: 'Monthly Subscription - May 2023',
      amount: 49.99,
      status: 'paid'
    },
    {
      id: 'inv_004',
      date: '2023-08-15',
      description: 'Monthly Subscription - August 2023',
      amount: 49.99,
      status: 'pending'
    }
  ];

  // Sample payment methods for demonstration
  const paymentMethods = [
    {
      id: 'pm_001',
      type: 'credit_card',
      cardBrand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2024,
      isDefault: true
    },
    {
      id: 'pm_002',
      type: 'credit_card',
      cardBrand: 'Mastercard',
      last4: '5678',
      expiryMonth: 8,
      expiryYear: 2025,
      isDefault: false
    }
  ];

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format amount with currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
            {status}
          </span>
        );
    }
  };

  // Get card icon
  const getCardIcon = (cardBrand: string) => {
    switch (cardBrand.toLowerCase()) {
      case 'visa':
        return <span className="text-blue-600 font-bold">Visa</span>;
      case 'mastercard':
        return <span className="text-orange-600 font-bold">MC</span>;
      case 'amex':
        return <span className="text-blue-800 font-bold">Amex</span>;
      default:
        return <span>{cardBrand}</span>;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar initialRole='Client' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Billing & Payments
          </h1>
          
          <p className="text-textLight mb-6">
            Manage your billing, payment methods, and view invoices
          </p>
          
          <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
            <div className="flex flex-wrap">
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'billing' ? 'text-secondary border-b-2 border-secondary' : 'text-textLight hover:text-text'}`}
                onClick={() => setActiveTab('billing')}
              >
                Billing Overview
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'methods' ? 'text-secondary border-b-2 border-secondary' : 'text-textLight hover:text-text'}`}
                onClick={() => setActiveTab('methods')}
              >
                Payment Methods
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'invoices' ? 'text-secondary border-b-2 border-secondary' : 'text-textLight hover:text-text'}`}
                onClick={() => setActiveTab('invoices')}
              >
                Invoices
              </button>
            </div>
          </div>
          
          {activeTab === 'billing' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-textLight">Current Plan</h3>
                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Active
                    </div>
                  </div>
                  <p className="text-xl font-bold text-text">Business Pro</p>
                  <p className="mt-1 text-sm text-textLight">Billed monthly</p>
                  <div className="mt-2 text-2xl font-bold text-secondary">
                    $49.99/mo
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-white border border-secondary text-secondary rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center">
                    Change Plan
                  </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-textLight">Next Billing</h3>
                    <Calendar size={18} className="text-secondary" />
                  </div>
                  <p className="text-2xl font-bold text-text">Aug 15, 2023</p>
                  <p className="mt-1 text-sm text-textLight">Your card will be charged $49.99</p>
                  <div className="mt-4 flex items-center text-sm">
                    <CreditCard size={16} className="mr-1 text-textLight" />
                    <span className="text-textLight">Visa •••• 4242</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-textLight">Usage</h3>
                    <DollarSign size={18} className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-text">15/30</p>
                  <p className="mt-1 text-sm text-textLight">Active job postings this month</p>
                  <div className="mt-3 h-2 w-full bg-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-secondary rounded" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text mb-4">
                  Plan Features
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="p-1 rounded-full bg-green-100 mr-3">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text">Up to 30 active job postings</h3>
                      <p className="text-xs text-textLight">Post up to 30 jobs simultaneously</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-1 rounded-full bg-green-100 mr-3">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text">Premium Job Listings</h3>
                      <p className="text-xs text-textLight">Higher visibility in search results</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-1 rounded-full bg-green-100 mr-3">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text">Advanced Filters</h3>
                      <p className="text-xs text-textLight">Search for freelancers with specific skills</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-1 rounded-full bg-green-100 mr-3">
                      <Check size={16} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text">Team Collaboration</h3>
                      <p className="text-xs text-textLight">Add up to 5 team members</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 border-t border-border pt-6">
                  <h3 className="text-sm font-medium text-text mb-3">Need a custom plan?</h3>
                  <button className="px-4 py-2 bg-secondary text-white rounded-lg font-medium text-sm hover:bg-buttonHover transition-colors flex items-center">
                    Contact Sales
                    <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'methods' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text">
                  Your Payment Methods
                </h2>
                <button className="flex items-center text-sm font-medium text-white bg-secondary hover:bg-buttonHover px-3 py-2 rounded-lg transition-colors">
                  <Plus size={16} className="mr-1" />
                  Add Payment Method
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
                {paymentMethods.length > 0 ? (
                  <div className="divide-y divide-border">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="p-6 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="p-3 bg-gray-100 rounded-lg mr-4">
                            <CreditCard size={24} className="text-secondary" />
                          </div>
                          
                          <div>
                            <div className="flex items-center mb-1">
                              {getCardIcon(method.cardBrand)}
                              <span className="ml-2 text-text font-medium">
                                •••• {method.last4}
                              </span>
                              {method.isDefault && (
                                <span className="ml-2 px-2 py-1 bg-gray-100 text-textLight rounded text-xs">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-textLight">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <button className="text-sm text-accent hover:text-secondary">
                            Edit
                          </button>
                          <span className="px-2 text-textLight">|</span>
                          <button className="text-sm text-red-500 hover:text-red-700">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-textLight">
                    You don't have any payment methods yet.
                  </div>
                )}
              </div>
              
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="text-lg font-semibold text-text mb-4">
                  Billing Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-text mb-2">Billing Contact</h3>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="font-medium text-text">John Smith</p>
                      <p className="text-sm text-textLight mt-1">billing@company.com</p>
                      <p className="text-sm text-textLight">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-text mb-2">Billing Address</h3>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="font-medium text-text">Company Inc.</p>
                      <p className="text-sm text-textLight mt-1">
                        123 Business Street<br />
                        Suite 100<br />
                        San Francisco, CA 94107<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="px-4 py-2 text-secondary bg-white border border-secondary rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">
                    Update Billing Information
                  </button>
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'invoices' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text">
                  Invoices
                </h2>
                <button className="flex items-center text-xs font-medium text-secondary hover:text-opacity-80">
                  <Download size={14} className="mr-1" />
                  Download All
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  {invoices.length > 0 ? (
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Invoice #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-textLight uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                              {invoice.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                              {formatDate(invoice.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                              {invoice.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                              {formatAmount(invoice.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {getStatusBadge(invoice.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <button className="text-accent hover:text-secondary mr-3">View</button>
                              <button className="text-accent hover:text-secondary">
                                <Download size={14} className="inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-textLight">
                      No invoices found.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;

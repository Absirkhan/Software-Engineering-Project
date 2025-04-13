"use client";
import Navbar from "../../Components/navbar";
import React, { useState } from "react";
import { CreditCard, Download, DollarSign, Calendar, ArrowRight, Plus } from 'lucide-react';

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState("transactions");

  const items = [
    { name: "Dashboard", icon: "home", href: "/freelancer_dashboard" },
    { name: "Profile", icon: "user", href: "/freelancer_dashboard/profile" },
    { name: "Search Job", icon: "folder", href: "/freelancer_dashboard/searchjob" },
    { name: "Applied Jobs", icon: "file", href: "/freelancer_dashboard/applications" },
    { name: "Payments", icon: "credit-card", href: "/freelancer_dashboard/payments" },
    { name: "Settings", icon: "settings", href: "/freelancer_dashboard/settings" },
    { name: "Logout", icon: "logout", href: "/auth/logout" }
  ];

  // Sample transaction data for demonstration
  const transactions = [
    {
      id: 'txn_001',
      date: '2023-07-15',
      description: 'Payment for UI Design Project',
      amount: 1500.00,
      status: 'completed'
    },
    {
      id: 'txn_002',
      date: '2023-06-30',
      description: 'Payment for Web Development',
      amount: 2200.00,
      status: 'completed'
    },
    {
      id: 'txn_003',
      date: '2023-06-15',
      description: 'Payment for Logo Design',
      amount: 500.00,
      status: 'completed'
    },
    {
      id: 'txn_004',
      date: '2023-05-28',
      description: 'Payment for Mobile App Development',
      amount: 3000.00,
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
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
            Completed
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
      <Navbar initialRole='Freelancer' items={items} />
      
      <div className="flex-1 p-8 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text mb-2">
            Payments
          </h1>
          
          <p className="text-textLight mb-6">
            Manage your payments, invoices, and payment methods
          </p>
          
          <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
            <div className="flex flex-wrap">
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'transactions' ? 'text-secondary border-b-2 border-secondary' : 'text-textLight hover:text-text'}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'methods' ? 'text-secondary border-b-2 border-secondary' : 'text-textLight hover:text-text'}`}
                onClick={() => setActiveTab('methods')}
              >
                Payment Methods
              </button>
            </div>
          </div>
          
          {activeTab === 'transactions' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text">
                  Recent Transactions
                </h2>
                <button className="flex items-center text-xs font-medium text-secondary hover:text-opacity-80">
                  <Download size={14} className="mr-1" />
                  Download Statement
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-card overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  {transactions.length > 0 ? (
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
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
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
                              {formatAmount(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {getStatusBadge(transaction.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <button className="text-accent hover:text-secondary">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-textLight">
                      No transactions found.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-textLight">Total Earnings</h3>
                    <DollarSign size={18} className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-text">$7,200.00</p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <span>↑ 12% from last month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-textLight">Pending</h3>
                    <Calendar size={18} className="text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-text">$3,000.00</p>
                  <div className="mt-2 flex items-center text-xs text-textLight">
                    <span>Expected on Aug 15, 2023</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-textLight">This Month</h3>
                    <Calendar size={18} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-text">$1,500.00</p>
                  <div className="mt-2 flex items-center text-xs text-blue-600">
                    <span>↑ 5% from last month</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-textLight">Last Month</h3>
                    <Calendar size={18} className="text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-text">$2,700.00</p>
                  <div className="mt-2 flex items-center text-xs text-purple-600">
                    <span>↑ 8% from previous</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
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
                  Payment Preferences
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-text mb-2">Default Currency</h3>
                    <select className="w-full md:w-1/3 px-3 py-2 text-sm border border-border rounded-lg focus:ring-1 focus:ring-accent focus:border-accent focus:outline-none bg-white">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-text mb-2">Automatic Withdrawals</h3>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer mr-4">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
                      </label>
                      <span className="text-sm text-textLight">Automatically withdraw funds when balance exceeds $100</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-text mb-2">Tax Information</h3>
                    <button className="px-4 py-2 bg-white border border-border text-text rounded-lg font-medium text-sm hover:bg-gray-50 flex items-center">
                      Update Tax Information
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
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

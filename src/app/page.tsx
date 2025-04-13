"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronRight, CheckCircle, Users, Briefcase, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-secondary">
            Job Portal
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-textLight hover:text-secondary">
              Log in
            </Link>
            <Link 
              href="/auth/register" 
              className="bg-secondary hover:bg-buttonHover text-white py-2 px-4 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-br from-secondary/5 to-accent/5 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
              Connect with top talent and opportunities
            </h1>
            <p className="text-xl text-textLight mb-10">
              The job portal that brings together skilled freelancers and clients from around the world to create amazing things.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/register?role=freelancer" 
                className="bg-secondary hover:bg-buttonHover text-white py-3 px-8 rounded-lg text-lg font-medium transition-colors"
              >
                Find work
              </Link>
              <Link 
                href="/auth/register?role=client" 
                className="bg-white border border-secondary hover:bg-gray-50 text-secondary py-3 px-8 rounded-lg text-lg font-medium transition-colors"
              >
                Find talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-text text-center mb-12">
            Why choose our platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-card">
              <div className="bg-secondary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Search size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Find the perfect match</h3>
              <p className="text-textLight mb-4">
                Our advanced matching algorithm connects clients with the freelancers who best fit their project needs.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-card">
              <div className="bg-secondary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Briefcase size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Quality opportunities</h3>
              <p className="text-textLight mb-4">
                Access high-quality job postings from legitimate businesses looking for skilled professionals.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-card">
              <div className="bg-secondary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users size={24} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Community of experts</h3>
              <p className="text-textLight mb-4">
                Join a growing community of freelancers and clients across various industries worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-text text-center mb-4">
            How it works
          </h2>
          <p className="text-textLight text-center max-w-2xl mx-auto mb-12">
            Our platform makes it easy to find work or hire talent
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 gap-8">
              <div className="flex items-start gap-4">
                <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Create your profile</h3>
                  <p className="text-textLight">
                    Sign up as a freelancer or client and create your profile. Showcase your skills or company details to make yourself stand out.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Post a job or browse opportunities</h3>
                  <p className="text-textLight">
                    Clients can post detailed job listings, while freelancers can search and filter jobs that match their skills and preferences.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Apply and hire with confidence</h3>
                  <p className="text-textLight">
                    Freelancers submit tailored applications, and clients can review applications, interview candidates, and choose the perfect match.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Collaborate and succeed</h3>
                  <p className="text-textLight">
                    Work together through our platform, track progress, and build lasting professional relationships.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-text text-center mb-12">
            What our users say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-card">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4">
                  <h4 className="font-medium text-text">Alex Johnson</h4>
                  <p className="text-sm text-textLight">Freelance Developer</p>
                </div>
              </div>
              <p className="text-textLight">
                "I've found consistent high-quality work through this platform. The job matching algorithm actually works, and I've built a great client base."
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-card">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4">
                  <h4 className="font-medium text-text">Sarah Williams</h4>
                  <p className="text-sm text-textLight">Marketing Director</p>
                </div>
              </div>
              <p className="text-textLight">
                "As a client, I've been able to find talented freelancers for our projects quickly. The quality of applicants has consistently exceeded my expectations."
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-card">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="ml-4">
                  <h4 className="font-medium text-text">Michael Chen</h4>
                  <p className="text-sm text-textLight">Graphic Designer</p>
                </div>
              </div>
              <p className="text-textLight">
                "The platform makes it easy to showcase my portfolio and connect with clients who value quality work. I've doubled my freelance income since joining."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of freelancers and clients already using our platform to connect and collaborate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="bg-white hover:bg-gray-100 text-secondary py-3 px-8 rounded-lg text-lg font-medium transition-colors"
            >
              Create an account <ChevronRight size={20} className="ml-1 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-secondary mb-4">Job Portal</h3>
              <p className="text-sm text-textLight">
                Connecting talented professionals with the best opportunities worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-text mb-4">For Freelancers</h4>
              <ul className="text-sm text-textLight space-y-2">
                <li><a href="#" className="hover:text-secondary">Find Jobs</a></li>
                <li><a href="#" className="hover:text-secondary">Create Profile</a></li>
                <li><a href="#" className="hover:text-secondary">Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-text mb-4">For Clients</h4>
              <ul className="text-sm text-textLight space-y-2">
                <li><a href="#" className="hover:text-secondary">Post Jobs</a></li>
                <li><a href="#" className="hover:text-secondary">Find Talent</a></li>
                <li><a href="#" className="hover:text-secondary">Enterprise Solutions</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-text mb-4">Resources</h4>
              <ul className="text-sm text-textLight space-y-2">
                <li><a href="#" className="hover:text-secondary">Help Center</a></li>
                <li><a href="#" className="hover:text-secondary">Blog</a></li>
                <li><a href="#" className="hover:text-secondary">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-textLight mb-4 md:mb-0">
              © {new Date().getFullYear()} Job Portal. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-textLight hover:text-secondary">Terms</a>
              <a href="#" className="text-sm text-textLight hover:text-secondary">Privacy</a>
              <a href="#" className="text-sm text-textLight hover:text-secondary">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


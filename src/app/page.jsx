'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, PackageCheck, BarChart4, Receipt, Printer, Users, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-float-slow"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Liquid Glass Effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`
        }}
      ></div>

      <header className="relative z-10 px-4 py-6 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center group">
              <div className="relative">
                <Store className="h-8 w-8 text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300" />
                <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-xl group-hover:bg-indigo-300/30 transition-all duration-300"></div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                Apni Dukaan
              </span>
            </div>
            <Link 
              href={isLoggedIn ? "/portal/dashboard" : "/login"} 
              className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-20 md:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-indigo-200 text-sm font-medium mb-8 border border-white/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Modern Inventory Management System
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-tight">
              Transform Your
              <br />
              <span className="relative">
                Business
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Streamline your operations with our powerful, AI-driven inventory management system. 
              <span className="text-indigo-300 font-medium"> Built for the future.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link 
                href={isLoggedIn ? "/portal/dashboard" : "/login"} 
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Now
                </span>
              </Link>
              
              <a 
                href="#features" 
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  Explore Features
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </a>
            </div>

            {/* Floating Dashboard Preview */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <PackageCheck className="h-8 w-8 text-indigo-300 mb-4" />
                    <h3 className="text-white font-semibold mb-2">Smart Inventory</h3>
                    <p className="text-slate-300 text-sm">Real-time tracking with AI insights</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <BarChart4 className="h-8 w-8 text-purple-300 mb-4" />
                    <h3 className="text-white font-semibold mb-2">Analytics</h3>
                    <p className="text-slate-300 text-sm">Comprehensive business insights</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/20 to-indigo-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <Shield className="h-8 w-8 text-pink-300 mb-4" />
                    <h3 className="text-white font-semibold mb-2">Secure</h3>
                    <p className="text-slate-300 text-sm">Enterprise-grade security</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 py-20 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Everything you need to manage your business efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: PackageCheck,
                title: 'Smart Inventory Tracking',
                description: 'Real-time inventory management with AI-powered insights and automated stock alerts.',
                gradient: 'from-indigo-500 to-blue-600'
              },
              {
                icon: Receipt,
                title: 'Advanced Sales Management',
                description: 'Process sales with barcode scanning, manage customers, and track purchase history.',
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                icon: BarChart4,
                title: 'Business Analytics',
                description: 'Comprehensive analytics and reports to help you make data-driven decisions.',
                gradient: 'from-pink-500 to-red-600'
              },
              {
                icon: Printer,
                title: 'Barcode Generation',
                description: 'Generate and print industry-standard EAN13 barcodes for all your products.',
                gradient: 'from-green-500 to-teal-600'
              },
              {
                icon: Users,
                title: 'Customer Management',
                description: 'Manage customer database and track purchase history for better service.',
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                icon: Store,
                title: 'Modern Interface',
                description: 'Intuitive, responsive design optimized for efficiency and ease of use.',
                gradient: 'from-teal-500 to-green-600'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
                     style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}></div>
                
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-indigo-200 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="relative bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-12 md:p-16 text-center border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-3xl"></div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
                Join thousands of businesses already using Apni Dukaan to streamline their operations.
              </p>
              
              <Link 
                href={isLoggedIn ? "/portal/dashboard" : "/login"} 
                className="group inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-12 md:px-6 lg:px-8 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Store className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-xl font-bold text-white">Apni Dukaan</span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2025 Apni Dukaan. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
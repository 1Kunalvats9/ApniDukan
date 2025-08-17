'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  PackageCheck,
  BarChart4,
  Receipt,
  Printer,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';
import Lenis from 'lenis';
import { motion } from 'motion/react';

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Animate scroll on each frame
    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);


    }
    animationFrameId = requestAnimationFrame(raf);

    // Check for user login token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Handle mouse move for background gradient effect
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup function to run when the component unmounts
    return () => {
      lenis.destroy();
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-blue-200 text-slate-800">
        {/* Background elements (subtly adjusted for light theme) */}
        <div className="fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/30 to-indigo-500/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-sky-500/30 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-sky-400/30 to-blue-500/30 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div> {/* --- End Background elements --- */}

        {/* Mouse-following spotlight effect */}
        <div
            className="fixed inset-0 pointer-events-none -z-10"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(79, 70, 229, 0.06), transparent 40%)`,
            }}
        ></div>

        {/* Header */}
        <header className="relative z-10 px-4 py-6 md:px-6 lg:px-8">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center group">
              <div className="relative">
                <Store className="h-8 w-8 text-blue-600 group-hover:text-indigo-600 transition-colors duration-300" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Apni Dukaan
            </span>
            </div>
            <Link
                href={isLoggedIn ? '/portal/dashboard' : '/login'}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/25 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 px-4 py-20 md:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-slate-900/5 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-8 border border-slate-900/10">
              <Sparkles className="w-4 h-4 mr-2" />
              Modern Inventory Management System
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent leading-tight">
              Transform Your
              <br />
              <span className="relative bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Business
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
            </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Streamline your operations with our powerful, AI-driven inventory management system.
              <span className="text-blue-700 font-medium"> Built for the future.</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link
                  href={isLoggedIn ? '/portal/dashboard' : '/login'}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
              >
              <span className="relative flex items-center justify-center">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Now
              </span>
              </Link>
              <a
                  className="group px-8 py-4 bg-transparent text-slate-700 rounded-full font-semibold text-lg border border-slate-400 hover:bg-slate-900/5 hover:border-slate-500 transition-all duration-300 hover:scale-105"
              >
              <span className="flex items-center justify-center" id="features">
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              </a>
            </div>
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-900/10 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-900/10">
                    <PackageCheck className="h-8 w-8 text-blue-600 mb-4" />
                    <h3 className="text-slate-800 font-semibold mb-2">Smart Inventory</h3>
                    <p className="text-slate-600 text-sm">Real-time tracking with AI insights</p>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-900/10">
                    <BarChart4 className="h-8 w-8 text-indigo-600 mb-4" />
                    <h3 className="text-slate-800 font-semibold mb-2">Analytics</h3>
                    <p className="text-slate-600 text-sm">Comprehensive business insights</p>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-900/10">
                    <Shield className="h-8 w-8 text-sky-600 mb-4" />
                    <h3 className="text-slate-800 font-semibold mb-2">Secure</h3>
                    <p className="text-slate-600 text-sm">Enterprise-grade security</p>
                  </div>
                </div>
              </div>
            </div>
          </div> {/* --- End container --- */}
        </section> {/* --- End Hero Section --- */}

        {/* Features Section */}
        <section id="features" className="relative z-10 px-4 py-20 md:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-6">
                Powerful Features
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Everything you need to manage your business efficiently
              </p>
            </div>
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: PackageCheck, title: 'Smart Inventory Tracking', description: 'Real-time inventory management with AI-powered insights and automated stock alerts.', gradient: 'from-blue-600 to-sky-600' },
                { icon: Receipt, title: 'Advanced Sales Management', description: 'Process sales with barcode scanning, manage customers, and track purchase history.', gradient: 'from-indigo-500 to-purple-600' },
                { icon: BarChart4, title: 'Business Analytics', description: 'Comprehensive analytics and reports to help you make data-driven decisions.', gradient: 'from-purple-500 to-pink-600' },
                { icon: Printer, title: 'Barcode Generation', description: 'Generate and print industry-standard EAN13 barcodes for all your products.', gradient: 'from-green-500 to-teal-600' },
                { icon: Users, title: 'Customer Management', description: 'Manage customer database and track purchase history for better service.', gradient: 'from-sky-500 to-indigo-600' },
                { icon: Store, title: 'Modern Interface', description: 'Intuitive, responsive design optimized for efficiency and ease of use.', gradient: 'from-teal-500 to-emerald-600' }
              ].map((feature, index) => (
                  <motion.div
                      key={index}
                      className="group relative bg-white/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-900/10 hover:bg-white/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 group-hover:text-blue-700 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
              ))}
            </motion.div>
          </div> {/* --- End container --- */}
        </section> {/* --- End Features Section --- */}

        {/* Call to Action Section */}
        <section className="relative z-10 px-4 py-20 md:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="relative bg-white/50 backdrop-blur-xl rounded-3xl p-12 md:p-16 text-center border border-slate-900/10 shadow-xl">
              <div className="relative">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                  Ready to Transform Your Business?
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                  Join thousands of businesses already using Apni Dukaan to streamline their operations.
                </p>
                <Link
                    href={isLoggedIn ? '/portal/dashboard' : '/login'}
                    className="group inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg hover:bg-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div> {/* --- End container --- */}
        </section> {/* --- End Call to Action Section --- */}

        {/* Footer */}
        <footer className="relative z-10 px-4 py-12 md:px-6 lg:px-8 border-t border-slate-900/10">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Store className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-slate-800">Apni Dukaan</span>
            </div>
            <div className="text-slate-500 text-sm">
              © 2025 Apni Dukaan. All rights reserved.
            </div>
          </div>
        </footer>
      </div> // --- End Root Div ---
  );
};

export default LandingPage;
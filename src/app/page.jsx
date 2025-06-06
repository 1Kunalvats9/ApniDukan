'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, PackageCheck, BarChart4, Receipt, Printer, Users } from 'lucide-react';

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoggedIn(false)
    } else {
      setIsLoggedIn(true)
    }
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="px-4 py-6 md:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-slate-900">Apni Dukaan</span>
            </div>
            {/* ${isLoggedIn ? "/portal/dashboard":"/login"} */}
            <Link href={`/portal/dashboard`} className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-20 md:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Modern Inventory Management
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Streamline your business operations with our powerful, yet easy-to-use inventory management system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={`${isLoggedIn ? "/portal/dashboard":"/login"}`} className="btn btn-primary px-8 py-3 text-base">
              Get Started
            </Link>
            <a href="#features" className="btn btn-outline px-8 py-3 text-base">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-16 md:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-100 rounded-full mb-4">
                <PackageCheck className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inventory Tracking</h3>
              <p className="text-slate-600">
                Keep track of your inventory in real-time with detailed product information and stock levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="p-4 bg-sky-100 rounded-full mb-4">
                <Receipt className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sales Management</h3>
              <p className="text-slate-600">
                Process sales quickly with barcode scanning, manage customer information, and track purchase history.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="p-4 bg-orange-100 rounded-full mb-4">
                <BarChart4 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Analytics</h3>
              <p className="text-slate-600">
                Gain insights into your business performance with comprehensive analytics and reports.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="p-4 bg-green-100 rounded-full mb-4">
                <Printer className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Barcode Generation</h3>
              <p className="text-slate-600">
                Generate and print industry-standard EAN13 barcodes for your products.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="p-4 bg-purple-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Management</h3>
              <p className="text-slate-600">
                Manage your customer database and track their purchase history for better customer service.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card p-6 flex flex-col items-center text-center">
              <div className="p-4 bg-red-100 rounded-full mb-4">
                <Store className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User-Friendly Interface</h3>
              <p className="text-slate-600">
                Modern, intuitive interface designed for ease of use and efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 md:px-6 lg:px-8 bg-indigo-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Optimize Your Business?
          </h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Start using Apni Dukaan today and take control of your inventory.
          </p>
          {/* Use Next.js Link */}
          <Link href="/app/dashboard" className="btn bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 text-base">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 md:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Store className="h-6 w-6 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">Apni Dukaan</span>
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
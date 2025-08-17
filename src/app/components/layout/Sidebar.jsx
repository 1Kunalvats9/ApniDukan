'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; 
import { LayoutDashboard, Package, PlusCircle, Users, ShoppingCart, Printer, BarChart, Store, LogOut, Database, FileText } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const Sidebar= () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname(); 
  const {logout} = useAuth()
  const router = useRouter()
  const handleLogout = () => {
    logout(); 
    router.push('/'); 
  };

  const NavItem = ({ to, icon, label }) => {
    const isActive = pathname === to || (to !== '/portal' && pathname.startsWith(to + '/'));

    return (
      <Link
        href={to}
        className={`
          flex items-center px-4 py-3 text-sm font-medium transition-colors
          ${isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <span className="mr-3">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  };
  return (
    <aside className={`
      bg-white border-r border-slate-200 flex flex-col h-screen transition-all duration-300
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className={`
        flex items-center h-16 border-b border-slate-200 px-4
        ${collapsed ? 'justify-center' : 'justify-between'}
      `}>
        {!collapsed && (
          <div className="flex items-center">
            <Store size={24} className="text-indigo-600 mr-2" />
            <h1 className="text-lg font-bold text-slate-800">Apni Dukaan</h1>
          </div>
        )}
        {collapsed && <Store size={24} className="text-indigo-600" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <NavItem to="/portal/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="/portal/inventory" icon={<Package size={20} />} label="Inventory" />
        <NavItem to="/portal/add-product" icon={<PlusCircle size={20} />} label="Add Product" />
        <NavItem to="/portal/customers" icon={<Users size={20} />} label="Customers" />
        <NavItem to="/portal/sell" icon={<ShoppingCart size={20} />} label="Sell" />
        <NavItem to="/portal/print-barcode" icon={<Printer size={20} />} label="Print Barcode" />
        <NavItem to="/portal/analytics" icon={<BarChart size={20} />} label="Analytics" />
        <NavItem to="/portal/backup" icon={<Database size={20} />} label="Backup & Restore" />
        <NavItem to="/portal/parties" icon={<FileText size={20} />} label="Party Bills" />
        <NavItem to="/portal/accounting" icon={<FileText size={20} />} label="Accounting" />
      </nav>
      <div className='mb-4 ml-2 text-red-600 font-semibold cursor-pointer hover:border-red-500 border border-transparent p-2 duration-200 rounded-lg' onClick={handleLogout}>
        <button className='flex items-center cursor-pointer gap-2'>
          <LogOut /> Logout
        </button>
      </div>
      <div className="border-t border-slate-200 p-4">
        {!collapsed && (
          <div className="text-center">
            <p className="text-xs text-slate-500">Apni Dukaan v1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
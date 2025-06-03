'use client';

import React, { useState } from 'react';
import { Package, DollarSign, ShoppingCart, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import StatCard from '../../components/ui/StatCard';

const Analytics = () => {
  const { products, sales, analytics } = useAppContext();
  const [period, setPeriod] = useState('month');

  const currentDate = new Date();
  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const yearStart = new Date(currentDate.getFullYear(), 0, 1);

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    switch (period) {
      case 'day':
        return saleDate >= dayStart;
      case 'week':
        return saleDate >= weekStart;
      case 'month':
        return saleDate >= monthStart;
      case 'year':
        return saleDate >= yearStart;
      default:
        return true;
    }
  });

  const periodSalesTotal = filteredSales.reduce((total, sale) => total + sale.total, 0);
  const periodCheckouts = filteredSales.length;

  const productSalesMap = new Map();

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSalesMap.get(item.id);
      if (existing) {
        existing.count += item.cartQuantity;
        existing.revenue += item.discountedPrice * item.cartQuantity;
      } else {
        productSalesMap.set(item.id, {
          count: item.cartQuantity,
          revenue: item.discountedPrice * item.cartQuantity,
        });
      }
    });
  });

  const topProducts = Array.from(productSalesMap.entries())
    .map(([id, stats]) => {
      const product = products.find(p => p.id === id);
      return {
        id,
        name: product?.name || 'Unknown Product',
        count: stats.count,
        revenue: stats.revenue,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowStockCount = products.filter(p => p.quantity < 5 && p.quantity > 0).length;

  const outOfStockCount = products.filter(p => p.quantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>

        <div className="flex bg-slate-100 rounded-md p-1">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              period === 'day'
                ? 'bg-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setPeriod('day')}
          >
            Today
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              period === 'week'
                ? 'bg-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setPeriod('week')}
          >
            This Week
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              period === 'month'
                ? 'bg-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setPeriod('month')}
          >
            This Month
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              period === 'year'
                ? 'bg-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setPeriod('year')}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={analytics.totalProducts}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Inventory Worth"
          value={`₹${analytics.inventoryWorth.toFixed(2)}`}
          icon={DollarSign}
          color="secondary"
        />
        <StatCard
          title={`${period === 'day' ? "Today's" : period === 'week' ? "This Week's" : period === 'month' ? "This Month's" : "This Year's"} Sales`}
          value={`₹${periodSalesTotal.toFixed(2)}`}
          icon={ShoppingCart}
          color="success"
        />
        <StatCard
          title={`${period === 'day' ? "Today's" : period === 'week' ? "This Week's" : period === 'month' ? "This Month's" : "This Year's"} Checkouts`}
          value={periodCheckouts}
          icon={TrendingUp}
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Top Selling Products</h2>
          </div>
          <div className="p-0">
            {topProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No sales data available</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {topProducts.map((product, index) => (
                  <li key={product.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-medium">
                        {index + 1}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-slate-500">Sold: {product.count} units</p>
                      </div>
                      <p className="font-semibold text-green-600">₹{product.revenue.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Inventory Status</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <p className="text-yellow-800 font-medium text-sm mb-1">Low Stock Products</p>
                <p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p>
                <p className="text-xs text-yellow-600 mt-1">Less than 5 items in stock</p>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-red-800 font-medium text-sm mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-red-700">{outOfStockCount}</p>
                <p className="text-xs text-red-600 mt-1">Products with zero inventory</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Inventory Distribution</h3>
                <span className="text-sm text-slate-500">Total: {products.length} products</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                <div className="bg-green-500 h-2.5 rounded-full" style={{
                  width: `${products.length ? ((products.length - lowStockCount - outOfStockCount) / products.length) * 100 : 0}%`
                }}></div>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Healthy: {products.length - lowStockCount - outOfStockCount}</span>
                <span>Low: {lowStockCount}</span>
                <span>Out: {outOfStockCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Sales Overview</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Calendar size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-500">Total Checkouts</p>
                <p className="text-xl font-semibold">{analytics.totalCheckouts}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <DollarSign size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-xl font-semibold">₹{analytics.totalSales.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                <TrendingUp size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-500">Today's Income</p>
                <p className="text-xl font-semibold">₹{analytics.todaysIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
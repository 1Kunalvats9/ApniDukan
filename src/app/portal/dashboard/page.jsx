'use client';
import React, { useEffect } from 'react';
import { Package, DollarSign, ShoppingCart, TrendingUp, Users, Clock, Percent, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import StatCard from '../../components/ui/StatCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const { analytics, products, sales } = useAppContext();

  const router = useRouter()
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const lowStockProducts = products
    .filter(product => product.quantity < 5 && product.quantity > 0)
    .slice(0, 5);

  const outOfStockProducts = products
    .filter(product => product.quantity === 0)
    .slice(0, 5);

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if(!token){
      router.push('/')
    }
  },[])
  console.log(analytics,products)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          title="Total Sales"
          value={`₹${analytics.totalSales.toFixed(2)}`}
          icon={ShoppingCart}
          color="success"
        />
        <StatCard
          title="Today's Income"
          value={`₹${analytics.todaysIncome.toFixed(2)}`}
          icon={TrendingUp}
          color="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Link href="/portal/add-product" className="flex items-center justify-center p-4 transition-colors card hover:bg-indigo-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-indigo-600 bg-indigo-100 rounded-full">
              <Package size={24} />
            </div>
            <h3 className="font-medium">Add Product</h3>
          </div>
        </Link>
        <Link href="/portal/sell" className="flex items-center justify-center p-4 transition-colors card hover:bg-sky-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-sky-100 text-sky-600">
              <ShoppingCart size={24} />
            </div>
            <h3 className="font-medium">Sell Products</h3>
          </div>
        </Link>
        <Link href="/portal/print-barcode" className="flex items-center justify-center p-4 transition-colors card hover:bg-green-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-green-600 bg-green-100 rounded-full">
              <ShoppingBag size={24} />
            </div>
            <h3 className="font-medium">Print Barcode</h3>
          </div>
        </Link>
        <Link href="/portal/analytics" className="flex items-center justify-center p-4 transition-colors card hover:bg-orange-50">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-orange-600 bg-orange-100 rounded-full">
              <TrendingUp size={24} />
            </div>
            <h3 className="font-medium">View Analytics</h3>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Sales</h2>
              <Link href="/portal/customers" className="text-sm text-indigo-600 hover:text-indigo-800">View All</Link>
            </div>
          </div>
          <div className="p-0">
            {recentSales.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No recent sales found</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {recentSales.map(sale => (
                  <li key={sale.id} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{sale.customerPhone}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(sale.date).toLocaleString()} • {sale.items.length} items
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">₹{sale.total.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Inventory Alerts</h2>
              <Link href="/portal/inventory" className="text-sm text-indigo-600 hover:text-indigo-800">View All</Link>
            </div>
          </div>
          <div className="p-0">
            {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No inventory alerts</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {outOfStockProducts.map((product,index) => (
                  <li key={index} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-slate-500">Barcode: {product.barcode}</p>
                      </div>
                      <span className="badge badge-error">Out of Stock</span>
                    </div>
                  </li>
                ))}
                {lowStockProducts.map((product,index) => (
                  <li key={index} className="p-4 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-slate-500">Barcode: {product.barcode}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 badge badge-warning">Low Stock</span>
                        <span className="text-sm font-medium">{product.quantity} left</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
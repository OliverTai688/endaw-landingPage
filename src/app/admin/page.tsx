'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  TrendingUp, 
  AlertCircle, 
  Users 
} from 'lucide-react';

const stats = [
  { name: 'Total Orders', value: '128', icon: ShoppingBag, color: 'text-blue-500' },
  { name: 'Revenue', value: '$12,450', icon: TrendingUp, color: 'text-emerald-500' },
  { name: 'Stock Alerts', value: '3 Items', icon: AlertCircle, color: 'text-rose-500' },
  { name: 'Customers', value: '450', icon: Users, color: 'text-amber-500' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome back. Here's a quick summary of your operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all hover:bg-[#111]"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-400">{stat.name}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 h-96 flex items-center justify-center text-gray-500">
           Charts Placeholder
        </div>
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 h-96 flex flex-col">
           <h3 className="font-bold mb-4">Recent Activity</h3>
           <div className="flex-1 overflow-y-auto space-y-4 text-sm text-gray-400">
              <div className="border-l-2 border-[#D4AF37] pl-4 py-1">
                <p className="text-white">New order #ORD-5542</p>
                <p>2 minutes ago</p>
              </div>
              <div className="border-l-2 border-white/10 pl-4 py-1">
                <p className="text-white">Inventory replenished: JO-ONE</p>
                <p>1 hour ago</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

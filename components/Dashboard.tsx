import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Target, DollarSign, MousePointerClick } from 'lucide-react';
import { MetricData } from '../types';

const mockData: MetricData[] = [
  { day: '周一', spend: 450, installs: 120, cpi: 3.75 },
  { day: '周二', spend: 520, installs: 145, cpi: 3.58 },
  { day: '周三', spend: 480, installs: 132, cpi: 3.63 },
  { day: '周四', spend: 600, installs: 180, cpi: 3.33 },
  { day: '周五', spend: 750, installs: 250, cpi: 3.00 },
  { day: '周六', spend: 900, installs: 310, cpi: 2.90 },
  { day: '周日', spend: 850, installs: 280, cpi: 3.03 },
];

const StatCard: React.FC<{ title: string; value: string; trend: string; isPositive: boolean; icon: React.ElementType }> = ({ title, value, trend, isPositive, icon: Icon }) => (
  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-700/50 rounded-lg">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        {trend}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">推广活动概览</h2>
        <p className="text-slate-400">当前活动实时表现指标。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="总支出" value="$4,550" trend="+12.5%" isPositive={false} icon={DollarSign} />
        <StatCard title="安装量" value="1,417" trend="+24.2%" isPositive={true} icon={Target} />
        <StatCard title="平均 CPI" value="$3.21" trend="-8.4%" isPositive={true} icon={Users} />
        <StatCard title="点击率 (CTR)" value="2.8%" trend="+1.2%" isPositive={true} icon={MousePointerClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white">表现趋势 (支出 vs 安装)</h3>
            <select className="bg-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1 outline-none border border-slate-600 focus:border-indigo-500">
              <option>过去 7 天</option>
              <option>过去 30 天</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorInstalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="installs" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorInstalls)" />
                <Line type="monotone" dataKey="spend" stroke="#34d399" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
           <h3 className="font-semibold text-white mb-6">每次安装成本 (CPI)</h3>
           <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[2, 5]} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="cpi" stroke="#f472b6" strokeWidth={3} dot={{r: 4, fill: '#f472b6'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
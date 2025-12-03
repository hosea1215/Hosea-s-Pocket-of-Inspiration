
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Clock, AlertCircle, Sparkles, Loader2, Users, Leaf, Bookmark, Copy, Check, Table as TableIcon, Target } from 'lucide-react';
import { EconomicMetrics } from '../types';
import { analyzeGameEconomics } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, AreaChart, Area, ComposedChart, Bar } from 'recharts';

interface DailyOpData {
  day: number;
  newUsers: number;
  dau: number;
  revenue: number;
  cost: number;
  dailyProfit: number;
  cumulativeProfit: number;
}

const LtvCalculator: React.FC = () => {
  const [metrics, setMetrics] = useState<EconomicMetrics>({
    cpi: 0.80,
    retentionD1: 40,
    retentionD7: 15,
    retentionD28: 5,
    retentionD60: 3,
    retentionD90: 2,
    retentionD180: 1,
    retentionD365: 0.5,
    arpdau: 0.15,
    organicRatio: 15, // Default 15%
    dailyUa: 10000    // Default 10000
  });
  
  const [calculationResults, setCalculationResults] = useState<any[]>([]);
  const [dailyOpData, setDailyOpData] = useState<DailyOpData[]>([]);
  const [paybackDay, setPaybackDay] = useState<number | null>(null);
  const [d90Ltv, setD90Ltv] = useState<number>(0);
  const [d365Ltv, setD365Ltv] = useState<number>(0);
  const [effectiveCpi, setEffectiveCpi] = useState<number>(0);

  // New metrics for annotations
  const [maxLossMetric, setMaxLossMetric] = useState<{ day: number; amount: number } | null>(null);
  const [profitBreakEvenMetric, setProfitBreakEvenMetric] = useState<number | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const gameTemplates = [
    {
      name: "超休闲 (Hypercasual)",
      metrics: {
        cpi: 0.40, retentionD1: 45, retentionD7: 12, retentionD28: 3, retentionD60: 1, retentionD90: 0, retentionD180: 0, retentionD365: 0,
        arpdau: 0.12, organicRatio: 5, dailyUa: 20000
      }
    },
    {
      name: "休闲益智 (Puzzle)",
      metrics: {
        cpi: 1.50, retentionD1: 40, retentionD7: 18, retentionD28: 10, retentionD60: 6, retentionD90: 4, retentionD180: 2, retentionD365: 1,
        arpdau: 0.25, organicRatio: 15, dailyUa: 5000
      }
    },
    {
      name: "中度RPG (Midcore)",
      metrics: {
        cpi: 6.00, retentionD1: 35, retentionD7: 14, retentionD28: 7, retentionD60: 4, retentionD90: 3, retentionD180: 1.5, retentionD365: 1,
        arpdau: 1.20, organicRatio: 10, dailyUa: 2000
      }
    },
    {
      name: "策略 (SLG)",
      metrics: {
        cpi: 15.00, retentionD1: 30, retentionD7: 12, retentionD28: 6, retentionD60: 4, retentionD90: 3.5, retentionD180: 3, retentionD365: 2.5,
        arpdau: 4.50, organicRatio: 5, dailyUa: 1000
      }
    },
    {
      name: "2677美国",
      metrics: {
        cpi: 2.00, retentionD1: 40, retentionD7: 20, retentionD28: 10, retentionD60: 6, retentionD90: 4, retentionD180: 2, retentionD365: 1,
        arpdau: 0.19, organicRatio: 15, dailyUa: 10000
      }
    }
  ];

  useEffect(() => {
    calculateLtv();
  }, [metrics]);

  const calculateLtv = () => {
    // Collect available valid retention points
    const points = [
      { t: 1, r: metrics.retentionD1 / 100 },
      { t: 7, r: metrics.retentionD7 / 100 },
      { t: 28, r: metrics.retentionD28 / 100 },
      { t: 60, r: metrics.retentionD60 / 100 },
      { t: 90, r: metrics.retentionD90 / 100 },
      { t: 180, r: metrics.retentionD180 / 100 },
      { t: 365, r: metrics.retentionD365 / 100 },
    ].filter(p => p.r > 0);

    // If less than 2 points, cannot do regression, fallback to simple estimation if D1 exists
    let A = 0;
    let B = 0;

    if (points.length >= 2) {
      // Power Law Regression: R(t) = A * t^B
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      const n = points.length;

      for (const p of points) {
        const x = Math.log(p.t);
        const y = Math.log(p.r);
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      }

      const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const c = (sumY - m * sumX) / n;

      B = m;
      A = Math.exp(c);
    } else if (points.length === 1 && points[0].t === 1) {
      A = points[0].r;
      B = -0.5;
    } else {
      setCalculationResults([]);
      setDailyOpData([]);
      return;
    }

    // Calculate Effective CPI (Blended Cost)
    const organicMult = 1 - (metrics.organicRatio / 100);
    const eCpi = metrics.cpi * organicMult;
    setEffectiveCpi(eCpi);

    const daysToCalc = [1, 7, 28, 60, 90, 180, 365];
    let foundPayback = false;
    let pbDay = null;

    let chartDataPoints = [];
    let fullDailyDataPoints: DailyOpData[] = [];

    // Operational Accumulators
    let totalOpRevenue = 0;
    let totalOpCost = 0;
    const dailyUaCost = metrics.dailyUa * eCpi; // Daily cost is constant per assumption
    
    // Variables for annotations
    let minCumProfit = 0;
    let minCumProfitDay = 0;
    let opBreakevenDay = null;

    // First loop to find payback day based on SINGLE USER LTV
    let cumulativeRevPerUser = 0;
    for (let t = 1; t <= 365; t++) {
        const retention = A * Math.pow(t, B);
        cumulativeRevPerUser += retention * metrics.arpdau;
        if (!foundPayback && cumulativeRevPerUser >= eCpi) {
            pbDay = t;
            foundPayback = true;
        }
    }
    setPaybackDay(pbDay);

    // Second loop for Chart Data & Table Data Generation
    for (let t = 1; t <= 365; t++) {
        // LTV Calculation (Cumulative Rev Per User)
        let ltvSum = 0;
        for(let i=1; i<=t; i++) {
            ltvSum += (A * Math.pow(i, B)) * metrics.arpdau;
        }

        // Operational Metrics Calculation (Day T since launch)
        // DAU(t) = sum(DailyUA * Retention(t-i+1)) for i=1 to t (assuming constant UA started day 1)
        // Simplified: DAU(t) = DailyUA * sum(Retention(k)) for k=1 to t
        let sumR = 0;
        for(let k=1; k<=t; k++) {
            sumR += A * Math.pow(k, B);
        }
        const dau = metrics.dailyUa * sumR;
        const dailyOpRevenue = dau * metrics.arpdau;
        
        totalOpRevenue += dailyOpRevenue;
        totalOpCost += dailyUaCost; // Accumulate daily cost
        const cumulativeOpProfit = totalOpRevenue - totalOpCost;
        const dailyOpProfit = dailyOpRevenue - dailyUaCost;

        // Track Min Cumulative Profit (Max Loss)
        if (cumulativeOpProfit < minCumProfit) {
            minCumProfit = cumulativeOpProfit;
            minCumProfitDay = t;
        }

        // Track Cumulative Break Even
        if (opBreakevenDay === null && cumulativeOpProfit >= 0) {
            opBreakevenDay = t;
        }

        // Add to Full Table Data
        fullDailyDataPoints.push({
            day: t,
            newUsers: metrics.dailyUa,
            dau: Math.round(dau),
            revenue: dailyOpRevenue,
            cost: dailyUaCost,
            dailyProfit: dailyOpProfit,
            cumulativeProfit: cumulativeOpProfit
        });

        // Add to Chart Data (Sampled)
        if (t % 5 === 0 || t === 1 || daysToCalc.includes(t)) {
             chartDataPoints.push({
                dayInt: t,
                day: `D${t}`,
                ltv: parseFloat(ltvSum.toFixed(3)),
                cpi: metrics.cpi,
                eCpi: parseFloat(eCpi.toFixed(3)),
                dau: Math.round(dau),
                cumProfit: Math.round(cumulativeOpProfit),
                roas: eCpi > 0 ? parseFloat(((ltvSum / eCpi) * 100).toFixed(1)) : 0 
              });
        }
    }

    setCalculationResults(chartDataPoints);
    setDailyOpData(fullDailyDataPoints);
    setMaxLossMetric({ day: minCumProfitDay, amount: minCumProfit });
    setProfitBreakEvenMetric(opBreakevenDay);
    
    // Find closest data points for metrics display
    const finalResult = chartDataPoints[chartDataPoints.length - 1];
    const d90Point = chartDataPoints.find(p => p.dayInt === 90);
    
    setD90Ltv(d90Point ? d90Point.ltv : 0);
    setD365Ltv(finalResult ? finalResult.ltv : 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleTemplateSelect = (templateMetrics: EconomicMetrics) => {
    setMetrics(templateMetrics);
  };

  const handleAiAnalyze = async () => {
    setAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await analyzeGameEconomics(metrics);
      setAiAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!aiAnalysis) return;
    navigator.clipboard.writeText(aiAnalysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  };
  
  const formatNumber = (val: number) => {
      return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 min-w-[340px] bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            LTV & 回本估算
          </h2>
          <p className="text-sm text-slate-400 mt-1">基于幂函数回归模型 (Power Law) 预测长线 LTV。</p>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
          
          <div className="p-4 bg-indigo-900/10 rounded-lg border border-indigo-500/20">
             <h3 className="text-indigo-300 font-semibold text-sm mb-3">基础指标输入</h3>
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                       CPI (成本) <span>$</span>
                    </label>
                    <input 
                      type="number" 
                      name="cpi"
                      step="0.01"
                      value={metrics.cpi}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right font-mono"
                    />
                 </div>
                 <div>
                    <label className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                       ARPDAU <span>$</span>
                    </label>
                    <input 
                      type="number" 
                      name="arpdau"
                      step="0.01"
                      value={metrics.arpdau}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right font-mono"
                    />
                 </div>
               </div>

               <div>
                  <label className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 items-center">
                     <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-green-500"/> 自然量占比</span> 
                     <span>%</span>
                  </label>
                  <input 
                    type="number" 
                    name="organicRatio"
                    step="0.1"
                    value={metrics.organicRatio}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right font-mono"
                  />
                  <p className="text-[10px] text-slate-500 text-right mt-1">综合成本 (eCPI): <span className="text-green-400 font-mono">${effectiveCpi.toFixed(2)}</span></p>
               </div>

               <div>
                  <label className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 items-center">
                     <span className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-500"/> 每日买量数</span> 
                  </label>
                  <input 
                    type="number" 
                    name="dailyUa"
                    step="100"
                    value={metrics.dailyUa}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-right font-mono"
                  />
               </div>
             </div>
          </div>

          <div className="p-4 bg-slate-900/30 rounded-lg border border-slate-700">
             <h3 className="text-slate-300 font-semibold text-sm mb-3">留存率输入 (%)</h3>
             <div className="grid grid-cols-2 gap-x-4 gap-y-3">
               <div>
                  <label className="block text-xs text-slate-500 mb-1">Day 1</label>
                  <input 
                    type="number" 
                    name="retentionD1"
                    value={metrics.retentionD1}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                  />
               </div>
               <div>
                  <label className="block text-xs text-slate-500 mb-1">Day 7</label>
                  <input 
                    type="number" 
                    name="retentionD7"
                    value={metrics.retentionD7}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                  />
               </div>
               <div>
                  <label className="block text-xs text-slate-500 mb-1">Day 28</label>
                  <input 
                    type="number" 
                    name="retentionD28"
                    value={metrics.retentionD28}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                  />
               </div>
               <div>
                  <label className="block text-xs text-slate-500 mb-1">Day 60</label>
                  <input 
                    type="number" 
                    name="retentionD60"
                    value={metrics.retentionD60}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                  />
               </div>
               <div>
                  <label className="block text-xs text-slate-500 mb-1">Day 90</label>
                  <input 
                    type="number" 
                    name="retentionD90"
                    value={metrics.retentionD90}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                  />
               </div>
               <div>
                  <label className="block text-xs text-slate-500 mb-1">Day 180</label>
                  <input 
                    type="number" 
                    name="retentionD180"
                    value={metrics.retentionD180}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                  />
               </div>
               <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1 text-center">Day 365</label>
                  <input 
                    type="number" 
                    name="retentionD365"
                    value={metrics.retentionD365}
                    onChange={handleInputChange}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-center font-mono"
                  />
               </div>
             </div>
          </div>

          <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
             <div className="flex items-center gap-2 mb-3">
               <Bookmark className="w-4 h-4 text-indigo-400" />
               <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">快速预设模板</h3>
             </div>
             <div className="grid grid-cols-2 gap-2">
               {gameTemplates.map((t, idx) => (
                 <button
                   key={idx}
                   onClick={() => handleTemplateSelect(t.metrics)}
                   className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 hover:border-slate-500 py-2 px-3 rounded transition-colors text-left truncate flex items-center gap-2"
                   title={t.name}
                 >
                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                   {t.name}
                 </button>
               ))}
             </div>
          </div>

          <button 
             onClick={handleAiAnalyze}
             disabled={analyzing}
             className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
          >
             {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
             {analyzing ? 'AI 诊断中...' : 'AI 诊断经济模型'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden custom-scrollbar overflow-y-auto pr-2">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
             <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Clock className="w-4 h-4" /> <span className="text-xs font-bold uppercase">综合回本周期</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${paybackDay ? (paybackDay <= 60 ? 'text-green-400' : 'text-yellow-400') : 'text-slate-500'}`}>
                   {paybackDay ? `Day ${paybackDay}` : '> 365 Days'}
                </span>
             </div>
             <p className="text-xs text-slate-500 mt-1">基于 eCPI (自然量摊薄后)</p>
          </div>
          
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
             <div className="flex items-center gap-2 mb-2 text-slate-400">
                <TrendingUp className="w-4 h-4" /> <span className="text-xs font-bold uppercase">D90 LTV</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">${d90Ltv.toFixed(2)}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${d90Ltv > effectiveCpi ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                   {effectiveCpi > 0 ? ((d90Ltv/effectiveCpi)*100).toFixed(0) : 0}% ROAS
                </span>
             </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700/50">
             <div className="flex items-center gap-2 mb-2 text-slate-400">
                <DollarSign className="w-4 h-4" /> <span className="text-xs font-bold uppercase">D365 LTV (预测)</span>
             </div>
             <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-indigo-400">${d365Ltv.toFixed(2)}</span>
             </div>
             <p className="text-xs text-slate-500 mt-1">净利预测: <span className="text-white">${Math.max(0, d365Ltv - effectiveCpi).toFixed(2)}</span> / user</p>
          </div>
        </div>

        {/* LTV Chart */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 min-h-[300px] shrink-0">
           <h3 className="text-white font-semibold mb-4">LTV 增长曲线 vs 成本</h3>
           <div className="w-full h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={calculationResults} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                 />
                 <Legend />
                 <ReferenceLine y={effectiveCpi} label="eCPI" stroke="#4ade80" strokeDasharray="3 3" />
                 <ReferenceLine y={metrics.cpi} label="CPI" stroke="#f472b6" strokeDasharray="3 3" />
                 <Line type="monotone" name="LTV (累计收益)" dataKey="ltv" stroke="#818cf8" strokeWidth={3} dot={{r: 2}} activeDot={{r: 6}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Operations Chart */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 min-h-[300px] shrink-0">
           <div className="flex justify-between items-start mb-4">
               <div>
                   <h3 className="text-white font-semibold">每日运营 DAU 及累计利润趋势</h3>
                   <div className="flex gap-4 mt-2 text-xs">
                       <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                           <TrendingDown className="w-3 h-3" />
                           <span>最大资金占用: <strong>{formatCurrency(maxLossMetric?.amount || 0)}</strong> (Day {maxLossMetric?.day})</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                           <Target className="w-3 h-3" />
                           <span>累计回正: <strong>{profitBreakEvenMetric ? `Day ${profitBreakEvenMetric}` : '> 365 Days'}</strong></span>
                       </div>
                   </div>
               </div>
           </div>
           <div className="w-full h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={calculationResults} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                 <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                 <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                 <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                 />
                 <Legend />
                 <Area yAxisId="left" type="monotone" name="DAU (日活)" dataKey="dau" fill="#3b82f6" fillOpacity={0.1} stroke="#3b82f6" />
                 <Line yAxisId="right" type="monotone" name="累计利润 ($)" dataKey="cumProfit" stroke="#10b981" strokeWidth={2} dot={false} />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Daily Data Table */}
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 shrink-0">
           <div className="flex items-center gap-2 mb-4">
              <TableIcon className="w-5 h-5 text-indigo-400" />
              <h3 className="text-white font-semibold">每日运营数据预测 (Day 1 - D365)</h3>
           </div>
           <div className="w-full max-h-[300px] overflow-y-auto custom-scrollbar border border-slate-700 rounded-lg">
             <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-900 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-slate-400 font-semibold border-b border-slate-700">天数</th>
                    <th className="p-3 text-slate-400 font-semibold border-b border-slate-700 text-right">新增 (Total)</th>
                    <th className="p-3 text-slate-400 font-semibold border-b border-slate-700 text-right">日活 (DAU)</th>
                    <th className="p-3 text-slate-400 font-semibold border-b border-slate-700 text-right">收入 ($)</th>
                    <th className="p-3 text-slate-400 font-semibold border-b border-slate-700 text-right">买量费用 ($)</th>
                    <th className="p-3 text-slate-400 font-semibold border-b border-slate-700 text-right">日利润 ($)</th>
                    <th className="p-3 text-slate-400 font-semibold border-b border-slate-700 text-right">累计利润 ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyOpData.map((row) => (
                    <tr key={row.day} className="hover:bg-slate-700/50 border-b border-slate-700/50 last:border-0">
                      <td className="p-3 text-slate-300 font-mono">Day {row.day}</td>
                      <td className="p-3 text-slate-300 font-mono text-right">{formatNumber(row.newUsers)}</td>
                      <td className="p-3 text-slate-300 font-mono text-right">{formatNumber(row.dau)}</td>
                      <td className="p-3 text-indigo-300 font-mono text-right">{formatCurrency(row.revenue)}</td>
                      <td className="p-3 text-red-300 font-mono text-right">{formatCurrency(row.cost)}</td>
                      <td className={`p-3 font-mono text-right ${row.dailyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(row.dailyProfit)}
                      </td>
                      <td className={`p-3 font-mono text-right font-medium ${row.cumulativeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(row.cumulativeProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
        </div>

        {/* AI Analysis Output */}
        {aiAnalysis && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shrink-0 mb-6">
             <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold text-lg">AI 诊断报告</h3>
               </div>
               <button 
                  onClick={handleCopy}
                  className={`bg-slate-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
               >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? '已复制' : '复制内容'}
               </button>
             </div>
             <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LtvCalculator;

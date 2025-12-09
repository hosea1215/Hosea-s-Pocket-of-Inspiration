
import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Area } from 'recharts';
import { CandlestickChart, Info, TrendingUp, TrendingDown, RefreshCcw, DollarSign, MousePointerClick } from 'lucide-react';

// Interfaces for Data
interface CandleData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number; // Installs
  spend: number;
  ma7?: number;
  ma14?: number;
  ma28?: number;
}

const GameKLineChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [data, setData] = useState<CandleData[]>([]);
  const [hoverData, setHoverData] = useState<CandleData | null>(null);

  // Generate Mock Data
  useEffect(() => {
    const generateData = () => {
      const result: CandleData[] = [];
      let currentCpi = 2.50; // Starting CPI
      const days = timeframe === 'Day' ? 90 : timeframe === 'Week' ? 52 : 24;
      const now = new Date();
      
      // Moving Average Arrays
      const closes: number[] = [];

      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        if (timeframe === 'Day') date.setDate(date.getDate() - i);
        if (timeframe === 'Week') date.setDate(date.getDate() - (i * 7));
        if (timeframe === 'Month') date.setMonth(date.getMonth() - i);

        // Random volatility
        const volatility = 0.15;
        const change = (Math.random() - 0.5) * volatility;
        const open = currentCpi;
        const close = Math.max(0.5, currentCpi * (1 + change));
        const high = Math.max(open, close) * (1 + Math.random() * 0.05);
        const low = Math.min(open, close) * (1 - Math.random() * 0.05);
        
        currentCpi = close; // Next day starts at this close
        closes.push(close);

        // Volume (Installs) inversely proportional to CPI roughly
        const baseInstalls = 5000;
        const volume = Math.floor(baseInstalls / close * (0.8 + Math.random() * 0.4));
        const spend = Math.floor(volume * ((open + close + high + low) / 4));

        // Calculate MAs
        const getMA = (period: number) => {
            if (closes.length < period) return undefined;
            const slice = closes.slice(-period);
            return slice.reduce((a, b) => a + b, 0) / period;
        };

        result.push({
          time: date.toISOString().split('T')[0],
          open: Number(open.toFixed(2)),
          close: Number(close.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          volume,
          spend,
          ma7: getMA(7),
          ma14: getMA(14),
          ma28: getMA(28),
        });
      }
      return result;
    };

    setData(generateData());
  }, [timeframe]);

  // Custom Shape for Candlestick
  const renderCandleStick = (props: any) => {
    const { x, y, width, height, low, high, open, close } = props;
    const isUp = close > open; // In Chinese stock market, Red is UP (Price increase). In UA, CPI Increase is technically "Bad" but visually usually follows Stock conventions.
    // Let's stick to: Red = Rise (Close > Open), Green = Fall (Close < Open) for Asian context, or Green = Rise for Western. 
    // Standard Global Financial: Green = Up, Red = Down.
    // Given Chinese user base typically: Red = Up, Green = Down.
    const fill = isUp ? '#ef4444' : '#22c55e'; // Red for Rise, Green for Fall
    
    // Y-Axis scale mapping handled by Recharts, but we need pixel values for High/Low wicks.
    // Recharts passes 'y' as the top of the bar (min value of open/close visually), and 'height' as body height.
    // We need to calculate pixel positions for high and low relative to the axis.
    // This is tricky in a simple Bar. 
    
    // Easier Method: Composed Chart. 
    // We will use a Bar for the Body (Open-Close range).
    // And ErrorBar for wicks? No, ErrorBar is limited.
    // 
    // Correct Recharts Approach for Custom Shapes:
    // We receive x, y, width, height from the Bar component which represents the BODY [min(open, close), max(open, close)].
    // We also have access to the full payload data to get high/low values.
    // However, converting high/low values to pixels requires the yAxis scale function which isn't easily exposed here without CustomContent.
    
    // Alternative: Use a composite visual.
    // 1. Bar for Body.
    // 2. Line/ErrorBar for Wicks.
    // Let's try the simple custom shape on a Bar that spans Low to High? No, Body is Open to Close.
    
    // Let's use the standard "Stock Chart in Recharts" hack:
    // A Bar chart with [min, max] data is ideal for the body.
    // But drawing the wicks requires pixel math.
    // 
    // Simplified Logic for "Visual" K-Line: 
    // Just use a Bar for the body. Wicks are nice-to-have but complex in basic Recharts without custom axis mapping.
    // Wait! We can use <ErrorBar> inside <Bar>.
    // But ErrorBar needs specific error values.
    
    // Let's simply draw a Bar for the body range.
    // And overlay a Line (with dots disabled) or another Bar (very thin) for wicks?
    // 
    // Best visual approximation without low-level D3:
    // Bar with custom shape that draws the whole candle (wick + body).
    // But we need the pixel coordinates for High and Low.
    
    // Actually, Recharts <Bar> accepts an array [min, max] for value.
    // If we use dataKey={[low, high]} for the Bar, it draws the full range.
    // Then we can draw a rectangle on top for the body?
    
    // Let's revert to a simpler "Body Only + High/Low Line" if possible, or just the Body if exact High/Low lines are too hard.
    // Actually, a simple trick:
    // Use a composed chart.
    // Bar 1: Data = [Low, High], width = 1px (The Wick)
    // Bar 2: Data = [Open, Close], width = 10px (The Body)
    // Both Bars share the same X axis.
    
    return <path />; // Placeholder, logic handled in Chart composition below
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the candle data from the payload (it might be nested)
      const data = payload[0].payload; 
      const change = ((data.close - data.open) / data.open) * 100;
      const isUp = data.close > data.open;

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-slate-400 font-mono mb-2">{label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-slate-500">Open:</span> <span className="text-white text-right">${data.open.toFixed(2)}</span>
            <span className="text-slate-500">High:</span> <span className="text-white text-right">${data.high.toFixed(2)}</span>
            <span className="text-slate-500">Low:</span> <span className="text-white text-right">${data.low.toFixed(2)}</span>
            <span className="text-slate-500">Close:</span> <span className={`text-right ${isUp ? 'text-red-400' : 'text-green-400'}`}>${data.close.toFixed(2)}</span>
            <span className="text-slate-500">Change:</span> <span className={`text-right ${isUp ? 'text-red-400' : 'text-green-400'}`}>{isUp ? '+' : ''}{change.toFixed(2)}%</span>
            <span className="text-slate-500 mt-1 pt-1 border-t border-slate-800">Volume:</span> <span className="text-white text-right mt-1 pt-1 border-t border-slate-800">{data.volume.toLocaleString()}</span>
            <span className="text-slate-500">Spend:</span> <span className="text-yellow-400 text-right">${data.spend.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 bg-slate-950 rounded-xl p-6 border border-slate-800 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CandlestickChart className="w-6 h-6 text-indigo-400" />
              游戏买量 K 线图
            </h2>
            <p className="text-sm text-slate-400 mt-1">CPI 波动趋势与量价关系分析 (红涨绿跌)</p>
          </div>
          
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            {['Day', 'Week', 'Month'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t as any)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${timeframe === t ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                {t === 'Day' ? '日K' : t === 'Week' ? '周K' : '月K'}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Container */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
            
            {/* Main Candle Chart */}
            <div className="flex-[3] min-h-0 bg-slate-900/30 rounded-lg border border-slate-800 p-2 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart 
                        data={data} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        syncId="gameKLine"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis 
                            orientation="right" 
                            domain={['auto', 'auto']} 
                            tick={{fill: '#94a3b8', fontSize: 11}} 
                            tickFormatter={(val) => `$${val}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Moving Averages */}
                        <Line type="monotone" dataKey="ma7" stroke="#fbbf24" dot={false} strokeWidth={1} name="MA7" />
                        <Line type="monotone" dataKey="ma14" stroke="#c084fc" dot={false} strokeWidth={1} name="MA14" />
                        <Line type="monotone" dataKey="ma28" stroke="#2dd4bf" dot={false} strokeWidth={1} name="MA28" />

                        {/* Wicks (High-Low) - Rendered as a thin Bar behind */}
                        <Bar 
                            dataKey="high" // Dummy, we override
                            shape={(props: any) => {
                                const { x, y, width, payload, index } = props;
                                // We need access to the Y axis scale to compute y positions for high/low
                                // Since we can't easily get it here without complex custom shape logic or context,
                                // We will use a simplified approach:
                                // Use ErrorBar is simpler, but let's stick to the visual approximation:
                                // Actually, constructing a standard boxplot/candle in Recharts is best done with <Customized> or specific shape.
                                // 
                                // Simpler approach for this UI demo:
                                // Draw a Bar from Low to High with very narrow width (wick)
                                // Draw a Bar from Open to Close with normal width (body)
                                return null;
                            }} 
                        />
                        
                        {/* The Actual Candle Implementation using 2 Bars trick */}
                        {/* Wick Bar (Low to High) - 1px width */}
                        <Bar 
                            dataKey={(datum) => [datum.low, datum.high]} 
                            barSize={1} 
                            fill="#64748b" // Fallback fill
                        >
                            {
                                data.map((entry, index) => (
                                    <Cell key={`wick-${index}`} fill={entry.close > entry.open ? '#ef4444' : '#22c55e'} />
                                ))
                            }
                        </Bar>

                        {/* Body Bar (Open to Close) - wider */}
                        <Bar 
                            dataKey={(datum) => [datum.open, datum.close]} 
                            barSize={10}
                        >
                            {
                                data.map((entry, index) => (
                                    <Cell key={`body-${index}`} fill={entry.close > entry.open ? '#ef4444' : '#22c55e'} />
                                ))
                            }
                        </Bar>

                    </ComposedChart>
                </ResponsiveContainer>
                
                {/* Legend Overlay */}
                <div className="absolute top-2 left-4 flex gap-4 text-[10px] pointer-events-none">
                    <span className="text-yellow-400">MA7: {hoverData?.ma7?.toFixed(2) || '-'}</span>
                    <span className="text-purple-400">MA14: {hoverData?.ma14?.toFixed(2) || '-'}</span>
                    <span className="text-teal-400">MA28: {hoverData?.ma28?.toFixed(2) || '-'}</span>
                </div>
            </div>

            {/* Volume & Spend Chart */}
            <div className="flex-1 min-h-0 bg-slate-900/30 rounded-lg border border-slate-800 p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart 
                        data={data} 
                        margin={{ top: 5, right: 30, left: 0, bottom: 0 }}
                        syncId="gameKLine"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" tick={{fill: '#94a3b8', fontSize: 10}} minTickGap={30} />
                        <YAxis yAxisId="vol" orientation="right" tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                        <YAxis yAxisId="spend" orientation="left" hide />
                        <Tooltip cursor={{fill: '#ffffff', opacity: 0.05}} content={<></>} /> {/* Sync handled by top chart */}
                        
                        <Bar yAxisId="vol" dataKey="volume" name="Installs" fill="#3b82f6" opacity={0.3} barSize={10} />
                        <Line yAxisId="spend" type="monotone" dataKey="spend" name="Spend" stroke="#fbbf24" dot={false} strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="mt-4 flex gap-6 text-xs text-slate-500 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                <span>CPI 上涨 (成本增加)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span>CPI 下跌 (成本优化)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-yellow-400"></div>
                <span>花费曲线 (Spend)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/30 border border-blue-500"></div>
                <span>安装量 (Installs)</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GameKLineChart;

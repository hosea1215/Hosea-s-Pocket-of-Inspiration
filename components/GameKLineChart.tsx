
// ... (imports remain the same)
import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Area } from 'recharts';
import { CandlestickChart, Info, TrendingUp, TrendingDown, RefreshCcw, DollarSign, MousePointerClick, Activity, Percent, Target, Users, MapPin, Link as LinkIcon, ChevronDown, Check, X, Filter, Layers, Gamepad2, Megaphone } from 'lucide-react';

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

type MetricType = 'CPI' | 'RetD1' | 'RetD7' | 'ROASD7';

const GameKLineChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [metric, setMetric] = useState<MetricType>('CPI');
  const [data, setData] = useState<CandleData[]>([]);
  const [hoverData, setHoverData] = useState<CandleData | null>(null);

  // Input States
  const [appId, setAppId] = useState('com.puzzlegames.puzzlebrickslegend');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  
  // Ad Hierarchy Multi-Select States
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['全部']);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(['全部']);
  const [selectedAdGroups, setSelectedAdGroups] = useState<string[]>(['全部']);
  const [selectedAds, setSelectedAds] = useState<string[]>(['全部']);

  // Country Selection State
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US', 'UK', 'CA']);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock Options
  const channelOptions = ['全部', 'Facebook', 'Google Ads', 'TikTok Ads', 'AppLovin', 'Unity Ads', 'Mintegral'];
  const campaignOptions = ['全部', 'US_iOS_ROAS_001', 'Global_Launch_V1', 'Retargeting_D7', 'T1_Value_Opt'];
  const adGroupOptions = ['全部', 'Broad_Open', 'Interest_Puzzle', 'LAL_1%_Payers', 'Competitor_Targeting'];
  const adOptions = ['全部', 'Video_Gameplay_Var1', 'Static_Banner_Holiday', 'Playable_Level_10', 'UGC_Testimonial'];

  const metricConfig = {
    CPI: { label: 'CPI (成本)', icon: DollarSign, color: '#f472b6', format: (v: number) => `$${v.toFixed(2)}` },
    RetD1: { label: '次日留存', icon: Users, color: '#34d399', format: (v: number) => `${v.toFixed(1)}%` },
    RetD7: { label: '7日留存', icon: Activity, color: '#60a5fa', format: (v: number) => `${v.toFixed(1)}%` },
    ROASD7: { label: '7日 ROAS', icon: Target, color: '#fbbf24', format: (v: number) => `${v.toFixed(1)}%` },
  };

  const tiers = [
    {
      name: 'T1 (成熟/高价值市场)',
      countries: [
        { code: 'US', name: '美国 (US)' },
        { code: 'JP', name: '日本 (JP)' },
        { code: 'KR', name: '韩国 (KR)' },
        { code: 'UK', name: '英国 (UK)' },
        { code: 'DE', name: '德国 (DE)' },
        { code: 'FR', name: '法国 (FR)' },
        { code: 'CA', name: '加拿大 (CA)' },
        { code: 'AU', name: '澳大利亚 (AU)' },
      ]
    },
    {
      name: 'T2 (潜力/增长市场)',
      countries: [
        { code: 'TW', name: '中国台湾 (TW)' },
        { code: 'HK', name: '中国香港 (HK)' },
        { code: 'BR', name: '巴西 (BR)' },
        { code: 'IT', name: '意大利 (IT)' },
        { code: 'ES', name: '西班牙 (ES)' },
        { code: 'RU', name: '俄罗斯 (RU)' },
        { code: 'TR', name: '土耳其 (TR)' },
        { code: 'SA', name: '沙特 (SA)' },
      ]
    },
    {
      name: 'T3 (流量/新兴市场)',
      countries: [
        { code: 'IN', name: '印度 (IN)' },
        { code: 'ID', name: '印尼 (ID)' },
        { code: 'VN', name: '越南 (VN)' },
        { code: 'TH', name: '泰国 (TH)' },
        { code: 'PH', name: '菲律宾 (PH)' },
        { code: 'MY', name: '马来西亚 (MY)' },
        { code: 'MX', name: '墨西哥 (MX)' },
      ]
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const toggleTier = (tierCountries: {code: string}[]) => {
    const codes = tierCountries.map(c => c.code);
    const allSelected = codes.every(c => selectedCountries.includes(c));
    
    if (allSelected) {
      setSelectedCountries(prev => prev.filter(c => !codes.includes(c)));
    } else {
      setSelectedCountries(prev => [...new Set([...prev, ...codes])]);
    }
  };

  const removeCountry = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCountries(prev => prev.filter(c => c !== code));
  };

  // Helper for multi-select logic
  const toggleMultiSelection = (
    item: string,
    currentSelection: string[],
    setSelection: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const allValue = '全部';
    
    if (item === allValue) {
        // If "All" is clicked, clear everything else and just select "All"
        setSelection([allValue]);
        return;
    }

    let newSelection = [...currentSelection];
    
    // If we are selecting a specific item, first remove "All" if it exists
    if (newSelection.includes(allValue)) {
        newSelection = [];
    }

    if (newSelection.includes(item)) {
        newSelection = newSelection.filter(i => i !== item);
    } else {
        newSelection.push(item);
    }

    // If nothing is left selected, revert to "All"
    if (newSelection.length === 0) {
        newSelection = [allValue];
    }

    setSelection(newSelection);
  };

  // Generate Mock Data
  useEffect(() => {
    const generateData = () => {
      const result: CandleData[] = [];
      const days = timeframe === 'Day' ? 90 : timeframe === 'Week' ? 52 : 24;
      const now = new Date();
      
      let currentValue = 0;
      let volatility = 0;
      
      // Initial values based on metric
      switch (metric) {
        case 'CPI': currentValue = 2.50; volatility = 0.15; break;
        case 'RetD1': currentValue = 40.0; volatility = 0.05; break;
        case 'RetD7': currentValue = 15.0; volatility = 0.08; break;
        case 'ROASD7': currentValue = 12.0; volatility = 0.20; break;
      }

      // Moving Average Arrays
      const closes: number[] = [];

      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        if (timeframe === 'Day') date.setDate(date.getDate() - i);
        if (timeframe === 'Week') date.setDate(date.getDate() - (i * 7));
        if (timeframe === 'Month') date.setMonth(date.getMonth() - i);

        // Random volatility
        const change = (Math.random() - 0.5) * volatility;
        const open = currentValue;
        const close = Math.max(0.1, currentValue * (1 + change));
        const high = Math.max(open, close) * (1 + Math.random() * (volatility * 0.5));
        const low = Math.min(open, close) * (1 - Math.random() * (volatility * 0.5));
        
        currentValue = close; // Next day starts at this close
        closes.push(close);

        // Volume (Installs) - mostly consistent but varies slightly
        // For CPI, volume usually correlates inversely. For Ret/ROAS, maybe loosely correlated.
        // Let's keep a somewhat random volume pattern with a trend
        const baseInstalls = 5000;
        // Add some seasonality
        const seasonFactor = 1 + Math.sin(i / 10) * 0.2;
        const volume = Math.floor(baseInstalls * seasonFactor * (0.8 + Math.random() * 0.4));
        
        // Spend calculation depends on CPI if we were tracking it, but here 'spend' is just an indicator
        // Let's approximate spend = volume * (implied CPI). 
        // If metric is CPI, use close. If not, use a constant 2.5 as dummy CPI to calc spend.
        const impliedCpi = metric === 'CPI' ? close : 2.5;
        const spend = Math.floor(volume * impliedCpi);

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
  }, [timeframe, metric, selectedChannels, selectedCampaigns, selectedCountries]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the candle data from the payload (it might be nested)
      const data = payload[0].payload; 
      const change = ((data.close - data.open) / data.open) * 100;
      const isUp = data.close > data.open;
      const fmt = metricConfig[metric].format;

      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-slate-400 font-mono mb-2">{label}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-slate-500">Open:</span> <span className="text-white text-right">{fmt(data.open)}</span>
            <span className="text-slate-500">High:</span> <span className="text-white text-right">{fmt(data.high)}</span>
            <span className="text-slate-500">Low:</span> <span className="text-white text-right">{fmt(data.low)}</span>
            <span className="text-slate-500">Close:</span> <span className={`text-right ${isUp ? 'text-red-400' : 'text-green-400'}`}>{fmt(data.close)}</span>
            <span className="text-slate-500">Change:</span> <span className={`text-right ${isUp ? 'text-red-400' : 'text-green-400'}`}>{isUp ? '+' : ''}{change.toFixed(2)}%</span>
            <span className="text-slate-500 mt-1 pt-1 border-t border-slate-800">Volume:</span> <span className="text-white text-right mt-1 pt-1 border-t border-slate-800">{data.volume.toLocaleString()}</span>
            <span className="text-slate-500">Spend:</span> <span className="text-yellow-400 text-right">${data.spend.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderMultiSelect = (label: string, id: string, options: string[], selection: string[], setSelection: React.Dispatch<React.SetStateAction<string[]>>) => {
    const isOpen = activeDropdown === id;
    
    return (
        <div className="relative">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
            <div 
                className={`w-full bg-slate-900 border ${isOpen ? 'border-indigo-500' : 'border-slate-700'} rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between text-sm transition-colors hover:border-slate-600`}
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(isOpen ? null : id);
                }}
            >
                <div className="truncate flex-1 text-slate-200">
                    {selection.length === 1 && selection[0] === '全部' ? (
                        <span className="text-slate-400">全部</span>
                    ) : (
                        selection.join(', ')
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                    {options.map((opt) => {
                        const isSelected = selection.includes(opt);
                        return (
                            <div 
                                key={opt}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMultiSelection(opt, selection, setSelection);
                                }}
                                className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer text-xs ${isSelected ? 'bg-indigo-600/20 text-indigo-200' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <span className="truncate">{opt}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
  };

  const latestData = data.length > 0 ? data[data.length - 1] : null;
  const displayData = hoverData || latestData;

  return (
    <div className="flex h-full gap-6">
      {/* Left Input Panel */}
      <div className="w-1/3 min-w-[300px] bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0 overflow-y-auto custom-scrollbar" ref={dropdownRef}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            数据筛选配置
          </h2>
          <p className="text-sm text-slate-400 mt-1">配置游戏与广告层级信息。</p>
        </div>

        <div className="space-y-5">
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" /> 游戏 APP ID
                </label>
                <input 
                    type="text" 
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> 游戏商店链接
                </label>
                <input 
                    type="text" 
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="https://play.google.com/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
            </div>

            <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> 目标国家 (多选)
                </label>
                <div 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 min-h-[42px] cursor-pointer hover:border-slate-600 transition-colors flex flex-wrap gap-2 items-center"
                    onClick={() => setActiveDropdown(activeDropdown === 'countries' ? null : 'countries')}
                >
                    {selectedCountries.length === 0 && <span className="text-slate-500 text-sm">选择目标国家...</span>}
                    {selectedCountries.map(code => (
                        <span key={code} className="bg-indigo-600/20 text-indigo-300 text-xs px-2 py-1 rounded flex items-center gap-1 border border-indigo-600/30">
                            {code}
                            <X 
                                className="w-3 h-3 hover:text-white cursor-pointer" 
                                onClick={(e) => removeCountry(code, e)}
                            />
                        </span>
                    ))}
                    <div className="ml-auto">
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${activeDropdown === 'countries' ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {/* Dropdown Menu for Countries */}
                {activeDropdown === 'countries' && (
                    <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                        {tiers.map((tier, idx) => {
                            const allSelected = tier.countries.every(c => selectedCountries.includes(c.code));
                            return (
                                <div key={idx} className="mb-4 last:mb-0">
                                    <div 
                                        className="flex items-center justify-between px-2 py-1.5 bg-slate-800/50 rounded mb-2 cursor-pointer hover:bg-slate-800 transition-colors"
                                        onClick={() => toggleTier(tier.countries)}
                                    >
                                        <span className="text-xs font-bold text-slate-300">{tier.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${allSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                            {allSelected ? '全选' : '选择全部'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 px-1">
                                        {tier.countries.map(country => {
                                            const isSelected = selectedCountries.includes(country.code);
                                            return (
                                                <div 
                                                    key={country.code} 
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border ${isSelected ? 'bg-indigo-600/20 border-indigo-600/50' : 'hover:bg-slate-800 border-transparent'}`}
                                                    onClick={() => toggleCountry(country.code)}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className={`text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{country.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-slate-700/50">
                <h4 className="text-indigo-300 font-bold text-xs mb-3 flex items-center gap-1">
                    <Megaphone className="w-3 h-3" /> 广告层级 (Ad Hierarchy)
                </h4>
                
                <div className="space-y-3">
                    {renderMultiSelect('投放媒体渠道', 'channels', channelOptions, selectedChannels, setSelectedChannels)}
                    {renderMultiSelect('广告系列 (Campaign)', 'campaigns', campaignOptions, selectedCampaigns, setSelectedCampaigns)}
                    {renderMultiSelect('广告组 (Ad Group)', 'adGroups', adGroupOptions, selectedAdGroups, setSelectedAdGroups)}
                    {renderMultiSelect('广告创意 (Ad Creative)', 'ads', adOptions, selectedAds, setSelectedAds)}
                </div>
            </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 bg-slate-950 rounded-xl p-6 border border-slate-800 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CandlestickChart className="w-6 h-6 text-indigo-400" />
              游戏买量 K 线图
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {metricConfig[metric].label} 波动趋势与量价关系分析 (红涨绿跌)
            </p>
          </div>
          
          <div className="flex gap-4">
             {/* Metric Selector */}
             <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                {(Object.keys(metricConfig) as MetricType[]).map((m) => {
                    const conf = metricConfig[m];
                    const Icon = conf.icon;
                    return (
                        <button
                            key={m}
                            onClick={() => setMetric(m)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${metric === m ? 'bg-slate-800 text-white shadow ring-1 ring-slate-700' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Icon className={`w-3 h-3 ${metric === m ? 'text-indigo-400' : ''}`} />
                            {conf.label}
                        </button>
                    )
                })}
             </div>

             {/* Timeframe Selector */}
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
                        onMouseMove={(state) => {
                            if (state.activePayload && state.activePayload.length) {
                                setHoverData(state.activePayload[0].payload);
                            }
                        }}
                        onMouseLeave={() => setHoverData(null)}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis 
                            orientation="right" 
                            domain={['auto', 'auto']} 
                            tick={{fill: '#94a3b8', fontSize: 11}} 
                            tickFormatter={metricConfig[metric].format}
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
                                return null; // Placeholder
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
                    <span className="text-yellow-400">MA7: {displayData?.ma7 ? metricConfig[metric].format(displayData.ma7) : '-'}</span>
                    <span className="text-purple-400">MA14: {displayData?.ma14 ? metricConfig[metric].format(displayData.ma14) : '-'}</span>
                    <span className="text-teal-400">MA28: {displayData?.ma28 ? metricConfig[metric].format(displayData.ma28) : '-'}</span>
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
                <span>{metricConfig[metric].label} 上涨</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span>{metricConfig[metric].label} 下跌</span>
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

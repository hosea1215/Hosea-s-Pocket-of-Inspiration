
import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Area } from 'recharts';
import { CandlestickChart, Info, TrendingUp, TrendingDown, RefreshCcw, DollarSign, MousePointerClick, Activity, Percent, Target, Users, MapPin, Link as LinkIcon, ChevronDown, Check, X, Filter, Layers, Gamepad2, Megaphone, Upload, FileText, AlertCircle } from 'lucide-react';

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
type DataSource = 'simulation' | 'upload' | 'url';

const GameKLineChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [metric, setMetric] = useState<MetricType>('CPI');
  const [dataSource, setDataSource] = useState<DataSource>('simulation');
  const [data, setData] = useState<CandleData[]>([]);
  const [hoverData, setHoverData] = useState<CandleData | null>(null);

  // Input States
  const [appId, setAppId] = useState('com.puzzlegames.puzzlebrickslegend');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  
  // Upload States
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Data Processing Logic
  const processCsvData = (csvText: string) => {
    setUploadError(null);
    try {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) throw new Error("CSV 数据行数不足");

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Simple heuristic to find columns
        const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('time') || h.includes('日期') || h.includes('时间'));
        const spendIdx = headers.findIndex(h => h.includes('spend') || h.includes('cost') || h.includes('amount') || h.includes('花费') || h.includes('支出'));
        const installsIdx = headers.findIndex(h => h.includes('install') || h.includes('conversion') || h.includes('安装') || h.includes('转化'));

        if (dateIdx === -1 || spendIdx === -1 || installsIdx === -1) {
            throw new Error(`无法识别列名。请确保包含: Date, Spend, Installs (或中文对应列)`);
        }

        const rawData: any[] = [];
        for(let i=1; i<lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim());
            if (cols.length <= Math.max(dateIdx, spendIdx, installsIdx)) continue;
            
            const date = cols[dateIdx];
            const spend = parseFloat(cols[spendIdx]);
            const installs = parseFloat(cols[installsIdx]);

            if (date && !isNaN(spend) && !isNaN(installs)) {
                rawData.push({ date, spend, installs });
            }
        }

        // Sort by date
        rawData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Convert to CandleData
        const candleData: CandleData[] = [];
        let prevClose = 0;

        rawData.forEach((row, idx) => {
            const cpi = row.installs > 0 ? row.spend / row.installs : 0;
            const open = idx === 0 ? cpi : prevClose;
            const close = cpi;
            
            // Simulate High/Low based on open/close since daily data lacks intraday
            const volatility = Math.abs(open - close) * 0.5 + (close * 0.05); 
            const high = Math.max(open, close) + volatility;
            const low = Math.max(0, Math.min(open, close) - volatility);

            // Simple MA calculation (not efficient but fine for small datasets)
            const getMA = (period: number, currentIdx: number, source: any[]) => {
                if (currentIdx < period - 1) return undefined;
                let sum = 0;
                for (let k = 0; k < period; k++) {
                    const r = source[currentIdx - k];
                    sum += (r.installs > 0 ? r.spend / r.installs : 0);
                }
                return sum / period;
            };

            candleData.push({
                time: row.date,
                open: Number(open.toFixed(2)),
                close: Number(close.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                volume: Math.round(row.installs),
                spend: Math.round(row.spend),
                ma7: getMA(7, idx, rawData),
                ma14: getMA(14, idx, rawData),
                ma28: getMA(28, idx, rawData)
            });

            prevClose = close;
        });

        if (candleData.length === 0) throw new Error("解析后无有效数据");
        
        setData(candleData);

    } catch (e: any) {
        setUploadError(e.message || "CSV 解析失败");
        console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        processCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleUrlFetch = async () => {
    if (!sheetUrl) return;
    setUploadError(null);
    try {
        const res = await fetch(sheetUrl);
        if (!res.ok) throw new Error("无法访问 URL");
        const text = await res.text();
        processCsvData(text);
    } catch (e) {
        setUploadError("无法读取 URL，请确保是“发布到网页”的 CSV 链接且可公开访问。");
    }
  };

  // Generate Mock Data (Only runs when dataSource is simulation)
  useEffect(() => {
    if (dataSource !== 'simulation') return;

    const generateData = () => {
      const result: CandleData[] = [];
      const days = timeframe === 'Day' ? 90 : timeframe === 'Week' ? 52 : 24;
      const now = new Date();
      
      let currentValue = 0;
      let volatility = 0;
      
      switch (metric) {
        case 'CPI': currentValue = 2.50; volatility = 0.15; break;
        case 'RetD1': currentValue = 40.0; volatility = 0.05; break;
        case 'RetD7': currentValue = 15.0; volatility = 0.08; break;
        case 'ROASD7': currentValue = 12.0; volatility = 0.20; break;
      }

      const closes: number[] = [];

      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        if (timeframe === 'Day') date.setDate(date.getDate() - i);
        if (timeframe === 'Week') date.setDate(date.getDate() - (i * 7));
        if (timeframe === 'Month') date.setMonth(date.getMonth() - i);

        const change = (Math.random() - 0.5) * volatility;
        const open = currentValue;
        const close = Math.max(0.1, currentValue * (1 + change));
        const high = Math.max(open, close) * (1 + Math.random() * (volatility * 0.5));
        const low = Math.min(open, close) * (1 - Math.random() * (volatility * 0.5));
        
        currentValue = close; 
        closes.push(close);

        const baseInstalls = 5000;
        const seasonFactor = 1 + Math.sin(i / 10) * 0.2;
        const volume = Math.floor(baseInstalls * seasonFactor * (0.8 + Math.random() * 0.4));
        const impliedCpi = metric === 'CPI' ? close : 2.5;
        const spend = Math.floor(volume * impliedCpi);

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
  }, [timeframe, metric, selectedChannels, selectedCampaigns, selectedCountries, dataSource]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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

            {/* Data Source Selection */}
            <div className="pt-4 border-t border-slate-700/50">
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> 报表上传 (Data Source)
                </label>
                
                {/* Source Tabs */}
                <div className="flex bg-slate-900 p-1 rounded-lg mb-3">
                    <button 
                        className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${dataSource === 'simulation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        onClick={() => setDataSource('simulation')}
                    >
                        模拟数据
                    </button>
                    <button 
                        className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${dataSource === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        onClick={() => setDataSource('upload')}
                    >
                        上传表格
                    </button>
                    <button 
                        className={`flex-1 py-1.5 text-xs rounded-md transition-colors ${dataSource === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        onClick={() => setDataSource('url')}
                    >
                        Google Sheet
                    </button>
                </div>

                {dataSource === 'upload' && (
                    <div 
                        className="relative w-full border-2 border-dashed border-slate-600 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center py-6 group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-xs text-slate-400 text-center px-4">
                            {fileName || "点击上传 .csv 报表\n(需包含 Date, Spend, Installs)"}
                        </p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".csv" 
                            onChange={handleFileUpload} 
                        />
                    </div>
                )}

                {dataSource === 'url' && (
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={sheetUrl}
                            onChange={(e) => setSheetUrl(e.target.value)}
                            placeholder="发布为 CSV 的 URL"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <button 
                            onClick={handleUrlFetch}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs"
                        >
                            加载
                        </button>
                    </div>
                )}

                {uploadError && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {uploadError}
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

            {/* NEW EXPLANATION SECTION */}
            <div className="pt-4 mt-4 border-t border-slate-700/50">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">字段对应说明</span>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-slate-500 font-mono">
                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Spend</span> 
                            <span>投放广告花费(AF)</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">Volume</span> 
                            <span>af新增用户数</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">CPI(成本)</span> 
                            <span>AF-CPI</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">次日留存</span> 
                            <span>af-次日留存率</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800/50 pb-1">
                            <span className="text-slate-400">7日留存</span> 
                            <span>af-7日留存率</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">7日ROAS</span> 
                            <span>ROAS_14(AF)</span>
                        </div>
                    </div>
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

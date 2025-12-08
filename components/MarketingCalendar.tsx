
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, Loader2, Copy, Check, FileText, Globe, MapPin, Search, BarChart2, ChevronDown, X, TrendingUp, History } from 'lucide-react';
import { generateMarketingCalendar } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, Legend } from 'recharts';
import { MarketingCalendarData } from '../types';

const MarketingCalendar: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  // Default selection
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US', 'JP', 'KR', 'UK', 'DE']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState('Q1');
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [showChart, setShowChart] = useState(true);
  
  const [calendarContent, setCalendarContent] = useState<string | null>(null);
  const [chartData, setChartData] = useState<MarketingCalendarData[]>([]);
  const [copied, setCopied] = useState(false);

  const languages = [
    "Simplified Chinese (简体中文)",
    "English (英文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
  ];

  const quarters = ["Full Year (全年)", "Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];

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
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  const handleGenerate = async () => {
    if (selectedCountries.length === 0) {
        alert("请至少选择一个目标国家。");
        return;
    }
    setLoading(true);
    setCalendarContent(null);
    setChartData([]);
    
    try {
      const countriesStr = selectedCountries.join(', ');
      const result = await generateMarketingCalendar(countriesStr, year, quarter, language);
      setCalendarContent(result.data.markdown);
      if (result.data.chartData && Array.isArray(result.data.chartData)) {
        setChartData(result.data.chartData);
      }
    } catch (error) {
      console.error(error);
      alert("生成日历失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!calendarContent) return;
    navigator.clipboard.writeText(calendarContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!calendarContent) return;
    exportToGoogleDocs(calendarContent, `Marketing Calendar ${year} ${quarter}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            主要国家营销日历
          </h2>
          <p className="text-sm text-slate-400 mt-1">规划全球主要市场的营销节点与节日活动。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar relative">
          
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <MapPin className="w-3 h-3" /> 目标国家 (多选)
            </label>
            
            {/* Custom Multi-Select Trigger */}
            <div 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[46px] cursor-pointer hover:border-slate-600 transition-colors flex flex-wrap gap-2 items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto custom-scrollbar p-2">
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

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">年份</label>
                <input 
                  type="number" 
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">季度/周期</label>
                <select 
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {quarters.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
             </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Globe className="w-3 h-3" /> 输出语言
            </label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Chart Toggle */}
          <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
            <div className={`p-2 rounded-lg ${showChart ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-white block">可视化数据分析</span>
              <span className="text-xs text-slate-500">展示热度与历史 ROAS 表现</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={showChart} onChange={(e) => setShowChart(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Search className="w-3 h-3" /> 包含内容
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">公共假期:</strong> 圣诞节、春节、开斋节等。</li>
               <li><strong className="text-slate-300">购物节:</strong> 黑五、双11、Prime Day。</li>
               <li><strong className="text-slate-300">文化事件:</strong> 体育赛事、大型展会 (E3, TGS)。</li>
               <li><strong className="text-slate-300">历史表现:</strong> 往期同类活动 ROAS/CTR 参考。</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
          {loading ? '正在规划日历...' : '生成营销日历'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {calendarContent ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">全球营销日历 {year}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className={`bg-slate-700 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制内容'}
                </button>
                <button 
                  onClick={handleExport}
                  className="bg-slate-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  title="复制并创建 Google 文档"
                >
                  <FileText className="w-4 h-4" />
                  导出到GOOGLE文档
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
               {showChart && chartData.length > 0 && (
                 <div className="mb-8 space-y-6">
                    {/* Performance Chart */}
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" /> 营销热度与历史 ROAS 表现
                      </h3>
                      <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} label={{ value: '热度', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}x`} label={{ value: 'ROAS', angle: 90, position: 'insideRight', fill: '#64748b' }} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                              cursor={{ fill: '#334155', opacity: 0.2 }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="intensity" name="Marketing Intensity" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.intensity > 80 ? '#f472b6' : entry.intensity > 50 ? '#818cf8' : '#34d399'} />
                              ))}
                              <LabelList dataKey="keyEvent" position="top" fill="#94a3b8" fontSize={10} angle={-45} offset={10} />
                            </Bar>
                            <Line yAxisId="right" type="monotone" dataKey="historicalRoas" name="Historical ROAS" stroke="#fbbf24" strokeWidth={3} dot={{r: 4, fill: '#fbbf24'}} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Historical Insights Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-indigo-500/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-white text-lg">{item.month}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.historicalRoas && item.historicalRoas > 1.5 ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                        ROAS: {item.historicalRoas || 'N/A'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400 mb-2 font-mono bg-black/20 p-1.5 rounded">
                                    Event: {item.keyEvent}
                                </div>
                                <div className="flex items-start gap-2">
                                    <History className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        {item.pastCampaignInsight || "暂无历史数据洞察。"}
                                    </p>
                                </div>
                                {item.historicalCtr && (
                                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-1.5">
                                        <TrendingUp className="w-3 h-3 text-blue-400" />
                                        <span className="text-xs text-slate-400">Avg. CTR: <span className="text-white">{item.historicalCtr}%</span></span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
               )}

               <div className="prose prose-invert prose-indigo max-w-none">
                  <ReactMarkdown>{calendarContent}</ReactMarkdown>
               </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Calendar className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">营销节点规划</p>
             <p className="text-sm max-w-xs text-center mt-2">输入目标市场与时间周期，AI 将为您生成关键营销节点日历及历史表现洞察。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingCalendar;


import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Globe, Send, Link as LinkIcon, Copy, Check, MapPin, X, ChevronDown, FileText, Search, Maximize2, Activity, Cpu } from 'lucide-react';
import { GameDetails, AiMetadata } from '../types';
import { generateOmnichannelStrategy } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, LabelList } from 'recharts';
import AiMetaDisplay from './AiMetaDisplay';

const OmnichannelStrategy: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  
  // Custom states for this component
  const [gpUrl, setGpUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [iosUrl, setIosUrl] = useState('https://apps.apple.com/us/app/color-block-combo-blast/id6478063606');

  // Country Selection State
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US', 'UK', 'CA']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [details, setDetails] = useState<GameDetails>({
    name: 'COLOR BLOCK',
    genre: 'Puzzle',
    targetAudience: '35-60岁女性, 喜爱休闲益智',
    budget: 1500000,
    market: 'US, UK, CA',
    usp: '休闲娱乐解压，打发碎片时间',
    promotionGoal: '最大化获取高留存目标用户，提升双端榜单排名',
    promotionPurpose: 'App Promotion (应用推广)',
  });

  const languages = [
    "Simplified Chinese (简体中文)",
    "English (英文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
  ];

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速)' },
  ];

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

  // Chart Data mimicking Product Life Cycle
  const lifecycleData = [
    { x: 0, y: 10 },
    { x: 25, y: 18, label: '新用户留存' },
    { x: 50, y: 35 },
    { x: 75, y: 65, label: '大力拉新' },
    { x: 100, y: 88 },
    { x: 125, y: 95, label: '活跃用户留存&营收' },
    { x: 150, y: 92 },
    { x: 175, y: 80, label: '流失用户召回&新方向' },
    { x: 200, y: 65 },
  ];

  // Custom Label Render
  const CustomLabel = (props: any) => {
    const { x, y, value } = props;
    if (!value) return null;
    return (
      <text 
        x={x} 
        y={y} 
        dy={-10} 
        fill="#f87171" 
        fontSize={10} 
        textAnchor="middle" 
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  // Sync selected countries to details.market
  useEffect(() => {
    setDetails(prev => ({
        ...prev,
        market: selectedCountries.join(', ')
    }));
  }, [selectedCountries]);

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
    if (!details.name) {
        alert("请输入游戏名称");
        return;
    }
    setLoading(true);
    setPlan(null);
    setMeta(null);
    try {
      const { data, meta } = await generateOmnichannelStrategy(details, gpUrl, iosUrl, language, selectedModel);
      setPlan(data);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("无法生成策略，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({
      ...prev,
      [name]: name === 'budget' ? Number(value) : value
    }));
  };

  const handleCopy = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!plan) return;
    exportToGoogleDocs(plan, `Omnichannel Strategy - ${details.name}`);
  };

  const LifecycleChart = ({ height = "100%" }: { height?: string | number }) => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={lifecycleData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
        <XAxis 
          dataKey="x" 
          type="number" 
          domain={[0, 200]} 
          ticks={[25, 75, 125, 175]} 
          tickFormatter={(val) => {
             if(val === 25) return '探索期';
             if(val === 75) return '成长期';
             if(val === 125) return '成熟期';
             if(val === 175) return '衰退期';
             return '';
          }}
          stroke="#94a3b8"
          fontSize={12}
          tickMargin={10}
        />
        <YAxis hide domain={[0, 110]} />
        <ReferenceLine x={50} stroke="#64748b" strokeDasharray="3 3" />
        <ReferenceLine x={100} stroke="#64748b" strokeDasharray="3 3" />
        <ReferenceLine x={150} stroke="#64748b" strokeDasharray="3 3" />
        
        <Line 
          type="monotone" 
          dataKey="y" 
          stroke="#2dd4bf" 
          strokeWidth={3} 
          dot={{ r: 3, fill: "#2dd4bf" }}
          isAnimationActive={true}
        >
          <LabelList content={<CustomLabel />} dataKey="label" />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            全渠道发行策略
          </h2>
          <p className="text-sm text-slate-400 mt-1">生成包含买量与 ASO 的全案发行计划。</p>
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏名称</label>
            <input 
              type="text" 
              name="name" 
              value={details.name} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Google Play 链接</label>
            <div className="relative">
              <input 
                type="text" 
                value={gpUrl} 
                onChange={(e) => setGpUrl(e.target.value)}
                placeholder="https://play.google.com/store/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
              <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">App Store 链接</label>
            <div className="relative">
              <input 
                type="text" 
                value={iosUrl} 
                onChange={(e) => setIosUrl(e.target.value)}
                placeholder="https://apps.apple.com/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
              <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">目标受众画像</label>
            <input 
              type="text" 
              name="targetAudience" 
              value={details.targetAudience} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">单季度预算 ($)</label>
            <input 
              type="number" 
              name="budget" 
              value={details.budget} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">推广目的</label>
            <input 
              type="text"
              name="promotionPurpose" 
              value={details.promotionPurpose} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">推广目标</label>
            <input 
              type="text"
              name="promotionGoal" 
              value={details.promotionGoal} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Globe className="w-3 h-3" /> 输出语言
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Cpu className="w-3 h-3" /> AI 模型
              </label>
              <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {modelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? '全案生成中...' : '生成全渠道发行策略'}
          </button>

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Search className="w-3 h-3" /> 策略维度
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Channel Mix:</strong> 应用商店、媒体渠道、预装、Ad Networks、DSP、品牌、积分墙、网赚等。</li>
               <li><strong className="text-slate-300">Media Buying:</strong> 预算分配、受众定向、竞价策略。</li>
               <li><strong className="text-slate-300">ASO Strategy:</strong> 双端关键词、元数据优化建议。</li>
               <li><strong className="text-slate-300">Creative:</strong> 针对不同渠道的素材方向与形式。</li>
               <li><strong className="text-slate-300">Phasing:</strong> 测试期、爆发期、稳定期的节奏规划。</li>
               <li><strong className="text-slate-300">KPIs:</strong> 核心指标基准 (CPI, ROAS, Retention)。</li>
             </ul>
             
             {/* Chart Trigger Section */}
             <div className="mt-4 pt-3 border-t border-indigo-500/20">
                <div 
                  className="bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-900 transition-colors group relative overflow-hidden"
                  onClick={() => setShowChartModal(true)}
                >
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-teal-400" />
                        产品生命周期目标
                      </span>
                      <Maximize2 className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                   </div>
                   <div className="h-24 w-full pointer-events-none opacity-80">
                      <LifecycleChart height="100%" />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none group-hover:bg-white/5 transition-colors"></div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {plan ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">全渠道发行与增长策略</h2>
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
            <div className="prose prose-invert prose-indigo max-w-none overflow-y-auto pr-4 custom-scrollbar">
               <ReactMarkdown>{plan}</ReactMarkdown>
               <AiMetaDisplay metadata={meta} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Globe className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">全渠道增长规划</p>
             <p className="text-sm max-w-xs text-center mt-2">填写双端链接与预算目标，AI 将为您生成包含买量与 ASO 的完整发行方案。</p>
          </div>
        )}
      </div>

      {/* Chart Modal */}
      {showChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowChartModal(false)}>
          <div className="bg-slate-900 border border-slate-700 w-[800px] max-w-[95vw] rounded-2xl shadow-2xl overflow-hidden p-6" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-teal-400" />
                  产品生命周期目标图表
                </h3>
                <button onClick={() => setShowChartModal(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
             </div>
             
             <div className="h-[400px] w-full bg-slate-950/50 rounded-xl border border-slate-800 p-4">
                <LifecycleChart height="100%" />
             </div>
             
             <div className="mt-6 grid grid-cols-4 gap-4 text-center">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                   <div className="text-xs text-slate-400 font-bold uppercase mb-1">探索期</div>
                   <div className="text-red-400 font-bold text-sm">新用户留存</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                   <div className="text-xs text-slate-400 font-bold uppercase mb-1">成长期</div>
                   <div className="text-red-400 font-bold text-sm">大力拉新</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                   <div className="text-xs text-slate-400 font-bold uppercase mb-1">成熟期</div>
                   <div className="text-red-400 font-bold text-sm">活跃留存 & 营收</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                   <div className="text-xs text-slate-400 font-bold uppercase mb-1">衰退期</div>
                   <div className="text-red-400 font-bold text-sm">召回 & 新方向</div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OmnichannelStrategy;

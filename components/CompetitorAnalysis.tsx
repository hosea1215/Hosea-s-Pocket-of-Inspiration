
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Swords, Loader2, Copy, Check, Link as LinkIcon, Search, RefreshCw, BarChart2, Globe, Clock, Users, Percent, Target, Heart, Briefcase, Wallet, Gamepad2, Layers, Repeat, Zap, Bell, Volume2, Store, Palette, MessageCircle, Share2, Code, Flag, AlertTriangle, User, Calendar, TrendingUp, Smartphone, MessageSquare, FileText, Cpu, Filter, X, ChevronDown } from 'lucide-react';
import { analyzeCompetitor, extractGameNameFromUrl } from '../services/geminiService';
import { CompetitorMetrics, TargetAudience, CompetitorReport, MarketPerformance, AiMetadata } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { exportToGoogleDocs } from '../utils/exportUtils';
import AiMetaDisplay from './AiMetaDisplay';

const dimensionOptions = [
  { key: 'marketAnalysis', label: '市场分析 (Market Analysis)' },
  { key: 'productAnalysis', label: '产品体验 (Product Experience)' },
  { key: 'coreGameplay', label: '核心玩法 (Core Gameplay)' },
  { key: 'abacrAnalysis', label: '关卡设计 (ABACR)' },
  { key: 'hookedModel', label: '上瘾模型 (Hooked Model)' },
  { key: 'emotionalAttachment', label: '情感挂念 (Emotional Attachment)' },
  { key: 'pushStrategy', label: 'Push策略 (Push Strategy)' },
  { key: 'asmrPotential', label: 'ASMR潜力 (ASMR Potential)' },
  { key: 'monetization', label: '商业化 (Monetization)' },
  { key: 'liveOps', label: '长线运营 (LiveOps)' },
  { key: 'gameEvents', label: '活动设计 (Game Events)' },
  { key: 'branding', label: '品牌叙事 (Branding)' },
  { key: 'community', label: '社群运营 (Community)' },
  { key: 'ipPotential', label: 'IP联动 (IP Potential)' },
  { key: 'techStack', label: '技术架构 (Tech Stack)' },
  { key: 'localization', label: '本地化 (Localization)' },
  { key: 'userReviews', label: '用户评论 (User Reviews)' },
  { key: 'swot', label: 'SWOT分析 (SWOT)' },
];

const CompetitorAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [extractingName, setExtractingName] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  
  // Dimension Selection State
  const [limitDimensions, setLimitDimensions] = useState(false);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<CompetitorReport | null>(null);
  const [metrics, setMetrics] = useState<CompetitorMetrics | null>(null);
  const [audience, setAudience] = useState<TargetAudience | null>(null);
  const [market, setMarket] = useState<MarketPerformance | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [copied, setCopied] = useState(false);

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速)' },
  ];

  const languages = [
    "Simplified Chinese (简体中文)",
    "English (英文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
    "Spanish (西班牙语)",
    "Portuguese (葡萄牙语)",
    "German (德语)",
    "French (法语)"
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

  const toggleDimension = (key: string) => {
    setSelectedDimensions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const removeDimension = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDimensions(prev => prev.filter(k => k !== key));
  };

  const handleAnalyze = async () => {
    if (!gameName || !storeUrl) {
      alert("请填写游戏名称和商店链接");
      return;
    }
    setLoading(true);
    setReport(null);
    setMetrics(null);
    setAudience(null);
    setMarket(null);
    setMeta(null);
    
    try {
      // If limited, pass only selected dimensions map keys
      const dimensionsToAnalyze = limitDimensions && selectedDimensions.length > 0 
        ? selectedDimensions 
        : undefined;

      const { data, meta } = await analyzeCompetitor(gameName, storeUrl, language, selectedModel, dimensionsToAnalyze);
      setReport(data.report);
      setMetrics(data.metrics);
      setAudience(data.audience);
      setMarket(data.market);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleExtractName = async () => {
    if (!storeUrl) {
      alert("请先填写商店链接");
      return;
    }
    setExtractingName(true);
    try {
      const name = await extractGameNameFromUrl(storeUrl);
      setGameName(name);
    } catch (error) {
      console.error(error);
      alert("提取名称失败，请手动输入。");
    } finally {
      setExtractingName(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    // Only copy non-empty fields
    const fullText = Object.entries(report)
        .filter(([_, value]) => value)
        .map(([_, value]) => value)
        .join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!report) return;
    
    let markdown = `# Competitor Analysis: ${gameName}\n\n`;
    
    // Metrics Section
    if (metrics) {
        markdown += `## 1. Key Metrics (关键指标)\n\n`;
        markdown += `| Metric | Value |\n|---|---|\n`;
        markdown += `| Retention D1 | ${metrics.d1} |\n`;
        markdown += `| Retention D7 | ${metrics.d7} |\n`;
        markdown += `| Retention D30 | ${metrics.d30} |\n`;
        markdown += `| Avg Session | ${metrics.avgSessionDuration} |\n`;
        markdown += `| Est. DAU | ${metrics.estimatedDau} |\n`;
        markdown += `| Top Countries | ${metrics.topCountries?.join(', ')} |\n\n`;
    }

    // Market Performance Section
    if (market) {
        markdown += `## 2. Market Performance (市场表现)\n\n`;
        
        if (market.financialTrends?.length > 0) {
            markdown += `### Financial Trends\n`;
            markdown += `| Month | Downloads | Revenue |\n|---|---|---|\n`;
            market.financialTrends.forEach(t => {
                markdown += `| ${t.month} | ${t.downloads} | ${t.revenue} |\n`;
            });
            markdown += `\n`;
        }

        if (market.rankingHistory?.length > 0) {
            markdown += `### Ranking History\n`;
            markdown += `| Month | Free Rank | Grossing Rank |\n|---|---|---|\n`;
            market.rankingHistory.forEach(t => {
                markdown += `| ${t.month} | ${t.freeRank} | ${t.grossingRank} |\n`;
            });
            markdown += `\n`;
        }

        if (market.genderDistribution?.length > 0) {
            markdown += `### Demographics\n`;
            markdown += `- **Gender:** ${market.genderDistribution.map(d => `${d.name}: ${d.value}%`).join(', ')}\n`;
            markdown += `- **Age:** ${market.ageDistribution?.map(d => `${d.name}: ${d.value}%`).join(', ')}\n\n`;
        }
    }

    // Audience Section
    if (audience) {
        markdown += `## 3. Target Audience (目标受众)\n\n`;
        markdown += `- **Age/Gender:** ${audience.age}, ${audience.gender}\n`;
        markdown += `- **Location:** ${audience.countries?.join(', ')}\n`;
        markdown += `- **Occupation/Income:** ${audience.occupation?.join(', ')} | ${audience.income}\n`;
        markdown += `- **Interests:** ${audience.interests?.join(', ')}\n`;
        markdown += `- **Relationship:** ${audience.relationship}\n\n`;
    }

    // Detailed Report Section
    markdown += `## 4. Detailed Analysis (深度拆解)\n\n`;
    markdown += Object.entries(report)
      .filter(([_, value]) => value) // Only include present values
      .map(([key, value]) => `### ${key.replace(/([A-Z])/g, ' $1').trim()}\n${value}`)
      .join('\n\n');

    exportToGoogleDocs(markdown, `Competitor Analysis - ${gameName}`);
  };

  const MetricCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string, color: string }) => (
    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-1">
       <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
         <Icon className={`w-3 h-3 ${color}`} />
         {title}
       </div>
       <div className="text-white font-mono font-semibold text-sm truncate" title={value}>
         {value}
       </div>
    </div>
  );

  const AnalysisCard = ({ title, icon: Icon, content, colorClass }: { title: string, icon: React.ElementType, content: string, colorClass: string }) => {
     if (!content) return null; // Don't render empty cards
     return (
     <div className="bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600 transition-all flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
        <div className={`px-4 py-3 border-b border-slate-800 flex items-center gap-2 ${colorClass} bg-slate-900/50`}>
          <Icon className="w-4 h-4" />
          <h3 className="font-bold text-sm">{title}</h3>
        </div>
        <div className="p-4 prose prose-invert prose-sm max-w-none flex-1 overflow-hidden overflow-y-auto custom-scrollbar max-h-[300px]">
           <ReactMarkdown>{content}</ReactMarkdown>
        </div>
     </div>
     );
  };

  const COLORS = ['#818cf8', '#34d399', '#f472b6', '#facc15', '#60a5fa', '#a78bfa'];

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-400" />
            竞品数据与玩法拆解
          </h2>
          <p className="text-sm text-slate-400 mt-1">深度剖析竞品的核心机制、商业化模型及估算数据。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏商店链接</label>
            <div className="relative">
              <input 
                type="text" 
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://play.google.com/store/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
              <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              AI 将访问链接（或基于知识库）分析游戏的商店页信息、截图及描述。
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">竞品游戏名称</label>
              <button 
                onClick={handleExtractName}
                disabled={extractingName}
                className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {extractingName ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {extractingName ? '读取中' : '读取商店名称'}
              </button>
            </div>
            <input 
              type="text" 
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

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

          {/* Dimension Limiting Toggle */}
          <div>
             <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                   <Filter className="w-3 h-3" /> 是否限定分析纬度
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={limitDimensions} 
                    onChange={(e) => setLimitDimensions(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>

             {limitDimensions && (
                <div ref={dropdownRef} className="relative animate-in fade-in slide-in-from-top-2">
                    <div 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 min-h-[42px] cursor-pointer hover:border-slate-600 transition-colors flex flex-wrap gap-2 items-center"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {selectedDimensions.length === 0 && <span className="text-slate-500 text-xs">选择需要分析的维度...</span>}
                        {selectedDimensions.map(key => {
                            const option = dimensionOptions.find(opt => opt.key === key);
                            return (
                                <span key={key} className="bg-indigo-600/20 text-indigo-300 text-[10px] px-2 py-1 rounded flex items-center gap-1 border border-indigo-600/30">
                                    {option?.label.split(' (')[0]}
                                    <X 
                                        className="w-3 h-3 hover:text-white cursor-pointer" 
                                        onClick={(e) => removeDimension(key, e)}
                                    />
                                </span>
                            );
                        })}
                        <div className="ml-auto">
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                            {dimensionOptions.map((opt) => {
                                const isSelected = selectedDimensions.includes(opt.key);
                                return (
                                    <div 
                                        key={opt.key} 
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border ${isSelected ? 'bg-indigo-600/20 border-indigo-600/50' : 'hover:bg-slate-800 border-transparent'}`}
                                        onClick={() => toggleDimension(opt.key)}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`text-xs ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{opt.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
             )}
          </div>

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Search className="w-3 h-3" /> 分析维度概览
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">市场表现:</strong> 综合评价与趋势分析</li>
               <li><strong className="text-slate-300">产品体验:</strong> UI/UX与美术风格</li>
               <li><strong className="text-slate-300">用户评论:</strong> 商店页好评与差评点分析</li>
               <li><strong className="text-slate-300">核心循环:</strong> 玩法机制拆解</li>
               <li><strong className="text-slate-300">A-B-A-C-R:</strong> 游戏关卡设计模式</li>
               <li><strong className="text-slate-300">市场数据:</strong> 下载/收入趋势与排名</li>
               <li><strong className="text-slate-300">目标受众:</strong> 深度画像分析</li>
               <li><strong className="text-slate-300">HOOKED:</strong> 上瘾模型分析</li>
               <li><strong className="text-slate-300">挂念感:</strong> 离线情感链接</li>
               <li><strong className="text-slate-300">Push设计:</strong> 召回策略分析</li>
               <li><strong className="text-slate-300">ASMR:</strong> 听觉营销潜力</li>
               <li><strong className="text-slate-300">LiveOps:</strong> 商店与活动分析</li>
               <li><strong className="text-slate-300">游戏活动:</strong> 长短周期组合</li>
               <li><strong className="text-slate-300">品牌化:</strong> 视觉与叙事策略</li>
               <li><strong className="text-slate-300">社群:</strong> 用户运营与UGC</li>
               <li><strong className="text-slate-300">IP联动:</strong> 潜在合作推荐</li>
               <li><strong className="text-slate-300">技术栈:</strong> 引擎与架构推测</li>
               <li><strong className="text-slate-300">本地化:</strong> 多语言适配质量</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
          {loading ? '正在拆解竞品...' : '开始拆解'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {report || metrics ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">竞品分析报告</h2>
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
            
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
              {/* KPI Benchmarks Panel */}
              {metrics && (
                <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">关键数据指标 (KPI Benchmarks)</h3>
                    <span className="text-xs text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded">行业估算值</span>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <MetricCard icon={Percent} title="次日留存 (D1)" value={metrics.d1} color="text-green-400" />
                    <MetricCard icon={Percent} title="7日留存 (D7)" value={metrics.d7} color="text-blue-400" />
                    <MetricCard icon={Percent} title="30日留存 (D30)" value={metrics.d30} color="text-purple-400" />
                    <MetricCard icon={Clock} title="平均时长" value={metrics.avgSessionDuration} color="text-yellow-400" />
                    <MetricCard icon={Users} title="DAU 估算" value={metrics.estimatedDau} color="text-pink-400" />
                    
                    {/* Top Countries List */}
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 flex flex-col gap-1">
                       <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
                         <Globe className="w-3 h-3 text-cyan-400" /> Top Countries (主要国家)
                       </div>
                       <div className="text-white font-mono font-medium text-xs leading-relaxed line-clamp-2" title={metrics.topCountries?.join(', ')}>
                         {metrics.topCountries?.join(', ') || 'N/A'}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Market Performance Module */}
              {market && (market.financialTrends?.length > 0 || market.rankingHistory?.length > 0) && (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5">
                   <div className="flex items-center gap-2 mb-5">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-white">市场表现维度 (Market Performance)</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                      {/* Trend Chart */}
                      {market.financialTrends?.length > 0 && (
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 h-[300px]">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">下载量与收入趋势 (Est.)</h4>
                         <ResponsiveContainer width="100%" height="90%">
                           <ComposedChart data={market.financialTrends}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                             <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                             <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                             <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                             <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }} />
                             <Legend />
                             <Bar yAxisId="left" dataKey="downloads" name="Downloads" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} />
                             <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#10b981" strokeWidth={2} dot={{r: 3}} />
                           </ComposedChart>
                         </ResponsiveContainer>
                      </div>
                      )}

                      {/* Ranking Chart */}
                      {market.rankingHistory?.length > 0 && (
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 h-[300px]">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">榜单排名趋势 (Ranking)</h4>
                         <ResponsiveContainer width="100%" height="90%">
                           <LineChart data={market.rankingHistory}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                             <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                             <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} reversed domain={[1, 200]} />
                             <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }} />
                             <Legend />
                             <Line type="monotone" dataKey="freeRank" name="Free Rank" stroke="#f472b6" strokeWidth={2} dot={{r: 3}} />
                             <Line type="monotone" dataKey="grossingRank" name="Grossing Rank" stroke="#facc15" strokeWidth={2} dot={{r: 3}} />
                           </LineChart>
                         </ResponsiveContainer>
                      </div>
                      )}
                   </div>

                   {/* Demographics */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {market.genderDistribution?.length > 0 && (
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 h-[250px] flex flex-col">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">性别分布 (Gender)</h4>
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={market.genderDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {market.genderDistribution?.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index === 0 ? '#60a5fa' : '#f472b6'} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }} />
                              <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                      )}

                      {market.ageDistribution?.length > 0 && (
                      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 h-[250px] flex flex-col">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">年龄层分布 (Age)</h4>
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={market.ageDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {market.ageDistribution?.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }} />
                              <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                      )}
                   </div>
                </div>
              )}

              {/* Target Audience Persona */}
              {audience && (
                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">目标受众画像 (Target Audience Persona)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">年龄/性别</p>
                       <p className="text-white font-medium">{audience.age}, {audience.gender}</p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">主要市场</p>
                       <p className="text-white font-medium">{audience.countries.join(', ')}</p>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">职业/收入</p>
                       <p className="text-white font-medium text-xs">{audience.occupation.join(', ')} | {audience.income}</p>
                    </div>
                     <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                       <p className="text-xs text-slate-500 uppercase font-bold mb-1">兴趣标签</p>
                       <div className="flex flex-wrap gap-1">
                          {audience.interests.map((tag, i) => (
                            <span key={i} className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Report Sections Grid */}
              {report && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                   <AnalysisCard title="市场分析 (Market Analysis)" icon={TrendingUp} content={report.marketAnalysis} colorClass="text-blue-400" />
                   <AnalysisCard title="产品体验 (Product Experience)" icon={Smartphone} content={report.productAnalysis} colorClass="text-purple-400" />
                   <AnalysisCard title="核心玩法拆解 (Core Gameplay)" icon={Gamepad2} content={report.coreGameplay} colorClass="text-indigo-400" />
                   <AnalysisCard title="A-B-A-C-R 关卡设计" icon={Repeat} content={report.abacrAnalysis} colorClass="text-pink-400" />
                   <AnalysisCard title="上瘾模型 (Hooked Model)" icon={Layers} content={report.hookedModel} colorClass="text-red-400" />
                   <AnalysisCard title="情感挂念 (Emotional Attachment)" icon={Heart} content={report.emotionalAttachment} colorClass="text-rose-400" />
                   <AnalysisCard title="Push 召回策略" icon={Bell} content={report.pushStrategy} colorClass="text-yellow-400" />
                   <AnalysisCard title="ASMR 听觉营销" icon={Volume2} content={report.asmrPotential} colorClass="text-cyan-400" />
                   <AnalysisCard title="商业化设计 (Monetization)" icon={Wallet} content={report.monetization} colorClass="text-emerald-400" />
                   <AnalysisCard title="LiveOps 运营" icon={Store} content={report.liveOps} colorClass="text-orange-400" />
                   <AnalysisCard title="游戏活动设计" icon={Calendar} content={report.gameEvents} colorClass="text-teal-400" />
                   <AnalysisCard title="品牌叙事 (Branding)" icon={Palette} content={report.branding} colorClass="text-fuchsia-400" />
                   <AnalysisCard title="社群运营 (Community)" icon={MessageCircle} content={report.community} colorClass="text-sky-400" />
                   <AnalysisCard title="IP 联动潜力" icon={Share2} content={report.ipPotential} colorClass="text-violet-400" />
                   <AnalysisCard title="技术架构推测" icon={Code} content={report.techStack} colorClass="text-slate-400" />
                   <AnalysisCard title="本地化质量" icon={Flag} content={report.localization} colorClass="text-green-400" />
                   <AnalysisCard title="用户评论分析" icon={MessageSquare} content={report.userReviews} colorClass="text-lime-400" />
                   <AnalysisCard title="SWOT 分析" icon={AlertTriangle} content={report.swot} colorClass="text-amber-400" />
                </div>
              )}
              
              <AiMetaDisplay metadata={meta} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Swords className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">竞品深度解构</p>
             <p className="text-sm max-w-xs text-center mt-2">输入商店链接，AI 将自动分析并生成 18 个维度的深度拆解报告。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorAnalysis;

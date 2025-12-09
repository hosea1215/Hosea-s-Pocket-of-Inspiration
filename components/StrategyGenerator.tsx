
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Zap, Send, Link as LinkIcon, Copy, Check, Search, FileText, Globe, MapPin, X, ChevronDown, Cpu } from 'lucide-react';
import { GameDetails, AiMetadata } from '../types';
import { generateMarketingPlan, generateAsoAnalysis } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';
import AiMetaDisplay from './AiMetaDisplay';

interface StrategyGeneratorProps {
  platform?: string;
}

const StrategyGenerator: React.FC<StrategyGeneratorProps> = ({ platform = "Facebook" }) => {
  const [loading, setLoading] = useState(false);
  const [asoLoading, setAsoLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  
  // Country Selection State
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['US', 'UK', 'CA']);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [details, setDetails] = useState<GameDetails>({
    name: 'COLOR BLOCK',
    genre: 'Puzzle (益智)',
    targetAudience: '35-60岁女性',
    budget: 900000,
    market: 'US, UK, CA',
    usp: '休闲娱乐解压，打发碎片时间',
    gameplay: '拖动彩色方块进行消除，无尽模式，无需联网。',
    promotionGoal: '最大化获取高留存目标用户',
    promotionPurpose: 'App Promotion (应用推广)',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend'
  });

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

  // Full Google Play Categories with Chinese Translations
  const googlePlayGenres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Educational (教育)", 
    "Music (音乐)", "Puzzle (益智)", "Racing (赛车)", "Role Playing (角色扮演)", 
    "Simulation (模拟)", "Sports (体育)", "Strategy (策略)", "Trivia (问答)", 
    "Word (文字)"
  ];

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
    if (selectedCountries.length === 0) {
        alert("请至少选择一个目标国家。");
        return;
    }
    setLoading(true);
    setPlan(null);
    setMeta(null);
    try {
      const { data, meta } = await generateMarketingPlan(details, platform, language, selectedModel);
      setPlan(data);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("无法生成策略，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAsoAnalysis = async () => {
    if (selectedCountries.length === 0) {
        alert("请至少选择一个目标国家。");
        return;
    }
    setAsoLoading(true);
    setPlan(null); 
    setMeta(null);
    try {
      const { data, meta } = await generateAsoAnalysis(details, language, selectedModel);
      setPlan(data);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("无法生成 ASO 分析，请重试。");
    } finally {
      setAsoLoading(false);
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
    exportToGoogleDocs(plan, `${platform} Marketing Strategy - ${details.name}`);
  };

  const isOEM = platform === 'OEM (Pre-install)';
  const isWeb2App = platform === 'Web2App';

  const strategyDimensions: Record<string, { label: string; value: string }[]> = {
    "OEM (Pre-install)": [
      { label: "厂商生态", value: "Samsung, Xiaomi, OPPO, vivo, Transsion" },
      { label: "核心资源位", value: "应用商店 (Store), 负一屏, 游戏中心, OOBE (开机向导)" },
      { label: "计费模式", value: "CPD (下载), CPT (时长), CPA (激活), CPD (天)" },
      { label: "归因逻辑", value: "设备号匹配 (IMEI/OAID), 预装归因窗口期" },
      { label: "用户价值", value: "运营商与机型决定用户LTV上限，需针对性出价" },
      { label: "素材注意", value: "素材需符合厂商生态审美，避免过度商业化设计" },
      { label: "激活延时", value: "预装到达与用户激活存在时间差，数据回传有滞后性" },
      { label: "渠道配合", value: "与买量渠道打配合战，覆盖盲区，提升整体渗透率" }
    ],
    "Web2App": [
      { label: "落地页策略", value: "Landing Page (Article, Quiz, Store-lookalike)" },
      { label: "归因链路", value: "Web-to-App Attribution, SKAdNetwork, Probabilistic" },
      { label: "漏斗优化", value: "Click -> LP View -> Store View -> Install -> Event" },
      { label: "合规风险", value: "Cloaking, Platform Policy (Google/FB/Apple)" }
    ],
    "Facebook": [
      { label: "广告架构", value: "AAA vs Manual Campaigns" },
      { label: "受众定向", value: "Broad, Lookalike, Interest" },
      { label: "素材形式", value: "Video, Static, Playable" },
      { label: "竞价策略", value: "Lowest Cost, Cost Cap, Bid Cap" }
    ],
    "Google Ads": [
      { label: "Campaign Type", value: "App Campaigns (AC) 1.0/2.0/3.0" },
      { label: "网络覆盖", value: "Search, Play, YouTube, Display" },
      { label: "素材资产", value: "Text, Image, Video, HTML5" },
      { label: "出价模式", value: "tCPI, tROAS" }
    ],
    "TikTok Ads": [
      { label: "广告形式", value: "In-Feed Ads, Pangle, TopView" },
      { label: "受众定向", value: "Hashtags, Creators, Behaviors" },
      { label: "素材风格", value: "UGC-style, Native, Fast-paced" },
      { label: "竞价策略", value: "Cost Cap, Lowest Cost" }
    ],
    "Apple Search Ads": [
      { label: "广告位", value: "Search Tab, Search Results, Today Tab" },
      { label: "关键词策略", value: "Brand, Generic, Competitor, Discovery" },
      { label: "匹配模式", value: "Exact Match, Broad Match" },
      { label: "受众", value: "New vs Returning Users" }
    ],
    "AppLovin": [
      { label: "广告形式", value: "Rewarded Video, Interstitial, Banner" },
      { label: "竞价模式", value: "MAX Bidding (Header Bidding)" },
      { label: "优选", value: "IAP ROAS, Ad ROAS" },
      { label: "素材", value: "Playable Ads, Video" }
    ]
  };

  const currentDimensions = strategyDimensions[platform] || [
      { label: "广告架构", value: "Campaign Structure & Setup" },
      { label: "受众定向", value: "Targeting & Segmentation" },
      { label: "素材策略", value: "Creative Formats & Angles" },
      { label: "竞价优化", value: "Bidding & Budget Allocation" }
  ];

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            {platform} 广告策略生成
          </h2>
          <p className="text-sm text-slate-400 mt-1">提供您的游戏信息以生成定制的 {platform} 用户获取策略。</p>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏商店页地址</label>
            <div className="relative">
              <input 
                type="text" 
                name="storeUrl" 
                value={details.storeUrl || ''} 
                onChange={handleInputChange}
                placeholder="https://play.google.com/store/apps/details?id=..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
              <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏类型 (Google Play)</label>
            <select 
              name="genre" 
              value={details.genre} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {googlePlayGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">核心玩法 (ASO 关键信息)</label>
            <textarea 
              name="gameplay" 
              rows={2}
              value={details.gameplay || ''} 
              onChange={handleInputChange}
              placeholder="简述玩法机制，例如：拖动方块消除..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">推广目标</label>
            <input 
              type="text"
              name="promotionGoal" 
              value={details.promotionGoal} 
              onChange={handleInputChange}
              placeholder="例如：新品测试，ROAS > 20%，扩量增长"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">推广目的</label>
            <select 
              name="promotionPurpose" 
              value={details.promotionPurpose} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="App Promotion (应用推广)">App Promotion (应用推广)</option>
              <option value="Awareness (品牌知名度)">Awareness (品牌知名度)</option>
              <option value="Traffic (流量)">Traffic (流量)</option>
              <option value="Engagement (互动)">Engagement (互动)</option>
              <option value="Leads (潜在客户)">Leads (潜在客户)</option>
              <option value="Sales (销量)">Sales (销量)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">季度预算 ($)</label>
            <input 
              type="number" 
              name="budget" 
              value={details.budget} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">目标受众</label>
            <input 
              type="text" 
              name="targetAudience" 
              value={details.targetAudience} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">独特卖点 (USP)</label>
            <textarea 
              name="usp" 
              rows={3}
              value={details.usp} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
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
            disabled={loading || asoLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? '分析中...' : `生成 ${platform} 广告策略`}
          </button>
          
          { !isOEM && !isWeb2App && (
            <button 
              onClick={handleAsoAnalysis} 
              disabled={loading || asoLoading}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
            >
              {asoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {asoLoading ? '分析中...' : 'ASO 关键词分析'}
            </button>
          )}

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20 mt-2">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Search className="w-3 h-3" /> 策略维度
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               {currentDimensions.map((dim, idx) => (
                 <li key={idx}>
                   <strong className="text-slate-300">{dim.label}:</strong> {dim.value}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {plan ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">生成的策略方案 ({platform})</h2>
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
             <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Zap className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">准备规划</p>
             <p className="text-sm max-w-xs text-center mt-2">填写左侧详情，点击“生成 {platform} 广告策略”{ !isOEM && !isWeb2App ? '或“ASO 关键词分析”' : ''}。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyGenerator;

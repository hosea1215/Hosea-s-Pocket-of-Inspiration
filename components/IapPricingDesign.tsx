
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Tags, Loader2, Copy, Check, FileText, Globe, Gem } from 'lucide-react';
import { generateIapPricingStrategy } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';

const IapPricingDesign: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [region, setRegion] = useState('United States (USD)');
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [plan, setPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Full Google Play Categories
  const genres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Puzzle (益智)", 
    "Racing (赛车)", "Role Playing (角色扮演)", "Simulation (模拟)", 
    "Sports (体育)", "Strategy (策略)"
  ];

  const languages = [
    "Simplified Chinese (简体中文)",
    "English (英文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
  ];

  const handleGenerate = async () => {
    if (!gameName) return;
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateIapPricingStrategy(gameName, genre, region, language);
      setPlan(result);
    } catch (error) {
      console.error(error);
      alert("无法生成方案，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!plan) return;
    navigator.clipboard.writeText(plan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!plan) return;
    exportToGoogleDocs(plan, `IAP Pricing Portfolio - ${gameName}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-indigo-400" />
            内购计费组合设计
          </h2>
          <p className="text-sm text-slate-400 mt-1">设计符合地区消费习惯的商品定价与组合 (SKU Portfolio)。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏名称</label>
            <input 
              type="text" 
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏类型</label>
            <select 
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">目标地区/货币</label>
            <input 
              type="text" 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. Japan (JPY), Brazil (BRL)"
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Gem className="w-3 h-3" /> 设计要点
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Anchor Price:</strong> 设定基础货币汇率 (如 1元=10钻)。</li>
               <li><strong className="text-slate-300">SKU Ladder:</strong> 设计低、中、高档位 (e.g. $0.99, $4.99, $19.99...)。</li>
               <li><strong className="text-slate-300">Psychological Pricing:</strong> 尾数定价法 (e.g. $9.99 vs $10.00)。</li>
               <li><strong className="text-slate-300">Bundles:</strong> 礼包与订阅内容设计。</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Tags className="w-5 h-5" />}
          {loading ? '正在规划 SKU...' : '生成商品组合'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {plan ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">内购计费商品组合</h2>
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
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Tags className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">SKU 组合设计</p>
             <p className="text-sm max-w-xs text-center mt-2">输入地区与货币信息，AI 将为您生成符合当地消费习惯的商品矩阵。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IapPricingDesign;

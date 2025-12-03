
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Zap, Send, Link as LinkIcon, Copy, Check, Search } from 'lucide-react';
import { GameDetails } from '../types';
import { generateMarketingPlan, generateAsoAnalysis } from '../services/geminiService';

const StrategyGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [asoLoading, setAsoLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [details, setDetails] = useState<GameDetails>({
    name: 'COLOR BLOCK',
    genre: 'Puzzle (益智)',
    targetAudience: '35-60岁女性',
    budget: 900000,
    market: '美国, 英国, 加拿大',
    usp: '休闲娱乐解压，打发碎片时间',
    gameplay: '拖动彩色方块进行消除，无尽模式，无需联网。',
    promotionGoal: '最大化获取高留存目标用户',
    promotionPurpose: 'App Promotion (应用推广)',
    storeUrl: 'https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend'
  });

  const handleGenerate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const generatedPlan = await generateMarketingPlan(details);
      setPlan(generatedPlan);
    } catch (error) {
      console.error(error);
      alert("无法生成策略，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAsoAnalysis = async () => {
    setAsoLoading(true);
    setPlan(null); // Clear previous plan to show ASO results cleanly
    try {
      const analysis = await generateAsoAnalysis(details);
      setPlan(analysis);
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

  // Full Google Play Categories with Chinese Translations
  const googlePlayGenres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Educational (教育)", 
    "Music (音乐)", "Puzzle (益智)", "Racing (赛车)", "Role Playing (角色扮演)", 
    "Simulation (模拟)", "Sports (体育)", "Strategy (策略)", "Trivia (问答)", 
    "Word (文字)"
  ];

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            游戏详情
          </h2>
          <p className="text-sm text-slate-400 mt-1">提供您的游戏信息以生成定制的 Facebook 用户获取策略。</p>
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

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">目标市场</label>
            <input 
              type="text" 
              name="market" 
              value={details.market} 
              onChange={handleInputChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
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
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <button 
            onClick={handleGenerate} 
            disabled={loading || asoLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? '分析中...' : '生成 FB 广告策略'}
          </button>
          
          <button 
            onClick={handleAsoAnalysis} 
            disabled={loading || asoLoading}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
          >
            {asoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {asoLoading ? '分析中...' : 'ASO 关键词分析'}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {plan ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">生成的策略方案</h2>
              <div className="flex gap-2">
                 <button 
                  onClick={handleCopy}
                  className={`bg-slate-700 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                 >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制内容'}
                </button>
              </div>
            </div>
            <div className="prose prose-invert prose-indigo max-w-none overflow-y-auto pr-4 custom-scrollbar">
               <ReactMarkdown>{plan}</ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Zap className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">准备规划</p>
             <p className="text-sm max-w-xs text-center mt-2">填写左侧详情，点击“生成 FB 广告策略”或“ASO 关键词分析”。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyGenerator;

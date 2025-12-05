
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Gem, Loader2, Copy, Check, FileText, Globe, Shuffle, Zap } from 'lucide-react';
import { generateIapPlan, analyzeGameplayFromUrl } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';

const IapMonetization: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzingGameplay, setAnalyzingGameplay] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [gameplay, setGameplay] = useState('通过拖动不同形状的彩块填满行或列进行消除，类似俄罗斯方块。');
  const [targetAudience, setTargetAudience] = useState('休闲玩家，喜欢解压，碎片时间游戏');
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [plan, setPlan] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Full Google Play Categories with Chinese Translations
  const googlePlayGenres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Educational (教育)", 
    "Music (音乐)", "Puzzle (益智)", "Racing (赛车)", "Role Playing (角色扮演)", 
    "Simulation (模拟)", "Sports (体育)", "Strategy (策略)", "Trivia (问答)", 
    "Word (文字)"
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

  const handleGenerate = async () => {
    if (!gameName || !gameplay) return;
    setLoading(true);
    setPlan(null);
    try {
      const generatedPlan = await generateIapPlan(gameName, genre, gameplay, targetAudience, language);
      setPlan(generatedPlan);
    } catch (error) {
      console.error(error);
      alert("无法生成方案，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeGameplay = async () => {
    if (!gameName || !storeUrl) {
      alert("请确保已填写游戏名称和商店链接。");
      return;
    }
    setAnalyzingGameplay(true);
    try {
      const result = await analyzeGameplayFromUrl(gameName, storeUrl);
      setGameplay(result);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setAnalyzingGameplay(false);
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
    exportToGoogleDocs(plan, `IAP Monetization Strategy - ${gameName}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gem className="w-5 h-5 text-indigo-400" />
            IAP 游戏商业化方案
          </h2>
          <p className="text-sm text-slate-400 mt-1">设计基于内购的经济系统与付费点。</p>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏商店链接</label>
            <div className="relative">
              <input 
                type="text" 
                value={storeUrl}
                onChange={(e) => setStoreUrl(e.target.value)}
                placeholder="https://play.google.com/store/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏类型 (Google Play)</label>
            <select 
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {googlePlayGenres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">目标受众</label>
            <input 
              type="text" 
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">核心玩法描述</label>
                <button 
                  onClick={handleAnalyzeGameplay}
                  disabled={analyzingGameplay}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {analyzingGameplay ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shuffle className="w-3 h-3" />}
                  {analyzingGameplay ? '分析中' : 'AI 分析填入'}
                </button>
            </div>
            <textarea 
              rows={6}
              value={gameplay}
              onChange={(e) => setGameplay(e.target.value)}
              placeholder="详细描述游戏的操作方式、循环机制..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
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
               <Zap className="w-3 h-3" /> 内购设计重点
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">经济循环:</strong> 货币的产出与消耗设计。</li>
               <li><strong className="text-slate-300">商品设计:</strong> 新手礼包、月卡、限时特惠。</li>
               <li><strong className="text-slate-300">定价策略:</strong> 价格锚点、折扣心理学。</li>
               <li><strong className="text-slate-300">通行证/抽卡:</strong> 战令系统与随机宝箱机制。</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gem className="w-5 h-5" />}
          {loading ? '正在规划...' : '生成 IAP 方案'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {plan ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">IAP 经济模型与付费方案</h2>
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
               <Gem className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">IAP 经济规划</p>
             <p className="text-sm max-w-xs text-center mt-2">输入游戏详情，AI 将为您设计高 LTV 的经济系统与商品矩阵。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IapMonetization;

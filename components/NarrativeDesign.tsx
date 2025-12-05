
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Loader2, Copy, Check, Link as LinkIcon, Shuffle, FileText, Swords, Repeat, GitBranch, Share2, Globe } from 'lucide-react';
import { generateNarrativeAnalysis, analyzeGameplayFromUrl } from '../services/geminiService';
import { researchExplanations } from '../constants';
import { AppView, NarrativeResponse } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { exportToGoogleDocs } from '../utils/exportUtils';

const NarrativeDesign: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzingGameplay, setAnalyzingGameplay] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [gameplay, setGameplay] = useState('通过拖动不同形状的彩块填满行或列进行消除，类似俄罗斯方块。');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [result, setResult] = useState<NarrativeResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');

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

  // Full Google Play Categories with Chinese Translations
  const googlePlayGenres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Educational (教育)", 
    "Music (音乐)", "Puzzle (益智)", "Racing (赛车)", "Role Playing (角色扮演)", 
    "Simulation (模拟)", "Sports (体育)", "Strategy (策略)", "Trivia (问答)", 
    "Word (文字)"
  ];

  const handleGenerate = async () => {
    if (!gameName || !gameplay) {
      alert("请填写游戏名称和玩法描述");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await generateNarrativeAnalysis(gameName, gameplay, storeUrl, genre, language);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("生成分析失败，请重试。");
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
      const text = await analyzeGameplayFromUrl(gameName, storeUrl);
      setGameplay(text);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setAnalyzingGameplay(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    exportToGoogleDocs(result.analysis, `Narrative Design Analysis - ${gameName}`);
  };

  const chartData = result ? [
    { subject: '三幕结构', A: result.scores.threeAct, fullMark: 10 },
    { subject: '非线性叙事', A: result.scores.nonLinear, fullMark: 10 },
    { subject: '循环叙事', A: result.scores.circular, fullMark: 10 },
    { subject: '互动叙事', A: result.scores.interactive, fullMark: 10 },
  ] : [];

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            叙事设计理论
          </h2>
          <p className="text-sm text-slate-400 mt-1">分析游戏故事结构与玩家选择的结合，提升沉浸感。</p>
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
              <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
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
              rows={4}
              value={gameplay}
              onChange={(e) => setGameplay(e.target.value)}
              placeholder="详细描述游戏的操作方式、故事背景..."
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
               <BookOpen className="w-3 h-3" /> 四大叙事结构
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-none pl-1">
               <li className="flex items-start gap-2"><Swords className="w-3 h-3 text-yellow-400 shrink-0 mt-0.5"/> <span><strong>三幕结构:</strong> 开场→发展→结局 (线性)</span></li>
               <li className="flex items-start gap-2"><GitBranch className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5"/> <span><strong>非线性叙事:</strong> 多分支、多结局</span></li>
               <li className="flex items-start gap-2"><Repeat className="w-3 h-3 text-blue-400 shrink-0 mt-0.5"/> <span><strong>循环叙事:</strong> 重复但变化的 Roguelike 体验</span></li>
               <li className="flex items-start gap-2"><Share2 className="w-3 h-3 text-red-400 shrink-0 mt-0.5"/> <span><strong>互动叙事:</strong> 玩家选择驱动故事发展</span></li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
          {loading ? '正在解析叙事结构...' : '生成叙事分析'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {result ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">叙事设计分析报告</h2>
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
                
                {/* Theory Explanation Block */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6">
                  <h4 className="text-slate-200 font-bold text-sm mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    理论基础：{researchExplanations[AppView.NARRATIVE_DESIGN].title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {researchExplanations[AppView.NARRATIVE_DESIGN].content}
                  </p>
                </div>

                {/* Visual Representation */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                    <div className="w-full md:w-1/2 h-[250px] relative">
                        <div className="absolute top-0 left-0 text-xs font-bold text-slate-500">适配度评分 (0-10)</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                <Radar
                                    name="Narrative Suitability"
                                    dataKey="A"
                                    stroke="#818cf8"
                                    strokeWidth={2}
                                    fill="#818cf8"
                                    fillOpacity={0.4}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-1 text-yellow-400">
                                <Swords className="w-4 h-4" />
                                <span className="text-sm font-bold">三幕结构</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{result.scores.threeAct}<span className="text-xs text-slate-500 font-normal">/10</span></div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-1 text-emerald-400">
                                <GitBranch className="w-4 h-4" />
                                <span className="text-sm font-bold">非线性叙事</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{result.scores.nonLinear}<span className="text-xs text-slate-500 font-normal">/10</span></div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-1 text-blue-400">
                                <Repeat className="w-4 h-4" />
                                <span className="text-sm font-bold">循环叙事</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{result.scores.circular}<span className="text-xs text-slate-500 font-normal">/10</span></div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2 mb-1 text-red-400">
                                <Share2 className="w-4 h-4" />
                                <span className="text-sm font-bold">互动叙事</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{result.scores.interactive}<span className="text-xs text-slate-500 font-normal">/10</span></div>
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none">
                    <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <BookOpen className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">叙事结构分析</p>
             <p className="text-sm max-w-xs text-center mt-2">输入游戏信息，AI 将解析其最适合的叙事模式，提升情感共鸣。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NarrativeDesign;

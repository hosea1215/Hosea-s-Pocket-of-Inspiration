
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Repeat, Loader2, Copy, Check, Zap, Link as LinkIcon, Target, Shuffle, Sparkles, FileText, BookOpen, Globe } from 'lucide-react';
import { generateAbacrAnalysis, analyzeGameplayFromUrl, expandDesignPurpose } from '../services/geminiService';
import { researchExplanations } from '../constants';
import { AppView } from '../types';
import { exportToGoogleDocs } from '../utils/exportUtils';

const AbacrLoop: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzingGameplay, setAnalyzingGameplay] = useState(false);
  const [expandingPurpose, setExpandingPurpose] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [gameplay, setGameplay] = useState('拖动彩色方块到网格中，填满行或列消除。没有时间限制，但网格填满后游戏结束。连击会有特殊音效。一次消除多行多列或者清空所有色块会有额外的奖励。在这个过程中如何设计插屏广告与激励视频让用户保持心流体验的同时能取得更高的长期收入？');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [designPurpose, setDesignPurpose] = useState('增强用户游玩的心流体验，提升产品长期留存，让用户对产品产生挂念感。在这个过程中如何设计插屏广告与激励视频让用户保持心流体验的同时能取得更高的长期收入？');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');

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
    setAnalysis(null);
    try {
      const result = await generateAbacrAnalysis(gameName, genre, gameplay, storeUrl, designPurpose, language);
      setAnalysis(result);
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
      const result = await analyzeGameplayFromUrl(gameName, storeUrl);
      setGameplay(result);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setAnalyzingGameplay(false);
    }
  };

  const handleExpandPurpose = async () => {
    if (!designPurpose || !gameName) return;
    setExpandingPurpose(true);
    try {
      const result = await expandDesignPurpose(designPurpose, gameName);
      setDesignPurpose(result);
    } catch (error) {
      console.error(error);
      alert("扩展失败，请重试。");
    } finally {
      setExpandingPurpose(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!analysis) return;
    exportToGoogleDocs(analysis, `ABACR Model Analysis - ${gameName}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Repeat className="w-5 h-5 text-indigo-400" />
            A-B-A-C-R 游戏循环结构
          </h2>
          <p className="text-sm text-slate-400 mt-1">深度解构游戏的核心上瘾循环模型。</p>
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
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                 设计目的 <Target className="w-3 h-3 text-indigo-400" />
               </label>
               <button 
                  onClick={handleExpandPurpose}
                  disabled={expandingPurpose}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {expandingPurpose ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {expandingPurpose ? '扩展中' : 'AI 扩展填入'}
                </button>
            </div>
            <textarea 
              rows={5}
              value={designPurpose}
              onChange={(e) => setDesignPurpose(e.target.value)}
              placeholder="例如：提升用户留存，增强心流体验..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
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
              rows={5}
              value={gameplay}
              onChange={(e) => setGameplay(e.target.value)}
              placeholder="详细描述游戏的操作方式、反馈机制和胜利条件..."
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
               <Zap className="w-3 h-3" /> 关卡设计模式说明
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-none pl-1">
               <li className="mb-1"><strong className="text-slate-200 block mb-0.5">A (基础关):</strong> 教学与巩固 - 介绍核心机制，难度适中，玩家熟悉游戏</li>
               <li className="mb-1"><strong className="text-slate-200 block mb-0.5">B (变化关):</strong> 拓展与挑战 - 在 A 基础上增加新元素，难度提升</li>
               <li className="mb-1"><strong className="text-slate-200 block mb-0.5">A (复习关):</strong> 强化与反馈 - 再次应用 A 的机制，但结合 B 的元素，加深理解</li>
               <li className="mb-1"><strong className="text-slate-200 block mb-0.5">C (综合关):</strong> 考验与突破 - 整合 A、B 所有机制，设置高难度挑战</li>
               <li className="mb-1"><strong className="text-slate-200 block mb-0.5">R (奖励关):</strong> 放松与激励 - 提供轻松体验和丰厚奖励，为下一循环做准备</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Repeat className="w-5 h-5" />}
          {loading ? '结构分析中...' : '生成循环分析'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {analysis ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">A-B-A-C-R 模型分析报告</h2>
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

            {/* Theory Explanation Block */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6">
              <h4 className="text-slate-200 font-bold text-sm mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                理论基础：{researchExplanations[AppView.ABACR_LOOP].title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {researchExplanations[AppView.ABACR_LOOP].content}
              </p>
            </div>

            <div className="prose prose-invert prose-indigo max-w-none overflow-y-auto pr-4 custom-scrollbar">
               <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Repeat className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">游戏循环解构</p>
             <p className="text-sm max-w-xs text-center mt-2">输入玩法细节，AI 将深度剖析游戏的关卡编排与节奏控制。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbacrLoop;

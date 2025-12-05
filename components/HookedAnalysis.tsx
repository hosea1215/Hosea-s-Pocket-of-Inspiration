
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Magnet, Loader2, Copy, Check, Link as LinkIcon, Shuffle, Zap, FileText, BookOpen } from 'lucide-react';
import { generateHookedAnalysis, analyzeGameplayFromUrl } from '../services/geminiService';
import { researchExplanations } from '../constants';
import { AppView } from '../types';
import { exportToGoogleDocs } from '../utils/exportUtils';

const HookedAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [gameplay, setGameplay] = useState('通过拖动不同形状的彩块填满行或列进行消除，类似俄罗斯方块。');
  const [targetAudience, setTargetAudience] = useState('35-60岁女性，碎片时间娱乐，寻求放松解压');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!gameName || !gameplay) {
        alert("请填写游戏名称和玩法描述");
        return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await generateHookedAnalysis(gameName, gameplay, storeUrl, targetAudience);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeGameplay = async () => {
    if (!gameName || !storeUrl) {
      alert("请确保已填写游戏名称和商店链接。");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeGameplayFromUrl(gameName, storeUrl);
      setGameplay(result);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!analysis) return;
    const blob = new Blob([analysis], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = gameName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `hooked_analysis_${safeName}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (!analysis) return;
    exportToGoogleDocs(analysis, `Hooked Model Analysis - ${gameName}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Magnet className="w-5 h-5 text-indigo-400" />
            HOOKED 上瘾模型分析
          </h2>
          <p className="text-sm text-slate-400 mt-1">基于 Nir Eyal 的上瘾模型（触发-行动-酬赏-投入）深度解构游戏机制。</p>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">目标受众</label>
            <input 
              type="text" 
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="例如：18-24岁大学生，喜欢竞技..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">核心玩法描述</label>
                <button 
                  onClick={handleAnalyzeGameplay}
                  disabled={analyzing}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shuffle className="w-3 h-3" />}
                  {analyzing ? '分析中' : 'AI 分析填入'}
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

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Zap className="w-3 h-3" /> 模型简介
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Trigger (触发):</strong> 外部刺激与内部情绪</li>
               <li><strong className="text-slate-300">Action (行动):</strong> 动机与能力的结合</li>
               <li><strong className="text-slate-300">Variable Reward (酬赏):</strong> 多变且不可预测的奖励</li>
               <li><strong className="text-slate-300">Investment (投入):</strong> 用户的时间与资产积累</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Magnet className="w-5 h-5" />}
          {loading ? '正在深度解构...' : '生成上瘾分析'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {analysis ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">上瘾模型分析报告</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownload}
                  className="bg-slate-700 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  生成可视化文档
                </button>
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
                理论基础：{researchExplanations[AppView.HOOKED_MODEL].title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {researchExplanations[AppView.HOOKED_MODEL].content}
              </p>
            </div>

            <div className="prose prose-invert prose-indigo max-w-none overflow-y-auto pr-4 custom-scrollbar">
               <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Magnet className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">Hooked Model 解构</p>
             <p className="text-sm max-w-xs text-center mt-2">输入玩法信息，AI 将分析游戏如何让用户“上瘾”。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HookedAnalysis;


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Octagon, Loader2, Copy, Check, Link as LinkIcon, Shuffle, Zap, Target, FileText, BookOpen } from 'lucide-react';
import { generateOctalysisAnalysis, analyzeGameplayFromUrl } from '../services/geminiService';
import { researchExplanations } from '../constants';
import { AppView } from '../types';
import { exportToGoogleDocs } from '../utils/exportUtils';

const OctalysisModel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzingGameplay, setAnalyzingGameplay] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [gameplay, setGameplay] = useState('通过拖动不同形状的彩块填满行或列进行消除，类似俄罗斯方块。');
  const [targetAudience, setTargetAudience] = useState('休闲玩家，喜欢解压，碎片时间游戏');
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
      const result = await generateOctalysisAnalysis(gameName, gameplay, storeUrl, targetAudience);
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

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!analysis) return;
    exportToGoogleDocs(analysis, `Octalysis Analysis - ${gameName}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Octagon className="w-5 h-5 text-indigo-400" />
            八角行为模型 (Octalysis)
          </h2>
          <p className="text-sm text-slate-400 mt-1">分析驱动玩家行为的 8 大核心驱动力。</p>
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
              placeholder="例如：18-24岁，喜欢竞技..."
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

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Target className="w-3 h-3" /> 八大核心驱动力
             </h4>
             <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
               <span>1. 史诗意义</span>
               <span>2. 进步成就</span>
               <span>3. 创造反馈</span>
               <span>4. 拥有感</span>
               <span>5. 社交影响</span>
               <span>6. 稀缺渴望</span>
               <span>7. 未知好奇</span>
               <span>8. 亏损逃避</span>
             </div>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Octagon className="w-5 h-5" />}
          {loading ? '正在分析驱动力...' : '生成 Octalysis 分析'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {analysis ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">八角行为模型分析报告</h2>
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
                理论基础：{researchExplanations[AppView.OCTALYSIS_MODEL].title}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                {researchExplanations[AppView.OCTALYSIS_MODEL].content}
              </p>
            </div>

            <div className="prose prose-invert prose-indigo max-w-none overflow-y-auto pr-4 custom-scrollbar">
               <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Octagon className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">Octalysis 深度解构</p>
             <p className="text-sm max-w-xs text-center mt-2">输入玩法信息，AI 将分析游戏如何利用八大核心驱动力吸引玩家。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OctalysisModel;

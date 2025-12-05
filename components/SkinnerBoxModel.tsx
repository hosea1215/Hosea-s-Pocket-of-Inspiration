
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FlaskConical, Loader2, Copy, Check, Link as LinkIcon, Shuffle, FileText, Timer, Crosshair, HelpCircle, Dices, BookOpen, Globe } from 'lucide-react';
import { generateSkinnerBoxAnalysis, analyzeGameplayFromUrl } from '../services/geminiService';
import { researchExplanations } from '../constants';
import { AppView, SkinnerBoxResponse } from '../types';
import { exportToGoogleDocs } from '../utils/exportUtils';

const SkinnerBoxModel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzingGameplay, setAnalyzingGameplay] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [gameplay, setGameplay] = useState('通过拖动不同形状的彩块填满行或列进行消除，类似俄罗斯方块。');
  const [result, setResult] = useState<SkinnerBoxResponse | null>(null);
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

  const handleGenerate = async () => {
    if (!gameName || !gameplay) {
      alert("请填写游戏名称和玩法描述");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await generateSkinnerBoxAnalysis(gameName, gameplay, storeUrl, language);
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
    exportToGoogleDocs(result.analysis, `Skinner Box Analysis - ${gameName}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            斯金纳箱理论 (Skinner Box)
          </h2>
          <p className="text-sm text-slate-400 mt-1">分析游戏的可变比率强化与成瘾机制。</p>
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
              placeholder="详细描述游戏的操作方式、奖励系统、循环机制..."
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
               <FlaskConical className="w-3 h-3" /> 操作性条件反射四要素
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-none pl-1">
               <li className="flex items-start gap-2"><Crosshair className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5"/> <span><strong>固定比率 (FR):</strong> 每 X 次行为给予奖励</span></li>
               <li className="flex items-start gap-2"><Dices className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5"/> <span><strong>可变比率 (VR):</strong> 随机次数奖励 (成瘾性最强)</span></li>
               <li className="flex items-start gap-2"><Timer className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5"/> <span><strong>固定间隔 (FI):</strong> 每隔 X 时间给予奖励</span></li>
               <li className="flex items-start gap-2"><HelpCircle className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5"/> <span><strong>可变间隔 (VI):</strong> 随机时间给予奖励</span></li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FlaskConical className="w-5 h-5" />}
          {loading ? '正在分析行为强化...' : '生成斯金纳箱分析'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {result ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">成瘾机制分析报告</h2>
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
                    理论基础：{researchExplanations[AppView.SKINNER_BOX_MODEL].title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {researchExplanations[AppView.SKINNER_BOX_MODEL].content}
                  </p>
                </div>

                {/* Quadrant Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2 text-green-400">
                            <Crosshair className="w-5 h-5" />
                            <h3 className="font-bold text-sm">固定比率 (Fixed Ratio)</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{result.schedules.fixedRatio || "未检测到明显机制"}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-colors border-l-4 border-l-purple-500">
                        <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <Dices className="w-5 h-5" />
                            <h3 className="font-bold text-sm">可变比率 (Variable Ratio)</h3>
                            <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">强成瘾</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{result.schedules.variableRatio || "未检测到明显机制"}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <Timer className="w-5 h-5" />
                            <h3 className="font-bold text-sm">固定间隔 (Fixed Interval)</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{result.schedules.fixedInterval || "未检测到明显机制"}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2 text-yellow-400">
                            <HelpCircle className="w-5 h-5" />
                            <h3 className="font-bold text-sm">可变间隔 (Variable Interval)</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{result.schedules.variableInterval || "未检测到明显机制"}</p>
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
               <FlaskConical className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">斯金纳箱机制分析</p>
             <p className="text-sm max-w-xs text-center mt-2">输入游戏信息，AI 将解析其如何利用心理学原理设计奖励系统。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinnerBoxModel;

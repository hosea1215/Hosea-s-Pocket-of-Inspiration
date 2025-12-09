
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Split, Loader2, Copy, Check, FileText, Globe, Cpu, Users, Target, Shuffle, Search } from 'lucide-react';
import { generatePersonalizationStrategy } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';
import { AiMetadata } from '../types';
import AiMetaDisplay from './AiMetaDisplay';

const PersonalizationAbTesting: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [segments, setSegments] = useState('New Users, Whales, At-Risk Churn (新用户, 大R, 流失风险用户)');
  const [focusArea, setFocusArea] = useState('Onboarding Flow & Store Offers (新手引导与商店礼包)');
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  const [strategy, setStrategy] = useState<string | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [copied, setCopied] = useState(false);

  const languages = [
    "Simplified Chinese (简体中文)",
    "English (英文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
  ];

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速)' },
  ];

  const segmentPresets = [
    'New Users, Whales, At-Risk Churn (新用户, 大R, 流失风险用户)',
    'Casual Players, Hardcore Grinders, Socializers (休闲玩家, 硬核肝帝, 社交型玩家)',
    'Free-to-Play, Low Spenders, High Spenders (零氪, 微氪, 重氪)',
    'Early Game, Mid Game, End Game Players (前期, 中期, 后期玩家)',
    'High Retention/Low LTV vs Low Retention/High LTV (高留存低价值 vs 低留存高价值)'
  ];

  const focusAreaPresets = [
    'Onboarding Flow & Store Offers (新手引导与商店礼包)',
    'Difficulty Tuning & Level Progression (难度调整与关卡进程)',
    'Push Notification Timing & Content (推送时机与内容)',
    'Ad Frequency & Rewarded Video Placements (广告频次与激励视频点位)',
    'LiveOps Event Participation & Rewards (活动参与度与奖励)',
    'Main Menu UI Layout & Feature Unlocking (主界面布局与功能解锁)'
  ];

  const handleRandomSegments = () => {
    const random = segmentPresets[Math.floor(Math.random() * segmentPresets.length)];
    setSegments(random);
  };

  const handleRandomFocusArea = () => {
    const random = focusAreaPresets[Math.floor(Math.random() * focusAreaPresets.length)];
    setFocusArea(random);
  };

  const handleGenerate = async () => {
    if (!gameName) {
        alert("请输入游戏名称");
        return;
    }
    setLoading(true);
    setStrategy(null);
    setMeta(null);
    try {
      const { data, meta } = await generatePersonalizationStrategy(gameName, genre, segments, focusArea, language, selectedModel);
      setStrategy(data);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("生成策略失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!strategy) return;
    navigator.clipboard.writeText(strategy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!strategy) return;
    exportToGoogleDocs(strategy, `Personalization & AB Testing Strategy - ${gameName}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Split className="w-5 h-5 text-indigo-400" />
            个性化与 A/B 测试
          </h2>
          <p className="text-sm text-slate-400 mt-1">设计“千人千面”的用户体验与实验方案。</p>
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
            <input 
              type="text" 
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                   <Users className="w-3 h-3" /> 目标用户分层
                </label>
                <button 
                  onClick={handleRandomSegments}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="随机生成用户分层"
                >
                  <Shuffle className="w-3 h-3" />
                  随机生成
                </button>
            </div>
            <textarea 
              rows={3}
              value={segments}
              onChange={(e) => setSegments(e.target.value)}
              placeholder="例如：新手用户, 大R玩家, 回流用户..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                   <Target className="w-3 h-3" /> 关注领域 / 实验目标
                </label>
                <button 
                  onClick={handleRandomFocusArea}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="随机生成实验目标"
                >
                  <Shuffle className="w-3 h-3" />
                  随机生成
                </button>
            </div>
            <textarea 
              rows={3}
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="例如：提升新手留存, 优化商店转化率..."
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                {modelOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
                </select>
            </div>
          </div>

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Search className="w-3 h-3" /> 策略维度
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Segmentation:</strong> 行为、人口统计、心理特征分层。</li>
               <li><strong className="text-slate-300">Personalization:</strong> 动态难度、个性化礼包、内容推荐。</li>
               <li><strong className="text-slate-300">Experimentation:</strong> 实验假设、变量设计、成功指标 (Metrics)。</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Split className="w-5 h-5" />}
          {loading ? '正在设计实验...' : '生成 A/B 测试方案'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {strategy ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">个性化与 A/B 测试策略</h2>
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
               <ReactMarkdown>{strategy}</ReactMarkdown>
               <AiMetaDisplay metadata={meta} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Split className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">千人千面策略</p>
             <p className="text-sm max-w-xs text-center mt-2">输入目标用户分层与关注点，AI 将为您设计精细化的运营与实验方案。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizationAbTesting;

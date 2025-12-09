
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Dices, Loader2, Copy, Check, Link as LinkIcon, Shuffle, FileText, Swords, Sparkles, Activity, BookOpen, Globe } from 'lucide-react';
import { generateFourElementsAnalysis, analyzeGameplayFromUrl } from '../services/geminiService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { researchExplanations } from '../constants';
import { AppView, FourElementsScore } from '../types';
import { exportToGoogleDocs } from '../utils/exportUtils';

const FourElementsModel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzingGameplay, setAnalyzingGameplay] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [gameplay, setGameplay] = useState('通过拖动不同形状的彩块填满行或列进行消除，类似俄罗斯方块。');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [scores, setScores] = useState<FourElementsScore | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
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
    setAnalysis(null);
    setScores(null);
    try {
      const result = await generateFourElementsAnalysis(gameName, gameplay, storeUrl, genre, language);
      setScores(result.data.scores);
      setAnalysis(result.data.analysis);
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
    exportToGoogleDocs(analysis, `Four Elements Analysis - ${gameName}`);
  };

  const chartData = scores ? [
    { subject: 'Agon (竞争)', A: scores.agon, fullMark: 10 },
    { subject: 'Alea (偶然)', A: scores.alea, fullMark: 10 },
    { subject: 'Mimicry (模拟)', A: scores.mimicry, fullMark: 10 },
    { subject: 'Ilinx (眩晕)', A: scores.ilinx, fullMark: 10 },
  ] : [];

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dices className="w-5 h-5 text-indigo-400" />
            四要素模型 (4 Elements)
          </h2>
          <p className="text-sm text-slate-400 mt-1">分析游戏的 Agon, Alea, Mimicry, Ilinx 构成。</p>
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
               <Sparkles className="w-3 h-3" /> Roger Caillois 四大分类
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-none pl-1">
               <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span> <span><strong>Agon (竞争):</strong> 对抗、技能、胜利</span></li>
               <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span> <span><strong>Alea (偶然):</strong> 运气、随机、命运</span></li>
               <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span> <span><strong>Mimicry (模拟):</strong> 角色、扮演、幻想</span></li>
               <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span> <span><strong>Ilinx (眩晕):</strong> 速度、混乱、感官刺激</span></li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Dices className="w-5 h-5" />}
          {loading ? '正在解析游戏DNA...' : '生成四要素分析'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {analysis && scores ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">四要素模型分析报告</h2>
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
                    理论基础：{researchExplanations[AppView.FOUR_ELEMENTS_MODEL].title}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {researchExplanations[AppView.FOUR_ELEMENTS_MODEL].content}
                  </p>
                </div>

                <div className="flex flex-col xl:flex-row gap-8 mb-8">
                    {/* Radar Chart */}
                    <div className="xl:w-1/3 h-[300px] bg-slate-900/50 rounded-xl border border-slate-700/50 flex items-center justify-center relative">
                        <h3 className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider">游戏元素构成图谱</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                            <Radar
                                name="Game Elements"
                                dataKey="A"
                                stroke="#818cf8"
                                strokeWidth={2}
                                fill="#818cf8"
                                fillOpacity={0.4}
                            />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Scores Breakdown */}
                    <div className="xl:w-2/3 grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300 font-semibold flex items-center gap-2"><Swords className="w-4 h-4 text-red-400" /> Agon (竞争)</span>
                                <span className="text-xl font-bold text-white">{scores.agon}<span className="text-xs text-slate-500 font-normal">/10</span></span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-400 h-full rounded-full" style={{ width: `${scores.agon * 10}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300 font-semibold flex items-center gap-2"><Dices className="w-4 h-4 text-blue-400" /> Alea (偶然)</span>
                                <span className="text-xl font-bold text-white">{scores.alea}<span className="text-xs text-slate-500 font-normal">/10</span></span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full rounded-full" style={{ width: `${scores.alea * 10}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300 font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Mimicry (模拟)</span>
                                <span className="text-xl font-bold text-white">{scores.mimicry}<span className="text-xs text-slate-500 font-normal">/10</span></span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-purple-400 h-full rounded-full" style={{ width: `${scores.mimicry * 10}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300 font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-yellow-400" /> Ilinx (眩晕)</span>
                                <span className="text-xl font-bold text-white">{scores.ilinx}<span className="text-xs text-slate-500 font-normal">/10</span></span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${scores.ilinx * 10}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert prose-indigo max-w-none">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Dices className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">游戏基因图谱</p>
             <p className="text-sm max-w-xs text-center mt-2">输入游戏信息，AI 将解析其在 Agon, Alea, Mimicry, Ilinx 四大维度的构成。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FourElementsModel;

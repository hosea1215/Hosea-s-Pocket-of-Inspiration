
import React, { useState } from 'react';
import { Loader2, Trophy, Crosshair, Clock, BarChart, Layers, Zap, Target, Link as LinkIcon, Sparkles, Percent, Hourglass } from 'lucide-react';
import { generateCpeEvents, analyzeGameplayFromUrl } from '../services/geminiService';
import { CpeEvent } from '../types';

const CpeGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [gameplay, setGameplay] = useState('通过拖动不同形状的彩块填满行或列进行消除，类似俄罗斯方块，但没有重力下落。有关卡模式和无尽模式。');
  const [acquisitionGoal, setAcquisitionGoal] = useState('长期高频打开游戏玩关卡用户');
  const [singleCount, setSingleCount] = useState(20);
  const [comboCount, setComboCount] = useState(6);
  const [singleEvents, setSingleEvents] = useState<CpeEvent[]>([]);
  const [comboEvents, setComboEvents] = useState<CpeEvent[]>([]);

  // Full Google Play Categories with Chinese Translations
  const googlePlayGenres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Educational (教育)", 
    "Music (音乐)", "Puzzle (益智)", "Racing (赛车)", "Role Playing (角色扮演)", 
    "Simulation (模拟)", "Sports (体育)", "Strategy (策略)", "Trivia (问答)", 
    "Word (文字)"
  ];

  const handleGenerate = async () => {
    if (!gameName || !gameplay) return;
    
    setLoading(true);
    setSingleEvents([]); 
    setComboEvents([]);
    try {
      const data = await generateCpeEvents(gameName, genre, gameplay, acquisitionGoal, singleCount, comboCount);
      setSingleEvents(data.singleEvents);
      setComboEvents(data.comboEvents);
    } catch (error) {
      console.error(error);
      alert("生成 CPE 事件失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeDescription = async () => {
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

  const getDifficultyColor = (diff: string | undefined) => {
    if (!diff || typeof diff !== 'string') return 'text-slate-400 bg-slate-400/10';
    switch (diff.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'hardcore': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const EventCard: React.FC<{ event: CpeEvent, index: number, isCombo?: boolean }> = ({ event, index, isCombo }) => (
    <div className={`bg-slate-900 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-all flex flex-col gap-3 ${isCombo ? 'border-purple-500/20 bg-purple-900/5' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${isCombo ? 'bg-purple-900/50 text-purple-300 border-purple-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {index + 1}
            </span>
            <div className="flex flex-col">
               <h3 className="text-sm font-bold text-white font-mono tracking-tight">{event.eventName}</h3>
               {isCombo && <span className="bg-purple-500 text-white text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wide w-fit mt-0.5">Combo</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(event.difficulty)}`}>
              {event.difficulty || 'Unknown'}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20">
              <Clock className="w-3 h-3" />
              {event.estimatedTime}
            </span>
          </div>
      </div>

      <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
          <p className="text-slate-300 text-sm leading-relaxed">{event.descriptionZh}</p>
          <p className="text-slate-500 text-xs mt-1.5 italic border-t border-slate-800/50 pt-1.5">{event.descriptionEn}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
         <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700/50">
            <Percent className="w-3.5 h-3.5 text-indigo-400" />
            <span>预估达成率: <span className="text-white font-medium">{event.completionRate}</span></span>
         </div>
         <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700/50">
            <Hourglass className="w-3.5 h-3.5 text-indigo-400" />
            <span>建议时限: <span className="text-white font-medium">{event.timeLimit}</span></span>
         </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-500 mt-1 pt-2 border-t border-slate-800">
          <div className="mt-0.5 min-w-[16px]"><BarChart className="w-4 h-4 text-emerald-500" /></div>
          <div className="flex-1">
             <span className="text-emerald-400 font-medium">买量价值：</span>
             <p className="text-slate-400 mt-0.5">{event.uaValueZh}</p>
             <p className="text-slate-600 mt-0.5">{event.uaValueEn}</p>
          </div>
      </div>
    </div>
  );

  const hasResults = singleEvents.length > 0 || comboEvents.length > 0;

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" />
            买量事件生成器
          </h2>
          <p className="text-sm text-slate-400 mt-1">AI 智能规划 Cost Per Engagement 关键事件点。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              买量目标 (Target) <Target className="w-3 h-3 text-indigo-400" />
            </label>
            <input 
              type="text" 
              value={acquisitionGoal}
              onChange={(e) => setAcquisitionGoal(e.target.value)}
              placeholder="例如：高留存用户，高频次打开..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">单一事件数量</label>
               <input 
                 type="number" 
                 min="1"
                 max="50"
                 value={singleCount}
                 onChange={(e) => setSingleCount(Number(e.target.value))}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">组合事件数量</label>
               <input 
                 type="number" 
                 min="1"
                 max="20"
                 value={comboCount}
                 onChange={(e) => setComboCount(Number(e.target.value))}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
               />
             </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">游戏描述</label>
               <button 
                  onClick={handleAnalyzeDescription}
                  disabled={analyzing}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {analyzing ? '分析中' : '商店链接分析扩展'}
                </button>
            </div>
            <textarea 
              rows={6}
              value={gameplay}
              onChange={(e) => setGameplay(e.target.value)}
              placeholder="详细描述游戏的核心机制、进程系统（如等级、关卡）..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
          {loading ? '规划中...' : `生成 ${singleCount} 个单一 + ${comboCount} 个组合事件`}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold text-white">推荐事件列表</h2>
           {hasResults && (
             <div className="flex gap-2 text-xs">
                <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded">单一: {singleEvents.length}</span>
                <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded">组合: {comboEvents.length}</span>
             </div>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!hasResults && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 pb-12">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                  <BarChart className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-lg font-medium">准备规划</p>
                <p className="text-sm max-w-xs text-center mt-2">输入玩法信息，AI 将为您生成详细的 CPE 买量事件策略。</p>
             </div>
          )}

          {loading && (
            <div className="space-y-6">
              <div className="space-y-2">
                 <div className="h-6 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                 {[...Array(3)].map((_, i) => (
                    <div key={`l1-${i}`} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 animate-pulse h-32"></div>
                 ))}
              </div>
              <div className="space-y-2">
                 <div className="h-6 w-32 bg-slate-700/50 rounded animate-pulse"></div>
                 {[...Array(2)].map((_, i) => (
                    <div key={`l2-${i}`} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 animate-pulse h-32"></div>
                 ))}
              </div>
            </div>
          )}

          {hasResults && (
            <div className="space-y-8 pb-8">
              {/* Combo Events Section (Highlighted at top) */}
              {comboEvents.length > 0 && (
                <div>
                   <div className="flex items-center gap-2 mb-4 text-purple-400">
                      <Layers className="w-5 h-5" />
                      <h3 className="font-bold text-lg">组合事件 (Combo Events)</h3>
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20">高价值</span>
                   </div>
                   <div className="space-y-4">
                     {comboEvents.map((event, index) => (
                       <EventCard key={event.id} event={event} index={index} isCombo={true} />
                     ))}
                   </div>
                </div>
              )}

              {/* Single Events Section */}
              {singleEvents.length > 0 && (
                <div>
                   <div className="flex items-center gap-2 mb-4 text-slate-300">
                      <Zap className="w-5 h-5" />
                      <h3 className="font-bold text-lg">单一事件 (Single Events)</h3>
                   </div>
                   <div className="space-y-4">
                     {singleEvents.map((event, index) => (
                       <EventCard key={event.id} event={event} index={index} isCombo={false} />
                     ))}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CpeGenerator;


import React, { useState } from 'react';
import { Bell, Loader2, Copy, Check, MessageSquare, Link as LinkIcon, Smile, Clock, Zap, ListOrdered, MousePointerClick, Languages, Cpu } from 'lucide-react';
import { generatePushStrategy } from '../services/geminiService';
import { PushStrategyResponse, AiMetadata } from '../types';
import AiMetaDisplay from './AiMetaDisplay';

const PushStrategy: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [tone, setTone] = useState('Humorous & Casual (幽默休闲)');
  const [language, setLanguage] = useState('English (英文)');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  
  // Configuration states
  const [countPerCategory, setCountPerCategory] = useState(6);
  const [includeTiming, setIncludeTiming] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(['Offline (离线召回)', 'Level (关卡进度)']);

  const [strategy, setStrategy] = useState<PushStrategyResponse>([]);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Full Google Play Categories
  const googlePlayGenres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Educational (教育)", 
    "Music (音乐)", "Puzzle (益智)", "Racing (赛车)", "Role Playing (角色扮演)", 
    "Simulation (模拟)", "Sports (体育)", "Strategy (策略)", "Trivia (问答)", 
    "Word (文字)"
  ];

  const toneOptions = [
    "Humorous & Casual (幽默休闲)",
    "Urgent & Exciting (紧迫刺激)",
    "Emotional & Warm (情感治愈)",
    "Professional & Informative (专业资讯)",
    "Mysterious & Intriguing (神秘悬疑)",
    "Competitive & Aggressive (竞争挑衅)"
  ];

  const languageOptions = [
    "English (英文)",
    "Simplified Chinese (简体中文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
    "Spanish (西班牙语)",
    "Portuguese (葡萄牙语)",
    "German (德语)",
    "French (法语)",
    "Arabic (阿拉伯语)",
    "Thai (泰语)",
    "Vietnamese (越南语)",
    "Indonesian (印尼语)",
    "Russian (俄语)"
  ];

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速)' },
  ];

  const triggerOptions = [
    "Offline (离线召回)",
    "Level (关卡进度)",
    "Resources (体力/资源)",
    "Event (限时活动)",
    "Social (好友/公会)",
    "Shop (商店/促销)",
    "Achievement (成就达成)"
  ];

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleGenerate = async () => {
    if (!gameName) {
        alert("请输入游戏名称");
        return;
    }
    setLoading(true);
    setStrategy([]);
    setMeta(null);
    try {
      const { data, meta } = await generatePushStrategy(
        gameName, 
        genre, 
        tone, 
        language, 
        storeUrl, 
        includeEmojis, 
        countPerCategory, 
        includeTiming,
        selectedTriggers,
        selectedModel
      );
      setStrategy(Array.isArray(data) ? data : []);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("生成策略失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            游戏通知 PUSH 策略
          </h2>
          <p className="text-sm text-slate-400 mt-1">设计全生命周期的用户召回与活跃推送文案。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {/* ... Inputs ... */}
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

          {/* ... Genre, Tone, Language ... */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏类型</label>
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
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">通知风格</label>
                <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                {toneOptions.map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">输出语言</label>
                <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                {languageOptions.map(l => (
                    <option key={l} value={l}>{l}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> 大语言模型
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

          <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <MousePointerClick className="w-3 h-3" /> 触发条件 (多选)
             </label>
             <div className="flex flex-wrap gap-2">
               {triggerOptions.map(trigger => {
                 const isSelected = selectedTriggers.includes(trigger);
                 return (
                   <button
                     key={trigger}
                     onClick={() => toggleTrigger(trigger)}
                     className={`text-[10px] px-2 py-1.5 rounded border transition-colors ${
                       isSelected 
                         ? 'bg-indigo-600 border-indigo-500 text-white' 
                         : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                     }`}
                   >
                     {trigger}
                   </button>
                 );
               })}
             </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <ListOrdered className="w-3 h-3" /> 每类生成条数
             </label>
             <input 
               type="number" 
               min="1"
               max="20"
               value={countPerCategory}
               onChange={(e) => setCountPerCategory(Number(e.target.value))}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
             />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700">
              <div className={`p-2 rounded-lg ${includeEmojis ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                <Smile className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white block">包含表情符号</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            {/* ... other toggles ... */}
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
          {loading ? '策略规划中...' : '生成 Push 策略'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {strategy && strategy.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">用户召回与推送策略</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8">
              {strategy.map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <div className="flex items-center gap-2 sticky top-0 bg-slate-800 py-2 z-10 border-b border-slate-700/50">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">{section.category}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.notifications?.map((note, nIdx) => {
                      const id = `${sIdx}-${nIdx}`;
                      const fullCopy = note.title ? `${note.title}\n${note.body}` : note.body;
                      return (
                        <div key={id} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-all group relative">
                           <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => copyToClipboard(fullCopy, id)}
                              className="p-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
                            >
                              {copiedId === id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                           </div>
                           <div className="flex items-start gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-lg shrink-0 border border-indigo-500/20">
                                {note.emoji || "🔔"}
                              </div>
                              <div className="flex-1 min-w-0">
                                {note.title && <h4 className="font-bold text-white text-sm mb-1">{note.title}</h4>}
                                <p className="text-slate-300 text-sm leading-relaxed">{note.body}</p>
                              </div>
                           </div>
                           <div className="pt-3 border-t border-slate-800 mt-2 space-y-2">
                              {showTranslation && <p className="text-xs text-slate-500 italic">{note.translation}</p>}
                              <div className="flex flex-wrap gap-2">
                                {note.timing && (
                                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 bg-indigo-900/20 w-fit px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" />
                                    <span>{note.timing}</span>
                                    </div>
                                )}
                              </div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <AiMetaDisplay metadata={meta} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Bell className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">PUSH 策略实验室</p>
             <p className="text-sm max-w-xs text-center mt-2">配置游戏类型与语调，AI 将为您定制高点击率的通知文案。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushStrategy;

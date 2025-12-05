
import React, { useState } from 'react';
import { Calendar, Loader2, Link as LinkIcon, Sparkles, Copy, Check, Image as ImageIcon, Shuffle, Download, Palette, Type, User, Maximize2, X } from 'lucide-react';
import { generateLiveOpsContent, generateAdImage } from '../services/geminiService';
import { LiveOpsContent } from '../types';

const LiveOpsGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [eventType, setEventType] = useState('Major Update (重大更新)');
  const [eventTheme, setEventTheme] = useState('Celebrate love! Exclusive Valentine\'s Day skins and heart-themed levels are now available for a limited time.\n(庆祝爱！独家情人节皮肤和心形主题关卡限时上线。)');
  const [artStyle, setArtStyle] = useState('3D Render (3D渲染)');
  const [language, setLanguage] = useState('English');
  const [includeText, setIncludeText] = useState(false);
  const [includeCharacters, setIncludeCharacters] = useState(true);
  const [result, setResult] = useState<LiveOpsContent | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const eventTypes = [
    "Major Update (重大更新)",
    "Limited Time Event (限时活动)",
    "Special Offer (特惠促销)",
    "Crossover Event (联动活动)",
    "Season Start (新赛季)",
    "Pre-registration (预注册)",
    "Community Challenge (社区挑战)",
    "Important Festival (重要节日)"
  ];

  const languages = [
    "English", "Simplified Chinese", "Traditional Chinese", "Japanese", "Korean", 
    "Spanish", "Portuguese", "German", "French", "Indonesian"
  ];

  const artStyles = [
    "3D Render (3D渲染)",
    "Cartoon / Cel Shaded (卡通/赛璐珞)",
    "Realistic (写实)",
    "Pixel Art (像素风)",
    "Anime (日系动漫)",
    "Cyberpunk (赛博朋克)",
    "Low Poly (低多边形)",
    "Hand-drawn (手绘风格)",
    "Flat Design (扁平化)",
    "Oil Painting (油画)",
    "Watercolor (水彩)",
    "Minimalist (极简主义)",
    "Pop Art (波普艺术)",
    "Disney Style (迪斯尼)",
    "Pixar Style (皮克斯)",
    "Studio Ghibli (宫崎骏)",
    "Medieval Fantasy (中世纪)",
    "Felt/Wool Art (粘毛风)",
    "Claymorphism (粘土风)",
    "Wooden (木头风)"
  ];

  const themeTemplates: Record<string, string[]> = {
    "Major Update (重大更新)": [
      "Introducing Guild Wars! Battle with friends and conquer territories.\n(推出公会战！与好友并肩作战，征服领土。)",
      "New World 5 unlocked: The Frozen Wasteland. 50 new levels added!\n(解锁新世界5：冰冻废土。新增50个关卡！)",
      "Level cap increased to 100. New skills and gear available.\n(等级上限提升至100级。新技能和装备已开放。)",
      "Performance optimization update and new user interface.\n(性能优化更新及全新用户界面。)"
    ],
    "Limited Time Event (限时活动)": [
      "Speed Run Challenge: Complete levels as fast as possible for leaderboard rewards.\n(速通挑战：尽可能快地完成关卡以获取排行榜奖励。)",
      "Boss Rush: Defeat infinite waves of bosses to earn legendary shards.\n(Boss连战：击败无限波次的Boss以赢取传奇碎片。)",
      "Treasure Hunt: Find hidden chests in daily stages for bonus gold.\n(寻宝活动：在日常关卡中寻找隐藏宝箱以获取额外金币。)",
      "Double XP Weekend: Level up faster than ever!\n(双倍经验周末：升级速度前所未有！)"
    ],
    "Special Offer (特惠促销)": [
      "Black Friday Sale: Up to 80% off on all gem packs.\n(黑色星期五特卖：所有宝石包低至2折。)",
      "Starter Bundle: Get an S-tier hero and 1000 gems for only $0.99.\n(新手礼包：仅需$0.99即可获得S级英雄和1000宝石。)",
      "Double Gems on your first recharge this weekend.\n(本周末首次充值享双倍宝石。)",
      "Flash Sale: Limited time skins back in the shop.\n(限时特卖：限定皮肤返场。)"
    ],
    "Crossover Event (联动活动)": [
      "Game X Anime collaboration! Unlock exclusive character skins.\n(游戏 X 动漫联动！解锁独家角色皮肤。)",
      "Special event featuring characters from popular IP. Limited time only!\n(热门IP角色特别活动。限时开启！)",
      "Collect crossover tokens to exchange for limited edition avatars.\n(收集联动代币兑换限量版头像。)"
    ],
    "Season Start (新赛季)": [
      "Season 5: Cyberpunk City begins! Climb the ranks for neon-themed rewards.\n(第5赛季：赛博朋克之城开启！冲榜赢取霓虹主题奖励。)",
      "New Battle Pass available. Unlock the Golden Dragon mount at tier 50.\n(新通行证上线。达到50级解锁金龙坐骑。)",
      "Rank reset! Start your journey to the top of the leaderboard.\n(段位重置！开始你的登顶之旅。)"
    ],
    "Pre-registration (预注册)": [
      "Pre-register now to unlock the exclusive 'Pioneer' badge and starter kit.\n(立即预注册以解锁独家“先驱者”徽章和新手包。)",
      "Join the waitlist for the massive 2.0 expansion update.\n(加入2.0大型扩展更新的候补名单。)",
      "Sign up early and get notified when the new server opens.\n(提前注册，新服开启时第一时间获取通知。)"
    ],
    "Community Challenge (社区挑战)": [
      "Global Goal: Collect 1 billion coins together to unlock a server-wide buff.\n(全球目标：共同收集10亿金币以解锁全服Buff。)",
      "Fan Art Contest: Submit your artwork for a chance to be featured in-game.\n(同人画作大赛：提交作品有机会在游戏中展示。)",
      "Defeat the World Boss: Every player's damage counts!\n(击败世界Boss：每位玩家的伤害都至关重要！)"
    ],
    "Important Festival (重要节日)": [
      "Celebrate Valentine's Day with exclusive romantic skins and a heart-shaped puzzle challenge!\n(庆祝情人节，推出独家浪漫皮肤和心形拼图挑战！)",
      "Spooky Halloween event! Collect pumpkins to exchange for ghost costumes.\n(万圣节惊悚活动！收集南瓜兑换幽灵服装。)",
      "Merry Christmas! Log in daily for festive gifts and snowy map decorations.\n(圣诞快乐！每日登录领取节日礼物，体验雪景地图装饰。)",
      "Lunar New Year celebration! Red packets dropping in all matches.\n(农历新年庆典！所有比赛中掉落红包。)",
      "Easter Egg Hunt: Find hidden eggs throughout the game world.\n(复活节彩蛋寻找：在游戏世界中寻找隐藏的彩蛋。)"
    ]
  };

  const handleGenerate = async () => {
    if (!gameName || !eventTheme) {
      alert("请填写游戏名称和活动主题");
      return;
    }
    setLoading(true);
    setResult(null);
    setGeneratedImage(null);
    
    try {
      const data = await generateLiveOpsContent(gameName, storeUrl, eventType, eventTheme, language, includeText, includeCharacters);
      setResult(data);

      // Trigger image generation if prompt exists
      if (data.imagePrompt) {
        setGeneratingImage(true);
        // Extract just the style name for the API if needed, or pass full string
        generateAdImage(data.imagePrompt, '16:9', artStyle, '', language, includeText, includeCharacters)
          .then(({ imageUrl }) => {
            setGeneratedImage(imageUrl);
          })
          .catch((err) => {
            console.error("Image generation failed", err);
          })
          .finally(() => {
            setGeneratingImage(false);
          });
      }

    } catch (error) {
      console.error(error);
      alert("生成失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomTheme = () => {
    const templates = themeTemplates[eventType] || themeTemplates["Major Update (重大更新)"];
    const random = templates[Math.floor(Math.random() * templates.length)];
    setEventTheme(random);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `liveops_feature_graphic_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            GooglePlay LiveOps物料
          </h2>
          <p className="text-sm text-slate-400 mt-1">生成符合 Google Play 规范的 Promotional Content (LiveOps) 文案与素材建议。</p>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">活动类型</label>
            <select 
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">活动主题/描述</label>
                <button 
                  onClick={handleRandomTheme}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
                  title="根据活动类型随机生成描述"
                >
                  <Shuffle className="w-3 h-3" />
                  随机生成
                </button>
            </div>
            <textarea 
              rows={4}
              value={eventTheme}
              onChange={(e) => setEventTheme(e.target.value)}
              placeholder="简要描述活动内容、新功能或促销详情..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Palette className="w-3 h-3" /> 美术风格
             </label>
             <select 
               value={artStyle}
               onChange={(e) => setArtStyle(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
             >
               {artStyles.map(style => (
                 <option key={style} value={style}>{style}</option>
               ))}
             </select>
          </div>

          {/* Image Inclusion Toggles */}
          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
             <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                  <Type className="w-3.5 h-3.5" />
                  <span>包含文字</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={includeText} onChange={(e) => setIncludeText(e.target.checked)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>
             <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                  <User className="w-3.5 h-3.5" />
                  <span>包含人物/动物</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={includeCharacters} onChange={(e) => setIncludeCharacters(e.target.checked)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">输出语言</label>
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
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? '生成 LiveOps 物料' : '生成 LiveOps 物料'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {result ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">生成结果</h2>
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">{language}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
              
              {/* Event Name */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 relative group">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Name (Max 80 chars)</label>
                    <button onClick={() => copyToClipboard(result.eventName, 'eventName')} className="text-slate-500 hover:text-white transition-colors">
                      {copiedField === 'eventName' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 <p className="text-lg font-bold text-white">{result.eventName}</p>
                 {result.translation?.eventName && <p className="text-sm text-slate-500 mt-1 italic">{result.translation.eventName}</p>}
              </div>

              {/* Short Description */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 relative group">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Short Description (Max 80 chars)</label>
                    <button onClick={() => copyToClipboard(result.shortDescription, 'shortDescription')} className="text-slate-500 hover:text-white transition-colors">
                      {copiedField === 'shortDescription' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 <p className="text-base text-white">{result.shortDescription}</p>
                 {result.translation?.shortDescription && <p className="text-sm text-slate-500 mt-1 italic">{result.translation.shortDescription}</p>}
              </div>

              {/* Long Description */}
              <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 relative group">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Long Description</label>
                    <button onClick={() => copyToClipboard(result.longDescription, 'longDescription')} className="text-slate-500 hover:text-white transition-colors">
                      {copiedField === 'longDescription' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{result.longDescription}</p>
                 {result.translation?.longDescription && <p className="text-sm text-slate-500 mt-2 pt-2 border-t border-slate-800 italic">{result.translation.longDescription}</p>}
              </div>

              {/* Image Prompt & Generation */}
              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5 relative group">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Feature Graphic (16:9)
                    </label>
                    <button onClick={() => copyToClipboard(result.imagePrompt, 'imagePrompt')} className="text-slate-500 hover:text-white transition-colors">
                      {copiedField === 'imagePrompt' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 <p className="text-sm text-indigo-200 font-mono bg-black/20 p-3 rounded-lg border border-indigo-500/10 mb-4">
                   {result.imagePrompt}
                 </p>

                 {/* Generated Image Preview */}
                 <div className="mt-4 border-t border-indigo-500/20 pt-4">
                    {generatingImage ? (
                      <div className="w-full aspect-video bg-black/20 rounded-lg flex flex-col items-center justify-center animate-pulse border border-indigo-500/30">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                        <span className="text-xs text-indigo-300">AI 正在生成活动海报...</span>
                      </div>
                    ) : generatedImage ? (
                      <div className="relative group/image">
                         <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-indigo-500/30 shadow-2xl">
                           <img src={generatedImage} alt="Generated LiveOps Feature Graphic" className="w-full h-full object-cover" />
                         </div>
                         <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover/image:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setPreviewImage(generatedImage)}
                              className="bg-black/70 hover:bg-indigo-600 text-white p-2 rounded-full backdrop-blur-md border border-white/10 transition-all"
                              title="全屏预览"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={handleDownloadImage}
                              className="bg-black/70 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md border border-white/10 transition-all"
                            >
                              <Download className="w-3 h-3" /> 下载 PNG
                            </button>
                         </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-black/10 rounded-lg flex items-center justify-center border border-dashed border-slate-700">
                        <span className="text-xs text-slate-500">等待生成...</span>
                      </div>
                    )}
                 </div>
              </div>

            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Calendar className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">LiveOps 物料生成</p>
             <p className="text-sm max-w-xs text-center mt-2">输入活动信息，AI 将为您生成符合 Google Play 规范的推广内容。</p>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors" onClick={() => setPreviewImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <img 
            src={previewImage} 
            alt="Full Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default LiveOpsGenerator;


import React, { useState } from 'react';
import { Sparkles, Loader2, Image as ImageIcon, Copy, Check, Palette, Globe, MoreHorizontal, ThumbsUp, MessageCircle, Share2, PenTool, Link as LinkIcon, Download, LayoutTemplate, Shuffle, FileText, Languages, Maximize2, X, Type, User, Cpu, MousePointerClick } from 'lucide-react';
import { generateAdCopy, generateAdImage, analyzeVisualDetailsFromUrl } from '../services/geminiService';
import { AdCreative } from '../types';

const CreativeLab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const [concept, setConcept] = useState('彩色的PUZZLE BLOCK块，连击爽快感，等待的碎片时间玩这个游戏');
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [visualDetails, setVisualDetails] = useState('');
  const [selectedCta, setSelectedCta] = useState('Download Now (立即下载)');
  const [selectedStyle, setSelectedStyle] = useState('3D Render');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [includeText, setIncludeText] = useState(false);
  const [includeCharacters, setIncludeCharacters] = useState(true);
  const [includeButton, setIncludeButton] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-image');
  const [generatedCreatives, setGeneratedCreatives] = useState<AdCreative[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const ctaOptions = [
    "Download Now (立即下载)",
    "Free Download (免费下载)",
    "Play Game (开始游戏)",
    "Install Now (安装游戏)",
    "Free Trial (免费试玩)",
    "Get Reward (领取奖励)",
    "Learn More (了解更多)",
    "Buy Now (立即购买)",
    "Search (搜索)"
  ];

  const modelOptions = [
    { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash (快速)' },
    { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (高质量)' },
    { value: 'imagen-3.0-generate-002', label: 'Imagen 3 (专业绘图)' }
  ];

  const styleOptions = [
    { value: '3D Render', label: '3D 渲染 (3D Render)' },
    { value: 'Cartoon', label: '卡通 (Cartoon)' },
    { value: 'Realistic', label: '写实 (Realistic)' },
    { value: 'Pixel Art', label: '像素风 (Pixel Art)' },
    { value: 'Minimalist', label: '简约 (Minimalist)' },
    { value: 'Cyberpunk', label: '赛博朋克 (Cyberpunk)' },
    { value: 'Anime', label: '日系动漫 (Anime)' },
    { value: 'Oil Painting', label: '油画 (Oil Painting)' },
    { value: 'Watercolor', label: '水彩 (Watercolor)' },
    { value: 'Sketch', label: '素描 (Sketch)' },
    { value: 'Low Poly', label: '低多边形 (Low Poly)' },
    { value: 'Disney Style', label: '迪斯尼 (Disney)' },
    { value: 'Pixar Style', label: '皮克斯 (Pixar)' },
    { value: 'Studio Ghibli', label: '宫崎骏 (Studio Ghibli)' },
    { value: 'Medieval Fantasy', label: '中世纪 (Medieval)' },
    { value: 'Felt/Wool Art', label: '粘毛风 (Felt/Wool Art)' },
    { value: 'Claymorphism', label: '粘土风 (Claymorphism)' },
    { value: 'Wooden', label: '木头风 (Wooden)' }
  ];

  const aspectRatioOptions = [
    { value: '1:1', label: '1:1 - 动态消息/轮播/右边栏 (1080x1080)' },
    { value: '4:5', label: '4:5 - 动态消息[垂直] (1080x1350)' },
    { value: '9:16', label: '9:16 - Stories/快拍/Reels (1080x1920)' },
    { value: '1.91:1', label: '1.91:1 - 链接贴文/信息流单图 (1200x628)' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English (英文)' },
    { value: 'Simplified Chinese', label: 'Simplified Chinese (简体中文)' },
    { value: 'Traditional Chinese', label: 'Traditional Chinese (繁体中文)' },
    { value: 'Spanish', label: 'Spanish (西班牙语)' },
    { value: 'Portuguese', label: 'Portuguese (葡萄牙语)' },
    { value: 'German', label: 'German (德语)' },
    { value: 'French', label: 'French (法语)' },
    { value: 'Japanese', label: 'Japanese (日语)' },
    { value: 'Korean', label: 'Korean (韩语)' },
    { value: 'Arabic', label: 'Arabic (阿拉伯语)' },
    { value: 'Thai', label: 'Thai (泰语)' },
    { value: 'Vietnamese', label: 'Vietnamese (越南语)' },
    { value: 'Indonesian', label: 'Indonesian (印尼语)' },
  ];

  const handleGenerate = async () => {
    // Check if API key is selected for the paid model (gemini-3-pro-image-preview)
    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    setLoading(true);
    setLoadingStage('正在分析创意需求...');

    try {
      let imagePrompt = `A mobile game ad creative for a game called ${gameName}. Concept: ${concept}`;
      
      const ctaText = selectedCta.split(' (')[0];
      if (includeButton && ctaText) {
          imagePrompt += `. Include a visual call-to-action button with text "${ctaText}"`;
      }

      // Start both requests in parallel
      const imagePromise = generateAdImage(
        imagePrompt,
        aspectRatio,
        selectedStyle,
        visualDetails,
        selectedLanguage,
        includeText || (includeButton && !!selectedCta),
        includeCharacters,
        selectedModel
      );
      
      // Use clean CTA for copy generation
      const copyPromise = generateAdCopy({ 
        name: gameName, 
        genre: 'Mobile Game', 
        targetAudience: 'Gamers', 
        budget: 0, 
        market: 'US', 
        usp: 'Fun',
        promotionGoal: 'General Promotion',
        promotionPurpose: 'App Promotion',
        storeUrl: storeUrl // Pass store URL
      }, concept, ctaText, selectedLanguage);

      // Update stage for image generation (usually takes longest)
      setLoadingStage('正在生成营销视觉图像...');
      const imageResult = await imagePromise;

      // Update stage for copy generation
      setLoadingStage('正在撰写高转化广告文案...');
      const copyData = await copyPromise;

      setLoadingStage('正在合成最终创意...');

      const newCreative: AdCreative = {
        id: Date.now().toString(),
        imageUrl: imageResult.imageUrl,
        imagePrompt: imageResult.prompt,
        imagePromptZh: imageResult.promptZh,
        copy: copyData.body,
        headline: copyData.headline,
        cta: copyData.cta
      };

      setGeneratedCreatives(prev => [newCreative, ...prev]);
    } catch (error) {
      console.error(error);
      alert("生成创意失败。");
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleAnalyzeVisualDetails = async () => {
    if (!storeUrl) {
      alert("请填写商店链接以进行分析。");
      return;
    }
    setGeneratingDetails(true);
    try {
      const details = await analyzeVisualDetailsFromUrl(gameName, storeUrl);
      setVisualDetails(details);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setGeneratingDetails(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyPrompt = (text: string | undefined, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleDownloadImage = (imageUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `creative_${gameName.replace(/\s+/g, '_')}_${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Column */}
      <div className="w-1/3 min-w-[320px] bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex flex-col gap-5 shrink-0 overflow-y-auto custom-scrollbar h-full">
        <div className="mb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-indigo-400" />
            FACEBOOK图文广告创意
          </h2>
          <p className="text-sm text-slate-400 mt-1">配置 AI 参数以生成高点击率广告。</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏名称</label>
          <input 
            type="text" 
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Globe className="w-3 h-3" /> 输出语言
             </label>
             <select 
               value={selectedLanguage}
               onChange={(e) => setSelectedLanguage(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
             >
               {languageOptions.map(opt => (
                 <option key={opt.value} value={opt.value}>{opt.label}</option>
               ))}
             </select>
           </div>
           <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Cpu className="w-3 h-3" /> 生图模型
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

        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">素材版位与比例</label>
             <select 
               value={aspectRatio}
               onChange={(e) => setAspectRatio(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
             >
               {aspectRatioOptions.map(opt => (
                 <option key={opt.value} value={opt.value}>{opt.label}</option>
               ))}
             </select>
          </div>
          <div>
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Palette className="w-3 h-3" /> 素材风格
             </label>
             <select 
               value={selectedStyle}
               onChange={(e) => setSelectedStyle(e.target.value)}
               className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
             >
               {styleOptions.map(opt => (
                 <option key={opt.value} value={opt.value}>{opt.label}</option>
               ))}
             </select>
          </div>
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <LinkIcon className="w-3 h-3" /> 游戏商店链接 (可选)
            </label>
            <input 
              type="text" 
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder="https://play.google.com/store/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition-colors"
            />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">创意概念</label>
          <textarea 
            rows={3}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="例如：角色展示，游戏实录风格..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <PenTool className="w-3 h-3" /> 素材细节 (可选)
             </label>
             <button 
               onClick={handleAnalyzeVisualDetails}
               disabled={generatingDetails}
               className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
             >
               {generatingDetails ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
               {generatingDetails ? '分析中' : 'AI 扩展生成'}
             </button>
          </div>
          <textarea 
            rows={2}
            value={visualDetails}
            onChange={(e) => setVisualDetails(e.target.value)}
            placeholder="例如：红色背景，主角在左侧，有一个巨大的宝箱..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none transition-colors"
          />
        </div>

        <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">行动号召 (CTA)</label>
            <div className="flex items-center gap-3">
                <select 
                  value={selectedCta}
                  onChange={(e) => setSelectedCta(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                >
                  {ctaOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700 h-[38px]">
                    <input 
                        type="checkbox" 
                        checked={includeButton} 
                        onChange={(e) => setIncludeButton(e.target.checked)} 
                        className="w-3.5 h-3.5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                        <MousePointerClick className="w-3 h-3" />
                        显示按钮
                    </span>
                </label>
            </div>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? '生成创意' : '生成创意'}
        </button>
      </div>

      {/* Results Column */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6">创意预览</h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-4">
            {generatedCreatives.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 h-full">
                 <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 rotate-12">
                   <ImageIcon className="w-8 h-8 text-slate-600" />
                 </div>
                 <p className="text-lg font-medium">暂无生成的创意</p>
                 <p className="text-sm">在左侧配置并点击生成。</p>
              </div>
            )}

            {loading && (
                 <div className="bg-[#242526] rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center h-[500px] gap-4">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                      <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-indigo-300 animate-pulse">{loadingStage}</span>
                 </div>
            )}

            {generatedCreatives.map((creative) => (
              <div key={creative.id} className="bg-[#242526] rounded-xl overflow-hidden border border-slate-700/50 flex flex-col w-full shadow-lg h-fit max-w-md mx-auto">
                {/* FB Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shrink-0">
                       {gameName.charAt(0)}
                     </div>
                     <div>
                       <h4 className="font-semibold text-white text-sm leading-tight">{gameName}</h4>
                       <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                         <span>Sponsored</span>
                         <span className="text-[6px] align-middle">•</span>
                         <Globe className="w-3 h-3" />
                       </div>
                     </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </div>

                {/* Ad Copy */}
                <div className="px-3 pb-3 relative group">
                  <div className="text-[15px] text-white whitespace-pre-wrap leading-normal font-normal">
                    {creative.copy}
                  </div>
                  {/* Copy Button */}
                  <button 
                    onClick={() => handleCopyText(creative.copy, creative.id)}
                    className="absolute top-0 right-2 p-1.5 bg-slate-700/80 hover:bg-indigo-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm backdrop-blur-sm"
                    title="复制文案"
                  >
                    {copiedId === creative.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Image Area */}
                <div className="w-full bg-black relative group flex justify-center bg-[#18191a]">
                   <img src={creative.imageUrl} alt="Ad Visual" className="w-full h-auto object-contain max-h-[500px]" />
                   {/* Action Buttons Overlay */}
                   <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button 
                       onClick={() => setPreviewImage(creative.imageUrl)}
                       className="p-2 bg-black/60 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/10 shadow-lg"
                       title="全屏预览"
                     >
                       <Maximize2 className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleDownloadImage(creative.imageUrl, creative.id)}
                       className="p-2 bg-black/60 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/10 shadow-lg"
                       title="保存图片"
                     >
                       <Download className="w-4 h-4" />
                     </button>
                   </div>
                </div>

                {/* Headline & CTA Bar */}
                <div className="bg-[#303132] px-3 py-3 flex items-center justify-between gap-3 border-t border-slate-700/30">
                   <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-400 uppercase truncate mb-0.5">app.link.com</p>
                      <h3 className="text-white font-bold text-[16px] leading-snug truncate">{creative.headline}</h3>
                   </div>
                   <button className="bg-[#4b5563] hover:bg-[#374151] text-white px-4 py-2 rounded-md font-semibold text-sm whitespace-nowrap transition-colors border border-slate-600">
                     {creative.cta}
                   </button>
                </div>

                {/* Social Actions (Mock) */}
                <div className="px-2 py-1 flex items-center justify-between border-t border-slate-700/30 text-slate-400 bg-[#242526]">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded transition-colors text-sm font-medium">
                       <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded transition-colors text-sm font-medium">
                       <MessageCircle className="w-4 h-4" /> <span>Comment</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-white/5 rounded transition-colors text-sm font-medium">
                       <Share2 className="w-4 h-4" /> <span>Share</span>
                    </button>
                </div>

                {/* Prompt Section */}
                {creative.imagePrompt && (
                  <div className="p-3 bg-black/20 text-xs text-slate-500 border-t border-slate-700/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold flex items-center gap-1 text-indigo-300"><FileText className="w-3 h-3" /> 提示词 (Prompt):</span>
                      <button 
                        onClick={() => handleCopyPrompt(creative.imagePrompt, creative.id)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${copiedPromptId === creative.id ? 'text-green-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      >
                        {copiedPromptId === creative.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPromptId === creative.id ? '已复制' : '复制英文'}</span>
                      </button>
                    </div>
                    <p className="font-mono leading-relaxed mb-3 text-slate-300 bg-black/20 p-2 rounded border border-white/5 select-all">
                      {creative.imagePrompt}
                    </p>
                    
                    {creative.imagePromptZh && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                            <span className="font-bold flex items-center gap-1 text-slate-400 mb-1"><Languages className="w-3 h-3" /> 中文释义:</span>
                            <p className="font-mono leading-relaxed text-slate-400 select-all">{creative.imagePromptZh}</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
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

export default CreativeLab;

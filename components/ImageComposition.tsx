
import React, { useState, useRef } from 'react';
import { Layers, Loader2, Sparkles, Upload, Maximize2, Download, Copy, Check, Palette, Cpu, X, Trash2, MousePointerClick, Wand2, Shuffle, RefreshCcw } from 'lucide-react';
import { generateCompositeImage, generateAdImage } from '../services/geminiService';

interface GeneratedResult {
  id: string;
  imageUrl: string;
  prompt: string;
  ratio: string;
  timestamp: number;
}

interface UploadSlot {
  id: string;
  label: string;
  placeholder: string;
}

const ImageComposition: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  
  // Image Upload States
  const [images, setImages] = useState<Record<string, string | null>>({
    background: null,
    gameplay: null,
    character: null,
    icon: null,
    logo: null
  });

  // Slot Generation States
  const [generationMode, setGenerationMode] = useState<Record<string, boolean>>({});
  const [slotPrompts, setSlotPrompts] = useState<Record<string, string>>({});
  const [slotLoading, setSlotLoading] = useState<Record<string, boolean>>({});

  const [compositionPrompt, setCompositionPrompt] = useState('');
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<string[]>(['1:1']);
  const [selectedStyle, setSelectedStyle] = useState('3D Render');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-image');
  const [includeButton, setIncludeButton] = useState(false);
  const [cta, setCta] = useState('Download Now (立即下载)');
  
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const uploadSlots: UploadSlot[] = [
    { id: 'background', label: '背景图 (Background)', placeholder: '场景/地图背景' },
    { id: 'gameplay', label: '核心玩法图 (Gameplay)', placeholder: '游戏截图/战斗画面' },
    { id: 'character', label: '人物/动物 (Character)', placeholder: '立绘/3D模型' },
    { id: 'icon', label: '游戏ICON (Icon)', placeholder: 'App Icon' },
    { id: 'logo', label: '游戏名称图 (Logo)', placeholder: 'Logo/标题文字' }
  ];

  const randomPrompts: Record<string, string[]> = {
    background: [
        "Fantasy forest clearing with magical glowing plants",
        "Sci-fi cyberpunk city street at night with neon lights",
        "Sunny tropical beach paradise with palm trees",
        "Dark spooky dungeon interior with stone walls",
        "Abstract geometric pattern background, vibrant colors"
    ],
    gameplay: [
        "Match-3 puzzle game board with colorful gems and combos",
        "RPG battle scene, hero attacking a dragon, damage numbers",
        "FPS game HUD view, holding a futuristic weapon",
        "Strategy game map view with hexagon tiles and armies",
        "Casual card game table layout"
    ],
    character: [
        "Cute anime warrior girl holding a sword, full body",
        "Fierce orc warrior with armor, concept art",
        "Cool space marine soldier with helmet",
        "Funny cartoon mascot rabbit jumping",
        "Mysterious wizard casting a spell"
    ],
    icon: [
        "Shiny gold coin app icon, 3d render",
        "Magic blue potion bottle icon",
        "Sword and shield crossed icon, metallic",
        "Treasure chest overflowing with gems icon",
        "Rocket ship launching icon, flat style"
    ],
    logo: [
        "Game title text 'Battle Quest' in metallic gold style",
        "Colorful bubbly text 'Puzzle Match' logo",
        "Horror style dripping blood text 'Nightmare'",
        "Sci-fi glowing blue text 'Star Wars' style",
        "Elegant cursive text 'Royal Kingdom' logo"
    ]
  };

  const modelOptions = [
    { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash (快速)' },
    { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (高质量)' }
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
    { value: '1:1', label: '1:1 (方形)' },
    { value: '9:16', label: '9:16 (竖屏)' },
    { value: '16:9', label: '16:9 (横版)' },
    { value: '4:5', label: '4:5 (社媒)' }
  ];

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

  const handleFileSelect = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
          setImages(prev => ({ ...prev, [slotId]: ev.target?.result as string }));
          // Exit generation mode if active
          setGenerationMode(prev => ({ ...prev, [slotId]: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages(prev => ({ ...prev, [slotId]: null }));
    if (fileInputRefs.current[slotId]) {
        fileInputRefs.current[slotId]!.value = '';
    }
  };

  const toggleAspectRatio = (ratio: string) => {
    setSelectedAspectRatios(prev => 
      prev.includes(ratio) 
        ? prev.filter(r => r !== ratio) 
        : [...prev, ratio]
    );
  };

  // Slot Generation Functions
  const toggleGenerationMode = (slotId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setGenerationMode(prev => ({ ...prev, [slotId]: !prev[slotId] }));
  };

  const handleSlotPromptChange = (slotId: string, value: string) => {
      setSlotPrompts(prev => ({ ...prev, [slotId]: value }));
  };

  const handleSlotRandomPrompt = (slotId: string) => {
      const prompts = randomPrompts[slotId] || randomPrompts.background;
      const random = prompts[Math.floor(Math.random() * prompts.length)];
      setSlotPrompts(prev => ({ ...prev, [slotId]: random }));
  };

  const generateForSlot = async (slotId: string) => {
      const prompt = slotPrompts[slotId];
      if (!prompt) {
          alert("请输入描述或点击随机生成");
          return;
      }

      // Check API Key
      if ((window as any).aistudio && (selectedModel === 'gemini-3-pro-image-preview')) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
      }

      setSlotLoading(prev => ({ ...prev, [slotId]: true }));
      
      try {
          const { imageUrl } = await generateAdImage(
              prompt,
              '1:1', // Always square for assets usually
              selectedStyle,
              `Asset for mobile game ad composition: ${slotId}`,
              'English',
              false,
              true,
              selectedModel
          );
          setImages(prev => ({ ...prev, [slotId]: imageUrl }));
          setGenerationMode(prev => ({ ...prev, [slotId]: false }));
      } catch (error) {
          console.error(error);
          alert("生成素材失败，请重试。");
      } finally {
          setSlotLoading(prev => ({ ...prev, [slotId]: false }));
      }
  };

  const handleGenerate = async () => {
    // Collect valid images
    const validImages = Object.entries(images)
        .filter(([_, data]) => data !== null)
        .map(([key, data]) => {
            const base64Data = (data as string).split(',')[1];
            const mimeType = (data as string).substring((data as string).indexOf(':') + 1, (data as string).indexOf(';'));
            // Map internal IDs to descriptive labels for the model
            const labelMap: Record<string, string> = {
                background: 'Background Environment',
                gameplay: 'Gameplay Screenshot',
                character: 'Main Character',
                icon: 'App Icon',
                logo: 'Game Logo Text'
            };
            return {
                label: labelMap[key] || key,
                data: base64Data,
                mimeType
            };
        });

    if (validImages.length === 0) {
        alert("请至少上传或生成一张素材图片");
        return;
    }
    if (selectedAspectRatios.length === 0) {
        alert("请至少选择一个图片比例");
        return;
    }

    // Check API Key for paid models
    if ((window as any).aistudio && (selectedModel === 'gemini-3-pro-image-preview')) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    setLoading(true);
    setLoadingStage('正在解析素材特征...');

    try {
        const generatePromises = selectedAspectRatios.map(async (ratio) => {
            // Update prompt based on provided elements
            let fullPrompt = compositionPrompt || "Create a high-quality mobile game ad.";
            fullPrompt += ` Use the provided images to create a cohesive composition.`;
            
            // Add CTA to prompt if enabled
            const ctaText = cta.split(' (')[0]; 
            if (includeButton && ctaText) {
                fullPrompt += ` Include a clearly visible call-to-action button with text: "${ctaText}".`;
            }
            
            // Call service
            const result = await generateCompositeImage(
                validImages,
                fullPrompt,
                ratio,
                selectedStyle,
                selectedModel
            );

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                imageUrl: result.imageUrl,
                prompt: result.prompt,
                ratio: ratio,
                timestamp: Date.now()
            };
        });

        setLoadingStage('正在合成渲染广告图...');
        const newResults = await Promise.all(generatePromises);
        setGeneratedResults(prev => [...newResults, ...prev]);

    } catch (error) {
        console.error(error);
        alert("合成失败，请重试。");
    } finally {
        setLoading(false);
        setLoadingStage('');
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleDownloadImage = (imageUrl: string, ratio: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `composite_ad_${ratio.replace(':', '-')}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResults = () => {
      if(confirm("确定要清空所有生成历史吗？")) {
          setGeneratedResults([]);
      }
  };

  const removeResult = (id: string) => {
      setGeneratedResults(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 min-w-[340px] bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="mb-4 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            图片素材合成
          </h2>
          <p className="text-sm text-slate-400 mt-1">上传或生成分层素材，AI 智能排版合成高质量广告图。</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2">
            
            {/* Upload Slots Grid */}
            <div className="grid grid-cols-2 gap-3">
                {uploadSlots.map((slot) => (
                    <div 
                        key={slot.id}
                        className={`relative aspect-square border-2 border-dashed rounded-xl flex flex-col transition-all group overflow-hidden ${
                            images[slot.id] 
                            ? 'border-indigo-500 bg-slate-900' 
                            : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
                        }`}
                    >
                        {images[slot.id] ? (
                            // Image Present View
                            <>
                                <img src={images[slot.id]!} alt={slot.label} className="w-full h-full object-contain" />
                                <button 
                                    onClick={(e) => removeImage(slot.id, e)}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white py-1 truncate px-1 text-center">
                                    {slot.label}
                                </div>
                            </>
                        ) : generationMode[slot.id] ? (
                            // Generation View
                            <div className="flex flex-col h-full p-2 gap-2 relative">
                                <button 
                                    onClick={(e) => toggleGenerationMode(slot.id, e)}
                                    className="absolute top-1 right-1 text-slate-500 hover:text-white"
                                    title="返回上传"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                                <label className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider">{slot.label}</label>
                                <textarea 
                                    className="flex-1 w-full bg-black/20 border border-slate-700 rounded p-1.5 text-[10px] text-white resize-none focus:outline-none focus:border-indigo-500"
                                    placeholder="输入描述..."
                                    value={slotPrompts[slot.id] || ''}
                                    onChange={(e) => handleSlotPromptChange(slot.id, e.target.value)}
                                />
                                <div className="flex gap-1 h-6">
                                    <button 
                                        onClick={() => handleSlotRandomPrompt(slot.id)}
                                        className="bg-slate-700 hover:bg-slate-600 text-white w-6 flex items-center justify-center rounded transition-colors"
                                        title="随机提示词"
                                    >
                                        <Shuffle className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => generateForSlot(slot.id)}
                                        disabled={slotLoading[slot.id]}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] rounded flex items-center justify-center gap-1 transition-colors"
                                    >
                                        {slotLoading[slot.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        生成
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Empty Upload View
                            <div 
                                className="flex flex-col items-center justify-center h-full w-full cursor-pointer relative"
                                onClick={() => fileInputRefs.current[slot.id]?.click()}
                            >
                                <div className="flex-1 flex flex-col items-center justify-center w-full">
                                    <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" />
                                    <span className="text-[10px] text-slate-400 font-medium">{slot.label}</span>
                                    <span className="text-[9px] text-slate-600 mt-1 px-1 truncate w-full text-center">{slot.placeholder}</span>
                                </div>
                                <div className="w-full px-2 pb-2">
                                    <button
                                        onClick={(e) => toggleGenerationMode(slot.id, e)}
                                        className="w-full py-1 bg-slate-800 hover:bg-indigo-900/50 text-indigo-300 text-[9px] rounded border border-indigo-500/30 flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Wand2 className="w-2.5 h-2.5" /> AI 生成
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            ref={el => fileInputRefs.current[slot.id] = el}
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleFileSelect(slot.id, e)} 
                        />
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">合成指令 / 提示词</label>
                <textarea 
                    rows={4}
                    value={compositionPrompt}
                    onChange={(e) => setCompositionPrompt(e.target.value)}
                    placeholder="例如：背景是雪地场景，把角色放在左侧，玩法截图放在中间，Logo放在顶部..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none text-xs"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3" /> 图片比例 (多选)
                </label>
                <div className="flex flex-wrap gap-2">
                    {aspectRatioOptions.map(opt => {
                        const isSelected = selectedAspectRatios.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => toggleAspectRatio(opt.value)}
                                className={`px-3 py-2 rounded-lg text-xs border transition-all ${
                                    isSelected
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/30'
                                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                                }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> 素材风格
                    </label>
                    <select 
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {styleOptions.map(opt => (
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
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {modelOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">行动号召 (CTA)</label>
                <div className="flex items-center gap-3">
                    <select 
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        <option value="">无 (None)</option>
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
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'AI 合成中...' : '生成合成素材'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-xl font-bold text-white">合成结果</h2>
            {generatedResults.length > 0 && (
                <button 
                    onClick={clearResults}
                    className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-700"
                >
                    <Trash2 className="w-3 h-3" /> 清空历史
                </button>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-indigo-300 animate-pulse">{loadingStage}</span>
                </div>
            ) : generatedResults.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {generatedResults.map((result) => (
                        <div key={result.id} className="group relative bg-slate-900 rounded-xl border border-slate-700 overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col">
                            {/* Image Area */}
                            <div className="relative w-full aspect-square bg-black/20 flex items-center justify-center overflow-hidden">
                                <img 
                                    src={result.imageUrl} 
                                    alt={`Composite ${result.ratio}`} 
                                    className="max-w-full max-h-full object-contain"
                                />
                                
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button 
                                        onClick={() => setPreviewImage(result.imageUrl)}
                                        className="p-2 bg-white/10 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/20 transition-colors"
                                        title="预览"
                                    >
                                        <Maximize2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDownloadImage(result.imageUrl, result.ratio)}
                                        className="p-2 bg-white/10 hover:bg-indigo-600 text-white rounded-full backdrop-blur-md border border-white/20 transition-colors"
                                        title="下载"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Ratio Badge */}
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                                    {result.ratio}
                                </div>

                                {/* Remove Button */}
                                <button 
                                    onClick={() => removeResult(result.id)}
                                    className="absolute top-2 right-2 p-1.5 text-white/50 hover:text-red-400 bg-black/40 hover:bg-black/60 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Prompt Info */}
                            <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Composition Prompt</span>
                                    <button 
                                        onClick={() => handleCopyPrompt(result.prompt, result.id)}
                                        className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1 transition-colors"
                                    >
                                        {copiedPromptId === result.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedPromptId === result.id ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono line-clamp-2 hover:line-clamp-none transition-all cursor-text bg-black/20 p-1.5 rounded border border-slate-800">
                                    {result.prompt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                    <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <Layers className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-lg font-medium">暂无合成结果</p>
                    <p className="text-sm">上传或生成素材并填写指令进行合成。</p>
                </div>
            )}
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

export default ImageComposition;

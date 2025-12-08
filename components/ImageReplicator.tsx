
import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Sparkles, Upload, Maximize2, Download, Copy, Check, Type, User, Palette, Globe, RefreshCcw, Cpu, X, MousePointerClick, Wand2 } from 'lucide-react';
import { generateAdImage, describeImageForRecreation } from '../services/geminiService';

const ImageReplicator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [analyzedPrompt, setAnalyzedPrompt] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('3D Render');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash-image');
  const [includeText, setIncludeText] = useState(false);
  const [includeCharacters, setIncludeCharacters] = useState(true);
  const [includeButton, setIncludeButton] = useState(false);
  const [cta, setCta] = useState('Download Now (立即下载)');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedAnalyzed, setCopiedAnalyzed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { value: '1:1', label: '1:1 (方形)' },
    { value: '9:16', label: '9:16 (竖屏)' },
    { value: '16:9', label: '16:9 (横版)' },
    { value: '4:5', label: '4:5 (社交媒体)' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English (英文)' },
    { value: 'Simplified Chinese', label: 'Simplified Chinese (简体中文)' },
    { value: 'Traditional Chinese', label: 'Traditional Chinese (繁体中文)' },
    { value: 'Japanese', label: 'Japanese (日语)' },
    { value: 'Korean', label: 'Korean (韩语)' },
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

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                  setSourceImage(e.target?.result as string);
                  setAnalyzedPrompt(''); // Clear previous analysis
              };
              reader.readAsDataURL(blob);
            }
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
          setSourceImage(e.target?.result as string);
          setAnalyzedPrompt(''); // Clear previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzePrompt = async () => {
    if (!sourceImage) return;
    setAnalyzing(true);
    try {
        const base64Data = sourceImage.split(',')[1];
        const mimeType = sourceImage.substring(sourceImage.indexOf(':') + 1, sourceImage.indexOf(';'));
        const description = await describeImageForRecreation(base64Data, mimeType);
        setAnalyzedPrompt(description);
    } catch (e) {
        console.error(e);
        alert("分析失败，请重试。");
    } finally {
        setAnalyzing(false);
    }
  };

  const handleCopyAnalyzed = () => {
    if (!analyzedPrompt) return;
    navigator.clipboard.writeText(analyzedPrompt);
    setCopiedAnalyzed(true);
    setTimeout(() => setCopiedAnalyzed(false), 2000);
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
        alert("请先上传或粘贴一张参考图片");
        return;
    }

    // Check API Key for paid models
    if ((window as any).aistudio && (selectedModel === 'gemini-3-pro-image-preview' || selectedModel.includes('imagen'))) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    setLoading(true);
    setGeneratedImage(null);
    setGeneratedPrompt(null);

    try {
        let description = analyzedPrompt;

        // Step 1: Analyze the source image if not already done
        if (!description) {
            setLoadingStage('正在分析参考图特征...');
            const base64Data = sourceImage.split(',')[1];
            const mimeType = sourceImage.substring(sourceImage.indexOf(':') + 1, sourceImage.indexOf(';'));
            
            description = await describeImageForRecreation(base64Data, mimeType);
            setAnalyzedPrompt(description);
        }
        
        // Step 2: Combine description with user preferences
        setLoadingStage('正在重构创意提示词...');
        let finalPrompt = `Recreate an image based on this description: ${description}. `;
        if (additionalPrompt) {
            finalPrompt += ` Additional requirements: ${additionalPrompt}. `;
        }
        
        const ctaText = cta.split(' (')[0]; // Extract English part
        if (includeButton && ctaText) {
            finalPrompt += ` Include a clearly visible call-to-action button with text: "${ctaText}". `;
        }
        
        // Step 3: Generate the new image
        setLoadingStage('正在生成新素材...');
        const result = await generateAdImage(
            finalPrompt,
            aspectRatio,
            selectedStyle,
            "", // Visual details already in prompt
            selectedLanguage,
            includeText || (includeButton && !!cta),
            includeCharacters,
            selectedModel
        );

        setGeneratedImage(result.imageUrl);
        setGeneratedPrompt(result.prompt);

    } catch (error) {
        console.error(error);
        alert("生成失败，请重试。");
    } finally {
        setLoading(false);
        setLoadingStage('');
    }
  };

  const handleCopyPrompt = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `replicated_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0 h-full overflow-hidden">
        <div className="mb-4 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-indigo-400" />
            图片素材仿制
          </h2>
          <p className="text-sm text-slate-400 mt-1">上传参考图，AI 智能分析并生成风格相似的衍生素材。</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-2">
            {/* Upload Area */}
            <div 
                className="relative w-full aspect-video border-2 border-dashed border-slate-600 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center group overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
            >
                {sourceImage ? (
                    <img src={sourceImage} alt="Reference" className="w-full h-full object-contain" />
                ) : (
                    <>
                        <Upload className="w-8 h-8 text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-xs text-slate-400">点击上传或直接粘贴 (Ctrl+V)</p>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileSelect} 
                />
                {sourceImage && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-sm font-medium">点击更换图片</p>
                    </div>
                )}
            </div>

            {sourceImage && (
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Wand2 className="w-3 h-3 text-indigo-400" /> 反推提示词 (可编辑)
                        </label>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleAnalyzePrompt} 
                                disabled={analyzing}
                                className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                {analyzing ? '分析中' : analyzedPrompt ? '重新分析' : 'AI 反推'}
                            </button>
                            {analyzedPrompt && (
                                <button 
                                    onClick={handleCopyAnalyzed}
                                    className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                                >
                                    {copiedAnalyzed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    {copiedAnalyzed ? '已复制' : '复制'}
                                </button>
                            )}
                        </div>
                    </div>
                    <textarea 
                        rows={4}
                        value={analyzedPrompt}
                        onChange={(e) => setAnalyzedPrompt(e.target.value)}
                        placeholder="点击“AI 反推”提取图片描述，或在生成时自动提取..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                </div>
            )}

            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">增量提示词 (可选)</label>
                <textarea 
                    rows={2}
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    placeholder="例如：把背景改成雪地，主角换成猫..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> 输出语言
                    </label>
                    <select 
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {languageOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">图片比例</label>
                    <select 
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {aspectRatioOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> 风格微调
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
            </div>

            {/* Toggles */}
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
                        <span>包含人物</span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={includeCharacters} onChange={(e) => setIncludeCharacters(e.target.checked)} className="sr-only peer" />
                        <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
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
          {loading ? 'AI 仿制中...' : '生成仿制图片'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6">生成结果</h2>
        
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-hidden relative">
            {loading ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
                    </div>
                    <span className="text-sm font-medium text-indigo-300 animate-pulse">{loadingStage}</span>
                </div>
            ) : generatedImage ? (
                <div className="relative w-full h-full flex items-center justify-center group bg-black/20 p-4">
                    <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                    />
                    
                    {/* Action Bar */}
                    <div className="absolute bottom-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button 
                            onClick={() => setPreviewImage(generatedImage)}
                            className="bg-black/60 hover:bg-indigo-600 text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-colors"
                            title="全屏预览"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={handleDownloadImage}
                            className="bg-black/60 hover:bg-indigo-600 text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-colors"
                            title="下载图片"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-500">
                    <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <ImageIcon className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-lg font-medium">暂无结果</p>
                    <p className="text-sm">在左侧上传参考图并点击生成。</p>
                </div>
            )}
        </div>

        {/* Prompt Display */}
        {generatedPrompt && (
            <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Used Prompt</span>
                    <button 
                        onClick={handleCopyPrompt}
                        className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedPrompt ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <p className="text-xs text-slate-300 font-mono line-clamp-2 hover:line-clamp-none transition-all cursor-text">{generatedPrompt}</p>
            </div>
        )}
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

export default ImageReplicator;

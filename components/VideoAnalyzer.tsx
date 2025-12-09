
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Clapperboard, Loader2, Upload, Youtube, Film, Image as ImageIcon, Copy, Check, FileText, Play, Cpu, Wand2, Download, Video, Globe, Type } from 'lucide-react';
import { analyzeVideoFrames, analyzeVideoUrl, generateAdImage, generateVideoFromImage } from '../services/geminiService';
import { VideoAnalysisResponse, StoryboardShot, AiMetadata } from '../types';
import { exportToGoogleDocs } from '../utils/exportUtils';
import AiMetaDisplay from './AiMetaDisplay';

const VideoAnalyzer: React.FC = () => {
  const [mode, setMode] = useState<'upload' | 'url'>('url');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [context, setContext] = useState('Mobile game ad creative, casual puzzle game.');
  const [selectedVisionModel, setSelectedVisionModel] = useState('gemini-2.5-flash');
  const [selectedImageModel, setSelectedImageModel] = useState('gemini-2.5-flash-image');
  const [selectedVideoModel, setSelectedVideoModel] = useState('veo-3.1-fast-generate-preview');
  
  // New Language State Variables
  const [scriptLang, setScriptLang] = useState('Chinese (中文)');
  const [storyboardLang, setStoryboardLang] = useState('Chinese (中文)');
  const [promptLang, setPromptLang] = useState('English (英文)');

  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResponse | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Image Generation State for Storyboard
  const [generatingShotId, setGeneratingShotId] = useState<string | null>(null);
  const [generatingVideoShotId, setGeneratingVideoShotId] = useState<string | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visionModelOptions = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (视觉能力)' },
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
  ];

  const imageModelOptions = [
    { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash (快速)' },
    { value: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro (高质量)' },
    { value: 'imagen-3.0-generate-002', label: 'Imagen 3' }
  ];

  const videoModelOptions = [
    { value: 'veo-3.1-fast-generate-preview', label: 'Veo Fast (快速预览)' },
    { value: 'veo-3.1-generate-preview', label: 'Veo Pro (高质量)' }
  ];

  const languageOptions = [
    { value: 'Chinese (中文)', label: '中文 (Chinese)' },
    { value: 'English (英文)', label: '英文 (English)' },
  ];

  // Utility to extract frames from video file
  const extractFrames = async (file: File, numFrames: number = 10): Promise<string[]> => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames: string[] = [];

        video.onloadeddata = async () => {
            const duration = video.duration;
            const interval = Math.min(duration / numFrames, 5); // Max 5 sec interval
            let currentTime = 0;

            const seekResolve = (res: any) => {
                video.onseeked = res;
            };

            while (currentTime < duration && frames.length < numFrames) {
                video.currentTime = currentTime;
                await new Promise(seekResolve);
                
                canvas.width = video.videoWidth / 2; // Resize for token efficiency
                canvas.height = video.videoHeight / 2;
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Get base64 without prefix for Gemini API if using inlineData, 
                // but our service wrapper expects full data URL or handles it.
                // The service `analyzeVideoFrames` expects just the base64 string usually, let's provide clean base64.
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                frames.push(dataUrl.split(',')[1]); 
                
                currentTime += interval;
            }
            URL.revokeObjectURL(video.src);
            resolve(frames);
        };
    });
  };

  const handleAnalyze = async () => {
    if (mode === 'url' && !videoUrl) {
        alert('请输入 YouTube 链接');
        return;
    }
    if (mode === 'upload' && !uploadedFile) {
        alert('请上传视频文件');
        return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setMeta(null);

    try {
        if (mode === 'upload' && uploadedFile) {
            setLoadingMessage('正在从视频提取关键帧...');
            const frames = await extractFrames(uploadedFile);
            setLoadingMessage('正在使用 Gemini 分析视频帧...');
            const response = await analyzeVideoFrames(
                frames, 
                context, 
                scriptLang, 
                storyboardLang, 
                promptLang,
                selectedVisionModel
            );
            setAnalysisResult(response.data);
            setMeta(response.meta);
        } else {
            setLoadingMessage('正在分析视频链接...');
            const response = await analyzeVideoUrl(
                videoUrl, 
                context, 
                scriptLang, 
                storyboardLang, 
                promptLang,
                selectedVisionModel
            );
            setAnalysisResult(response.data);
            setMeta(response.meta);
        }
    } catch (error) {
        console.error(error);
        alert('分析失败，请重试。');
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  };

  const handleGenerateKeyframe = async (shot: StoryboardShot) => {
      // Check API Key
      if ((window as any).aistudio && (selectedImageModel === 'gemini-3-pro-image-preview' || selectedImageModel.includes('imagen'))) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
      }

      setGeneratingShotId(shot.id);
      try {
          const { imageUrl } = await generateAdImage(
              shot.visualPrompt,
              '16:9',
              'Cinematic',
              shot.description,
              'English',
              false,
              true,
              selectedImageModel
          );
          
          setAnalysisResult(prev => {
              if (!prev) return null;
              const storyboard = prev.storyboard || [];
              return {
                  ...prev,
                  storyboard: storyboard.map(s => s.id === shot.id ? { ...s, generatedImageUrl: imageUrl } : s)
              };
          });
      } catch (error) {
          console.error(error);
          alert('生成图片失败。');
      } finally {
          setGeneratingShotId(null);
      }
  };

  const handleGenerateVideo = async (shot: StoryboardShot) => {
      if (!shot.generatedImageUrl) {
          alert('请先生成关键帧图片。');
          return;
      }

      // Check API Key for Veo (Mandatory)
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
      }

      setGeneratingVideoShotId(shot.id);
      try {
          const videoUrl = await generateVideoFromImage(
              shot.description,
              shot.generatedImageUrl,
              selectedVideoModel
          );

          setAnalysisResult(prev => {
              if (!prev) return null;
              const storyboard = prev.storyboard || [];
              return {
                  ...prev,
                  storyboard: storyboard.map(s => s.id === shot.id ? { ...s, generatedVideoUrl: videoUrl } : s)
              };
          });
      } catch (error) {
          console.error(error);
          alert('生成视频失败。请确保您拥有 Veo 访问权限的 API Key。');
      } finally {
          setGeneratingVideoShotId(null);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setUploadedFile(e.target.files[0]);
      }
  };

  const handleCopyPrompt = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleExport = () => {
      if (!analysisResult) return;
      // Safety check for storyboard array
      const storyboard = analysisResult.storyboard || [];
      const content = `# Video Analysis Report\n\n## Script\n${analysisResult.script}\n\n## Storyboard\n${storyboard.map(s => `### Shot ${s.shotNumber}\n**Visual:** ${s.description}\n**Audio:** ${s.audio}\n**Prompt:** ${s.visualPrompt}`).join('\n\n')}`;
      exportToGoogleDocs(content, 'Video Breakdown');
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-indigo-400" />
            视频拉片拆解
          </h2>
          <p className="text-sm text-slate-400 mt-1">上传视频或链接，AI 自动拆解脚本并生成分镜关键帧。</p>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Mode Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-lg">
                <button 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setMode('url')}
                >
                    <Youtube className="w-4 h-4" /> YouTube / URL
                </button>
                <button 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setMode('upload')}
                >
                    <Upload className="w-4 h-4" /> 上传视频
                </button>
            </div>

            {/* Input Area */}
            {mode === 'url' ? (
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">视频链接 (Video URL)</label>
                    <input 
                        type="text" 
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
            ) : (
                <div 
                    className="relative w-full aspect-video border-2 border-dashed border-slate-600 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploadedFile ? (
                        <div className="flex flex-col items-center gap-2">
                            <Film className="w-8 h-8 text-green-400" />
                            <p className="text-sm text-white font-medium truncate max-w-[200px]">{uploadedFile.name}</p>
                            <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-indigo-400">
                            <Upload className="w-8 h-8" />
                            <p className="text-xs">点击上传视频 (MP4/MOV)</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="video/*" 
                        onChange={handleFileChange} 
                    />
                </div>
            )}

            {/* Context */}
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">分析语境 / 目标</label>
                <textarea 
                    rows={3}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
            </div>

            {/* Language Options */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> 脚本输出语言
                    </label>
                    <select 
                        value={scriptLang}
                        onChange={(e) => setScriptLang(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {languageOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Clapperboard className="w-3 h-3" /> 分镜输出语言
                    </label>
                    <select 
                        value={storyboardLang}
                        onChange={(e) => setStoryboardLang(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {languageOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Type className="w-3 h-3" /> 关键帧图片提示词语言
                    </label>
                    <select 
                        value={promptLang}
                        onChange={(e) => setPromptLang(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {/* Swapped order to make English default for prompts as requested */}
                        <option value="English (英文)">英文 (English)</option>
                        <option value="Chinese (中文)">中文 (Chinese)</option>
                    </select>
                </div>
            </div>

            {/* Model Selectors */}
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> 视觉分析模型
                    </label>
                    <select 
                        value={selectedVisionModel}
                        onChange={(e) => setSelectedVisionModel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {visionModelOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> 关键帧生图模型
                    </label>
                    <select 
                        value={selectedImageModel}
                        onChange={(e) => setSelectedImageModel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {imageModelOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Video className="w-3 h-3" /> 视频生成模型 (Veo)
                    </label>
                    <select 
                        value={selectedVideoModel}
                        onChange={(e) => setSelectedVideoModel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-xs"
                    >
                        {videoModelOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clapperboard className="w-5 h-5" />}
            {loading ? loadingMessage || '正在处理...' : '开始拉片分析'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {analysisResult ? (
            <>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-indigo-400" /> 分析结果
                    </h2>
                    <button 
                        onClick={handleExport}
                        className="bg-slate-700 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <FileText className="w-4 h-4" /> 导出文档
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
                    {/* Script Section */}
                    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" /> 视频脚本
                        </h3>
                        <div className="prose prose-invert prose-indigo max-w-none text-sm">
                            <ReactMarkdown>{analysisResult.script}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Storyboard Section */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-400" /> 分镜脚本
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {analysisResult.storyboard && analysisResult.storyboard.length > 0 ? (
                                analysisResult.storyboard.map((shot) => (
                                <div key={shot.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex gap-6">
                                    {/* Visual/Image Side */}
                                    <div className="w-[300px] shrink-0 flex flex-col gap-3">
                                        <div className="aspect-video bg-black/40 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center relative group">
                                            {shot.generatedVideoUrl ? (
                                                <video 
                                                    src={shot.generatedVideoUrl} 
                                                    controls 
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : shot.generatedImageUrl ? (
                                                <img src={shot.generatedImageUrl} alt={`Shot ${shot.shotNumber}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-4">
                                                    <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                                    <p className="text-xs text-slate-500">暂无图片</p>
                                                </div>
                                            )}
                                            
                                            {/* Generate Button Overlay */}
                                            {!shot.generatedVideoUrl && (
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                                                    <button 
                                                        onClick={() => handleGenerateKeyframe(shot)}
                                                        disabled={generatingShotId === shot.id}
                                                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg w-40 justify-center"
                                                    >
                                                        {generatingShotId === shot.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                                                        {shot.generatedImageUrl ? '重新生成图片' : '生成图片'}
                                                    </button>
                                                    {shot.generatedImageUrl && (
                                                        <button 
                                                            onClick={() => handleGenerateVideo(shot)}
                                                            disabled={generatingVideoShotId === shot.id}
                                                            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg w-40 justify-center"
                                                        >
                                                            {generatingVideoShotId === shot.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Video className="w-3 h-3" />}
                                                            生成视频片段
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {shot.generatedImageUrl && (
                                            <a 
                                                href={shot.generatedImageUrl} 
                                                download={`shot_${shot.shotNumber}.png`}
                                                className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <Download className="w-3 h-3" /> 下载图片
                                            </a>
                                        )}
                                    </div>

                                    {/* Content Side */}
                                    <div className="flex-1 flex flex-col gap-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-indigo-900/50 text-indigo-300 text-xs font-bold px-2 py-1 rounded">Shot {shot.shotNumber}</span>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">画面描述</label>
                                            <p className="text-sm text-slate-200 leading-relaxed">{shot.description}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">音频 / 对白</label>
                                            <p className="text-sm text-slate-300 italic">{shot.audio}</p>
                                        </div>
                                        <div className="mt-auto pt-3 border-t border-slate-800">
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                    <Cpu className="w-3 h-3" /> AI 绘图提示词
                                                </label>
                                                <button 
                                                    onClick={() => handleCopyPrompt(shot.visualPrompt, shot.id)}
                                                    className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                                                >
                                                    {copiedPromptId === shot.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                                    {copiedPromptId === shot.id ? '已复制' : '复制'}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-400 font-mono bg-black/20 p-2 rounded border border-white/5 select-all">
                                                {shot.visualPrompt}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                            ) : (
                                <div className="text-center text-slate-500 p-10">
                                    <p>未生成分镜画面。</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <AiMetaDisplay metadata={meta} />
                </div>
            </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                    <Clapperboard className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-lg font-medium">视频拉片助手</p>
                <p className="text-sm max-w-xs text-center mt-2">上传视频或粘贴链接，AI 自动拆解脚本并生成可视化分镜。</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default VideoAnalyzer;

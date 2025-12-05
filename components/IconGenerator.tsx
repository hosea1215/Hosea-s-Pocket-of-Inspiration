
import React, { useState } from 'react';
import { Loader2, Download, RefreshCw, Palette, Box, Link as LinkIcon, Sparkles, Maximize2, X } from 'lucide-react';
import { generateAppIcon, analyzeIconElementsFromUrl } from '../services/geminiService';
import { AppIcon } from '../types';

const IconGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  const [genre, setGenre] = useState('Puzzle (益智)');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [elements, setElements] = useState('彩色方块，爆炸效果，简约风格');
  const [style, setStyle] = useState('3D Render (3D渲染)');
  const [generatedIcons, setGeneratedIcons] = useState<AppIcon[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Full Google Play Categories with Chinese Translations
  const googlePlayGenres = [
    "Action (动作)", "Adventure (冒险)", "Arcade (街机)", "Board (棋类)", 
    "Card (卡牌)", "Casino (博彩)", "Casual (休闲)", "Educational (教育)", 
    "Music (音乐)", "Puzzle (益智)", "Racing (赛车)", "Role Playing (角色扮演)", 
    "Simulation (模拟)", "Sports (体育)", "Strategy (策略)", "Trivia (问答)", 
    "Word (文字)"
  ];

  const styleOptions = [
    "3D Render (3D渲染)",
    "Minimalist Vector (简约矢量)",
    "Cartoon / Cel Shaded (卡通/赛璐珞)",
    "Pixel Art (像素风)",
    "Hyper Realistic (超写实)",
    "Flat Design (扁平化设计)",
    "Cyberpunk / Neon (赛博朋克/霓虹)",
    "Hand-drawn (手绘风格)",
    "Low Poly (低多边形)",
    "Claymorphism (粘土风格)",
    "Glassmorphism (毛玻璃)",
    "Pop Art (波普艺术)",
    "Origami (折纸风格)",
    "Watercolor (水彩)",
    "Voxel (体素风格)"
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const imageUrl = await generateAppIcon(gameName, genre, style, elements);
      
      const newIcon: AppIcon = {
        id: Date.now().toString(),
        imageUrl: imageUrl,
        prompt: elements,
        style: style
      };

      setGeneratedIcons(prev => [newIcon, ...prev]);
    } catch (error) {
      console.error(error);
      alert("生成图标失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeElements = async () => {
    if (!gameName || !storeUrl) {
      alert("请确保已填写游戏名称和商店链接。");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeIconElementsFromUrl(gameName, storeUrl);
      setElements(result);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = (imageUrl: string, id: string) => {
    // Create a temporary image to draw onto a 512x512 canvas
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the image resized to 512x512
        ctx.drawImage(img, 0, 0, 512, 512);
        
        // Convert canvas to blob/url for download
        const resizedUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.href = resizedUrl;
        link.download = `icon_${gameName.replace(/\s+/g, '_')}_${id}_512x512.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    img.src = imageUrl;
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-400" />
            谷歌商店 ICON 生成
          </h2>
          <p className="text-sm text-slate-400 mt-1">AI 智能生成符合 Google Play 规范的 512x512 高清图标。</p>
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
            <div className="flex justify-between items-center mb-2">
               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">核心元素描述</label>
               <button 
                  onClick={handleAnalyzeElements}
                  disabled={analyzing}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {analyzing ? '分析中' : 'AI 扩展填写'}
                </button>
            </div>
            <textarea 
              rows={4}
              value={elements}
              onChange={(e) => setElements(e.target.value)}
              placeholder="例如：一个戴着头盔的骑士，背景是火焰，突出核心角色..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">艺术风格</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {styleOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Palette className="w-5 h-5" />}
          {loading ? '正在设计中...' : '生成图标'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6">生成结果</h2>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 lg:grid-cols-3 gap-6 content-start pb-4">
          {generatedIcons.length === 0 && !loading && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 h-full">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                  <Box className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-lg font-medium">准备生成</p>
                <p className="text-sm max-w-xs text-center mt-2">在左侧输入描述，为您的游戏生成专属 Google Play 图标。</p>
             </div>
          )}

          {loading && (
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 aspect-square flex items-center justify-center animate-pulse">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <span className="text-xs text-indigo-400 font-medium">AI 绘图中...</span>
                </div>
            </div>
          )}

          {generatedIcons.map((icon) => (
            <div key={icon.id} className="group relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden hover:border-indigo-500/50 transition-all group/icon">
              <div className="aspect-square w-full p-6 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-950/50 relative">
                {/* Icon Preview Container simulating Play Store shape */}
                <div className="w-full h-full rounded-[22%] overflow-hidden shadow-2xl shadow-black/50 relative">
                   <img src={icon.imageUrl} alt="Generated Icon" className="w-full h-full object-cover" />
                   {/* Gloss effect overlay */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                </div>

                {/* Maximize Button Overlay */}
                <button 
                  onClick={() => setPreviewImage(icon.imageUrl)}
                  className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-indigo-600 text-white rounded-full opacity-0 group-hover/icon:opacity-100 transition-all backdrop-blur-sm border border-white/10"
                  title="全屏预览"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 bg-slate-800/80 backdrop-blur border-t border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block">{icon.style}</span>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5" title={icon.prompt}>{icon.prompt}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownload(icon.imageUrl, icon.id)}
                  className="w-full mt-2 bg-slate-700 hover:bg-indigo-600 text-white text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors font-medium"
                >
                  <Download className="w-3 h-3" /> 保存 PNG (512x512)
                </button>
              </div>
            </div>
          ))}
        </div>
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

export default IconGenerator;

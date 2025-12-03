
import React, { useState } from 'react';
import { Loader2, Languages, Copy, Check, Smile, Link as LinkIcon, Sparkles } from 'lucide-react';
import { generateFacebookAdCopies, analyzeSellingPointsFromUrl } from '../services/geminiService';
import { CopyVariant } from '../types';

const CopyGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [productName, setProductName] = useState('COLOR BLOCK');
  const [storeUrl, setStoreUrl] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [description, setDescription] = useState('彩色的PUZZLE BLOCK块，连击爽快感，等待的碎片时间玩这个游戏');
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [results, setResults] = useState<CopyVariant[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const languages = [
    { value: 'English', label: 'English (英文)' },
    { value: 'Traditional Chinese', label: 'Traditional Chinese (繁体中文)' },
    { value: 'Spanish', label: 'Spanish (西班牙语)' },
    { value: 'Portuguese', label: 'Portuguese (葡萄牙语)' },
    { value: 'German', label: 'German (德语)' },
    { value: 'French', label: 'French (法语)' },
    { value: 'Japanese', label: 'Japanese (日语)' },
    { value: 'Korean', label: 'Korean (韩语)' },
    { value: 'Arabic', label: 'Arabic (阿拉伯语)' },
  ];

  const handleGenerate = async () => {
    if (!productName || !description) return;
    
    setLoading(true);
    setResults([]); // Clear previous results
    try {
      const data = await generateFacebookAdCopies(
        productName,
        description,
        targetLanguage,
        includeEmojis,
        storeUrl
      );
      setResults(data);
    } catch (error) {
      console.error(error);
      alert("生成文案失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSellingPoints = async () => {
    if (!productName || !storeUrl) {
      alert("请确保已填写游戏名称和商店链接。");
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeSellingPointsFromUrl(productName, storeUrl);
      setDescription(result);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setAnalyzing(false);
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
            <Languages className="w-5 h-5 text-indigo-400" />
            FB 文案配置
          </h2>
          <p className="text-sm text-slate-400 mt-1">批量生成符合 Facebook 广告规范的多语言文案。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">产品/游戏名称</label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
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
             <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">卖点描述 (简体中文)</label>
                <button 
                  onClick={handleAnalyzeSellingPoints}
                  disabled={analyzing}
                  className="text-[10px] bg-slate-700 hover:bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {analyzing ? '分析中' : 'AI 扩展填写'}
                </button>
             </div>
            <textarea 
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述游戏的核心玩法、特色或吸引点..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">输出语言</label>
            <select 
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700">
            <div className={`p-2 rounded-lg ${includeEmojis ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
              <Smile className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-white block">包含表情符号</span>
              <span className="text-xs text-slate-500">在文案中自动添加 Emoji</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={includeEmojis} onChange={(e) => setIncludeEmojis(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />}
          {loading ? 'AI 撰写中...' : '生成 20 条文案'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold text-white">生成的文案 ({results.length})</h2>
           {results.length > 0 && (
             <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
               {targetLanguage}
             </span>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {results.length === 0 && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 pb-12">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                  <Copy className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-lg font-medium">准备生成</p>
                <p className="text-sm max-w-xs text-center mt-2">一次性生成 20 条针对不同语言优化的高转化广告文案。</p>
             </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 animate-pulse h-32">
                   <div className="h-4 bg-slate-800 rounded w-3/4 mb-3"></div>
                   <div className="h-4 bg-slate-800 rounded w-full mb-3"></div>
                   <div className="h-3 bg-slate-800 rounded w-1/2 mt-4 opacity-50"></div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {results.map((item, index) => (
              <div key={item.id} className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/50 transition-all group relative">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => copyToClipboard(item.targetText, item.id)}
                    className="p-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
                    title="复制文案"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mb-3 pr-10">
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">文案 #{index + 1}</span>
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{item.targetText}</p>
                </div>
                
                <div className="pt-3 border-t border-slate-800 mt-2">
                  <p className="text-xs text-slate-500 leading-relaxed">{item.sourceText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyGenerator;

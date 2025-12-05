
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Newspaper, Loader2, Copy, Check, FileText, Globe, ExternalLink, RefreshCw } from 'lucide-react';
import { generateGooglePlayNews } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';

const GooglePlayNews: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [news, setNews] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const languages = [
    "Simplified Chinese (简体中文)",
    "English (英文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setNews(null);
    try {
      const result = await generateGooglePlayNews(language);
      setNews(result);
    } catch (error) {
      console.error(error);
      alert("获取资讯失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!news) return;
    navigator.clipboard.writeText(news);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!news) return;
    exportToGoogleDocs(news, `Google Play News Briefing - ${new Date().toLocaleDateString()}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-indigo-400" />
            GOOGLE PLAY 最新资讯
          </h2>
          <p className="text-sm text-slate-400 mt-1">获取最近 30 天 Google Play 政策、算法与市场动态简报。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          
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
               <RefreshCw className="w-3 h-3" /> 实时搜索范围
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Policy Updates:</strong> 开发者政策变更、合规要求。</li>
               <li><strong className="text-slate-300">Algorithm:</strong> 排名算法波动、推荐机制调整。</li>
               <li><strong className="text-slate-300">Features:</strong> Play Console 新功能、推广工具更新。</li>
               <li><strong className="text-slate-300">Trends:</strong> 热门品类、市场数据趋势。</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Newspaper className="w-5 h-5" />}
          {loading ? '正在检索资讯...' : '生成最新简报'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {news ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Google Play 资讯简报</h2>
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
            
            <div className="prose prose-invert prose-indigo max-w-none overflow-y-auto pr-4 custom-scrollbar">
               <ReactMarkdown 
                 components={{
                   a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-inline gap-1" />
                 }}
               >
                 {news}
               </ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <ExternalLink className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">资讯简报生成器</p>
             <p className="text-sm max-w-xs text-center mt-2">AI 将实时检索网络，为您汇总 Google Play 的最新动态。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GooglePlayNews;


import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Loader2, Copy, Check, FileText, Globe, Calendar, RefreshCw } from 'lucide-react';
import { generateAiNews } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';

const AiNews: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('Simplified Chinese (简体中文)');
  const [timeRange, setTimeRange] = useState('Last 7 days (最近7天)');
  const [news, setNews] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const languages = [
    "Simplified Chinese (简体中文)",
    "English (英文)",
    "Traditional Chinese (繁体中文)",
    "Japanese (日语)",
    "Korean (韩语)",
  ];

  const timeRanges = [
    "Last 24 hours (最近24小时)",
    "Last 3 days (最近3天)",
    "Last 7 days (最近7天)",
    "Last 30 days (最近30天)",
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setNews(null);
    try {
      const result = await generateAiNews(timeRange, language);
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
    exportToGoogleDocs(news, `AI News Briefing - ${new Date().toLocaleDateString()}`);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            获得 AI 新闻
          </h2>
          <p className="text-sm text-slate-400 mt-1">搜索并整理 Gemini, ChatGPT, Claude, Grok, DeepSeek 的最新发布和更新信息。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
               <Calendar className="w-3 h-3" /> 时间范围
            </label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {timeRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

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
               <RefreshCw className="w-3 h-3" /> 关注模型
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Gemini:</strong> Google 最新多模态模型更新。</li>
               <li><strong className="text-slate-300">ChatGPT:</strong> OpenAI 模型发布与功能更新。</li>
               <li><strong className="text-slate-300">Claude:</strong> Anthropic 模型能力提升。</li>
               <li><strong className="text-slate-300">Grok:</strong> xAI 最新动态。</li>
               <li><strong className="text-slate-300">DeepSeek:</strong> 深度求索开源与技术进展。</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
          {loading ? '正在检索 AI 资讯...' : '生成 AI 新闻简报'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {news ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">AI 行业动态简报</h2>
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
                   a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-inline gap-1" />,
                   table: ({node, ...props}) => <table {...props} className="w-full text-left border-collapse border border-slate-700 rounded-lg overflow-hidden" />,
                   th: ({node, ...props}) => <th {...props} className="bg-slate-900 border border-slate-700 p-3 text-sm font-semibold text-slate-300" />,
                   td: ({node, ...props}) => <td {...props} className="border border-slate-700 p-3 text-sm text-slate-400" />
                 }}
               >
                 {news}
               </ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Bot className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">AI 资讯追踪</p>
             <p className="text-sm max-w-xs text-center mt-2">AI 将实时检索网络，为您汇总主流 AI 模型的最新发布与更新。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiNews;

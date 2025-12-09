
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowRightLeft, Loader2, Link as LinkIcon, Trophy, Check, Copy, Globe, FileText, Cpu } from 'lucide-react';
import { compareStorePages } from '../services/geminiService';
import { StoreComparisonResponse, AiMetadata } from '../types';
import AiMetaDisplay from './AiMetaDisplay';

const StoreComparison: React.FC = () => {
  const [url1, setUrl1] = useState('https://play.google.com/store/apps/details?id=com.puzzlegames.puzzlebrickslegend');
  const [url2, setUrl2] = useState('https://play.google.com/store/apps/details?id=com.easybrain.block.puzzle.games');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoreComparisonResponse | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');

  const languages = [
    { value: 'English', label: 'English (英文)' },
    { value: 'Simplified Chinese', label: 'Simplified Chinese (简体中文)' },
    { value: 'Traditional Chinese', label: 'Traditional Chinese (繁体中文)' },
    { value: 'Japanese', label: 'Japanese (日语)' },
    { value: 'Korean', label: 'Korean (韩语)' },
    { value: 'Spanish', label: 'Spanish (西班牙语)' },
    { value: 'Portuguese', label: 'Portuguese (葡萄牙语)' },
  ];

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速)' },
  ];

  const handleCompare = async () => {
    if (!url1 || !url2) {
      alert("请填写两个游戏商店链接");
      return;
    }
    setLoading(true);
    setResult(null);
    setMeta(null);
    try {
      const { data, meta } = await compareStorePages(url1, url2, language, selectedModel);
      setResult(data);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("对比失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const tableText = result.comparisonTable?.map(row => 
      `Dimension: ${row.dimension}\n${result.game1Name}: ${row.game1Content}\n${result.game2Name}: ${row.game2Content}\nWinner: ${row.winner}\nInsight: ${row.insight}`
    ).join('\n\n') || '';
    const fullText = `# Store Comparison: ${result.game1Name} vs ${result.game2Name}\n\n${tableText}\n\n## Detailed Analysis\n${result.detailedAnalysis}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    const tableText = result.comparisonTable?.map(row => 
      `Dimension: ${row.dimension}\n${result.game1Name}: ${row.game1Content}\n${result.game2Name}: ${row.game2Content}\nWinner: ${row.winner}\nInsight: ${row.insight}`
    ).join('\n\n') || '';
    const fullText = `# Store Comparison: ${result.game1Name} vs ${result.game2Name}\n\n${tableText}\n\n## Detailed Analysis\n${result.detailedAnalysis}`;
    navigator.clipboard.writeText(fullText);
    window.open('https://docs.new', '_blank');
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            游戏商店详情页对比
          </h2>
          <p className="text-sm text-slate-400 mt-1">输入两款游戏的链接，全方位对比其 ASO 策略与表现。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏 A 商店链接</label>
            <div className="relative">
              <input 
                type="text" 
                value={url1}
                onChange={(e) => setUrl1(e.target.value)}
                placeholder="https://play.google.com/store/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
              <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">游戏 B 商店链接</label>
            <div className="relative">
              <input 
                type="text" 
                value={url2}
                onChange={(e) => setUrl2(e.target.value)}
                placeholder="https://play.google.com/store/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
              />
              <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3" /> 输出语言
                </label>
                <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Cpu className="w-3 h-3" /> AI 模型
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

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Trophy className="w-3 h-3" /> 对比维度
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Visuals:</strong> Icon, Screenshots, Video</li>
               <li><strong className="text-slate-300">Metadata:</strong> Title, Subtitle, Keywords</li>
               <li><strong className="text-slate-300">Content:</strong> Description, USP, Readability</li>
               <li><strong className="text-slate-300">Ratings:</strong> User Sentiment & Score</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleCompare} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
          {loading ? '正在对比分析...' : '开始对比'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {result ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white">商店页对比报告</h2>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <span className="text-indigo-400 font-semibold">{result.game1Name}</span>
                  <span className="text-slate-600">vs</span>
                  <span className="text-pink-400 font-semibold">{result.game2Name}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className={`bg-slate-700 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制报告'}
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
            
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                <table className="w-full text-left text-sm border-collapse bg-slate-900/50">
                  <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="p-4 border-b border-slate-700 w-1/6">维度 (Dimension)</th>
                      <th className="p-4 border-b border-slate-700 w-1/4 text-indigo-300">{result.game1Name}</th>
                      <th className="p-4 border-b border-slate-700 w-1/4 text-pink-300">{result.game2Name}</th>
                      <th className="p-4 border-b border-slate-700 w-1/3">分析结论 (Insight)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {result.comparisonTable?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-medium text-slate-300">{row.dimension}</td>
                        <td className="p-4 text-slate-400">{row.game1Content}</td>
                        <td className="p-4 text-slate-400">{row.game2Content}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-2 mb-1">
                               <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                 row.winner === 'Game 1' ? 'bg-indigo-500/20 text-indigo-300' :
                                 row.winner === 'Game 2' ? 'bg-pink-500/20 text-pink-300' :
                                 'bg-slate-700 text-slate-300'
                               }`}>
                                 {row.winner === 'Game 1' ? `${result.game1Name} 胜出` : 
                                  row.winner === 'Game 2' ? `${result.game2Name} 胜出` : '平局'}
                               </span>
                             </div>
                             <p className="text-slate-300 leading-relaxed">{row.insight}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Detailed Analysis */}
              <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/30">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <LinkIcon className="w-5 h-5 text-emerald-400" /> 深度总结与建议
                 </h3>
                 <div className="prose prose-invert prose-indigo max-w-none">
                    <ReactMarkdown>{result.detailedAnalysis}</ReactMarkdown>
                 </div>
              </div>

              <AiMetaDisplay metadata={meta} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <ArrowRightLeft className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">商店页对比分析</p>
             <p className="text-sm max-w-xs text-center mt-2">输入两个竞品链接，AI 将自动分析并生成可视化对比矩阵。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreComparison;

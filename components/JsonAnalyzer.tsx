
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Braces, Loader2, Play, Copy, Check, FileJson, GitGraph, FileText, Cpu, Trash2, Globe } from 'lucide-react';
import { analyzeJson } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';
import { AiMetadata } from '../types';
import AiMetaDisplay from './AiMetaDisplay';

const JsonAnalyzer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [context, setContext] = useState('General JSON (通用 JSON)');
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  const [language, setLanguage] = useState('Chinese (中文)');
  const [result, setResult] = useState<string | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [copied, setCopied] = useState(false);

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速)' },
  ];

  const contextOptions = [
    "General JSON (通用 JSON)",
    "AI Agent Configuration (AI 代理配置)",
    "Game Level Data (游戏关卡数据)",
    "User Profile Data (用户画像数据)",
    "API Response (API 返回值)",
    "Workflow Definition (工作流定义)"
  ];

  const languageOptions = [
    { value: 'Chinese (中文)', label: '中文 (Chinese)' },
    { value: 'English (英文)', label: '英文 (English)' },
    { value: 'Japanese (日语)', label: '日语 (Japanese)' },
    { value: 'Korean (韩语)', label: '韩语 (Korean)' },
  ];

  const handleAnalyze = async () => {
    if (!jsonInput.trim()) {
      alert("请输入 JSON 代码");
      return;
    }
    setLoading(true);
    setResult(null);
    setMeta(null);
    try {
      const { data, meta } = await analyzeJson(jsonInput, context, selectedModel, language);
      setResult(data);
      setMeta(meta);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    exportToGoogleDocs(result, `JSON Analysis Report`);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      alert("JSON 格式无效，无法格式化");
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setResult(null);
    setMeta(null);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Braces className="w-5 h-5 text-indigo-400" />
            JSON 代码分析
          </h2>
          <p className="text-sm text-slate-400 mt-1">分析 Agent 配置、校验逻辑并生成执行流程图。</p>
        </div>

        <div className="space-y-5 flex-1 flex flex-col min-h-0">
          
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">分析语境 (Context)</label>
            <select 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            >
              {contextOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Globe className="w-3 h-3" /> 输出语言
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              >
                {languageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              >
                {modelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">输入 JSON 代码</label>
                <div className="flex gap-2">
                    <button 
                        onClick={handleFormatJson}
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-0.5 rounded transition-colors"
                    >
                        Format
                    </button>
                    <button 
                        onClick={handleClear}
                        className="text-[10px] bg-slate-700 hover:bg-red-500/80 text-white px-2 py-0.5 rounded transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>
            <textarea 
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{\n  "name": "GameAgent",\n  "role": "NPC",\n  ... \n}`}
              className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none custom-scrollbar"
            />
          </div>
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitGraph className="w-5 h-5" />}
          {loading ? '正在分析...' : '开始分析与绘图'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {result ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">分析报告与流程图</h2>
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
               <ReactMarkdown>{result}</ReactMarkdown>
               <AiMetaDisplay metadata={meta} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <FileJson className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">JSON 深度分析</p>
             <p className="text-sm max-w-xs text-center mt-2">粘贴 JSON 代码，AI 将验证其逻辑正确性，解释功能并生成可视化流程图。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonAnalyzer;

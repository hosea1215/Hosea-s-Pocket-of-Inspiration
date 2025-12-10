
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Gamepad, Loader2, Copy, Check, FileText, Cpu, Search, Sparkles, Play, Code, Globe, Download, X, Upload, Link as LinkIcon, AlignLeft } from 'lucide-react';
import { generatePlayableConcept, generatePlayableCode } from '../services/geminiService';
import { exportToGoogleDocs } from '../utils/exportUtils';
import { AiMetadata } from '../types';
import AiMetaDisplay from './AiMetaDisplay';

const PlayableReplication: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [gameName, setGameName] = useState('COLOR BLOCK');
  
  // Input Source State
  const [inputType, setInputType] = useState<'desc' | 'file' | 'url'>('desc');
  const [description, setDescription] = useState('一段展示拖拽消除方块的视频，最后有一个“试玩结束”的 End Card。');
  const [adUrl, setAdUrl] = useState('');
  const [adFile, setAdFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  const [language, setLanguage] = useState('Chinese (中文)');
  
  const [result, setResult] = useState<string | null>(null);
  const [meta, setMeta] = useState<AiMetadata | null>(null);
  const [htmlCode, setHtmlCode] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (强推理)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速)' },
  ];

  const languageOptions = [
    { value: 'Chinese (中文)', label: '中文 (Chinese)' },
    { value: 'English (英文)', label: '英文 (English)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setAdFile(e.target.files[0]);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
  };

  const handleGenerate = async () => {
    if (!gameName) {
      alert("请填写游戏名称");
      return;
    }

    let finalPrompt = description;

    if (inputType === 'url') {
        if (!adUrl) {
            alert("请输入试玩广告 URL");
            return;
        }
        finalPrompt = `Analyze the Playable Ad at this URL: ${adUrl}.\n\nAdditional Context: ${description}`;
    } else if (inputType === 'file') {
        if (!adFile) {
            alert("请上传试玩广告文件");
            return;
        }
        
        if (adFile.name.endsWith('.html') || adFile.name.endsWith('.htm')) {
            try {
                // Read first 200KB to avoid excessive token usage if file is massive
                const content = await readFileContent(adFile);
                const truncatedContent = content.substring(0, 200000); 
                finalPrompt = `Analyze the following HTML code for a Playable Ad.\n\nCode Snippet:\n${truncatedContent}\n\nAdditional Context: ${description}`;
            } catch (e) {
                console.error("File read error", e);
                alert("文件读取失败");
                return;
            }
        } else {
            finalPrompt = `Analyze the uploaded Playable Ad file: ${adFile.name}.\n\nAdditional Context: ${description}`;
        }
    } else {
        if (!description) {
            alert("请填写玩法描述");
            return;
        }
    }

    setLoading(true);
    setResult(null);
    setMeta(null);
    setHtmlCode(null);
    try {
      const response = await generatePlayableConcept(gameName, finalPrompt, language, selectedModel);
      setResult(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error(error);
      alert("生成失败，请重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!result) return;
    setCodeLoading(true);
    try {
      const code = await generatePlayableCode(result, selectedModel);
      setHtmlCode(code);
    } catch (error) {
      console.error(error);
      alert("生成代码失败，请重试。");
    } finally {
      setCodeLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (!htmlCode) return;
    navigator.clipboard.writeText(htmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExport = () => {
    if (!result) return;
    exportToGoogleDocs(result, `Playable Ad Specs - ${gameName}`);
  };

  const handleDownloadHtml = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `playable_${gameName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Input Section */}
      <div className="w-1/3 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad className="w-5 h-5 text-indigo-400" />
            试玩广告仿制
          </h2>
          <p className="text-sm text-slate-400 mt-1">输入参考素材，AI 将为您生成试玩广告的设计文档与开发逻辑。</p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
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
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">参考来源</label>
            
            {/* Source Type Tabs */}
            <div className="flex bg-slate-900 p-1 rounded-lg mb-3">
                <button 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${inputType === 'desc' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setInputType('desc')}
                >
                    <AlignLeft className="w-3.5 h-3.5" /> 文本描述
                </button>
                <button 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${inputType === 'file' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setInputType('file')}
                >
                    <Upload className="w-3.5 h-3.5" /> 上传文件
                </button>
                <button 
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-medium transition-all ${inputType === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setInputType('url')}
                >
                    <LinkIcon className="w-3.5 h-3.5" /> URL 链接
                </button>
            </div>

            {inputType === 'desc' && (
                <textarea 
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="详细描述您想仿制的试玩广告内容，包括核心玩法、引导手势和结束页面..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
            )}

            {inputType === 'file' && (
                <div 
                    className="relative w-full aspect-[2/1] border-2 border-dashed border-slate-600 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {adFile ? (
                        <div className="flex flex-col items-center gap-2">
                            <FileText className="w-8 h-8 text-green-400" />
                            <p className="text-sm text-white font-medium truncate max-w-[200px]">{adFile.name}</p>
                            <p className="text-xs text-slate-500">{(adFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-indigo-400">
                            <Upload className="w-8 h-8" />
                            <p className="text-xs">点击上传 .html 或 .zip 试玩文件</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".html,.htm,.zip" 
                        onChange={handleFileChange} 
                    />
                </div>
            )}

            {inputType === 'url' && (
                <input 
                    type="text" 
                    value={adUrl}
                    onChange={(e) => setAdUrl(e.target.value)}
                    placeholder="https://example.com/playable-ad"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
            )}

            {(inputType === 'file' || inputType === 'url') && (
                <div className="mt-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">补充说明 (Optional)</label>
                    <textarea 
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="关于此文件/链接的额外修改需求或重点关注..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Globe className="w-3 h-3" /> 输出语言
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              >
                {modelOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/20">
             <h4 className="text-indigo-300 font-bold text-xs mb-2 flex items-center gap-1">
               <Search className="w-3 h-3" /> 生成内容包含
             </h4>
             <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
               <li><strong className="text-slate-300">Core Loop:</strong> 30秒核心体验流程。</li>
               <li><strong className="text-slate-300">User Flow:</strong> 引导 -> 试玩 -> 结束卡。</li>
               <li><strong className="text-slate-300">Interaction:</strong> 手势反馈与动效逻辑。</li>
               <li><strong className="text-slate-300">Tech Specs:</strong> 建议使用的资源与开发框架 (Phaser/Cocos)。</li>
             </ul>
          </div>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? '正在解析逻辑...' : '生成试玩设计文档'}
        </button>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-slate-800 rounded-xl p-8 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        {result ? (
          <>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">试玩广告设计方案 (PADD)</h2>
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
            
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
               <div className="prose prose-invert prose-indigo max-w-none mb-8">
                  <ReactMarkdown>{result}</ReactMarkdown>
                  <AiMetaDisplay metadata={meta} />
               </div>

               {/* Code Generation Section */}
               <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 mb-4">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Code className="w-5 h-5 text-indigo-400" />
                        HTML5 试玩代码生成 (Beta)
                     </h3>
                     {!htmlCode && (
                        <button 
                           onClick={handleGenerateCode}
                           disabled={codeLoading}
                           className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                           {codeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                           生成 HTML5 代码
                        </button>
                     )}
                  </div>

                  {codeLoading && (
                     <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                        <p className="text-sm">正在编写代码逻辑...</p>
                     </div>
                  )}

                  {htmlCode && (
                     <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex gap-2 mb-3">
                           <button 
                              onClick={() => setShowPreview(true)}
                              className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors"
                           >
                              <Play className="w-4 h-4" /> 运行试玩 (Preview)
                           </button>
                           <button 
                              onClick={handleDownloadHtml}
                              className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg flex items-center gap-2 transition-colors"
                              title="下载 HTML 文件"
                           >
                              <Download className="w-4 h-4" />
                           </button>
                           <button 
                              onClick={handleCopyCode}
                              className={`bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg flex items-center gap-2 transition-colors ${copiedCode ? 'bg-green-600' : ''}`}
                              title="复制完整代码"
                           >
                              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                           </button>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 border border-slate-700/50 max-h-40 overflow-hidden relative">
                           <pre className="text-xs text-slate-400 font-mono overflow-hidden">
                              {htmlCode}
                           </pre>
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"></div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
               <Gamepad className="w-10 h-10 text-slate-600" />
             </div>
             <p className="text-lg font-medium">试玩广告策划</p>
             <p className="text-sm max-w-xs text-center mt-2">AI 将帮助您将视频创意转化为可执行的试玩广告开发文档。</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && htmlCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-slate-900 w-[400px] h-[700px] rounded-2xl border-4 border-slate-700 shadow-2xl relative flex flex-col overflow-hidden">
              <div className="bg-slate-800 p-2 flex justify-between items-center border-b border-slate-700">
                 <span className="text-xs font-bold text-white px-2">Playable Preview</span>
                 <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <iframe 
                 srcDoc={htmlCode}
                 className="flex-1 w-full h-full bg-white"
                 title="Playable Ad Preview"
                 sandbox="allow-scripts allow-modals allow-popups"
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default PlayableReplication;

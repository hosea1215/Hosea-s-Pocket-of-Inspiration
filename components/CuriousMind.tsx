
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircleQuestion, Send, Trash2, Cpu, Globe, Languages, User, Bot, Loader2, StopCircle, Copy, Check, FileText, HelpCircle, ChevronDown, ChevronUp, ChevronRight, Sparkles, Briefcase } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { Chat } from "@google/genai";
import { exportToGoogleDocs } from '../utils/exportUtils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const CuriousMind: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '你好！我是你的好奇宝宝 (Curious Mind)。无论你想探讨游戏设计、市场趋势，还是寻找创意灵感，我都准备好了。咱们开始吧？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-preview');
  const [language, setLanguage] = useState('Chinese (中文)');
  const [selectedExpert, setSelectedExpert] = useState('General Assistant (全能助手)');
  const [selectedStyle, setSelectedStyle] = useState('Dominant CEO (霸道总裁)');
  const [translate, setTranslate] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [faqExpanded, setFaqExpanded] = useState(true);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const modelOptions = [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (深度思考)' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (快速响应)' },
  ];

  const languageOptions = [
    { value: 'Chinese (中文)', label: '中文 (Chinese)' },
    { value: 'English (英文)', label: '英文 (English)' },
    { value: 'Japanese (日语)', label: '日语 (Japanese)' },
    { value: 'Korean (韩语)', label: '韩语 (Korean)' },
  ];

  const expertOptions = [
    { value: 'General Assistant (全能助手)', label: '全能助手 (General Assistant)' },
    { value: 'ASO Expert (ASO 专家)', label: 'ASO 专家 (ASO Expert)' },
    { value: 'UA Manager (投放经理)', label: '投放经理 (UA Manager)' },
    { value: 'Game Designer (游戏策划)', label: '游戏策划 (Game Designer)' },
    { value: 'Creative Director (创意总监)', label: '创意总监 (Creative Director)' },
    { value: 'Data Analyst (数据分析师)', label: '数据分析师 (Data Analyst)' },
    { value: 'Market Researcher (市场调研)', label: '市场调研 (Market Researcher)' },
    { value: 'Technical Director (技术总监)', label: '技术总监 (Technical Director)' },
  ];

  const styleOptions = [
    { value: 'Dominant CEO (霸道总裁)', label: '霸道总裁 (Dominant CEO)' },
    { value: 'Professional (专业严谨)', label: '专业严谨 (Professional)' },
    { value: 'Humorous (幽默风趣)', label: '幽默风趣 (Humorous)' },
    { value: 'Concise (简洁明了)', label: '简洁明了 (Concise)' },
    { value: 'Empathetic (亲切共情)', label: '亲切共情 (Empathetic)' },
    { value: 'Creative (创意发散)', label: '创意发散 (Creative)' },
    { value: 'Socratic (苏格拉底)', label: '引导式提问 (Socratic)' },
  ];

  const defaultQuestions = [
    "了解下DSP渠道。",
    "了解下全球手机预装渠道。",
    "了解下归因SANs vs. MMP。",
    "了解下Web to App。",
    "了解下媒体增量测试 (Geo-Lift Tests / Geo-Experiment) 。",
    "了解下广告媒体渠道机器学习模型。",
    "了解下Google Analytics (GA) 和 Firebase的关系和用途。"
  ];

  // Initialize Chat Session
  useEffect(() => {
    initChat();
  }, [selectedModel]); // Re-init if model changes

  const initChat = () => {
    chatSessionRef.current = createChatSession(selectedModel, "You are a helpful, creative, and knowledgeable AI assistant for a mobile game marketing and development platform. Your persona is 'Curious Mind' (好奇宝宝). Be insightful, encouraging, and detailed.");
    setMessages([
        { role: 'model', text: '你好！我是你的好奇宝宝 (Curious Mind)。无论你想探讨游戏设计、市场趋势，还是寻找创意灵感，我都准备好了。咱们开始吧？' }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // Update UI with user message
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    try {
      // Construct prompt with language instructions if needed
      let effectivePrompt = userMsg;
      let styleInstruction = `Act as: ${selectedExpert}. Tone/Style: ${selectedStyle}.`;

      if (translate) {
          effectivePrompt = `${userMsg}\n\n[System Instruction: ${styleInstruction} Please provide the answer in ${language}. Then, provide a translation in Simplified Chinese below the answer, separated by a horizontal rule.]`;
      } else {
          effectivePrompt = `${userMsg}\n\n[System Instruction: ${styleInstruction} Please answer in ${language}.]`;
      }

      // Fix: sendMessageStream expects an object with message property
      const result = await chatSessionRef.current.sendMessageStream({ message: effectivePrompt });
      
      let fullResponse = "";
      
      // Add placeholder for AI response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      // Fix: Iterate over result directly and access .text property
      for await (const chunk of result) {
        const chunkText = chunk.text;
        if (chunkText) {
            fullResponse += chunkText;
            
            // Update the last message (AI's response) with accumulated text
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'model', text: fullResponse };
                return newMessages;
            });
        }
      }

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: '**Error:** 抱歉，我遇到了一些问题，请稍后重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportMessage = (text: string) => {
    exportToGoogleDocs(text, "Curious Mind Response");
  };

  const handleQuestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Settings Sidebar */}
      <div className="w-1/4 min-w-[280px] bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col shrink-0 h-full overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircleQuestion className="w-6 h-6 text-indigo-400" />
            好奇宝宝
          </h2>
          <p className="text-sm text-slate-400 mt-1">你的全能 AI 助手，随时待命。</p>
        </div>

        <div className="space-y-6 flex-1">
            
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> 推理模型
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

            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> 对话专家
                </label>
                <select 
                    value={selectedExpert}
                    onChange={(e) => setSelectedExpert(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                >
                    {expertOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 对话风格
                </label>
                <select 
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                >
                    {styleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                >
                    {languageOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-300">翻译为中文</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={translate} 
                        onChange={(e) => setTranslate(e.target.checked)} 
                        className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {/* Common Questions Module */}
            <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                <button 
                    onClick={() => setFaqExpanded(!faqExpanded)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-semibold text-slate-300">常见问题</span>
                    </div>
                    {faqExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                
                {faqExpanded && (
                    <div className="p-2 space-y-1">
                        {defaultQuestions.map((question, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuestionClick(question)}
                                className="w-full text-left p-2 rounded-md hover:bg-slate-800 transition-colors group flex items-center gap-2"
                            >
                                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                                <span className="text-xs text-slate-400 group-hover:text-slate-200 line-clamp-2">{question}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

        </div>

        <button 
            onClick={() => {
                if(confirm("确定要清空对话记录吗？")) initChat();
            }}
            className="mt-6 w-full bg-slate-700 hover:bg-red-500/80 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
        >
            <Trash2 className="w-4 h-4" /> 清空对话
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden relative">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                          {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                          msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                      }`}>
                          {msg.role === 'model' ? (
                              <>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                                {/* Model Message Action Bar */}
                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-700/50">
                                    <button 
                                        onClick={() => handleCopyMessage(msg.text, idx)}
                                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors py-1 px-2 rounded hover:bg-slate-700"
                                        title="复制内容"
                                    >
                                        {copiedIndex === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                        {copiedIndex === idx ? '已复制' : '复制'}
                                    </button>
                                    <button 
                                        onClick={() => handleExportMessage(msg.text)}
                                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-blue-400 transition-colors py-1 px-2 rounded hover:bg-slate-700"
                                        title="导出到 Google 文档"
                                    >
                                        <FileText className="w-3 h-3" />
                                        导出文档
                                    </button>
                                </div>
                              </>
                          ) : (
                              msg.text
                          )}
                      </div>
                  </div>
              ))}
              
              {loading && messages[messages.length - 1].role === 'user' && (
                  <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0 mt-1 animate-pulse">
                          <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          <span className="text-xs text-slate-400">正在思考...</span>
                      </div>
                  </div>
              )}
              
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800 border-t border-slate-700">
              <div className="relative">
                  <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="输入你的问题或想法... (Shift+Enter 换行)"
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl pl-4 pr-12 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none h-[60px] custom-scrollbar"
                  />
                  <button 
                      onClick={handleSend}
                      disabled={loading || !input.trim()}
                      className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {loading ? <StopCircle className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                  </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                  AI 生成内容可能包含错误，请核实重要信息。
              </p>
          </div>
      </div>
    </div>
  );
};

export default CuriousMind;

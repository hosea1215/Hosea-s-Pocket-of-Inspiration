
import React, { useState } from 'react';
import { Bot, Globe, ChevronDown, ChevronUp, BrainCircuit, ExternalLink, Terminal } from 'lucide-react';
import { AiMetadata } from '../types';

interface AiMetaDisplayProps {
  metadata: AiMetadata | null;
}

const AiMetaDisplay: React.FC<AiMetaDisplayProps> = ({ metadata }) => {
  const [expandedReasoning, setExpandedReasoning] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState(false);

  if (!metadata) return null;

  return (
    <div className="mt-6 border-t border-slate-700/50 pt-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Model Badge */}
        <div className="flex items-center gap-1.5 bg-indigo-900/30 text-indigo-300 text-[10px] font-mono px-2 py-1 rounded border border-indigo-500/20">
          <Bot className="w-3 h-3" />
          <span>{metadata.model}</span>
        </div>

        {/* Sources Badge */}
        {metadata.sources && metadata.sources.length > 0 && (
          <div className="flex items-center gap-1.5 bg-emerald-900/30 text-emerald-300 text-[10px] font-mono px-2 py-1 rounded border border-emerald-500/20">
            <Globe className="w-3 h-3" />
            <span>{metadata.sources.length} Referenced Sources</span>
          </div>
        )}

        {/* Thinking Toggle */}
        {metadata.reasoning && (
          <button 
            onClick={() => setExpandedReasoning(!expandedReasoning)}
            className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
              expandedReasoning 
                ? 'bg-yellow-900/30 text-yellow-300 border-yellow-500/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
            }`}
          >
            <BrainCircuit className="w-3 h-3" />
            <span>AI Thinking</span>
            {expandedReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {/* Prompt Toggle */}
        {metadata.prompt && (
          <button 
            onClick={() => setExpandedPrompt(!expandedPrompt)}
            className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
              expandedPrompt
                ? 'bg-blue-900/30 text-blue-300 border-blue-500/20' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Prompt (提示词)</span>
            {expandedPrompt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Reasoning Content */}
      {expandedReasoning && metadata.reasoning && (
        <div className="mb-4 bg-slate-900/50 rounded-lg p-3 border border-yellow-500/10">
          <h4 className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-wider mb-2 flex items-center gap-1">
            <BrainCircuit className="w-3 h-3" /> Analysis Logic
          </h4>
          <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed font-mono">
            {metadata.reasoning}
          </p>
        </div>
      )}

      {/* Prompt Content */}
      {expandedPrompt && metadata.prompt && (
        <div className="mb-4 bg-slate-900/50 rounded-lg p-3 border border-blue-500/10">
          <h4 className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Terminal className="w-3 h-3" /> Input Prompt
          </h4>
          <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed font-mono select-all">
            {metadata.prompt}
          </p>
        </div>
      )}

      {/* Sources List */}
      {metadata.sources && metadata.sources.length > 0 && (
        <div className="bg-slate-900/30 rounded-lg p-3 border border-slate-700/50">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Grounding Sources</h4>
          <ul className="space-y-1">
            {metadata.sources.map((source, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[10px] text-slate-600 mt-0.5">{idx + 1}.</span>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline truncate flex-1 flex items-center gap-1"
                >
                  {source.title || source.url}
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AiMetaDisplay;

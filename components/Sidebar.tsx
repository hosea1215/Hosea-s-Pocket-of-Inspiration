
import React from 'react';
import { FileText, Image as ImageIcon, Settings, Gamepad2, Shapes, Languages, Trophy, Headphones, Repeat, Calculator, ExternalLink } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.STRATEGY, label: 'FB广告策略生成器', icon: FileText },
    { id: AppView.CPE_GEN, label: 'CPE买量事件生成器', icon: Trophy },
    { id: AppView.CREATIVE, label: '创意实验室', icon: ImageIcon },
    { id: AppView.ICON_GEN, label: '谷歌商店ICON生成', icon: Shapes },
    { id: AppView.COPY_GEN, label: 'FACEBOOK文案生成', icon: Languages },
    { id: AppView.ASMR_RESEARCH, label: '游戏ASMR研究应用', icon: Headphones },
    { id: AppView.ABACR_LOOP, label: 'A-B-A-C-R 游戏循环结构', icon: Repeat },
    { id: AppView.LTV_CALCULATOR, label: '游戏LTV&回本估算器', icon: Calculator },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 flex-shrink-0">
          <Gamepad2 className="text-white w-6 h-6" />
        </div>
        <h1 className="font-bold text-lg text-white tracking-tight leading-tight">HOSEA的灵感口袋</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if ('href' in item && (item as any).href) {
            return (
              <a
                key={item.id}
                href={(item as any).href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <Icon className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300" />
                <span className="font-medium text-left flex-1">{item.label}</span>
                <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
              </a>
            );
          }

          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="font-medium text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">当前套餐</p>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300 font-semibold">专业版</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">活跃</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-3/4 rounded-full"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">已使用 75% 代币</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

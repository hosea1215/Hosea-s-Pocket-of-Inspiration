
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import StrategyGenerator from './components/StrategyGenerator';
import CreativeLab from './components/CreativeLab';
import IconGenerator from './components/IconGenerator';
import CopyGenerator from './components/CopyGenerator';
import CpeGenerator from './components/CpeGenerator';
import AsmrResearch from './components/AsmrResearch';
import AbacrLoop from './components/AbacrLoop';
import LtvCalculator from './components/LtvCalculator';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.STRATEGY);

  const renderContent = () => {
    switch (currentView) {
      case AppView.STRATEGY:
        return <StrategyGenerator />;
      case AppView.CPE_GEN:
        return <CpeGenerator />;
      case AppView.CREATIVE:
        return <CreativeLab />;
      case AppView.ICON_GEN:
        return <IconGenerator />;
      case AppView.COPY_GEN:
        return <CopyGenerator />;
      case AppView.ASMR_RESEARCH:
        return <AsmrResearch />;
      case AppView.ABACR_LOOP:
        return <AbacrLoop />;
      case AppView.LTV_CALCULATOR:
        return <LtvCalculator />;
      case AppView.SETTINGS:
        return <div className="text-white">设置 (占位符)</div>;
      default:
        return <StrategyGenerator />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case AppView.STRATEGY: return 'FB广告策略生成器';
      case AppView.CPE_GEN: return 'CPE买量事件生成器';
      case AppView.CREATIVE: return '创意实验室';
      case AppView.ICON_GEN: return '谷歌商店ICON生成';
      case AppView.COPY_GEN: return 'FACEBOOK文案生成';
      case AppView.ASMR_RESEARCH: return '游戏ASMR研究应用';
      case AppView.ABACR_LOOP: return 'A-B-A-C-R 游戏循环结构';
      case AppView.LTV_CALCULATOR: return '游戏LTV&回本估算器';
      case AppView.SETTINGS: return '设置';
      default: return 'FB广告策略生成器';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header Area (Optional for Breadcrumbs or User Profile) */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-8 shrink-0">
           <h2 className="text-white font-medium capitalize tracking-wide text-lg">
             {getHeaderTitle()}
           </h2>
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10"></div>
           </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto h-full">
             {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

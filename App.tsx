
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import StrategyGenerator from './components/StrategyGenerator';
import CreativeLab from './components/CreativeLab';
import IconGenerator from './components/IconGenerator';
import CopyGenerator from './components/CopyGenerator';
import CpeGenerator from './components/CpeGenerator';
import AsmrResearch from './components/AsmrResearch';
import AbacrLoop from './components/AbacrLoop';
import HookedAnalysis from './components/HookedAnalysis';
import MdaFramework from './components/MdaFramework';
import OctalysisModel from './components/OctalysisModel';
import FoggBehaviorModel from './components/FoggBehaviorModel';
import FlowTheory from './components/FlowTheory';
import FourElementsModel from './components/FourElementsModel';
import SkinnerBoxModel from './components/SkinnerBoxModel';
import DopamineLoop from './components/DopamineLoop';
import BartleModel from './components/BartleModel';
import NarrativeDesign from './components/NarrativeDesign';
import LtvCalculator from './components/LtvCalculator';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import StoreComparison from './components/StoreComparison';
import PushStrategy from './components/PushStrategy';
import LiveOpsGenerator from './components/LiveOpsGenerator';
import AsoKeywords from './components/AsoKeywords';
import IaaMonetization from './components/IaaMonetization';
import IapMonetization from './components/IapMonetization';
import GooglePlayNews from './components/GooglePlayNews';
import AppStoreNews from './components/AppStoreNews';
import AdTechNews from './components/AdTechNews';
import { AppView } from './types';
import { Search, Megaphone, Zap, BarChart2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.STRATEGY);

  const renderContent = () => {
    switch (currentView) {
      case AppView.STRATEGY:
        return <StrategyGenerator />;
      case AppView.ASO_KEYWORDS:
        return <AsoKeywords />;
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
      case AppView.HOOKED_MODEL:
        return <HookedAnalysis />;
      case AppView.MDA_FRAMEWORK:
        return <MdaFramework />;
      case AppView.OCTALYSIS_MODEL:
        return <OctalysisModel />;
      case AppView.FOGG_BEHAVIOR_MODEL:
        return <FoggBehaviorModel />;
      case AppView.FLOW_THEORY:
        return <FlowTheory />;
      case AppView.FOUR_ELEMENTS_MODEL:
        return <FourElementsModel />;
      case AppView.SKINNER_BOX_MODEL:
        return <SkinnerBoxModel />;
      case AppView.DOPAMINE_LOOP_MODEL:
        return <DopamineLoop />;
      case AppView.BARTLE_TAXONOMY_MODEL:
        return <BartleModel />;
      case AppView.NARRATIVE_DESIGN:
        return <NarrativeDesign />;
      case AppView.LTV_CALCULATOR:
        return <LtvCalculator />;
      case AppView.COMPETITOR_ANALYSIS:
        return <CompetitorAnalysis />;
      case AppView.STORE_COMPARISON:
        return <StoreComparison />;
      case AppView.PUSH_STRATEGY:
        return <PushStrategy />;
      case AppView.LIVEOPS_GEN:
        return <LiveOpsGenerator />;
      case AppView.IAA_MONETIZATION:
        return <IaaMonetization />;
      case AppView.IAP_MONETIZATION:
        return <IapMonetization />;
      case AppView.GOOGLE_PLAY_NEWS:
        return <GooglePlayNews />;
      case AppView.APPSTORE_NEWS:
        return <AppStoreNews />;
      case AppView.GOOGLE_ADS_NEWS:
        return <AdTechNews platform="Google Ads" icon={Search} />;
      case AppView.FACEBOOK_ADS_NEWS:
        return <AdTechNews platform="Facebook Ads" icon={Megaphone} />;
      case AppView.APPLOVIN_NEWS:
        return <AdTechNews platform="AppLovin" icon={Zap} />;
      case AppView.APPSFLYER_NEWS:
        return <AdTechNews platform="AppsFlyer" icon={BarChart2} />;
      case AppView.SETTINGS:
        return <div className="text-white">设置 (占位符)</div>;
      default:
        return <StrategyGenerator />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case AppView.STRATEGY: return 'FB广告策略生成器';
      case AppView.ASO_KEYWORDS: return 'ASO 关键词分析';
      case AppView.CPE_GEN: return '买量事件生成器';
      case AppView.CREATIVE: return 'FACEBOOK图文广告创意';
      case AppView.ICON_GEN: return '谷歌商店ICON生成';
      case AppView.COPY_GEN: return 'FACEBOOK广告文案';
      case AppView.ASMR_RESEARCH: return '游戏ASMR研究应用';
      case AppView.ABACR_LOOP: return 'A-B-A-C-R 游戏循环结构';
      case AppView.HOOKED_MODEL: return 'HOOKED上瘾模型分析';
      case AppView.MDA_FRAMEWORK: return 'MDA 框架分析';
      case AppView.OCTALYSIS_MODEL: return '八角行为模型 (Octalysis)';
      case AppView.FOGG_BEHAVIOR_MODEL: return 'Fogg 行为模型 (FBM)';
      case AppView.FLOW_THEORY: return '心流理论 (Flow)';
      case AppView.FOUR_ELEMENTS_MODEL: return '四要素模型 (4 Elements)';
      case AppView.SKINNER_BOX_MODEL: return '斯金纳箱理论 (Skinner Box)';
      case AppView.DOPAMINE_LOOP_MODEL: return '多巴胺循环 (Dopamine Loop)';
      case AppView.BARTLE_TAXONOMY_MODEL: return 'Bartle 玩家类型理论';
      case AppView.NARRATIVE_DESIGN: return '叙事设计理论 (Narrative)';
      case AppView.LTV_CALCULATOR: return '游戏LTV&回本估算器';
      case AppView.COMPETITOR_ANALYSIS: return '竞品数据与玩法拆解';
      case AppView.STORE_COMPARISON: return '游戏商店详情页对比';
      case AppView.PUSH_STRATEGY: return '游戏通知PUSH策略';
      case AppView.LIVEOPS_GEN: return 'GooglePlay LiveOps物料';
      case AppView.IAA_MONETIZATION: return 'IAA游戏商业化方案';
      case AppView.IAP_MONETIZATION: return 'IAP游戏商业化方案';
      case AppView.GOOGLE_PLAY_NEWS: return 'GOOGLE PLAY最新资讯';
      case AppView.APPSTORE_NEWS: return 'APPSTORE最新资讯';
      case AppView.GOOGLE_ADS_NEWS: return 'GOOGLE ADS最新资讯';
      case AppView.FACEBOOK_ADS_NEWS: return 'FACEBOOK ADS最新资讯';
      case AppView.APPLOVIN_NEWS: return 'APPLOVIN最新资讯';
      case AppView.APPSFLYER_NEWS: return 'APPSFLYER最新资讯';
      case AppView.SETTINGS: return '设置';
      default: return 'FB广告策略生成器';
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header Area (Optional for Breadcrumbs or User Profile) */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-8 shrink-0 relative">
           <div className="absolute left-8">
              {/* Optional Back Button or Logo could go here */}
           </div>
           <h2 className="text-white font-medium capitalize tracking-wide text-lg">
             {getHeaderTitle()}
           </h2>
           <div className="absolute right-8 flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 shadow-lg"></div>
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

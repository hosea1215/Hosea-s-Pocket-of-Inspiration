
import React, { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, Settings, Gamepad2, Shapes, Languages, Trophy, Headphones, Repeat, Calculator, ExternalLink, ChevronLeft, ChevronRight, Swords, ArrowRightLeft, Bell, Calendar, AlertCircle, X, Activity, MapPin, Monitor, Magnet, Search, Briefcase, ChevronDown, PenTool, Brain, Layers, Octagon, MousePointerClick, Waves, Dices, FlaskConical, Zap, Users, BookOpen, Book, TrendingUp, Coins, MonitorPlay, Gem, Newspaper, Store, BarChart2, Megaphone, Smartphone, Music, Gavel, Tags, Bot, Globe, RefreshCcw, Split, Clapperboard, Gamepad, Map, CandlestickChart, ClipboardCheck, Apple, Braces, MessageCircleQuestion, QrCode, Mail } from 'lucide-react';
import { AppView } from '../types';
import { researchExplanations } from '../constants';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

// Mock Data for Access Log
const accessLogData = [
  { id: 1, user: 'Admin_Hosea', ip: '192.168.1.xxx', location: 'Shenzhen, CN', time: 'Just now', device: 'Desktop', status: 'online' },
  { id: 2, user: 'Media_Buyer_HK', ip: '203.14.88.xxx', location: 'Hong Kong, HK', time: '14 mins ago', device: 'MacBook Pro', status: 'offline' },
  { id: 3, user: 'Creative_Lead_US', ip: '45.33.21.xxx', location: 'Los Angeles, US', time: '2 hours ago', device: 'Desktop', status: 'offline' },
  { id: 4, user: 'Analyst_SG', ip: '172.16.55.xxx', location: 'Singapore, SG', time: '5 hours ago', device: 'Tablet', status: 'offline' },
  { id: 5, user: 'Guest_User_09', ip: '104.21.99.xxx', location: 'Tokyo, JP', time: '18 hours ago', device: 'Mobile', status: 'offline' },
  { id: 6, user: 'Dev_Team_01', ip: '89.201.33.xxx', location: 'London, UK', time: '1 day ago', device: 'Desktop', status: 'offline' },
  { id: 7, user: 'Marketing_VP', ip: '101.32.11.xxx', location: 'Shanghai, CN', time: '2 days ago', device: 'MacBook Air', status: 'offline' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [showAccessLog, setShowAccessLog] = useState(false);
  const [showContactQr, setShowContactQr] = useState(false);
  const [growthExpanded, setGrowthExpanded] = useState(false);
  const [monetizationExpanded, setMonetizationExpanded] = useState(false);
  const [newsExpanded, setNewsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [creativeExpanded, setCreativeExpanded] = useState(false);
  const [experienceExpanded, setExperienceExpanded] = useState(true); 
  const [qualityExpanded, setQualityExpanded] = useState(true);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  // Items to be shown in the main list
  const mainNavItems = [
    { id: AppView.LTV_CALCULATOR, label: '游戏LTV&回本估算器', icon: Calculator },
    { id: AppView.GAME_K_LINE, label: '游戏买量K线图', icon: CandlestickChart },
    { id: AppView.COMPETITOR_ANALYSIS, label: '竞品数据与玩法拆解', icon: Swords },
    { id: AppView.PERSONALIZATION_AB, label: '个性化与AB测试', icon: Split },
  ];

  // Quality Assurance Items
  const qualityNavItems = [
    { id: AppView.GAME_QUALITY_CHECKLIST, label: '游戏质量自查表', icon: ClipboardCheck },
    { id: AppView.GOOGLE_PLAY_CHECKLIST, label: 'Google Play 上线自查表', icon: Store },
    { id: AppView.APPSTORE_CHECKLIST, label: 'App Store 上线自查表', icon: Apple },
  ];

  // Items to be grouped under "Product Monetization" (Moved Above Growth)
  const monetizationNavItems = [
    { id: AppView.IAA_MONETIZATION, label: 'IAA游戏商业化方案', icon: MonitorPlay },
    { id: AppView.IAA_BIDDING, label: '广告变现竞价设计', icon: Gavel },
    { id: AppView.IAP_MONETIZATION, label: 'IAP游戏商业化方案', icon: Gem },
    { id: AppView.IAP_PRICING, label: '内购计费组合设计', icon: Tags },
  ];

  // Items to be grouped under "User Acquisition Growth"
  const growthNavItems = [
    { id: AppView.OMNICHANNEL_STRATEGY, label: '全渠道发行策略', icon: Globe },
    { id: AppView.STRATEGY, label: 'FACEBOOK广告策略', icon: FileText },
    { id: AppView.GOOGLE_ADS_STRATEGY, label: 'GOOGLE ADS广告策略', icon: Search },
    { id: AppView.TIKTOK_ADS_STRATEGY, label: 'TIKTOK ADS广告策略', icon: Music },
    { id: AppView.APPLE_ADS_STRATEGY, label: 'APPLE ADS广告策略', icon: Smartphone },
    { id: AppView.APPLOVIN_STRATEGY, label: 'APPLOVIN广告策略', icon: Zap },
    { id: AppView.PRE_INSTALL_STRATEGY, label: '预装渠道广告策略', icon: Smartphone },
    { id: AppView.CPE_GEN, label: '买量事件生成器', icon: Trophy },
    { id: AppView.WEB2APP_STRATEGY, label: 'WEB2APP策略', icon: Monitor },
    { id: AppView.GEO_LIFT_STRATEGY, label: 'Geo-Lift 实验策略', icon: Map },
    { id: AppView.MARKETING_CALENDAR, label: '主要国家营销日历', icon: Calendar },
  ];

  // Items to be grouped under "Latest News Brief"
  const newsNavItems = [
    { id: AppView.AI_NEWS, label: '获得 AI 新闻', icon: Bot },
    { id: AppView.GOOGLE_PLAY_NEWS, label: 'GOOGLE PLAY最新资讯', icon: Store },
    { id: AppView.APPSTORE_NEWS, label: 'APPSTORE最新资讯', icon: ExternalLink },
    { id: AppView.APPLE_SEARCH_ADS_NEWS, label: 'APPLE SEARCH ADS最新资讯', icon: Search },
    { id: AppView.GOOGLE_ADS_NEWS, label: 'GOOGLE ADS最新资讯', icon: Search },
    { id: AppView.FACEBOOK_ADS_NEWS, label: 'FACEBOOK ADS最新资讯', icon: Megaphone },
    { id: AppView.ADMOB_NEWS, label: 'ADMOB最新资讯', icon: Smartphone },
    { id: AppView.TIKTOK_ADS_NEWS, label: 'TIKTOK ADS最新资讯', icon: Music },
    { id: AppView.APPLOVIN_NEWS, label: 'APPLOVIN最新资讯', icon: Zap },
    { id: AppView.APPSFLYER_NEWS, label: 'APPSFLYER最新资讯', icon: BarChart2 },
  ];

  // Items to be grouped under "Creative & Copy"
  const creativeNavItems = [
    { id: AppView.IMAGE_REPLICATION, label: '图片素材仿制', icon: RefreshCcw },
    { id: AppView.IMAGE_COMPOSITION, label: '图片素材合成', icon: Layers },
    { id: AppView.VIDEO_ANALYZER, label: '视频拉片拆解', icon: Clapperboard },
    { id: AppView.PLAYABLE_REPLICATION, label: '试玩广告仿制', icon: Gamepad },
    { id: AppView.CREATIVE, label: 'FACEBOOK图文广告创意', icon: ImageIcon },
    { id: AppView.COPY_GEN, label: 'FACEBOOK广告文案', icon: Languages },
    { id: AppView.LIVEOPS_GEN, label: 'GooglePlay LiveOps物料', icon: Calendar },
    { id: AppView.PUSH_STRATEGY, label: '游戏通知 PUSH 策略', icon: Bell },
  ];

  // Items to be grouped under "Game Experience Research"
  const experienceNavItems = [
    { id: AppView.HOOKED_MODEL, label: 'HOOKED上瘾模型分析', icon: Magnet },
    { id: AppView.ASMR_RESEARCH, label: '游戏ASMR研究应用', icon: Headphones },
    { id: AppView.ABACR_LOOP, label: 'A-B-A-C-R 游戏循环结构', icon: Repeat },
    { id: AppView.FLOW_THEORY, label: '心流理论 (Flow)', icon: Waves },
    { id: AppView.DOPAMINE_LOOP_MODEL, label: '多巴胺循环 (Dopamine Loop)', icon: Zap },
    { id: AppView.NARRATIVE_DESIGN, label: '叙事设计理论 (Narrative)', icon: BookOpen },
    { id: AppView.BARTLE_TAXONOMY_MODEL, label: 'Bartle 玩家类型理论', icon: Users },
    { id: AppView.SKINNER_BOX_MODEL, label: '斯金纳箱理论 (Skinner Box)', icon: FlaskConical },
    { id: AppView.MDA_FRAMEWORK, label: 'MDA 框架分析', icon: Layers },
    { id: AppView.OCTALYSIS_MODEL, label: '八角行为模型 (Octalysis)', icon: Octagon },
    { id: AppView.FOGG_BEHAVIOR_MODEL, label: 'Fogg 行为模型 (FBM)', icon: MousePointerClick },
    { id: AppView.FOUR_ELEMENTS_MODEL, label: '四要素模型 (4 Elements)', icon: Dices },
  ];

  // Items to be grouped under "Other Tools"
  const toolNavItems = [
    { id: AppView.CURIOUS_MIND, label: '好奇宝宝 (Curious Mind)', icon: MessageCircleQuestion },
    { id: AppView.STORE_COMPARISON, label: '游戏商店详情页对比', icon: ArrowRightLeft },
    { id: AppView.ASO_KEYWORDS, label: 'ASO 关键词分析', icon: Search },
    { id: AppView.ICON_GEN, label: '谷歌商店ICON生成', icon: Shapes },
    { id: AppView.JSON_ANALYZER, label: 'JSON 分析', icon: Braces },
  ];

  // Auto-expand groups if current view is inside them
  useEffect(() => {
    const isGrowthView = growthNavItems.some(item => item.id === currentView);
    if (isGrowthView) {
      setGrowthExpanded(true);
    }
    const isMonetizationView = monetizationNavItems.some(item => item.id === currentView);
    if (isMonetizationView) {
      setMonetizationExpanded(true);
    }
    const isNewsView = newsNavItems.some(item => item.id === currentView);
    if (isNewsView) {
      setNewsExpanded(true);
    }
    const isToolView = toolNavItems.some(item => item.id === currentView);
    if (isToolView) {
      setToolsExpanded(true);
    }
    const isCreativeView = creativeNavItems.some(item => item.id === currentView);
    if (isCreativeView) {
      setCreativeExpanded(true);
    }
    const isExperienceView = experienceNavItems.some(item => item.id === currentView);
    if (isExperienceView) {
      setExperienceExpanded(true);
    }
    const isQualityView = qualityNavItems.some(item => item.id === currentView);
    if (isQualityView) {
      setQualityExpanded(true);
    }
  }, [currentView]);

  const handleGrowthClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setGrowthExpanded(true);
    } else {
      setGrowthExpanded(!growthExpanded);
    }
  };

  const handleMonetizationClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setMonetizationExpanded(true);
    } else {
      setMonetizationExpanded(!monetizationExpanded);
    }
  };

  const handleNewsClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setNewsExpanded(true);
    } else {
      setNewsExpanded(!newsExpanded);
    }
  };

  const handleToolsClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setToolsExpanded(true);
    } else {
      setToolsExpanded(!toolsExpanded);
    }
  };

  const handleCreativeClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setCreativeExpanded(true);
    } else {
      setCreativeExpanded(!creativeExpanded);
    }
  };

  const handleExperienceClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setExperienceExpanded(true);
    } else {
      setExperienceExpanded(!experienceExpanded);
    }
  };

  const handleQualityClick = () => {
    if (collapsed) {
      setCollapsed(false);
      setQualityExpanded(true);
    } else {
      setQualityExpanded(!qualityExpanded);
    }
  };

  const renderNavItem = (item: any, isChild: boolean = false, showInfoIcon: boolean = false) => {
    const Icon = item.icon;
    const isActive = currentView === item.id;
    
    // Style adjustments for child items
    const paddingLeft = isChild && !collapsed ? 'pl-11 pr-4' : collapsed ? 'px-0 justify-center' : 'px-4 gap-3';
    const textSize = isChild ? 'text-xs' : 'text-sm';
    
    return (
      <button
        key={item.id}
        onClick={() => setView(item.id as AppView)}
        title={collapsed ? item.label : ''}
        className={`w-full flex items-center ${paddingLeft} py-3 rounded-lg transition-all duration-200 group relative ${
          isActive 
            ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        {!collapsed && (
          <span className={`font-medium text-left whitespace-nowrap overflow-hidden ${textSize} animate-in fade-in duration-300`}>{item.label}</span>
        )}
        
        {/* Book Icon for Research Items */}
        {showInfoIcon && !collapsed && (
          <div 
            className="ml-auto p-1.5 text-slate-600 hover:text-indigo-400 hover:bg-slate-700/50 rounded transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setShowExplanation(item.id);
            }}
            title="查看理论详解"
          >
            <Book className="w-3.5 h-3.5" />
          </div>
        )}

        {collapsed && isActive && (
           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-l-full"></div>
        )}
      </button>
    );
  };

  return (
    <>
      <div className={`relative bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-9 z-10 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Header */}
        <div className={`p-6 flex items-center border-b border-slate-800 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <Gamepad2 className="text-white w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1 overflow-hidden">
               <h1 className="font-bold text-lg text-white tracking-tight leading-tight whitespace-nowrap">
                HOSEA的<br/>灵感口袋
              </h1>
              <button 
                onClick={() => setShowAccessLog(true)}
                className="text-slate-500 hover:text-yellow-400 transition-colors ml-1 p-1 rounded-full hover:bg-slate-800"
                title="查看访问日志"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {/* Main Items */}
          {mainNavItems.map(item => renderNavItem(item))}

          {/* Quality Group Separator/Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/50">
            <button
              onClick={handleQualityClick}
              title={collapsed ? "产品质量验收" : ""}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200`}
            >
              <ClipboardCheck className={`w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 ${qualityExpanded && !collapsed ? 'text-indigo-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-left flex-1 whitespace-nowrap text-sm">产品质量验收</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${qualityExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Quality Collapsible Content */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${qualityExpanded || (collapsed && false) ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {qualityNavItems.map(item => renderNavItem(item, true))}
            </div>
          </div>

          {/* Experience Group Separator/Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/50">
            <button
              onClick={handleExperienceClick}
              title={collapsed ? "游戏体验研究" : ""}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200`}
            >
              <Brain className={`w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 ${experienceExpanded && !collapsed ? 'text-indigo-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-left flex-1 whitespace-nowrap text-sm">游戏体验研究</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${experienceExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Experience Collapsible Content */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${experienceExpanded || (collapsed && false) ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {experienceNavItems.map(item => renderNavItem(item, true, true))}
            </div>
          </div>

          {/* Monetization Group Separator/Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/50">
            <button
              onClick={handleMonetizationClick}
              title={collapsed ? "产品商业化" : ""}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200`}
            >
              <Coins className={`w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 ${monetizationExpanded && !collapsed ? 'text-indigo-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-left flex-1 whitespace-nowrap text-sm">产品商业化</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${monetizationExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Monetization Collapsible Content */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${monetizationExpanded || (collapsed && false) ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {monetizationNavItems.map(item => renderNavItem(item, true))}
            </div>
          </div>

          {/* Growth Group Separator/Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/50">
            <button
              onClick={handleGrowthClick}
              title={collapsed ? "获客增长" : ""}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200`}
            >
              <TrendingUp className={`w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 ${growthExpanded && !collapsed ? 'text-indigo-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-left flex-1 whitespace-nowrap text-sm">获客增长</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${growthExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Growth Collapsible Content */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${growthExpanded || (collapsed && false) ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {growthNavItems.map(item => renderNavItem(item, true))}
            </div>
          </div>

          {/* Creative Group Separator/Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/50">
            <button
              onClick={handleCreativeClick}
              title={collapsed ? "素材与文案生成" : ""}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200`}
            >
              <PenTool className={`w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 ${creativeExpanded && !collapsed ? 'text-indigo-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-left flex-1 whitespace-nowrap text-sm">素材与文案生成</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${creativeExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Creative Collapsible Content */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${creativeExpanded || (collapsed && false) ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {creativeNavItems.map(item => renderNavItem(item, true))}
            </div>
          </div>

          {/* News Group Separator/Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/50">
            <button
              onClick={handleNewsClick}
              title={collapsed ? "最新资讯简报" : ""}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200`}
            >
              <Newspaper className={`w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 ${newsExpanded && !collapsed ? 'text-indigo-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-left flex-1 whitespace-nowrap text-sm">最新资讯简报</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${newsExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* News Collapsible Content */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${newsExpanded || (collapsed && false) ? 'max-h-[1600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {newsNavItems.map(item => renderNavItem(item, true))}
            </div>
          </div>

          {/* Tools Group Separator/Toggle */}
          <div className="pt-2 mt-2 border-t border-slate-800/50">
            <button
              onClick={handleToolsClick}
              title={collapsed ? "其它小工具" : ""}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-lg transition-all duration-200 group text-slate-400 hover:bg-slate-800 hover:text-slate-200`}
            >
              <Briefcase className={`w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300 ${toolsExpanded && !collapsed ? 'text-indigo-400' : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium text-left flex-1 whitespace-nowrap text-sm">其它小工具</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsExpanded ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* Tools Collapsible Content */}
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${toolsExpanded || (collapsed && false) ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {toolNavItems.map(item => renderNavItem(item, true))}
            </div>
          </div>
        </nav>

        {/* Footer / Plan Info */}
        <div className="p-4 border-t border-slate-800">
          {!collapsed ? (
            <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 opacity-100">
              <p className="text-xs text-slate-500 font-medium mb-1">Hosea</p>
              <div className="flex justify-between items-center mb-2">
                <button 
                    onClick={() => setShowContactQr(true)}
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                >
                    联系我
                    <QrCode className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">尽信书，则不如无书。</p>
              <p className="text-xs text-slate-500 mt-1">大胆的假设，小心的求证。</p>
            </div>
          ) : (
            <div className="flex justify-center py-2">
               <button onClick={() => setShowContactQr(true)} className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" title="联系我"></button>
            </div>
          )}
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowExplanation(null)}>
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                {researchExplanations[showExplanation]?.title || "理论详解"}
              </h3>
              <button onClick={() => setShowExplanation(null)} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[70vh] overflow-y-auto custom-scrollbar">
              {researchExplanations[showExplanation]?.content || "暂无详解内容。"}
            </div>
          </div>
        </div>
      )}

      {/* Access Log Modal */}
      {showAccessLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-[600px] max-w-[90vw] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/10 p-2 rounded-lg">
                   <Activity className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">访问日志 (最近72小时)</h3>
                   <p className="text-xs text-slate-400">实时监控系统访问记录</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAccessLog(false)}
                className="text-slate-500 hover:text-white transition-colors hover:bg-slate-800 p-2 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                 <thead className="bg-slate-950/50 sticky top-0 z-10 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                    <tr>
                       <th className="px-6 py-3 border-b border-slate-800">用户 / IP</th>
                       <th className="px-6 py-3 border-b border-slate-800">位置</th>
                       <th className="px-6 py-3 border-b border-slate-800">设备</th>
                       <th className="px-6 py-3 border-b border-slate-800 text-right">时间</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800/50">
                    {accessLogData.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${log.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`}></div>
                              <div>
                                 <p className="font-medium text-slate-200">{log.user}</p>
                                 <p className="text-xs text-slate-500 font-mono">{log.ip}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-slate-400">
                             <MapPin className="w-3.5 h-3.5" />
                             <span>{log.location}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-slate-400">
                             <Monitor className="w-3.5 h-3.5" />
                             <span>{log.device}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">
                           {log.time}
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-600">系统日志自动记录所有访问行为 • IP地址已脱敏处理</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Contact Modal */}
      {showContactQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowContactQr(false)}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowContactQr(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center gap-5 py-4">
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2 mb-1">
                            <MessageCircleQuestion className="w-6 h-6 text-[#07c160]" />
                            联系 Hosea
                        </h3>
                        <p className="text-sm text-slate-500">有更多的建议欢迎联系我</p>
                    </div>
                    
                    <div className="p-3 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 flex justify-center items-center">
                        {/* Avatar Image Placeholder */}
                        <img 
                            src="https://lh3.googleusercontent.com/a/ACg8ocJ3OJzhXjV_eg-UyrIXcTpMjzrQwoF4fLJyVv2KCMdBK8QQA_x6=s120-c" 
                            alt="Hosea Avatar" 
                            className="w-40 h-40 object-cover rounded-full" 
                        />
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-sm font-semibold text-slate-700">欢迎添加好友交流</p>
                        <p className="text-xs text-slate-400">添加好友请备注 "灵感口袋"</p>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-1 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">微信号 (WeChat)</p>
                            <p className="text-slate-800 font-mono font-bold text-lg select-all">hosea0563</p>
                        </div>
                        
                        <div className="bg-slate-50 p-3 rounded-lg flex flex-col gap-1 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email</p>
                            <p className="text-slate-800 font-mono font-medium select-all break-all">hehanqing@ivymobile.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

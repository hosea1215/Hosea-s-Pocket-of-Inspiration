
import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  question: string;
}

interface ChecklistSection {
  title: string;
  description: string;
  items: ChecklistItem[];
}

type Status = 'pass' | 'warning' | 'fatal' | null;

const checklistData: ChecklistSection[] = [
  {
    title: "第一部分：基础体质与技术指标 (Tech & Stability)",
    description: "这是游戏的“骨架”，如果这里不及格，发行商通常会直接Pass，不论玩法多好。",
    items: [
      { id: 'tech_1', label: '最低配置运行', question: '游戏能否在3年前的主流中低端设备（如 iPhone 11, 4G运存安卓, GTX 1060 PC）上维持 30 FPS？' },
      { id: 'tech_2', label: '崩溃率 (Crash)', question: '在连续运行 1 小时的情况下，崩溃/闪退率是否低于 1%？' },
      { id: 'tech_3', label: 'ANR (无响应)', question: '(手游) 游戏的 ANR 指标是否低于 Google Play 的红线 (0.47%)？' },
      { id: 'tech_4', label: '发热与功耗', question: '(手游) 连续游玩 15 分钟，设备温度是否“烫手”？是否导致系统强制降亮度或掉帧？' },
      { id: 'tech_5', label: '弱网/断线', question: '在 WiFi 切换 4G/5G，或电梯弱网环境下，游戏是否能自动重连而不是直接踢回登录界面？' },
      { id: 'tech_6', label: '包体大小', question: '首包是否控制在合理范围？(手游 <200MB 最佳)，是否有分包下载机制？' },
      { id: 'tech_7', label: 'Loading 体验', question: '场景加载时间是否过长？加载时是否有 Lore 介绍、小贴士或进度条反馈？' },
    ]
  },
  {
    title: "第二部分：首次用户体验 (FTUE & Onboarding)",
    description: "这是决定留存率的“黄金5分钟”。",
    items: [
      { id: 'ftue_1', label: 'Time to Fun', question: '从点击游戏图标到体验到核心玩法乐趣（第一场爽快战斗/解谜），是否控制在 5分钟 以内？' },
      { id: 'ftue_2', label: '资源下载留存', question: '(手游) 首次进入下载大数据包时，是否有小游戏、漫画或世界观视频来留住玩家？' },
      { id: 'ftue_3', label: '教程非强制性', question: '是否允许老玩家跳过教程剧情？是否允许跳过强制的手指引导步骤？' },
      { id: 'ftue_4', label: '教程有效性', question: '找一个没玩过的人测试，不看文字说明，他能否通过“玩”学会核心机制？' },
      { id: 'ftue_5', label: '权限索取', question: '是否在启动时就弹窗索要通知、相册等权限？(建议推迟到必须时再弹)' },
      { id: 'ftue_6', label: '注册门槛', question: '是否支持“游客登录” (Guest Mode)？是否强迫先注册才能玩？(强迫注册=高流失)' },
    ]
  },
  {
    title: "第三部分：核心玩法与手感 (Core Gameplay & UX)",
    description: "这是决定游戏上限的“灵魂”。",
    items: [
      { id: 'gameplay_1', label: '输入延迟', question: '按下按钮到角色动作，是否有肉眼可见的延迟？(动作游戏大忌)' },
      { id: 'gameplay_2', label: '反馈感 (Juice)', question: '攻击命中/得分时，是否有**视觉(特效)、听觉(音效)、触觉(震动)**的三重反馈？' },
      { id: 'gameplay_3', label: 'UI 易读性', question: '在手机小屏幕或 Switch 掌机模式下，字体字号是否依然清晰可读？' },
      { id: 'gameplay_4', label: '交互区域', question: '按钮是否过小导致误触？是否避开了刘海屏、灵动岛和底部 Home 条？' },
      { id: 'gameplay_5', label: '防误操作', question: '销毁稀有道具、购买高价物品时，是否有“二次确认”或“长按确认”？' },
      { id: 'gameplay_6', label: '难度曲线', question: '是否存在某关卡导致测试人员集体卡关（流失点）？失败后的重试成本（Retry）是否过高？' },
    ]
  },
  {
    title: "第四部分：商业化与数值 (Monetization & Economy)",
    description: "如果是免费游戏（F2P），这里决定了游戏的“造血能力”。",
    items: [
      { id: 'monet_1', label: '付费干扰度', question: '弹出礼包/广告的时机是否打断了玩家的心流（如战斗中弹出）？' },
      { id: 'monet_2', label: '非R体验', question: '不花钱的玩家能否玩到游戏后期？是否存在绝对的 Paywall (不充钱无法通关)？' },
      { id: 'monet_3', label: '商城逻辑', question: '商品价格是否本地化清晰？是否有明显的“恢复购买”按钮？' },
      { id: 'monet_4', label: '广告兜底', question: '(广告变现游戏) 当广告加载失败时，是否有提示或补偿，而不是让程序卡死？' },
      { id: 'monet_5', label: '防刷机制', question: '是否有基础的反作弊机制？是否有严重的资源产出漏洞（如无限刷金币）？' },
    ]
  },
  {
    title: "第五部分：全球化与合规 (Globalization & Compliance)",
    description: "决定游戏能否“出海”以及“活得久”。",
    items: [
      { id: 'global_1', label: '账号删除', question: '(iOS强制) 游戏内是否有明显、可用的“删除账号/注销”功能？' },
      { id: 'global_2', label: '隐私合规', question: '是否有 GDPR/CCPA 弹窗？是否在未获得用户同意前就开始收集数据？' },
      { id: 'global_3', label: '语言适配', question: '德语/俄语等长文本语言下，UI是否爆框？日语/中文是否出现缺字（口口口）？' },
      { id: 'global_4', label: '文化敏感', question: '检查是否有特定宗教禁忌、过分暴露（中东/东亚审查）、血腥暴力（CERO/ESRB分级）？' },
      { id: 'global_5', label: '时间格式', question: '活动倒计时是否适配了不同时区？还是只显示了服务器时间？' },
    ]
  },
  {
    title: "第六部分：数据埋点 (Analytics Ready)",
    description: "没有数据，发行商无法调优买量。",
    items: [
      { id: 'data_1', label: '漏斗埋点', question: '是否已埋好：启动 -> 创角 -> 教程1 -> 教程2 ... -> 教程完成 -> 首充？' },
      { id: 'data_2', label: '资源流向', question: '是否能监控玩家金币/钻石的产出与消耗，以判断通胀情况？' },
      { id: 'data_3', label: '关卡通过率', question: '能否统计每一关的通过率、平均耗时和死亡次数？' },
    ]
  }
];

const GameQualityChecklist: React.FC = () => {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Initialize summary counts
  const fatalCount = Object.values(status).filter(s => s === 'fatal').length;
  const warningCount = Object.values(status).filter(s => s === 'warning').length;
  const passCount = Object.values(status).filter(s => s === 'pass').length;
  const totalItems = checklistData.reduce((acc, sec) => acc + sec.items.length, 0);
  const checkedItems = Object.keys(status).length;

  const handleStatusChange = (id: string, newStatus: Status) => {
    setStatus(prev => ({
      ...prev,
      [id]: prev[id] === newStatus ? null : newStatus // Toggle off if clicked again
    }));
  };

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const resetAll = () => {
    if (confirm('确定要重置所有选项吗？')) {
      setStatus({});
    }
  };

  const getDiagnostic = () => {
    if (fatalCount > 0) {
      return {
        title: "❌ 严禁发布 / 见发行商",
        desc: "存在致命伤 (Fatal)！此时去见发行商会被压价极低，甚至被直接拉黑。请优先解决所有红色项。",
        bg: "bg-red-900/20",
        border: "border-red-500/50",
        text: "text-red-400"
      };
    }
    if (warningCount > 0) {
      return {
        title: "⚠️ 警告：半成品",
        desc: "可以找发行商，但要诚实说明：“我们知道这些问题，并已经列入修复计划（Roadmap）”。这能展示你们团队的专业性。",
        bg: "bg-yellow-900/20",
        border: "border-yellow-500/50",
        text: "text-yellow-400"
      };
    }
    if (passCount === totalItems) {
      return {
        title: "✅ 全绿通过 (All Pass)",
        desc: "恭喜！游戏体质非常健康，可以自信地找一线发行商（Publisher）谈判，甚至有溢价空间。",
        bg: "bg-green-900/20",
        border: "border-green-500/50",
        text: "text-green-400"
      };
    }
    return {
      title: "⏳ 评估进行中",
      desc: `已完成 ${checkedItems}/${totalItems} 项检查。请继续完成自查表。`,
      bg: "bg-slate-800",
      border: "border-slate-700",
      text: "text-slate-400"
    };
  };

  const diagnostic = getDiagnostic();

  return (
    <div className="flex h-full gap-6">
      {/* Main Checklist Area */}
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-400" />
              游戏质量自查表
            </h2>
            <p className="text-sm text-slate-400 mt-1">适用阶段：Alpha / Beta / 上线前夕</p>
          </div>
          <button 
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-24">
          {checklistData.map((section, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
              <div 
                className="p-4 bg-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors"
                onClick={() => toggleSection(section.title)}
              >
                <div>
                  <h3 className="text-sm font-bold text-white">{section.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                </div>
                {collapsedSections[section.title] ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronUp className="w-5 h-5 text-slate-500" />}
              </div>
              
              {!collapsedSections[section.title] && (
                <div className="divide-y divide-slate-800/50">
                  {section.items.map(item => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-800/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-indigo-200">{item.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.question}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleStatusChange(item.id, 'pass')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                            status[item.id] === 'pass' 
                              ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-green-500/50 hover:text-green-400'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> 通过
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'warning')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                            status[item.id] === 'warning' 
                              ? 'bg-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-900/20' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-yellow-500/50 hover:text-yellow-400'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> 优化
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'fatal')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                            status[item.id] === 'fatal' 
                              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> 致命
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Floating Summary Footer */}
        <div className={`absolute bottom-6 left-6 right-6 lg:left-auto lg:w-[calc(100%-24rem-3rem)] rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all ${diagnostic.bg} ${diagnostic.border}`}>
           <div className="flex items-start gap-4">
              <div className="flex-1">
                 <h4 className={`text-lg font-bold mb-1 ${diagnostic.text}`}>{diagnostic.title}</h4>
                 <p className="text-sm text-slate-300">{diagnostic.desc}</p>
              </div>
              <div className="flex gap-4 text-center shrink-0 border-l border-slate-600/30 pl-4">
                 <div>
                    <div className="text-xl font-bold text-red-400">{fatalCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Fatal</div>
                 </div>
                 <div>
                    <div className="text-xl font-bold text-yellow-400">{warningCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Warning</div>
                 </div>
                 <div>
                    <div className="text-xl font-bold text-green-400">{passCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Pass</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GameQualityChecklist;

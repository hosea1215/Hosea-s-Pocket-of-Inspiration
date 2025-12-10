
import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, RefreshCw, Store } from 'lucide-react';

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
    title: "一、上线前检查 (Pre-launch Checklist)",
    description: "目标：合规、稳定、转化率优化。",
    items: [
      { id: 'pre_1_1', label: 'Google Play 政策合规', question: '是否排查了暴力、色情、仇恨言论等违反开发者政策的内容？' },
      { id: 'pre_1_2', label: '隐私权政策', question: '是否提供了有效的隐私政策链接，并包含数据收集、使用说明？' },
      { id: 'pre_1_3', label: '数据安全 (Data Safety)', question: '是否在 Console 如实填写了数据安全表单（位置、设备ID等）？' },
      { id: 'pre_1_4', label: '内容分级 (IARC)', question: '是否完成了内容分级问卷并获得分级证书？' },
      { id: 'pre_1_5', label: '地区法律 (GDPR/CCPA)', question: '是否针对欧盟/加州/儿童提供了相应的隐私同意弹窗？' },
      { id: 'pre_2_1', label: 'App Bundle (AAB)', question: '是否使用了强制要求的 AAB 格式打包？' },
      { id: 'pre_2_2', label: 'Target API Level', question: 'Target SDK 版本是否符合当年的最新要求？' },
      { id: 'pre_2_3', label: 'Pre-launch Report', question: '是否查看了测试报告中的崩溃、ANR 和 UI 适配问题？' },
      { id: 'pre_2_4', label: '本地化测试 (LQA)', question: '多语言UI是否爆框？RTL语言显示是否正常？' },
      { id: 'pre_3_1', label: '多语言元数据', question: '标题、短描述、长描述是否完成了本地化润色？' },
      { id: 'pre_3_2', label: '视觉素材本地化', question: 'Icon、截图、视频是否针对不同文化进行了差异化调整？' },
      { id: 'pre_4_1', label: '支付测试', question: 'In-App Billing 在沙盒和真实环境是否都能正常回调？' },
      { id: 'pre_4_2', label: '归因与埋点', question: 'MMP (AppsFlyer/Adjust) 埋点是否准确（安装、付费、留存）？' },
      { id: 'pre_5_1', label: '分阶段发布', question: '是否设置了分阶段发布 (5% -> 10% -> 100%) 以止损致命Bug？' },
    ]
  },
  {
    title: "二、上线后检查 (Post-launch Checklist)",
    description: "目标：监控、调优、运营。",
    items: [
      { id: 'post_1_1', label: '崩溃率监控', question: '崩溃率是否低于 1.09% (Google 坏行为阈值)？' },
      { id: 'post_1_2', label: 'ANR 率监控', question: 'ANR 率是否低于 0.47%？' },
      { id: 'post_1_3', label: '评分与评论', question: '是否及时监控 1-2 星评论并回复用户？' },
      { id: 'post_2_1', label: '转化率监控', question: '是否每日查看分国家、分流量来源的转化率并优化？' },
      { id: 'post_2_2', label: '留存与退款', question: '留存是否达标？是否存在异常高的退款率？' },
      { id: 'post_3_1', label: 'LiveOps Cards', question: '是否提交了“推广内容”卡片以争取更多曝光？' },
      { id: 'post_3_2', label: 'A/B 测试', question: '是否持续对 Icon、截图进行 Store Listing Experiments？' },
      { id: 'post_4_1', label: '热更新机制', question: '是否具备热更能力以应对紧急代码或配置错误？' },
      { id: 'post_4_2', label: '服务器扩容', question: '服务器是否具备应对流量洪峰的弹性扩容能力？' },
    ]
  }
];

const GooglePlayLaunchChecklist: React.FC = () => {
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
      [id]: prev[id] === newStatus ? null : newStatus
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
        title: "❌ 严禁全量发布 (Critical)",
        desc: "存在违反政策或严重技术问题，极易导致封号或用户差评。请立即修复致命项，仅可进行极小范围 (Internal/Closed) 测试。",
        bg: "bg-red-900/20",
        border: "border-red-500/50",
        text: "text-red-400"
      };
    }
    if (warningCount > 0) {
      return {
        title: "⚠️ 建议软发布 (Soft Launch)",
        desc: "推荐先在 T3 市场或类似市场 (如菲律宾、加拿大) 进行测试。验证数据并修复问题后再开启全球推广。",
        bg: "bg-yellow-900/20",
        border: "border-yellow-500/50",
        text: "text-yellow-400"
      };
    }
    if (passCount === totalItems) {
      return {
        title: "✅ 全球发布就绪 (Ready)",
        desc: "各项指标健康，合规性完善。建议开启分阶段发布 (Staged Rollout) 并密切监控 Vitals 数据。",
        bg: "bg-green-900/20",
        border: "border-green-500/50",
        text: "text-green-400"
      };
    }
    return {
      title: "⏳ 上线准备中",
      desc: `已完成 ${checkedItems}/${totalItems} 项检查。请继续完成自查表。`,
      bg: "bg-slate-800",
      border: "border-slate-700",
      text: "text-slate-400"
    };
  };

  const diagnostic = getDiagnostic();

  return (
    <div className="flex h-full gap-6">
      <div className="flex-1 bg-slate-800 rounded-xl p-6 border border-slate-700/50 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Store className="w-6 h-6 text-indigo-400" />
              Google Play 上线自查表
            </h2>
            <p className="text-sm text-slate-400 mt-1">涵盖 Pre-launch 准备与 Post-launch 运营的关键检查点。</p>
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
                          <AlertTriangle className="w-3.5 h-3.5" /> 待办
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'fatal')}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                            status[item.id] === 'fatal' 
                              ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> 阻碍
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`absolute bottom-6 left-6 right-6 lg:left-auto lg:w-[calc(100%-24rem-3rem)] rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all ${diagnostic.bg} ${diagnostic.border}`}>
           <div className="flex items-start gap-4">
              <div className="flex-1">
                 <h4 className={`text-lg font-bold mb-1 ${diagnostic.text}`}>{diagnostic.title}</h4>
                 <p className="text-sm text-slate-300">{diagnostic.desc}</p>
              </div>
              <div className="flex gap-4 text-center shrink-0 border-l border-slate-600/30 pl-4">
                 <div>
                    <div className="text-xl font-bold text-red-400">{fatalCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Blocker</div>
                 </div>
                 <div>
                    <div className="text-xl font-bold text-yellow-400">{warningCount}</div>
                    <div className="text-[10px] text-slate-400 uppercase">Todo</div>
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

export default GooglePlayLaunchChecklist;

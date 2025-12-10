
import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, RefreshCw, Apple, ShieldCheck } from 'lucide-react';

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
    description: "目标：通过审核、隐私合规、品牌一致性。",
    items: [
      { id: 'pre_1_1', label: 'App Completeness', question: '是否移除了所有“Beta”、“测试”字样及占位符内容？' },
      { id: 'pre_1_2', label: 'IAP 唯一性', question: '是否确保所有虚拟支付都走 IAP，无任何外链或第三方支付按钮？(高频拒收点)' },
      { id: 'pre_1_3', label: '隐私合规 (ATT)', question: '若使用 IDFA，是否配置了 ATT 弹窗及 Info.plist 说明？' },
      { id: 'pre_1_4', label: 'Privacy Manifests', question: '第三方 SDK (Firebase/AppsFlyer) 是否已包含隐私清单文件 (PrivacyInfo.xcprivacy)？' },
      { id: 'pre_1_5', label: '账户删除', question: '是否在 App 内提供了功能完整的“删除账号”入口（不仅仅是停用）？' },
      { id: 'pre_1_6', label: 'Sign in with Apple', question: '若有第三方登录，是否同时提供了 Sign in with Apple？' },
      { id: 'pre_1_7', label: 'IPv6 & iPad', question: '服务器是否支持 IPv6？iPad 版显示是否正常（即使是兼容模式）？' },
      { id: 'pre_2_1', label: '预订 (Pre-order)', question: '是否开启了 Pre-order 以积累首发自动下载？' },
      { id: 'pre_2_2', label: '关键词 (100字符)', question: '是否利用逗号分隔填满了 100 字符的关键词字段？' },
      { id: 'pre_2_3', label: '预览视频', question: '视频是否为真实游戏录屏（非纯 CG），且符合分级要求？' },
    ]
  },
  {
    title: "二、上线后检查 (Post-launch Checklist)",
    description: "目标：利用 iOS 生态工具进行运营与增长。",
    items: [
      { id: 'post_1_1', label: '退款监控', question: '是否密切监控恶意退款请求并及时申诉？' },
      { id: 'post_1_2', label: '评论回复', question: '是否在 Connect 后台回复用户评论（特别是低分）？' },
      { id: 'post_1_3', label: 'In-App Events', question: '是否配置了“应用内活动”卡片以争取 Today/游戏页推荐？' },
      { id: 'post_1_4', label: 'PPO / CPP', question: '是否开启了产品页优化 (A/B Test) 或自定义落地页？' },
      { id: 'post_1_5', label: '分阶段发布', question: '更新是否开启了 Phased Release (1% -> 100%) 以防崩溃蔓延？' },
      { id: 'post_1_6', label: '热更合规', question: '热更是否仅用于修 Bug，未涉及重大功能修改（防封号）？' },
    ]
  }
];

const AppStoreLaunchChecklist: React.FC = () => {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

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
        title: "❌ 极高拒收风险 (Rejected)",
        desc: "存在违反 App Review 指南的致命项（如支付切量、隐私违规）。提交审核必被拒，甚至面临封号风险。",
        bg: "bg-red-900/20",
        border: "border-red-500/50",
        text: "text-red-400"
      };
    }
    if (warningCount > 0) {
      return {
        title: "⚠️ 建议优化 (Warning)",
        desc: "虽不一定导致拒收，但会严重影响 ASO 转化率或运营效率。建议在提交前完善。",
        bg: "bg-yellow-900/20",
        border: "border-yellow-500/50",
        text: "text-yellow-400"
      };
    }
    if (passCount === totalItems) {
      return {
        title: "✅ 审核准备就绪 (Ready)",
        desc: "合规性良好。建议在提交审核时附上测试账号，并开启分阶段发布。",
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
              <Apple className="w-6 h-6 text-indigo-400" />
              App Store 上线自查表
            </h2>
            <p className="text-sm text-slate-400 mt-1">针对 App Review、隐私合规及 iOS 生态特性的检查清单。</p>
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
                          <XCircle className="w-3.5 h-3.5" /> 拒收
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Comparison Table */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden mt-8">
             <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Google Play vs App Store 核心差异</h3>
             </div>
             <div className="p-4 overflow-x-auto">
               <table className="w-full text-left text-sm border-collapse">
                 <thead className="bg-slate-800 text-slate-400 font-semibold text-xs uppercase">
                   <tr>
                     <th className="p-3 border-b border-slate-700">检查项</th>
                     <th className="p-3 border-b border-slate-700 text-green-400">Google Play</th>
                     <th className="p-3 border-b border-slate-700 text-indigo-400">App Store</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700/50 text-slate-300 text-xs">
                   <tr>
                     <td className="p-3 font-medium">审核速度</td>
                     <td className="p-3">较快，部分机审</td>
                     <td className="p-3">较慢 (24-48h)，严格人审</td>
                   </tr>
                   <tr>
                     <td className="p-3 font-medium">封号风险</td>
                     <td className="p-3">政策违规 (关联账号/马甲包)</td>
                     <td className="p-3">支付违规 (切支付)、热更违规</td>
                   </tr>
                   <tr>
                     <td className="p-3 font-medium">隐私要求</td>
                     <td className="p-3">后台填写表单为主</td>
                     <td className="p-3">强制 ATT 弹窗，影响买量归因</td>
                   </tr>
                   <tr>
                     <td className="p-3 font-medium">测试分发</td>
                     <td className="p-3">Open Beta 容易获取用户</td>
                     <td className="p-3">TestFlight (需审核或邀请码)</td>
                   </tr>
                   <tr>
                     <td className="p-3 font-medium">视频素材</td>
                     <td className="p-3">允许 CG / 宣传片风格</td>
                     <td className="p-3">必须为真实游戏录屏</td>
                   </tr>
                   <tr>
                     <td className="p-3 font-medium">中国区</td>
                     <td className="p-3">通常不勾选 (需第三方)</td>
                     <td className="p-3">必须提交版号 (ISBN)</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>
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
                    <div className="text-[10px] text-slate-400 uppercase">Reject</div>
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

export default AppStoreLaunchChecklist;

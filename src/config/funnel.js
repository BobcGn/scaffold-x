/**
 * 漏斗式导航网关的层级化数据配置
 *
 * 数据结构（三级漏斗）：
 *   L1 一级大类 → L2 子方向 → L3 落地靶场
 *
 * L3 节点的 cta 字段支持三种 kind:
 *   - { kind: 'sandbox', sandboxId, label }   打开 SandboxViewer 分屏实战
 *   - { kind: 'doc', docId, label }           打开 MarkdownViewer 渲染的本地 md
 *   - { kind: 'external', href, label }       普通外部链接
 *
 * 若不指定 kind,会自动按 href 分类(占位 GitHub / 相对路径 / 外部 URL)
 * —— 见 src/utils/link.js 中的 classifyHref。
 *
 * L1 / L2 节点统一使用 id + title + (可选) status：
 *   - status: 'available' 默认可点击
 *   - status: 'wip'       施工中，UI 需做置灰 + 特殊标注
 */

import { GITHUB_REPO_URL } from './const.js'

// 拼一个相对当前仓库的 GitHub 文件链接(部署后此 URL 才不会 404)
const githubFile = (branchPath) => `${GITHUB_REPO_URL}/blob/main/${branchPath}`

const FUNNEL_DATA = [
  {
    id: 'software',
    title: '软件开发',
    desc: '覆盖移动端 / 服务端 / AI 工程化全链路',
    status: 'available',
    children: [
      {
        id: 'mobile',
        title: '移动端 / 跨平台开发',
        desc: 'KMP · Compose Multiplatform 工程规范与最佳实践',
        children: [
          {
            id: 'ui-state',
            tag: 'UI / State',
            title: 'UI 状态管理规范沙盒',
            desc: '在 Compose Multiplatform 中落地可预测的单向数据流,规范化 ViewModel / State / Effect 分层。',
            cta: {
              kind: 'doc',
              docId: 'ai-standard',
              label: '查看规范',
            },
          },
          {
            id: 'json-serialize',
            tag: 'Serialization',
            title: 'JSON 序列化策略实战',
            desc: 'kotlinx.serialization 在 KMP 多端共享中的取舍、版本兼容与崩溃防御。',
            cta: {
              // 关键:指向 sandboxId,由 App 装配 SandboxViewer
              kind: 'sandbox',
              sandboxId: 'json-serialization',
              label: '打开靶场',
            },
          },
        ],
      },
      {
        id: 'ai-eng',
        title: '人工智能工程',
        desc: '端侧离线 AI 助手 · 多 Agent 架构落地',
        children: [
          {
            id: 'on-device-ai',
            tag: 'On-Device',
            title: '端侧离线 AI 助手',
            desc: '在桌面 / 移动端运行本地大模型,构建不依赖云端的离线 AI 沙盒。',
            cta: {
              kind: 'external',
              href: githubFile('src/components/AiSandbox.jsx'),
              label: '查看源码',
            },
          },
          {
            id: 'multi-agent',
            tag: 'Multi-Agent',
            title: '多 Agent 架构落地',
            desc: '基于 Koog / LangGraph 的多 Agent 编排与工具调用范式。',
            cta: {
              kind: 'external',
              href: 'https://openaidoc.org/',
              label: '了解 Koog',
            },
          },
        ],
      },
      {
        id: 'server',
        title: '服务端基建',
        desc: 'Ktor / Spring Cloud 工业级后端脚手架',
        children: [
          {
            id: 'ktor-coroutine',
            tag: 'Ktor',
            title: 'Ktor 协程规范实战',
            desc: '从路由、依赖注入到结构化并发,搭建可观测的高并发 Ktor 服务。',
            cta: {
              kind: 'external',
              href: 'https://openaidoc.org/',
              label: '查看规范',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    title: '网络安全',
    desc: '渗透测试 / 红蓝对抗靶场(筹备中)',
    status: 'wip',
    children: [],
  },
]

export default FUNNEL_DATA

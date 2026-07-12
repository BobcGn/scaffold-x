<div align="center">

# ⚡ Scaffold-X

**从课堂算法到工业可用的最短路径。**

[![CI](https://github.com/<org>/scaffold-x/actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-339933)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

</div>

---

## 🎯 为什么做这个项目

> **痛点**：大二学生刚学完 C 语言和数据结构，第一次打开一个"工程化"项目就被 14 个文件夹、6 份配置文件、3 套构建工具劝退。
> **现实**：工业界不在乎你会不会写算法，只在乎你的代码**能不能被协作、能不能被部署、能不能被回滚**。

Scaffold-X 的存在只有一个目的：**把"工程化的最低门槛"以物理拦截的方式焊死**——
- 你不需要懂 Vite 怎么工作，Fork 完就能 `npm run dev`。
- 你不需要懂 CI 是什么，写错 ESLint 就**直接被拒绝合并**。
- 你不需要懂文档站框架，**Markdown 写完 push 出去就是文档**。

我们不教你怎么写代码，我们教你**怎么让代码能活下来**。

---

## 🧠 核心理念（三条铁律）

### 1. 开箱即用 (Out-of-the-Box)
Fork → Clone → `npm install` → `npm run dev`，从零到看到页面，**30 秒内必须发生**。
没有奇怪的全局依赖、没有"先看 Wiki 才能跑"的前置文档。

### 2. 渐进式认知 (Progressive Disclosure)
架构、规范、CI 全部以**纯 Markdown** 沉淀在 [docs/](./docs/)。
- 第一天？读 [ONBOARDING.md](./docs/ONBOARDING.md)。
- 想理解系统？看 [ARCHITECTURE.md](./docs/ARCHITECTURE.md)。
- CI 爆红？翻 [CI-CD-GUIDE.md](./docs/CI-CD-GUIDE.md)。

**目录即导航，零跳转成本。**

### 3. 物理拦截 (Physical Interception)
所有规范都通过 [.github/workflows/ci.yml](./.github/workflows/ci.yml) 强制执行：
```
ESLint 报错 ──❌──▶ 拒绝合并
Vite Build 失败 ──❌──▶ 拒绝合并
"先合并再修" ──❌──▶ 不存在的选项
```
CI 报错信息会**精准导流**到 `docs/` 中对应的规范章节——从"哪里错了"到"为什么错"只需一次点击。

---

## 🧭 漏斗式路由 (Funnel Routing)

> "我想做什么？" → 一次跳转，命中目标。

- [🚀 **快速开始**](./CONTRIBUTING.md#本地环境搭建)
  - 环境准备、依赖安装、第一次 `npm run dev`
- [📐 **架构设计**](./docs/ARCHITECTURE.md)
  - 为什么是单体仓库？为什么是纯 Markdown？三类资产如何共存？
- [📏 **代码规范**](./docs/RULES.md)
  - ESLint 规则逐条解释 + 正确/错误对照
- [🤖 **CI/CD 指南**](./docs/CI-CD-GUIDE.md)
  - 流水线爆红时的 5 分钟排查手册
- [🧪 **业务沙盒**](./src/)
  - `src/main.jsx` 入口 · `src/App.jsx` 漏斗式路由示例组件
  - [AI 工程化沙盒](./src/components/AiSandbox.jsx)
    - 🆕 真实 API 模式：填入 baseURL + apiKey 即可调用 OpenAI 兼容大模型
    - 沙盒训练靶子：故意留 4 处 ESLint 错误，新人首个 PR 实操场
  - [API 配置面板](./src/components/ApiConfigPanel.jsx) · [AI 服务封装](./src/services/aiService.js) · [预置服务商](./src/config/providers.js)
- [🐛 **报告问题**](../../issues/new?template=bug_report.md)
  - 使用结构化模板，让我们 1 分钟内复现你的问题

---

## 🏗️ 技术栈

| 层级 | 选型 | 理由 |
|------|------|------|
| 构建 | Vite | 启动 < 1s，原生 ESM |
| 视图 | React 19 | 工业界需求量最大 |
| 检查 | ESLint 10 (flat) | 物理拦截第一道防线 |
| CI | GitHub Actions | 与代码托管零摩擦 |
| 文档 | 纯 Markdown | 零构建，GitHub 原生渲染 |

---

## 📜 许可证

[MIT](./LICENSE) — 你可以自由使用、修改、分发，只需保留版权声明。

---

<div align="center">

**"从能跑到能上线" — Scaffold-X**

</div>

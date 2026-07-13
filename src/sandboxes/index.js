/**
 * 靶场注册表 —— 从分类子目录汇总所有靶场条目
 *
 * 与 funnel.js 的 L3 节点通过 `sandboxId` 字段关联:
 *   funnel 中某 L3.cta.kind === 'sandbox' 且 cta.sandboxId === 'json-serialization'
 *   → 在 App 中查找 SANDBOX_REGISTRY[sandboxId],挂载到 SandboxViewer
 *
 * 分类结构:
 *   data-processing/   —— 数据处理方向(JSON 序列化、异步数据)
 *   react-patterns/    —— React 模式方向(状态管理、表单验证)
 *
 * 字段说明:
 *   - id           唯一标识
 *   - title        靶场名
 *   - tag          分类小标
 *   - filePath     靶子文件相对路径(展示在 SandboxViewer 顶部 mono 条)
 *   - instructionMd 任务说明(由 ?raw 加载)
 *   - sourceCode   源代码(由 ?raw 加载,用于代码编辑器)
 *   - Component    实操组件(本身),注意:Component 不能在 lint 范围内
 *   - meta         自由扩展 meta:难度/预计耗时等
 */

import { DATA_PROCESSING_SANDBOXES } from './data-processing/index.js'
import { REACT_PATTERNS_SANDBOXES } from './react-patterns/index.js'

/**
 * 靶场分类元信息 —— 供 UI 层做分组展示、导航菜单等
 */
export const SANDBOX_CATEGORIES = [
  {
    id: 'data-processing',
    name: '数据处理',
    icon: '🔄',
    description: 'JSON 序列化、异步数据获取与竞态处理',
    sandboxIds: Object.keys(DATA_PROCESSING_SANDBOXES),
  },
  {
    id: 'react-patterns',
    name: 'React 模式',
    icon: '⚛️',
    description: '状态管理、表单验证与组件设计模式',
    sandboxIds: Object.keys(REACT_PATTERNS_SANDBOXES),
  },
]

/**
 * 集中维护所有可挂载的靶场 —— 合并所有子分类注册表。
 * loadComponent 必须是 dynamic import,让 webpack/vite 自动 code-split,
 * 也让 sandboxes 目录的 lint 错误不阻塞主包。
 */
export const SANDBOX_REGISTRY = {
  ...DATA_PROCESSING_SANDBOXES,
  ...REACT_PATTERNS_SANDBOXES,
}

/**
 * 按 id 取出靶场条目,未命中返回 null
 *
 * @param {string} id
 * @returns {object|null}
 */
export function getSandbox(id) {
  return SANDBOX_REGISTRY[id] || null
}

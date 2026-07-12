/**
 * 靶场注册表 —— 把"任务说明 + 实操组件"打包成可挂载的单元
 *
 * 与 funnel.js 的 L3 节点通过 `sandboxId` 字段关联:
 *   funnel 中某 L3.cta.kind === 'sandbox' 且 cta.sandboxId === 'json-serialization'
 *   → 在 App 中查找 SANDBOX_REGISTRY[sandboxId],挂载到 SandboxViewer
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

import jsonSerializationInstruction from './instructions/json-serialization.md?raw'
import stateManagementInstruction from './instructions/state-management.md?raw'
import asyncDataInstruction from './instructions/async-data.md?raw'
import formValidationInstruction from './instructions/form-validation.md?raw'

// 源代码由 ?raw 导入,用于代码编辑器
import jsonSerializationSource from './JSONSerializationSandbox.jsx?raw'
import stateManagementSource from './StateManagerSandbox.jsx?raw'
import asyncDataSource from './AsyncDataSandbox.jsx?raw'
import formValidationSource from './FormValidationSandbox.jsx?raw'

// 沙盒组件由 App.jsx 异步 import(lazy),本文件不直接 import
// 避免 lint 范围之外的报错污染主包
/**
 * @typedef {Object} SandboxEntry
 * @property {string}   id
 * @property {string}   title
 * @property {string}   tag
 * @property {string}   filePath
 * @property {string}   instructionMd
 * @property {string}   sourceCode
 * @property {() => Promise<{default: React.ComponentType}>} loadComponent
 * @property {Array<{label: string, value: string}>} meta
 */

/**
 * 集中维护所有可挂载的靶场。
 * loadComponent 必须是 dynamic import,让 webpack/vite 自动 code-split,
 * 也让 sandboxes 目录的 lint 错误不阻塞主包。
 */
export const SANDBOX_REGISTRY = {
  'json-serialization': {
    id: 'json-serialization',
    title: 'JSON 序列化策略实战',
    tag: 'Serialization',
    filePath: 'src/sandboxes/JSONSerializationSandbox.jsx',
    instructionMd: jsonSerializationInstruction,
    sourceCode: jsonSerializationSource,
    loadComponent: () => import('./JSONSerializationSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐⭐☆' },
      { label: '预计', value: '15 ~ 30 min' },
    ],
  },
  'state-management': {
    id: 'state-management',
    title: 'React 状态管理实战',
    tag: 'State',
    filePath: 'src/sandboxes/StateManagerSandbox.jsx',
    instructionMd: stateManagementInstruction,
    sourceCode: stateManagementSource,
    loadComponent: () => import('./StateManagerSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐⭐☆' },
      { label: '预计', value: '20 ~ 30 min' },
    ],
  },
  'async-data': {
    id: 'async-data',
    title: '异步数据处理实战',
    tag: 'Async',
    filePath: 'src/sandboxes/AsyncDataSandbox.jsx',
    instructionMd: asyncDataInstruction,
    sourceCode: asyncDataSource,
    loadComponent: () => import('./AsyncDataSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐⭐☆' },
      { label: '预计', value: '20 ~ 30 min' },
    ],
  },
  'form-validation': {
    id: 'form-validation',
    title: '表单验证实战',
    tag: 'Form',
    filePath: 'src/sandboxes/FormValidationSandbox.jsx',
    instructionMd: formValidationInstruction,
    sourceCode: formValidationSource,
    loadComponent: () => import('./FormValidationSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐☆☆' },
      { label: '预计', value: '15 ~ 25 min' },
    ],
  },
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

/**
 * React 模式方向靶场注册表
 *
 * 包含：状态管理、表单验证 等与 React 组件模式相关的靶场。
 * 由 sandboxes/index.js 统一汇总后导出给 App 层消费。
 */

import stateManagementInstruction from './instructions/state-management.md?raw'
import formValidationInstruction from './instructions/form-validation.md?raw'

import stateManagementSource from './StateManagerSandbox.jsx?raw'
import formValidationSource from './FormValidationSandbox.jsx?raw'

export const REACT_PATTERNS_SANDBOXES = {
  'state-management': {
    id: 'state-management',
    title: 'React 状态管理实战',
    tag: 'State',
    filePath: 'src/sandboxes/react-patterns/StateManagerSandbox.jsx',
    instructionMd: stateManagementInstruction,
    sourceCode: stateManagementSource,
    loadComponent: () => import('./StateManagerSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐⭐☆' },
      { label: '预计', value: '20 ~ 30 min' },
    ],
  },
  'form-validation': {
    id: 'form-validation',
    title: '表单验证实战',
    tag: 'Form',
    filePath: 'src/sandboxes/react-patterns/FormValidationSandbox.jsx',
    instructionMd: formValidationInstruction,
    sourceCode: formValidationSource,
    loadComponent: () => import('./FormValidationSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐☆☆' },
      { label: '预计', value: '15 ~ 25 min' },
    ],
  },
}

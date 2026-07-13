/**
 * 数据处理方向靶场注册表
 *
 * 包含：JSON 序列化、异步数据处理 等与数据流 / IO 相关的靶场。
 * 由 sandboxes/index.js 统一汇总后导出给 App 层消费。
 */

import jsonSerializationInstruction from './instructions/json-serialization.md?raw'
import asyncDataInstruction from './instructions/async-data.md?raw'

import jsonSerializationSource from './JSONSerializationSandbox.jsx?raw'
import asyncDataSource from './AsyncDataSandbox.jsx?raw'

export const DATA_PROCESSING_SANDBOXES = {
  'json-serialization': {
    id: 'json-serialization',
    title: 'JSON 序列化策略实战',
    tag: 'Serialization',
    filePath: 'src/sandboxes/data-processing/JSONSerializationSandbox.jsx',
    instructionMd: jsonSerializationInstruction,
    sourceCode: jsonSerializationSource,
    loadComponent: () => import('./JSONSerializationSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐⭐☆' },
      { label: '预计', value: '15 ~ 30 min' },
    ],
  },
  'async-data': {
    id: 'async-data',
    title: '异步数据处理实战',
    tag: 'Async',
    filePath: 'src/sandboxes/data-processing/AsyncDataSandbox.jsx',
    instructionMd: asyncDataInstruction,
    sourceCode: asyncDataSource,
    loadComponent: () => import('./AsyncDataSandbox.jsx'),
    meta: [
      { label: '难度', value: '⭐⭐☆' },
      { label: '预计', value: '20 ~ 30 min' },
    ],
  },
}

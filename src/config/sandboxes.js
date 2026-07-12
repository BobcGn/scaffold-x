/**
 * 靶场数据配置 - 支持列表视图的升级版数据结构
 *
 * 数据结构说明:
 * - id:          唯一标识
 * - title:       靶场标题
 * - category:    所属分类/考点标签
 * - difficulty:  难度级别 (Easy | Medium | Hard)
 * - author:      出题人 (Official | Community | GitHub ID)
 * - status:      完成状态 (Todo | Solved | Skipped)
 * - sandboxId:   关联的靶场组件 ID
 * - tags:        标签数组
 * - description: 简短描述
 * - estimatedTime: 预计耗时
 */

export const SANDBOX_LIST_DATA = [
  {
    id: 1,
    title: 'JSON 序列化策略实战',
    category: 'Serialization',
    difficulty: 'Easy',
    author: 'Official',
    status: 'Todo',
    sandboxId: 'json-serialization',
    tags: ['JSON', 'Parsing', 'Validation'],
    description: 'kotlinx.serialization 在 KMP 多端共享中的取舍、版本兼容与崩溃防御。',
    estimatedTime: '15-30 min',
  },
  {
    id: 2,
    title: 'React 状态管理实战',
    category: 'State Management',
    difficulty: 'Medium',
    author: 'Official',
    status: 'Todo',
    sandboxId: 'state-management',
    tags: ['useState', 'useReducer', 'Context'],
    description: '练习 useState / useReducer / useContext,修复直接 mutation 和 Context 性能问题。',
    estimatedTime: '20-30 min',
  },
  {
    id: 3,
    title: '异步数据处理实战',
    category: 'Async',
    difficulty: 'Medium',
    author: 'Official',
    status: 'Solved',
    sandboxId: 'async-data',
    tags: ['async/await', 'AbortController', 'Race Condition'],
    description: '练习 async/await、AbortController、竞态条件处理和内存泄漏防护。',
    estimatedTime: '20-30 min',
  },
  {
    id: 4,
    title: '表单验证实战',
    category: 'Form',
    difficulty: 'Easy',
    author: 'Community',
    status: 'Todo',
    sandboxId: 'form-validation',
    tags: ['Forms', 'Validation', 'Controlled Components'],
    description: '练习受控组件、表单验证逻辑和密码强度检测。',
    estimatedTime: '15-25 min',
  },
  {
    id: 5,
    title: '组件性能优化',
    category: 'Performance',
    difficulty: 'Hard',
    author: 'Official',
    status: 'Todo',
    sandboxId: null,
    tags: ['memo', 'useMemo', 'useCallback', 'Virtualization'],
    description: '优化渲染性能,减少不必要的重渲染,实现列表虚拟化。',
    estimatedTime: '30-45 min',
  },
  {
    id: 6,
    title: 'TypeScript 类型体操',
    category: 'TypeScript',
    difficulty: 'Hard',
    author: 'Community',
    status: 'Todo',
    sandboxId: null,
    tags: ['Generics', 'Utility Types', 'Type Inference'],
    description: '高级 TypeScript 类型编程,实现类型安全的 API 设计。',
    estimatedTime: '25-40 min',
  },
  {
    id: 7,
    title: 'React Hooks 深度解析',
    category: 'Hooks',
    difficulty: 'Medium',
    author: 'Official',
    status: 'Solved',
    sandboxId: null,
    tags: ['Custom Hooks', 'Effect', 'Ref'],
    description: '深入理解 Hooks 原理,实现自定义 Hook。',
    estimatedTime: '20-35 min',
  },
  {
    id: 8,
    title: 'CSS 架构与设计系统',
    category: 'CSS',
    difficulty: 'Easy',
    author: 'Community',
    status: 'Todo',
    sandboxId: null,
    tags: ['BEM', 'CSS Variables', 'Responsive Design'],
    description: '构建可维护的 CSS 架构,实现主题切换和响应式设计。',
    estimatedTime: '15-25 min',
  },
  {
    id: 9,
    title: 'GraphQL API 设计',
    category: 'API',
    difficulty: 'Hard',
    author: 'Official',
    status: 'Todo',
    sandboxId: null,
    tags: ['GraphQL', 'Schema Design', 'Resolvers'],
    description: '设计高效的 GraphQL API,处理 N+1 问题和缓存策略。',
    estimatedTime: '35-50 min',
  },
  {
    id: 10,
    title: '测试驱动开发实战',
    category: 'Testing',
    difficulty: 'Medium',
    author: 'Official',
    status: 'Todo',
    sandboxId: null,
    tags: ['Jest', 'React Testing Library', 'TDD'],
    description: '编写单元测试、集成测试和 E2E 测试。',
    estimatedTime: '25-40 min',
  },
]

/**
 * 分类配置
 */
export const CATEGORIES = [
  { id: 'all', name: '全部', count: 10 },
  { id: 'Serialization', name: '序列化', count: 1 },
  { id: 'State Management', name: '状态管理', count: 1 },
  { id: 'Async', name: '异步处理', count: 1 },
  { id: 'Form', name: '表单', count: 1 },
  { id: 'Performance', name: '性能优化', count: 1 },
  { id: 'TypeScript', name: 'TypeScript', count: 1 },
  { id: 'Hooks', name: 'Hooks', count: 1 },
  { id: 'CSS', name: 'CSS', count: 1 },
  { id: 'API', name: 'API', count: 1 },
  { id: 'Testing', name: '测试', count: 1 },
]

/**
 * 难度配置
 */
export const DIFFICULTY_CONFIG = {
  Easy: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', label: '简单' },
  Medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: '中等' },
  Hard: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: '困难' },
}

/**
 * 状态配置
 */
export const STATUS_CONFIG = {
  Todo: { icon: '○', color: '#8b8fa3', label: '待完成' },
  Solved: { icon: '✓', color: '#22c55e', label: '已完成' },
  Skipped: { icon: '—', color: '#6b7280', label: '已跳过' },
}

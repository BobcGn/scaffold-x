/**
 * 预置大模型服务商配置
 *
 * 提供 OpenAI 兼容协议（Chat Completions）的常见服务商元数据。
 * 用户在 ApiConfigPanel 中选择服务商后，baseURL 与 defaultModel 会自动填充，
 * 但仍允许用户自由修改以适配自建代理或第三方中转服务。
 *
 * ⚠️ 注意：所有 baseURL 末尾斜杠会被 aiService 自动去除，避免拼出 //。
 */
export const PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    modelOptions: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'o1-mini'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek（深度求索）',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    modelOptions: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'moonshot',
    name: 'Moonshot（月之暗面）',
    baseURL: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    modelOptions: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    modelOptions: ['glm-4-flash', 'glm-4', 'glm-4-plus', 'glm-3-turbo'],
  },
  {
    id: 'ollama',
    name: 'Ollama（本地部署）',
    baseURL: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
    modelOptions: ['llama3', 'qwen2', 'gemma2', 'mistral', 'phi3'],
  },
  {
    id: 'custom',
    name: '自定义兼容服务',
    baseURL: '',
    defaultModel: '',
    modelOptions: [],
  },
]

/**
 * localStorage 存储 Key 前缀。
 * 用作命名空间隔离，避免与项目其他 localStorage 写入冲突。
 */
export const STORAGE_KEY = 'scaffold-x:ai:config'

/**
 * 默认空配置。
 * 初始进入页面、用户从未保存过配置时使用。
 */
export const DEFAULT_CONFIG = {
  providerId: 'openai',
  baseURL: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
}

/**
 * 从 localStorage 读取用户配置。
 *
 * @returns {Object} 配置对象；任何字段缺失时回退到 DEFAULT_CONFIG 对应字段
 */
export const loadConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CONFIG }
    const parsed = JSON.parse(raw)
    // 字段补齐：未来新增字段时旧用户配置也能兼容
    return { ...DEFAULT_CONFIG, ...parsed }
  } catch (error) {
    console.warn('[providers] 读取本地配置失败，使用默认配置:', error)
    return { ...DEFAULT_CONFIG }
  }
}

/**
 * 将配置写入 localStorage。
 *
 * @param {Object} config - 待持久化的配置
 * @returns {boolean} 写入是否成功
 */
export const saveConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    return true
  } catch (error) {
    console.warn('[providers] 保存本地配置失败:', error)
    return false
  }
}

/**
 * 清除 localStorage 中的配置（恢复出厂设置）。
 */
export const clearConfig = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('[providers] 清除本地配置失败:', error)
  }
}

/**
 * 根据 providerId 在 PROVIDERS 中查找完整定义。
 *
 * @param {string} providerId
 * @returns {Object|undefined} 命中的服务商对象，未命中返回 undefined
 */
export const findProvider = (providerId) =>
  PROVIDERS.find((p) => p.id === providerId)

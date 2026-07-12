/**
 * AI Service - OpenAI 兼容协议的 Chat Completions 封装
 *
 * 职责：把"调用大模型"这个动作标准化，向上层（UI 组件）屏蔽以下复杂性：
 *   1. baseURL 末尾斜杠处理、端点拼接
 *   2. 请求头构造（Authorization、Content-Type）
 *   3. 请求体序列化（messages、temperature、stream）
 *   4. 响应解析（content、usage）
 *   5. 错误分类（网络 / CORS / 401 / 429 / 5xx / 4xx 参数错误）
 *
 * 协议参考：https://platform.openai.com/docs/api-reference/chat/create
 * DeepSeek / Moonshot / 智谱 / Ollama / OpenRouter 等均兼容此协议。
 */

/**
 * 自定义错误类型，携带 HTTP 状态码与可分类的 type 字段，
 * 便于 getFriendlyErrorMessage 给出针对性提示。
 */
export class AIServiceError extends Error {
  constructor(message, { status, type, cause } = {}) {
    super(message)
    this.name = 'AIServiceError'
    this.status = status
    this.type = type
    if (cause) this.cause = cause
  }
}

/**
 * 规范化 baseURL：去除末尾斜杠，避免拼出 "https://x.com//chat/completions"。
 *
 * @param {string} baseURL
 * @returns {string}
 */
const normalizeBaseURL = (baseURL) => {
  if (!baseURL || typeof baseURL !== 'string') {
    throw new AIServiceError('baseURL 不能为空', { type: 'INVALID_INPUT' })
  }
  return baseURL.replace(/\/+$/, '')
}

/**
 * 调用 OpenAI 兼容协议的 Chat Completions 接口（非流式）。
 *
 * @param {Object} params
 * @param {string} params.baseURL    - API 基础地址，例如 "https://api.openai.com/v1"
 * @param {string} params.apiKey     - 授权密钥
 * @param {string} params.model      - 模型名，例如 "gpt-3.5-turbo"
 * @param {Array<{role: string, content: string}>} params.messages
 * @param {number} [params.temperature=0.7]
 * @param {AbortSignal} [params.signal] - 用于取消请求
 * @returns {Promise<{ content: string, usage: { prompt: number, completion: number, total: number }, raw: Object }>}
 */
export const callChatCompletion = async ({
  baseURL,
  apiKey,
  model,
  messages,
  temperature = 0.7,
  signal,
}) => {
  // 1. 入参校验
  if (!apiKey || typeof apiKey !== 'string') {
    throw new AIServiceError('apiKey 不能为空', { type: 'INVALID_INPUT' })
  }
  if (!model || typeof model !== 'string') {
    throw new AIServiceError('model 不能为空', { type: 'INVALID_INPUT' })
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AIServiceError('messages 必须是非空数组', { type: 'INVALID_INPUT' })
  }

  // 2. 构造端点与请求体
  const endpoint = `${normalizeBaseURL(baseURL)}/chat/completions`
  const body = {
    model,
    messages,
    temperature,
    stream: false,
  }

  // 3. 发起请求
  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    })
  } catch (networkError) {
    // 浏览器抛出 TypeError: Failed to fetch 通常是 CORS 或网络断开
    const isAbort = networkError?.name === 'AbortError'
    throw new AIServiceError(
      isAbort ? '请求已取消' : '网络请求失败（可能是 CORS 跨域限制或网络断开）',
      {
        type: isAbort ? 'ABORTED' : 'NETWORK',
        cause: networkError,
      }
    )
  }

  // 4. 解析响应
  if (!response.ok) {
    let errorPayload = null
    try {
      errorPayload = await response.json()
    } catch {
      // 响应不是 JSON，忽略
    }
    const serverMessage =
      errorPayload?.error?.message || errorPayload?.message || response.statusText

    let type = 'HTTP_ERROR'
    if (response.status === 401) type = 'AUTH'
    else if (response.status === 403) type = 'FORBIDDEN'
    else if (response.status === 429) type = 'RATE_LIMIT'
    else if (response.status >= 500) type = 'SERVER'
    else if (response.status >= 400) type = 'BAD_REQUEST'

    throw new AIServiceError(`HTTP ${response.status}: ${serverMessage}`, {
      status: response.status,
      type,
    })
  }

  const data = await response.json()

  // 5. 提取 OpenAI 标准字段
  const content = data?.choices?.[0]?.message?.content ?? ''
  const usage = data?.usage ?? {}
  return {
    content,
    usage: {
      prompt: usage.prompt_tokens ?? 0,
      completion: usage.completion_tokens ?? 0,
      total: usage.total_tokens ?? 0,
    },
    raw: data,
  }
}

/**
 * 把不同类型的错误转换为对用户友好的中文提示。
 *
 * @param {Error} error
 * @returns {string}
 */
export const getFriendlyErrorMessage = (error) => {
  if (error instanceof AIServiceError) {
    switch (error.type) {
      case 'INVALID_INPUT':
        return `⚠️ 参数错误：${error.message}`
      case 'ABORTED':
        return '⏹️ 请求已取消'
      case 'NETWORK':
        return '🌐 网络请求失败。可能是以下原因之一：\n' +
          '  1. 浏览器 CORS 跨域限制（多数第三方 API 默认不允许浏览器直连）\n' +
          '  2. 网络断开或目标服务不可达\n' +
          '  3. baseURL 填写错误\n' +
          '💡 建议：使用本地 Ollama，或自建后端代理中转请求。'
      case 'AUTH':
        return '🔑 API Key 无效或已过期（HTTP 401）。请检查密钥是否正确。'
      case 'FORBIDDEN':
        return '🚫 访问被拒绝（HTTP 403）。可能是 API Key 权限不足或地区限制。'
      case 'RATE_LIMIT':
        return '⏱️ 请求过于频繁（HTTP 429）。请稍后再试，或考虑升级套餐。'
      case 'SERVER':
        return `🔥 服务端错误（HTTP ${error.status}）。请稍后重试。`
      case 'BAD_REQUEST':
        return `📋 请求参数错误（HTTP ${error.status}）：${error.message}\n` +
          '💡 请检查模型名、baseURL、消息格式是否正确。'
      default:
        return `❌ 调用失败：${error.message}`
    }
  }
  return `❌ 未知错误：${error?.message || String(error)}`
}

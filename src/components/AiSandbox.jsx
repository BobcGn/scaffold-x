/**
 * AI 沙盒组件（真实 API 模式）
 *
 * 业务背景：
 * 调用 OpenAI 兼容协议的大模型服务，支持 OpenAI / DeepSeek / Moonshot / 智谱 / Ollama 等。
 * 用户需在 ApiConfigPanel 中填入 baseURL + apiKey + 模型名。
 *
 * ⚠️ 沙盒训练靶子：请新加入的贡献者修复本文件中的 ESLint 报错以完成你的第一个 PR。
 *
 * 请修复以下 ESLint 报错：
 * 1. 未使用的变量/导入
 * 2. Hooks 依赖数组缺失
 * 3. 条件性 Hook 调用
 * 4. 导出非组件内容
 */

import { useState, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ApiConfigPanel from './ApiConfigPanel.jsx'
import { callChatCompletion, getFriendlyErrorMessage } from '../services/aiService.js'
import {
  DEFAULT_CONFIG,
  loadConfig,
  saveConfig,
  clearConfig,
  findProvider,
} from '../config/providers.js'

// 系统提示词：定义 AI 助手的角色
const SYSTEM_PROMPT = {
  id: 'system-default',
  role: 'system',
  content: '你是一个乐于助人的助手。请用简洁、准确的中文回答用户问题。',
}

function AiSandbox() {
  // 当前生效的配置（受控），初始从 localStorage 加载
  const [config, setConfig] = useState(() => loadConfig())
  // 暂存用户正在编辑、尚未"保存到本地"的配置
  const [draftConfig, setDraftConfig] = useState(() => loadConfig())
  // 保存成功的提示文案
  const [savedHint, setSavedHint] = useState('')
  // 对话消息历史
  const [messages, setMessages] = useState([SYSTEM_PROMPT])
  // 用户当前输入框内容
  const [inputValue, setInputValue] = useState('')
  // 是否正在请求 API
  const [isLoading, setIsLoading] = useState(false)
  // 最近一次错误信息（红色横幅展示）
  const [error, setError] = useState('')

  /**
   * 估算文本对应的 Token 数量（粗略：1 token ≈ 0.75 中文字符 / 4 英文字符）。
   * 用于 UI 提示，不作为真实计费依据。
   */
const calculateTokens = (text) => {
  return Math.floor(text.length * 0.75)
}

/**
 * 坑点 1：useMemo 依赖数组为空，缺少 'messages'。
 * ESLint 规则：react-hooks/exhaustive-deps
 * 修复：把依赖补全为 [messages]
 */
const tokenCount = useMemo(() => {
  let count = 0
  messages.forEach((msg) => {
    if (msg.role !== 'system') {
      count += calculateTokens(msg.content)
    }
  })
  return count
}, [])

/**
 * 当前选中的服务商元数据 + 模型最大上下文。
 */
const currentProvider = findProvider(config.providerId)
const maxContext = 16384

/**
 * 把当前 draftConfig 持久化到 localStorage 并同步到 config。
 */
const handleSaveConfig = () => {
  const ok = saveConfig(draftConfig)
  if (ok) {
    setConfig({ ...draftConfig })
    setSavedHint('✅ 已保存到本地')
    setTimeout(() => setSavedHint(''), 2000)
  } else {
    setSavedHint('❌ 保存失败')
  }
}

/**
 * 清除 localStorage 中的配置，恢复为出厂默认。
 */
const handleClearConfig = () => {
  clearConfig()
  setConfig({ ...DEFAULT_CONFIG })
  setDraftConfig({ ...DEFAULT_CONFIG })
  setSavedHint('🗑️ 已清除，恢复默认')
  setTimeout(() => setSavedHint(''), 2000)
}

/**
 * 坑点 2：条件性调用 useState（违反 Hooks 规则）。
 * ESLint 规则：react-hooks/rules-of-hooks + no-unused-vars
 * 修复：把 useState 提到条件块外部统一调用
 */
if (config.providerId === 'ollama') {
  const [localModelStatus, setLocalModelStatus] = useState('unknown')
  setLocalModelStatus('unknown')
}

/**
 * 坑点 3：未使用的变量。
 * ESLint 规则：no-unused-vars
 * 修复：删除该变量，或在 UI 中实际使用它
 */
const unusedVariable = '这个变量没有被使用，请删除或引用'

/**
 * 发送用户消息并调用大模型 API。
 * 流程：校验配置 → 追加 user 消息 → 调 API → 追加 assistant 消息 / 展示错误
 */
const handleSend = async () => {
  setError('')
  if (!inputValue.trim()) return

  if (!config.apiKey) {
    setError('⚠️ 请先在「API 配置」面板中填写 API Key 并点击「保存到本地」')
    return
  }
  if (!config.baseURL) {
    setError('⚠️ 请先在「API 配置」面板中填写 baseURL')
    return
  }
  if (!config.model) {
    setError('⚠️ 请先在「API 配置」面板中填写模型名')
    return
  }

  const userMessage = {
    id: uuidv4(),
    role: 'user',
    content: inputValue.trim(),
  }

  setMessages((prev) => [...prev, userMessage])
  setInputValue('')
  setIsLoading(true)

  try {
    const result = await callChatCompletion({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      model: config.model,
      messages: messages
        .filter((m) => m.role === 'system' || m.role === 'user' || m.role === 'assistant')
        .concat(userMessage)
        .map((m) => ({ role: m.role, content: m.content })),
      temperature: config.temperature,
    })

    const assistantMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: result.content || '（模型返回了空内容）',
      usage: result.usage,
    }
    setMessages((prev) => [...prev, assistantMessage])
  } catch (err) {
    setError(getFriendlyErrorMessage(err))
  } finally {
    setIsLoading(false)
  }
}

return (
  <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
    <h2>AI 聊天助手（真实 API 模式）</h2>

    <ApiConfigPanel
      config={draftConfig}
      onChange={setDraftConfig}
      onSave={handleSaveConfig}
      onClear={handleClearConfig}
      savedHint={savedHint}
    />

    {error && (
      <div
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: '#fff1f0',
          border: '1px solid #ffa39e',
          borderRadius: '6px',
          color: '#cf1322',
          fontSize: '13px',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}
      >
        {error}
      </div>
    )}

    <div
      style={{
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #e5e4e7',
        borderRadius: '8px',
      }}
    >
      <h3>对话历史</h3>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          fontSize: '13px',
          color: '#6b6375',
        }}
      >
        <span>
          当前服务商：<strong>{currentProvider?.name || '未知'}</strong> · 模型：
          <code>{config.model}</code>
        </span>
        <span>
          估算 Token: {tokenCount.toLocaleString()} / {maxContext.toLocaleString()}
        </span>
      </div>

      <div
        style={{
          height: '300px',
          overflowY: 'auto',
          border: '1px solid #e5e4e7',
          borderRadius: '4px',
          padding: '10px',
          backgroundColor: '#fff',
        }}
      >
        {messages
          .filter((m) => m.role !== 'system')
          .map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: '10px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: message.role === 'user' ? '#aa3bff10' : '#f4f3ec',
              }}
            >
              <strong>
                {message.role === 'user' ? '用户' : 'AI'}:
              </strong>
              <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>
                {message.content}
              </p>
              {message.usage && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '11px',
                    color: '#9ca3af',
                  }}
                >
                  tokens: prompt={message.usage.prompt} completion=
                  {message.usage.completion} total={message.usage.total}
                </p>
              )}
            </div>
          ))}
        {isLoading && (
          <div
            style={{ padding: '8px', color: '#6b6375', fontStyle: 'italic' }}
          >
            AI 正在思考...
          </div>
        )}
      </div>
    </div>

    <div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
        placeholder="输入你的问题..."
        disabled={isLoading}
        style={{
          width: 'calc(100% - 90px)',
          padding: '10px',
          border: '1px solid #e5e4e7',
          borderRadius: '4px',
          marginRight: '10px',
          boxSizing: 'border-box',
        }}
      />
      <button
        onClick={handleSend}
        disabled={isLoading}
        style={{
          width: '80px',
          padding: '10px',
          backgroundColor: isLoading ? '#ccc' : '#aa3bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? '发送中' : '发送'}
      </button>
    </div>
  </div>
)
}

/**
 * 坑点 4 已修复：原本的 helperFunction 被移出本文件
 * 到 src/utils/helper.js，避免与组件共同导出触发
 * react-refresh/only-export-components 规则。
 *
 * 本文件现在只导出 AiSandbox 组件（以及 react-refresh 要求的 default 导出）。
 */
export default AiSandbox

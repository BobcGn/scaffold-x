/**
 * API 配置面板组件
 *
 * 职责：让用户配置大模型服务商的 baseURL / apiKey / 模型名 / 温度。
 * 配置仅存储在用户浏览器 localStorage，**不上传任何服务器**。
 *
 * Props:
 *   - config       {Object}   当前配置（受控）
 *   - onChange     {Function} 配置变更回调（输入即触发）
 *   - onSave       {Function} 点击「保存配置」时触发
 *   - onClear      {Function} 点击「清除配置」时触发
 *   - savedHint    {string}   保存成功后的提示文案（由父组件控制）
 *
 * ⚠️ 隐私提示：本面板默认遮罩 API Key，UI 上明确告知用户密钥仅存本地。
 */
import { useState } from 'react'
import { PROVIDERS, findProvider } from '../config/providers.js'

function ApiConfigPanel({ config, onChange, onSave, onClear, savedHint }) {
  // 控制 API Key 输入框的"显示/隐藏"切换
  const [showApiKey, setShowApiKey] = useState(false)

  /**
   * 当用户切换服务商时，自动同步填充 baseURL 与 defaultModel。
   * 如果当前服务商是 custom，则只清空，不强制写入。
   */
  const handleProviderChange = (event) => {
    const providerId = event.target.value
    const provider = findProvider(providerId)
    onChange({
      ...config,
      providerId,
      baseURL: provider ? provider.baseURL : '',
      model: provider ? provider.defaultModel : config.model,
    })
  }

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '15px',
        border: '1px solid #e5e4e7',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
      }}
    >
      <h3 style={{ marginTop: 0 }}>⚙️ API 配置</h3>

      <p
        style={{
          fontSize: '12px',
          color: '#6b6375',
          margin: '0 0 12px',
          padding: '8px',
          backgroundColor: '#fff7e6',
          border: '1px solid #ffd591',
          borderRadius: '4px',
        }}
      >
        🔒 你的 <strong>baseURL</strong> 与 <strong>API Key</strong> 仅保存在当前浏览器的
        localStorage 中，<strong>不会上传到任何服务器</strong>。请勿在公共设备上保存密钥。
      </p>

      {/* 服务商选择 */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}
        >
          服务商
        </label>
        <select
          value={config.providerId}
          onChange={handleProviderChange}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e5e4e7',
            backgroundColor: '#fff',
          }}
        >
          {PROVIDERS.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* baseURL */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}
        >
          Base URL
        </label>
        <input
          type="text"
          value={config.baseURL}
          onChange={(e) => onChange({ ...config, baseURL: e.target.value })}
          placeholder="https://api.openai.com/v1"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e5e4e7',
            fontFamily: 'ui-monospace, Consolas, monospace',
            fontSize: '13px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* API Key + 显示/隐藏切换 */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}
        >
          API Key
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
            placeholder="sk-..."
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #e5e4e7',
              fontFamily: 'ui-monospace, Consolas, monospace',
              fontSize: '13px',
            }}
          />
          <button
            type="button"
            onClick={() => setShowApiKey((prev) => !prev)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e5e4e7',
              borderRadius: '4px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {showApiKey ? '隐藏' : '显示'}
          </button>
        </div>
      </div>

      {/* 模型名（带 datalist 提供预置建议） */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}
        >
          模型名
        </label>
        <input
          type="text"
          list={`model-options-${config.providerId}`}
          value={config.model}
          onChange={(e) => onChange({ ...config, model: e.target.value })}
          placeholder="gpt-3.5-turbo"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e5e4e7',
            fontFamily: 'ui-monospace, Consolas, monospace',
            fontSize: '13px',
            boxSizing: 'border-box',
          }}
        />
        <datalist id={`model-options-${config.providerId}`}>
          {(findProvider(config.providerId)?.modelOptions || []).map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      {/* 温度滑块 */}
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}
        >
          温度参数: {Number(config.temperature).toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={config.temperature}
          onChange={(e) => onChange({ ...config, temperature: parseFloat(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onSave}
          style={{
            padding: '8px 16px',
            backgroundColor: '#aa3bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          💾 保存到本地
        </button>
        <button
          type="button"
          onClick={onClear}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            color: '#6b6375',
            border: '1px solid #e5e4e7',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          🗑️ 清除配置
        </button>
        {savedHint && (
          <span style={{ fontSize: '12px', color: '#52c41a' }}>{savedHint}</span>
        )}
      </div>
    </div>
  )
}

export default ApiConfigPanel

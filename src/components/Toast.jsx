/**
 * Toast 提示组件 —— 容器部分
 *
 * 业务背景:
 * SafeLink 等组件在用户点击占位 GitHub 链接时,需要友好提示
 * "请先将项目推送到您的 GitHub 仓库",而不是直接跳 404。
 *
 * 用法:
 *   - 在祖先组件中: <ToastProvider> 包裹
 *   - 任何后代: const { showToast } = useToast(); showToast('消息', 'warn')
 *
 * 与 useToast 的关系:
 *   - 本文件只导出 <ToastProvider /> 组件(react-refresh 要求)
 *   - useToast hook 在 useToast.js 单独导出
 */

import { useCallback, useState } from 'react'
import { ToastContext } from './useToast.js'
import './Toast.css'

/**
 * @typedef {'info' | 'success' | 'warn' | 'error'} ToastVariant
 */

/**
 * ToastProvider
 * 顶层包裹,把 showToast 注入到 context。
 *
 * @param {object}   props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  /**
   * 推入一条 toast,默认 3.5s 后自动消失
   *
   * @param {string} message  提示文案
   * @param {ToastVariant} [variant='info']  样式变体
   * @returns {string} toast id
   */
  const showToast = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
    return id
  }, [])

  /** 主动关闭某条 toast */
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="sx-toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`sx-toast sx-toast--${t.variant}`}
            onClick={() => dismissToast(t.id)}
            aria-label="关闭提示"
          >
            <span className="sx-toast__icon" aria-hidden="true">
              {t.variant === 'warn' && '⚠️'}
              {t.variant === 'error' && '⛔'}
              {t.variant === 'success' && '✅'}
              {t.variant === 'info' && 'ℹ️'}
            </span>
            <span className="sx-toast__msg">{t.message}</span>
            <span className="sx-toast__close" aria-hidden="true">
              ×
            </span>
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

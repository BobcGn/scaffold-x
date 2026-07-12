/**
 * Toast 上下文与 hook
 *
 * 与 Toast.jsx 拆开的原因:
 * react-refresh/only-export-components 规则要求 React 组件文件只能导出组件。
 * 把 useToast 抽到本 .js 文件后,Toast.jsx 就只导出 ToastProvider 一个组件。
 */

import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/**
 * useToast —— 消费 Toast 上下文
 *
 * @returns {{ showToast: (msg: string, variant?: ToastVariant) => string,
 *             dismissToast: (id: string) => void }}
 */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // 没有 Provider 时降级为 console.warn,避免在 SSR/测试场景崩溃
    return {
      showToast: (msg) => {
        console.warn('[Toast]', msg)
        return ''
      },
      dismissToast: () => {},
    }
  }
  return ctx
}

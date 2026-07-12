/**
 * 通用工具函数集合
 *
 * 与具体业务解耦的辅助函数集中放这里，方便跨组件复用，
 * 也避免在组件文件中导出非组件内容触发 react-refresh/only-export-components 规则。
 */

/**
 * 示例辅助函数。
 *
 * 修复说明：原本该函数被错误地导出在 `AiSandbox.jsx` 末尾，
 * 触发 ESLint 规则 `react-refresh/only-export-components`。
 * 正确做法是把它移到一个独立的 .js 文件中导出。
 *
 * @returns {string} 描述性字符串
 */
export const helperFunction = () => {
  return '这是一个辅助函数，已从 AiSandbox.jsx 移出，单独导出在 utils/helper.js'
}

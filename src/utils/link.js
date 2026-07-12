/**
 * 链接处理工具集
 *
 * 设计目标：
 *   把"GitHub 链接的拼接 + 仓库占位符检测 + 相对路径识别"集中到这里,
 *   UI 层只关心点击行为,不再散落各种 if/else。
 */

import { GITHUB_REPO_URL, isRepoPlaceholder } from '../config/const.js'

/**
 * 链接类别枚举
 */
export const LINK_KIND = {
  GITHUB_FILE: 'github_file', // GitHub 上的具体文件
  EXTERNAL: 'external', // 任意外部 URL
  INTERNAL: 'internal', // 站点内/同源/相对路径
  PLACEHOLDER: 'placeholder', // GitHub 占位符,点击需触发提示
}

/**
 * 识别一个 href 的类别
 *
 * @param {string} href 待识别的 href
 * @returns {keyof typeof LINK_KIND}
 */
export function classifyHref(href) {
  if (!href) return LINK_KIND.INTERNAL
  if (href.startsWith('http://') || href.startsWith('https://')) {
    // 来自 GITHUB_REPO_URL 的链接,若仓库仍是占位符,标记为 PLACEHOLDER
    if (href.startsWith(GITHUB_REPO_URL) && isRepoPlaceholder(GITHUB_REPO_URL)) {
      return LINK_KIND.PLACEHOLDER
    }
    return LINK_KIND.EXTERNAL
  }
  // 相对路径 / 站内锚点 / 空 / mailto / tel 都视为 internal
  return LINK_KIND.INTERNAL
}

/**
 * 解析 href,得到最终的导航目标
 *
 * @param {object} cta 漏斗节点中的 cta 对象 { label, href, kind? }
 * @returns {{ kind: string, finalHref: string, isPlaceholder: boolean, label: string }}
 */
export function resolveCta(cta) {
  const label = cta?.label || '查看'
  const href = cta?.href || ''
  // 调用方也可显式指定 kind(比如指向某个"靶场组件"而非文件)
  if (cta?.kind) {
    return {
      kind: cta.kind,
      finalHref: href,
      isPlaceholder: false,
      label,
    }
  }
  const kind = classifyHref(href)
  return {
    kind,
    finalHref: href,
    // 仅当目标是 PLACEHOLDER(占位 GitHub)时,isPlaceholder 为 true
    isPlaceholder: kind === LINK_KIND.PLACEHOLDER,
    label,
  }
}

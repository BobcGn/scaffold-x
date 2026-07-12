/**
 * SafeLink —— 安全的链接/按钮组件
 *
 * 业务背景：
 * 直接用 <a href="..."> 跳转 GitHub 占位链接会导致 404,
 * 体验极差。本组件统一处理三种场景:
 *
 *   1. 内部相对路径 / 锚点:走 React 状态/路由(由 onInternalClick 决定)
 *   2. 真实外部 URL:新窗口打开 + noopener noreferrer
 *   3. GitHub 占位符:拦截跳转,触发 Toast 提示
 *
 * Props:
 *   - cta: 漏斗节点中的 { label, href, kind?, onInternalClick? }
 *   - className: 透传样式
 *   - showToast: 来自 useToast() 的 showToast 函数
 *   - onInternalClick: 内部链接/靶场入口的自定义处理(可选)
 */

import { resolveCta } from '../utils/link.js'
import { useToast } from './useToast.js'

/**
 * 缺省占位提示语 —— 用户点 GitHub 占位链接时显示
 */
const PLACEHOLDER_HINT =
  '请先将项目推送到您的 GitHub 仓库以激活此链接。'

/**
 * SafeLink
 * 把"分类 + 拦截 + 渲染"三步封装到一个组件里,
 * 漏斗 CTA、卡片按钮、Footer 链接等都可复用。
 *
 * @param {object} props
 * @param {object} props.cta 漏斗节点 cta { label, href, kind?, onInternalClick? }
 * @param {string} [props.className] 透传 className
 * @param {function} [props.onInternalClick] 内部链接/靶场入口的自定义处理
 * @returns {JSX.Element}
 */
function SafeLink({ cta, className = '', onInternalClick }) {
  const { showToast } = useToast()
  const { kind, finalHref, isPlaceholder, label } = resolveCta(cta)

  // 统一 click 处理
  const handleClick = (e) => {
    if (kind === 'placeholder' || isPlaceholder) {
      // 阻止默认导航,弹 Toast
      e.preventDefault()
      showToast(PLACEHOLDER_HINT, 'warn')
      return
    }
    if (kind === 'internal' && typeof onInternalClick === 'function') {
      e.preventDefault()
      onInternalClick()
      return
    }
    // external: 走默认 <a target="_blank"> 行为,无需 preventDefault
  }

  // 内部链接渲染为 <button>(无 href),外部/占位符渲染为 <a>(便于右键复制)
  if (kind === 'internal' && typeof onInternalClick === 'function') {
    return (
      <button
        type="button"
        className={className}
        onClick={handleClick}
      >
        {label}
      </button>
    )
  }

  return (
    <a
      className={className}
      href={finalHref || '#'}
      onClick={handleClick}
      target={kind === 'external' ? '_blank' : undefined}
      rel={kind === 'external' ? 'noreferrer noopener' : undefined}
    >
      {label}
    </a>
  )
}

export default SafeLink

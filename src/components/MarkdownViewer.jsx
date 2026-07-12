/**
 * MarkdownViewer —— 本地 Markdown 安全渲染器
 *
 * 业务背景：
 * Vite 默认伺服 .md 静态文件时,缺少正确的 Content-Type / charset 头,
 * 直接跳转会触发两类问题:
 *   1. 浏览器按 GBK/系统默认编码解析,中文乱码
 *   2. 浏览器把 markdown 当作纯文本展示,出现 # / ** 等裸字符
 *
 * 本组件的解决思路:
 *   - 用 Vite 的 `?raw` 后缀把 .md 以 UTF-8 字符串形式打进 bundle,彻底规避乱码
 *   - 用 react-markdown + remark-gfm 渲染,支持 GFM(表格、任务列表、删除线等)
 *   - 用 className 透传样式,完美融入 Scaffold-X 暗色极客风
 *
 * 调用示例:
 *   import rawContent from '../docs/ARCHITECTURE.md?raw'
 *   <MarkdownViewer content={rawContent} title="架构设计" />
 */

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MarkdownViewer.css'

/**
 * 简单的字数与代码块统计,用于顶部 meta 信息条展示
 *
 * @param {string} text  原始 markdown 文本
 * @returns {{ chars: number, codeBlocks: number, headings: number }}
 */
function summarize(text) {
  if (!text) return { chars: 0, codeBlocks: 0, headings: 0 }
  const codeBlocks = (text.match(/```/g) || []).length / 2
  // 估算 # / ## / ### 标题数（每行以 # 开头）
  const headings = (text.match(/^#{1,6}\s+\S/gm) || []).length
  return { chars: text.length, codeBlocks, headings }
}

/**
 * MarkdownViewer
 * 渲染传入的 markdown 字符串为深色主题的 HTML。
 *
 * @param {object}   props
 * @param {string}   props.content   必填,markdown 原文(建议来自 `?raw` 导入)
 * @param {string}   [props.title]   可选,文档标题,展示在头部
 * @param {string}   [props.subtitle] 可选,文档副标题/版本号
 * @param {string}   [props.anchor]  可选,锚点 id,便于页面内定位
 * @returns {JSX.Element}
 */
function MarkdownViewer({ content, title, subtitle, anchor }) {
  // 派生统计信息,避免每次渲染重复计算
  const meta = useMemo(() => summarize(content), [content])

  return (
    <article
      id={anchor}
      className="sx-md"
      aria-label={title || 'Markdown 文档'}
    >
      {/* ---------- 头部:标题 + 元信息 ---------- */}
      {(title || subtitle) && (
        <header className="sx-md__header">
          {title && <h1 className="sx-md__title">{title}</h1>}
          {subtitle && <p className="sx-md__subtitle">{subtitle}</p>}
          <div className="sx-md__meta">
            <span className="sx-md__meta-item">
              <em>{meta.chars.toLocaleString()}</em> chars
            </span>
            <span className="sx-md__meta-dot" aria-hidden="true">
              •
            </span>
            <span className="sx-md__meta-item">
              <em>{meta.headings}</em> headings
            </span>
            <span className="sx-md__meta-dot" aria-hidden="true">
              •
            </span>
            <span className="sx-md__meta-item">
              <em>{meta.codeBlocks}</em> code blocks
            </span>
          </div>
        </header>
      )}

      {/* ---------- 正文:react-markdown 渲染 ---------- */}
      <div className="sx-md__body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // 显式禁用原生 html 解析,降低 XSS 风险(本项目内源文档可控)
          // skipHtml={false}
          components={{
            // 自定义链接渲染:外部链接自动在新窗口打开
            a: (props) => {
              const isExternal = /^https?:\/\//i.test(props.href || '')
              return (
                <a
                  {...props}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noreferrer noopener' : undefined}
                />
              )
            },
          }}
        >
          {content || ''}
        </ReactMarkdown>
      </div>
    </article>
  )
}

export default MarkdownViewer

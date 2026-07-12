/**
 * SandboxViewer —— 靶场实况引擎(分屏实战容器)
 *
 * 业务定位:
 * 把"任务说明(Markdown)"和"实操组件(Buggy Component)"并排呈现,
 * 解决之前"打开靶场只看到乱码 md"的问题。
 *
 * 布局策略:
 *   - 桌面端:左侧说明(md 渲染) + 右侧实操(目标组件)
 *   - 移动端:上下堆叠(说明在上,实操在下),保持阅读 → 操作的自然顺序
 *
 * Props:
 *   - title:       靶场名
 *   - tag:         分类标签
 *   - filePath:    靶子文件路径(头部 mono 字体展示)
 *   - instructionMd: 任务说明 markdown 字符串(由 ?raw 加载)
 *   - TargetComponent: 要渲染的目标组件(类/函数组件)
 *   - targetProps: 透传给 TargetComponent 的 props
 *   - onClose:    关闭按钮回调
 *   - meta:       自由扩展 meta 信息(难度 / 预计耗时)
 *   - sourceCode: 靶场源代码(用于代码编辑)
 *   - onCodeChange: 代码变更回调
 *   - onCommit: 提交回调
 */

import { useCallback, useState } from 'react'
import MarkdownViewer from './MarkdownViewer.jsx'
import CodeEditor from './CodeEditor.jsx'
import './SandboxViewer.css'

/**
 * SandboxViewer
 * 三栏布局:左侧 Markdown 说明 + 右侧实操组件 + 底部代码编辑器
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.tag]
 * @param {string} [props.filePath]
 * @param {string} [props.instructionMd]
 * @param {React.ComponentType} [props.TargetComponent]
 * @param {object} [props.targetProps={}]
 * @param {function} [props.onClose]
 * @param {Array<{label: string, value: string}>} [props.meta=[]]
 * @param {string} [props.sourceCode=''] 靶场源代码
 * @param {function} [props.onCodeChange] 代码变更回调
 * @param {function} [props.onCommit] 提交回调
 * @returns {JSX.Element}
 */
function SandboxViewer({
  title,
  tag,
  filePath,
  instructionMd,
  TargetComponent,
  targetProps = {},
  onClose,
  meta = [],
  sourceCode = '',
  onCodeChange,
  onCommit,
}) {
  const [showEditor, setShowEditor] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [isCommitting, setIsCommitting] = useState(false)
  const [commitStatus, setCommitStatus] = useState(null) // null | 'success' | 'error'
  const [commitError, setCommitError] = useState('')

  // 处理代码变更
  const handleCodeChange = useCallback((newCode) => {
    if (onCodeChange) {
      onCodeChange(newCode)
    }
  }, [onCodeChange])

  // 处理提交
  const handleCommit = useCallback(async () => {
    if (!commitMessage.trim() || !onCommit) return

    setIsCommitting(true)
    setCommitStatus(null)
    setCommitError('')

    try {
      await onCommit(commitMessage.trim())
      setCommitStatus('success')
      setCommitMessage('')
    } catch (err) {
      setCommitStatus('error')
      setCommitError(err.message || '提交失败')
    } finally {
      setIsCommitting(false)
    }
  }, [commitMessage, onCommit])

  // 复制代码到剪贴板
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sourceCode)
      alert('代码已复制到剪贴板!')
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = sourceCode
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('代码已复制到剪贴板!')
    }
  }, [sourceCode])

  return (
    <section className="sx-sandbox" aria-label="靶场实况">
      {/* ---------- 顶部工具条 ---------- */}
      <header className="sx-sandbox__bar">
        <div className="sx-sandbox__bar-left">
          {tag && <span className="sx-sandbox__tag">{tag}</span>}
          <h2 className="sx-sandbox__title">{title || 'Sandbox'}</h2>
          {filePath && (
            <code className="sx-sandbox__path">{filePath}</code>
          )}
        </div>
        <div className="sx-sandbox__bar-right">
          {meta.map((m) => (
            <span key={m.label} className="sx-sandbox__meta">
              <em>{m.label}:</em>
              {m.value}
            </span>
          ))}
          {sourceCode && (
            <button
              type="button"
              className={`sx-sandbox__toggle-editor ${showEditor ? 'is-active' : ''}`}
              onClick={() => setShowEditor(!showEditor)}
            >
              {showEditor ? '隐藏编辑器' : '编辑代码'}
            </button>
          )}
          {typeof onClose === 'function' && (
            <button
              type="button"
              className="sx-sandbox__close"
              onClick={onClose}
              aria-label="关闭靶场"
            >
              ✕ 退出靶场
            </button>
          )}
        </div>
      </header>

      {/* ---------- 分屏主体 ---------- */}
      <div className="sx-sandbox__split">
        {/* 左 / 上:任务说明 */}
        <div className="sx-sandbox__pane sx-sandbox__pane--brief">
          <div className="sx-sandbox__pane-head">
            <span className="sx-sandbox__pane-index">01</span>
            <span className="sx-sandbox__pane-label">任务说明</span>
            <span className="sx-sandbox__pane-hint">
              打开 {filePath || '对应文件'} 边读边修
            </span>
          </div>
          <div className="sx-sandbox__pane-body">
            {instructionMd ? (
              <MarkdownViewer content={instructionMd} />
            ) : (
              <p className="sx-sandbox__placeholder">
                暂无任务说明文档。
              </p>
            )}
          </div>
        </div>

        {/* 右 / 下:实操组件 */}
        <div className="sx-sandbox__pane sx-sandbox__pane--live">
          <div className="sx-sandbox__pane-head">
            <span className="sx-sandbox__pane-index">02</span>
            <span className="sx-sandbox__pane-label">实操靶子</span>
            <span className="sx-sandbox__pane-hint">
              右侧 React 组件故意保留了若干 ESLint / Hooks 报错
            </span>
          </div>
          <div className="sx-sandbox__pane-body sx-sandbox__pane-body--live">
            {TargetComponent ? (
              <TargetComponent {...targetProps} />
            ) : (
              <p className="sx-sandbox__placeholder">
                未挂载实操组件。
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ---------- 代码编辑器(可折叠) ---------- */}
      {showEditor && sourceCode && (
        <div className="sx-sandbox__editor-section">
          <div className="sx-sandbox__editor-header">
            <span className="sx-sandbox__editor-title">
              📝 代码编辑器
            </span>
            <div className="sx-sandbox__editor-actions">
              <button
                type="button"
                className="sx-sandbox__btn sx-sandbox__btn--ghost"
                onClick={handleCopyCode}
              >
                📋 复制代码
              </button>
            </div>
          </div>

          <CodeEditor
            value={sourceCode}
            onChange={handleCodeChange}
            language="jsx"
            fileName={filePath}
            showLineNumbers={true}
          />

          {/* 提交区域 */}
          {onCommit && (
            <div className="sx-sandbox__commit-section">
              <div className="sx-sandbox__commit-input-row">
                <input
                  type="text"
                  className="sx-sandbox__commit-input"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="输入提交信息 (如: fix: 修复 useState 条件调用问题)"
                  onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
                />
                <button
                  type="button"
                  className="sx-sandbox__btn sx-sandbox__btn--primary"
                  onClick={handleCommit}
                  disabled={!commitMessage.trim() || isCommitting}
                >
                  {isCommitting ? '提交中...' : '🚀 提交到 GitHub'}
                </button>
              </div>

              {commitStatus === 'success' && (
                <div className="sx-sandbox__commit-success">
                  ✅ 代码已成功提交! PR 已创建。
                </div>
              )}
              {commitStatus === 'error' && (
                <div className="sx-sandbox__commit-error">
                  ❌ 提交失败: {commitError}
                </div>
              )}

              <p className="sx-sandbox__commit-hint">
                提交将创建一个 Pull Request,等待维护者审核合并。
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default SandboxViewer

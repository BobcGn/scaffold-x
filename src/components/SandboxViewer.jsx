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
 */

import MarkdownViewer from './MarkdownViewer.jsx'
import './SandboxViewer.css'

/**
 * SandboxViewer
 * 双栏布局:左侧 Markdown 说明 + 右侧实操组件
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
}) {
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
    </section>
  )
}

export default SandboxViewer

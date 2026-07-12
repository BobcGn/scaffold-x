/**
 * Scaffold-X 主页 —— 漏斗式导航网关 + 文档中心 + 靶场实况
 *
 * 组件职责：
 *   1. 维护漏斗层级状态（L1 / L2 / L3 的当前选择 id）
 *   2. 把状态变化下发给 <FunnelSelector />
 *   3. 在状态变化时同步 URL hash，便于分享 / 浏览器后退
 *   4. 维护"当前正在查看的本地 Markdown 文档"状态
 *   5. 维护"当前正在进入的靶场"状态,异步加载并挂载到 <SandboxViewer />
 *   6. L3 卡片 CTA 点击由 handleCtaClick 统一分发:
 *        - kind: 'sandbox' → 打开 SandboxViewer
 *        - kind: 'doc'     → 打开 MarkdownViewer
 *        - kind: 'external' → 走 SafeLink(占位符时弹 Toast)
 *
 * 关于 MarkdownViewer 的关键点：
 *   - 使用 Vite 的 `?raw` 后缀把 .md 以 UTF-8 字符串形式打入 bundle
 *   - 彻底规避"浏览器直跳 .md"导致的两种问题:
 *       ① 缺 charset 头 → 中文乱码
 *       ② 浏览器把 md 当 text/plain → 显示 # / ** 原始字符
 */

import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useState,
} from 'react'
import HeroSection from './components/HeroSection.jsx'
import FunnelSelector from './components/FunnelSelector.jsx'
import MarkdownViewer from './components/MarkdownViewer.jsx'
import SandboxViewer from './components/SandboxViewer.jsx'
import { ToastProvider } from './components/Toast.jsx'
import SafeLink from './components/SafeLink.jsx'
import FUNNEL_DATA from './config/funnel.js'
// 通过 Vite 的 `?raw` 后缀安全加载 Markdown,UTF-8 字符串直接进入 bundle
import architectureDoc from '../docs/ARCHITECTURE.md?raw'
import aiStandardDoc from '../docs/ai-engineering-standard.md?raw'
import './App.css'

// 漏斗选择状态默认值：未选任何层级
const INITIAL_SELECTION = { l1: '', l2: '', l3: '' }

// 文档中心可查看的本地 md 清单 —— 这里集中维护,便于后续扩展
const DOC_LIBRARY = [
  {
    id: 'architecture',
    title: '架构设计文档',
    subtitle: 'MVP · v0.2.0 · 2026-07-08',
    fileName: 'ARCHITECTURE.md',
    content: architectureDoc,
  },
  {
    id: 'ai-standard',
    title: 'AI 工程化规范',
    subtitle: 'On-device / Multi-Agent · 内部规范',
    fileName: 'ai-engineering-standard.md',
    content: aiStandardDoc,
  },
]

// 靶场注册表(只取元数据,实操组件按需 dynamic import)
import { getSandbox } from './sandboxes/index.js'

/**
 * 把当前选择写入 location.hash(格式:#l1=xxx&l2=yyy&l3=zzz&sandbox=yyy&doc=yyy)
 *
 * @param {object} state 当前所有需要持久化到 url 的状态
 * @returns {void}
 */
function writeHash(state) {
  const params = new URLSearchParams()
  if (state.l1) params.set('l1', state.l1)
  if (state.l2) params.set('l2', state.l2)
  if (state.l3) params.set('l3', state.l3)
  if (state.sandboxId) params.set('sandbox', state.sandboxId)
  if (state.docId) params.set('doc', state.docId)
  const str = params.toString()
  const url = str ? `#${str}` : window.location.pathname
  // 使用 replaceState 避免污染浏览器历史栈
  window.history.replaceState(null, '', url)
}

/**
 * 从 location.hash 解析初始状态
 *
 * @returns {object}
 */
function readHash() {
  if (typeof window === 'undefined') {
    return { ...INITIAL_SELECTION, sandboxId: '', docId: '' }
  }
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return { ...INITIAL_SELECTION, sandboxId: '', docId: '' }
  const params = new URLSearchParams(hash)
  return {
    l1: params.get('l1') || '',
    l2: params.get('l2') || '',
    l3: params.get('l3') || '',
    sandboxId: params.get('sandbox') || '',
    docId: params.get('doc') || '',
  }
}

/**
 * 加载态占位 —— Suspense 触发时使用
 *
 * @returns {JSX.Element}
 */
function SandboxLoading() {
  return (
    <div className="sx-sandbox__loading">
      <span className="sx-sandbox__loading-spinner" aria-hidden="true" />
      <span>正在加载靶场实操组件…</span>
    </div>
  )
}

/**
 * 用 dynamic import 异步加载的"靶场实操组件"包装
 * 配合 React.lazy + Suspense 使用
 *
 * @param {object}   props
 * @param {string}   props.sandboxId  靶场 id
 * @returns {JSX.Element}
 */
function SandboxTargetLoader({ sandboxId }) {
  // 注意:Hooks 必须在 early-return 之前调用,否则会触发 react-hooks/rules-of-hooks
  const entry = sandboxId ? getSandbox(sandboxId) : null
  // 这里用 useState 缓存一个 lazy 组件实例,避免每次渲染重新创建
  // sandboxId 变化时才重新计算 lazy(否则一旦缓存就稳定)
  const [LazyComp] = useState(() => (entry ? lazy(entry.loadComponent) : null))
  if (!entry || !LazyComp) {
    return (
      <p className="sx-sandbox__placeholder">
        未找到 id 为 <code>{sandboxId}</code> 的靶场。
      </p>
    )
  }
  return (
    <Suspense fallback={<SandboxLoading />}>
      <LazyComp />
    </Suspense>
  )
}

/**
 * Scaffold-X 根组件
 *
 * @returns {JSX.Element}
 */
function App() {
  // 把 url hash 里的所有可还原状态合并到 useState 初始值
  const initial = readHash()
  const [selection, setSelection] = useState({
    l1: initial.l1,
    l2: initial.l2,
    l3: initial.l3,
  })
  // 当前在文档中心查看的文档 id
  const [activeDocId, setActiveDocId] = useState(initial.docId || null)
  // 当前激活的靶场 id
  const [activeSandboxId, setActiveSandboxId] = useState(
    initial.sandboxId || null
  )

  // 状态变化时同步 URL hash
  useEffect(() => {
    writeHash({
      l1: selection.l1,
      l2: selection.l2,
      l3: selection.l3,
      sandboxId: activeSandboxId || '',
      docId: activeDocId || '',
    })
  }, [selection, activeDocId, activeSandboxId])

  /**
   * 处理任意层级的选择事件
   *
   * @param {number} level 层级(1 / 2 / 3)
   * @param {object} node  选中的节点对象
   */
  const handleSelect = useCallback((level, node) => {
    setSelection((prev) => {
      // 切换一级时清空二 / 三级,避免出现孤儿状态
      if (level === 1) {
        return { l1: node.id, l2: '', l3: '' }
      }
      if (level === 2) {
        return { ...prev, l2: node.id, l3: '' }
      }
      // level === 3:记录最终靶场 id
      return { ...prev, l3: node.id }
    })
  }, [])

  /** 清空所有选择,回到漏斗顶端 */
  const handleReset = useCallback(() => {
    setSelection({ ...INITIAL_SELECTION })
  }, [])

  /**
   * 统一处理 L3 卡片 CTA 点击 —— 根据 cta.kind 分发到不同行为
   *
   * @param {object} cta   漏斗节点中的 cta
   * @param {object} _node 触发该 cta 的 L3 节点(暂未使用,保留以备扩展)
   */
  const handleCtaClick = useCallback((cta) => {
    if (!cta) return
    if (cta.kind === 'sandbox' && cta.sandboxId) {
      setActiveSandboxId(cta.sandboxId)
      setActiveDocId(null) // 互斥:进入靶场时关闭文档中心
      requestAnimationFrame(() => {
        document
          .getElementById('sx-sandbox-anchor')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }
    if (cta.kind === 'doc' && cta.docId) {
      setActiveDocId(cta.docId)
      setActiveSandboxId(null)
      requestAnimationFrame(() => {
        document
          .getElementById('sx-doc-viewer')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }
    // external / 无 kind:交给 SafeLink 逻辑在渲染时再处理
    // 这里直接打开新窗口(占位符检测交给 SafeLink 渲染时拦截)
    if (cta.href) {
      window.open(cta.href, '_blank', 'noopener,noreferrer')
    }
  }, [])

  /** 关闭文档中心,回到文档列表 */
  const handleCloseDoc = useCallback(() => setActiveDocId(null), [])

  /** 关闭靶场 */
  const handleCloseSandbox = useCallback(() => setActiveSandboxId(null), [])

  // 当前激活的文档 / 靶场对象
  const activeDoc = DOC_LIBRARY.find((d) => d.id === activeDocId) || null
  const activeSandbox = activeSandboxId ? getSandbox(activeSandboxId) : null

  return (
    <ToastProvider>
      <div className="sx-app">
        <main className="sx-app__main">
          <HeroSection />

          <FunnelSelector
            data={FUNNEL_DATA}
            selection={selection}
            onSelect={handleSelect}
            onReset={handleReset}
            onCtaClick={handleCtaClick}
          />

          {/* ---------- 靶场实况(有激活靶场时显示) ---------- */}
          {activeSandbox && (
            <div id="sx-sandbox-anchor" className="sx-sandbox-anchor">
              <SandboxViewer
                title={activeSandbox.title}
                tag={activeSandbox.tag}
                filePath={activeSandbox.filePath}
                instructionMd={activeSandbox.instructionMd}
                TargetComponent={() => (
                  <SandboxTargetLoader sandboxId={activeSandbox.id} />
                )}
                meta={activeSandbox.meta}
                onClose={handleCloseSandbox}
              />
            </div>
          )}

          {/* ---------- 文档中心 ---------- */}
          <section className="sx-docs" aria-label="文档中心">
            <div className="sx-docs__head">
              <h2 className="sx-docs__title">📚 文档中心</h2>
              <p className="sx-docs__hint">
                点击下方卡片,通过
                <code>import xxx from '?raw'</code>
                安全加载本地 Markdown 并实时渲染。
              </p>
            </div>

            {/* 文档列表 */}
            <div className="sx-docs__grid">
              {DOC_LIBRARY.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className={[
                    'sx-docs__card',
                    activeDocId === doc.id ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleCtaClick({
                    kind: 'doc',
                    docId: doc.id,
                  })}
                >
                  <span className="sx-docs__card-icon" aria-hidden="true">
                    📄
                  </span>
                  <span className="sx-docs__card-title">{doc.title}</span>
                  <span className="sx-docs__card-sub">{doc.subtitle}</span>
                  <span className="sx-docs__card-cta">
                    {activeDocId === doc.id ? '正在阅读' : '开始阅读 →'}
                  </span>
                </button>
              ))}
            </div>

            {/* 文档详情区:有激活文档时挂载 MarkdownViewer */}
            <div id="sx-doc-viewer" className="sx-docs__viewer">
              {activeDoc ? (
                <>
                  <div className="sx-docs__viewer-bar">
                    <span className="sx-docs__viewer-path">
                      docs/{activeDoc.fileName}
                    </span>
                    <button
                      type="button"
                      className="sx-docs__close"
                      onClick={handleCloseDoc}
                    >
                      ✕ 关闭
                    </button>
                  </div>
                  <MarkdownViewer
                    content={activeDoc.content}
                    title={activeDoc.title}
                    subtitle={activeDoc.subtitle}
                  />
                </>
              ) : (
                <p className="sx-docs__empty">
                  尚未选择文档。点击上方任意卡片即可在此处实时渲染。
                </p>
              )}
            </div>
          </section>
        </main>
        <footer className="sx-app__footer">
          <span>Scaffold-X · MIT License</span>
          {/* footer 的 GitHub 链接也走 SafeLink:
              仓库占位时会自动弹 Toast,而不会跳到 404 */}
          <SafeLink
            cta={{
              kind: 'external',
              href: 'https://github.com/scaffold-x/scaffold-x',
              label: 'GitHub →',
            }}
            className="sx-app__footer-link"
          />
        </footer>
      </div>
    </ToastProvider>
  )
}

export default App

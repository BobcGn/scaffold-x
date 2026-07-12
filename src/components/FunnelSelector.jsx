/**
 * 漏斗式选择器组件（Funnel Selector）
 *
 * 业务说明：
 * Scaffold-X 主页的核心交互 —— 用户从一级大类（领域）逐级下钻到具体的工程靶场。
 * 每完成一级选择，下一级选项以平滑过渡（CSS fade + slide）展开。
 *
 * 设计要点：
 * 1. 状态全部由父组件通过 props 传入并通过 onChange 回传，组件本身保持无业务状态，
 *    便于父级按需持久化（localStorage / URL hash）。
 * 2. 节点统一数据结构参见 src/config/funnel.js
 *    - L1: { id, title, desc, status, children: L2[] }
 *    - L2: { id, title, desc, children: L3[] }
 *    - L3: { id, tag, title, desc, cta: { label, href|kind|sandboxId|docId } }
 * 3. status === 'wip' 的 L1 节点在 UI 上整体置灰、不可点击，并打上 "WIP" 角标。
 * 4. L3 卡片的点击行为交给父级：父级传入 onCtaClick(cta, node)，
 *    由父级根据 cta.kind 决定打开 Sandbox / 渲染 Markdown / 走 SafeLink。
 */

import { useMemo } from 'react'

/**
 * 查找指定 id 的 L1 节点
 *
 * @param {Array} data   漏斗全量数据
 * @param {string} id    待查找的一级 id
 * @returns {object|undefined} 命中的 L1 节点，未命中返回 undefined
 */
function findL1(data, id) {
  return data.find((node) => node.id === id)
}

/**
 * 查找指定 L1 下的 L2 节点
 *
 * @param {Array} data   漏斗全量数据
 * @param {string} l1Id  一级 id
 * @param {string} l2Id  二级 id
 * @returns {object|undefined} 命中的 L2 节点，未命中返回 undefined
 */
function findL2(data, l1Id, l2Id) {
  const l1 = findL1(data, l1Id)
  if (!l1 || !Array.isArray(l1.children)) return undefined
  return l1.children.find((node) => node.id === l2Id)
}

/**
 * 通用卡片按钮 —— 渲染 L1 / L2 的可选项
 *
 * @param {object}   props
 * @param {object}   props.node       待渲染的节点
 * @param {number}   props.level      层级（1 / 2），仅用于样式修饰
 * @param {boolean}  props.active     是否处于已选中状态
 * @param {boolean}  props.disabled   是否禁用（WIP 节点）
 * @param {function} props.onSelect   点击回调
 * @returns {JSX.Element}
 */
function ChoiceCard({ node, level, active, disabled, onSelect }) {
  const className = [
    'sx-choice',
    `sx-choice--l${level}`,
    active ? 'is-active' : '',
    disabled ? 'is-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={className}
      onClick={() => !disabled && onSelect?.(node)}
      disabled={disabled}
      aria-pressed={active}
    >
      <span className="sx-choice__title">{node.title}</span>
      {node.desc && <span className="sx-choice__desc">{node.desc}</span>}
      {disabled && <span className="sx-choice__badge">WIP</span>}
    </button>
  )
}

/**
 * L3 落地靶场卡片 —— 包含行动号召按钮
 *
 * @param {object}  props
 * @param {object}  props.node        L3 节点
 * @param {function} [props.onCtaClick] 点击 CTA 时的回调 (cta, node) => void
 * @returns {JSX.Element}
 */
function TargetCard({ node, onCtaClick }) {
  const { tag, title, desc, cta } = node
  return (
    <article className="sx-target">
      {tag && <span className="sx-target__tag">{tag}</span>}
      <h3 className="sx-target__title">{title}</h3>
      <p className="sx-target__desc">{desc}</p>
      {cta && (
        <button
          type="button"
          className="sx-target__cta"
          onClick={() => onCtaClick?.(cta, node)}
        >
          {cta.label}
          <span className="sx-target__cta-arrow" aria-hidden="true">
            →
          </span>
        </button>
      )}
    </article>
  )
}

/**
 * 漏斗选择器（无状态受控组件）
 *
 * @param {object}   props
 * @param {Array}    props.data       漏斗数据源
 * @param {object}   props.selection  当前选择 { l1, l2, l3 }
 * @param {function} props.onSelect   选中事件回调 (level, node) => void
 * @param {function} props.onReset    重置按钮回调
 * @param {function} [props.onCtaClick] L3 卡片 CTA 点击回调 (cta, node) => void
 * @returns {JSX.Element}
 */
function FunnelSelector({ data, selection, onSelect, onReset, onCtaClick }) {
  // 派生数据：根据当前 selection 取出各级节点
  const l1Node = useMemo(
    () => (selection.l1 ? findL1(data, selection.l1) : null),
    [data, selection.l1]
  )
  const l2Node = useMemo(
    () =>
      selection.l1 && selection.l2
        ? findL2(data, selection.l1, selection.l2)
        : null,
    [data, selection.l1, selection.l2]
  )

  // 是否已选到 L3，控制结果区是否展示
  const reachedL3 = Boolean(selection.l1 && selection.l2 && selection.l3)

  return (
    <section className="sx-funnel" aria-label="漏斗式导航">
      {/* ---------- Step 1: 一级大类 ---------- */}
      <div className="sx-step">
        <div className="sx-step__head">
          <span className="sx-step__index">01</span>
          <h2 className="sx-step__title">选择一个领域</h2>
        </div>
        <div className="sx-step__grid sx-step__grid--l1">
          {data.map((node) => (
            <ChoiceCard
              key={node.id}
              node={node}
              level={1}
              active={selection.l1 === node.id}
              disabled={node.status === 'wip'}
              onSelect={(n) => onSelect(1, n)}
            />
          ))}
        </div>
      </div>

      {/* ---------- Step 2: 二级子方向（仅当选完 L1 且 L1 可用时出现） ---------- */}
      {l1Node && l1Node.status !== 'wip' && (
        <div className="sx-step sx-step--enter" key={`step-l2-${l1Node.id}`}>
          <div className="sx-step__head">
            <span className="sx-step__index">02</span>
            <h2 className="sx-step__title">
              在 <em>{l1Node.title}</em> 下选择方向
            </h2>
          </div>
          <div className="sx-step__grid sx-step__grid--l2">
            {l1Node.children.map((node) => (
              <ChoiceCard
                key={node.id}
                node={node}
                level={2}
                active={selection.l2 === node.id}
                onSelect={(n) => onSelect(2, n)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ---------- Step 3: 落地靶场 ---------- */}
      {l2Node && (
        <div className="sx-step sx-step--enter" key={`step-l3-${l2Node.id}`}>
          <div className="sx-step__head">
            <span className="sx-step__index">03</span>
            <h2 className="sx-step__title">
              进入 <em>{l2Node.title}</em> · 落地靶场
            </h2>
          </div>
          <div className="sx-step__grid sx-step__grid--l3">
            {l2Node.children.map((node) => (
              // L3 直接以"靶场列表"形式展示，每个卡片自包含 cta，不需要选中态
              <TargetCard key={node.id} node={node} onCtaClick={onCtaClick} />
            ))}
          </div>
        </div>
      )}

      {/* ---------- 操作条：重置选择 ---------- */}
      {(selection.l1 || selection.l2 || selection.l3) && (
        <div className="sx-funnel__actions">
          <button
            type="button"
            className="sx-funnel__reset"
            onClick={onReset}
          >
            ↺ 重置选择
          </button>
          {reachedL3 && (
            <span className="sx-funnel__hint">
              你已抵达漏斗底部 —— 现在动手开干 🚀
            </span>
          )}
        </div>
      )}
    </section>
  )
}

export default FunnelSelector

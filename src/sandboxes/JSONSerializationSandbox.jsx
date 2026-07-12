/**
 * ⚠️ 沙盒训练靶子 #1 —— JSON 序列化策略实战
 *
 * 业务背景：
 * 模拟"kotlinx.serialization 在 KMP 多端共享中的崩溃防御"场景，
 * 让用户动手修复若干 ESLint / React Hooks 报错,以熟悉规则。
 *
 * 靶子里故意保留 4 类典型错误:
 *   1. 未使用的 import / 变量 (no-unused-vars)
 *   2. useMemo 依赖数组缺失 (react-hooks/exhaustive-deps)
 *   3. 条件性 useState 调用 (react-hooks/rules-of-hooks)
 *   4. 对象 prop 的稳定引用(每次渲染产生新对象 → 子组件无意义 re-render)
 *
 * ⚠️ 本文件已被 eslint.config.js 的 globalIgnores 排除在 lint 之外,
 * 否则 CI 会卡在 PR 上。新加入的贡献者正是要修复这里,
 * 然后在编辑器里看到红波浪线 / 终端跑 `npx eslint src/sandboxes` 看到报错。
 */

import { useEffect, useMemo, useState } from 'react'

/* ===== 模拟"Kotlin 序列化注解"的纯前端类型 ===== */
const USER_SCHEMA_VERSION = 1
const KNOWN_KEYS = new Set(['id', 'name', 'age', 'email'])

/**
 * 解析用户提交的不受信任 JSON 字符串 —— 模拟服务端反序列化的入口
 *
 * @param {string} raw 来自客户端的 raw JSON
 * @returns {{ ok: true, data: object } | { ok: false, error: string }}
 */
function safeParseUser(raw) {
  try {
    const obj = JSON.parse(raw)
    if (typeof obj !== 'object' || obj === null) {
      return { ok: false, error: '反序列化失败：payload 不是对象' }
    }
    // 过滤未声明的字段,防止版本演进后下游崩溃
    const filtered = {}
    for (const k of Object.keys(obj)) {
      if (KNOWN_KEYS.has(k)) filtered[k] = obj[k]
    }
    if (typeof filtered.id !== 'string' || filtered.id.length === 0) {
      return { ok: false, error: '反序列化失败：缺少必填字段 id' }
    }
    filtered.__schemaVersion = USER_SCHEMA_VERSION
    return { ok: true, data: filtered }
  } catch (e) {
    return { ok: false, error: `JSON.parse 抛出：${e.message}` }
  }
}

/**
 * 故意写错的"载荷"对象 —— 每次渲染都会得到一个新的引用,触发下方子组件重渲
 * (修复方向:用 useMemo 或抽到组件外)
 */
const defaultPayload = {
  raw: JSON.stringify(
    { id: 'u_001', name: 'Alice', age: 28, extraField: '应该被剔除' },
    null,
    2
  ),
}

/**
 * 故意写错的"配置 options"对象 —— 同 defaultPayload 的问题
 */
const parseOptions = { strict: true, ignoreUnknown: false }

function JsonParseResult({ result }) {
  // 修复点 1:result 可能为 undefined,这里要加默认值/空态
  return (
    <pre className="sx-sandbox__output">
      {result ? JSON.stringify(result, null, 2) : '(等待解析)'}
    </pre>
  )
}

function JSONSerializationSandbox() {
  const [raw, setRaw] = useState(defaultPayload.raw)
  const [result, setResult] = useState(null)

  // ===== 修复点 2:useMemo 依赖缺失 =====
  // 这里用 useMemo 缓存"解析配置",但 deps 为空,eslint 会报
  // 修复:把依赖补全为 [parseOptions]
  const opts = useMemo(() => {
    return { ...parseOptions, schema: USER_SCHEMA_VERSION }
  }, [])

  // ===== 修复点 3:条件性 useState =====
  // eslint 会报 react-hooks/rules-of-hooks
  // 修复:把 useState 提到条件块外部统一调用
  if (opts.strict) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [_flag, setFlag] = useState(false)
    setFlag(false)
  }

  // 解析按钮
  const handleParse = () => {
    setResult(safeParseUser(raw))
  }

  // 故意声明一个"未使用变量"演示 no-unused-vars
  // eslint-disable-next-line no-unused-vars
  const unusedLogger = (msg) => `[unused] ${msg}`

  // ===== 修复点 4:useEffect 依赖缺失 =====
  useEffect(() => {
    // 当 raw 变化时自动重新解析,真正"流式"
    setResult(safeParseUser(raw))
    // 缺依赖 [raw],会导致 raw 变化时 useEffect 拿到的永远是初始 raw
  }, [])

  return (
    <div className="sx-sandbox__demo">
      <h4 className="sx-sandbox__demo-title">
        🧪 JSON 反序列化沙盒(待修复)
      </h4>

      <label className="sx-sandbox__label">
        原始 JSON 字符串
        <textarea
          className="sx-sandbox__textarea"
          rows={6}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
      </label>

      <div className="sx-sandbox__actions">
        <button
          type="button"
          className="sx-sandbox__btn"
          onClick={handleParse}
        >
          ▶ 安全解析
        </button>
        <button
          type="button"
          className="sx-sandbox__btn sx-sandbox__btn--ghost"
          onClick={() =>
            setRaw(
              JSON.stringify(
                { id: '', name: 'Bob', age: -1, extraField: 'X' },
                null,
                2
              )
            )
          }
        >
          注入坏数据
        </button>
      </div>

      <JsonParseResult result={result} />
    </div>
  )
}

export default JSONSerializationSandbox

/**
 * 沙盒训练靶子 #1 —— JSON 序列化策略实战（已修复）
 *
 * 业务背景：
 * 模拟"kotlinx.serialization 在 KMP 多端共享中的崩溃防御"场景，
 * 让用户动手修复若干 ESLint / React Hooks 报错,以熟悉规则。
 *
 * 已修复的典型错误:
 *   1. 未使用的 import / 变量 (no-unused-vars) → 已删除
 *   2. useMemo 依赖数组缺失 (react-hooks/exhaustive-deps) → 已补全
 *   3. 条件性 useState 调用 (react-hooks/rules-of-hooks) → 已移除
 *   4. useEffect 依赖缺失 → 已改为派生计算
 */

import { useMemo, useState } from 'react'

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

  // 修复点 4:改用 useMemo 派生 result,避免 useEffect + setState 级联渲染
  const result = useMemo(() => safeParseUser(raw), [raw])

  return (
    <div className="sx-sandbox__demo">
      <h4 className="sx-sandbox__demo-title">
        🧪 JSON 反序列化沙盒
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
          disabled
          title="输入内容会自动解析"
        >
          ▶ 自动解析中
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

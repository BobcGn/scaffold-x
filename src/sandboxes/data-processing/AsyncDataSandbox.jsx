/**
 * 沙盒训练靶子 #3 —— 异步数据处理实战
 *
 * 业务背景：
 * 模拟"从 API 获取用户列表"场景，练习 async/await、错误处理、加载状态。
 *
 * 靶子里故意保留 4 类典型错误:
 *   1. useEffect 中未处理异步错误
 *   2. 内存泄漏:组件卸载后仍尝试 setState
 *   3. 并发请求竞态条件
 *   4. 缺少 loading / error 状态的正确清理
 *
 * 修复提示：
 *   - 使用 AbortController 取消请求
 *   - 使用 isMounted 标志位或 cleanup 函数
 *   - 使用 ignore 标志处理竞态条件
 */

import { useEffect, useState } from 'react'

/* ===== 模拟 API ===== */
const MOCK_USERS = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' },
  { id: 4, name: 'Diana', email: 'diana@example.com', role: 'moderator' },
  { id: 5, name: 'Eve', email: 'eve@example.com', role: 'user' },
]

/**
 * 模拟 API 请求——返回用户列表
 * @param {AbortSignal} signal 可选的 AbortSignal
 * @returns {Promise<Array>}
 */
async function fetchUsers(signal) {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800))

  // 模拟 30% 概率失败
  if (Math.random() < 0.3) {
    throw new Error('网络错误:无法连接到服务器')
  }

  return MOCK_USERS
}

/**
 * 模拟 API 请求——根据 ID 获取单个用户
 * @param {number} id
 * @returns {Promise<object>}
 */
async function fetchUserById(id) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const user = MOCK_USERS.find((u) => u.id === id)
  if (!user) throw new Error(`用户 ${id} 不存在`)
  return user
}

/* ===== 子组件 ===== */

function UserCard({ user, onSelect }) {
  return (
    <div className="sx-sandbox__user-card">
      <div className="sx-sandbox__user-avatar">
        {user.name.charAt(0)}
      </div>
      <div className="sx-sandbox__user-info">
        <strong>{user.name}</strong>
        <span className="sx-sandbox__user-email">{user.email}</span>
        <span className={`sx-sandbox__user-role role-${user.role}`}>
          {user.role}
        </span>
      </div>
      <button
        type="button"
        className="sx-sandbox__btn sx-sandbox__btn--sm"
        onClick={() => onSelect(user)}
      >
        查看详情
      </button>
    </div>
  )
}

function UserDetail({ user, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUserById(user.id)
        // 修复点 1:未检查组件是否已卸载
        if (!cancelled) {
          setDetail(data)
        }
      } catch (err) {
        // 修复点 2:未检查 cancelled 就 setState
        setError(err.message)
      } finally {
        // 修复点 3:未检查 cancelled 就 setState
        setLoading(false)
      }
    }

    load()

    // 修复点 4:缺少 cleanup 函数
  }, [user.id])

  return (
    <div className="sx-sandbox__detail-panel">
      <div className="sx-sandbox__detail-header">
        <h4>用户详情</h4>
        <button type="button" className="sx-sandbox__close" onClick={onClose}>
          ×
        </button>
      </div>
      {loading && <p className="sx-sandbox__loading-text">加载中...</p>}
      {error && <p className="sx-sandbox__error-text">错误:{error}</p>}
      {detail && (
        <div className="sx-sandbox__detail-content">
          <p><strong>姓名:</strong>{detail.name}</p>
          <p><strong>邮箱:</strong>{detail.email}</p>
          <p><strong>角色:</strong>{detail.role}</p>
          <p><strong>ID:</strong>{detail.id}</p>
        </div>
      )}
    </div>
  )
}

/* ===== 主组件 ===== */

function AsyncDataSandbox() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadUsers() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUsers()
        // 未使用 ignore 标志——竞态条件
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()

    // 修复点:缺少 cleanup 函数取消 ignore
  }, [])

  const handleRefresh = () => {
    // 修复点:直接调用 fetchUsers 但未处理竞态
    setLoading(true)
    fetchUsers().then((data) => {
      setUsers(data)
      setLoading(false)
    })
  }

  return (
    <div className="sx-sandbox__demo">
      <h4 className="sx-sandbox__demo-title">
        🔄 异步数据处理沙盒（待修复）
      </h4>

      <div className="sx-sandbox__toolbar">
        <button
          type="button"
          className="sx-sandbox__btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? '加载中...' : '刷新数据'}
        </button>
        <span className="sx-sandbox__hint">
          点击"查看详情"可测试并发请求
        </span>
      </div>

      {error && (
        <div className="sx-sandbox__error-banner">
          ⚠️ {error}
        </div>
      )}

      <div className="sx-sandbox__content-split">
        <div className="sx-sandbox__user-list">
          {loading && users.length === 0 ? (
            <p className="sx-sandbox__loading-text">加载用户列表...</p>
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onSelect={setSelectedUser}
              />
            ))
          )}
        </div>

        {selectedUser && (
          <UserDetail
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </div>
  )
}

export default AsyncDataSandbox

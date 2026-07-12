/**
 * 沙盒训练靶子 #2 —— React 状态管理实战
 *
 * 业务背景：
 * 模拟"Todo List 状态管理"场景，练习 useState / useReducer / useContext。
 *
 * 靶子里故意保留 4 类典型错误:
 *   1. 直接修改 state 对象 (mutation)
 *   2. useState 依赖前一个 state 但未使用函数式更新
 *   3. Context 值不稳定导致不必要重渲染
 *   4. 缺少 key 导致列表项状态错乱
 *
 * 修复提示：
 *   - 使用展开运算符创建新对象 instead of 直接修改
 *   - 使用 setState(prev => ...) 函数式更新
 *   - 使用 useMemo 稳定 Context 值
 *   - 为列表项添加稳定的 key
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/* ===== 模拟后端 ID 生成器 ===== */
let nextId = 100
const generateId = () => `todo_${nextId++}`

/* ===== TodoContext ===== */
const TodoContext = createContext(null)

/**
 * TodoProvider —— 提供全局 Todo 状态
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
function TodoProvider({ children }) {
  const [todos, setTodos] = useState([
    { id: 'todo_1', text: '学习 React Hooks', done: true },
    { id: 'todo_2', text: '修复 ESLint 错误', done: false },
    { id: 'todo_3', text: '提交第一个 PR', done: false },
  ])
  const [filter, setFilter] = useState('all') // all | active | completed

  // ===== 修复点 1:直接修改 state 对象 =====
  // ESLint: no-param-reassign / 模式告警
  // 修复: 使用展开运算符创建新对象
  const addTodo = useCallback((text) => {
    const newTodo = { id: generateId(), text, done: false }
    // 错误: 直接 push 到原数组
    todos.push(newTodo)
    setTodos(todos)
  }, [todos])

  // ===== 修复点 2:未使用函数式更新 =====
  // 当依赖前一个 state 时,应使用 setState(prev => ...)
  const toggleTodo = useCallback((id) => {
    // 错误: 直接修改原对象
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      todo.done = !todo.done
      setTodos([...todos])
    }
  }, [todos])

  // ===== 修复点 3:Context 值不稳定 =====
  // 每次渲染都创建新对象,导致所有消费者重渲染
  const removeTodo = useCallback((id) => {
    setTodos(todos.filter((t) => t.id !== id))
  }, [todos])

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done)
    if (filter === 'completed') return todos.filter((t) => t.done)
    return todos
  }, [todos, filter])

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter((t) => !t.done).length,
    completed: todos.filter((t) => t.done).length,
  }), [todos])

  // 错误: 每次渲染都创建新的 contextValue 对象
  const contextValue = {
    todos: filteredTodos,
    filter,
    stats,
    addTodo,
    toggleTodo,
    removeTodo,
    setFilter,
  }

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  )
}

/* ===== 子组件 ===== */

function TodoInput() {
  const [text, setText] = useState('')
  const { addTodo } = useContext(TodoContext)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim()) {
      addTodo(text.trim())
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sx-sandbox__input-row">
      <input
        type="text"
        className="sx-sandbox__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="添加新任务..."
      />
      <button type="submit" className="sx-sandbox__btn">
        添加
      </button>
    </form>
  )
}

function TodoFilter() {
  const { filter, setFilter, stats } = useContext(TodoContext)
  const filters = ['all', 'active', 'completed']

  return (
    <div className="sx-sandbox__filter-row">
      <div className="sx-sandbox__filter-btns">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            className={`sx-sandbox__filter-btn ${filter === f ? 'is-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>
      <span className="sx-sandbox__filter-stats">
        {stats.active} 项待完成 / {stats.total} 项总计
      </span>
    </div>
  )
}

function TodoItem({ todo }) {
  const { toggleTodo, removeTodo } = useContext(TodoContext)

  return (
    <li className="sx-sandbox__todo-item">
      <label className="sx-sandbox__todo-label">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => toggleTodo(todo.id)}
          className="sx-sandbox__todo-checkbox"
        />
        <span className={todo.done ? 'is-done' : ''}>
          {todo.text}
        </span>
      </label>
      <button
        type="button"
        className="sx-sandbox__todo-remove"
        onClick={() => removeTodo(todo.id)}
        aria-label="删除"
      >
        ×
      </button>
    </li>
  )
}

function TodoList() {
  const { todos } = useContext(TodoContext)

  if (todos.length === 0) {
    return <p className="sx-sandbox__empty">暂无任务</p>
  }

  return (
    <ul className="sx-sandbox__todo-list">
      {/* 修复点 4:缺少 key prop */}
      {todos.map((todo) => (
        <TodoItem todo={todo} />
      ))}
    </ul>
  )
}

/* ===== 主组件 ===== */

function StateManagerSandbox() {
  return (
    <div className="sx-sandbox__demo">
      <h4 className="sx-sandbox__demo-title">
        📋 React 状态管理沙盒（待修复）
      </h4>
      <TodoProvider>
        <TodoInput />
        <TodoFilter />
        <TodoList />
      </TodoProvider>
    </div>
  )
}

export default StateManagerSandbox

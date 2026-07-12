# 🎯 任务:React 状态管理实战

> 靶场文件:`src/sandboxes/StateManagerSandbox.jsx`
> 预计耗时:20 ~ 30 分钟 · 难度:⭐⭐☆

## 背景

在 React 应用中,状态管理是最核心的概念之一。
本靶场模拟一个 Todo List 应用,故意保留了 4 类常见错误,
让你熟悉 React 状态管理的最佳实践。

## 任务清单(请按顺序完成)

- [ ] **任务 1:修复直接修改 state 的错误**
  - 找到 `addTodo` 函数中的 `todos.push(newTodo)`
  - ESLint 模式:`no-param-reassign` / 直接 mutation
  - 修复:使用 `setTodos(prev => [...prev, newTodo])` 函数式更新

- [ ] **任务 2:修复 toggleTodo 的 mutation 问题**
  - 找到 `toggleTodo` 函数中的 `todo.done = !todo.done`
  - 修复:使用 `setTodos(prev => prev.map(...))` 创建新数组

- [ ] **任务 3:稳定 Context 值**
  - 找到 `contextValue` 对象——每次渲染都创建新引用
  - 修复:用 `useMemo` 包裹 `contextValue`,依赖所有子值

- [ ] **任务 4:为列表项添加 key**
  - 找到 `TodoList` 中的 `{todos.map((todo) => (<TodoItem todo={todo} />))}`
  - 修复:添加 `key={todo.id}`

- [ ] **任务 5(进阶):移除 removeTodo 的 todos 依赖**
  - 当前 `removeTodo` 依赖 `todos`,每次数组变化都重建
  - 修复:使用 `setTodos(prev => prev.filter(...))` 函数式更新

## 完成判据

- [ ] `npx eslint --no-ignore src/sandboxes/StateManagerSandbox.jsx` **0 error**
- [ ] 添加新任务后,列表立即更新(说明 state 正确)
- [ ] 切换 filter 时,已完成/未完成状态不丢失
- [ ] 删除任务后,列表正确更新

## 参考资料

- [React 状态管理最佳实践](https://react.dev/learn/updating-objects-in-state)
- [useReducer 官方文档](https://react.dev/reference/react/useReducer)
- [Context 性能优化](https://react.dev/reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions)

# 🎯 任务:异步数据处理实战

> 靶场文件:`src/sandboxes/AsyncDataSandbox.jsx`
> 预计耗时:20 ~ 30 分钟 · 难度:⭐⭐☆

## 背景

在 React 应用中,异步数据获取是最常见的操作之一。
本靶场模拟一个用户列表应用,故意保留了 4 类常见的异步处理错误,
让你熟悉 AbortController、竞态条件处理和内存泄漏防护。

## 任务清单(请按顺序完成)

- [ ] **任务 1:为 useEffect 添加 cleanup 函数**
  - 找到 `UserDetail` 组件中的 `useEffect`
  - 修复:在 effect 开头声明 `let cancelled = false`,在 cleanup 中设置 `cancelled = true`
  - 确保所有 `setState` 调用前都检查 `!cancelled`

- [ ] **任务 2:修复竞态条件**
  - 找到 `AsyncDataSandbox` 中的 `useEffect`
  - 修复:使用 `ignore` 标志,在 cleanup 中设置 `ignore = true`
  - 在 `setUsers` 前检查 `if (!ignore)`

- [ ] **任务 3:使用 AbortController 取消请求**
  - 修改 `fetchUsers` 函数,接收 `AbortSignal`
  - 在 `useEffect` 中创建 `AbortController`,传给 fetch 函数
  - 在 cleanup 中调用 `controller.abort()`

- [ ] **任务 4:修复 handleRefresh 的竞态问题**
  - 当前 `handleRefresh` 直接调用 `fetchUsers` 但未处理并发
  - 修复:使用 `AbortController` 或添加 ignore 标志

- [ ] **任务 5(进阶):添加请求去重**
  - 快速点击"刷新"会触发多次请求
  - 修复:使用 `useRef` 跟踪当前请求 ID,忽略过期响应

## 完成判据

- [ ] `npx eslint --no-ignore src/sandboxes/AsyncDataSandbox.jsx` **0 error**
- [ ] 快速切换用户详情时,不会显示旧用户的错误
- [ ] 组件卸载后,控制台无 "Can't perform a React state update" 警告
- [ ] 快速点击"刷新"时,不会出现列表闪烁

## 参考资料

- [处理异步效应](https://react.dev/learn/synchronizing-with-effects#step-3-add-cleanup-if-needed)
- [竞态条件处理](https://react.dev/learn/you-might-not-need-an-effect#fetching-data)
- [AbortController MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)

# 🎯 任务:表单验证实战

> 靶场文件:`src/sandboxes/react-patterns/FormValidationSandbox.jsx`
> 预计耗时:15 ~ 25 分钟 · 难度:⭐☆☆

## 背景

表单处理是前端开发中最常见的任务之一。
本靶场模拟一个用户注册表单,故意保留了 4 类常见的表单处理错误,
让你熟悉受控组件、验证逻辑和状态管理。

## 任务清单(请按顺序完成)

- [ ] **任务 1:修复直接修改 state 的错误**
  - 找到 `handleChange` 函数中的 `formData[name] = value`
  - 修复:使用 `setFormData(prev => ({ ...prev, [name]: value }))`

- [ ] **任务 2:使用 useMemo 缓存验证结果**
  - 找到每次渲染都重新计算的 `errors` 对象
  - 修复:用 `useMemo` 包裹,依赖 `[formData]`

- [ ] **任务 3:提交成功后清理表单**
  - 找到 `handleSubmit` 中的 `setSubmitStatus('success')`
  - 修复:在设置成功状态后,延迟清理表单或添加"重新注册"按钮

- [ ] **任务 4:设置提交错误状态**
  - 找到 `handleSubmit` 中的 `if (!isValid) { return }`
  - 修复:在 return 前添加 `setSubmitStatus('error')`

- [ ] **任务 5(进阶):添加防抖验证**
  - 当前每次输入都触发验证
  - 修复:使用 `useEffect` + `setTimeout` 实现 300ms 防抖

## 完成判据

- [ ] `npx eslint --no-ignore src/sandboxes/react-patterns/FormValidationSandbox.jsx` **0 error**
- [ ] 输入非法字符时,错误提示立即显示
- [ ] 提交成功后,表单被清空
- [ ] 密码强度指示器正确反映密码复杂度

## 参考资料

- [受控组件官方文档](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
- [表单验证最佳实践](https://react.dev/learn/reacting-to-input-with-state)
- [useMemo 性能优化](https://react.dev/reference/react/useMemo)

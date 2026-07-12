# 🎯 任务:JSON 序列化策略实战

> 靶场文件:`src/sandboxes/JSONSerializationSandbox.jsx`
> 预计耗时:15 ~ 30 分钟 · 难度:⭐⭐☆

## 背景

在 KMP(Kotlin Multiplatform)项目中,服务端下发的 JSON payload
经常携带老版本没有的字段,或者缺失必填字段。
如果直接交给业务层解析,很容易在 iOS / Android / Web 三端出现"在 Android 上能跑,
iOS 上崩溃"的诡异现象。

我们要用纯前端的"反序列化模拟器"把这套防御机制演示出来,
并请你 **修复 `JSONSerializationSandbox.jsx` 里的若干 React / ESLint 错误**,
让你熟悉工业级项目的工程红线。

## 任务清单(请按顺序完成)

- [ ] **任务 1:删除未使用的 import / 变量**
  - 打开 `src/sandboxes/JSONSerializationSandbox.jsx`
  - 找到 `unusedLogger` 等声明但未使用的变量
  - 删除或真正使用它们

- [ ] **任务 2:补全 `useMemo` 的依赖数组**
  - 找到 `const opts = useMemo(() => { ... }, [])`
  - ESLint 规则:`react-hooks/exhaustive-deps`
  - 把依赖补全为 `[parseOptions]`,思考:为什么 `parseOptions` 在这里稳定就够?

- [ ] **任务 3:消灭条件性 `useState`**
  - 找到 `if (opts.strict) { const [flag, setFlag] = useState(false) ... }`
  - ESLint 规则:`react-hooks/rules-of-hooks`
  - 把 useState 提到 if 外部,只在条件分支里 `setFlag` 或用 ref 替代

- [ ] **任务 4:补全 `useEffect` 依赖**
  - 找到 `useEffect(() => { ... }, [])`
  - 规则同上
  - 把依赖补全为 `[raw]`,并验证修改 raw 后会自动重新解析

- [ ] **任务 5(进阶):把 `defaultPayload` / `parseOptions` 抽到组件外**
  - 当前每次 render 都会创建新的对象引用
  - 修复:提到 `JSONSerializationSandbox` 函数体外部,
    或者用 `useMemo(() => ({...}), [])` 缓存

## 完成判据

- [ ] `npx eslint src/sandboxes/JSONSerializationSandbox.jsx` **0 error**
- [ ] 浏览器里修改输入框内容 → 结果区**实时更新**(说明 `useEffect` 依赖已修)
- [ ] 点击「注入坏数据」→ 结果区显示 `反序列化失败:缺少必填字段 id`

## 参考资料

- [React Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)
- [kotlinx.serialization 官方文档](https://kotlinlang.org/api/kotlinx.serialization/)
- 仓库内:`docs/ARCHITECTURE.md`

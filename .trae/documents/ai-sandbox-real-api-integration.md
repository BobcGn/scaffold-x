# 计划：AI 沙盒从模拟模式切换为真实大模型 API 接入

## 📋 Summary

将 `src/components/AiSandbox.jsx` 中"模拟 AI 回复"的实现改造为**真实调用大模型 API**。用户在前端配置 `baseURL` + `apiKey` + 模型名后，可调用任何 **OpenAI Chat Completions 兼容协议**的服务（OpenAI / DeepSeek / Moonshot / 智谱 GLM / Ollama / 自定义）。

**关键约束**：
- 沙盒中故意留的 4 处 ESLint 错误**必须保留**，继续作为新贡献者的 PR 训练靶子
- CORS 跨域问题采用"失败时给出明确错误提示 + 文档说明"策略，不引入 Vite 代理
- 预置常见服务商，用户可一键切换 baseURL

---

## 🔍 Current State Analysis

### 现状

- `src/components/AiSandbox.jsx`：使用 `setTimeout(1000)` 模拟 AI 回复（[查看第 59-82 行](file:///Users/bobcgn/AAA_Codings/scaffold-x/src/components/AiSandbox.jsx#L59-L82)）
- `handleSend` 中的 `mockResponse` 写死返回 `这是模拟的 AI 回复...`
- 已安装依赖：`react@19.2.7`、`react-dom@19.2.7`、`uuid@14.0.1`
- 已有 ESLint 错误（4 处故意留坑 + 衍生）：`no-unused-vars`、`react-hooks/exhaustive-deps`、`react-hooks/rules-of-hooks`、`react-refresh/only-export-components`

### 改造前 vs 改造后

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| 数据来源 | 写死字符串 | 真实 HTTP 调用 |
| 配置项 | 无 | baseURL / apiKey / 模型名 / 服务商 |
| 错误处理 | 无 | 分类错误（401/429/CORS/网络） |
| API Key 存储 | 无 | localStorage 加密提示 |
| 模型选择 | 固定 2 个 | 6+ 预置服务商 + 自定义 |

---

## 🎯 Proposed Changes

### 文件清单

#### 🆕 新建文件

| 文件路径 | 职责 |
|---------|------|
| `src/config/providers.js` | 预置服务商配置（OpenAI/DeepSeek/Moonshot/智谱/Ollama/自定义） |
| `src/services/aiService.js` | OpenAI 兼容协议调用封装，含错误分类 |
| `src/components/ApiConfigPanel.jsx` | baseURL/apiKey/模型名配置面板（带 localStorage 持久化） |

#### ✏️ 修改文件

| 文件路径 | 改动内容 |
|---------|---------|
| `src/components/AiSandbox.jsx` | 集成 `ApiConfigPanel` + `aiService`；重新植入 4 处 ESLint 错误 |
| `docs/ai-engineering-standard.md` | 新增"浏览器调用 LLM API"章节（CORS、Key 安全、错误处理） |
| `README.md` | 漏斗路由中标注沙盒已升级为真实 API 模式 |

---

### 📁 新建文件 1：`src/config/providers.js`

**职责**：导出 `PROVIDERS` 列表与 `loadConfig` / `saveConfig` 工具。

**核心数据结构**：
```js
export const PROVIDERS = [
  { id: 'openai',    name: 'OpenAI',           baseURL: 'https://api.openai.com/v1',          defaultModel: 'gpt-3.5-turbo' },
  { id: 'deepseek',  name: 'DeepSeek',         baseURL: 'https://api.deepseek.com/v1',        defaultModel: 'deepseek-chat' },
  { id: 'moonshot',  name: 'Moonshot（月之暗面）', baseURL: 'https://api.moonshot.cn/v1',        defaultModel: 'moonshot-v1-8k' },
  { id: 'zhipu',     name: '智谱 GLM',          baseURL: 'https://open.bigmodel.cn/api/paas/v4', defaultModel: 'glm-4-flash' },
  { id: 'ollama',    name: 'Ollama（本地）',     baseURL: 'http://localhost:11434/v1',         defaultModel: 'llama3' },
  { id: 'custom',    name: '自定义兼容服务',     baseURL: '',                                  defaultModel: '' },
]
```

**localStorage 工具**：
- key 前缀：`scaffold-x:ai:`
- 存储字段：`providerId`、`baseURL`、`apiKey`、`model`、`temperature`
- 提供 `loadConfig()` / `saveConfig()` / `clearConfig()`

---

### 📁 新建文件 2：`src/services/aiService.js`

**职责**：封装 OpenAI Chat Completions 协议调用。

**核心导出**：
```js
/**
 * 调用 OpenAI 兼容协议的 Chat Completions 接口
 * @param {Object} params
 * @param {string} params.baseURL - API 基础地址
 * @param {string} params.apiKey  - 授权密钥
 * @param {string} params.model   - 模型名
 * @param {Array}  params.messages - [{ role, content }, ...]
 * @param {number} params.temperature - 温度参数
 * @param {AbortSignal} [params.signal] - 用于取消请求
 * @returns {Promise<{ content: string, usage: { prompt: number, completion: number, total: number } }>}
 */
export async function callChatCompletion(params)

/**
 * 把不同类型的错误转换为对用户友好的中文提示
 * @param {Error} error
 * @returns {string}
 */
export function getFriendlyErrorMessage(error)
```

**实现要点**：
- 端点：`${baseURL}/chat/completions`（自动处理末尾斜杠）
- 请求头：`Authorization: Bearer ${apiKey}`、`Content-Type: application/json`
- 请求体：`{ model, messages, temperature, stream: false }`
- 错误分类：
  - `TypeError: Failed to fetch` → CORS 或网络断开
  - HTTP 401 → API Key 无效
  - HTTP 429 → 请求过于频繁
  - HTTP 500+ → 服务端错误
  - HTTP 400 → 请求参数错误（提取 message 字段）

---

### 📁 新建文件 3：`src/components/ApiConfigPanel.jsx`

**职责**：渲染 baseURL / apiKey / 模型名配置面板。

**UI 元素**：
- 服务商下拉（绑定 PROVIDERS）
- baseURL 输入框（切换服务商时自动填充默认值，但允许修改）
- apiKey 输入框（`type="password"`）+ "显示/隐藏"切换按钮
- 模型名输入框（带 datalist 提供预置模型下拉建议）
- "保存配置" / "清除配置" 按钮
- 当前配置摘要提示（"已保存到本地" / "尚未配置"）

**Props 接口**：
```js
ApiConfigPanel({ config, onChange, onSave, onClear })
```

**关键文档注释**：
- 顶部 JSDoc 说明：本面板的 baseURL/apiKey 仅存储在用户浏览器 localStorage，不上传任何服务器
- "保存" 按钮 onClick 添加注释：说明 localStorage 的安全边界

---

### ✏️ 修改文件 1：`src/components/AiSandbox.jsx`

**改动点**：

1. **新增 state**：
   - `config`（从 localStorage 加载，初始为空时显示配置提示）
   - `error`（最近的错误信息）
   - 删除原来的 `[showAdvanced, setShowAdvanced]`

2. **集成 ApiConfigPanel**：
   ```jsx
   <ApiConfigPanel config={config} onChange={setConfig} onSave={...} onClear={...} />
   ```

3. **改造 handleSend**：
   ```js
   const handleSend = async () => {
     // 1. 校验：未配置则提示
     if (!config.apiKey) { setError('请先配置 API Key'); return }
     // 2. 构造 messages（去掉 INITIAL_MESSAGES 里的 system，用用户自己的）
     // 3. 调用 aiService.callChatCompletion
     // 4. 成功：append assistant 消息
     // 5. 失败：setError(getFriendlyErrorMessage(err))
   }
   ```

4. **重新植入 4 处 ESLint 错误**（与改造前保持一致）：
   - 坑点 1：`useMemo` 依赖数组为空 `[]`（`react-hooks/exhaustive-deps`）
   - 坑点 2：`if` 块内条件性调用 `useState`（`react-hooks/rules-of-hooks` + `no-unused-vars`）
   - 坑点 3：`unusedVariable` 未使用（`no-unused-vars`）
   - 坑点 4：文件底部 `export const helperFunction`（`react-refresh/only-export-components`）

5. **新增错误展示区**：
   ```jsx
   {error && <div style={{...}}>⚠️ {error}</div>}
   ```

**文件顶部注释更新**：
```js
/**
 * AI 沙盒组件（真实 API 模式）
 * 
 * 业务背景：
 * 调用 OpenAI 兼容协议的大模型服务，支持 OpenAI / DeepSeek / Moonshot / 智谱 / Ollama 等。
 * 用户需在 ApiConfigPanel 中填入 baseURL + apiKey + 模型名。
 * 
 * ⚠️ 沙盒训练靶子：请新加入的贡献者修复本文件中的 ESLint 报错以完成你的第一个 PR。
 * 
 * 请修复以下 ESLint 报错：
 * 1. 未使用的变量/导入
 * 2. Hooks 依赖数组缺失
 * 3. 条件性 Hook 调用
 * 4. 导出非组件内容
 */
```

---

### ✏️ 修改文件 2：`docs/ai-engineering-standard.md`

**新增章节**："4. 浏览器直接调用 LLM API 的工程实践"

包含 4 个子章节：
- 4.1 为什么浏览器调用会遇到 CORS
- 4.2 三种 CORS 应对方案对比（自建代理 / 后端转发 / 用户自行解决）
- 4.3 API Key 前端存储的安全边界
- 4.4 常见错误码与用户友好提示模板

---

### ✏️ 修改文件 3：`README.md`

在「漏斗式路由」的「业务沙盒」分组下，添加：
```markdown
  - [AI 工程化沙盒](./src/components/AiSandbox.jsx)
    - 🆕 真实 API 模式：填入 baseURL + apiKey 即可调用 OpenAI 兼容大模型
    - 沙盒训练靶子：故意留 4 处 ESLint 错误，新人首个 PR 实操场
```

---

## 📐 Assumptions & Decisions

| 决策 | 选择 | 理由 |
|------|------|------|
| API 协议 | OpenAI Chat Completions 兼容 | 事实标准，覆盖 95% 服务商 |
| 流式输出 | **不支持**（本次只做非流式） | MVP 范围控制，避免复杂度爆炸 |
| CORS 处理 | 失败时给错误提示 + 文档说明 | 不引入 Vite 代理（生产环境无效），降低配置负担 |
| API Key 存储 | localStorage 明文 + UI 明确提示"仅本地" | 简化 MVP，后续可加 IndexedDB 加密 |
| 模型选择 | 预置服务商 + 自定义下拉 | 用户切换服务商时 baseURL 自动填充 |
| 沙盒训练 | 保留 4 处 ESLint 错误 | 用户明确要求保留 |
| 错误展示 | 红色横幅 + 友好中文提示 + 复制 cURL 按钮（可选增强） | 教学价值 + 排障效率 |

---

## ✅ Verification

### 自动化验证
```bash
# 1. ESLint 应有 4 处故意留坑 + 衍生错误
cd /Users/bobcgn/AAA_Codings/scaffold-x && npm run lint
# 预期：6 errors, 1 warning（与改造前数量一致）

# 2. Vite 构建通过
npm run build
# 预期：dist 目录生成成功
```

### 手动验证清单
1. ✅ 启动 `npm run dev`，打开浏览器进入 AiSandbox
2. ✅ 配置面板可正常切换服务商，baseURL 自动填充
3. ✅ 填入真实 API Key + 模型名（如 OpenAI），发送消息，能收到真实回复
4. ✅ 填入错误 API Key（HTTP 401），显示友好提示
5. ✅ 不填 API Key 直接发送，显示"请先配置"提示
6. ✅ 切换到 Ollama（本地服务），配置 `http://localhost:11434/v1` + 本地模型，能调用
7. ✅ 关闭浏览器重新打开，配置仍在（localStorage 生效）
8. ✅ 点击"清除配置"，localStorage 被清空

### ESLint 训练靶子验证
- 文件中必须保留：未使用的 `unusedVariable`、空的 `useMemo` 依赖数组、条件性 `useState`、`export const helperFunction`
- 修复后 ESLint 应只剩 0 错误

---

## 🔄 Implementation Order

1. 📝 创建 `src/config/providers.js`（无依赖，纯数据）
2. 📝 创建 `src/services/aiService.js`（依赖 fetch，可独立测试）
3. 📝 创建 `src/components/ApiConfigPanel.jsx`（依赖 providers.js + localStorage）
4. ✏️ 修改 `src/components/AiSandbox.jsx`（集成上述三者 + 重新植入 ESLint 错误）
5. ✏️ 更新 `docs/ai-engineering-standard.md`（新增浏览器调用章节）
6. ✏️ 更新 `README.md`（漏斗路由标注）
7. ✅ 运行 `npm run lint` 和 `npm run build` 验证

---

## ⚠️ Risks & Mitigations

| 风险 | 缓解措施 |
|------|---------|
| CORS 导致所有用户都失败 | 错误提示中明确说明 CORS 含义，并给出"使用本地 Ollama / 自建代理"的建议 |
| API Key 泄露到截图/录屏 | 密码框默认遮罩 + UI 提示"切勿分享屏幕" |
| 不同服务商响应字段差异 | 统一解析 OpenAI 规范字段 `{ choices: [{ message: { content } }], usage }` |
| 学生误以为沙盒内置免费 Key | 配置面板顶部明确标注"需自备 API Key" |

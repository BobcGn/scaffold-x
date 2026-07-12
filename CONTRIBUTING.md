# 贡献指南 (Contributing Guide)

> **这是你作为实验室新成员必须读完的第一份文档。**
> 读完它，你会知道：怎么把代码从自己的电脑推到主分支——并且**不被打回来**。

---

## 0. 写在前面

Scaffold-X 不是个人项目，它是一个**多人的工程协作场景**。
所有在这里养成的习惯（分支、Commit、PR、Lint），
**完全等价于你在字节、阿里、腾讯入职第一天要用的工作流**。

我们用 GitHub Actions 做"冷酷的监工"——**不规范 = 无法合并**，没有例外。

---

## 1. 本地环境搭建

### 1.1 前置依赖（一次性安装）

| 工具 | 最低版本 | 验证命令 | 说明 |
|------|---------|---------|------|
| **Node.js** | `22.x LTS` | `node -v` | 不支持 18/20，请用 LTS |
| **npm** | `10.x` | `npm -v` | **禁止**使用 yarn / pnpm |
| **Git** | `2.40+` | `git --version` | macOS 自带，Windows 自行安装 |
| **VS Code** *(推荐)* | Latest | — | 配合 ESLint 插件可实时提示 |

> 💡 官方下载地址：[nodejs.org](https://nodejs.org)
> 下载后务必选择 **LTS** 标识的版本。

### 1.2 拉取代码

```bash
# 第一步：在 GitHub 网页上点击 "Fork" 把仓库 fork 到你自己的账号
# 第二步：把你 fork 的仓库 clone 到本地
git clone https://github.com/<你的-GitHub-用户名>/scaffold-x.git
cd scaffold-x

# 第三步：把上游仓库设置为官方源，方便后续同步
git remote add upstream https://github.com/<官方-org>/scaffold-x.git

# 第四步：安装依赖
npm install

# 第五步：启动开发服务器（浏览器自动打开 http://localhost:5173）
npm run dev
```

### 1.3 环境自检（必跑）

```bash
npm run lint     # 期望：零 error
npm run build    # 期望：构建成功，生成 dist  目录
```

✅ 两个命令都通过 → 你的开发环境**就绪**。
❌ 任一失败 → **停止后续操作**，先根据报错排查或提 Issue。

---

## 2. 提交流程规范

### 2.1 分支策略（铁律）

```
main                 ← 受保护分支，❌ 禁止直接 push
 ├── feat/xxx        ← 新功能
 ├── fix/xxx         ← Bug 修复
 ├── docs/xxx        ← 文档变更
 └── refactor/xxx    ← 重构
```

**任何对 main 的直接 push 都会被 GitHub 拒绝。**

### 2.2 标准提交流程

```bash
# 1. 同步上游 main（每次开工前必做）
git checkout main
git pull upstream main

# 2. 从最新的 main 拉出功能分支
git checkout -b feat/你的功能名

# 3. 开发 + 提交
git add .
git commit -m "feat(scope): 简洁描述本次变更"

# 4. 推送到你自己的 fork
git push origin feat/你的功能名

# 5. 在 GitHub 网页上点击 "Compare & pull request"
# 6. 填写 PR 模板（业务背景 + 自查清单）
# 7. 等待 CI 流水线通过 + 至少 1 位 Reviewer 通过
# 8. Squash Merge → 删除远程分支
```

### 2.3 Commit Message 规范（Conventional Commits）

```
<type>(<scope>): <subject>

<body>     ← 可选：解释"为什么"
<footer>   ← 可选：关联 Issue (Closes #123)
```

| Type | 用途 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(nav): add funnel router` |
| `fix` | Bug 修复 | `fix(lint): handle empty deps array` |
| `docs` | 纯文档 | `docs: clarify PR checklist` |
| `refactor` | 重构（无功能变化） | `refactor: extract shared utils` |
| `chore` | 工具/构建 | `chore: bump vite to 8.x` |

> ❌ 错误示范：`fix bug` / `update` / `测试`
> ✅ 正确示范：`fix(auth): resolve token expiration race condition`

---

## 3. ⚠️ 代码规范预警（必读）

> **在按下 commit 之前，必须完成本节全部检查项。**
> 任何一个不通过，CI 流水线都会让你的 PR 爆红。

### 3.1 ESLint —— 物理拦截第一道防线

```bash
# 提交前必跑
npm run lint
```

**期望输出**：`✔ No problems` 或类似零错误提示。
**如果报错**：
1. 阅读错误信息（行号 + 规则名 + 违规内容）
2. 查阅 [docs/RULES.md](./docs/RULES.md) 中对应规则章节
3. 修复代码 → 重新执行 `npm run lint` → 通过后再 commit

**绝对禁止**：
- ❌ 用 `// eslint-disable-next-line` 强行压制错误（除非有充分理由 + 在 PR 描述中说明）
- ❌ 删除或注释掉 `.eslintrc` 中的规则
- ❌ 在 PR 评论区说"这个错误不重要，先合并"——**不存在此选项**

### 3.2 Vite Build —— 物理拦截第二道防线

```bash
npm run build
```

**期望输出**：`dist/` 目录成功生成。
**如果失败**：
- 99% 的情况是 `import` 路径写错、或者有未处理的语法错误
- 查看 [docs/CI-CD-GUIDE.md](./docs/CI-CD-GUIDE.md) 的 "Build 失败" 章节

### 3.3 提交前自查清单

- [ ] `npm run lint` 输出零 error
- [ ] `npm run build` 构建成功
- [ ] 没有遗留 `console.log` / 调试代码
- [ ] 没有提交 `.env` / `node_modules` / IDE 配置文件
- [ ] 新增的 `src/` 文件有基本注释
- [ ] commit message 符合 Conventional Commits 规范
- [ ] PR 描述中已勾选 [.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md) 的所有项

---

## 4. 常见错误与修复

| 报错关键词 | 原因 | 修复方式 |
|----------|------|---------|
| `no-unused-vars` | 导入了但未使用 | 删除 import 或在代码中引用 |
| `react-hooks/exhaustive-deps` | `useEffect` 依赖缺失 | 补全依赖数组 |
| `import/order` | import 顺序错乱 | 按 "外部 → 内部 → 样式" 顺序排列 |
| `no-console` | 生产代码含 `console.log` | 改用 `console.warn` 或删除 |
| `Module not found` | 路径写错 | 检查相对路径 `./` `../` |
| `EACCES` (npm install) | 全局权限问题 | 不要用 sudo，换用 nvm 管理 Node |

---

## 5. 反馈与帮助

遇到问题时的处理顺序（**不要跳级**）：

1. 🔍 先在本指南的"常见错误"表格里搜
2. 📖 在 [docs/CI-CD-GUIDE.md](./docs/CI-CD-GUIDE.md) 里查 CI 报错码
3. 🔎 在 [GitHub Issues](../../issues) 搜索是否已有相同问题
4. 🆕 仍无解 → [新建 Issue](../../issues/new/choose) 并附上：
   - 报错截图 / 完整日志
   - 复现步骤（命令 + 文件路径）
   - 你的环境（`node -v` / `npm -v` / OS）

---

## 6. 哲学

> **"通过 PR 之前，CI 是你的考官；通过 PR 之后，main 是你的承诺。"**

每一次规范的提交，都在帮下一个学弟学妹**少走 2 小时的弯路**。
这不是负担，这是**传承**。

---

*最后更新：2026-07-12 · 与 CI 流水线版本严格同步*

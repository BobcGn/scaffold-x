/**
 * Scaffold-X 全局配置常量
 *
 * 用途：
 *   集中维护仓库级别的不变量（GitHub 地址、站点名等）。
 *   部署到自家仓库前,只需修改本文件中的 GITHUB_REPO_URL,
 *   整套 UI 中的"查看源码 / Issue / 文档"等链接就会自动同步。
 *
 * 优先级：
 *   1. Vite 环境变量（import.meta.env.VITE_GITHUB_REPO_URL）— 用于 CI / 部署覆盖
 *   2. 本文件中的 GITHUB_REPO_URL 常量 — 本地开发默认
 *
 * 当 GITHUB_REPO_URL 仍为占位符时,<SafeLink /> 会拦截跳转,
 * 改为触发"请先推送到 GitHub"的友好 Toast 提示,避免 404。
 */

// 1) 优先取 Vite 环境变量,便于在 CI/部署时覆盖
const ENV_REPO_URL = import.meta.env.VITE_GITHUB_REPO_URL

// 2) 兜底常量 —— 默认为占位符,部署前请修改
export const GITHUB_REPO_URL =
  ENV_REPO_URL || 'https://github.com/BobcGn/scaffold-x'

/**
 * 判断 GitHub 仓库地址是否仍是"占位符 / 未配置"
 * 占位符的特征:owner 名等于 'scaffold-x' 且 branch 等于 'main'
 * 或 host 等于 example.com / placeholder 关键字串
 *
 * @param {string} url 待校验的 url
 * @returns {boolean} true 表示尚未配置
 */
export function isRepoPlaceholder(url) {
  if (!url || typeof url !== 'string') return true
  const PLACEHOLDER_KEYWORDS = [
    'your-org/your-repo',
    'example.com',
    'placeholder',
  ]
  if (PLACEHOLDER_KEYWORDS.some((kw) => url.includes(kw))) return true
  // 默认占位符 owner 名为 scaffold-x(用户部署时应替换为自己的 owner)
  // 如果你想"未替换前就允许跳转",可以把下面这行删掉
  return /github\.com\/scaffold-x\//.test(url)
}

/**
 * 站点展示用元信息
 */
export const SITE_META = {
  name: 'Scaffold-X',
  tagline: '消除理论与生产的鸿沟，工业级工程化协作沙盒',
  license: 'MIT',
}

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // 训练靶子目录 & 既有 AiSandbox.jsx 都是故意保留 ESLint 报错给新贡献者修的,
  // 因此统一从全局 lint 中排除,避免阻塞 CI。
  // 想本地检查靶子错误,可显式跳过 ignore:
  //   npx eslint --no-ignore src/sandboxes/JSONSerializationSandbox.jsx
  //   npx eslint --no-ignore src/components/AiSandbox.jsx
  globalIgnores(['dist', 'src/sandboxes/**', 'src/components/AiSandbox.jsx']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        process: 'readonly', // Node.js process 全局变量
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])

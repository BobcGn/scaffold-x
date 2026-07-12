import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署需要设置 base 为仓库名
  // 本地开发时此配置会被忽略
  base: process.env.GITHUB_ACTIONS ? '/scaffold-x/' : '/',
})

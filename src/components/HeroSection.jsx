/**
 * 页面头部 Hero 组件
 *
 * 视觉：暗色极客风，渐变标题 + 副标题 + 简短标签行
 * 行为：纯展示，不持有任何状态
 */

/**
 * HeroSection
 * 渲染 Scaffold-X 的品牌头图区域。
 *
 * @returns {JSX.Element} 头部 JSX
 */
function HeroSection() {
  return (
    <header className="sx-hero">
      <div className="sx-hero__badge">
        <span className="sx-hero__dot" />
        v0.1 · Open Source Sandbox
      </div>
      <h1 className="sx-hero__title">
        Scaffold<span className="sx-hero__title-accent">-X</span>
      </h1>
      <p className="sx-hero__subtitle">
        消除理论与生产的鸿沟，工业级工程化协作沙盒。
      </p>
      <p className="sx-hero__hint">
        从一个一级领域出发，沿着漏斗直达可落地的工程规范。
      </p>
    </header>
  )
}

export default HeroSection

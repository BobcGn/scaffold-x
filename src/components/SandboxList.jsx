/**
 * SandboxList —— 靶场数据列表组件
 *
 * 业务定位:
 *   以类似 LeetCode 的高效数据列表形式展示靶场,
 *   支持搜索、筛选、排序,适合海量数据场景。
 *
 * 设计要点:
 *   - 极简暗黑风格,边框和分割线极其克制
 *   - 行悬停高亮反馈,边框发光效果
 *   - 响应式设计,移动端自动隐藏次要列
 *   - 支持多维度筛选(分类、难度、状态)
 *   - 支持搜索和排序
 *
 * Props:
 *   - data:        靶场数据数组
 *   - onSelect:    选中回调 (sandbox) => void
 *   - onFilterChange: 筛选变化回调
 */

import { useCallback, useMemo, useState } from 'react'
import { CATEGORIES, DIFFICULTY_CONFIG, STATUS_CONFIG } from '../config/sandboxes.js'
import './SandboxList.css'

/**
 * 难度标签组件
 *
 * @param {object} props
 * @param {string} props.difficulty 难度级别
 * @returns {JSX.Element}
 */
function DifficultyBadge({ difficulty }) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Easy
  return (
    <span
      className="sx-sandbox-list__difficulty"
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      {config.label}
    </span>
  )
}

/**
 * 状态图标组件
 *
 * @param {object} props
 * @param {string} props.status 状态
 * @returns {JSX.Element}
 */
function StatusIcon({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Todo
  return (
    <span
      className="sx-sandbox-list__status"
      style={{ color: config.color }}
      title={config.label}
    >
      {config.icon}
    </span>
  )
}

/**
 * 标签组件
 *
 * @param {object} props
 * @param {string[]} props.tags 标签数组
 * @returns {JSX.Element}
 */
function TagList({ tags }) {
  return (
    <div className="sx-sandbox-list__tags">
      {tags.slice(0, 2).map((tag) => (
        <span key={tag} className="sx-sandbox-list__tag">
          {tag}
        </span>
      ))}
      {tags.length > 2 && (
        <span className="sx-sandbox-list__tag sx-sandbox-list__tag--more">
          +{tags.length - 2}
        </span>
      )}
    </div>
  )
}

/**
 * 作者组件
 *
 * @param {object} props
 * @param {string} props.author 作者
 * @returns {JSX.Element}
 */
function AuthorBadge({ author }) {
  const isOfficial = author === 'Official'
  return (
    <span
      className={`sx-sandbox-list__author ${isOfficial ? 'is-official' : ''}`}
    >
      {isOfficial && <span className="sx-sandbox-list__author-icon">★</span>}
      {author}
    </span>
  )
}

/**
 * 搜索图标
 *
 * @returns {JSX.Element}
 */
function SearchIcon() {
  return (
    <svg
      className="sx-sandbox-list__search-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

/**
 * 排序图标
 *
 * @param {object} props
 * @param {'asc' | 'desc' | null} props.direction 排序方向
 * @returns {JSX.Element}
 */
function SortIcon({ direction }) {
  if (!direction) {
    return (
      <svg className="sx-sandbox-list__sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m7 15 5 5 5-5" />
        <path d="m7 9 5-5 5 5" />
      </svg>
    )
  }
  return (
    <svg className="sx-sandbox-list__sort-icon is-active" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {direction === 'asc' ? (
        <path d="m18 15-6-6-6 6" />
      ) : (
        <path d="m6 9 6 6 6-6" />
      )}
    </svg>
  )
}

/**
 * SandboxList 组件
 *
 * @param {object} props
 * @param {Array} props.data 靶场数据数组
 * @param {function} props.onSelect 选中回调
 * @param {function} [props.onFilterChange] 筛选变化回调
 * @returns {JSX.Element}
 */
function SandboxList({ data = [], onSelect, onFilterChange }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortField, setSortField] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')

  // 处理搜索
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  // 处理分类筛选
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category)
    onFilterChange?.({ category, difficulty: selectedDifficulty, status: selectedStatus })
  }, [selectedDifficulty, selectedStatus, onFilterChange])

  // 处理难度筛选
  const handleDifficultyChange = useCallback((difficulty) => {
    setSelectedDifficulty(difficulty)
    onFilterChange?.({ category: selectedCategory, difficulty, status: selectedStatus })
  }, [selectedCategory, selectedStatus, onFilterChange])

  // 处理状态筛选
  const handleStatusChange = useCallback((status) => {
    setSelectedStatus(status)
    onFilterChange?.({ category: selectedCategory, difficulty: selectedDifficulty, status })
  }, [selectedCategory, selectedDifficulty, onFilterChange])

  // 处理排序
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }, [sortField])

  // 过滤和排序数据
  const filteredData = useMemo(() => {
    let result = [...data]

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory)
    }

    // 难度过滤
    if (selectedDifficulty !== 'all') {
      result = result.filter((item) => item.difficulty === selectedDifficulty)
    }

    // 状态过滤
    if (selectedStatus !== 'all') {
      result = result.filter((item) => item.status === selectedStatus)
    }

    // 排序
    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // 字符串排序
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [data, searchQuery, selectedCategory, selectedDifficulty, selectedStatus, sortField, sortDirection])

  // 统计数据
  const stats = useMemo(() => ({
    total: data.length,
    filtered: filteredData.length,
    solved: data.filter((d) => d.status === 'Solved').length,
  }), [data, filteredData])

  return (
    <div className="sx-sandbox-list">
      {/* ---------- 工具栏 ---------- */}
      <div className="sx-sandbox-list__toolbar">
        {/* 搜索框 */}
        <div className="sx-sandbox-list__search">
          <SearchIcon />
          <input
            type="text"
            className="sx-sandbox-list__search-input"
            placeholder="搜索靶场..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {/* 筛选器 */}
        <div className="sx-sandbox-list__filters">
          {/* 分类筛选 */}
          <div className="sx-sandbox-list__filter-group">
            <label className="sx-sandbox-list__filter-label">分类</label>
            <select
              className="sx-sandbox-list__filter-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 难度筛选 */}
          <div className="sx-sandbox-list__filter-group">
            <label className="sx-sandbox-list__filter-label">难度</label>
            <select
              className="sx-sandbox-list__filter-select"
              value={selectedDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="Easy">简单</option>
              <option value="Medium">中等</option>
              <option value="Hard">困难</option>
            </select>
          </div>

          {/* 状态筛选 */}
          <div className="sx-sandbox-list__filter-group">
            <label className="sx-sandbox-list__filter-label">状态</label>
            <select
              className="sx-sandbox-list__filter-select"
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">全部</option>
              <option value="Todo">待完成</option>
              <option value="Solved">已完成</option>
              <option value="Skipped">已跳过</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---------- 统计信息 ---------- */}
      <div className="sx-sandbox-list__stats">
        <span>共 {stats.total} 个靶场</span>
        <span className="sx-sandbox-list__stats-divider">·</span>
        <span>显示 {stats.filtered} 个</span>
        <span className="sx-sandbox-list__stats-divider">·</span>
        <span>已完成 {stats.solved} 个</span>
      </div>

      {/* ---------- 表格 ---------- */}
      <div className="sx-sandbox-list__table-wrapper">
        <table className="sx-sandbox-list__table">
          <thead>
            <tr>
              <th
                className="sx-sandbox-list__th sx-sandbox-list__th--status"
                onClick={() => handleSort('status')}
              >
                <span className="sx-sandbox-list__th-content">
                  状态
                  <SortIcon direction={sortField === 'status' ? sortDirection : null} />
                </span>
              </th>
              <th
                className="sx-sandbox-list__th sx-sandbox-list__th--id"
                onClick={() => handleSort('id')}
              >
                <span className="sx-sandbox-list__th-content">
                  #
                  <SortIcon direction={sortField === 'id' ? sortDirection : null} />
                </span>
              </th>
              <th
                className="sx-sandbox-list__th sx-sandbox-list__th--title"
                onClick={() => handleSort('title')}
              >
                <span className="sx-sandbox-list__th-content">
                  标题
                  <SortIcon direction={sortField === 'title' ? sortDirection : null} />
                </span>
              </th>
              <th
                className="sx-sandbox-list__th sx-sandbox-list__th--category"
                onClick={() => handleSort('category')}
              >
                <span className="sx-sandbox-list__th-content">
                  分类
                  <SortIcon direction={sortField === 'category' ? sortDirection : null} />
                </span>
              </th>
              <th
                className="sx-sandbox-list__th sx-sandbox-list__th--difficulty"
                onClick={() => handleSort('difficulty')}
              >
                <span className="sx-sandbox-list__th-content">
                  难度
                  <SortIcon direction={sortField === 'difficulty' ? sortDirection : null} />
                </span>
              </th>
              <th
                className="sx-sandbox-list__th sx-sandbox-list__th--author"
                onClick={() => handleSort('author')}
              >
                <span className="sx-sandbox-list__th-content">
                  作者
                  <SortIcon direction={sortField === 'author' ? sortDirection : null} />
                </span>
              </th>
              <th className="sx-sandbox-list__th sx-sandbox-list__th--tags">
                标签
              </th>
              <th
                className="sx-sandbox-list__th sx-sandbox-list__th--time"
                onClick={() => handleSort('estimatedTime')}
              >
                <span className="sx-sandbox-list__th-content">
                  耗时
                  <SortIcon direction={sortField === 'estimatedTime' ? sortDirection : null} />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="8" className="sx-sandbox-list__empty">
                  <div className="sx-sandbox-list__empty-content">
                    <span className="sx-sandbox-list__empty-icon">🔍</span>
                    <span>未找到匹配的靶场</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((sandbox) => (
                <tr
                  key={sandbox.id}
                  className={`sx-sandbox-list__tr ${sandbox.sandboxId ? 'is-clickable' : ''}`}
                  onClick={() => sandbox.sandboxId && onSelect?.(sandbox)}
                >
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--status">
                    <StatusIcon status={sandbox.status} />
                  </td>
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--id">
                    {sandbox.id}
                  </td>
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--title">
                    <div className="sx-sandbox-list__title-cell">
                      <span className="sx-sandbox-list__title">{sandbox.title}</span>
                      <span className="sx-sandbox-list__desc">{sandbox.description}</span>
                    </div>
                  </td>
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--category">
                    {sandbox.category}
                  </td>
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--difficulty">
                    <DifficultyBadge difficulty={sandbox.difficulty} />
                  </td>
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--author">
                    <AuthorBadge author={sandbox.author} />
                  </td>
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--tags">
                    <TagList tags={sandbox.tags} />
                  </td>
                  <td className="sx-sandbox-list__td sx-sandbox-list__td--time">
                    {sandbox.estimatedTime}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- 分页提示 ---------- */}
      <div className="sx-sandbox-list__pagination">
        <span>显示全部 {filteredData.length} 条</span>
      </div>
    </div>
  )
}

export default SandboxList

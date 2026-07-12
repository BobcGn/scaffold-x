/**
 * CodeEditor —— 代码编辑器组件
 *
 * 业务定位:
 *   在靶场实操中提供代码编辑功能，支持语法高亮（简化版）和实时预览。
 *   使用 textarea 实现基础编辑，支持 Tab 缩进、行号显示。
 *
 * Props:
 *   - value:       当前代码内容
 *   - onChange:     代码变更回调 (newValue) => void
 *   - language:    语言类型 (javascript | jsx | css | markdown)
 *   - readOnly:    是否只读
 *   - fileName:    文件名（显示在顶部）
 *   - showLineNumbers: 是否显示行号
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import './CodeEditor.css'

/**
 * 统计代码行数
 * @param {string} code 代码内容
 * @returns {number} 行数
 */
function countLines(code) {
  return (code || '').split('\n').length
}

/**
 * CodeEditor 组件
 *
 * @param {object} props
 * @param {string} props.value 代码内容
 * @param {function} props.onChange 变更回调
 * @param {string} [props.language='javascript'] 语言类型
 * @param {boolean} [props.readOnly=false] 是否只读
 * @param {string} [props.fileName=''] 文件名
 * @param {boolean} [props.showLineNumbers=true] 是否显示行号
 * @returns {JSX.Element}
 */
function CodeEditor({
  value = '',
  onChange,
  language = 'javascript',
  readOnly = false,
  fileName = '',
  showLineNumbers = true,
}) {
  const textareaRef = useRef(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const lineCount = countLines(value)

  // 处理 Tab 键缩进
  const handleKeyDown = useCallback((e) => {
    if (readOnly) return

    // Tab 键插入 2 个空格
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      onChange(newValue)

      // 恢复光标位置
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }, [value, onChange, readOnly])

  // 处理输入变更
  const handleChange = useCallback((e) => {
    if (!readOnly && onChange) {
      onChange(e.target.value)
    }
  }, [onChange, readOnly])

  // 更新光标位置
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const text = textarea.value.substring(0, textarea.selectionStart)
    const lines = text.split('\n')
    setCursorPosition({
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    })
  }, [])

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`
    }
  }, [value])

  return (
    <div className="sx-code-editor">
      {/* 顶部工具栏 */}
      <div className="sx-code-editor__header">
        <div className="sx-code-editor__file-info">
          {fileName && (
            <span className="sx-code-editor__filename">{fileName}</span>
          )}
          <span className="sx-code-editor__language">{language}</span>
        </div>
        <div className="sx-code-editor__cursor">
          行 {cursorPosition.line}, 列 {cursorPosition.column}
        </div>
      </div>

      {/* 代码编辑区 */}
      <div className="sx-code-editor__container">
        {/* 行号 */}
        {showLineNumbers && (
          <div className="sx-code-editor__line-numbers">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className="sx-code-editor__line-number">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* 代码输入框 */}
        <textarea
          ref={textareaRef}
          className="sx-code-editor__textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onClick={handleSelect}
          readOnly={readOnly}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
        />
      </div>

      {/* 底部状态栏 */}
      <div className="sx-code-editor__footer">
        <span>{lineCount} 行</span>
        <span>{value.length} 字符</span>
        <span>{language}</span>
      </div>
    </div>
  )
}

export default CodeEditor

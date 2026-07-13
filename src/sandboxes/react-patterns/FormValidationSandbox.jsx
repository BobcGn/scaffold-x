/**
 * 沙盒训练靶子 #4 —— 表单验证实战
 *
 * 业务背景：
 * 模拟"用户注册表单"场景，练习受控组件、表单验证、错误状态管理。
 *
 * 靶子里故意保留 4 类典型错误:
 *   1. 表单状态对象直接 mutation
 *   2. 验证逻辑在渲染期间执行(应使用 useMemo)
 *   3. 提交时未重置错误状态
 *   4. 受控组件 value 与 onChange 不同步
 *
 * 修复提示：
 *   - 使用展开运算符更新表单状态
 *   - 使用 useMemo 缓存验证结果
 *   - 在提交成功后清理错误状态
 */

import { useMemo, useState } from 'react'

/* ===== 验证规则 ===== */
const VALIDATION_RULES = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    messages: {
      required: '用户名不能为空',
      minLength: '用户名至少 3 个字符',
      maxLength: '用户名最多 20 个字符',
      pattern: '用户名只能包含字母、数字和下划线',
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: '邮箱不能为空',
      pattern: '请输入有效的邮箱地址',
    },
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    messages: {
      required: '密码不能为空',
      minLength: '密码至少 8 个字符',
      pattern: '密码必须包含大小写字母和数字',
    },
  },
  confirmPassword: {
    required: true,
    matchField: 'password',
    messages: {
      required: '请确认密码',
      matchField: '两次输入的密码不一致',
    },
  },
}

/**
 * 验证单个字段
 * @param {string} name 字段名
 * @param {string} value 字段值
 * @param {object} formData 整个表单数据(用于跨字段验证)
 * @returns {string|null} 错误信息或 null
 */
function validateField(name, value, formData) {
  const rules = VALIDATION_RULES[name]
  if (!rules) return null

  if (rules.required && !value.trim()) {
    return rules.messages.required
  }

  if (rules.minLength && value.length < rules.minLength) {
    return rules.messages.minLength
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return rules.messages.maxLength
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return rules.messages.pattern
  }

  if (rules.matchField && value !== formData[rules.matchField]) {
    return rules.messages.matchField
  }

  return null
}

/* ===== 子组件 ===== */

function FormField({ name, label, type = 'text', value, error, onChange, placeholder }) {
  return (
    <div className="sx-sandbox__field">
      <label className="sx-sandbox__field-label" htmlFor={`field-${name}`}>
        {label}
      </label>
      <input
        id={`field-${name}`}
        type={type}
        className={`sx-sandbox__input ${error ? 'has-error' : ''}`}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
      />
      {error && (
        <span className="sx-sandbox__field-error">{error}</span>
      )}
    </div>
  )
}

function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, text: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { level: 1, text: '弱', color: '#ef4444' }
    if (score <= 3) return { level: 2, text: '中', color: '#f59e0b' }
    if (score <= 4) return { level: 3, text: '强', color: '#22c55e' }
    return { level: 4, text: '非常强', color: '#10b981' }
  }, [password])

  if (!password) return null

  return (
    <div className="sx-sandbox__strength">
      <div className="sx-sandbox__strength-bar">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`sx-sandbox__strength-segment ${level <= strength.level ? 'is-active' : ''}`}
            style={{ backgroundColor: level <= strength.level ? strength.color : undefined }}
          />
        ))}
      </div>
      <span className="sx-sandbox__strength-text" style={{ color: strength.color }}>
        密码强度:{strength.text}
      </span>
    </div>
  )
}

/* ===== 主组件 ===== */

function FormValidationSandbox() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // 修复点 1:每次渲染都重新计算验证结果(应使用 useMemo)
  const errors = {}
  Object.keys(formData).forEach((key) => {
    errors[key] = validateField(key, formData[key], formData)
  })

  const [submitStatus, setSubmitStatus] = useState(null) // null | 'success' | 'error'
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 修复点 2:直接修改 state 对象
  const handleChange = (name, value) => {
    // 错误:直接修改 formData
    formData[name] = value
    setFormData(formData)
    // 修复点 3:未在输入时清除错误状态
  }

  const isValid = useMemo(() => {
    return Object.values(errors).every((e) => e === null)
  }, [errors])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isValid) {
      // 修复点 4:未设置 submitStatus 为 error
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    // 模拟 API 请求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setSubmitStatus('success')
    // 修复点 5:提交成功后未清理表单
  }

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setSubmitStatus(null)
  }

  return (
    <div className="sx-sandbox__demo">
      <h4 className="sx-sandbox__demo-title">
        📝 表单验证沙盒（待修复）
      </h4>

      <form onSubmit={handleSubmit} className="sx-sandbox__form">
        <FormField
          name="username"
          label="用户名"
          value={formData.username}
          error={errors.username}
          onChange={handleChange}
          placeholder="3-20 个字母、数字或下划线"
        />

        <FormField
          name="email"
          label="邮箱"
          type="email"
          value={formData.email}
          error={errors.email}
          onChange={handleChange}
          placeholder="user@example.com"
        />

        <FormField
          name="password"
          label="密码"
          type="password"
          value={formData.password}
          error={errors.password}
          onChange={handleChange}
          placeholder="至少 8 位,含大小写字母和数字"
        />

        <PasswordStrength password={formData.password} />

        <FormField
          name="confirmPassword"
          label="确认密码"
          type="password"
          value={formData.confirmPassword}
          error={errors.confirmPassword}
          onChange={handleChange}
          placeholder="再次输入密码"
        />

        <div className="sx-sandbox__form-actions">
          <button
            type="submit"
            className="sx-sandbox__btn"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? '提交中...' : '注册'}
          </button>
          <button
            type="button"
            className="sx-sandbox__btn sx-sandbox__btn--ghost"
            onClick={handleReset}
          >
            重置
          </button>
        </div>

        {submitStatus === 'success' && (
          <div className="sx-sandbox__success-banner">
            ✅ 注册成功!
          </div>
        )}
      </form>

      <div className="sx-sandbox__debug">
        <h5>表单状态(实时)</h5>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  )
}

export default FormValidationSandbox

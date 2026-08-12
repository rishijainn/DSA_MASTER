'use client'

import { useRef, useEffect, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'

interface OTPInputProps {
  length?: number
  onComplete: (code: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export default function OTPInput({ length = 6, onComplete, disabled = false, autoFocus = true }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const [focusedIndex, setFocusedIndex] = useState(0)

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, value: string) => {
    if (disabled) return
    const sanitized = value.replace(/\D/g, '').slice(0, 1)
    const newValues = [...values]
    newValues[index] = sanitized
    setValues(newValues)

    if (sanitized && index < length - 1) {
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    if (newValues.every(v => v)) {
      onComplete(newValues.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const chars = pasted.split('')
    chars.forEach((char, i) => {
      if (i < length) handleChange(i, char)
    })
    if (chars.length >= length) {
      inputRefs.current[length - 1]?.blur()
    }
  }

  const handleFocus = (index: number) => setFocusedIndex(index)

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(i)}
          disabled={disabled}
          autoComplete="one-time-code"
          style={{
            width: '48px',
            height: '56px',
            background: '#1a1a1a',
            border: `2px solid ${focusedIndex === i ? '#ffa116' : '#3e3e3e'}`,
            borderRadius: '10px',
            color: '#eff1f6',
            fontSize: '22px',
            fontWeight: '700',
            textAlign: 'center',
            outline: 'none',
            transition: 'all 0.15s',
            boxShadow: focusedIndex === i ? '0 0 0 3px rgba(255,161,22,0.2)' : 'none',
          }}
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  )
}
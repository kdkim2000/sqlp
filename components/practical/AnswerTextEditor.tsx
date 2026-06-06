interface AnswerTextEditorProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  readOnly?: boolean
  placeholder?: string
  rows?: number
}

export default function AnswerTextEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = '-- SQL 답안을 작성하세요\n-- 힌트, 인라인뷰 등 포함 가능',
  rows = 14,
}: AnswerTextEditorProps) {
  return (
    <div>
      <label htmlFor="practical-answer" className="block text-xs font-semibold mb-2" style={{ color: 'var(--q-ink-2)' }}>
        SQL 답안 작성
      </label>
      <textarea
        id="practical-answer"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={readOnly ? '' : placeholder}
        rows={rows}
        className="w-full rounded-xl border px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
        style={{
          borderColor: 'var(--q-border)',
          background: readOnly ? 'var(--q-surface-soft)' : 'var(--q-surface)',
          color: 'var(--q-ink)',
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        }}
      />
    </div>
  )
}

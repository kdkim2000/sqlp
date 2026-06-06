import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface ScenarioPanelProps {
  content: string
  typeLabel?: string
}

export default function ScenarioPanel({ content, typeLabel }: ScenarioPanelProps) {
  return (
    <div>
      {typeLabel && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">
            {typeLabel}
          </span>
          <span className="text-xs" style={{ color: 'var(--q-ink-3)' }}>지문</span>
        </div>
      )}
      <div className="prose-quiz overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string
  language?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative group', className)}>
      {language && (
        <span className="absolute top-2 left-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {language}
        </span>
      )}
      <button
        type="button"
        onClick={copy}
        title="Copy"
        className="absolute top-2 right-2 inline-flex items-center justify-center h-7 w-7 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <pre
        className="bg-card border border-border rounded-md text-[12.5px] leading-relaxed font-mono overflow-x-auto p-4 pt-7"
        style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}

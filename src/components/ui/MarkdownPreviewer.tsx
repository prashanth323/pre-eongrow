import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  Link,
  Eye,
  Edit3,
  Columns,
  Copy,
  Check,
} from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, className = '' }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, idx: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`|\[.*?\]\(.*?\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={match.index} className="font-semibold text-[#171C19]">{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={match.index} className="italic text-[#171C19]">{token.slice(1, -1)}</em>);
      } else if (token.startsWith('~~') && token.endsWith('~~')) {
        parts.push(<del key={match.index} className="line-through text-[#818A84]">{token.slice(2, -2)}</del>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={match.index} className="font-mono text-[11px] bg-black/[0.05] px-1.5 py-0.5 rounded text-[#171C19]">
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
        const title = token.substring(1, token.indexOf(']('));
        const url = token.substring(token.indexOf('](') + 2, token.length - 1);
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-black font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            {title}
          </a>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const lines = (content || '').split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';
  let inTable = false;
  let tableRows: string[][] = [];
  let inList = false;
  let listItems: string[] = [];
  let isOrderedList = false;

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      if (isOrderedList) {
        elements.push(
          <ol key={key} className="space-y-1.5 my-2 pl-5 list-decimal text-xs text-[#525854]">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{parseInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key} className="space-y-1.5 my-2 pl-5 list-disc text-xs text-[#525854]">
            {listItems.map((item, idx) => (
              <li key={idx} className="leading-relaxed">{parseInline(item)}</li>
            ))}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const [headerRow, ...bodyRows] = tableRows;
      elements.push(
        <div key={key} className="overflow-x-auto my-3 border border-black/[0.08] rounded-xl">
          <table className="min-w-full divide-y divide-black/[0.08] text-xs">
            {headerRow && (
              <thead className="bg-black/[0.02]">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="px-3 py-2 text-left font-semibold text-[#171C19]">
                      {parseInline(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-black/[0.04] bg-white">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-[#525854]">
                      {parseInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code Block Toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        const blockText = codeBlockLines.join('\n');
        const codeIdx = i;
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden text-neutral-100 shadow-xs">
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-950/80 border-b border-neutral-800 text-[10px] text-neutral-400 font-mono">
              <span>{codeBlockLang || 'Code'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(blockText, codeIdx)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                {copiedCodeIdx === codeIdx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-neutral-200">
              <code>{blockText}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
        codeBlockLang = '';
      } else {
        flushList(`list-${i}`);
        flushTable(`table-${i}`);
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Markdown Table Detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(`list-${i}`);
      // Skip separator row like |---|---|
      if (trimmed.replace(/[\|\-\:\s]/g, '') === '') {
        continue;
      }
      const cells = trimmed.slice(1, -1).split('|');
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList(`list-${i}`);
      elements.push(<hr key={`hr-${i}`} className="border-t border-black/[0.08] my-4" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushList(`list-${i}`);
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-light text-[#171C19] tracking-tight mt-4 mb-2 first:mt-0">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList(`list-${i}`);
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-light text-[#171C19] tracking-tight mt-3 mb-1.5 first:mt-0">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushList(`list-${i}`);
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm sm:text-base font-semibold text-[#171C19] tracking-tight mt-3 mb-1.5 first:mt-0">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      flushList(`list-${i}`);
      elements.push(
        <h4 key={`h4-${i}`} className="text-xs sm:text-sm font-semibold text-[#171C19] tracking-tight mt-2.5 mb-1">
          {parseInline(trimmed.slice(5))}
        </h4>
      );
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      flushList(`list-${i}`);
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-2 border-black/30 pl-3.5 my-2.5 italic text-xs text-[#525854]">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || isOrderedList) {
        flushList(`list-${i}`);
        inList = true;
        isOrderedList = false;
      }
      listItems.push(trimmed.slice(2));
      continue;
    }

    // Ordered List
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!inList || !isOrderedList) {
        flushList(`list-${i}`);
        inList = true;
        isOrderedList = true;
      }
      listItems.push(orderedMatch[2]);
      continue;
    }

    // Empty Lines
    if (trimmed === '') {
      flushList(`list-${i}`);
      continue;
    }

    // Standard Paragraph
    flushList(`list-${i}`);
    elements.push(
      <p key={`p-${i}`} className="text-xs text-[#525854] leading-relaxed my-1.5">
        {parseInline(rawLine)}
      </p>
    );
  }

  flushList('list-end');
  flushTable('table-end');

  if (elements.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-[#818A84] italic">
        No content to preview. Write markdown in the editor to see formatting.
      </div>
    );
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};

export interface MarkdownPreviewerProps {
  value: string;
  onChange?: (val: string) => void;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  minRows?: number;
  className?: string;
}

export const MarkdownPreviewer: React.FC<MarkdownPreviewerProps> = ({
  value,
  onChange,
  readOnly = false,
  label,
  placeholder = 'Write custom markdown here...',
  minRows = 6,
  className = '',
}) => {
  const [tab, setTab] = useState<'write' | 'preview' | 'split'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (prefix: string, suffix: string = '', defaultText: string = '') => {
    if (!textareaRef.current || !onChange) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;
    const nextValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(nextValue);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with Mode Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {label && (
          <label className="text-xs font-semibold text-[#171C19] uppercase tracking-wider block">
            {label}
          </label>
        )}

        <div className="flex items-center gap-1 bg-black/[0.04] p-0.5 rounded-xl text-xs">
          {!readOnly && (
            <button
              type="button"
              onClick={() => setTab('write')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === 'write'
                  ? 'bg-white text-black shadow-2xs font-semibold'
                  : 'text-[#818A84] hover:text-black'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Write</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === 'preview'
                ? 'bg-white text-black shadow-2xs font-semibold'
                : 'text-[#818A84] hover:text-black'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={() => setTab('split')}
              className={`hidden sm:flex px-3 py-1 rounded-lg font-medium transition-all cursor-pointer items-center gap-1.5 ${
                tab === 'split'
                  ? 'bg-white text-black shadow-2xs font-semibold'
                  : 'text-[#818A84] hover:text-black'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>Split</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Formatting Toolbar (Visible in Write & Split modes) */}
      {!readOnly && (tab === 'write' || tab === 'split') && (
        <div className="flex items-center gap-1 p-1 bg-black/[0.02] border border-black/[0.06] rounded-xl overflow-x-auto scrollbar-none text-[#818A84]">
          <button
            type="button"
            onClick={() => insertSnippet('**', '**', 'bold text')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('*', '*', 'italic text')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('## ', '', 'Heading')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Heading (## text)"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('### ', '', 'Subheading')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Subheading (### text)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-black/[0.08] mx-0.5" />
          <button
            type="button"
            onClick={() => insertSnippet('- ', '', 'List item')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Bullet list (- item)"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('1. ', '', 'Numbered item')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Numbered list (1. item)"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('> ', '', 'Quote')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Blockquote (> quote)"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('`', '`', 'code')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Inline Code (`code`)"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('[', '](https://example.com)', 'link text')}
            className="p-1.5 hover:text-black hover:bg-black/[0.04] rounded-lg transition-colors"
            title="Link ([text](url))"
          >
            <Link className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor / Preview Content Views */}
      {tab === 'write' && !readOnly && (
        <textarea
          ref={textareaRef}
          rows={minRows}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.08] rounded-2xl font-mono text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none transition-all shadow-2xs leading-relaxed"
        />
      )}

      {tab === 'preview' && (
        <div className="p-4 rounded-2xl bg-white border border-black/[0.08] min-h-[160px] max-h-[480px] overflow-y-auto">
          <MarkdownViewer content={value} />
        </div>
      )}

      {tab === 'split' && !readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          <textarea
            ref={textareaRef}
            rows={minRows}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-black/[0.02] border border-black/[0.08] rounded-2xl font-mono text-xs text-[#171C19] focus:bg-white focus:border-black/30 focus:outline-none transition-all shadow-2xs leading-relaxed"
          />
          <div className="p-4 rounded-2xl bg-white border border-black/[0.08] min-h-[160px] max-h-[380px] overflow-y-auto">
            <MarkdownViewer content={value} />
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Components } from 'react-markdown';
import 'katex/dist/katex.min.css';

interface MarkdownComponentProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any; // For additional props from react-markdown
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-md !mt-0 !mb-4"
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export const MarkdownComponent: React.FC<MarkdownComponentProps> = ({
  content,
  className = '',
}) => {
  const components: Components = {
    // Code blocks and inline code
    code: CodeBlock,
    
    // Tables
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-border rounded-md" {...props}>
          {children}
        </table>
      </div>
    ),
    
    th: ({ children, ...props }) => (
      <th
        className="border border-border px-3 py-2 bg-muted font-semibold text-left"
        {...props}
      >
        {children}
      </th>
    ),
    
    td: ({ children, ...props }) => (
      <td className="border border-border px-3 py-2" {...props}>
        {children}
      </td>
    ),
    
    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4"
        {...props}
      >
        {children}
      </blockquote>
    ),
    
    // Links
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    
    // Headers with better spacing
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0" {...props}>
        {children}
      </h1>
    ),
    
    h2: ({ children, ...props }) => (
      <h2 className="text-xl font-semibold mt-5 mb-3 first:mt-0" {...props}>
        {children}
      </h2>
    ),
    
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 first:mt-0" {...props}>
        {children}
      </h3>
    ),
    
    h4: ({ children, ...props }) => (
      <h4 className="text-base font-semibold mt-3 mb-2 first:mt-0" {...props}>
        {children}
      </h4>
    ),
    
    // Lists with better spacing
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 my-3 space-y-1" {...props}>
        {children}
      </ul>
    ),
    
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 my-3 space-y-1" {...props}>
        {children}
      </ol>
    ),
    
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),
    
    // Paragraphs
    p: ({ children, ...props }) => (
      <p className="leading-relaxed my-3 first:mt-0 last:mb-0" {...props}>
        {children}
      </p>
    ),
    
    // Horizontal rule
    hr: ({ ...props }) => (
      <hr className="border-0 border-t border-border my-6" {...props} />
    ),
  };

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownComponent;
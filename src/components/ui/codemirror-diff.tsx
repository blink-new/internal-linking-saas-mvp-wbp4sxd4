import React, { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { MergeView } from '@codemirror/merge';
// Note: Using a simple theme detection for now
const useTheme = () => {
  const [theme, setTheme] = React.useState('light');
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return { theme };
};

interface CodeMirrorDiffProps {
  original: string;
  modified: string;
  splitView?: boolean;
  className?: string;
}

export const CodeMirrorDiff: React.FC<CodeMirrorDiffProps> = ({
  original,
  modified,
  splitView = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MergeView | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous view
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    const isDark = theme === 'dark';
    const extensions = [
      html(),
      EditorView.theme({
        '&': {
          fontSize: '13px',
        },
        '.cm-content': {
          padding: '12px',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          borderRadius: '6px',
        },
        '.cm-scroller': {
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        },
      }),
      ...(isDark ? [oneDark] : []),
    ];

    try {
      const view = new MergeView({
        a: {
          doc: original,
          extensions,
        },
        b: {
          doc: modified,
          extensions,
        },
        parent: containerRef.current,
        orientation: splitView ? 'a-b' : 'a-b', // Always side-by-side for now
        revertControls: 'a-to-b',
        highlightChanges: true,
        gutter: true,
      });

      viewRef.current = view;
    } catch (error) {
      console.error('Error creating CodeMirror diff view:', error);
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [original, modified, splitView, theme]);

  return (
    <div 
      ref={containerRef} 
      className={`border rounded-lg overflow-hidden bg-background ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};
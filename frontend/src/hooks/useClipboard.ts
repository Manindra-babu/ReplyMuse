import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

export function useClipboard() {
  const [copied, setCopied] = useState<boolean>(false);
  const { success, error } = useToast();

  const copy = useCallback(
    async (text: string, label: string = 'Reply copied to clipboard') => {
      if (!text) return;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or insecure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (!successful) throw new Error('execCommand copy failed');
        }

        setCopied(true);
        success(label);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        error('Failed to copy to clipboard. Please select and copy manually.');
      }
    },
    [success, error]
  );

  return { copied, copy };
}

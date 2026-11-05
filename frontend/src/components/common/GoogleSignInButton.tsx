import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
            }
          ) => void;
          disableAutoSelect: () => void;
          prompt?: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (err: any) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    // Load Google Identity Services script if not already present
    const scriptId = 'google-identity-services-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res) => {
          if (res.credential) {
            successRef.current(res.credential);
          } else if (errorRef.current) {
            errorRef.current(new Error('No credential returned from Google.'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Disable Google Auto-Select so the button always renders neutrally as "Continue with Google"
      // instead of locking to or displaying a previously logged-in personal Google profile.
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch {
        // Safe fallback
      }

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 360,
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initializeGoogle();
    }
  }, [clientId, text]);

  // Fallback UI if client ID is not yet configured or script is loading
  return (
    <div className="w-full flex flex-col items-center">
      <div ref={buttonRef} className="w-full flex justify-center" />
      {!clientId && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (onError) {
              onError(new Error('Google Client ID is not configured yet. Add VITE_GOOGLE_CLIENT_ID to your .env'));
            }
          }}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-[#FAF8F5] text-[#2B2B2B] text-xs font-semibold rounded-2xl border border-[#E5DFD3] shadow-2xs transition-colors disabled:opacity-60"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      )}
    </div>
  );
};

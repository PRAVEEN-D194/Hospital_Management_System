/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'agent-id'?: string;
        'action-text'?: string;
        'start-call-text'?: string;
        'end-call-text'?: string;
        'avatar-orb-color-1'?: string;
        'avatar-orb-color-2'?: string;
        'dynamic-variables'?: string;
        'signed-url'?: string;
        'language'?: string;
      },
      HTMLElement
    >;
  }
}


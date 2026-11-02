/** Compact brand glyphs; accessible names belong to their enclosing links. */
export function SocialGlyph({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === 'Instagram' && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
        </>
      )}
      {name === 'Facebook' && (
        <path d="M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5L15 1c-3 0-5 2-5 5v3H7v4h3v8" />
      )}
      {name === 'LinkedIn' && (
        <>
          <path d="M5 9v12M10 21V9h4v2c1-3 6-3 6 2v8M14 21v-7" />
          <circle cx="5" cy="4.5" r="1.5" />
        </>
      )}
      {name === 'YouTube' && (
        <>
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="m10 9 5 3-5 3Z" />
        </>
      )}
      {name === 'TikTok' && <path d="M14 3v13a4 4 0 1 1-4-4M14 3c0 4 3 6 6 6V6c-2 0-3-1-3-3Z" />}
      {name === 'X' && (
        <>
          <path d="m4 3 16 18h-4L0 3Z" transform="translate(2) scale(.9 1)" />
          <path d="m20 3-6.5 7M4 21l6.5-7" />
        </>
      )}
      {name === 'Pinterest' && (
        <path d="m8 22 3-14m-1 8c6 5 12-9 4-12C5 0 1 11 6 14m5-6c2-3 4-1 3 2l-1 4c-1 3-4 3-4 0" />
      )}
      {name === 'WhatsApp' && (
        <>
          <path d="M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5A9 9 0 1 1 21 11.5Z" />
          <path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 1c0 4-5 2-8-1S5 6 8 7Z" />
        </>
      )}
    </svg>
  );
}

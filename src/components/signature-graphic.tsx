import Image from 'next/image';

/** Architectural line work accompanies the original brand artwork; it never redraws the logo. */
export function SignatureGraphic({ className = '' }: { className?: string }) {
  return (
    <div className={`signature-graphic ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 460" fill="none">
        <path d="M18 422H382M48 422V193L200 38L352 193V422M76 422V205L200 80L324 205V422M104 422V217L200 122L296 217V422M132 422V229L200 164L268 229V422M160 422V241L200 206L240 241V422M200 18V442M18 278H382M18 350H382" />
        <circle cx="200" cy="278" r="150" strokeDasharray="3 8" />
      </svg>
      <Image src="/brand/aliyas-gold-logo-hd.webp" alt="" width={240} height={91} />
    </div>
  );
}

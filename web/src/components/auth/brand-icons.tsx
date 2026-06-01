import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export const GoogleIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
    <path fill="#EA4335" d="M12 10.2v3.92h5.45c-.24 1.4-1.75 4.12-5.45 4.12-3.28 0-5.95-2.72-5.95-6.08S8.72 6.08 12 6.08c1.87 0 3.12.8 3.83 1.48l2.61-2.52C16.85 3.54 14.63 2.6 12 2.6 6.74 2.6 2.5 6.84 2.5 12.16s4.24 9.56 9.5 9.56c5.48 0 9.12-3.86 9.12-9.28 0-.62-.07-1.1-.15-1.56H12Z"/>
  </svg>
);

export const AppleIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
    <path d="M16.365 1.43c0 1.14-.46 2.24-1.21 3.02-.8.82-2.11 1.47-3.18 1.38-.14-1.1.45-2.27 1.18-3.02.83-.83 2.22-1.45 3.21-1.38ZM20.5 17.14c-.55 1.24-.82 1.8-1.54 2.9-1.01 1.55-2.43 3.49-4.19 3.5-1.56.02-1.96-1.01-4.08-1-2.12.01-2.56 1.02-4.12 1.01C4.83 23.55 3.49 21.8 2.48 20.26.5 17.25.28 13.7 1.5 11.83c.87-1.34 2.23-2.12 3.51-2.12 1.31 0 2.13.72 3.21.72 1.05 0 1.69-.72 3.2-.72 1.15 0 2.37.63 3.23 1.71-2.84 1.56-2.38 5.62.85 6.72Z"/>
  </svg>
);

export const FacebookIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...props}>
    <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12Z"/>
  </svg>
);

export const GithubIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden {...props}>
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.3-.52-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.6.23 2.78.11 3.08.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.13v3.16c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/>
  </svg>
);

export const BinanceIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#F0B90B" aria-hidden {...props}>
    <path d="m12 3 3.2 3.2-3.2 3.2-3.2-3.2L12 3Zm-6.3 6.3L8.9 12.5l-3.2 3.2-3.2-3.2 3.2-3.2ZM12 10.3l2.2 2.2L12 14.7l-2.2-2.2 2.2-2.2Zm6.3-1 3.2 3.2-3.2 3.2-3.2-3.2 3.2-3.2ZM12 15.8l3.2 3.2L12 22.2 8.8 19l3.2-3.2Z"/>
  </svg>
);

export const WalletIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16v4" />
    <path d="M3 7v12a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 15h.01" />
  </svg>
);

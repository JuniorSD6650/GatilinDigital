import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/** Ícono de trazo (estilo outline 24x24) */
function Stroke({ children, className = 'w-5 h-5', strokeWidth = 1.8, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconArrowLeft = (p: IconProps) => (
  <Stroke {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Stroke>
);
export const IconArrowRight = (p: IconProps) => (
  <Stroke {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Stroke>
);
export const IconChevronLeft = (p: IconProps) => (
  <Stroke {...p}><path d="M15 18l-6-6 6-6" /></Stroke>
);
export const IconChevronRight = (p: IconProps) => (
  <Stroke {...p}><path d="M9 18l6-6-6-6" /></Stroke>
);
export const IconChevronDown = (p: IconProps) => (
  <Stroke {...p}><path d="M6 9l6 6 6-6" /></Stroke>
);
export const IconSearch = (p: IconProps) => (
  <Stroke {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Stroke>
);
export const IconX = (p: IconProps) => (
  <Stroke {...p}><path d="M18 6L6 18M6 6l12 12" /></Stroke>
);
export const IconMenu = (p: IconProps) => (
  <Stroke {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Stroke>
);
export const IconPin = (p: IconProps) => (
  <Stroke {...p}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Stroke>
);
export const IconPhone = (p: IconProps) => (
  <Stroke {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 006 6L15 14l5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></Stroke>
);
export const IconShare = (p: IconProps) => (
  <Stroke {...p}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></Stroke>
);
export const IconHeart = (p: IconProps) => (
  <Stroke {...p}><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z" /></Stroke>
);
export const IconHeartFilled = ({ className = 'w-5 h-5', ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...rest}>
    <path d="M12 20.5s-8-4.9-8-10.9A4.6 4.6 0 0112 6.9a4.6 4.6 0 018 2.7c0 6-8 10.9-8 10.9z" />
  </svg>
);
export const IconCamera = (p: IconProps) => (
  <Stroke {...p}><path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" /><circle cx="12" cy="13.5" r="3.5" /></Stroke>
);
export const IconImage = (p: IconProps) => (
  <Stroke {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-9 9" /></Stroke>
);
export const IconSend = (p: IconProps) => (
  <Stroke {...p}><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z" /></Stroke>
);
export const IconInfo = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Stroke>
);
export const IconCalendar = (p: IconProps) => (
  <Stroke {...p}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Stroke>
);
export const IconClock = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Stroke>
);
export const IconMusic = (p: IconProps) => (
  <Stroke {...p}><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></Stroke>
);
export const IconUsers = (p: IconProps) => (
  <Stroke {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14.5a6.5 6.5 0 013.5 5.5" /></Stroke>
);
export const IconUser = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></Stroke>
);
export const IconLogout = (p: IconProps) => (
  <Stroke {...p}><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l-5-5 5-5M5 12h11" /></Stroke>
);
export const IconGlobe = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></Stroke>
);
export const IconCheck = (p: IconProps) => (
  <Stroke {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Stroke>
);
export const IconLock = (p: IconProps) => (
  <Stroke {...p}><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 018 0v3.5" /></Stroke>
);
export const IconEye = (p: IconProps) => (
  <Stroke {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Stroke>
);
export const IconEyeOff = (p: IconProps) => (
  <Stroke {...p}><path d="M3 3l18 18M10.6 5.1A10.6 10.6 0 0112 5c6.4 0 10 7 10 7a17 17 0 01-3.2 4M6.6 6.6A16.6 16.6 0 002 12s3.6 7 10 7a10 10 0 005.4-1.6M9.9 9.9a3 3 0 004.2 4.2" /></Stroke>
);
export const IconDashboard = (p: IconProps) => (
  <Stroke {...p}><rect x="3" y="3" width="7.5" height="9" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="5" rx="1.5" /><rect x="13.5" y="11" width="7.5" height="10" rx="1.5" /><rect x="3" y="15" width="7.5" height="6" rx="1.5" /></Stroke>
);
export const IconFlag = (p: IconProps) => (
  <Stroke {...p}><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></Stroke>
);
export const IconBuilding = (p: IconProps) => (
  <Stroke {...p}><path d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 9h4a1 1 0 011 1v11M3 21h18M8 8h3M8 12h3M8 16h3" /></Stroke>
);
export const IconNeedle = (p: IconProps) => (
  <Stroke {...p}><path d="M20 4L7 17M17.5 4.5l2 2M7 17l-3 3M14 4c-4 0-7 2-7 5s4 3 4 6-2 5-6 5" /></Stroke>
);
export const IconMask = (p: IconProps) => (
  <Stroke {...p}><path d="M4 6c2.5 1 5 1.5 8 1.5S17.5 7 20 6c0 7-3 13-8 13S4 13 4 6z" /><path d="M8.5 11.5c.8-.6 1.7-.6 2.5 0M13 11.5c.8-.6 1.7-.6 2.5 0M10 15.5c1.3.8 2.7.8 4 0" /></Stroke>
);
export const IconClipboard = (p: IconProps) => (
  <Stroke {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></Stroke>
);
export const IconUserPlus = (p: IconProps) => (
  <Stroke {...p}><circle cx="10" cy="8" r="4" /><path d="M2.5 21a7.5 7.5 0 0115 0M19 8v6M16 11h6" /></Stroke>
);
export const IconKey = (p: IconProps) => (
  <Stroke {...p}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l2.5 2.5M14.5 8.5l2 2" /></Stroke>
);
export const IconBellRing = (p: IconProps) => (
  <Stroke {...p}><path d="M6 10a6 6 0 0112 0v4l1.5 3h-15L6 14v-4z" /><path d="M10 20a2 2 0 004 0" /></Stroke>
);
export const IconAlert = (p: IconProps) => (
  <Stroke {...p}><path d="M12 3l9.5 17h-19L12 3z" /><path d="M12 10v4M12 17.5h.01" /></Stroke>
);
export const IconChurch = (p: IconProps) => (
  <Stroke {...p}><path d="M12 2v4M10 4h4M6 21V11l6-5 6 5v10M3 21h18M10 21v-4a2 2 0 014 0v4" /></Stroke>
);
export const IconExternal = (p: IconProps) => (
  <Stroke {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></Stroke>
);
export const IconSparkle = (p: IconProps) => (
  <Stroke {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7L19 16z" /></Stroke>
);

export const IconFacebook = ({ className = 'w-5 h-5', ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...rest}>
    <path d="M24 12.07C24 5.44 18.63.07 12 .07S0 5.44 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.38H7.08v-3.47h3.05V9.43c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.38C19.61 23.03 24 18.06 24 12.07z" />
  </svg>
);

export const Spinner = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// --- Acciones del panel de administración ---
export const IconEdit = (p: IconProps) => (
  <Stroke {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></Stroke>
);
export const IconTrash = (p: IconProps) => (
  <Stroke {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></Stroke>
);
export const IconPlus = (p: IconProps) => (
  <Stroke {...p}><path d="M12 5v14M5 12h14" /></Stroke>
);
export const IconDownload = (p: IconProps) => (
  <Stroke {...p}><path d="M12 4v12M6 10l6 6 6-6M4 20h16" /></Stroke>
);
export const IconUpload = (p: IconProps) => (
  <Stroke {...p}><path d="M12 20V8M6 14l6-6 6 6M4 4h16" /></Stroke>
);
export const IconSettings = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></Stroke>
);

export const IconMap = (p: IconProps) => (
  <Stroke {...p}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></Stroke>
);
export const IconNavigation = (p: IconProps) => (
  <Stroke {...p}><path d="m3 11 18-8-8 18-2-8-8-2z" /></Stroke>
);
export const IconBell = (p: IconProps) => (
  <Stroke {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0" /></Stroke>
);
export const IconStar = (p: IconProps) => (
  <Stroke {...p}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" /></Stroke>
);
export const IconStarFilled = ({ className = 'w-5 h-5', ...rest }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} {...rest}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" />
  </svg>
);
export const IconHistory = (p: IconProps) => (
  <Stroke {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" /></Stroke>
);
export const IconWifiOff = (p: IconProps) => (
  <Stroke {...p}><path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5.2-2.8M19 13a10 10 0 0 0-2.3-1.7M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 11 5M12 20h.01" /></Stroke>
);

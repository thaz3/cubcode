type QuickLinkIconProps = {
  className?: string;
};

export function CubDeviceIcon({ className }: QuickLinkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <line x1="10" y1="18.5" x2="14" y2="18.5" />
    </svg>
  );
}

export function CalendarIcon({ className }: QuickLinkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  );
}

export function HomeIcon({ className }: QuickLinkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

export function StarIcon({ className }: QuickLinkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="m12 3.5 2.4 5.5 6 .6-4.5 4 1.3 5.9L12 16.8 6.8 19.5l1.3-5.9-4.5-4 6-.6L12 3.5Z" />
    </svg>
  );
}

export function TemplateIcon({ className }: QuickLinkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <rect x="4" y="4" width="16" height="5" rx="1" />
      <rect x="4" y="11" width="16" height="5" rx="1" />
      <rect x="4" y="18" width="10" height="2" rx="1" />
    </svg>
  );
}

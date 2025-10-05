export function SquaraLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M21.5 10C21.5 9.17157 22.1716 8.5 23 8.5C23.8284 8.5 24.5 9.17157 24.5 10V15C24.5 16.1046 23.6046 17 22.5 17H12.5C11.1193 17 10 18.1193 10 19.5V22.5C10 23.3284 9.32843 24 8.5 24C7.67157 24 7 23.3284 7 22.5V17.5C7 16.3954 7.89543 15.5 9 15.5H19C20.3807 15.5 21.5 14.3807 21.5 13V10Z"
        fill="hsl(var(--background))"
      />
    </svg>
  );
}

import { cn } from "@/lib/utils";

export function EthereumIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
    >
      <path d="M12 2l6 7-6 7-6-7 6-7z" />
      <path d="M12 16l6 5-6-5-6 5 6-5z" />
      <path d="M12 2v14" />
      <path d="M6 9l6 7 6-7" />
      <path d="M6 9l6-7 6 7" />
    </svg>
  );
}

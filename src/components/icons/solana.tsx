import { cn } from "@/lib/utils";

export function SolanaIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={cn("h-6 w-6", className)}
    >
      <title>Solana</title>
      <path d="M3.45 7.913h17.1v2.334H3.45zm0 5.832h17.1v2.334H3.45zm-1.832-8.166h20.765v2.334H1.618zm1.832 10.5h17.1v2.334H3.45zM1.618 3.45h20.765v2.334H1.618z" />
    </svg>
  );
}

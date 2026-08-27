import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageShell({ children, className, narrow }: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[100vw] px-4 pb-10 pt-24 sm:px-6",
        "pt-[max(6rem,calc(env(safe-area-inset-top)+5rem))]",
        "pb-[max(2.5rem,env(safe-area-inset-bottom))]",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className
      )}
    >
      {children}
    </div>
  );
}

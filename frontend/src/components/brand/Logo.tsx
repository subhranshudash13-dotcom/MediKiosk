import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  variant = "dark",
}: {
  href?: string;
  className?: string;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";

  const content = (
    <div className={cn("flex items-center select-none group shrink-0", className)}>
      <img
        src={isLight ? "/medikiosk-logo-light.svg" : "/medikiosk-logo.svg"}
        alt="MediKiosk"
        width={170}
        height={40}
        className="h-9 sm:h-10 w-auto max-h-10 object-contain transition-transform duration-150 group-hover:scale-105"
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-md inline-flex items-center shrink-0"
      >
        {content}
      </Link>
    );
  }

  return content;
}

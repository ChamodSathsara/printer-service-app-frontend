import Image from "next/image";
import { cn } from "@/lib/cn";

const LOGO_URL =
  "https://www.gestetner.lk/wp-content/uploads/2023/11/footer-logo.jpg";

export function Logo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-border",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO_URL}
        alt="Gestetner logo"
        fill
        sizes={`${size}px`}
        className="object-contain p-1"
      />
    </div>
  );
}

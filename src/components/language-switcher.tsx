"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Props = {
  currentLocale: AppLocale;
  label: string;
  tone?: "light" | "dark";
};

export function LanguageSwitcher({ currentLocale, label, tone = "light" }: Props) {
  const pathname = usePathname();
  const targetLocale = currentLocale === "ko" ? "en" : "ko";

  const targetPath = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return `/${targetLocale}`;
    }

    segments[0] = targetLocale;
    return `/${segments.join("/")}`;
  }, [pathname, targetLocale]);

  return (
    <Link
      href={targetPath}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
        tone === "dark"
          ? "border border-white/15 bg-white/8 text-white hover:border-lime-300/40 hover:bg-white/12"
          : "border border-zinc-900/10 bg-white/90 text-zinc-800 shadow-sm hover:border-lime-400/60 hover:bg-lime-50",
      )}
    >
      <span className="h-2 w-2 rounded-full bg-lime-300" />
      {label}
    </Link>
  );
}

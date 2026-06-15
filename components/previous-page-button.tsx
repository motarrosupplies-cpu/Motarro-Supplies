"use client";

import type { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviousPageButtonProps {
  fallbackHref: string;
  children?: React.ReactNode;
  className?: string;
  variant?: ComponentProps<typeof Button>["variant"];
}

export function PreviousPageButton({
  fallbackHref,
  children = "Back",
  className = "mb-6",
  variant = "ghost",
}: PreviousPageButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleClick}
    >
      <ChevronLeft className="w-4 h-4 mr-2" />
      {children}
    </Button>
  );
}

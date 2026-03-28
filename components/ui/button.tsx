"use client";

import * as React from "react";

type Variant = "default" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-60 disabled:pointer-events-none";
  const variants: Record<Variant, string> = {
    default: "bg-amber-600 text-white hover:bg-amber-700",
    outline: "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white shadow-none",
    ghost: "bg-transparent hover:bg-black/5 shadow-none",
  };
  const sizes: Record<Size, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-6 text-base",
  };

  return <button className={cx(base, variants[variant], sizes[size], className)} {...props} />;
}

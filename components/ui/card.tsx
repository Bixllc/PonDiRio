import * as React from "react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["bg-white rounded-3xl shadow", className].filter(Boolean).join(" ")} {...props} />;
}

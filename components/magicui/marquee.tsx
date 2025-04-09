"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  vertical?: boolean
  children?: React.ReactNode
  repeat?: number
}

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  vertical = false,
  children,
  repeat = 1,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden [--duration:40s] [--gap:1rem]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around gap-[--gap]",
          vertical ? "animate-scroll-vertical" : "animate-scroll",
          reverse && "direction-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          vertical ? "flex-col" : "flex-row"
        )}
        style={{
          "--repeat": repeat,
        } as React.CSSProperties}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 justify-around gap-[--gap]",
          vertical ? "animate-scroll-vertical" : "animate-scroll",
          reverse && "direction-reverse",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
          vertical ? "flex-col" : "flex-row"
        )}
        style={{
          "--repeat": repeat,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  )
} 
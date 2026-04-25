"use client";

import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InteractiveGridPatternProps {
  width?: number;
  height?: number;
  squares?: [number, number]; // [columns, rows]
  className?: string;
  squaresClassName?: string;
}

export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [30, 30],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [horizontal, vertical] = squares;

  return (
    <svg
      width={width * horizontal}
      height={height * vertical}
      viewBox={`0 0 ${width * horizontal} ${height * vertical}`}
      className={cn(
        "absolute inset-0 h-full w-full stroke-gray-400/30",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x="-1"
          y="-1"
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray="0"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      <g className="fill-current">
        {Array.from({ length: horizontal * vertical }).map((_, i) => {
            const x = (i % horizontal) * width;
            const y = Math.floor(i / horizontal) * height;
            return (
                <rect
                    key={i}
                    x={x}
                    y={y}
                    width={width - 1}
                    height={height - 1}
                    className={cn(
                        "opacity-0 stroke-none transition-all",
                        // 1000ms duration creates the 'tail' effect
                        "duration-1000 hover:opacity-100 hover:duration-0",
                        
                        /**
                         * THE "WHITE BACKGROUND" FIX:
                         * 1. [filter:blur(1px)] - Softens the edges so it's not a sharp box.
                         * 2. drop-shadow - Adds a 'halo' of your brand color so it pops against white.
                         */
                        "hover:filter-[blur(1px)_drop-shadow(0_0_4px_#B6FF3B)]",
                        
                        squaresClassName,
                    )}
                />
            );
        })}
      </g>
    </svg>
  );
}
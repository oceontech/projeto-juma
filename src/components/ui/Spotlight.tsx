'use client'

import { forwardRef } from 'react'
import type React from 'react'

type SpotlightProps = {
  className?: string
  fill?: string
  fillOpacity?: number
  style?: React.CSSProperties
  stdDeviation?: number
  filterId?: string
  translateX?: number
  translateY?: number
}

export const Spotlight = forwardRef<SVGSVGElement, SpotlightProps>(
  (
    {
      className,
      fill = 'white',
      fillOpacity = 0.35,
      style,
      stdDeviation = 100,
      filterId = 'spotlight-filter',
      translateX = 3427,
      translateY = 1020,
    },
    ref,
  ) => (
    <svg
      ref={ref}
      style={style}
      className={[
        'pointer-events-none absolute z-[999] h-[169%] w-[138%] lg:w-[84%]',
        className,
      ].filter(Boolean).join(' ')}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      preserveAspectRatio="xMidYMin meet"
      fill="none"
    >
      <g filter={`url(#${filterId})`}>
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform={`matrix(-0.822377 -0.568943 -0.568943 0.822377 ${translateX} ${translateY})`}
          fill={fill}
          fillOpacity={fillOpacity}
        />
      </g>
      <defs>
        <filter
          id={filterId}
          x="-3000"
          y="-2000"
          width="10000"
          height="8000"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={stdDeviation} />
        </filter>
      </defs>
    </svg>
  ),
)
Spotlight.displayName = 'Spotlight'

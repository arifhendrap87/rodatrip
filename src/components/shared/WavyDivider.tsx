interface WavyDividerProps {
  className?: string
}

export function WavyDivider({ className }: WavyDividerProps) {
  return (
    <div className={`relative h-20 sm:h-28 overflow-hidden ${className || ""}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 w-full h-full"
      >
        <path
          d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
          fill="hsl(18 100% 55%)"
          opacity="0.04"
        />
        <path
          d="M0,40 C180,80 360,0 540,50 C720,100 900,0 1080,40 C1260,80 1350,30 1440,40 L1440,120 L0,120 Z"
          fill="hsl(18 100% 55%)"
          opacity="0.025"
        />
        <path
          d="M0,70 C200,95 400,40 600,65 C800,90 1000,50 1200,70 C1300,80 1400,60 1440,70 L1440,120 L0,120 Z"
          fill="hsl(217 91% 55%)"
          opacity="0.02"
        />
      </svg>
    </div>
  )
}

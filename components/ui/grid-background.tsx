"use client"


export function GridBackground() {
  return (
    <div
      className="fixed inset-0 z-[-10] pointer-events-none"
      style={{
        background: `radial-gradient(circle at center, var(--accent), var(--background))`,
      }}
    >
      <div
        className="absolute inset-0 z-[-10]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          opacity: 0.06,
        }}
      />
    </div>
  )
}
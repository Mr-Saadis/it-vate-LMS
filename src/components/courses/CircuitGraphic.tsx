import React from 'react'

export function CircuitGraphic() {
  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#F18231]/15 to-sky-500/10 rounded-2xl blur-lg opacity-40 pointer-events-none" />
      
      {/* Sleek Seamless PCB Container - No Heavy Border */}
      <div className="relative w-full rounded-2xl bg-[#090d16]/60 p-4 backdrop-blur-sm overflow-hidden">
        
        {/* Subtle Circuit Grid Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10 stroke-slate-500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="pcb-grid-compact" width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M 18 0 L 0 0 0 18" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pcb-grid-compact)" />
        </svg>

        {/* PCB Traces Vector Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 250 210" fill="none">
          {/* Traces */}
          <path d="M 15 35 L 60 35 L 85 55 L 85 75" stroke="#F18231" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.75" />
          <path d="M 235 35 L 190 35 L 165 55 L 165 75" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.75" />
          <path d="M 25 175 L 70 175 L 95 155 L 95 135" stroke="#38BDF8" strokeWidth="1.2" opacity="0.65" />
          <path d="M 225 175 L 180 175 L 155 155 L 155 135" stroke="#F18231" strokeWidth="1.2" strokeDasharray="4 2" opacity="0.75" />

          {/* Solder Nodes */}
          <circle cx="15" cy="35" r="2.5" fill="#F18231" />
          <circle cx="235" cy="35" r="2.5" fill="#38BDF8" />
          <circle cx="25" cy="175" r="2.5" fill="#38BDF8" />
          <circle cx="225" cy="175" r="2.5" fill="#F18231" />
        </svg>

        {/* Central MCU Chip */}
        <div className="relative z-10 my-1 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32 rounded-lg bg-slate-950 border border-slate-800/80 shadow-lg flex items-center justify-center p-2.5">
            
            {/* SMD Pin Arrays */}
            <div className="absolute -top-1.5 left-3.5 right-3.5 flex justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-xs opacity-90" />
              ))}
            </div>
            <div className="absolute -bottom-1.5 left-3.5 right-3.5 flex justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-xs opacity-90" />
              ))}
            </div>
            <div className="absolute -left-1.5 top-3.5 bottom-3.5 flex flex-col justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 bg-amber-500 rounded-xs opacity-90" />
              ))}
            </div>
            <div className="absolute -right-1.5 top-3.5 bottom-3.5 flex flex-col justify-between">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 bg-amber-500 rounded-xs opacity-90" />
              ))}
            </div>

            {/* Inner Silicon Die Core */}
            <div className="w-full h-full rounded bg-slate-900 border border-slate-800/90 flex flex-col items-center justify-center text-center p-1.5">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-2 h-2 rounded bg-[#F18231] flex items-center justify-center">
                  <span className="text-[5px] font-black text-white">IT</span>
                </div>
                <span className="text-[8px] font-extrabold tracking-wider text-white">IT-VATE</span>
              </div>
              <span className="text-[7px] font-mono text-slate-400">STM32F4</span>
              <div className="mt-1 flex items-center gap-1 bg-emerald-950/40 border border-emerald-800/30 rounded px-1.5 py-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[6px] font-mono text-emerald-400 font-bold">READY</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sleek Spec Badges */}
        <div className="relative z-10 mt-2 flex items-center justify-between text-[8px] font-mono text-slate-400 border-t border-slate-800/50 pt-2">
          <span className="text-[#F18231]">MCU • 168MHz</span>
          <span className="text-sky-400">CORTEX-M4</span>
        </div>

      </div>
    </div>
  )
}

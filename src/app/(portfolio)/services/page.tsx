import { Cpu, Wifi, Layers, Terminal, Server, Radio } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 space-y-16">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F18231]">Technical Services</span>
        <h1 className="text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
          Industrial Engineering & Hardware R&D Capabilities
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          IT-vate Solutions provides end-to-end hardware engineering services for industrial automation, smart agriculture, and edge telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-8 space-y-4">
          <Cpu className="h-8 w-8 text-[#F18231]" />
          <h3 className="text-xl font-bold text-[#0F172A]">Firmware & Embedded Systems</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2"><Terminal className="h-4 w-4 text-slate-400" /> ARM Cortex-M / STM32 / ESP32 Bare Metal Programming</li>
            <li className="flex items-center gap-2"><Terminal className="h-4 w-4 text-slate-400" /> FreeRTOS Multi-Threading & Inter-task Queues</li>
            <li className="flex items-center gap-2"><Terminal className="h-4 w-4 text-slate-400" /> Low-Power Sleep Modes & Battery Management</li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 space-y-4">
          <Wifi className="h-8 w-8 text-[#F18231]" />
          <h3 className="text-xl font-bold text-[#0F172A]">Industrial IoT & Edge Computing</h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-2"><Server className="h-4 w-4 text-slate-400" /> MQTT / HTTP / Modbus RS485 Industrial Communication</li>
            <li className="flex items-center gap-2"><Radio className="h-4 w-4 text-slate-400" /> LoRaWAN & Cellular Edge Node Design</li>
            <li className="flex items-center gap-2"><Server className="h-4 w-4 text-slate-400" /> AWS IoT Core & Private Cloud Telemetry</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

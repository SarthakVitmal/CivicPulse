import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: number
  color: string
}

export default function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  return (
    <Card className="p-6 bg-card border border-border hover:shadow-lg transition-all group overflow-hidden relative">
      {/* Gradient background decoration */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 -mr-8 -mt-8 rounded-full`}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={`bg-gradient-to-br ${color} p-3 rounded-xl text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {value === 0 ? "No items" : `${value} item${value !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>
    </Card>
  )
}

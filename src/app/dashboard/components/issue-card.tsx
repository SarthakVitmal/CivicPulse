import { MapPin, Clock, TrendingUp, Camera } from "lucide-react"
import { Card } from "@/components/ui/card"

interface IssueCardProps {
  issue: {
    _id: string
    title: string
    description: string
    category: string
    status: string
    priority: string
    address: string
    upvotes: number
    createdAt: string
    photos: { url: string; publicId: string }[]
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-300" }
    case "In Progress":
      return { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300" }
    case "Resolved":
      return { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300" }
    case "Rejected":
      return { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300" }
    default:
      return { bg: "bg-gray-100 dark:bg-gray-900/20", text: "text-gray-700 dark:text-gray-300" }
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Critical":
      return { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-700 dark:text-red-300" }
    case "High":
      return { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-700 dark:text-orange-300" }
    case "Medium":
      return { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-700 dark:text-yellow-300" }
    case "Low":
      return { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-700 dark:text-green-300" }
    default:
      return { bg: "bg-gray-100 dark:bg-gray-900/20", text: "text-gray-700 dark:text-gray-300" }
  }
}

export default function IssueCard({ issue }: IssueCardProps) {
  const statusColor = getStatusColor(issue.status)
  const priorityColor = getPriorityColor(issue.priority)

  return (
    <Card className="p-6 hover:shadow-lg transition-all bg-card border border-border group">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {issue.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
              {issue.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColor.bg} ${priorityColor.text}`}>
              {issue.priority}
            </span>
          </div>

          {/* Description */}
          <p className="text-foreground/80 mb-4 text-sm leading-relaxed line-clamp-2">{issue.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{issue.address}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 flex-shrink-0" />
              {new Date(issue.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              {issue.upvotes} upvotes
            </span>
          </div>
        </div>

        {/* Right side - Category and photos */}
        <div className="flex items-start gap-3 lg:flex-col lg:items-end">
          <span className="inline-block bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
            {issue.category}
          </span>
          {issue.photos && issue.photos.length > 0 && (
            <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg">
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{issue.photos.length}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

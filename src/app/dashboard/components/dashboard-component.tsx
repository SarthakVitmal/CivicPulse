"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  FileText,
  Clock,
  TrendingUp,
  CheckCircle2,
  Plus,
  Users,
  LogOut,
  AlertCircle,
  Menu,
  X,
  BarChart3,
  Home,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import StatsCard from "../components/stats-card"
import IssueCard from "../components/issue-card"
import ReportIssueForm from "../components/report-issue-form"

interface Issue {
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

interface User {
  name: string
  email: string
}

export default function DashboardComponent() {
  const router = useRouter()
  const { t, setLanguage, getLanguage } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("my-issues")
  const [myIssues, setMyIssues] = useState<Issue[]>([])
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([])
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
  })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const language = getLanguage()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/")
      return
    }

    setUser(JSON.parse(userData))
    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const [myIssuesRes, nearbyIssuesRes] = await Promise.all([
        fetch("/api/issues/my-issues", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/issues/nearby", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (myIssuesRes.ok) {
        const data = await myIssuesRes.json()
        setMyIssues(data.issues || [])
        setStats({
          totalIssues: data.issues?.length || 0,
          pendingIssues: data.issues?.filter((i: Issue) => i.status === "Pending").length || 0,
          inProgressIssues: data.issues?.filter((i: Issue) => i.status === "In Progress").length || 0,
          resolvedIssues: data.issues?.filter((i: Issue) => i.status === "Resolved").length || 0,
        })
      }

      if (nearbyIssuesRes.ok) {
        const data = await nearbyIssuesRes.json()
        setNearbyIssues(data.issues || [])
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">{t("loadingDashboard")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 md:hidden z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 bg-card border-r border-border h-screen transition-transform z-50 md:z-0 flex-shrink-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground p-2.5 rounded-xl">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Civic Pulse</h1>
              <p className="text-xs text-muted-foreground">Community Hub</p>
            </div>
          </div>
        </div>

        <nav className="p-6 space-y-2 flex-1 overflow-y-auto">
          {[
            { id: "dashboard", icon: Home, label: "Dashboard", disabled: false },
            { id: "my-issues", icon: FileText, label: "My Issues", disabled: false },
            { id: "nearby", icon: Users, label: "Nearby Issues", disabled: false },
            { id: "report", icon: Plus, label: "Report Issue", disabled: false },
            { id: "stats", icon: BarChart3, label: "Analytics", disabled: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-border bg-card flex-shrink-0">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "mr")}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary focus:border-transparent bg-background hover:bg-muted transition-colors mb-3"
            aria-label="Select Language"
          >
            <option value="en">🌐 English</option>
            <option value="hi">🌐 हिंदी</option>
            <option value="mr">🌐 मराठी</option>
          </select>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2 text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-foreground">
                {t("welcome")}, <span className="text-primary">{user?.name}</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 lg:p-8">
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="mb-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{t("dashboard")}</h2>
                  <p className="text-muted-foreground">{t("overviewYourIssues")}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    icon={FileText}
                    label={t("totalIssues")}
                    value={stats.totalIssues}
                    color="from-primary to-secondary"
                  />
                  <StatsCard
                    icon={Clock}
                    label={t("pending")}
                    value={stats.pendingIssues}
                    color="from-yellow-500 to-orange-500"
                  />
                  <StatsCard
                    icon={TrendingUp}
                    label={t("inProgress")}
                    value={stats.inProgressIssues}
                    color="from-green-500 to-emerald-500"
                  />
                  <StatsCard
                    icon={CheckCircle2}
                    label={t("resolved")}
                    value={stats.resolvedIssues}
                    color="from-green-500 to-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t("quickActions")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card
                    className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                    onClick={() => setActiveTab("my-issues")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-4 rounded-xl">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{t("myIssues")}</h4>
                        <p className="text-sm text-muted-foreground">{myIssues.length} issues reported</p>
                      </div>
                    </div>
                  </Card>
                  <Card
                    className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
                    onClick={() => setActiveTab("report")}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-accent/10 p-4 rounded-xl">
                        <Plus className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{t("reportNewIssue")}</h4>
                        <p className="text-sm text-muted-foreground">Submit a civic issue</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeTab === "my-issues" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("myIssues")}</h2>
                <p className="text-muted-foreground">{myIssues.length} issues you&apos;ve reported</p>
              </div>

              {myIssues.length === 0 ? (
                <Card className="p-12 text-center bg-card border border-border">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{t("No Issues Reported Yet")}</h3>
                  <Button onClick={() => setActiveTab("report")} className="gap-2 bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    {t("Report First Issue")}
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myIssues.map((issue) => (
                    <IssueCard key={issue._id} issue={issue} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "nearby" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("nearbyIssues")}</h2>
                <p className="text-muted-foreground">{nearbyIssues.length} issues in your area</p>
              </div>

              {nearbyIssues.length === 0 ? (
                <Card className="p-12 text-center bg-card border border-border">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{t("noNearbyIssues")}</h3>
                  <p className="text-muted-foreground">{t("noNearbyDescription")}</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {nearbyIssues.map((issue) => (
                    <IssueCard key={issue._id} issue={issue} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "report" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">{t("reportNewIssue")}</h2>
                <p className="text-muted-foreground">Share civic issues in your community</p>
              </div>

              <div className="max-w-3xl">
                <Card className="p-8 bg-card border border-border">
                  <Card className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-1">🤖 {t("aiPoweredPriority")}</h3>
                        <p className="text-xs text-foreground/70 leading-relaxed">{t("aiPriorityDescription")}</p>
                      </div>
                    </div>
                  </Card>

                  <ReportIssueForm
                    onSuccess={() => {
                      const token = localStorage.getItem("token")
                      if (token) fetchDashboardData(token)
                      setActiveTab("my-issues")
                    }}
                  />
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

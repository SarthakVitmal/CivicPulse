"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Camera, CheckCircle, Zap, Users, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

const heroImages = [
  {
    url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop",
    alt: "India Gate Delhi"
  },
  {
    url: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2000&auto=format&fit=crop",
    alt: "Mumbai city streets"
  },
  {
    url: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2000&auto=format&fit=crop",
    alt: "Bangalore infrastructure"
  },
  {
    url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2000&auto=format&fit=crop",
    alt: "Indian city development"
  }
]

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])
  return (
    <div className="w-full bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Civic Pulse</span>
                <p className="text-xs text-gray-600 hidden sm:block">Official City Service</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32 lg:py-40">
        {/* Background Image Slideshow with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/80 z-10"></div>
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.alt}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
            />
          ))}
        </div>

        {/* Slideshow Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${index === currentImageIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="mx-auto max-w-4xl relative z-20">
          <div className="text-center">
            <div className="mb-6 inline-block rounded-full bg-blue-600/90 backdrop-blur-sm px-4 py-2 shadow-lg">
              <span className="text-sm font-medium text-white">🏛️ Official Government Service</span>
            </div>
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
              Report Local Issues. Create Real Change.
            </h1>
            <p className="mb-8 text-balance text-lg text-gray-100 sm:text-xl drop-shadow-md">
              See a broken streetlight, pothole, or litter? Report it in seconds. Connect directly with your city
              authorities and watch issues get fixed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl cursor-pointer">
                Start Reporting Now
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">Secure & Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">Government Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 px-4 py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to make your neighborhood better</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <div className="mb-3 inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 w-fit">
                Step 1
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Snap & Upload</h3>
              <p className="text-muted-foreground">
                Take a photo of any civic issue in your area—potholes, broken lights, or trash.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-600 shadow-lg">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div className="mb-3 inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 w-fit">
                Step 2
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Add Location</h3>
              <p className="text-muted-foreground">
                Auto-detect your location or pin it on the map. Your report is pinpointed exactly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <div className="mb-3 inline-flex items-center justify-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 w-fit">
                Step 3
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Watch It Get Fixed</h3>
              <p className="text-muted-foreground">
                Reports go to authorities. Track progress and celebrate community wins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-t border-border/40 px-4 py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-indigo-900/95 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2000&auto=format&fit=crop"
            alt="City skyline"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto max-w-6xl relative z-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">Making Real Impact</h2>
            <p className="text-blue-100 text-lg">Join thousands of citizens creating positive change</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="mb-2 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">1,247</div>
              <p className="text-blue-100 font-medium">Issues Reported</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="mb-2 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">892</div>
              <p className="text-blue-100 font-medium">Issues Resolved</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="mb-2 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">15K+</div>
              <p className="text-blue-100 font-medium">Active Citizens</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Civic Pulse */}
      <section className="border-t border-border/40 px-4 py-16 sm:py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">Why Choose Civic Pulse?</h2>
            <p className="text-lg text-muted-foreground">Trusted by citizens and government authorities</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1 */}
            <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Report issues in under 30 seconds. No forms, no waiting.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 2 */}
            <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-700 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">Community Powered</h3>
                <p className="text-sm text-muted-foreground">
                  See reports from your neighbors. Feel the community impact.
                </p>
              </CardContent>
            </Card>

            {/* Benefit 3 */}
            <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-white shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">Real Results</h3>
                <p className="text-sm text-muted-foreground">Watch issues get resolved. Your voice drives change.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-border/40 px-4 py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/90 to-indigo-900/90 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop"
            alt="Community together"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mx-auto max-w-4xl text-center relative z-20">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl drop-shadow-lg">Ready to Make a Difference?</h2>
          <p className="mb-8 text-lg text-blue-100 drop-shadow-md">
            Join thousands of citizens improving their neighborhoods, one report at a time.
          </p>
          <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 shadow-2xl font-bold">
            Start Reporting Today →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Civic Pulse</span>
          </div>
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-foreground">Social</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Civic Pulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

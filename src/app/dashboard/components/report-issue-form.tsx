"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

function ReportIssueFormComponent({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  })
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)

  const categories = [
    "Road & Infrastructure",
    "Water Supply",
    "Electricity",
    "Waste Management",
    "Street Lights",
    "Public Transport",
    "Parks & Recreation",
    "Health & Sanitation",
    "Public Safety",
    "Other",
  ]

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setLocation({ lat: latitude, lng: longitude })

          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            )
            const data = await response.json()
            
            // Build precise address with street-level details
            const addressParts = []
            
            // Filter out continent/country level data
            const ignoredTerms = ['Asia', 'India', 'taluka', 'district', 'Division']
            
            // Try to get street/road name from informative array (most specific)
            if (data.localityInfo?.informative) {
              for (const info of data.localityInfo.informative) {
                if (info.name && 
                    !info.name.includes('unnamed') && 
                    info.order >= 0 && 
                    info.order <= 3 &&
                    !ignoredTerms.some(term => info.name.includes(term))) {
                  addressParts.push(info.name)
                  break // Only take the first specific location
                }
              }
            }
            
            // Get neighborhood/sector from administrative (skip if it's a taluka/district)
            if (data.localityInfo?.administrative) {
              for (let i = 8; i >= 3; i--) {
                const admin = data.localityInfo.administrative[i]
                if (admin?.name && 
                    !ignoredTerms.some(term => admin.name.toLowerCase().includes(term.toLowerCase())) &&
                    !addressParts.some(part => part.includes(admin.name))) {
                  addressParts.push(admin.name)
                  if (addressParts.length >= 2) break // Limit to 2 administrative levels
                }
              }
            }
            
            // Add city (avoid if already included)
            const cityName = data.city || data.locality
            if (cityName && !addressParts.some(part => part.toLowerCase().includes(cityName.toLowerCase()))) {
              addressParts.push(cityName)
            }
            
            // Add state if different from city
            if (data.principalSubdivision && 
                data.principalSubdivision !== cityName &&
                !addressParts.includes(data.principalSubdivision)) {
              addressParts.push(data.principalSubdivision)
            }
            
            const preciseAddress = addressParts.length > 0 
              ? addressParts.join(", ") 
              : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            
            setAddress(preciseAddress)
          } catch (error) {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          }
          setGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please enable location services.")
          setGettingLocation(false)
        },
      )
    } else {
      alert("Geolocation is not supported by your browser.")
      setGettingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!location) {
      alert("Please capture your location before submitting.")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("latitude", location.lat.toString())
      formDataToSend.append("longitude", location.lng.toString())
      formDataToSend.append("address", address)

      photos.forEach((photo) => {
        formDataToSend.append("photos", photo)
      })

      const response = await fetch("/api/issues/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        alert("Issue reported successfully!")
        setFormData({ title: "", description: "", category: "" })
        setLocation(null)
        setAddress("")
        setPhotos([])
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to report issue")
      }
    } catch (error) {
      console.error("Error submitting issue:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t("issueTitle")}</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background"
          placeholder={t("issueTitlePlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t("description")}</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none bg-background"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t("category")}</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background"
        >
          <option value="">{t("selectCategory")}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-2">{t("priorityAutoCalculated")}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t("location")}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={address || t("locationNotCaptured")}
            readOnly
            className="flex-1 px-4 py-3 text-sm border border-border rounded-lg bg-muted"
          />
          <Button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="gap-2 px-4 py-3 text-sm whitespace-nowrap bg-secondary hover:bg-secondary/90"
          >
            <MapPin className="h-4 w-4" />
            {gettingLocation ? t("gettingLocation") : t("captureLocation")}
          </Button>
        </div>
        {location && (
          <p className="text-xs text-muted-foreground mt-2">
            {t("coordinates")}: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">{t("photos")}</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          className="w-full px-4 py-3 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background"
        />
        {photos.length > 0 && (
          <p className="text-sm text-foreground mt-2 font-medium">
            {photos.length} {t("photosSelected")}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full gap-2 text-sm py-6 font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {t("submitting")}
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            {t("reportIssue")}
          </>
        )}
      </Button>
    </form>
  )
}

export default ReportIssueFormComponent

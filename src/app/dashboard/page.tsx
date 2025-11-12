'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FileText,
  Clock,
  TrendingUp,
  CheckCircle2,
  MapPin,
  Plus,
  Users,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  address: string;
  upvotes: number;
  createdAt: string;
  photos: { url: string; publicId: string }[];
}

interface User {
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { t, setLanguage, getLanguage } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('my-issues');
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
  });
  const [loading, setLoading] = useState(true);
  const language = getLanguage();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData(token);
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    try {
      const [myIssuesRes, nearbyIssuesRes] = await Promise.all([
        fetch('/api/issues/my-issues', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/issues/nearby', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (myIssuesRes.ok) {
        const data = await myIssuesRes.json();
        setMyIssues(data.issues || []);
        setStats({
          totalIssues: data.issues?.length || 0,
          pendingIssues: data.issues?.filter((i: Issue) => i.status === 'Pending').length || 0,
          inProgressIssues: data.issues?.filter((i: Issue) => i.status === 'In Progress').length || 0,
          resolvedIssues: data.issues?.filter((i: Issue) => i.status === 'Resolved').length || 0,
        });
      }

      if (nearbyIssuesRes.ok) {
        const data = await nearbyIssuesRes.json();
        setNearbyIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Resolved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700';
      case 'High':
        return 'bg-orange-100 text-orange-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Civic Pulse
                </h1>
                <p className="text-sm text-gray-600">
                  {t('welcome')}, <span className="font-semibold text-blue-600">{user?.name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors"
                aria-label="Select Language"
              >
                <option value="en">🌐 English</option>
                <option value="hi">🌐 हिंदी</option>
                <option value="mr">🌐 मराठी</option>
              </select>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('totalIssues')}</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalIssues}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('pending')}</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingIssues}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('inProgress')}</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgressIssues}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('resolved')}</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolvedIssues}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('my-issues')}
            className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all ${
              activeTab === 'my-issues'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{t('myIssues')} ({myIssues.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('nearby')}
            className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all ${
              activeTab === 'nearby'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t('nearbyIssues')} ({nearbyIssues.length})</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2.5 font-medium text-sm rounded-lg transition-all ${
              activeTab === 'report'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>{t('reportIssue')}</span>
            </div>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'my-issues' && (
          <div className="space-y-4">
            {myIssues.length === 0 ? (
              <Card className="p-12 text-center bg-white border-0 shadow-md">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noIssuesYet')}</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {t('noIssuesDescription')}
                </p>
                <Button onClick={() => setActiveTab('report')} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  {t('reportFirstIssue')}
                </Button>
              </Card>
            ) : (
              myIssues.map((issue) => (
                <Card key={issue._id} className="p-6 hover:shadow-lg transition-all bg-white border-0 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 text-sm leading-relaxed">{issue.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {issue.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {issue.upvotes} {t('upvotes')}
                        </span>
                        {issue.photos && issue.photos.length > 0 && (
                          <span className="flex items-center gap-2">
                            <img
                              src={issue.photos[0].url}
                              alt={issue.title}
                              className="h-8 w-8 rounded-md object-cover"
                            />
                            <span className="text-xs text-gray-500">
                              {issue.photos.length} {t('photosSelected')}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                        {issue.category}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'nearby' && (
          <div className="space-y-4">
            {nearbyIssues.length === 0 ? (
              <Card className="p-12 text-center bg-white border-0 shadow-md">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noNearbyIssues')}</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {t('noNearbyDescription')}
                </p>
              </Card>
            ) : (
              nearbyIssues.map((issue) => (
                <Card key={issue._id} className="p-6 hover:shadow-lg transition-all bg-white border-0 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 text-sm leading-relaxed">{issue.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {issue.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {issue.upvotes} {t('upvotes')}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                        {issue.category}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-6">
            {/* AI Info Card */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-md">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg flex-shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                    🤖 {t('aiPoweredPriority')}
                  </h3>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    {t('aiPriorityDescription')}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-0 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('reportNewIssue')}</h2>
              <ReportIssueForm
                onSuccess={() => {
                  const token = localStorage.getItem('token');
                  if (token) fetchDashboardData(token);
                  setActiveTab('my-issues');
                }}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Report Issue Form Component
function ReportIssueForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const categories = [
    'Road & Infrastructure',
    'Water Supply',
    'Electricity',
    'Waste Management',
    'Street Lights',
    'Public Transport',
    'Parks & Recreation',
    'Health & Sanitation',
    'Public Safety',
    'Other',
  ];

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setAddress(data.locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } catch (error) {
            setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          setGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
          setGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      alert('Please capture your location before submitting.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('latitude', location.lat.toString());
      formDataToSend.append('longitude', location.lng.toString());
      formDataToSend.append('address', address);

      photos.forEach((photo) => {
        formDataToSend.append('photos', photo);
      });

      const response = await fetch('/api/issues/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        alert('Issue reported successfully!');
        setFormData({ title: '', description: '', category: '' });
        setLocation(null);
        setAddress('');
        setPhotos([]);
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to report issue');
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('issueTitle')}</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={t('issueTitlePlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('description')}</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder={t('descriptionPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('category')}</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">{t('selectCategory')}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1.5">
          {t('priorityAutoCalculated')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('location')}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={address || t('locationNotCaptured')}
            readOnly
            className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg bg-gray-50"
          />
          <Button
            type="button"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="gap-2 px-4 py-3 text-sm whitespace-nowrap"
          >
            <MapPin className="h-4 w-4" />
            {gettingLocation ? t('gettingLocation') : t('captureLocation')}
          </Button>
        </div>
        {location && (
          <p className="text-xs text-gray-500 mt-1.5">
            {t('coordinates')}: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('photos')}</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setPhotos(Array.from(e.target.files || []))}
          className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {photos.length > 0 && (
          <p className="text-sm text-gray-600 mt-2 font-medium">{photos.length} {t('photosSelected')}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full gap-2 text-sm py-6 font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {t('submitting')}
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            {t('reportIssue')}
          </>
        )}
      </Button>
    </form>
  );
}

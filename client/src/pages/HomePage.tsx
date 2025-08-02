import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, Eye, Loader2, AlertCircle, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { issuesApi } from "../services/api";
import Map from '../components/Map';
import { IssuesMap } from '../components/IssuesMap';
import { useAuth } from "../contexts/AuthContext"

interface Issue {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    latitude: number;
    longitude: number;
    address?: string;
    distance: number;
    images: string[];
    created_at: string;
    updated_at: string;
}

const HomePage = () => {
    const [selectedCategory, setSelectedCategory] = useState < string > ("all");
    const [selectedStatus, setSelectedStatus] = useState < string > ("all");
    const [selectedDistance, setSelectedDistance] = useState < string > ("3");
    const [issues, setIssues] = useState < Issue[] > ([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState < string | null > (null);
    const [userLocation, setUserLocation] = useState < { lat: number; lng: number } | null > (null);
    const [locationError, setLocationError] = useState < string | null > (null);

    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        // Stay on the same page after logout
    };

    // Add error boundary check
    if (error && error.includes('Component')) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Component Error</h1>
                    <p className="text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

  const issueCategories = [
    "Roads", "Lighting", "Water Supply", "Cleanliness", "Public Safety", "Obstructions"
  ];

  const issueStatuses = ["Reported", "In Progress", "Resolved"];
  const distances = ["1 km", "3 km", "5 km"];

    // Get user's current location
    const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: false, // Less accurate but faster
                    timeout: 5000, // Shorter timeout
                    maximumAge: 600000 // 10 minutes cache
                }
            );
        });
    };

    // Fetch issues from API
    const fetchIssues = async (
        lat: number,
        lng: number,
        radius?: number,
        category?: string,
        status?: string
    ) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await issuesApi.getNearbyIssues(
                lat,
                lng,
                radius || 3,
                category || undefined,
                status || undefined
            );

            setIssues(response.issues || []);
        } catch (error) {
            console.error('Error fetching issues:', error);
            setError('Failed to load issues. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize location and fetch initial data
    useEffect(() => {
        const initializeLocation = async () => {
            try {
                // Try to get user's location with a shorter timeout
                const location = await getCurrentLocation();
                setUserLocation(location);
                setLocationError(null);

                // Fetch initial issues
                await fetchIssues(location.lat, location.lng);
            } catch (error) {
                console.error('Location error:', error);
                setLocationError(error instanceof Error ? error.message : 'Location error');

                // Use default location (Pune coordinates where we have data) for testing
                const defaultLocation = { lat: 18.5211, lng: 73.8502 };
                setUserLocation(defaultLocation);
                await fetchIssues(defaultLocation.lat, defaultLocation.lng);
            }
        };

        // Add a small delay to ensure component is fully mounted
        const timeoutId = setTimeout(() => {
            initializeLocation();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, []);

    // Handle filter changes
    const handleFilterChange = async () => {
        if (!userLocation) {
            return;
        }

        const radius = selectedDistance ? parseInt(selectedDistance) : 3;

        // Map frontend categories to backend categories
        const categoryMapping: { [key: string]: string } = {
            "Roads": "roads",
            "Lighting": "lighting",
            "Water Supply": "water",
            "Cleanliness": "cleanliness",
            "Public Safety": "safety",
            "Obstructions": "obstructions"
        };

        const category = selectedCategory && selectedCategory !== "all" ? categoryMapping[selectedCategory] : undefined;

        // Map frontend status to backend status
        const statusMapping: { [key: string]: string } = {
            "Reported": "reported",
            "In Progress": "in_progress",
            "Resolved": "resolved"
        };

        const status = selectedStatus && selectedStatus !== "all" ? statusMapping[selectedStatus] : undefined;

        await fetchIssues(userLocation.lat, userLocation.lng, radius, category, status);
    };

  const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "reported": return "bg-red-100 text-red-800";
            case "in_progress": return "bg-yellow-100 text-yellow-800";
            case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

    const formatStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case "reported": return "Reported";
            case "in_progress": return "In Progress";
            case "resolved": return "Resolved";
            default: return status;
        }
    };

    const formatCategory = (category: string) => {
        const categoryMap: { [key: string]: string } = {
            roads: "Roads",
            lighting: "Lighting",
            water: "Water Supply",
            cleanliness: "Cleanliness",
            safety: "Public Safety",
            obstructions: "Obstructions"
        };
        return categoryMap[category.toLowerCase()] || category;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CT</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">CivicTrack</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/search">
                <Button variant="ghost" size="sm">
                  Browse Issues
                                </Button>
                            </Link>
                                        {isAuthenticated ? (
                <>
                    <Link to="/admin">
                        <Button variant="ghost" size="sm">
                          Admin
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                        <User className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            {user?.username || user?.email}
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </>
            ) : (
                                <>
                                    <Link to="/register">
                                        <Button variant="ghost" size="sm">
                                            Register
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="gradient" size="sm">
                  Login
                </Button>
              </Link>
                                </>
                            )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in">
                    {isAuthenticated ? (
                        <>
                            <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                Welcome back, {user?.username}!
                                <br />
                                Explore Issues Near You
                            </h2>
                            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto text-balance">
                                Discover civic issues in your neighborhood and help build a better community.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link to="/report">
                                    <Button size="xl" variant="gradient" className="floating-element">
                                        Report an Issue
                                    </Button>
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                    Ready to make a difference in your community
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Report Local Issues,
            <br />
            Build Better Communities
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto text-balance">
            Discover and report civic issues in your neighborhood. Track progress and engage with your local community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link to="/login">
              <Button size="xl" variant="gradient" className="floating-element">
                                        Get Started
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
                                    Browse nearby issues without logging in
            </p>
          </div>
                        </>
                    )}
        </div>

                {/* Location Status */}
                {locationError && (
                    <Alert className="mb-6 max-w-2xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {locationError}. Using default location (Delhi). You can still browse issues.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Issues Map Section */}
                {!isLoading && userLocation && issues.length > 0 && (
                    <div className="mb-8">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-foreground mb-2">
                                Issues Near You
                            </h3>
                            <p className="text-muted-foreground">
                                Explore civic issues in your area on the interactive map
                            </p>
                        </div>
                        <div className="h-96 w-full">
                            <IssuesMap
                                issues={issues}
                                center={[userLocation.lat, userLocation.lng]}
                                hasNewData={false}
                                className="border border-border"
                            />
                        </div>
                    </div>
                )}

        {/* Search Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
              {issueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

                    <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                    >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
              {issueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

                    <Select
                        value={selectedDistance}
                        onValueChange={setSelectedDistance}
                    >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent>
              {distances.map((distance) => (
                                <SelectItem key={distance} value={distance.split(' ')[0]}>
                  {distance}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

                    <Button
                        onClick={handleFilterChange}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Search Issues'
                        )}
          </Button>
        </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading nearby issues...</p>
                        </div>
                    </div>
                )}

        {/* Issues Grid */}
                {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {issues.length > 0 ? (
                            issues.map((issue, index) => (
            <Card 
              key={issue.id} 
                                    className="group cursor-pointer border-l-4 border-l-primary/20 slide-up hover:border-l-primary/50 transition-colors"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                                        {/* Category & Distance */}
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="text-xs">
                                                {formatCategory(issue.category)}
                  </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {issue.distance.toFixed(1)} km
                  </Badge>
                </div>

                                        {/* Issue Image or Map */}
                <div className="relative w-full h-32 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                                            {issue.images && issue.images.length > 0 ? (
                                                <img
                                                    src={`http://localhost:8000${issue.images[0]}`}
                                                    alt={issue.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback to map if image fails to load
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const fallback = target.nextElementSibling as HTMLElement;
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="absolute inset-0"
                                                style={{ display: issue.images?.length ? 'none' : 'block' }}
                                            >
                                                <Map
                                                    latitude={issue.latitude}
                                                    longitude={issue.longitude}
                                                />
                  </div>
                </div>

                {/* Issue Title */}
                <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {issue.title}
                </h3>

                {/* Issue Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {issue.description}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                                                <span>{issue.address || `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                                                <span>{formatTimeAgo(issue.created_at)}</span>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(issue.status)}>
                                                {formatStatus(issue.status)}
                  </Badge>
                  
                                            <Link to={`/issues/${issue.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="text-center">
                                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Issues Found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        No civic issues found in your area with the current filters.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setSelectedCategory("all");
                                            setSelectedStatus("all");
                                            setSelectedDistance("3");
                                            setTimeout(() => handleFilterChange(), 0);
                                        }}
                                        variant="outline"
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        )}
        </div>
                )}

        {/* Stats Section */}
                {!isLoading && issues.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-8 mb-12 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
                                <div className="text-3xl font-bold text-primary mb-2">
                                    {issues.length}
                                </div>
                                <div className="text-sm text-muted-foreground">Issues Found</div>
            </div>
            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                    {issues.filter(issue => issue.status.toLowerCase() === 'resolved').length}
                                </div>
                                <div className="text-sm text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-600 mb-2">
                                    {issues.filter(issue => issue.status.toLowerCase() === 'in_progress').length}
                                </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
        </div>
                )}

        {/* Pagination */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Clock, Eye, Plus, Loader2, AlertCircle, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { issuesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

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

const SearchPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDistance, setSelectedDistance] = useState<string>("3");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const issueCategories = [
    "Roads", "Lighting", "Water Supply", "Cleanliness", "Public Safety", "Obstructions"
  ];

  const issueStatuses = ["Reported", "In Progress", "Resolved"];
  const distances = ["1 km", "3 km", "5 km"];

  const handleLogout = () => {
    logout();
    // Stay on the same page after logout
  };

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
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 600000
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
        const location = await getCurrentLocation();
        setUserLocation(location);
        setLocationError(null);
        
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

  const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      "roads": "Roads",
      "lighting": "Lighting",
      "water": "Water Supply",
      "cleanliness": "Cleanliness",
      "safety": "Public Safety",
      "obstructions": "Obstructions"
    };
    return categoryMap[category.toLowerCase()] || category;
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      "reported": "Reported",
      "in_progress": "In Progress",
      "resolved": "Resolved"
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary">CivicTrack</h1>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Home
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
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
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Register
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Search based */}
        <aside className="w-80 bg-card border-r min-h-[calc(100vh-4rem)] p-6">
          <div className="space-y-6">
            {/* Location Status */}
            {locationError && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Location:</strong> {locationError}
                  <br />
                  <span className="text-xs text-muted-foreground">Using default location for testing</span>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">Search based</h2>
              
              {/* Filters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categories</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Distance</label>
                  <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select distance" />
                    </SelectTrigger>
                    <SelectContent>
                      {distances.map((distance) => (
                        <SelectItem key={distance} value={distance.split(' ')[0]}>
                          {distance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleFilterChange}
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Apply Filters'
                  )}
                </Button>
              </div>
            </div>

            {/* Filtered Issues List */}
            <div>
              <h3 className="font-medium mb-4">Recent Issues</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex-shrink-0"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-20"></div>
                            <div className="h-3 bg-muted rounded w-full"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {issues.slice(0, 4).map((issue) => (
                    <Card key={issue.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            {issue.images && issue.images.length > 0 ? (
                              <img
                                src={`http://localhost:8000${issue.images[0]}`}
                                alt="Issue"
                                className="w-full h-full object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`text-xs text-muted-foreground ${issue.images && issue.images.length > 0 ? 'hidden' : ''}`}>
                              No Image
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge variant="secondary" className="text-xs mb-1">
                              {formatCategory(issue.category)}
                            </Badge>
                            <p className="text-sm font-medium truncate">{issue.title}</p>
                            <p className="text-xs text-muted-foreground">{formatTimeAgo(issue.created_at)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {issues.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No issues found in your area
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Report Issue Button */}
            <Link to="/report">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Shared Reportable Issues</h2>
            <p className="text-muted-foreground">
              Browse and explore civic issues reported in your area
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="w-full h-32 bg-muted rounded-md mb-4"></div>
                    <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                    <div className="h-5 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-1"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-16"></div>
                      <div className="h-8 w-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="mb-4 text-sm text-muted-foreground">
                Found {issues.length} issue{issues.length !== 1 ? 's' : ''} in your area
              </div>

              {/* Issues Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Issue Image */}
                  <div className="w-full h-32 bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {issue.images && issue.images.length > 0 ? (
                      <img
                        src={`http://localhost:8000${issue.images[0]}`}
                        alt="Issue"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-sm text-muted-foreground ${issue.images && issue.images.length > 0 ? 'hidden' : ''}`}>
                      No Image Available
                    </div>
                  </div>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-2">
                    {formatCategory(issue.category)}
                  </Badge>

                  {/* Issue Title */}
                  <h3 className="font-semibold text-card-foreground mb-2">
                    {issue.title}
                  </h3>

                  {/* Issue Description */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {issue.description}
                  </p>

                  {/* Location and Time */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{issue.address || `${issue.distance.toFixed(1)}km away`}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{formatTimeAgo(issue.created_at)}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(issue.status)}>
                      {formatStatus(issue.status)}
                    </Badge>
                    
                    <Link to={`/issue/${issue.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <Eye className="w-4 h-4 mr-1" />
                        View more information
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>

              {/* No Results */}
              {issues.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                    <p className="text-sm">
                      No civic issues found in your area with the current filters.
                      <br />
                      Try adjusting your search criteria or check back later.
                    </p>
                  </div>
                  <Link to="/report">
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Report the First Issue
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, User, Flag, ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { issuesApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Map from "../components/Map";

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address?: string;
  reporter: string;
  is_anonymous: boolean;
  flag_count: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

const IssueDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportingSpam, setIsReportingSpam] = useState(false);
  const [spamReason, setSpamReason] = useState("");
  const [spamReported, setSpamReported] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Fetch issue data
  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) {
        setError("Issue ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await issuesApi.getIssueById(id);
        setIssue(response.issue);
      } catch (error) {
        console.error("Error fetching issue:", error);
        setError(error instanceof Error ? error.message : "Failed to load issue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  // Handle spam reporting
  const handleReportSpam = async () => {
    if (!issue || !isAuthenticated) return;

    try {
      setIsReportingSpam(true);
      setReportError(null);
      
      await issuesApi.flagIssue(issue.id, spamReason);
      setSpamReported(true);
      setSpamReason("");
      
      // Update flag count locally
      setIssue(prev => prev ? { ...prev, flag_count: prev.flag_count + 1 } : null);
    } catch (error) {
      console.error("Error reporting spam:", error);
      setReportError(error instanceof Error ? error.message : "Failed to report spam");
    } finally {
      setIsReportingSpam(false);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reported": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Issue Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The issue you're looking for doesn't exist or has been removed."}
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary">CivicTrack</h1>
            </Link>
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {formatCategory(issue.category)}
                      </Badge>
                      <Badge className={getStatusColor(issue.status)}>
                        {formatStatus(issue.status)}
                      </Badge>
                      {issue.flag_count > 0 && (
                        <Badge variant="outline" className="text-orange-600">
                          {issue.flag_count} flag{issue.flag_count !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold">{issue.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Reported by {issue.reporter}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(issue.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Report Spam Button */}
                  {isAuthenticated && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                          <Flag className="w-4 h-4 mr-2" />
                          Report Spam
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report as Spam</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Help us maintain quality by reporting inappropriate content. 
                            This will flag the issue for review by moderators.
                          </p>
                          
                          <div>
                            <Label htmlFor="reason">Reason (optional)</Label>
                            <Textarea
                              id="reason"
                              placeholder="Why are you reporting this issue?"
                              value={spamReason}
                              onChange={(e) => setSpamReason(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          {reportError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{reportError}</AlertDescription>
                            </Alert>
                          )}
                          
                          {spamReported && (
                            <Alert>
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>
                                Thank you for your report. The issue has been flagged for review.
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          <div className="flex justify-end gap-2">
                            <DialogTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button 
                              onClick={handleReportSpam}
                              disabled={isReportingSpam || spamReported}
                            >
                              {isReportingSpam ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Reporting...
                                </>
                              ) : (
                                'Report Issue'
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {issue.description}
                </p>
              </CardContent>
            </Card>

            {/* Issue Images */}
            {issue.images && issue.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {issue.images.map((image, index) => (
                      <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img
                          src={`http://localhost:8000${image}`}
                          alt={`Issue image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                  <Map latitude={issue.latitude} longitude={issue.longitude} />
                </div>
                {issue.address && (
                  <p className="text-sm text-muted-foreground">
                    {issue.address}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Coordinates: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}
                </p>
              </CardContent>
            </Card>

            {/* Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(issue.status)}>
                      {formatStatus(issue.status)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCategory(issue.category)}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Reported</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(issue.created_at).toLocaleDateString()} at{' '}
                    {new Date(issue.created_at).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(issue.updated_at).toLocaleDateString()} at{' '}
                    {new Date(issue.updated_at).toLocaleTimeString()}
                  </p>
                </div>
                
                {issue.flag_count > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Community Flags</Label>
                    <p className="text-sm text-orange-600 mt-1">
                      This issue has been flagged {issue.flag_count} time{issue.flag_count !== 1 ? 's' : ''} by the community
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IssueDetailPage;
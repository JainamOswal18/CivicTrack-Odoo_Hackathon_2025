import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, MapPin, Upload, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { issuesApi, ApiError } from "../services/api";

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    anonymous: false,
    location: ""
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const issueCategories = [
    "Roads", "Lighting", "Water Supply", "Cleanliness", "Public Safety", "Obstructions"
  ];

  // Clear error when user starts typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setError(null);
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setError(null);
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleAnonymousChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      anonymous: checked
    }));
  };

  // Parse GPS coordinates from location string
  const parseLocation = (locationString: string): { latitude: number; longitude: number; address?: string } => {
    // Check if location string contains coordinates (lat, lng format)
    const coordMatch = locationString.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    
    if (coordMatch) {
      return {
        latitude: parseFloat(coordMatch[1]),
        longitude: parseFloat(coordMatch[2]),
        address: locationString
      };
    }
    
    // If no coordinates found, return default (this should be handled better in production)
    throw new Error('Please provide valid GPS coordinates or use the GPS button to get your current location');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 3 - images.length);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Parse location to get coordinates
      let coordinates;
      try {
        coordinates = parseLocation(formData.location);
      } catch (locationError) {
        setError(locationError instanceof Error ? locationError.message : 'Invalid location format');
        return;
      }

      // Prepare issue data for API
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address: coordinates.address,
        is_anonymous: formData.anonymous,
        images: images.length > 0 ? images : undefined,
      };

      // Submit to backend
      const response = await issuesApi.createIssue(issueData);
      
      console.log('Issue created successfully:', response);
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/user-home');
      }, 2000);

    } catch (error) {
      console.error('Error creating issue:', error);
      
      if (error instanceof ApiError) {
        // Handle API validation errors
        if (error.errors && error.errors.length > 0) {
          const errorMessages = error.errors.map(e => e.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="flex gap-2">
              <Link to="/search">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add Report for Issue</h1>
          <p className="text-muted-foreground">
            Help improve your community by reporting civic issues
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Issue reported successfully! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Issue Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide detailed information about the issue"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="location">Location Details</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Enter location or use GPS"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        className="flex-shrink-0"
                      >
                        <MapPin className="w-4 h-4" />
                        GPS
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      GPS coordinates will be automatically captured. Format: latitude, longitude (e.g., 28.6139, 77.2090)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos (Optional)</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 3 photos to help illustrate the issue
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Area */}
                    {images.length < 3 && (
                      <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <div className="space-y-2">
                          <Label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-primary hover:text-primary/80">
                              Click to upload photos
                            </span>
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG up to 5MB each
                          </p>
                        </div>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    )}

                    {/* Image Preview */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                              <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </Button>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {image.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Reporting Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Reporting Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="anonymous">Anonymous Report</Label>
                      <p className="text-xs text-muted-foreground">
                        Hide your identity from public view
                      </p>
                    </div>
                    <Switch
                      id="anonymous"
                      checked={formData.anonymous}
                      onCheckedChange={handleAnonymousChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Reporting Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Be specific and accurate</li>
                    <li>• Include clear photos if possible</li>
                    <li>• Provide exact location details</li>
                    <li>• Avoid duplicate reports</li>
                    <li>• Report only genuine civic issues</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Submit */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                    disabled={
                      !formData.title || 
                      !formData.description || 
                      !formData.category || 
                      !formData.location ||
                      isSubmitting ||
                      success
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting Report...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Report Submitted!
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {isSubmitting 
                      ? 'Uploading your report and images...' 
                      : 'Your report will be reviewed and published'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ReportIssuePage;
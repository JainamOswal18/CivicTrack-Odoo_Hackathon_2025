import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, User, Flag, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const IssueDetailPage = () => {
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDistance, setSelectedDistance] = useState<string>("");

  const issueCategories = [
    "Roads", "Lighting", "Water Supply", "Cleanliness", "Public Safety", "Obstructions"
  ];

  const issueStatuses = ["Reported", "In Progress", "Resolved"];
  const distances = ["1 km", "3 km", "5 km"];

  // Mock issue data
  const issueData = {
    id: id,
    title: "Major pothole on Main Street",
    description: "There is a big road pothole, is related about high volume of vehicles which is make dangerous vehicle to travel on.",
    category: "Roads",
    status: "Reported",
    priority: "High",
    location: "0.8 road information, is related information, progress again.",
    reportedBy: "Anonymous User",
    reportedDate: "Jan 02, 2025 - 10:36 AM",
    lastUpdated: "Jan 02, 2025 - 10:36 AM",
    images: ["/lovable-uploads/e61881f8-083f-4af9-a59f-20f4a7f9e3bd.png"],
    activity: [
      {
        date: "Jan 02, 2025 - 10:36 AM",
        action: "Reported by user",
        user: "Anonymous",
        status: "Reported"
      },
      {
        date: "Jan 02, 2025 - 09:45 AM",
        action: "Assigned to municipal worker",
        user: "System",
        status: "In Progress"
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported": return "bg-red-100 text-red-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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
                  Back to Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Filters */}
        <aside className="w-80 bg-card border-r min-h-[calc(100vh-4rem)] p-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Filter Issues</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
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
                    <SelectItem key={distance} value={distance}>
                      {distance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90">
              Search Issues
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Issue Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{issueData.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {issueData.reportedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {issueData.reportedDate}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Flag className="w-4 h-4 mr-1" />
                  Report Spam
                </Button>
              </div>

              {/* Status and Priority */}
              <div className="flex gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium">Status: </span>
                  <Badge className={getStatusColor(issueData.status)}>
                    {issueData.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Priority: </span>
                  <Badge className={getPriorityColor(issueData.priority)}>
                    {issueData.priority}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Category: </span>
                  <Badge variant="secondary">{issueData.category}</Badge>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" />
                <span>{issueData.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {issueData.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {issueData.images.map((image, index) => (
                        <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <img
                            src={image}
                            alt={`Issue image ${index + 1}`}
                            className="w-16 h-16 text-muted-foreground"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Log */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {issueData.activity.map((activity, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-sm text-muted-foreground">by {activity.user}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {activity.date}
                              </p>
                            </div>
                          </div>
                          {index < issueData.activity.length - 1 && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Issue Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Issue Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Issue ID:</span>
                      <p className="text-sm text-muted-foreground">#{issueData.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Reported:</span>
                      <p className="text-sm text-muted-foreground">{issueData.reportedDate}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Last Updated:</span>
                      <p className="text-sm text-muted-foreground">{issueData.lastUpdated}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full" variant="outline">
                      Subscribe to Updates
                    </Button>
                    <Button className="w-full" variant="outline">
                      Share Issue
                    </Button>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Report Similar Issue
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueDetailPage;
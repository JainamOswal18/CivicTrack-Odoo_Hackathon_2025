import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const SearchPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDistance, setSelectedDistance] = useState<string>("");

  const issueCategories = [
    "Roads", "Lighting", "Water Supply", "Cleanliness", "Public Safety", "Obstructions"
  ];

  const issueStatuses = ["Reported", "In Progress", "Resolved"];
  const distances = ["1 km", "3 km", "5 km"];

  // Mock filtered issues
  const mockFilteredIssues = Array.from({ length: 8 }, (_, i) => ({
    id: i + 10,
    title: `Filtered Issue ${i + 1}`,
    description: "Description of filtered issue based on search criteria.",
    category: issueCategories[i % issueCategories.length],
    status: issueStatuses[i % issueStatuses.length],
    location: "Nearby location",
    time: `${i + 1} hours ago`,
    image: "/lovable-uploads/e61881f8-083f-4af9-a59f-20f4a7f9e3bd.png"
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Reported": return "bg-red-100 text-red-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-green-100 text-green-800";
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
              <Link to="/user-home">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Dashboard
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Search based */}
        <aside className="w-80 bg-card border-r min-h-[calc(100vh-4rem)] p-6">
          <div className="space-y-6">
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
                  Apply Filters
                </Button>
              </div>
            </div>

            {/* Filtered Issues List */}
            <div>
              <h3 className="font-medium mb-4">Filtered Issues</h3>
              <div className="space-y-3">
                {mockFilteredIssues.slice(0, 4).map((issue) => (
                  <Card key={issue.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                          <img
                            src={issue.image}
                            alt="Issue"
                            className="w-6 h-6"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="secondary" className="text-xs mb-1">
                            {issue.category}
                          </Badge>
                          <p className="text-sm font-medium truncate">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">{issue.time}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

          {/* Issues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFilteredIssues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {/* Issue Image */}
                  <div className="w-full h-32 bg-muted rounded-md mb-4 flex items-center justify-center">
                    <img
                      src={issue.image}
                      alt="Issue"
                      className="w-8 h-8 text-muted-foreground"
                    />
                  </div>

                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-2">
                    {issue.category}
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
                    <span>{issue.location}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{issue.time}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status}
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
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
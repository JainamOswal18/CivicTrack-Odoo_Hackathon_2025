import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Eye, MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Map } from '../components/Map';


const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDistance, setSelectedDistance] = useState<string>("");

  const issueCategories = [
    "Roads", "Lighting", "Water Supply", "Cleanliness", "Public Safety", "Obstructions"
  ];

  const issueStatuses = ["Reported", "In Progress", "Resolved"];
  const distances = ["1 km", "3 km", "5 km"];

  // Mock data for issue cards with enhanced variety
  const mockIssues = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: [
      "Large pothole on Main Street needs urgent repair",
      "Broken streetlight creating safety hazard", 
      "Water pipe leak flooding sidewalk",
      "Overflowing garbage bins attracting pests",
      "Open manhole cover on residential street",
      "Fallen tree blocking bike path",
      "Traffic light malfunction at intersection",
      "Damaged road signs need replacement",
      "Construction debris blocking pathway"
    ][i],
    description: [
      "Deep pothole causing vehicle damage and safety concerns for daily commuters.",
      "Streetlight has been flickering for weeks, now completely dark at night.",
      "Major water leak has been flooding the sidewalk for 3 days straight.",
      "Multiple garbage bins overflowing, creating unsanitary conditions.",
      "Exposed manhole presents serious safety risk, especially at night.",
      "Large tree branch fell after storm, completely blocking the path.",
      "Traffic signal stuck on red, causing major intersection delays.",
      "Several road signs damaged by weather, affecting navigation.",
      "Construction materials left on public walkway after project completion."
    ][i],
    category: issueCategories[i % issueCategories.length],
    status: issueStatuses[i % issueStatuses.length],
    location: `Location ${i + 1}`,
    latitude: 30.7046 + i * 0.001,
    longitude: 76.7179 + i * 0.001,
    time: `${Math.floor(Math.random() * 24) + 1} hours ago`,
    image: "/lovable-uploads/e61881f8-083f-4af9-a59f-20f4a7f9e3bd.png",
    priority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
    votes: Math.floor(Math.random() * 50) + 1
  }));

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
      case "High": return "bg-red-500 text-white";
      case "Medium": return "bg-yellow-500 text-white";
      case "Low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
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
              <Link to="/login">
                <Button variant="gradient" size="sm">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Report Local Issues,
            <br />
            Build Better Communities
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto text-balance">
            Discover and report civic issues in your neighborhood. Track progress and engage with your local community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/report">
              <Button size="xl" variant="gradient" className="floating-element">
                Report an Issue
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Or browse nearby issues without logging in
            </p>
          </div>
        </div>

        {/* Search Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent>
              {issueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {issueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDistance} onValueChange={setSelectedDistance}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent>
              {distances.map((distance) => (
                <SelectItem key={distance} value={distance}>
                  {distance}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button className="bg-primary hover:bg-primary/90">
            Search Issues
          </Button>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockIssues.map((issue, index) => (
            <Card 
              key={issue.id} 
              className={`group cursor-pointer border-l-4 ${
                issue.priority === 'High' ? 'border-l-red-500' :
                issue.priority === 'Medium' ? 'border-l-yellow-500' : 'border-l-green-500'
              } slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                {/* Priority & Category */}
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {issue.category}
                  </Badge>
                  <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                    {issue.priority}
                  </Badge>
                </div>

                {/* Issue Image */}
                {/* <div className="relative w-full h-32 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {issue.votes} votes
                  </div>
                </div>

                {/* Issue Title */}
                <h3 className="font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {issue.title}
                </h3> 
                <div className="relative w-full h-32 rounded-lg mb-4 overflow-hidden group-hover:scale-105 transition-transform duration-300">
  <Map
    latitude={issue.latitude}     // add latitude to your mockIssues
    longitude={issue.longitude}   // add longitude to your mockIssues
  />
  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
    {issue.votes} votes
  </div>
</div>

                {/* Issue Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {issue.description}
                </p>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{issue.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{issue.time}</span>
                  </div>
                </div>

                {/* Status and Action */}
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status}
                  </Badge>
                  
                  <Link to={`/issue/${issue.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-8 mb-12 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">127</div>
              <div className="text-sm text-muted-foreground">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">89</div>
              <div className="text-sm text-muted-foreground">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">38</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
        </div>

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
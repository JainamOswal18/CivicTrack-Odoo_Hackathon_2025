import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Eye, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const UserHomePage = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDistance, setSelectedDistance] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const issueCategories = [
    "Roads", "Lighting", "Water Supply", "Cleanliness", "Public Safety", "Obstructions"
  ];

  const issueStatuses = ["Reported", "In Progress", "Resolved"];
  const distances = ["1 km", "3 km", "5 km"];

  // Mock data for user's issues
  const mockUserIssues = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `My Issue ${i + 1}`,
    description: "Issue I reported - detailed description of the problem I encountered.",
    category: issueCategories[i % issueCategories.length],
    status: issueStatuses[i % issueStatuses.length],
    location: "Location details",
    time: `${i + 1} day${i !== 0 ? 's' : ''} ago`,
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary">CivicTrack</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Welcome, {user.username}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h2>
          <p className="text-muted-foreground">
            Track your reported issues and explore nearby civic problems
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4 mb-8">
          <Link to="/report">
            <Button className="bg-primary hover:bg-primary/90">
              Report New Issue
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Browse All Issues
            </Button>
          </Link>
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

        {/* My Issues Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">My Reported Issues</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockUserIssues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
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
                  <h4 className="font-semibold text-card-foreground mb-2">
                    {issue.title}
                  </h4>

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
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserHomePage;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  Users, 
  Flag, 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Home,
  User,
  LogOut,
  Loader2,
  TrendingUp,
  Activity,
  MapPin,
  Calendar,
  Eye
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  username: string;
  is_banned: boolean;
  created_at: string;
}

interface FlaggedIssue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  flag_count: number;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
  images: string[];
  reporter: string;
}

interface Analytics {
  totalUsers: number;
  totalIssues: number;
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State for different sections
  const [users, setUsers] = useState<User[]>([]);
  const [flaggedIssues, setFlaggedIssues] = useState<FlaggedIssue[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  
  // Loading states
  const [usersLoading, setUsersLoading] = useState(true);
  const [flaggedLoading, setFlaggedLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  
  // Error states
  const [usersError, setUsersError] = useState<string | null>(null);
  const [flaggedError, setFlaggedError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
  // Action loading states
  const [banningUsers, setBanningUsers] = useState<Set<number>>(new Set());
  const [unflaggingIssues, setUnflaggingIssues] = useState<Set<number>>(new Set());

  const [activeTab, setActiveTab] = useState('analytics');

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchFlaggedIssues();
      fetchAnalytics();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const response = await adminApi.getUsers();
      setUsers(response.users);
    } catch (error: any) {
      setUsersError(error.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchFlaggedIssues = async () => {
    try {
      setFlaggedLoading(true);
      setFlaggedError(null);
      const response = await adminApi.getFlaggedIssues();
      setFlaggedIssues(response.flaggedIssues);
    } catch (error: any) {
      setFlaggedError(error.message || 'Failed to fetch flagged issues');
    } finally {
      setFlaggedLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const response = await adminApi.getAnalytics();
      setAnalytics(response.analytics);
    } catch (error: any) {
      setAnalyticsError(error.message || 'Failed to fetch analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleBanUser = async (userId: number, banned: boolean) => {
    try {
      setBanningUsers(prev => new Set(prev).add(userId));
      await adminApi.banUser(userId.toString(), banned);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, is_banned: banned } : user
        )
      );
    } catch (error: any) {
      alert(`Failed to ${banned ? 'ban' : 'unban'} user: ${error.message}`);
    } finally {
      setBanningUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleUnflagIssue = async (issueId: number) => {
    try {
      setUnflaggingIssues(prev => new Set(prev).add(issueId));
      await adminApi.unflagIssue(issueId.toString());
      
      // Remove from local state
      setFlaggedIssues(prevIssues => 
        prevIssues.filter(issue => issue.id !== issueId)
      );
    } catch (error: any) {
      alert(`Failed to unflag issue: ${error.message}`);
    } finally {
      setUnflaggingIssues(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      roads: 'bg-orange-100 text-orange-800',
      lighting: 'bg-yellow-100 text-yellow-800',
      water: 'bg-blue-100 text-blue-800',
      cleanliness: 'bg-green-100 text-green-800',
      safety: 'bg-red-100 text-red-800',
      obstructions: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      {/* Premium Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">CT</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">CivicTrack</h1>
                  <div className="text-sm text-muted-foreground font-medium">Admin Dashboard</div>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, moderate content, and view analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Flagged Issues
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsLoading ? (
                <div className="col-span-full flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : analyticsError ? (
                <div className="col-span-full">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{analyticsError}</AlertDescription>
                  </Alert>
                </div>
              ) : analytics ? (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                      <Flag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalIssues}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Flagged Issues</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{flaggedIssues.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{users.filter(u => !u.is_banned).length}</div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>

            {/* Category & Status Charts */}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Category</CardTitle>
                    <CardDescription>Distribution of issues across different categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.byCategory.map((item) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getCategoryColor(item.category)}>
                              {formatCategory(item.category)}
                            </Badge>
                          </div>
                          <span className="font-semibold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Status</CardTitle>
                    <CardDescription>Current status distribution of all issues</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.byStatus.map((item) => (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(item.status)}>
                              {formatStatus(item.status)}
                            </Badge>
                          </div>
                          <span className="font-semibold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : usersError ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{usersError}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{user.username}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {user.is_banned ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </Badge>
                          )}
                          
                          <Button
                            variant={user.is_banned ? "default" : "destructive"}
                            size="sm"
                            onClick={() => handleBanUser(user.id, !user.is_banned)}
                            disabled={banningUsers.has(user.id)}
                          >
                            {banningUsers.has(user.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : user.is_banned ? (
                              "Unban"
                            ) : (
                              "Ban"
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Issues Tab */}
          <TabsContent value="flagged" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  Flagged Issues
                </CardTitle>
                <CardDescription>
                  Review and moderate flagged content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : flaggedError ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{flaggedError}</AlertDescription>
                  </Alert>
                ) : flaggedIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Flagged Issues</h3>
                    <p className="text-muted-foreground">All issues are currently clean!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {flaggedIssues.map((issue) => (
                      <div key={issue.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">{issue.title}</h3>
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                {issue.flag_count} flags
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-3">
                              <Badge className={getCategoryColor(issue.category)}>
                                {formatCategory(issue.category)}
                              </Badge>
                              <Badge className={getStatusColor(issue.status)}>
                                {formatStatus(issue.status)}
                              </Badge>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {issue.reporter}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(issue.created_at)}
                              </span>
                            </div>
                            
                            <p className="text-gray-700 mb-4">{issue.description}</p>
                            
                            {issue.images && issue.images.length > 0 && (
                              <div className="flex gap-2 mb-4">
                                {issue.images.slice(0, 3).map((image, index) => (
                                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                      src={`http://localhost:8000${image}`}
                                      alt={`Issue ${index + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                                {issue.images.length > 3 && (
                                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <span className="text-sm text-gray-500">+{issue.images.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                              </span>
                              <Link 
                                to={`/issues/${issue.id}`}
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <Eye className="w-3 h-3" />
                                View Details
                              </Link>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 ml-4">
                            <Button
                              variant="outline"
                              onClick={() => handleUnflagIssue(issue.id)}
                              disabled={unflaggingIssues.has(issue.id)}
                              className="flex items-center gap-2"
                            >
                              {unflaggingIssues.has(issue.id) ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Unflagging...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Unflag Issue
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">New User Registrations</p>
                        <p className="text-sm text-blue-600">{users.length} total users</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Flag className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Flagged Content</p>
                        <p className="text-sm text-yellow-600">{flaggedIssues.length} issues need review</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Platform Health</p>
                        <p className="text-sm text-green-600">System running smoothly</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('flagged')}
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Review Flagged Content
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        fetchUsers();
                        fetchFlaggedIssues();
                        fetchAnalytics();
                      }}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
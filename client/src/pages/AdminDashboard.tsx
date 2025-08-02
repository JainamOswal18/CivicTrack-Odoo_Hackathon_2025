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
              <CardContent className="relative p-6">
                {flaggedLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
                      <p className="text-slate-600">Loading flagged issues...</p>
                    </div>
                  </div>
                ) : flaggedError ? (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-700">{flaggedError}</AlertDescription>
                  </Alert>
                ) : flaggedIssues.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
                      <CheckCircle className="relative w-20 h-20 text-green-500 mx-auto mb-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">No Flagged Issues</h3>
                    <p className="text-slate-600 text-lg">All issues are currently clean and compliant!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {flaggedIssues.map((issue, index) => (
                      <div 
                        key={issue.id} 
                        className="group relative overflow-hidden bg-gradient-to-r from-white to-red-50 border border-red-200 rounded-2xl p-8 hover:shadow-xl hover:border-red-300 transition-all duration-300"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-amber-500/0 group-hover:from-red-500/5 group-hover:to-amber-500/5 transition-all duration-300"></div>
                        <div className="relative flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                              <h3 className="text-xl font-bold text-slate-800 group-hover:text-red-700 transition-colors">{issue.title}</h3>
                              <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-2 px-3 py-1 font-bold">
                                <Flag className="w-4 h-4" />
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
                          
                          <div className="flex-shrink-0 ml-6">
                            <Button
                              variant="outline"
                              onClick={() => handleUnflagIssue(issue.id)}
                              disabled={unflaggingIssues.has(issue.id)}
                              className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600 font-medium px-6 py-3 transition-all duration-200 hover:scale-105 flex items-center gap-2"
                            >
                              {unflaggingIssues.has(issue.id) ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-5 h-5" />
                                  Approve & Unflag
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
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
                <CardHeader className="relative border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">Latest platform activity and system status</CardDescription>
                </CardHeader>
                <CardContent className="relative p-6">
                  <div className="space-y-6">
                    <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-200">
                      <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors duration-300">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-blue-900 text-lg">User Registrations</p>
                        <p className="text-blue-700 font-medium">{users.length} total registered users</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                    </div>
                    
                    <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl hover:from-amber-100 hover:to-orange-100 transition-all duration-300 border border-amber-200">
                      <div className="p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-colors duration-300">
                        <Flag className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-amber-900 text-lg">Flagged Content</p>
                        <p className="text-amber-700 font-medium">{flaggedIssues.length} issues need review</p>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">{flaggedIssues.length}</div>
                    </div>
                    
                    <div className="group flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-200">
                      <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors duration-300">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-green-900 text-lg">Platform Health</p>
                        <p className="text-green-700 font-medium">All systems operational</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5"></div>
                <CardHeader className="relative border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                      <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-base">Common administrative tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="relative p-6">
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-14 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 transition-all duration-300 group"
                      onClick={() => setActiveTab('users')}
                    >
                      <div className="p-2 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-colors duration-300">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-800">Manage Users</div>
                        <div className="text-xs text-slate-600">View and moderate user accounts</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-14 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 hover:border-amber-300 transition-all duration-300 group"
                      onClick={() => setActiveTab('flagged')}
                    >
                      <div className="p-2 bg-amber-500/10 rounded-lg mr-3 group-hover:bg-amber-500/20 transition-colors duration-300">
                        <Flag className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-800">Review Flagged Content</div>
                        <div className="text-xs text-slate-600">Moderate reported issues</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-14 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-300 transition-all duration-300 group"
                      onClick={() => setActiveTab('analytics')}
                    >
                      <div className="p-2 bg-purple-500/10 rounded-lg mr-3 group-hover:bg-purple-500/20 transition-colors duration-300">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-800">View Analytics</div>
                        <div className="text-xs text-slate-600">Platform insights and metrics</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-14 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300 transition-all duration-300 group"
                      onClick={() => {
                        fetchUsers();
                        fetchFlaggedIssues();
                        fetchAnalytics();
                      }}
                    >
                      <div className="p-2 bg-green-500/10 rounded-lg mr-3 group-hover:bg-green-500/20 transition-colors duration-300">
                        <Activity className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-slate-800">Refresh Data</div>
                        <div className="text-xs text-slate-600">Update all dashboard data</div>
                      </div>
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
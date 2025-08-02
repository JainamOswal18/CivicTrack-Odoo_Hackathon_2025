import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock registration logic - in real app, this would integrate with JWT backend
    if (formData.username && formData.email && formData.password) {
      localStorage.setItem('user', JSON.stringify({ 
        username: formData.username, 
        email: formData.email,
        isLoggedIn: true 
      }));
      navigate('/user-home');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4">
        <Link to="/">
          <h1 className="text-2xl font-bold text-primary">CivicTrack</h1>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">User Registration Page</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">User Name</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
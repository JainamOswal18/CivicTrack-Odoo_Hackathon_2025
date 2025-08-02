import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, error, clearError, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) return;

    // Validate phone number if provided
    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      return; // Form validation will show error
    }

    try {
      setIsSubmitting(true);
      clearError();
      await register(formData.email, formData.password, formData.username, formData.phone_number || undefined);
      navigate('/');
    } catch (error) {
      // Error is handled by the context
    } finally {
      setIsSubmitting(false);
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
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username (3-20 characters)"
                minLength={3}
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">Username must be 3-20 characters long</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

               <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number (e.g., +1234567890)"
                pattern="[\+]?[1-9][\d]{0,15}"
                className={formData.phone_number && !validatePhoneNumber(formData.phone_number) ? "border-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Format: +1234567890 or 1234567890 (10-16 digits)
              </p>
              {formData.phone_number && !validatePhoneNumber(formData.phone_number) && (
                <p className="text-xs text-red-500">
                  Please enter a valid phone number (10-16 digits, optional + prefix)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 8 characters)"
                minLength={8}
                required
              />
              <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
            </div>

         

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                !formData.username || 
                !formData.email || 
                !formData.password ||
                (formData.phone_number && !validatePhoneNumber(formData.phone_number))
              }
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
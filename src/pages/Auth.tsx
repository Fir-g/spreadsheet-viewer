import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  // Import the API utility
  const getBackendUrl = (): string => {
    const envUrl = import.meta.env.VITE_BACKEND_URL;

    if (envUrl) {
      // Ensure HTTPS in production (Amplify)
      if (window.location.protocol === "https:" && envUrl.startsWith("http:")) {
        return envUrl.replace("https:", "https:");
      }
      return envUrl;
    }

    // Fallback URL - use HTTPS in production
    return window.location.protocol === "https:"
      ? "https://52.66.225.78:8000"
      : "https://kubera-backend.thetailoredai.co";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      const baseUrl = getBackendUrl();
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setLoginError(data.detail || "Login failed");
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoginError("Network error");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError("");
    setSignupSuccess("");
    try {
      const baseUrl = getBackendUrl();
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupEmail,
          name: signupName,
          password: signupPassword,
          role: "member",
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setSignupError(data.detail || "Signup failed");
        setIsLoading(false);
        return;
      }

      // Try to get token from signup response
      const data = await response.json();
      if (data.access_token) {
        // If signup returns a token, use it
        localStorage.setItem("token", data.access_token);
        setIsLoading(false);
        navigate("/dashboard");
        return;
      }

      // Otherwise, immediately log in with the new credentials
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupEmail,
          password: signupPassword,
        }),
      });
      if (!loginResponse.ok) {
        setSignupError(
          "Signup succeeded but login failed. Please try logging in."
        );
        setIsLoading(false);
        return;
      }
      const loginData = await loginResponse.json();
      localStorage.setItem("token", loginData.access_token);
      setIsLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setSignupError("Network error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>

      <div className="w-full max-w-md relative z-10">
       

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Username</Label>
                    <Input
                      id="signin-email"
                      type="text"
                      placeholder="Enter your username"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>

                  {loginError && (
                    <div className="text-red-500 text-sm text-center">
                      {loginError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Username</Label>
                    <Input
                      id="signup-email"
                      type="text"
                      placeholder="Enter your username"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                  {signupError && (
                    <div className="text-red-500 text-sm text-center">
                      {signupError}
                    </div>
                  )}
                  {signupSuccess && (
                    <div className="text-green-600 text-sm text-center">
                      {signupSuccess}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:opacity-90 shadow-md"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;

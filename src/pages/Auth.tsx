import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    const { error } =
      mode === "login" ? await signIn(email, password) : await signUp(email, password, firstName);

    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success(mode === "login" ? "Welcome back!" : "Account created!");
    navigate("/");
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setGoogleLoading(false);
      toast.error(error);
    }
    // On success, Supabase redirects to Google — no further action needed here.
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Dumbbell className="h-7 w-7 text-primary" />
            <span>
              <span className="gradient-text">Lift</span> Calc
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Track lifts. Calculate percentages. See progress.</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>{mode === "login" ? "Log in" : "Create an account"}</CardTitle>
            <CardDescription>
              {mode === "login" ? "Welcome back to Lift Calc." : "Start tracking your lifts today."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11C3.24 21.3 7.28 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.27a7.2 7.2 0 0 1-.38-2.27c0-.79.14-1.55.38-2.27V6.62H1.26A11.99 11.99 0 0 0 0 12c0 1.94.47 3.77 1.26 5.38l4.01-3.11Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.26 6.62l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
                />
              </svg>
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </Button>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <button className="underline underline-offset-4 hover:text-foreground" onClick={() => setMode("signup")}>
                  Need an account? Sign up
                </button>
              ) : (
                <button className="underline underline-offset-4 hover:text-foreground" onClick={() => setMode("login")}>
                  Already have an account? Log in
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                onClick={() => navigate("/")}
              >
                Continue as guest
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

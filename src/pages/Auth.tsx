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
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

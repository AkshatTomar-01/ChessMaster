import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { setToken } from "@/lib/auth";
import { Crown, Loader2, User, Lock } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const FLOATING_PIECES = [
  { piece: "♔", x: "10%",  y: "12%", size: "5rem",   delay: 0,   duration: 7  },
  { piece: "♛", x: "80%",  y: "8%",  size: "4rem",   delay: 1,   duration: 9  },
  { piece: "♜", x: "6%",   y: "65%", size: "3.5rem", delay: 2,   duration: 8  },
  { piece: "♝", x: "85%",  y: "60%", size: "4rem",   delay: 0.5, duration: 10 },
  { piece: "♞", x: "20%",  y: "85%", size: "3rem",   delay: 1.5, duration: 7  },
  { piece: "♟", x: "75%",  y: "82%", size: "3rem",   delay: 3,   duration: 9  },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (data: { token: string }) => {
      setToken(data.token);
      queryClient.clear();
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Login failed", description: error.message });
    },
  });

  const onSubmit = (data: LoginForm) => loginMutation.mutate(data);

  return (
    <div className="min-h-screen flex overflow-hidden bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-background border-r border-border/40">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl pointer-events-none"
        />
        {FLOATING_PIECES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute select-none pointer-events-none text-foreground/10"
            style={{ left: p.x, top: p.y, fontSize: p.size }}
            animate={{ y: [0, -18, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {p.piece}
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center px-12 space-y-6"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ChessMaster</span>
          </div>
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="text-8xl mb-4"
          >
            ♟
          </motion.div>
          <blockquote className="space-y-3">
            <p className="text-3xl font-bold leading-tight">"Every master was<br />once a beginner"</p>
            <p className="text-muted-foreground text-sm">— Start your journey today</p>
          </blockquote>
          <div className="flex items-center justify-center gap-6 pt-4">
            {[["10K+", "Players"], ["50K+", "Games"], ["3", "Game Modes"]].map(([v, l], i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="text-center">
                <div className="text-xl font-bold text-primary">{v}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <Crown className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold">ChessMaster</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl p-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
              <h1 className="text-3xl font-bold mb-1">Welcome back</h1>
              <p className="text-muted-foreground text-sm">Sign in to continue your chess journey</p>
            </motion.div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Enter your username" className="pl-10 bg-background/60 border-border/60 focus:border-primary/60 transition-colors" {...field} data-testid="input-username" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.27 }}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input type="password" placeholder="Enter your password" className="pl-10 bg-background/60 border-border/60 focus:border-primary/60 transition-colors" {...field} data-testid="input-password" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}>
                  <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all" disabled={loginMutation.isPending} data-testid="button-submit">
                    {loginMutation.isPending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>) : "Sign In"}
                  </Button>
                </motion.div>
              </form>
            </Form>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup"><a className="text-primary font-semibold hover:underline underline-offset-4" data-testid="link-signup">Sign up free</a></Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Handshake, Bot, Users, Swords, LogOut, User, Crown } from "lucide-react";
import { getCurrentUserId, removeToken, getCurrentUsername } from "@/lib/auth";
import type { UserProfile, GameWithPlayers } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" } }),
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const currentUserId = getCurrentUserId();
  const currentUsername = getCurrentUsername();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/profile"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: recentGames, isLoading: gamesLoading } = useQuery<GameWithPlayers[]>({
    queryKey: ["/api/game/recent"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const handleLogout = () => {
    removeToken();
    toast({ title: "Logged out", description: "You have been logged out successfully." });
    setLocation("/");
  };

  const getInitials = (username?: string) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  const getResultBadge = (game: GameWithPlayers) => {
    if (!game.result) return null;
    const isWinner = game.winnerId === currentUserId;
    const isDraw = game.result === "draw";
    if (isDraw) return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30" data-testid={`badge-result-${game.id}`}>Draw</Badge>;
    return isWinner
      ? <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" data-testid={`badge-result-${game.id}`}>Won</Badge>
      : <Badge className="bg-red-500/15 text-red-400 border border-red-500/30" data-testid={`badge-result-${game.id}`}>Lost</Badge>;
  };

  const getOpponentName = (game: GameWithPlayers) => {
    if (game.mode === "ai") return "Stockfish AI";
    if (game.player1Id === currentUserId) return game.player2?.username || "Waiting...";
    return game.player1?.username || "Waiting...";
  };

  const gameModes = [
    { icon: Bot,   title: "Play vs Computer", desc: "Challenge Stockfish AI with adjustable difficulty", gradient: "from-primary/20 via-primary/10 to-transparent",         border: "border-primary/30",        glow: "shadow-primary/20",        iconColor: "text-primary",    iconBg: "bg-primary/15",    btnLabel: "Play AI",     testId: "button-play-ai",       route: "/game/ai"       },
    { icon: Users, title: "Play vs Human",    desc: "Match with online players in real-time",           gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent", border: "border-emerald-500/30",    glow: "shadow-emerald-500/20",    iconColor: "text-emerald-400", iconBg: "bg-emerald-500/15", btnLabel: "Find Match",  testId: "button-play-online",   route: "/game/online"   },
    { icon: Swords, title: "Friendly Match",  desc: "Create or join a game with a code",               gradient: "from-amber-500/20 via-amber-500/10 to-transparent",     border: "border-amber-500/30",      glow: "shadow-amber-500/20",      iconColor: "text-amber-400",  iconBg: "bg-amber-500/15",  btnLabel: "Create/Join", testId: "button-play-friendly", route: "/game/friendly" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 9, repeat: Infinity }} className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-chart-2/8 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">ChessMaster</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")} className="gap-2 text-muted-foreground hover:text-foreground" data-testid="button-profile">
              <User className="w-4 h-4" /><span className="hidden sm:inline">Profile</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground" data-testid="button-logout">
              <LogOut className="w-4 h-4" /><span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 relative z-10">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
          {profileLoading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2"><Skeleton className="h-9 w-52" /><Skeleton className="h-4 w-36" /></div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-primary/30 blur-md" />
                <Avatar className="relative w-20 h-20 border-2 border-primary/40 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarFallback className="text-2xl font-bold bg-primary/15 text-primary">
                    {getInitials(profile?.username || currentUsername || undefined)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
                <h1 className="text-4xl font-bold tracking-tight" data-testid="text-username">{profile?.username || currentUsername}</h1>
                <p className="text-muted-foreground mt-1 text-sm">Ready to play your next game?</p>
              </div>
            </div>
          )}
        </motion.section>

        <section className="grid grid-cols-3 gap-4 mb-12">
          {profileLoading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : (
            [
              { label: "Wins",   value: profile?.wins   || 0, icon: Trophy,    color: "text-emerald-400", iconBg: "bg-emerald-500/15", gradient: "from-emerald-500/10 to-transparent", border: "border-emerald-500/20", testId: "text-wins"   },
              { label: "Losses", value: profile?.losses || 0, icon: Target,    color: "text-red-400",     iconBg: "bg-red-500/15",     gradient: "from-red-500/10 to-transparent",     border: "border-red-500/20",     testId: "text-losses" },
              { label: "Draws",  value: profile?.draws  || 0, icon: Handshake, color: "text-amber-400",   iconBg: "bg-amber-500/15",   gradient: "from-amber-500/10 to-transparent",   border: "border-amber-500/20",   testId: "text-draws"  },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="show"
                className={`rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.gradient} bg-card/60 backdrop-blur-sm p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-4xl font-bold ${stat.color}`} data-testid={stat.testId}>{stat.value}</div>
              </motion.div>
            ))
          )}
        </section>

        <section className="mb-12">
          <motion.h2 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold mb-6">Start New Game</motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {gameModes.map((mode, i) => (
              <motion.div key={mode.title} custom={i} variants={fadeUp} initial="hidden" animate="show"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => setLocation(mode.route)}
                className={`group relative rounded-2xl border ${mode.border} bg-gradient-to-br ${mode.gradient} bg-card/60 backdrop-blur-sm p-7 cursor-pointer shadow-lg ${mode.glow} hover:shadow-xl transition-shadow`}
              >
                <div className={`w-14 h-14 ${mode.iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <mode.icon className={`w-7 h-7 ${mode.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{mode.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{mode.desc}</p>
                <Button className="w-full" onClick={(e) => { e.stopPropagation(); setLocation(mode.route); }} data-testid={mode.testId}>
                  {mode.btnLabel}
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <motion.h2 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="text-2xl font-bold mb-6">Recent Matches</motion.h2>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
            {gamesLoading ? (
              <div className="p-6 space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
            ) : recentGames && recentGames.length > 0 ? (
              <div className="divide-y divide-border/40">
                {recentGames.map((game, i) => (
                  <motion.div key={game.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-card/80 cursor-pointer transition-colors group"
                    onClick={() => setLocation(`/game/${game.id}`)} data-testid={`game-${game.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-border/60">
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">{getInitials(getOpponentName(game))}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors">{getOpponentName(game)}</div>
                        <div className="text-xs text-muted-foreground">{new Date(game.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize text-xs">{game.mode}</Badge>
                      {getResultBadge(game)}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-4">♟</motion.div>
                <p className="font-medium">No games played yet</p>
                <p className="text-sm mt-1">Start your first match above!</p>
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
}

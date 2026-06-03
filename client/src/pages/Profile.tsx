import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Target, Handshake, Calendar, Crown, BarChart2, Bot, Globe, Swords } from "lucide-react";
import { getCurrentUsername } from "@/lib/auth";
import type { UserProfile, GameWithPlayers } from "@shared/schema";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" } }),
};

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(v) { node.textContent = Math.round(v).toString(); },
    });
    return () => controls.stop();
  }, [value]);
  return <span ref={ref}>0</span>;
}

interface ModeStatCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  border: string;
  gradient: string;
  label: string;
  wins: number;
  losses: number;
  draws: number;
  delay: number;
}

function ModeStatCard({ icon: Icon, iconColor, iconBg, border, gradient, label, wins, losses, draws, delay }: ModeStatCardProps) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={`rounded-2xl border ${border} bg-gradient-to-br ${gradient} bg-card/60 backdrop-blur-sm p-5`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="text-sm font-semibold leading-tight">{label}</span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-center flex-1">
          <div className="text-xl font-bold text-emerald-400"><AnimatedNumber value={wins} /></div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">W</div>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="text-center flex-1">
          <div className="text-xl font-bold text-red-400"><AnimatedNumber value={losses} /></div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">L</div>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="text-center flex-1">
          <div className="text-xl font-bold text-amber-400"><AnimatedNumber value={draws} /></div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">D</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const currentUsername = getCurrentUsername();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/profile"],
    staleTime: 0,
  });

  const { data: allGames, isLoading: gamesLoading } = useQuery<GameWithPlayers[]>({
    queryKey: ["/api/game/history"],
    staleTime: 0,
  });

  const getInitials = (username?: string) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  const getOpponentName = (game: GameWithPlayers) => {
    if (game.mode === "ai") return "Stockfish AI";
    if (game.player1Id === profile?.id) return game.player2?.username || "Unknown";
    return game.player1?.username || "Unknown";
  };

  const totalGames = (profile?.wins || 0) + (profile?.losses || 0) + (profile?.draws || 0);
  const winRate = totalGames > 0 ? Math.round(((profile?.wins || 0) / totalGames) * 100) : 0;

  const winRateColor = winRate >= 60 ? "from-emerald-500 to-emerald-400" : winRate >= 40 ? "from-amber-500 to-amber-400" : "from-red-500 to-red-400";
  const winRateTextColor = winRate >= 60 ? "text-emerald-400" : winRate >= 40 ? "text-amber-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }} transition={{ duration: 9, repeat: Infinity }} className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
        <motion.div animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 12, repeat: Infinity, delay: 3 }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-chart-2/8 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="gap-2 text-muted-foreground hover:text-foreground" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />Back
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight">ChessMaster</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-4xl relative z-10">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-2xl p-8 mb-8">
          {profileLoading ? (
            <div className="flex items-center gap-8">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3"><Skeleton className="h-9 w-56" /><Skeleton className="h-5 w-44" /><Skeleton className="h-5 w-32" /></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-2 rounded-full bg-primary/25 blur-lg" />
                <Avatar className="relative w-24 h-24 border-2 border-primary/50 ring-4 ring-primary/15 ring-offset-2 ring-offset-background">
                  <AvatarFallback className="text-3xl font-bold bg-primary/15 text-primary">
                    {getInitials(profile?.username || currentUsername || undefined)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold tracking-tight mb-3" data-testid="text-username">{profile?.username || currentUsername}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant="secondary" className="gap-1.5 bg-card border-border/60">
                    <Calendar className="w-3 h-3" />
                    Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Recently"}
                  </Badge>
                  <Badge variant="secondary" className="bg-card border-border/60">{totalGames} Total Games</Badge>
                </div>
                <p className="text-muted-foreground text-sm">Chess enthusiast · <span className={`font-semibold ${winRateTextColor}`}>{winRate}% win rate</span></p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Overall stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",  value: totalGames,           icon: BarChart2, color: "text-foreground",   iconBg: "bg-muted",          border: "border-border/50",      gradient: "from-muted/30 to-transparent",       testId: "text-total-games" },
            { label: "Wins",   value: profile?.wins   || 0, icon: Trophy,    color: "text-emerald-400",  iconBg: "bg-emerald-500/15", border: "border-emerald-500/20", gradient: "from-emerald-500/10 to-transparent", testId: "text-wins"        },
            { label: "Losses", value: profile?.losses  || 0, icon: Target,   color: "text-red-400",      iconBg: "bg-red-500/15",     border: "border-red-500/20",     gradient: "from-red-500/10 to-transparent",     testId: "text-losses"      },
            { label: "Draws",  value: profile?.draws   || 0, icon: Handshake,color: "text-amber-400",    iconBg: "bg-amber-500/15",   border: "border-amber-500/20",   gradient: "from-amber-500/10 to-transparent",   testId: "text-draws"       },
          ].map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="show"
              className={`rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.gradient} bg-card/60 backdrop-blur-sm p-5`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                <div className={`w-7 h-7 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`} data-testid={stat.testId}>
                {profileLoading ? <Skeleton className="h-8 w-12" /> : <AnimatedNumber value={stat.value} />}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Win rate bar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-base">Win Rate</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Overall performance</p>
            </div>
            <span className={`text-3xl font-bold ${winRateTextColor}`}>{winRate}%</span>
          </div>
          <div className="w-full bg-muted/60 rounded-full h-3 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${winRateColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${winRate}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </motion.div>

        {/* Stats by Mode */}
        {totalGames > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
            <h2 className="font-semibold text-base mb-4">Stats by Mode</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ModeStatCard
                icon={Bot}
                iconColor="text-green-400"
                iconBg="bg-green-500/15"
                border="border-green-500/20"
                gradient="from-green-500/8 to-transparent"
                label="AI — Easy"
                wins={profile?.aiEasyWins || 0}
                losses={profile?.aiEasyLosses || 0}
                draws={profile?.aiEasyDraws || 0}
                delay={0}
              />
              <ModeStatCard
                icon={Bot}
                iconColor="text-primary"
                iconBg="bg-primary/15"
                border="border-primary/20"
                gradient="from-primary/8 to-transparent"
                label="AI — Medium"
                wins={profile?.aiMediumWins || 0}
                losses={profile?.aiMediumLosses || 0}
                draws={profile?.aiMediumDraws || 0}
                delay={1}
              />
              <ModeStatCard
                icon={Bot}
                iconColor="text-red-400"
                iconBg="bg-red-500/15"
                border="border-red-500/20"
                gradient="from-red-500/8 to-transparent"
                label="AI — Hard"
                wins={profile?.aiHardWins || 0}
                losses={profile?.aiHardLosses || 0}
                draws={profile?.aiHardDraws || 0}
                delay={2}
              />
              <ModeStatCard
                icon={Globe}
                iconColor="text-emerald-400"
                iconBg="bg-emerald-500/15"
                border="border-emerald-500/20"
                gradient="from-emerald-500/8 to-transparent"
                label="Online Match"
                wins={profile?.onlineWins || 0}
                losses={profile?.onlineLosses || 0}
                draws={profile?.onlineDraws || 0}
                delay={3}
              />
              <ModeStatCard
                icon={Swords}
                iconColor="text-amber-400"
                iconBg="bg-amber-500/15"
                border="border-amber-500/20"
                gradient="from-amber-500/8 to-transparent"
                label="Friendly Match"
                wins={profile?.friendlyWins || 0}
                losses={profile?.friendlyLosses || 0}
                draws={profile?.friendlyDraws || 0}
                delay={4}
              />
            </div>
          </motion.div>
        )}

        {/* Match History */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-border/40">
            <h2 className="font-semibold text-base">Match History</h2>
          </div>
          {gamesLoading ? (
            <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
          ) : allGames && allGames.length > 0 ? (
            <div className="divide-y divide-border/40">
              {allGames.slice(0, 10).map((game, i) => {
                const isWinner = game.winnerId === profile?.id;
                const isDraw = game.result === "draw";
                const dotColor = isDraw ? "bg-amber-400" : isWinner ? "bg-emerald-400" : "bg-red-400";
                const resultLabel = isDraw ? "Draw" : isWinner ? "Won" : "Lost";
                const resultClass = isDraw ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : isWinner ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30";
                return (
                  <motion.div key={game.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.04 }}
                    className="flex items-center justify-between px-6 py-4 hover:bg-card/80 cursor-pointer transition-colors group"
                    onClick={() => setLocation(`/game/${game.id}`)} data-testid={`game-${game.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                      <div>
                        <div className="font-medium text-sm group-hover:text-primary transition-colors">{getOpponentName(game)}</div>
                        <div className="text-xs text-muted-foreground capitalize">{game.mode} · {new Date(game.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <Badge className={`border text-xs ${resultClass}`}>{resultLabel}</Badge>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-4">♟</motion.div>
              <p className="font-medium">No games in history yet</p>
              <p className="text-sm mt-1">Play your first game to see it here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

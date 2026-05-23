import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Crown, Zap, Shield, Users, Bot, Swords,
  ChevronRight, Star, Globe, BarChart3, MessageSquare
} from "lucide-react";

const CHESS_PIECES = ["♔", "♕", "♖", "♗", "♘", "♙", "♚", "♛", "♜", "♝", "♞", "♟"];

function AnimatedChessBoard() {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const pieces: Record<string, string> = {
    a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
    a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
    a2: "♙", b2: "♙", c2: "♙", d2: "♙", e2: "♙", f2: "♙", g2: "♙", h2: "♙",
    a1: "♖", b1: "♘", c1: "♗", d1: "♕", e1: "♔", f1: "♗", g1: "♘", h1: "♖",
    e4: "♙", d5: "♟", c3: "♘", f6: "♞",
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-75" />
      <div className="relative grid grid-cols-8 rounded-xl overflow-hidden shadow-2xl border border-white/10"
        style={{ width: "min(380px, 90vw)", height: "min(380px, 90vw)" }}>
        {ranks.map((rank, ri) =>
          files.map((file, fi) => {
            const sq = `${file}${rank}`;
            const isLight = (ri + fi) % 2 === 0;
            const piece = pieces[sq];
            const isWhitePiece = piece && ["♔","♕","♖","♗","♘","♙"].includes(piece);
            return (
              <div
                key={sq}
                className={`flex items-center justify-center text-2xl select-none
                  ${isLight ? "bg-[hsl(39,40%,82%)]" : "bg-[hsl(173,25%,38%)]"}`}
              >
                {piece && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: (ri * 8 + fi) * 0.01, duration: 0.3 }}
                    className={isWhitePiece
                      ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                      : "drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]"}
                  >
                    {piece}
                  </motion.span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const stats = [
  { value: "10K+", label: "Active Players" },
  { value: "50K+", label: "Games Played" },
  { value: "3", label: "Game Modes" },
  { value: "99.9%", label: "Uptime" },
];

const features = [
  {
    icon: Bot,
    title: "AI Opponent",
    desc: "Play against a smart chess engine with Easy, Medium, and Hard difficulty levels. Perfect for practice at any skill level.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Globe,
    title: "Online Multiplayer",
    desc: "Get matched with real players worldwide in seconds. Real-time move sync via WebSocket — zero lag, pure chess.",
    color: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/20",
  },
  {
    icon: Swords,
    title: "Friendly Match",
    desc: "Challenge a friend directly using a private game code. Share the code, join instantly, and play together.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/20",
  },
  {
    icon: BarChart3,
    title: "Match History",
    desc: "Every game is saved. Review your wins, losses, and draws. Track your progress over time on your profile.",
    color: "text-chart-5",
    bg: "bg-chart-5/10",
    border: "border-chart-5/20",
  },
  {
    icon: MessageSquare,
    title: "In-Game Chat",
    desc: "Talk to your opponent during the game with a clean WhatsApp-style chat panel. Good sportsmanship included.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/20",
  },
  {
    icon: Shield,
    title: "Secure & Fast",
    desc: "JWT authentication, bcrypt password hashing, and a PostgreSQL database. Your account is safe with us.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds with just a username and password." },
  { num: "02", title: "Pick Your Mode", desc: "Choose AI, Online matchmaking, or a Friendly game with a code." },
  { num: "03", title: "Play Chess", desc: "Make your moves on a beautiful interactive board." },
  { num: "04", title: "Track Progress", desc: "See your match history and stats on your profile." },
];

const testimonials = [
  { name: "Arjun S.", rating: 5, text: "The AI difficulty is spot on. Hard mode actually challenges me. Best free chess platform I've used." },
  { name: "Priya M.", rating: 5, text: "Played a friendly match with my brother across cities. The game code feature is genius — worked flawlessly." },
  { name: "Rahul K.", rating: 5, text: "Clean UI, fast moves, no ads. The chat feature makes online games feel personal. Highly recommend." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">ChessMaster</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-1.5">
                Get Started <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-2/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Free to play · No credit card</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                  Play Chess
                  <br />
                  <span className="text-primary">Like a Pro</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Challenge AI opponents, compete with players worldwide, or invite friends for a private match. One platform, infinite games.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 text-base px-8 h-12">
                    <Zap className="w-5 h-5" />
                    Start Playing Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 h-12">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-2">
                {stats.slice(0, 2).map((s, i) => (
                  <div key={i}>
                    <div className="text-3xl font-bold">{s.value}</div>
                    <div className="text-sm text-muted-foreground">{s.label}</div>
                  </div>
                ))}
                <div className="h-10 w-px bg-border" />
                <div className="flex -space-x-2">
                  {["A", "R", "P", "K"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">
                      {l}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                    +9K
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <AnimatedChessBoard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 mb-4">
              <span className="text-sm font-medium text-muted-foreground">Everything you need</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Chess Players</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From casual games to competitive matches — every feature is designed to give you the best chess experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`group p-6 rounded-2xl border ${f.border} bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Up and Running in Minutes</h2>
            <p className="text-xl text-muted-foreground">No downloads. No setup. Just chess.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="text-center relative z-10"
              >
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-primary/25">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GAME MODES */}
      <section className="py-28">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Three Ways to Play</h2>
            <p className="text-xl text-muted-foreground">Pick your battle.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "vs Computer",
                subtitle: "Solo Practice",
                desc: "Train against our AI engine. Choose Easy for learning, Medium for a challenge, or Hard to test your limits.",
                color: "from-primary/20 to-primary/5",
                border: "border-primary/30",
                iconColor: "text-primary",
                cta: "Play AI",
                href: "/signup",
              },
              {
                icon: Globe,
                title: "Online Match",
                subtitle: "Ranked Play",
                desc: "Get instantly matched with a real player. WebSocket-powered real-time sync means every move is instant.",
                color: "from-chart-2/20 to-chart-2/5",
                border: "border-chart-2/30",
                iconColor: "text-chart-2",
                cta: "Find Match",
                href: "/signup",
                featured: true,
              },
              {
                icon: Users,
                title: "Friendly Match",
                subtitle: "Play with Friends",
                desc: "Generate a 6-character game code and share it with anyone. They join, you play — simple as that.",
                color: "from-chart-3/20 to-chart-3/5",
                border: "border-chart-3/30",
                iconColor: "text-chart-3",
                cta: "Create Game",
                href: "/signup",
              },
            ].map((mode, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-2xl border ${mode.border} bg-gradient-to-b ${mode.color} ${mode.featured ? "ring-2 ring-chart-2/50 scale-105" : ""} transition-transform hover:scale-[1.02]`}
              >
                {mode.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-chart-2 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <mode.icon className={`w-10 h-10 ${mode.iconColor} mb-4`} />
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{mode.subtitle}</div>
                  <h3 className="text-2xl font-bold mb-3">{mode.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{mode.desc}</p>
                </div>
                <Link href={mode.href}>
                  <Button className="w-full" variant={mode.featured ? "default" : "outline"}>
                    {mode.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Players Love It</h2>
            <p className="text-xl text-muted-foreground">Don't take our word for it.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border bg-card"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-chart-3 text-chart-3" />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <span className="font-medium text-sm">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-chart-2/10 p-16 text-center overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="text-6xl mb-2">♟</div>
              <h2 className="text-5xl md:text-6xl font-bold">Your Move.</h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of players already on ChessMaster. Free forever, no credit card required.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-2">
                <Link href="/signup">
                  <Button size="lg" className="gap-2 text-base px-10 h-12">
                    <Zap className="w-5 h-5" />
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-base px-10 h-12">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <span className="font-bold">ChessMaster</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 ChessMaster. Built with React, Node.js & PostgreSQL.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/signup"><span className="hover:text-foreground transition-colors cursor-pointer">Sign Up</span></Link>
            <Link href="/login"><span className="hover:text-foreground transition-colors cursor-pointer">Login</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

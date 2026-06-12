import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Chess, Square } from "chess.js";
import Chessboard from "@/components/Chessboard";
import MoveList from "@/components/MoveList";
import GameControls from "@/components/GameControls";
import ChatPanel from "@/components/ChatPanel";
import DifficultySelector from "@/components/DifficultySelector";
import GameCodeModal from "@/components/GameCodeModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { ArrowLeft, Crown, Users, Trophy, Frown, Handshake } from "lucide-react";
import { getCurrentUserId, getCurrentUsername } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GameWithPlayers } from "@shared/schema";

export default function Game() {
  const [, params] = useRoute("/game/:mode");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const mode = params?.mode as "ai" | "online" | "friendly" | string;
  const isViewMode = mode && !["ai", "online", "friendly"].includes(mode);
  const gameId = isViewMode ? mode : null;
  
  const [game, setGame] = useState(new Chess());
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [showDifficultySelector, setShowDifficultySelector] = useState(mode === "ai");
  const [showGameCodeModal, setShowGameCodeModal] = useState(mode === "friendly");
  const [currentGameId, setCurrentGameId] = useState<string | null>(gameId);
  const [playerColor, setPlayerColor] = useState<"white" | "black">("white");
  const [hostGameCode, setHostGameCode] = useState<string | null>(null);
  const [lastOpponentMove, setLastOpponentMove] = useState<{ from: Square; to: Square } | null>(null);
  const [lastMyMove, setLastMyMove] = useState<{ from: Square; to: Square } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const currentUserId = getCurrentUserId();
  const currentUsername = getCurrentUsername();

  const acceptDrawOffer = async (drawGameId: string) => {
    try {
      const data = await apiRequest("POST", "/api/game/draw", { gameId: drawGameId });
      if (data.game) {
        queryClient.setQueryData(["/api/game", drawGameId], data.game);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/game", drawGameId] });
      queryClient.invalidateQueries({ queryKey: ["/api/game/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
      toast({
        title: "Draw accepted",
        description: "The game has ended in a draw.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const { data: gameData, isLoading: gameLoading } = useQuery<GameWithPlayers>({
    queryKey: ["/api/game", currentGameId],
    enabled: !!currentGameId,
    staleTime: 0,
    refetchInterval: (query) => {
      if (query.state.data?.status === "waiting") return 2000;
      if (
        query.state.data?.status === "active" &&
        (query.state.data.mode === "online" || query.state.data.mode === "friendly")
      ) {
        return 2000;
      }
      return false;
    },
  });

  useEffect(() => {
    if (gameData) {
      const chess = new Chess();
      if (gameData.pgn && gameData.pgn.trim() !== "") {
        try {
          chess.loadPgn(gameData.pgn);
        } catch {
          if (gameData.fen) chess.load(gameData.fen);
        }
      } else if (gameData.fen) {
        chess.load(gameData.fen);
      }
      setGame(chess);

      if (gameData.player2Id === currentUserId) {
        setPlayerColor("black");
      }
    }
  }, [gameData, currentUserId]);

  useEffect(() => {
    if (currentGameId && (mode === "online" || mode === "friendly")) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join", gameId: currentGameId, userId: currentUserId }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "move") {
          setGame(prevGame => {
            const newGame = new Chess();
            try { newGame.loadPgn(prevGame.pgn()); } catch { newGame.load(prevGame.fen()); }
            newGame.move({ from: data.from, to: data.to, promotion: data.promotion });
            return newGame;
          });
          setLastOpponentMove({ from: data.from as Square, to: data.to as Square });
          queryClient.invalidateQueries({ queryKey: ["/api/game", currentGameId] });
        } else if (data.type === "chat") {
          queryClient.invalidateQueries({ queryKey: [`/api/game/chat/${currentGameId}`] });
        } else if (data.type === "gameOver") {
          queryClient.invalidateQueries({ queryKey: ["/api/game", currentGameId] });
          queryClient.invalidateQueries({ queryKey: ["/api/game/recent"] });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
        } else if (data.type === "drawOffer") {
          if (data.offeredBy === currentUserId) return;
          toast({
            title: "Draw offered",
            description: `${data.offeredByUsername || "Opponent"} offered a draw.`,
            action: (
              <ToastAction altText="Accept draw" onClick={() => acceptDrawOffer(data.gameId || currentGameId)}>
                Accept
              </ToastAction>
            ),
          });
        } else if (data.type === "playerJoined") {
          queryClient.invalidateQueries({ queryKey: ["/api/game", currentGameId] });
        } else if (data.type === "opponentAbandoned") {
          queryClient.invalidateQueries({ queryKey: ["/api/game/recent"] });
          queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
          toast({
            title: "Opponent abandoned",
            description: "Your opponent has left the match. You win!",
          });
          setTimeout(() => setLocation("/dashboard"), 3000);
        }
      };

      wsRef.current = ws;

      return () => {
        ws.close();
      };
    }
  }, [currentGameId, mode, currentUserId, toast]);

  const createGameMutation = useMutation({
    mutationFn: async (data: { mode: string; difficulty?: string; gameCode?: string }) => {
      return await apiRequest("POST", "/api/game/create", data);
    },
    onSuccess: (data: { gameId: string; gameCode?: string }) => {
      setCurrentGameId(data.gameId);
      setShowDifficultySelector(false);
      setShowGameCodeModal(false);
      
      if (data.gameCode) {
        setHostGameCode(data.gameCode);
        toast({
          title: "Game created!",
          description: `Game code: ${data.gameCode}`,
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/game", data.gameId] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create game",
        description: error.message,
      });
    },
  });

  const makeMoveMutation = useMutation({
    mutationFn: async (moveData: { gameId: string; from: string; to: string; promotion?: string }) => {
      return await apiRequest("POST", "/api/game/move", moveData);
    },
    onSuccess: (data: { fen: string; pgn: string; aiMove?: { from: string; to: string } }) => {
      const newGame = new Chess();
      newGame.loadPgn(data.pgn);
      setGame(newGame);
      if (data.aiMove) {
        setLastOpponentMove({ from: data.aiMove.from as Square, to: data.aiMove.to as Square });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/game", currentGameId] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Invalid move",
        description: error.message,
      });
    },
  });

  const handleMove = (from: Square, to: Square, promotion?: string) => {
    if (!currentGameId) return;
    if (gameData?.status === "finished") return;

    const testMove = new Chess();
    try { testMove.loadPgn(game.pgn()); } catch { testMove.load(game.fen()); }
    const move = testMove.move({ from, to, promotion: promotion as any });
    if (!move) return;

    setGame(testMove);
    setLastMyMove({ from, to });

    if (mode === "online" || mode === "friendly") {
      wsRef.current?.send(JSON.stringify({
        type: "move",
        gameId: currentGameId,
        from,
        to,
        promotion,
      }));
    }

    makeMoveMutation.mutate({
      gameId: currentGameId,
      from,
      to,
      promotion,
    });
  };

  const handleDifficultySelect = (difficulty: "easy" | "medium" | "hard") => {
    setSelectedDifficulty(difficulty);
    createGameMutation.mutate({ mode: "ai", difficulty });
  };

  const handleGameCodeSubmit = (code?: string) => {
    if (code) {
      createGameMutation.mutate({ mode: "friendly", gameCode: code });
    } else {
      createGameMutation.mutate({ mode: "friendly" });
    }
  };

  const handleResign = async () => {
    if (!currentGameId) return;
    try {
      await apiRequest("POST", "/api/game/resign", { gameId: currentGameId });
      wsRef.current?.send(JSON.stringify({
        type: "gameOver",
        gameId: currentGameId,
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/game", currentGameId] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleOfferDraw = async () => {
    if (!currentGameId) return;
    try {
      if (mode === "ai") {
        const data = await apiRequest("POST", "/api/game/draw", { gameId: currentGameId });
        if (data.game) {
          queryClient.setQueryData(["/api/game", currentGameId], data.game);
        }
        queryClient.invalidateQueries({ queryKey: ["/api/game", currentGameId] });
        queryClient.invalidateQueries({ queryKey: ["/api/game/recent"] });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
        toast({
          title: "Draw accepted",
          description: "The game has ended in a draw.",
        });
        return;
      }

      await apiRequest("POST", "/api/game/draw-offer", { gameId: currentGameId });
      toast({
        title: "Draw offered",
        description: "Waiting for your opponent to accept.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const getInitials = (username?: string) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  const getOpponentName = () => {
    if (!gameData) return "Opponent";
    if (gameData.mode === "ai") return `Stockfish (${gameData.difficulty || "medium"})`;
    if (gameData.player1Id === currentUserId) return gameData.player2?.username || "Waiting...";
    return gameData.player1?.username || "Waiting...";
  };

  const isMyTurn = () => {
    if (!gameData || gameData.status !== "active") return false;
    if (gameData.mode === "ai") return game.turn() === "w";
    if (playerColor === "white") return game.turn() === "w";
    return game.turn() === "b";
  };

  useEffect(() => {
    if (!currentGameId && mode === "online" && !createGameMutation.isPending) {
      createGameMutation.mutate({ mode: "online" });
    }
  }, [mode, currentGameId, currentGameId]);

  if (showDifficultySelector) {
    return <DifficultySelector onSelect={handleDifficultySelect} onCancel={() => setLocation("/dashboard")} />;
  }

  if (showGameCodeModal) {
    return <GameCodeModal onSubmit={handleGameCodeSubmit} onCancel={() => setLocation("/dashboard")} />;
  }

  if (!currentGameId && mode === "online") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-12 text-center">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Finding opponent...</h2>
            <p className="text-muted-foreground">Searching for available players or creating a new game</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameData?.status === "waiting" && (mode === "online" || mode === "friendly")) {
    const displayCode = hostGameCode || gameData.gameCode;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Waiting for opponent...</h2>
            {mode === "friendly" && displayCode ? (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Share this code with your friend:</p>
                <div
                  className="text-4xl font-mono font-bold tracking-widest bg-muted rounded-lg py-4 px-6 cursor-pointer hover:bg-muted/80 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(displayCode);
                    toast({ title: "Copied!", description: "Game code copied to clipboard" });
                  }}
                >
                  {displayCode}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Click to copy</p>
              </div>
            ) : (
              <p className="text-muted-foreground mb-4">Waiting for another player to join</p>
            )}
            <Button onClick={() => setLocation("/dashboard")} variant="outline" data-testid="button-cancel">
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Result overlay */}
      {gameData?.status === "finished" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border rounded-2xl p-10 text-center max-w-sm w-full mx-4 shadow-2xl">
            {gameData.result === "draw" ? (
              <>
                <Handshake className="w-20 h-20 mx-auto mb-4 text-chart-3" />
                <h2 className="text-3xl font-bold mb-2">It's a Draw!</h2>
                <p className="text-muted-foreground mb-8">A well-fought game by both sides.</p>
              </>
            ) : gameData.winnerId === currentUserId ? (
              <>
                <div className="relative mb-4">
                  <Trophy className="w-20 h-20 mx-auto text-yellow-400" />
                  <div className="absolute inset-0 blur-xl bg-yellow-400/30 rounded-full" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-yellow-400">Victory!</h2>
                <p className="text-muted-foreground mb-8">Congratulations, you won!</p>
              </>
            ) : (
              <>
                <Frown className="w-20 h-20 mx-auto mb-4 text-destructive" />
                <h2 className="text-3xl font-bold mb-2 text-destructive">Defeated</h2>
                <p className="text-muted-foreground mb-8">Better luck next time!</p>
              </>
            )}
            <Button size="lg" className="w-full" onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/game/recent"] });
              queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
              setLocation("/dashboard");
            }}>Continue</Button>
          </div>
        </div>
      )}

      {/* Slim header */}
      <header className="shrink-0 border-b bg-card/50 backdrop-blur-lg z-40">
        <div className="px-4 h-11 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-sm" onClick={() => setLocation("/dashboard")} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">ChessMaster</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Game area — flex row, fills viewport */}
      <div className="flex-1 flex gap-2 p-2 min-h-0 overflow-hidden">

        {/* LEFT: Move history */}
        <div className="hidden lg:flex flex-col w-44 xl:w-52 shrink-0 min-h-0">
          <MoveList game={game} />
        </div>

        {/* CENTER: Player info + Board */}
        <div className="flex-1 flex flex-col justify-between min-h-0 min-w-0 items-center gap-1.5">
          {/* Opponent row */}
          <div className="w-full flex items-center justify-between px-1" style={{ maxWidth: "min(calc(100vh - 130px), 600px)" }}>
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-[10px] bg-muted">{getInitials(getOpponentName())}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm leading-none">{getOpponentName()}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${playerColor === "white" ? "bg-gray-800 border border-gray-500" : "bg-white border border-gray-300"}`} />
                  {playerColor === "white" ? "Black" : "White"}
                </div>
              </div>
            </div>
            {!isMyTurn() && gameData?.status === "active" && (
              <Badge className="bg-primary text-primary-foreground animate-pulse text-[10px] px-1.5 py-0.5">Thinking...</Badge>
            )}
          </div>

          {/* Board — square, sized to fit remaining height */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            <div
              className="w-full h-full"
              style={{
                maxWidth: "min(calc(100vh - 130px), calc(100vw - 440px), 600px)",
                maxHeight: "min(calc(100vh - 130px), calc(100vw - 440px), 600px)",
                aspectRatio: "1",
              }}
            >
              <Chessboard
                game={game}
                onMove={handleMove}
                disabled={gameData?.status === "finished" || gameLoading || !isMyTurn()}
                orientation={playerColor}
                lastOpponentMove={lastOpponentMove}
                lastMyMove={lastMyMove}
                data-testid="chessboard"
              />
            </div>
          </div>

          {/* Your row */}
          <div className="w-full flex items-center justify-between px-1" style={{ maxWidth: "min(calc(100vh - 130px), 600px)" }}>
            <div className="flex items-center gap-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(currentUsername || undefined)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm leading-none">{currentUsername}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${playerColor === "white" ? "bg-white border border-gray-300" : "bg-gray-800 border border-gray-500"}`} />
                  {playerColor === "white" ? "White" : "Black"}
                </div>
              </div>
            </div>
            {isMyTurn() && gameData?.status === "active" && (
              <Badge className="bg-chart-2 text-white animate-pulse text-[10px] px-1.5 py-0.5">Your turn</Badge>
            )}
          </div>
        </div>

        {/* RIGHT: Controls + Chat */}
        <div className="hidden md:flex flex-col w-52 xl:w-60 shrink-0 gap-2 min-h-0">
          <GameControls
            gameStatus={gameData?.status || "active"}
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            gameResult={gameData?.result || null}
          />
          {currentGameId && (mode === "online" || mode === "friendly") && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatPanel gameId={currentGameId} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom controls */}
      <div className="md:hidden shrink-0 border-t bg-card/50 p-2">
        <GameControls
          gameStatus={gameData?.status || "active"}
          onResign={handleResign}
          onOfferDraw={handleOfferDraw}
          gameResult={gameData?.result || null}
        />
      </div>
    </div>
  );
}

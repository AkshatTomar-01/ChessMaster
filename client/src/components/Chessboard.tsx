import { useState } from "react";
import { Chess, Square } from "chess.js";
import { motion, AnimatePresence } from "framer-motion";

interface ChessboardProps {
  game: Chess;
  onMove: (from: Square, to: Square, promotion?: string) => void;
  disabled?: boolean;
  orientation?: "white" | "black";
  highlightMoves?: boolean;
  lastOpponentMove?: { from: Square; to: Square } | null;
}

const pieceSymbols: Record<string, string> = {
  p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚",
  P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕", K: "♔",
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

export default function Chessboard({
  game,
  onMove,
  disabled = false,
  orientation = "white",
  highlightMoves = true,
  lastOpponentMove = null,
}: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const handleSquareClick = (square: Square) => {
    if (disabled) return;

    if (selectedSquare) {
      const moves = game.moves({ square: selectedSquare, verbose: true });
      const move = moves.find((m) => m.to === square);

      if (move) {
        if (move.flags.includes("p")) {
          onMove(selectedSquare, square, "q");
        } else {
          onMove(selectedSquare, square);
        }
        setLastMove({ from: selectedSquare, to: square });
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
          const newMoves = game.moves({ square, verbose: true });
          setLegalMoves(newMoves.map((m) => m.to as Square));
        } else {
          setSelectedSquare(null);
          setLegalMoves([]);
        }
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map((m) => m.to as Square));
      }
    }
  };

  const getSquareColor = (fileIdx: number, rankIdx: number) => {
    const isLight = (fileIdx + rankIdx) % 2 === 0;
    return isLight ? "bg-[hsl(39,40%,85%)]" : "bg-[hsl(173,25%,45%)]";
  };

  const isHighlighted = (sq: Square) => highlightMoves && legalMoves.includes(sq);
  const isSelected = (sq: Square) => selectedSquare === sq;
  const isMyLastMove = (sq: Square) => !!(lastMove && (lastMove.from === sq || lastMove.to === sq));
  const isOpponentLastMove = (sq: Square) => !!(lastOpponentMove && (lastOpponentMove.from === sq || lastOpponentMove.to === sq));

  const displayFiles = orientation === "white" ? files : [...files].reverse();
  const displayRanks = orientation === "white" ? ranks : [...ranks].reverse();

  return (
    <div className="relative">
      <div className="grid grid-cols-8 gap-0 border-2 border-border rounded-lg overflow-hidden shadow-xl">
        {displayRanks.map((rank, rankIndex) =>
          displayFiles.map((file, fileIndex) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);

            return (
              <motion.button
                key={square}
                onClick={() => handleSquareClick(square)}
                disabled={disabled}
                className={`
                  aspect-square relative flex items-center justify-center text-5xl md:text-6xl lg:text-7xl
                  transition-all duration-150
                  ${getSquareColor(fileIndex, rankIndex)}
                  ${isSelected(square) ? "ring-4 ring-primary ring-inset" : ""}
                  ${!disabled && piece && piece.color === game.turn() ? "cursor-pointer hover-elevate" : ""}
                  ${disabled ? "cursor-not-allowed" : ""}
                `}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                data-testid={`square-${square}`}
              >
                {/* My last move — amber tint */}
                {isMyLastMove(square) && (
                  <div className="absolute inset-0 bg-amber-400/30 pointer-events-none z-0" />
                )}

                {/* Opponent last move — teal glow */}
                {isOpponentLastMove(square) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 pointer-events-none z-0"
                  >
                    <div className="absolute inset-0 bg-primary/30" />
                    <div className="absolute inset-0 shadow-[inset_0_0_0_3px_hsl(173,80%,40%),inset_0_0_14px_rgba(20,184,166,0.55)]" />
                  </motion.div>
                )}

                {/* Legal move indicators */}
                {isHighlighted(square) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                  >
                    <div className={`rounded-full ${piece ? "w-full h-full border-4 border-primary/50" : "w-4 h-4 bg-primary/60"}`} />
                  </motion.div>
                )}

                {/* Chess piece */}
                <AnimatePresence mode="wait">
                  {piece && (
                    <motion.div
                      key={`${square}-${piece.type}-${piece.color}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`
                        select-none pointer-events-none relative z-20
                        ${piece.color === "w"
                          ? "text-white [text-shadow:0_0_3px_#000,0_1px_6px_#000,0_2px_8px_rgba(0,0,0,0.9)]"
                          : "text-[#1a1a1a] [text-shadow:0_0_3px_rgba(255,255,255,0.9),0_1px_6px_rgba(255,255,255,0.7),0_2px_8px_rgba(255,255,255,0.5)]"}
                      `}
                    >
                      {pieceSymbols[piece.type.toUpperCase()]}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Coordinate labels */}
                {fileIndex === 0 && (
                  <span className="absolute left-1 top-1 text-xs font-mono font-semibold opacity-60 pointer-events-none select-none z-30">
                    {rank}
                  </span>
                )}
                {rankIndex === displayRanks.length - 1 && (
                  <span className="absolute right-1 bottom-1 text-xs font-mono font-semibold opacity-60 pointer-events-none select-none z-30">
                    {file}
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

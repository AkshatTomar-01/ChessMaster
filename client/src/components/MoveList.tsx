import { useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MoveListProps {
  game: Chess;
}

export default function MoveList({ game }: MoveListProps) {
  const history = game.history({ verbose: true });
  const bottomRef = useRef<HTMLDivElement>(null);

  const movePairs: Array<{ white?: any; black?: any; moveNumber: number }> = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      white: history[i],
      black: history[i + 1],
      moveNumber: Math.floor(i / 2) + 1,
    });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length]);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
        <span className="text-sm font-semibold">Move History</span>
        <span className="text-xs text-muted-foreground">{history.length} moves</span>
      </div>

      <ScrollArea className="h-[380px]">
        <div className="p-3">
          {movePairs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-3xl mb-2 opacity-30">♟</div>
              <p className="text-xs">No moves yet</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="grid grid-cols-[32px_1fr_1fr] gap-1 px-2 mb-1">
                <span className="text-[10px] text-muted-foreground font-medium">#</span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white border border-gray-400 inline-block" />
                  White
                </span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-800 border border-gray-500 inline-block" />
                  Black
                </span>
              </div>

              {movePairs.map((pair, index) => {
                const isLatest = index === movePairs.length - 1;
                return (
                  <div
                    key={index}
                    className={`grid grid-cols-[32px_1fr_1fr] gap-1 px-2 py-1.5 rounded-lg text-sm font-mono transition-colors
                      ${isLatest ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/40"}`}
                    data-testid={`move-pair-${index}`}
                  >
                    <span className="text-muted-foreground text-xs font-semibold self-center">
                      {pair.moveNumber}.
                    </span>
                    <span className={`font-medium text-xs self-center ${isLatest && history.length % 2 === 1 ? "text-primary font-bold" : ""}`}>
                      {pair.white?.san}
                    </span>
                    <span className={`font-medium text-xs self-center ${isLatest && history.length % 2 === 0 ? "text-primary font-bold" : ""}`}>
                      {pair.black?.san || ""}
                    </span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BATTLE_MOVES, BattleMove } from "@/convex/schema/battles";
import { Id } from "@/convex/_generated/dataModel";

const BATTLE_MOVES_OPTIONS = [
  { label: "Rock", value: BATTLE_MOVES.ROCK },
  { label: "Paper", value: BATTLE_MOVES.PAPER },
  { label: "Scissors", value: BATTLE_MOVES.SCISSORS },
];

interface JoinBattleProps {
  disabled: boolean;
  battleId: Id<"battles">;
  onJoinBattle: ({battleId, joinerMove }: {battleId: Id<"battles">, joinerMove: BattleMove}) => void;
}

export function JoinBattle(props: JoinBattleProps) {
  const [open, setOpen] = useState(false);
  const [move, setMove] = useState<BattleMove>(BATTLE_MOVES.ROCK);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await props.onJoinBattle({
      battleId: props.battleId,
      joinerMove: move
    }
    );
    setOpen(false);
    setMove(BATTLE_MOVES.ROCK);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={props.disabled}>Participate</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Battle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Your Move
            <select
              value={move}
              onChange={(e) => setMove(e.target.value as BattleMove)}
              className="border rounded px-2 py-1"
            >
              {BATTLE_MOVES_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {error && <span className="text-red-500 text-xs">{error}</span>}
          <Button type="submit">Join</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

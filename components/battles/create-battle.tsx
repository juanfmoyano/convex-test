"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { BATTLE_MOVES, BattleMove } from "@/convex/schema/battles";

const BATTLE_MOVES_OPTIONS = [
  { label: "Rock", value: BATTLE_MOVES.ROCK },
  { label: "Paper", value: BATTLE_MOVES.PAPER },
  { label: "Scissors", value: BATTLE_MOVES.SCISSORS },
];

interface CreateBattleProps {
  balance: number;
  onCreateBattle: ({
    battleAmount,
    battleMove,
  }: {
    battleAmount: number;
    battleMove: BattleMove;
  }) => void;
}
export const CreateBattle = (props: CreateBattleProps) => {
  const [open, setOpen] = useState(false);
  const [move, setMove] = useState<BattleMove>(BATTLE_MOVES.ROCK);
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (amount < 1) {
      setError("Amount must be at least 1");
      return;
    }
    if (amount > props.balance) {
      setError("Amount cannot exceed your balance");
      return;
    }
    await props.onCreateBattle({ battleAmount: amount, battleMove: move });
    setOpen(false);
    setAmount(1);
    setMove(BATTLE_MOVES.ROCK);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Battle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Battle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Move
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
          <label className="flex flex-col gap-1">
            Bet Amount
            <Input
              type="number"
              min={1}
              max={props.balance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <span className="text-xs text-muted-foreground">
              {props.balance - amount >= 0
                ? `Your final balance will be ${props.balance - amount} tokens`
                : "Insufficient balance"}
              <br />
            </span>
          </label>
          {error && <span className="text-red-500 text-xs">{error}</span>}
          <Button type="submit" disabled={amount > props.balance || amount < 1}>
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

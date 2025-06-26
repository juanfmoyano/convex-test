"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { CreateBattle } from "@/components/battles/create-battle";
import { JoinBattle } from "@/components/battles/join-battle";
import { BattleMove } from "@/convex/schema/battles";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function Battles() {
  const transactions = useQuery(api.transactions.getAllTransactions) || [];
  const balance = useQuery(api.transactions.getUserBalance, {}) || 0;
  const openBattles = useQuery(api.battles.getOpenBattles, { limit: 10 }) || [];
  const finishedBattles = useQuery(api.battles.getFinishedBattles, { limit: 10 }) || [];

  const claimDaily = useMutation(api.freeClaims.claimDailyTokens);
  const createBattleMutation = useMutation(api.battles.createBattle);
  const joinBattleMutation = useMutation(api.battles.joinBattle);

  const [error, setError] = useState<string | null>(null);

  async function handleClaimDaily() {
    setError(null);
    try {
      await claimDaily({});
    } catch (e) {
      setError((e as Error).message || "Failed to claim daily tokens");
    }
  }

  async function handleCreateBattle({ battleAmount, battleMove }: { battleAmount: number; battleMove: BattleMove }) {
    setError(null);
    try {
      await createBattleMutation({ betAmount: battleAmount, creatorMove: battleMove });
    } catch (e) {
      setError((e as Error).message || "Failed to create battle");
    }
  }

  async function handleJoinBattle({ battleId, joinerMove }: { battleId: Id<"battles">; joinerMove: BattleMove }) {
    setError(null);
    try {
      await joinBattleMutation({ battleId, joinerMove });
    } catch (e) {
      setError((e as Error).message || "Failed to join battle");
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Button onClick={handleClaimDaily} className="mb-4">
          Claim Daily Tokens
        </Button>
        {error && <div className="text-red-500">{error}</div>}
        <h1 className="text-3xl font-bold">Your Balance: {balance} tokens</h1>
        <CreateBattle onCreateBattle={handleCreateBattle} balance={balance} />
        <h1 className="text-3xl font-bold">Open battles</h1>
        <ul className="list-disc pl-5">
          {openBattles.map((battle) => (
            <li key={battle._id.toString()} className="flex flex-col gap-1 py-4">
              <span className="text-sm">Battle ID: {battle._id.toString()}</span>
              <span className="text-sm">{battle.bet_amount} tokens</span>
              <span className="text-sm">{battle.creatorUser.email}</span>
              {battle.isOwnBattle ? null : (
                <JoinBattle
                  disabled={!battle.canParticipate}
                  battleId={battle._id}
                  onJoinBattle={handleJoinBattle}
                />
              )}
            </li>
          ))}
        </ul>
        <h1 className="text-3xl font-bold">Finished battles</h1>
        <ul className="list-disc pl-5">
          {finishedBattles.map((battle) => (
            <li key={battle._id.toString()} className="flex flex-col gap-1 py-4">
              <span className="text-sm">Battle ID: {battle._id.toString()}</span>
              <span className="text-sm">{battle.bet_amount} tokens</span>
              <span className="text-sm">{battle.creatorUser.email} vs {battle.joinerUser.email}</span>
              <span className="text-sm">Winner: {battle.winnerUser?.email || "Draw"}</span>
            </li>
          ))}
        </ul>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <ul className="list-disc pl-5">
          {transactions.map((transaction) => (
            <li key={transaction._id.toString()}>
              <span>
                [{transaction.sourceUser.email} -&gt; {transaction.targetUser.email}] [{transaction.amount}] - {transaction.description}
              </span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

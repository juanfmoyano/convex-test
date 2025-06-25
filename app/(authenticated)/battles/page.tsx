import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function Battles() {
  const transactions = await fetchQuery(api.transactions.getAllTransactions);
  const claims = await fetchQuery(api.freeClaims.getAllClaims);
	const balance = await fetchQuery(api.transactions.getUserBalance, {}, {
		token: await convexAuthNextjsToken(),
	});

  async function claimDaily() {
    "use server";
    await fetchMutation(
      api.freeClaims.claimDailyTokens,
      {},
      { token: await convexAuthNextjsToken() }
    );
    revalidatePath("/battles");
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Button onClick={claimDaily} className="mb-4">
          Claim Daily Tokens
        </Button>
				<h1 className="text-3xl font-bold">Your Balance: {balance} tokens</h1>
        <h1 className="text-3xl font-bold">Claims</h1>
        <ul className="list-disc pl-5">
          {claims.map((claim) => (
            <li key={claim._id.toString()}>
              {claim.user_id.toString()} claimed {claim.amount} tokens
            </li>
          ))}
        </ul>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <ul className="list-disc pl-5">
          {transactions.map((transaction) => (
            <li key={transaction._id.toString()}>
              {transaction.sourceUser?.email} sent {transaction.amount}{" "}
              tokens to {transaction.targetUser?.email} -{" "}
              {transaction.description}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

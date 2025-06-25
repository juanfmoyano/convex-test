## ✨ Learn Convex by building a simple game

### 🧠 Challenge Goal

This challenge aims to help you get familiar with **Convex** and understand how to use it as a modern, reactive backend integrated with **Next.js**, with the end objective of forming a solid opinion about the tool and evaluating which products it suits best.

Things to do:

- Create a project from scratch with Next.js + Convex.
- Define Convex schemas and migrate the database between versions (Migrations component).
- Read and write data in Convex (`useQuery`, `useMutation`).
- [Validate function inputs](https://docs.convex.dev/functions/validation) and schemas, [infer types](https://docs.convex.dev/functions/validation#extracting-typescript-types).
- Handle internal vs. user-facing errors.
- Use Internal Functions for reusable logic.
- Use **Actions** to call external services.
- Set up user authentication (nickname + password).
- Protect private routes in Next.js (middleware).
- Do SSR with hydration + client-side reactivity using `preloadQuery`.
- Set up and run Cron Jobs.
- Implement a component from Convex's official library (Aggregate).
- Deploy to Vercel + Convex Cloud (free tier) ([convex referral link for 100% more cheff tokens + other benefits](https://convex.dev/referral/JUANSA9844)).
- Configure and share the GitHub repo with the team.

### ✅ Final Deliverables

- Private GitHub repo with read access granted to the team.
- Live production URL (Vercel).

---

## 🎮 Product to Build - RPC Arena (Rock, Paper, Scissors)

You will build a **simple one-on-one rock-paper-scissors betting platform** with the following features:

Demo: https://kzmoewldy7zk83e8zaz3.lite.vusercontent.net/  
v0: https://v0.dev/chat/1v1-betting-game-7LHMSdwWOxu

### 1. Authentication
- Use [Convex Auth](https://docs.convex.dev/auth/convex-auth)
- Unauthenticated users can view all battles.
- To participate, users must sign up or log in (nickname + password).
- Login should happen via a **modal**, not a separate page.
- Include a button for logging out.

### 2. Daily Token Claim
- Logged-in users can **claim 100 tokens per day** (once per day).
- Tokens are used for betting.
- Use a ledger-like system for token transactions and aggregate the result to calculate the current balance.
  - Table with incoming and outgoing transactions
  - Try [Convex aggregate component](https://www.convex.dev/components/aggregate) for calculating the balance, per user.

### 3. Create Battles
- A user can create a public battle:
  - Set the amount of tokens to bet.
  - Choose their move (rock, paper, or scissors).
- Only **one other player can join**:
  - Must bet the same amount.
  - Also chooses their move.
  - Battle move/choice is private until the battle resolution is published.
- For creating the battle, use a random Giphy image:
  - Generate a random GIF with the tag stone/paper/scissor.
  - `https://api.giphy.com/v1/gifs/random?api_key=xxxxxx&tag=paper&rating=g`
  - Store the GIF ID in the database.
  - Embed the GIF on the frontend as the battle cover using this URL: `https://i.giphy.com/{gif_id}.webp`

### 4. Battle Resolution
- Once both players have submitted their move, the result is revealed.
- Use [Convex scheduler](https://docs.convex.dev/scheduling/scheduled-functions) to calculate the winner 3 seconds after both bets are placed (show a countdown animation in the meantime).
- Store the winner user ID in the battle entity.
- The winner takes all the tokens.
- Everything updates in real-time and is visible to everyone.

### 5. Single Page App
- The entire app lives in a single view.
- Add a **basic chat** on the side (or wherever you choose); only signed-in users can send messages.
  - Load only the last 50 chat messages.
  - Auto-delete all other chat messages daily via a [cron job](https://docs.convex.dev/scheduling/cron-jobs).
- Show all open battles live at the top.
- Show the last 10 finished battles below.
- Include some metrics at the top:
  - Total battles played.
  - Total coins rewarded.
  - Use [Convex aggregate component](https://www.convex.dev/components/aggregate)
- Each user can see a list of their last 5 battles.

-----

### Extra Tech Notes

- Use [convex rules](https://docs.convex.dev/ai/using-cursor) for cursor/copilot
- Find a use case for using an [Internal Function](https://docs.convex.dev/functions/internal-functions) (as a replacement for services).
- Implement error handling and use [`ConvexError`](https://docs.convex.dev/functions/error-handling/application-errors) when a user tries to use an already taken nickname.
  - Also handle unexpected Giphy errors (as opposed to genuine app errors like duplicate nickname).
- [Use `preloadQuery` for SSR](https://docs.convex.dev/client/react/nextjs/server-rendering)
- Try using: [convex-helpers](https://www.npmjs.com/package/convex-helpers)
- Add a leaderboard with the top 5 players based on wins:
  - Make sure battles and users exist first.
  - Create the leaderboard schema afterward, without resetting the DB.
  - This will help you learn how to run a [migration](https://www.convex.dev/components/migrations).
  - The migration should also show how to backfill missing data for older entities (like an aggregate).
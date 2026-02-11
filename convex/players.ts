import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrCreatePlayer = mutation({
  args: { username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("playerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing;
    }

    const id = await ctx.db.insert("playerStats", {
      userId,
      username: args.username || "Pirate",
      currentStreak: 0,
      highestStreak: 0,
      totalWins: 0,
      totalLosses: 0,
      lastPlayedAt: Date.now(),
    });

    return await ctx.db.get(id);
  },
});

export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("playerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const updateUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("playerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, { username: args.username });
    }
  },
});

export const recordMatch = mutation({
  args: {
    playerCharacter: v.string(),
    opponentCharacter: v.string(),
    playerHealth: v.number(),
    opponentHealth: v.number(),
    result: v.union(v.literal("win"), v.literal("loss")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("playerStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!player) throw new Error("Player not found");

    const now = Date.now();
    let newStreak = player.currentStreak;
    let newHighest = player.highestStreak;
    let newWins = player.totalWins;
    let newLosses = player.totalLosses;

    if (args.result === "win") {
      newStreak += 1;
      newWins += 1;
      if (newStreak > newHighest) {
        newHighest = newStreak;
      }
    } else {
      newStreak = 0;
      newLosses += 1;
    }

    await ctx.db.patch(player._id, {
      currentStreak: newStreak,
      highestStreak: newHighest,
      totalWins: newWins,
      totalLosses: newLosses,
      favoriteCharacter: args.playerCharacter,
      lastPlayedAt: now,
    });

    await ctx.db.insert("matches", {
      userId,
      playerCharacter: args.playerCharacter,
      opponentCharacter: args.opponentCharacter,
      playerHealth: args.playerHealth,
      opponentHealth: args.opponentHealth,
      result: args.result,
      streakAtTime: newStreak,
      playedAt: now,
    });

    return { newStreak, newHighest };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const players = await ctx.db
      .query("playerStats")
      .withIndex("by_highest_streak")
      .order("desc")
      .take(10);

    return players;
  },
});

export const getRecentMatches = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("matches")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);
  },
});

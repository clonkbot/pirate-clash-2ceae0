import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Player stats and high scores
  playerStats: defineTable({
    userId: v.id("users"),
    username: v.string(),
    currentStreak: v.number(),
    highestStreak: v.number(),
    totalWins: v.number(),
    totalLosses: v.number(),
    favoriteCharacter: v.optional(v.string()),
    lastPlayedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_highest_streak", ["highestStreak"]),

  // Match history
  matches: defineTable({
    userId: v.id("users"),
    playerCharacter: v.string(),
    opponentCharacter: v.string(),
    playerHealth: v.number(),
    opponentHealth: v.number(),
    result: v.union(v.literal("win"), v.literal("loss")),
    streakAtTime: v.number(),
    playedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_played_at", ["playedAt"]),
});

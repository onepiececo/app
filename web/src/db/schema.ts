import { bigint, bigserial, boolean, date, integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Better Auth core tables.
// The Go server owns the migrations under server/store/migrations.
// Keep these definitions in sync with whatever 001_better_auth.up.sql creates.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Written by Better Auth's jwt() plugin, read by the Go server for JWKS verification.
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at"),
});

// Anime index. Owned by 002_anime_index.up.sql.

export const anime = pgTable("anime", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: text("slug").notNull().unique(),

  titlePrimary: text("title_primary").notNull(),
  titleRomaji: text("title_romaji"),
  titleEnglish: text("title_english"),
  titleNative: text("title_native"),

  format: text("format"),
  status: text("status"),
  source: text("source"),
  season: text("season"),
  seasonYear: integer("season_year"),
  episodes: integer("episodes"),
  durationMinutes: integer("duration_minutes"),

  averageScore: integer("average_score"),
  meanScore: integer("mean_score"),
  popularity: integer("popularity").notNull().default(0),
  favourites: integer("favourites").notNull().default(0),

  isAdult: boolean("is_adult").notNull().default(false),
  isGameEligible: boolean("is_game_eligible").notNull().default(true),

  coverSourceUrl: text("cover_source_url"),
  bannerSourceUrl: text("banner_source_url"),
  coverColor: text("cover_color"),

  malRank: integer("mal_rank"),
  malMembers: integer("mal_members"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const animeAlias = pgTable(
  "anime_alias",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    animeId: bigint("anime_id", { mode: "number" })
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
    source: text("source").notNull(),
    priority: integer("priority").notNull().default(100),
  },
  (t) => ({
    aliasUnique: unique().on(t.animeId, t.normalizedAlias),
  }),
);

export const studio = pgTable("studio", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  source: text("source"),
  sourceId: text("source_id"),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull().unique(),
});

export const animeStudio = pgTable(
  "anime_studio",
  {
    animeId: bigint("anime_id", { mode: "number" })
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    studioId: bigint("studio_id", { mode: "number" })
      .notNull()
      .references(() => studio.id, { onDelete: "cascade" }),
    isMain: boolean("is_main").notNull().default(false),
  },
  (t) => ({ pk: primaryKey({ columns: [t.animeId, t.studioId] }) }),
);

export const tag = pgTable("tag", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  source: text("source"),
  sourceId: text("source_id"),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull().unique(),
  category: text("category"),
  isSpoiler: boolean("is_spoiler").notNull().default(false),
  isAdult: boolean("is_adult").notNull().default(false),
});

export const animeTag = pgTable(
  "anime_tag",
  {
    animeId: bigint("anime_id", { mode: "number" })
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    tagId: bigint("tag_id", { mode: "number" })
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
    rank: integer("rank"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.animeId, t.tagId] }) }),
);

export const genre = pgTable("genre", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull().unique(),
});

export const animeGenre = pgTable(
  "anime_genre",
  {
    animeId: bigint("anime_id", { mode: "number" })
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    genreId: bigint("genre_id", { mode: "number" })
      .notNull()
      .references(() => genre.id, { onDelete: "cascade" }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.animeId, t.genreId] }) }),
);

export const animeRelation = pgTable("anime_relation", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  fromAnimeId: bigint("from_anime_id", { mode: "number" })
    .notNull()
    .references(() => anime.id, { onDelete: "cascade" }),
  toAnimeId: bigint("to_anime_id", { mode: "number" }).references(() => anime.id, { onDelete: "set null" }),
  externalToSource: text("external_to_source"),
  externalToId: text("external_to_id"),
  relationType: text("relation_type").notNull(),
});

export const chara = pgTable("chara", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  source: text("source").notNull(),
  sourceId: text("source_id").notNull(),
  nameFull: text("name_full").notNull(),
  nameNative: text("name_native"),
  imageUrl: text("image_url"),
  gender: text("gender"),
  age: text("age"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({ sourceUniq: unique().on(t.source, t.sourceId) }));

export const animeChara = pgTable(
  "anime_chara",
  {
    animeId: bigint("anime_id", { mode: "number" })
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    charaId: bigint("chara_id", { mode: "number" })
      .notNull()
      .references(() => chara.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("SUPPORTING"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.animeId, t.charaId] }) }),
);

export const animeAsset = pgTable(
  "anime_asset",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    animeId: bigint("anime_id", { mode: "number" })
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    source: text("source").notNull(),
    sourceUrl: text("source_url").notNull(),
    cdnUrl: text("cdn_url"),
    width: integer("width"),
    height: integer("height"),
    dominantColor: text("dominant_color"),
    blurhash: text("blurhash"),
    status: text("status").notNull().default("remote"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({ assetUnique: unique().on(t.animeId, t.kind, t.source) }),
);

// Ingestion bookkeeping. Owned by 003_ingestion.up.sql.

export const sourceRuns = pgTable("source_runs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  source: text("source").notNull(),
  job: text("job").notNull(),
  status: text("status").notNull().default("running"),
  cursor: jsonb("cursor"),
  rowsSeen: integer("rows_seen").notNull().default(0),
  rowsWritten: integer("rows_written").notNull().default(0),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
  error: text("error"),
});

export const sourcePayloads = pgTable(
  "source_payloads",
  {
    source: text("source").notNull(),
    sourceId: text("source_id").notNull(),
    payload: jsonb("payload").notNull(),
    payloadHash: text("payload_hash"),
    fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.source, t.sourceId] }) }),
);

export const sourceIdMap = pgTable(
  "source_id_map",
  {
    source: text("source").notNull(),
    sourceId: text("source_id").notNull(),
    animeId: bigint("anime_id", { mode: "number" })
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    confidence: integer("confidence").notNull().default(100),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.source, t.sourceId] }),
    animeUnique: unique().on(t.animeId, t.source),
  }),
);

// Player identity. Owned by 004_player.up.sql.

export const userProfile = pgTable("user_profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  timezone: text("timezone").notNull().default("America/New_York"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const anonymousPlayer = pgTable("anonymous_player", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  anonymousKeyHash: text("anonymous_key_hash").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const playerIdentity = pgTable("player_identity", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  anonymousPlayerId: uuid("anonymous_player_id").references(() => anonymousPlayer.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Games. Owned by 005_games.up.sql.

export const game = pgTable("game", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const puzzle = pgTable(
  "puzzle",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    gameId: text("game_id")
      .notNull()
      .references(() => game.id),
    puzzleDate: date("puzzle_date"),
    seed: text("seed").notNull(),
    difficulty: text("difficulty").notNull().default("normal"),
    payload: jsonb("payload").notNull(),
    answerKey: jsonb("answer_key").notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ uniq: unique().on(t.gameId, t.puzzleDate) }),
);

export const puzzleAttempt = pgTable(
  "puzzle_attempt",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    puzzleId: bigint("puzzle_id", { mode: "number" })
      .notNull()
      .references(() => puzzle.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => playerIdentity.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("started"),
    score: integer("score").notNull().default(0),
    guessesCount: integer("guesses_count").notNull().default(0),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => ({ uniq: unique().on(t.puzzleId, t.playerId) }),
);

export const puzzleGuess = pgTable("puzzle_guess", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  attemptId: bigint("attempt_id", { mode: "number" })
    .notNull()
    .references(() => puzzleAttempt.id, { onDelete: "cascade" }),
  animeId: bigint("anime_id", { mode: "number" }).references(() => anime.id),
  rawGuess: text("raw_guess").notNull(),
  normalizedGuess: text("normalized_guess").notNull(),
  result: jsonb("result").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

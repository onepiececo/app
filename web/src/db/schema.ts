import { bigint, bigserial, boolean, integer, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";

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

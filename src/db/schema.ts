import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  description: text().notNull().default(""),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const articles = pgTable(
  "articles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    sourceName: text().notNull(),
    url: text().notNull().unique(),
    titleOriginal: text().notNull(),
    titleKo: text().notNull(),
    summaryKo: text().notNull(),
    // Original article author; RSS items may not provide one.
    author: text(),
    // Deleting a category leaves its articles uncategorized ('기타').
    categoryId: integer().references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    notionPageUrl: text(),
  },
  (t) => [index("articles_category_id_idx").on(t.categoryId)],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

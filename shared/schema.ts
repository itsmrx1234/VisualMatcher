import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  rating: real("rating").default(0),
  brand: text("brand"),
  features: jsonb("features").$type<string[]>().default([]),
});

export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  uploadedAt: text("uploaded_at").notNull(),
});

export const searchResults = pgTable("search_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  searchId: varchar("search_id").notNull(),
  productId: varchar("product_id").notNull(),
  similarityScore: real("similarity_score").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertSearchSchema = createInsertSchema(searches).omit({
  id: true,
  uploadedAt: true,
});

export const insertSearchResultSchema = createInsertSchema(searchResults).omit({
  id: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Search = typeof searches.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type SearchResult = typeof searchResults.$inferSelect;
export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;

export interface ProductWithSimilarity extends Product {
  similarityScore: number;
}

export interface SearchFilters {
  minSimilarity?: number;
  maxSimilarity?: number;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
}

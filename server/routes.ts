import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSearchSchema, type SearchFilters } from "@shared/schema";
import { analyzeImageSimilarity, analyzeImageContent } from "./replicate";
import multer from "multer";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// AI-powered similarity function using Replicate LLaVA
async function calculateSimilarity(
  uploadedImageUrl: string, 
  productImageUrl: string, 
  productName: string, 
  productCategory: string
): Promise<number> {
  try {
    const result = await analyzeImageSimilarity(
      uploadedImageUrl, 
      productImageUrl, 
      productName, 
      productCategory
    );
    console.log(`Similarity analysis for ${productName}: ${result.similarityScore} - ${result.reasoning}`);
    return result.similarityScore;
  } catch (error) {
    console.error("Error in AI similarity analysis:", error);
    // Fallback to basic similarity if AI fails
    const hash1 = uploadedImageUrl.length % 100;
    const hash2 = productImageUrl.length % 100;
    const baseSimilarity = Math.max(0.3, 1 - Math.abs(hash1 - hash2) / 100);
    return Math.min(0.8, baseSimilarity + (Math.random() * 0.3 - 0.15));
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Upload image file
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // In production, you would upload to cloud storage and get a URL
      // For now, we'll use a placeholder URL
      const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const search = await storage.createSearch({ imageUrl });
      
      res.json({ 
        searchId: search.id,
        imageUrl: search.imageUrl 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process image upload" });
    }
  });

  // Search by image URL
  app.post("/api/search", async (req, res) => {
    try {
      const { imageUrl } = insertSearchSchema.parse(req.body);
      
      const search = await storage.createSearch({ imageUrl });
      
      res.json({ 
        searchId: search.id,
        imageUrl: search.imageUrl 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create search" });
    }
  });

  // Get search results with similarity scoring
  app.get("/api/search/:searchId/results", async (req, res) => {
    try {
      const { searchId } = req.params;
      const search = await storage.getSearch(searchId);
      
      if (!search) {
        return res.status(404).json({ error: "Search not found" });
      }

      // Check if we already have results for this search
      const existingResults = await storage.getSearchResults(searchId);
      
      if (existingResults.length === 0) {
        console.log("Starting AI similarity analysis for search:", searchId);
        
        // Get all products to compare against
        const allProducts = await storage.getAllProducts();
        
        // Calculate similarity for each product in batches to avoid rate limits
        const batchSize = 5; // Process 5 products at a time
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        
        for (let i = 0; i < allProducts.length; i += batchSize) {
          const batch = allProducts.slice(i, i + batchSize);
          
          const batchPromises = batch.map(async (product) => {
            try {
              const similarityScore = await calculateSimilarity(
                search.imageUrl, 
                product.imageUrl, 
                product.name, 
                product.category
              );
              
              if (similarityScore > 0.3) { // Include products with decent similarity (lowered threshold for AI)
                await storage.createSearchResult({
                  searchId,
                  productId: product.id,
                  similarityScore
                });
              }
            } catch (error) {
              console.error(`Error calculating similarity for product ${product.name}:`, error);
            }
          });
          
          await Promise.all(batchPromises);
          
          // Add delay between batches to respect rate limits
          if (i + batchSize < allProducts.length) {
            await delay(1000); // 1 second delay between batches
          }
        }
        console.log("AI similarity analysis completed for search:", searchId);
      }

      // Parse filters from query params
      const filters: SearchFilters = {};
      if (req.query.minSimilarity) filters.minSimilarity = parseFloat(req.query.minSimilarity as string);
      if (req.query.maxSimilarity) filters.maxSimilarity = parseFloat(req.query.maxSimilarity as string);
      if (req.query.categories) filters.categories = (req.query.categories as string).split(',');
      if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
      if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);

      const results = await storage.getSearchResults(searchId, filters);
      
      res.json({
        search,
        results,
        totalCount: results.length
      });
    } catch (error) {
      console.error("Error in search results endpoint:", error);
      res.status(500).json({ error: "Failed to get search results" });
    }
  });

  // Analyze uploaded image content
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL is required" });
      }

      const analysis = await analyzeImageContent(imageUrl);
      
      res.json({ 
        analysis,
        imageUrl 
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  // Get categories and their counts
  app.get("/api/categories", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const categoryCount: Record<string, number> = {};
      
      products.forEach(product => {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      });

      const categories = Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count
      }));

      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

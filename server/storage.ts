import { type Product, type InsertProduct, type Search, type InsertSearch, type SearchResult, type InsertSearchResult, type ProductWithSimilarity, type SearchFilters } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Searches
  createSearch(search: InsertSearch): Promise<Search>;
  getSearch(id: string): Promise<Search | undefined>;
  
  // Search Results
  createSearchResult(result: InsertSearchResult): Promise<SearchResult>;
  getSearchResults(searchId: string, filters?: SearchFilters): Promise<ProductWithSimilarity[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private searches: Map<string, Search>;
  private searchResults: Map<string, SearchResult>;

  constructor() {
    this.products = new Map();
    this.searches = new Map();
    this.searchResults = new Map();
    this.initializeProducts();
  }

  private initializeProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "iPhone 15 Pro Max",
        category: "Electronics > Smartphones",
        price: 1199,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Latest iPhone with titanium design and advanced camera system",
        rating: 4.8,
        brand: "Apple",
        features: ["A17 Pro chip", "48MP camera", "Titanium design"]
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        category: "Electronics > Smartphones",
        price: 1299,
        imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Premium Android phone with S Pen and AI features",
        rating: 4.7,
        brand: "Samsung",
        features: ["200MP camera", "S Pen included", "AI features"]
      },
      {
        name: "iPad Pro 12.9\"",
        category: "Electronics > Tablets",
        price: 1099,
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Professional tablet with M2 chip and Liquid Retina XDR display",
        rating: 4.9,
        brand: "Apple",
        features: ["M2 chip", "12.9-inch display", "Apple Pencil support"]
      },
      {
        name: "MacBook Pro 16\" M3",
        category: "Electronics > Laptops",
        price: 2499,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "High-performance laptop for professionals",
        rating: 4.8,
        brand: "Apple",
        features: ["M3 Pro chip", "16-inch display", "All-day battery"]
      },
      {
        name: "AirPods Pro (3rd Gen)",
        category: "Electronics > Audio",
        price: 249,
        imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Premium wireless earbuds with active noise cancellation",
        rating: 4.7,
        brand: "Apple",
        features: ["Active noise cancellation", "Spatial audio", "USB-C charging"]
      },
      {
        name: "Apple Watch Ultra 2",
        category: "Electronics > Wearables",
        price: 799,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Rugged smartwatch for extreme activities",
        rating: 4.6,
        brand: "Apple",
        features: ["Titanium case", "Action button", "36-hour battery"]
      },
      {
        name: "Sony WH-1000XM5",
        category: "Electronics > Audio",
        price: 399,
        imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Industry-leading noise canceling headphones",
        rating: 4.8,
        brand: "Sony",
        features: ["30-hour battery", "Premium noise canceling", "Touch controls"]
      },
      {
        name: "Nintendo Switch OLED",
        category: "Electronics > Gaming",
        price: 349,
        imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Portable gaming console with vibrant OLED screen",
        rating: 4.7,
        brand: "Nintendo",
        features: ["7-inch OLED screen", "Enhanced audio", "64GB storage"]
      },
      {
        name: "Tesla Model S Plaid",
        category: "Automotive > Electric Vehicles",
        price: 89990,
        imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "High-performance electric sedan",
        rating: 4.9,
        brand: "Tesla",
        features: ["1020 HP", "390 mile range", "Auto Pilot"]
      },
      {
        name: "Canon EOS R5",
        category: "Electronics > Cameras",
        price: 3899,
        imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Professional mirrorless camera with 8K video",
        rating: 4.9,
        brand: "Canon",
        features: ["45MP sensor", "8K video", "5-axis stabilization"]
      }
    ];

    // Add more products to reach 50+
    const additionalProducts: InsertProduct[] = [
      // Electronics - Smartphones
      { name: "Google Pixel 8 Pro", category: "Electronics > Smartphones", price: 999, imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9", rating: 4.6, brand: "Google", features: ["AI photography", "Magic Eraser"], description: "AI-powered Android phone" },
      { name: "OnePlus 12", category: "Electronics > Smartphones", price: 799, imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9", rating: 4.5, brand: "OnePlus", features: ["Fast charging", "Hasselblad cameras"], description: "Flagship Android phone" },
      
      // Electronics - Laptops
      { name: "Dell XPS 13", category: "Electronics > Laptops", price: 999, imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853", rating: 4.4, brand: "Dell", features: ["13-inch display", "Intel Core i7"], description: "Premium ultrabook" },
      { name: "ThinkPad X1 Carbon", category: "Electronics > Laptops", price: 1299, imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853", rating: 4.6, brand: "Lenovo", features: ["Carbon fiber", "14-inch display"], description: "Business laptop" },
      { name: "Surface Laptop 5", category: "Electronics > Laptops", price: 1199, imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853", rating: 4.3, brand: "Microsoft", features: ["Touchscreen", "Windows 11"], description: "Microsoft laptop" },
      
      // Electronics - Tablets
      { name: "Samsung Galaxy Tab S9", category: "Electronics > Tablets", price: 799, imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0", rating: 4.5, brand: "Samsung", features: ["S Pen included", "AMOLED display"], description: "Android tablet" },
      { name: "iPad Air", category: "Electronics > Tablets", price: 599, imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0", rating: 4.7, brand: "Apple", features: ["M1 chip", "10.9-inch display"], description: "Mid-range iPad" },
      
      // Electronics - Audio
      { name: "Bose QuietComfort 45", category: "Electronics > Audio", price: 329, imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944", rating: 4.4, brand: "Bose", features: ["Noise canceling", "22-hour battery"], description: "Wireless headphones" },
      { name: "Sennheiser HD 660S", category: "Electronics > Audio", price: 499, imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944", rating: 4.8, brand: "Sennheiser", features: ["Open-back", "Audiophile grade"], description: "Audiophile headphones" },
      { name: "JBL Charge 5", category: "Electronics > Audio", price: 149, imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1", rating: 4.3, brand: "JBL", features: ["Waterproof", "20-hour battery"], description: "Portable speaker" },
      
      // Electronics - Gaming
      { name: "PlayStation 5", category: "Electronics > Gaming", price: 499, imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3", rating: 4.8, brand: "Sony", features: ["4K gaming", "Ray tracing"], description: "Gaming console" },
      { name: "Xbox Series X", category: "Electronics > Gaming", price: 499, imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3", rating: 4.7, brand: "Microsoft", features: ["12 teraflops", "Quick resume"], description: "Gaming console" },
      { name: "Steam Deck", category: "Electronics > Gaming", price: 399, imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3", rating: 4.5, brand: "Valve", features: ["Handheld PC", "Steam library"], description: "Portable gaming PC" },
      
      // Electronics - Wearables
      { name: "Samsung Galaxy Watch 6", category: "Electronics > Wearables", price: 329, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", rating: 4.4, brand: "Samsung", features: ["Wear OS", "Health tracking"], description: "Android smartwatch" },
      { name: "Fitbit Sense 2", category: "Electronics > Wearables", price: 299, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", rating: 4.2, brand: "Fitbit", features: ["Health sensors", "6-day battery"], description: "Fitness smartwatch" },
      
      // Electronics - Cameras
      { name: "Sony A7 IV", category: "Electronics > Cameras", price: 2499, imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a", rating: 4.7, brand: "Sony", features: ["33MP sensor", "4K video"], description: "Mirrorless camera" },
      { name: "Nikon Z9", category: "Electronics > Cameras", price: 5499, imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a", rating: 4.8, brand: "Nikon", features: ["45MP sensor", "8K video"], description: "Professional camera" },
      { name: "Fujifilm X-T5", category: "Electronics > Cameras", price: 1699, imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a", rating: 4.6, brand: "Fujifilm", features: ["40MP APS-C", "Film simulations"], description: "APS-C mirrorless camera" },
      
      // Home & Kitchen
      { name: "Dyson V15 Detect", category: "Home & Kitchen > Appliances", price: 749, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64", rating: 4.5, brand: "Dyson", features: ["Laser dust detection", "60min runtime"], description: "Cordless vacuum" },
      { name: "KitchenAid Stand Mixer", category: "Home & Kitchen > Appliances", price: 379, imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136", rating: 4.7, brand: "KitchenAid", features: ["5-quart bowl", "10 speeds"], description: "Stand mixer" },
      { name: "Instant Pot Pro", category: "Home & Kitchen > Appliances", price: 129, imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136", rating: 4.6, brand: "Instant Pot", features: ["8-quart capacity", "10 functions"], description: "Multi-cooker" },
      { name: "Nespresso Vertuo Next", category: "Home & Kitchen > Appliances", price: 179, imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136", rating: 4.3, brand: "Nespresso", features: ["Centrifusion technology", "5 cup sizes"], description: "Coffee machine" },
      
      // Fashion & Accessories
      { name: "Ray-Ban Aviator Classic", category: "Fashion > Accessories", price: 154, imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083", rating: 4.4, brand: "Ray-Ban", features: ["UV protection", "Classic design"], description: "Sunglasses" },
      { name: "Hermès Apple Watch Band", category: "Fashion > Accessories", price: 339, imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083", rating: 4.8, brand: "Hermès", features: ["Leather craftsmanship", "Multiple colors"], description: "Luxury watch band" },
      { name: "Louis Vuitton Wallet", category: "Fashion > Accessories", price: 485, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62", rating: 4.6, brand: "Louis Vuitton", features: ["Damier canvas", "Multiple compartments"], description: "Designer wallet" },
      
      // Sports & Outdoors
      { name: "Peloton Bike+", category: "Sports & Outdoors > Fitness", price: 2495, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", rating: 4.4, brand: "Peloton", features: ["Rotating screen", "Auto resistance"], description: "Smart exercise bike" },
      { name: "NordicTrack Treadmill", category: "Sports & Outdoors > Fitness", price: 1299, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", rating: 4.2, brand: "NordicTrack", features: ["Incline training", "iFit compatible"], description: "Treadmill" },
      { name: "Hydro Flask Water Bottle", category: "Sports & Outdoors > Accessories", price: 44.95, imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504", rating: 4.7, brand: "Hydro Flask", features: ["Temperature retention", "Durable steel"], description: "Insulated water bottle" },
      
      // Beauty & Personal Care
      { name: "Dyson Supersonic Hair Dryer", category: "Beauty & Personal Care > Hair Care", price: 429, imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da", rating: 4.3, brand: "Dyson", features: ["Fast drying", "Heat protection"], description: "Professional hair dryer" },
      { name: "Foreo Luna 3", category: "Beauty & Personal Care > Skincare", price: 199, imageUrl: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da", rating: 4.1, brand: "Foreo", features: ["Sonic cleansing", "Anti-aging"], description: "Facial cleansing device" },
      
      // Books & Media
      { name: "Kindle Oasis", category: "Books & Media > E-readers", price: 249, imageUrl: "https://images.unsplash.com/photo-1481277542470-605612bd2d61", rating: 4.2, brand: "Amazon", features: ["7-inch display", "Waterproof"], description: "Premium e-reader" },
      { name: "iPad Mini", category: "Electronics > Tablets", price: 499, imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0", rating: 4.5, brand: "Apple", features: ["8.3-inch display", "A15 Bionic"], description: "Compact tablet" },
      
      // Automotive
      { name: "BMW iX", category: "Automotive > Electric Vehicles", price: 83200, imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89", rating: 4.4, brand: "BMW", features: ["324 mile range", "Luxury interior"], description: "Electric luxury SUV" },
      { name: "Ford Mustang Mach-E", category: "Automotive > Electric Vehicles", price: 42895, imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89", rating: 4.2, brand: "Ford", features: ["300 mile range", "Performance"], description: "Electric SUV" },
      
      // Tools & Hardware
      { name: "DeWalt 20V Max Drill", category: "Tools & Hardware > Power Tools", price: 99, imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c", rating: 4.6, brand: "DeWalt", features: ["Brushless motor", "LED light"], description: "Cordless drill" },
      { name: "Milwaukee Impact Driver", category: "Tools & Hardware > Power Tools", price: 149, imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c", rating: 4.7, brand: "Milwaukee", features: ["1500 in-lbs torque", "Compact design"], description: "Impact driver" },
      
      // Garden & Outdoor
      { name: "Weber Genesis II Grill", category: "Garden & Outdoor > Grills", price: 699, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363", rating: 4.5, brand: "Weber", features: ["3 burners", "Porcelain grates"], description: "Gas grill" },
      { name: "Ego Power+ Mower", category: "Garden & Outdoor > Lawn Care", price: 449, imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363", rating: 4.3, brand: "Ego", features: ["56V battery", "Self-propelled"], description: "Electric lawn mower" },
      
      // Baby & Kids
      { name: "UPPAbaby Vista Stroller", category: "Baby & Kids > Strollers", price: 929, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5", rating: 4.8, brand: "UPPAbaby", features: ["All-terrain", "Expandable"], description: "Premium stroller" },
      { name: "Chicco KeyFit Car Seat", category: "Baby & Kids > Car Seats", price: 199, imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5", rating: 4.7, brand: "Chicco", features: ["Infant seat", "Easy installation"], description: "Infant car seat" },
      
      // Pet Supplies
      { name: "Furbo Dog Camera", category: "Pet Supplies > Cameras", price: 249, imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1", rating: 4.1, brand: "Furbo", features: ["Two-way audio", "Treat dispenser"], description: "Pet monitoring camera" },
      { name: "Whistle GPS Pet Tracker", category: "Pet Supplies > Accessories", price: 149, imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1", rating: 4.3, brand: "Whistle", features: ["GPS tracking", "Health monitoring"], description: "Pet GPS tracker" },
      
      // Office Supplies
      { name: "Herman Miller Aeron Chair", category: "Office Supplies > Furniture", price: 1395, imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7", rating: 4.7, brand: "Herman Miller", features: ["Ergonomic design", "Breathable mesh"], description: "Ergonomic office chair" },
      { name: "Standing Desk Converter", category: "Office Supplies > Furniture", price: 299, imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7", rating: 4.4, brand: "VIVO", features: ["Height adjustable", "Dual monitor support"], description: "Standing desk" }
    ];

    // Add all products
    [...sampleProducts, ...additionalProducts].forEach(productData => {
      const id = randomUUID();
      const product: Product = { ...productData, id };
      this.products.set(id, product);
    });
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const id = randomUUID();
    const search: Search = { 
      ...insertSearch, 
      id, 
      uploadedAt: new Date().toISOString() 
    };
    this.searches.set(id, search);
    return search;
  }

  async getSearch(id: string): Promise<Search | undefined> {
    return this.searches.get(id);
  }

  async createSearchResult(insertResult: InsertSearchResult): Promise<SearchResult> {
    const id = randomUUID();
    const result: SearchResult = { ...insertResult, id };
    this.searchResults.set(id, result);
    return result;
  }

  async getSearchResults(searchId: string, filters?: SearchFilters): Promise<ProductWithSimilarity[]> {
    const results = Array.from(this.searchResults.values())
      .filter(result => result.searchId === searchId);
    
    let productsWithSimilarity: ProductWithSimilarity[] = [];
    
    for (const result of results) {
      const product = this.products.get(result.productId);
      if (product) {
        productsWithSimilarity.push({
          ...product,
          similarityScore: result.similarityScore
        });
      }
    }

    // Apply filters
    if (filters) {
      productsWithSimilarity = productsWithSimilarity.filter(product => {
        if (filters.minSimilarity && product.similarityScore < filters.minSimilarity) return false;
        if (filters.maxSimilarity && product.similarityScore > filters.maxSimilarity) return false;
        if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
        if (filters.minPrice && product.price < filters.minPrice) return false;
        if (filters.maxPrice && product.price > filters.maxPrice) return false;
        return true;
      });
    }

    // Sort by similarity score descending
    productsWithSimilarity.sort((a, b) => b.similarityScore - a.similarityScore);

    return productsWithSimilarity;
  }
}

export const storage = new MemStorage();

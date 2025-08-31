import { apiRequest } from "./queryClient";
import type { InsertSearch, SearchFilters } from "@shared/schema";

export interface SearchResponse {
  searchId: string;
  imageUrl: string;
}

export interface SearchResultsResponse {
  search: any;
  results: any[];
  totalCount: number;
}

export const api = {
  // Upload image file
  uploadImage: async (file: File): Promise<SearchResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return response.json();
  },

  // Search by image URL
  searchByUrl: async (data: InsertSearch): Promise<SearchResponse> => {
    const response = await apiRequest('POST', '/api/search', data);
    return response.json();
  },

  // Get search results
  getSearchResults: async (searchId: string, filters?: SearchFilters): Promise<SearchResultsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.minSimilarity) queryParams.append('minSimilarity', filters.minSimilarity.toString());
    if (filters?.maxSimilarity) queryParams.append('maxSimilarity', filters.maxSimilarity.toString());
    if (filters?.categories) queryParams.append('categories', filters.categories.join(','));
    if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());

    const url = queryParams.toString() 
      ? `/api/search/${searchId}/results?${queryParams.toString()}`
      : `/api/search/${searchId}/results`;

    const response = await apiRequest('GET', url);
    return response.json();
  },

  // Get categories
  getCategories: async () => {
    const response = await apiRequest('GET', '/api/categories');
    return response.json();
  },

  // Get all products
  getProducts: async () => {
    const response = await apiRequest('GET', '/api/products');
    return response.json();
  },
};

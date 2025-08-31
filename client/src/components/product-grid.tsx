import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchFilters, ProductWithSimilarity } from "@shared/schema";

interface ProductGridProps {
  searchId: string;
  filters: SearchFilters;
}

export function ProductGrid({ searchId, filters }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('similarity');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const queryKey = ['/api/search', searchId, 'results'];
  const queryParams = new URLSearchParams();
  
  if (filters.minSimilarity) queryParams.append('minSimilarity', filters.minSimilarity.toString());
  if (filters.maxSimilarity) queryParams.append('maxSimilarity', filters.maxSimilarity.toString());
  if (filters.categories) queryParams.append('categories', filters.categories.join(','));
  if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());

  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, filters],
    queryFn: async () => {
      const url = queryParams.toString() 
        ? `/api/search/${searchId}/results?${queryParams.toString()}`
        : `/api/search/${searchId}/results`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="lg:col-span-4">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-16" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4">
                <Skeleton className="w-full h-48 mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-5 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:col-span-4">
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load search results. Please try again.</p>
        </div>
      </div>
    );
  }

  const results = data?.results || [];
  
  // Sort results
  let sortedResults = [...results];
  switch (sortBy) {
    case 'similarity':
      sortedResults.sort((a: ProductWithSimilarity, b: ProductWithSimilarity) => b.similarityScore - a.similarityScore);
      break;
    case 'price-low':
      sortedResults.sort((a: ProductWithSimilarity, b: ProductWithSimilarity) => a.price - b.price);
      break;
    case 'price-high':
      sortedResults.sort((a: ProductWithSimilarity, b: ProductWithSimilarity) => b.price - a.price);
      break;
    case 'rating':
      sortedResults.sort((a: ProductWithSimilarity, b: ProductWithSimilarity) => (b.rating || 0) - (a.rating || 0));
      break;
  }

  // Pagination
  const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="lg:col-span-4">
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Similar Products</h3>
          <p className="text-muted-foreground text-sm mt-1">
            <span data-testid="results-count" className="text-accent font-semibold">{sortedResults.length}</span> products found
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-muted/50 border-border text-foreground" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="similarity">Sort by Similarity</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-r-none transition-all duration-300 ${viewMode === 'grid' ? 'gradient-primary glow-primary text-white' : 'hover:bg-muted text-foreground'}`}
              data-testid="button-grid-view"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-l-none transition-all duration-300 ${viewMode === 'list' ? 'gradient-secondary glow-secondary text-white' : 'hover:bg-muted text-foreground'}`}
              data-testid="button-list-view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {paginatedResults.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto rounded-full gradient-primary opacity-20 flex items-center justify-center">
              <Grid className="w-8 h-8 text-primary" />
            </div>
          </div>
          <p className="text-muted-foreground">No products match your filters. Try adjusting your criteria.</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8"
            : "space-y-6 mb-8"
        }>
          {paginatedResults.map((product: ProductWithSimilarity) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            data-testid="button-previous-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNumber)}
                data-testid={`button-page-${pageNumber}`}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            data-testid="button-next-page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

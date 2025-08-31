import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SearchFilters } from "@shared/schema";

interface FiltersSidebarProps {
  searchId: string;
  uploadedImageUrl: string | null;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

interface Category {
  name: string;
  count: number;
}

export function FiltersSidebar({ searchId, uploadedImageUrl, filters, onFiltersChange }: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!searchId,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['/api/search', searchId, 'results'],
    enabled: !!searchId,
  });

  // Count products by similarity ranges
  const similarityCounts = searchResults?.results ? {
    high: searchResults.results.filter((p: any) => p.similarityScore >= 0.9).length,
    medium: searchResults.results.filter((p: any) => p.similarityScore >= 0.7 && p.similarityScore < 0.9).length,
    low: searchResults.results.filter((p: any) => p.similarityScore >= 0.5 && p.similarityScore < 0.7).length,
  } : { high: 0, medium: 0, low: 0 };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const currentCategories = localFilters.categories || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    handleFilterChange('categories', newCategories.length > 0 ? newCategories : undefined);
  };

  const clearAllFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const handleSimilarityToggle = (range: string, checked: boolean) => {
    let newFilters = { ...localFilters };

    if (range === 'high' && checked) {
      newFilters.minSimilarity = 0.9;
    } else if (range === 'medium' && checked) {
      if (!newFilters.minSimilarity || newFilters.minSimilarity > 0.7) {
        newFilters.minSimilarity = 0.7;
      }
      if (!newFilters.maxSimilarity || newFilters.maxSimilarity < 0.89) {
        newFilters.maxSimilarity = 0.89;
      }
    } else if (range === 'low' && checked) {
      if (!newFilters.minSimilarity || newFilters.minSimilarity > 0.5) {
        newFilters.minSimilarity = 0.5;
      }
      if (!newFilters.maxSimilarity || newFilters.maxSimilarity < 0.69) {
        newFilters.maxSimilarity = 0.69;
      }
    }

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <aside>
      <Card className="glass-effect border-border/50 sticky top-8 hover-lift">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">Filters</h3>
          
          {/* Uploaded Image Preview */}
          {uploadedImageUrl && (
            <div className="mb-6 animate-fade-in">
              <h4 className="text-sm font-medium text-foreground mb-3">Your Image</h4>
              <div className="relative group">
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded product image"
                  className="w-full h-32 object-cover rounded-xl border border-border group-hover:scale-105 transition-transform duration-300"
                  data-testid="uploaded-image-preview"
                />
                <div className="absolute inset-0 rounded-xl gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
            </div>
          )}

          {/* Similarity Score Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Similarity Score</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="similarity-high"
                  checked={localFilters.minSimilarity === 0.9}
                  onCheckedChange={(checked) => handleSimilarityToggle('high', checked as boolean)}
                  data-testid="filter-similarity-high"
                />
                <Label htmlFor="similarity-high" className="flex-1 text-sm text-muted-foreground">
                  High (90%+)
                </Label>
                <span className="text-xs text-muted-foreground" data-testid="count-similarity-high">
                  {similarityCounts.high}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="similarity-medium"
                  checked={localFilters.minSimilarity === 0.7 && localFilters.maxSimilarity === 0.89}
                  onCheckedChange={(checked) => handleSimilarityToggle('medium', checked as boolean)}
                  data-testid="filter-similarity-medium"
                />
                <Label htmlFor="similarity-medium" className="flex-1 text-sm text-muted-foreground">
                  Medium (70-89%)
                </Label>
                <span className="text-xs text-muted-foreground" data-testid="count-similarity-medium">
                  {similarityCounts.medium}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="similarity-low"
                  checked={localFilters.minSimilarity === 0.5 && localFilters.maxSimilarity === 0.69}
                  onCheckedChange={(checked) => handleSimilarityToggle('low', checked as boolean)}
                  data-testid="filter-similarity-low"
                />
                <Label htmlFor="similarity-low" className="flex-1 text-sm text-muted-foreground">
                  Low (50-69%)
                </Label>
                <span className="text-xs text-muted-foreground" data-testid="count-similarity-low">
                  {similarityCounts.low}
                </span>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Categories</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.name}`}
                    checked={localFilters.categories?.includes(category.name) || false}
                    onCheckedChange={(checked) => handleCategoryToggle(category.name, checked as boolean)}
                    data-testid={`filter-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                  <Label htmlFor={`category-${category.name}`} className="flex-1 text-sm text-muted-foreground truncate">
                    {category.name.split(' > ').pop()}
                  </Label>
                  <span className="text-xs text-muted-foreground">{category.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">Price Range</h4>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-20 text-sm bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                data-testid="input-min-price"
              />
              <span className="text-muted-foreground self-center">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-20 text-sm bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                data-testid="input-max-price"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="w-full text-sm gradient-accent hover:glow-accent transition-all duration-300 hover:scale-105 border-border text-white font-semibold"
            data-testid="button-clear-filters"
          >
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}

import { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProductWithSimilarity } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithSimilarity;
  viewMode: 'grid' | 'list';
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return "gradient-accent glow-accent";
    if (score >= 0.7) return "gradient-secondary glow-secondary";
    return "gradient-primary glow-primary";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (viewMode === 'list') {
    return (
      <Card className="glass-effect border-border/50 hover-lift cursor-pointer group animate-fade-in">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-xl group-hover:scale-110 transition-all duration-500"
                data-testid={`product-image-${product.id}`}
              />
              <Badge
                className={`absolute -top-2 -left-2 text-white font-bold ${getSimilarityColor(product.similarityScore)}`}
                data-testid={`similarity-score-${product.id}`}
              >
                {Math.round(product.similarityScore * 100)}%
              </Badge>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-1 truncate" data-testid={`product-name-${product.id}`}>
                {product.name}
              </h4>
              <p className="text-sm text-muted-foreground mb-2" data-testid={`product-category-${product.id}`}>
                {product.category}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground" data-testid={`product-price-${product.id}`}>
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center gap-2">
                  {product.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground ml-1" data-testid={`product-rating-${product.id}`}>
                        {product.rating}
                      </span>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWishlistToggle}
                    data-testid={`button-wishlist-${product.id}`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-border/50 hover-lift cursor-pointer group animate-fade-in" data-testid={`product-card-${product.id}`}>
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-all duration-500"
          data-testid={`product-image-${product.id}`}
        />
        <Badge
          className={`absolute top-3 left-3 text-white font-bold ${getSimilarityColor(product.similarityScore)}`}
          data-testid={`similarity-score-${product.id}`}
        >
          {Math.round(product.similarityScore * 100)}%
        </Badge>
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 w-8 h-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleWishlistToggle}
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium text-foreground mb-1 line-clamp-2" data-testid={`product-name-${product.id}`}>
          {product.name}
        </h4>
        <p className="text-sm text-muted-foreground mb-2" data-testid={`product-category-${product.id}`}>
          {product.category}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-foreground" data-testid={`product-price-${product.id}`}>
            {formatPrice(product.price)}
          </span>
          {product.rating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground ml-1" data-testid={`product-rating-${product.id}`}>
                {product.rating}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Search } from "lucide-react";
import { UploadSection } from "@/components/upload-section";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { ProductGrid } from "@/components/product-grid";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useToast } from "@/hooks/use-toast";
import type { SearchFilters } from "@shared/schema";

export default function Home() {
  const [searchId, setSearchId] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const { toast } = useToast();

  const handleSearchStart = () => {
    setIsLoading(true);
  };

  const handleSearchComplete = (searchId: string, imageUrl: string) => {
    setSearchId(searchId);
    setUploadedImageUrl(imageUrl);
    setIsLoading(false);
  };

  const handleSearchError = (error: string) => {
    setIsLoading(false);
    toast({
      title: "Search Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      </div>

      {/* Header */}
      <header className="glass-effect border-b border-border/50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="mr-3 p-2 rounded-xl gradient-primary glow-primary">
                <Search className="text-primary-foreground text-xl" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Visual Product Matcher
              </h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:glow-primary">
                How it works
              </a>
              <a href="#" className="text-muted-foreground hover:text-secondary transition-all duration-300 hover:glow-secondary">
                Examples
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:glow-accent">
                API
              </a>
            </nav>
            <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" data-testid="mobile-menu-toggle">
              <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="animate-slide-up">
          <UploadSection
            onSearchStart={handleSearchStart}
            onSearchComplete={handleSearchComplete}
            onSearchError={handleSearchError}
          />
        </div>

        {/* Search Results */}
        {searchId && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8 animate-fade-in">
            <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <FiltersSidebar
                searchId={searchId}
                uploadedImageUrl={uploadedImageUrl}
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
            <div className="lg:col-span-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <ProductGrid searchId={searchId} filters={filters} />
            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} />
    </div>
  );
}

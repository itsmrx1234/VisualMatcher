import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadSectionProps {
  onSearchStart: () => void;
  onSearchComplete: (searchId: string, imageUrl: string) => void;
  onSearchError: (error: string) => void;
}

export function UploadSection({ onSearchStart, onSearchComplete, onSearchError }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onSearchError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      onSearchError('File size must be less than 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      onSearchStart();
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onSearchComplete(data.searchId, data.imageUrl);
      
      toast({
        title: "Upload successful",
        description: "Finding similar products...",
      });
    } catch (error) {
      onSearchError('Failed to upload image. Please try again.');
    }
  };

  const handleUrlSearch = async () => {
    if (!imageUrl.trim()) {
      onSearchError('Please enter an image URL');
      return;
    }

    try {
      onSearchStart();
      const response = await apiRequest('POST', '/api/search', { imageUrl });
      const data = await response.json();
      
      onSearchComplete(data.searchId, data.imageUrl);
      
      toast({
        title: "Search started",
        description: "Finding similar products...",
      });
    } catch (error) {
      onSearchError('Failed to process image URL. Please check the URL and try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <section className="mb-8">
      <Card className="glass-effect border-border/50 hover-lift">
        <CardContent className="p-6 lg:p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
              Find Similar Products
            </h2>
            <p className="text-muted-foreground text-lg">Upload an image or paste a URL to find visually similar products in our database</p>
          </div>
          
          {/* Upload Methods Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('file')}
              className={`px-6 py-3 border-b-2 font-medium transition-all duration-300 relative group ${
                activeTab === 'file'
                  ? 'border-primary text-primary glow-primary'
                  : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/50'
              }`}
              data-testid="tab-file-upload"
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Upload File
              {activeTab === 'file' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 gradient-primary animate-scale-in"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-6 py-3 border-b-2 font-medium transition-all duration-300 relative group ml-6 ${
                activeTab === 'url'
                  ? 'border-secondary text-secondary glow-secondary'
                  : 'border-transparent text-muted-foreground hover:text-secondary hover:border-secondary/50'
              }`}
              data-testid="tab-url-input"
            >
              <LinkIcon className="w-4 h-4 mr-2 inline" />
              Image URL
              {activeTab === 'url' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 gradient-secondary animate-scale-in"></div>
              )}
            </button>
          </div>

          {/* File Upload Area */}
          {activeTab === 'file' && (
            <div className="animate-fade-in">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-primary bg-primary/10 glow-primary scale-105'
                    : 'border-border hover:border-primary hover:bg-primary/5 hover:scale-102'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                data-testid="file-upload-area"
              >
                <div className="animate-pulse-glow">
                  <CloudUpload className="w-16 h-16 text-primary mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Drop your image here</h3>
                <p className="text-muted-foreground mb-6">or click to browse files</p>
                <Button 
                  variant="default" 
                  className="gradient-primary hover:glow-primary transition-all duration-300 hover:scale-105 text-white font-semibold"
                  data-testid="button-choose-file"
                >
                  Choose File
                </Button>
                <p className="text-sm text-muted-foreground mt-4">Supports: JPG, PNG, WebP (max 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file"
                />
              </div>
            </div>
          )}

          {/* URL Input */}
          {activeTab === 'url' && (
            <div className="animate-fade-in">
              <div className="flex gap-4">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 bg-muted/50 border-border focus:border-secondary focus:glow-secondary transition-all duration-300 text-foreground placeholder:text-muted-foreground"
                  data-testid="input-image-url"
                />
                <Button 
                  onClick={handleUrlSearch} 
                  className="gradient-secondary hover:glow-secondary transition-all duration-300 hover:scale-105 text-white font-semibold"
                  data-testid="button-search-url"
                >
                  Search
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

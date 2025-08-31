import { Progress } from "@/components/ui/progress";

interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" data-testid="loading-overlay">
      <div className="glass-effect rounded-2xl p-8 max-w-sm mx-4 border border-border/50 animate-scale-in">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6 glow-primary"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-secondary mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">Processing Image</h3>
          <p className="text-muted-foreground text-sm mb-6">Finding similar products with AI...</p>
          <div className="relative">
            <Progress value={65} className="w-full shimmer" data-testid="loading-progress" />
            <div className="absolute inset-0 gradient-primary opacity-20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useGetOfferwallToken, getGetOfferwallTokenQueryKey } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Earn() {
  const { data, isLoading, error } = useGetOfferwallToken({ 
    query: { 
      queryKey: getGetOfferwallTokenQueryKey(),
      refetchOnWindowFocus: false 
    } 
  });

  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // Reset loaded state if url changes
    if (data?.embedUrl) {
      setIframeLoaded(false);
    }
  }, [data?.embedUrl]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-full mb-4">
          <Loader2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display mb-2">Could not load offerwall</h2>
        <p className="text-muted-foreground">Please try refreshing the page or try again later.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] w-full flex flex-col animate-in fade-in duration-500">
      <div className="mb-4">
        <h1 className="text-3xl font-display font-bold tracking-tight">Offerwall</h1>
        <p className="text-muted-foreground">Complete tasks below to earn points automatically added to your balance.</p>
      </div>
      
      <div className="flex-1 bg-card border rounded-2xl overflow-hidden shadow-sm relative relative">
        {(isLoading || (!iframeLoaded && data?.embedUrl)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="font-medium text-muted-foreground animate-pulse">Loading offers...</p>
          </div>
        )}
        
        {data?.embedUrl && (
          <iframe 
            src={data.embedUrl} 
            className="w-full h-full border-0"
            title="RewardsRiver Offerwall"
            onLoad={() => setIframeLoaded(true)}
            data-testid="iframe-offerwall"
            allow="camera *; microphone *"
          />
        )}
      </div>
    </div>
  );
}

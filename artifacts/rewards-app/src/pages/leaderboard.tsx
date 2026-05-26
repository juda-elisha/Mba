import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Trophy, Medal, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });

  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-slate-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-700" />;
      default: return <span className="font-display font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRowStyle = (rank: number) => {
    switch(rank) {
      case 1: return "bg-yellow-500/10 border-yellow-500/20";
      case 2: return "bg-slate-500/5 border-slate-500/20";
      case 3: return "bg-amber-700/5 border-amber-700/20";
      default: return "bg-card border-border";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-10">
        <div className="bg-yellow-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner border border-yellow-500/20">
          <Trophy className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Top Earners</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The most active earners on RewardsRiver Cash. Complete offers to climb the ranks and earn respect.
        </p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1,2,3,4,5].map(i => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : leaderboard?.length === 0 ? (
          <div className="text-center p-12 bg-card rounded-2xl border border-dashed">
            <p className="font-medium text-muted-foreground">No earners yet. Be the first!</p>
          </div>
        ) : (
          leaderboard?.map((entry) => (
            <Card key={entry.rank} className={`shadow-sm overflow-hidden transition-all hover:scale-[1.01] ${getRowStyle(entry.rank)}`}>
              <CardContent className="p-4 sm:p-5 flex items-center gap-4 sm:gap-6">
                <div className="w-12 flex justify-center shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-lg border border-primary/20 shrink-0">
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate" data-testid={`text-lb-username-${entry.rank}`}>{entry.username}</p>
                  <p className="text-sm text-muted-foreground">{entry.offersCompleted} offers completed</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display font-bold text-xl sm:text-2xl text-accent" data-testid={`text-lb-earned-${entry.rank}`}>
                    {entry.totalEarned.toLocaleString()}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Points</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

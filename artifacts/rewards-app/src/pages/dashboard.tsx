import { useGetBalance, useGetUserStats, useGetTransactions, getGetBalanceQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Trophy, ArrowUpRight, ArrowDownRight, Wallet, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: balance, isLoading: balanceLoading } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { data: stats, isLoading: statsLoading } = useGetUserStats();
  const { data: transactions, isLoading: txLoading } = useGetTransactions();

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's how you're doing.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/earn">
            <Button className="shadow-md shadow-primary/20" data-testid="button-earn-more">
              <Coins className="w-4 h-4 mr-2" /> Earn More
            </Button>
          </Link>
          <Link href="/withdraw">
            <Button variant="outline" className="bg-background" data-testid="button-withdraw-dash">
              <Wallet className="w-4 h-4 mr-2" /> Withdraw
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <Card className="md:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Coins className="w-48 h-48 -rotate-12 transform translate-x-8 -translate-y-8" />
          </div>
          <CardHeader>
            <CardTitle className="text-primary-foreground/80 font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="h-16 flex items-center">
                <div className="h-10 w-32 bg-primary-foreground/20 rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-display font-bold tracking-tight" data-testid="text-balance-points">
                  {balance?.points.toLocaleString() || 0}
                </span>
                <span className="text-xl font-medium text-primary-foreground/80">Points</span>
              </div>
            )}
            <p className="text-primary-foreground/80 font-medium" data-testid="text-balance-mwk">
              ≈ {balance?.pointsValueMwk.toLocaleString() || 0} MWK
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-accent/10 p-3 rounded-xl text-accent">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                {statsLoading ? (
                  <div className="h-6 w-20 bg-muted rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display" data-testid="text-total-earned">{stats?.totalEarned.toLocaleString() || 0}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-xl text-yellow-600 dark:text-yellow-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leaderboard Rank</p>
                {statsLoading ? (
                  <div className="h-6 w-20 bg-muted rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold font-display" data-testid="text-rank">#{stats?.rank || "--"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-lg font-display">Recent Activity</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="link-view-all-tx">View All</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {txLoading ? (
            <div className="p-6 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-muted rounded animate-pulse" />
                      <div className="w-20 h-3 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-16 h-5 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="font-medium">No activity yet</p>
              <p className="text-sm mb-4">Complete an offer to see your transactions here.</p>
              <Link href="/earn">
                <Button size="sm" variant="outline" data-testid="button-empty-earn">Go to Offerwall</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'earn' ? 'bg-accent/10 text-accent' : 'bg-orange-500/10 text-orange-500'}`}>
                      {tx.type === 'earn' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, yyyy • h:mm a")}</p>
                    </div>
                  </div>
                  <div className={`font-semibold font-display text-lg ${tx.type === 'earn' ? 'text-accent' : ''}`} data-testid={`text-tx-points-${tx.id}`}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.points.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

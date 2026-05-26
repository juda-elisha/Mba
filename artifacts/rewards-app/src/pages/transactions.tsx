import { useGetTransactions, getGetTransactionsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Transactions() {
  const { data: transactions, isLoading } = useGetTransactions({ query: { queryKey: getGetTransactionsQueryKey() } });

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    switch (status) {
      case 'completed': return <Badge className="bg-accent/10 text-accent border-0">Completed</Badge>;
      case 'failed': return <Badge variant="destructive" className="border-0">Failed</Badge>;
      default: return <Badge className="bg-orange-500/10 text-orange-500 border-0 capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">A complete record of your earnings and withdrawals.</p>
      </div>

      <Card className="shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="w-[200px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    <TableCell><div className="w-24 h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-48 h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="w-16 h-6 bg-muted rounded-full animate-pulse" /></TableCell>
                    <TableCell><div className="w-20 h-6 bg-muted rounded-full animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="w-16 h-4 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <Receipt className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions?.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {format(new Date(tx.createdAt), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{tx.description}</span>
                      {tx.offerName && <p className="text-xs text-muted-foreground mt-0.5">{tx.offerName}</p>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {tx.type === 'earn' ? (
                          <><ArrowDownRight className="w-4 h-4 text-accent" /><span className="text-sm font-medium">Earn</span></>
                        ) : (
                          <><ArrowUpRight className="w-4 h-4 text-orange-500" /><span className="text-sm font-medium">Withdraw</span></>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(tx.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-display font-bold text-lg whitespace-nowrap ${tx.type === 'earn' ? 'text-accent' : ''}`} data-testid={`text-tx-points-${tx.id}`}>
                        {tx.type === 'earn' ? '+' : '-'}{tx.points.toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

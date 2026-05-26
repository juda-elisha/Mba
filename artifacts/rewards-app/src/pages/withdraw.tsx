import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetBalance, useGetWithdrawals, useRequestWithdrawal, getGetBalanceQueryKey, getGetWithdrawalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, AlertCircle, CheckCircle2, Clock, Wallet } from "lucide-react";

const MIN_POINTS = 5000;

const withdrawSchema = z.object({
  points: z.coerce.number().min(MIN_POINTS, `Minimum withdrawal is ${MIN_POINTS} points`),
  provider: z.enum(["airtel", "tnm"], { required_error: "Please select a provider" }),
  phoneNumber: z.string().regex(/^\+265\d{9}$/, "Must be a valid Malawi mobile number starting with +265"),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function Withdraw() {
  const { data: balance, isLoading: balanceLoading } = useGetBalance({ query: { queryKey: getGetBalanceQueryKey() } });
  const { data: withdrawals, isLoading: withdrawalsLoading } = useGetWithdrawals({ query: { queryKey: getGetWithdrawalsQueryKey() } });
  const requestWithdrawal = useRequestWithdrawal();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      points: MIN_POINTS,
      provider: "airtel",
      phoneNumber: "+265",
    },
  });

  const watchPoints = form.watch("points");
  const mwkValue = Math.floor((watchPoints || 0) / 100);

  const onSubmit = (data: WithdrawFormValues) => {
    if (balance && data.points > balance.points) {
      form.setError("points", { type: "manual", message: "You don't have enough points" });
      return;
    }

    requestWithdrawal.mutate({ data }, {
      onSuccess: () => {
        toast({
          title: "Withdrawal Requested",
          description: "Your withdrawal has been queued for processing.",
        });
        form.reset({ points: MIN_POINTS, provider: data.provider, phoneNumber: data.phoneNumber });
        queryClient.invalidateQueries({ queryKey: getGetBalanceQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWithdrawalsQueryKey() });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Request Failed",
          description: error?.error || "Could not process withdrawal. Please try again.",
        });
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-accent" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-accent/20 text-accent hover:bg-accent/30 border-0">Completed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'processing': return <Badge className="bg-blue-500/20 text-blue-600 border-0">Processing</Badge>;
      default: return <Badge className="bg-orange-500/20 text-orange-600 border-0">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Withdraw Funds</h1>
        <p className="text-muted-foreground">Convert your points to mobile money instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Request Form */}
        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader className="bg-secondary/30 border-b">
            <CardTitle>Request Payout</CardTitle>
            <CardDescription>
              Available Balance: <strong className="text-foreground" data-testid="text-withdraw-balance">{balance?.points.toLocaleString() || 0} pts</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points to Withdraw</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" {...field} data-testid="input-points" className="text-lg font-bold pl-4 pr-24 h-14" />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">
                            ≈ {mwkValue} MWK
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>Minimum {MIN_POINTS.toLocaleString()} points ({MIN_POINTS/100} MWK)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Money Network</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12" data-testid="select-provider">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="airtel" data-testid="select-item-airtel">Airtel Money</SelectItem>
                          <SelectItem value="tnm" data-testid="select-item-tnm">TNM Mpamba</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+2650999123456" {...field} className="h-12 text-lg font-mono" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-bold"
                  disabled={requestWithdrawal.isPending || balanceLoading || !balance || balance.points < MIN_POINTS}
                  data-testid="button-submit-withdraw"
                >
                  {requestWithdrawal.isPending ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : "Confirm Withdrawal"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* History */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-xl px-1">Withdrawal History</h3>
          {withdrawalsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : withdrawals?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Wallet className="w-12 h-12 mb-4 text-muted-foreground/30" />
                <p className="font-medium">No withdrawals yet.</p>
                <p className="text-sm">Reach {MIN_POINTS.toLocaleString()} points to make your first withdrawal.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {withdrawals?.map(w => (
                <Card key={w.id} className="shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg font-display" data-testid={`text-wd-amount-${w.id}`}>{w.amountMwk} MWK</span>
                        {getStatusBadge(w.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {w.provider === 'airtel' ? 'Airtel Money' : 'TNM Mpamba'} • {w.phoneNumber}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(w.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-muted-foreground">{w.points.toLocaleString()} pts</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

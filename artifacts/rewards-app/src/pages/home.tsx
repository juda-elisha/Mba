import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coins, Smartphone, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero */}
      <section className="pt-20 pb-10 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">The New Way to Earn in Malawi</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
          Turn your free time into <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Real Cash</span>.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          Play games, test apps, and complete surveys to earn points. Cash out instantly to Airtel Money or TNM Mpamba.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto shadow-lg shadow-primary/25 hover:scale-105 transition-transform" data-testid="button-hero-register">
              Start Earning Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto bg-background" data-testid="button-hero-login">
              I already have an account
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card rounded-3xl p-8 md:p-16 border shadow-sm mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">How it works</h2>
          <p className="text-muted-foreground">Three simple steps to your first payout.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-0.5 bg-border -translate-y-1/2 z-0" />
          
          <div className="relative z-10 flex flex-col items-center text-center bg-card p-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm border border-primary/20">
              <span className="font-display font-bold text-2xl">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Sign Up</h3>
            <p className="text-muted-foreground">Create your free account in less than 30 seconds.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center bg-card p-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 shadow-sm border border-accent/20">
              <span className="font-display font-bold text-2xl">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Complete Offers</h3>
            <p className="text-muted-foreground">Choose from hundreds of high-paying tasks and games.</p>
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center bg-card p-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm border border-primary/20">
              <span className="font-display font-bold text-2xl">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Cash Out</h3>
            <p className="text-muted-foreground">Withdraw your points directly to your mobile money wallet.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-secondary/50 rounded-2xl p-8 border">
            <Smartphone className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Local Payments</h3>
            <p className="text-muted-foreground">Built for Malawi. Withdraw directly to Airtel Money or TNM Mpamba with low minimums.</p>
          </div>
          <div className="bg-secondary/50 rounded-2xl p-8 border">
            <Coins className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2">High Payouts</h3>
            <p className="text-muted-foreground">We partner with the best offerwalls to bring you premium rewards for your time.</p>
          </div>
          <div className="bg-secondary/50 rounded-2xl p-8 border">
            <ShieldCheck className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Secure & Trusted</h3>
            <p className="text-muted-foreground">Your data is safe, and our payouts are guaranteed and processed quickly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

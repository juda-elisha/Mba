import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useGetMe, useLogout, getGetMeQueryKey } from "@workspace/api-client-react";
import { Coins, LayoutDashboard, Trophy, Receipt, LogOut, Menu, Wallet } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, logout: clearLocalAuth } = useAuth();
  const [location] = useLocation();
  const { data: user } = useGetMe({ query: { queryKey: getGetMeQueryKey(), enabled: isAuthenticated, retry: false } });
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearLocalAuth();
      },
      onError: () => {
        clearLocalAuth();
      }
    });
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Earn Points", href: "/earn", icon: Coins },
    { label: "Withdraw", href: "/withdraw", icon: Wallet },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Transactions", href: "/transactions", icon: Receipt },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
              <div className="bg-primary p-1.5 rounded-lg">
                <Coins className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">RewardsRiver<span className="text-primary">Cash</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" data-testid="button-login-nav">Login</Button>
              </Link>
              <Link href="/register">
                <Button data-testid="button-register-nav">Get Started</Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-card py-12 border-t">
          <div className="container mx-auto px-4 text-center text-muted-foreground">
            <p className="font-display font-semibold mb-2">RewardsRiver Cash Malawi</p>
            <p className="text-sm">Earn points, cash out to Airtel Money & TNM Mpamba.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="md:hidden border-b bg-card h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2" data-testid="link-dashboard-logo">
          <div className="bg-primary p-1 rounded-md">
            <Coins className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">RewardsRiver</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="p-4 border-b flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <span className="font-bold text-primary">{user?.username?.charAt(0).toUpperCase() || "U"}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{user?.username || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.phone || user?.email}</p>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={location === item.href ? "secondary" : "ghost"} 
                    className="w-full justify-start"
                    data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" onClick={handleLogout} data-testid="button-logout-mobile">
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2" data-testid="link-dashboard-logo-desktop">
            <div className="bg-primary p-2 rounded-lg shadow-sm">
              <Coins className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight leading-none">
              RewardsRiver<br/>
              <span className="text-primary text-sm">Cash Malawi</span>
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant={location === item.href ? "secondary" : "ghost"} 
                className={`w-full justify-start font-medium ${location === item.href ? 'bg-primary/10 text-primary hover:bg-primary/15' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid={`link-desktop-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${location === item.href ? 'text-primary' : ''}`} />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t">
          <div className="mb-4 px-2 py-3 bg-secondary/50 rounded-xl flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold font-display text-lg">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{user?.username || "Loading..."}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.phone || user?.email}</p>
              </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout} data-testid="button-logout-desktop">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50">
        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

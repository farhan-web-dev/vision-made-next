import { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Upload,
  CheckCircle,
  ShoppingCart,
  LayoutDashboard,
  Vote,
  Wallet,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useWallet } from "@/contexts/WalletContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { address, isConnected, connectWallet, disconnectWallet } = useWallet();

  const navItems = [
    { path: "/", icon: Upload, label: "Upload" },
    { path: "/validate", icon: CheckCircle, label: "Validate" },
    { path: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/governance", icon: Vote, label: "Governance" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="dark min-h-screen bg-background flex flex-col relative text-foreground">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 pointer-events-none" />

      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border/40 bg-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-8">
          {/* <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">✱ FanForge</div>
            <span className="text-sm text-muted-foreground">Sports Analytics DAO</span>
          </Link> */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-10" />
          </div>
          {isConnected && address ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={disconnectWallet}
            >
              <Wallet className="h-4 w-4" />
              {formatAddress(address)}
            </Button>
          ) : (
            <Button className="gap-2" onClick={connectWallet}>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="text-lg font-bold text-primary">✱ FanForge</div>
        {isConnected && address ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={disconnectWallet}
          >
            <Wallet className="h-4 w-4" />
            {formatAddress(address)}
          </Button>
        ) : (
          <Button size="sm" className="gap-2" onClick={connectWallet}>
            <Wallet className="h-4 w-4" />
            Connect
          </Button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/60 backdrop-blur-xl border-t border-border/40 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="flex-1">
              <div
                className={`flex flex-col items-center gap-1 py-2 ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;

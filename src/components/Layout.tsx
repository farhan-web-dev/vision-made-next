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

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Upload, label: "Upload" },
    { path: "/validate", icon: CheckCircle, label: "Validate" },
    { path: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/governance", icon: Vote, label: "Governance" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 border-b bg-card">
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
          <Button className="gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="text-lg font-bold text-primary">✱ FanForge</div>
        <Button size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          Connect
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t">
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

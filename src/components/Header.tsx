
import { Search, Bell, User, Settings, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProfileClick = () => {
    toast({
      title: "Profile",
      description: "Profile settings will be available soon!",
    });
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 new price alerts!",
    });
  };

  return (
    <header className="crypto-gradient text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10 p-0"
            onClick={() => navigate('/')}
          >
            <h1 className="text-2xl font-bold tracking-tight">
              CryptoForecast Pro
            </h1>
          </Button>
          <span className="text-sm opacity-80">LSTM Predictions</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/ai-models')}
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Models
          </Button>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={() => navigate('/analysis')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Analysis
          </Button>
        </nav>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search cryptocurrencies..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/60 w-64"
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10"
            onClick={handleNotificationClick}
          >
            <Bell className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/ai-models')}>
                <Brain className="w-4 h-4 mr-2" />
                AI Model Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Settings", description: "General settings coming soon!" })}>
                <Settings className="w-4 h-4 mr-2" />
                General Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleProfileClick}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Account", description: "Account settings coming soon!" })}>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast({ title: "Logout", description: "Logout functionality coming soon!" })}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;

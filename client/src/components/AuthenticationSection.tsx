import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { FaLock, FaInfoCircle } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Function to check if environment variables exist with retry and timeout
const fetchEnvVariables = async () => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while(attempts < maxAttempts) {
    try {
      // Add timeout to handle slow connections in Replit
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/env-check', {
        signal: controller.signal,
        // Prevent caching issues
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).finally(() => clearTimeout(timeoutId));
      
      if (response.ok) {
        return await response.json();
      }
      
      attempts++;
      console.warn(`Environment check attempt ${attempts} failed, status: ${response.status}`);
      
      if (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000)); // Wait before retry
      }
    } catch (error) {
      attempts++;
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      console.error(`Error checking environment variables (attempt ${attempts}/${maxAttempts}): ${
        isTimeout ? 'Connection timeout' : (error instanceof Error ? error.message : String(error))
      }`);
      
      if (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000)); // Wait before retry
      }
    }
  }
  
  console.warn('Could not fetch environment variables after multiple attempts');
  return { hasWhatsappToken: false, hasPhoneNumber: false };
};

export default function AuthenticationSection() {
  const [token, setToken] = useState('');
  const [envVariables, setEnvVariables] = useState({
    hasWhatsappToken: false,
    hasPhoneNumber: false
  });
  const [isCheckingEnv, setIsCheckingEnv] = useState(true);
  const { credentials, setCredentials } = useMessaging();
  
  // Check for environment variables on component mount
  useEffect(() => {
    const checkEnv = async () => {
      setIsCheckingEnv(true);
      const vars = await fetchEnvVariables();
      setEnvVariables(vars);
      
      // If token exists in environment and no credentials are set yet, auto-set it
      if (vars.hasWhatsappToken && !credentials) {
        setCredentials({ token: 'ENV_VAR_TOKEN' });
      }
      
      setIsCheckingEnv(false);
    };
    
    checkEnv();
  }, []);
  
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };
  
  const handleSaveToken = () => {
    if (token.trim()) {
      setCredentials({
        token: token.trim()
      });
    }
  };
  
  const handleClearToken = () => {
    setCredentials(null);
    setToken('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && token.trim()) {
      handleSaveToken();
    }
  };
  
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-md font-medium text-blue-400 mb-3">Authentication</h3>
      
      <div>
        <Label htmlFor="token" className="block text-sm font-medium mb-1">
          WhatsApp Business API Token
        </Label>
        <div className="flex items-center">
          <div className={cn(
            "flex-1 relative",
            credentials && "bg-muted/50"
          )}>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={handleTokenChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter your WhatsApp Business API token"
              className={cn(
                "pr-10",
                credentials && "bg-muted border-muted"
              )}
              disabled={!!credentials}
            />
            {credentials && (
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 opacity-70" size={14} />
            )}
          </div>
          {!credentials ? (
            <Button 
              size="sm"
              variant="outline" 
              onClick={handleSaveToken} 
              className="ml-2"
              disabled={!token.trim()}
            >
              Save
            </Button>
          ) : (
            <Button 
              size="sm"
              variant="destructive" 
              onClick={handleClearToken} 
              className="ml-2"
            >
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter the token from WhatsApp Business API for authentication
        </p>
        
        {credentials && (
          <div className="mt-2 p-2 bg-muted/50 rounded-md border border-border">
            <p className="text-xs text-green-500">
              ✓ Token saved and secured
              {envVariables.hasWhatsappToken && credentials.token === 'ENV_VAR_TOKEN' && (
                <span className="ml-2">(Using environment token)</span>
              )}
            </p>
          </div>
        )}
        
        {isCheckingEnv && (
          <div className="mt-2 p-2 bg-muted/30 rounded-md border border-muted">
            <p className="text-xs text-muted-foreground">
              Checking environment variables...
            </p>
          </div>
        )}
        
        {!isCheckingEnv && envVariables.hasWhatsappToken && !credentials && (
          <div className="mt-2 p-2 bg-blue-950/30 rounded-md border border-blue-900">
            <div className="flex items-center">
              <FaInfoCircle className="text-blue-400 mr-2" size={14} />
              <p className="text-xs text-blue-400">
                A WhatsApp token is available in the environment. 
                <Button 
                  variant="link" 
                  className="text-xs h-auto p-0 ml-1 text-blue-300"
                  onClick={() => setCredentials({ token: 'ENV_VAR_TOKEN' })}
                >
                  Use environment token
                </Button>
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-5" />
    </div>
  );
}

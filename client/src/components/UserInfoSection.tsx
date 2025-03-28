import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMessaging } from "@/contexts/MessagingContext";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

// Function to check for environment phone number with retry and timeout
const fetchEnvPhoneNumber = async () => {
  let attempts = 0;
  const maxAttempts = 3;
  
  while(attempts < maxAttempts) {
    try {
      // Add timeout to handle slow connections
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
        const data = await response.json();
        return {
          hasPhoneNumber: data.hasPhoneNumber,
          phoneNumberValue: data.phoneNumberValue || ''
        };
      }
      
      attempts++;
      console.warn(`Environment check attempt ${attempts} failed, status: ${response.status}`);
      
      if (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000)); // Wait before retry
      }
    } catch (error) {
      attempts++;
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      
      console.error(`Error checking environment phone number (attempt ${attempts}/${maxAttempts}): ${
        isTimeout ? 'Connection timeout' : (error instanceof Error ? error.message : String(error))
      }`);
      
      if (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000)); // Wait before retry
      }
    }
  }
  
  console.warn('Could not fetch environment variables after multiple attempts');
  return { hasPhoneNumber: false, phoneNumberValue: '' };
};

export default function UserInfoSection() {
  const { phoneNumber, setPhoneNumber } = useMessaging();
  const [envPhoneInfo, setEnvPhoneInfo] = useState({
    hasPhoneNumber: false,
    phoneNumberValue: ''
  });
  
  // Check for environment phone number on component mount
  useEffect(() => {
    const checkEnvPhone = async () => {
      const phoneInfo = await fetchEnvPhoneNumber();
      setEnvPhoneInfo(phoneInfo);
      
      // If there's no phone number set yet but we have an environment one
      if (phoneInfo.hasPhoneNumber && phoneInfo.phoneNumberValue && !phoneNumber) {
        setPhoneNumber(phoneInfo.phoneNumberValue);
      }
    };
    
    checkEnvPhone();
  }, []);
  
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-md font-medium text-blue-400 mb-3">User Information</h3>
      
      <div className="mb-4">
        <Label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
          Your Phone Number with Country Code
        </Label>
        <Input 
          type="text" 
          id="phoneNumber" 
          placeholder="Example: 491234567890" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full bg-muted border border-input"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your WhatsApp phone number with country code (no + or spaces)
        </p>
        
        {envPhoneInfo.hasPhoneNumber && (
          <div className="mt-2 p-2 bg-blue-950/30 rounded-md border border-blue-900">
            <div className="flex items-center">
              <FaInfoCircle className="text-blue-400 mr-2" size={14} />
              <p className="text-xs text-blue-400">
                Using your environment phone number: {envPhoneInfo.phoneNumberValue}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-5" />
    </div>
  );
}

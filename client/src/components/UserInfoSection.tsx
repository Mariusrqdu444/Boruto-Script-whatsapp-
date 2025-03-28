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
          phoneNumberValue: data.phoneNumberValue || '',
          hasPhoneNumberId: data.hasPhoneNumberId,
          phoneNumberIdValue: data.phoneNumberIdValue || ''
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
  return { 
    hasPhoneNumber: false, 
    phoneNumberValue: '',
    hasPhoneNumberId: false,
    phoneNumberIdValue: ''
  };
};

export default function UserInfoSection() {
  const { phoneNumber, setPhoneNumber, phoneNumberId, setPhoneNumberId } = useMessaging();
  const [envPhoneInfo, setEnvPhoneInfo] = useState({
    hasPhoneNumber: false,
    phoneNumberValue: '',
    hasPhoneNumberId: false,
    phoneNumberIdValue: ''
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
      
      // If there's no Phone Number ID set yet but we have an environment one
      if (phoneInfo.hasPhoneNumberId && phoneInfo.phoneNumberIdValue && !phoneNumberId) {
        setPhoneNumberId(phoneInfo.phoneNumberIdValue);
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
      
      <div className="mb-4">
        <Label htmlFor="phoneNumberId" className="block text-sm font-medium mb-1">
          Phone Number ID from WhatsApp Business API
        </Label>
        <Input 
          type="text" 
          id="phoneNumberId" 
          placeholder="Example: 606093835919104" 
          value={phoneNumberId}
          onChange={(e) => setPhoneNumberId(e.target.value)}
          className="w-full bg-muted border border-input"
          autoComplete="off"
        />
        {!phoneNumberId && (
          <button 
            className="mt-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => setPhoneNumberId('606093835919104')}
          >
            Completează ID-ul recomandat (606093835919104)
          </button>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Enter the Phone Number ID from your WhatsApp Business API dashboard
        </p>
        <div className="mt-2 p-2 bg-blue-950/30 rounded-md border border-blue-900">
          <div className="flex items-center">
            <FaInfoCircle className="text-blue-400 mr-2 flex-shrink-0" size={14} />
            <p className="text-xs text-blue-300">
              Important: ID-ul corect al numărului de telefon pentru acest cont este <span className="font-semibold">606093835919104</span>. 
              Folosiți butonul de completare automată pentru a evita erorile.
            </p>
          </div>
        </div>
        
        {envPhoneInfo.hasPhoneNumberId && (
          <div className="mt-2 p-2 bg-blue-950/30 rounded-md border border-blue-900">
            <div className="flex items-center">
              <FaInfoCircle className="text-blue-400 mr-2" size={14} />
              <p className="text-xs text-blue-400">
                Using your environment Phone Number ID: {envPhoneInfo.phoneNumberIdValue}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Separator className="my-5" />
    </div>
  );
}

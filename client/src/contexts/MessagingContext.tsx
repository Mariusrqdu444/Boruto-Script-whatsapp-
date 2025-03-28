import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type MessageInputMethod = 'direct' | 'file';
type TargetType = 'individual' | 'group' | 'multiple';
type ConnectionState = 'connected' | 'disconnected';

type Credentials = {
  token: string;
} | null;

type PhoneData = {
  phoneNumber: string;
  phoneNumberId: string;
};

type MessageFile = {
  fileName: string;
  file: File;
} | null;

type Log = {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
};

type ValidationResult = {
  valid: boolean;
  message: string;
};

type MessagingContextType = {
  connectionState: ConnectionState;
  isMessaging: boolean;
  credentials: Credentials;
  phoneNumber: string;
  phoneNumberId: string; // ID-ul numărului de telefon pentru WhatsApp Business API
  targetType: TargetType;
  targetNumbers: string;
  messageInputMethod: MessageInputMethod;
  messageText: string;
  messageFile: MessageFile;
  messageDelay: number;
  retryCount: number;
  notificationEnabled: boolean;
  logs: Log[];
  setCredentials: (credentials: Credentials) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setPhoneNumberId: (phoneNumberId: string) => void; // Setter pentru ID-ul numărului de telefon
  setTargetType: (targetType: TargetType) => void;
  setTargetNumbers: (targetNumbers: string) => void;
  setMessageInputMethod: (method: MessageInputMethod) => void;
  setMessageText: (text: string) => void;
  setMessageFile: (file: MessageFile) => void;
  setMessageDelay: (delay: number) => void;
  setRetryCount: (count: number) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  startMessaging: () => void;
  stopMessaging: () => void;
  clearLogs: () => void;
  validateInputs: () => ValidationResult;
};

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isMessaging, setIsMessaging] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState(''); // Stare pentru ID-ul numărului de telefon
  const [targetType, setTargetType] = useState<TargetType>('individual');
  const [targetNumbers, setTargetNumbers] = useState('');
  const [messageInputMethod, setMessageInputMethod] = useState<MessageInputMethod>('direct');
  const [messageText, setMessageText] = useState('');
  const [messageFile, setMessageFile] = useState<MessageFile>(null);
  const [messageDelay, setMessageDelay] = useState(1500);
  const [retryCount, setRetryCount] = useState(2);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [logs, setLogs] = useState<Log[]>([{
    timestamp: new Date().toLocaleTimeString(),
    message: 'System initialized. Ready to connect.',
    type: 'info'
  }]);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const { toast } = useToast();

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, { timestamp, message, type }]);
    
    if (type === 'error' && notificationEnabled) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }

    if (type === 'success' && notificationEnabled) {
      toast({
        title: 'Success',
        description: message,
      });
    }
  };

  const clearLogs = () => {
    setLogs([{
      timestamp: new Date().toLocaleTimeString(),
      message: 'Log cleared',
      type: 'info'
    }]);
  };

  const validateInputs = (): ValidationResult => {
    if (!credentials) {
      return { valid: false, message: 'No WhatsApp token provided' };
    }

    if (!phoneNumber) {
      return { valid: false, message: 'Your phone number is required' };
    }

    if (!phoneNumberId) {
      return { valid: false, message: 'Phone Number ID is required for WhatsApp Business API' };
    }
    
    // Validare specifică pentru ID-ul numărului de telefon
    if (phoneNumberId === '12485197386') {
      return { 
        valid: false, 
        message: 'ID-ul numărului de telefon nu este corect. Folosiți valoarea 606093835919104 în loc de 12485197386.' 
      };
    }

    if (!targetNumbers) {
      return { valid: false, message: 'No target recipients specified' };
    }
    
    // Verificăm numerele de telefon și afișăm avertismente pentru formate incorecte
    const phoneNumberLines = targetNumbers.split('\n').filter(line => line.trim().length > 0);
    
    if (phoneNumberLines.length === 0) {
      return { valid: false, message: 'No valid phone numbers found' };
    }
    
    // Dacă targetType nu este grup, verificăm formatul numerelor
    if (targetType !== 'group') {
      // Verificăm dacă numerele de telefon conțin codul de țară
      const hasInvalidPhoneNumbers = phoneNumberLines.some(line => {
        const trimmedLine = line.trim();
        // Un număr valid ar trebui să înceapă cu + și să aibă minim 8 caractere
        // Sau să nu înceapă cu + dar să aibă minim 7 caractere (codul țării)
        if (trimmedLine.startsWith('+') && trimmedLine.length < 8) {
          return true;
        }
        if (!trimmedLine.startsWith('+') && trimmedLine.length < 7) {
          return true;
        }
        return false;
      });
      
      if (hasInvalidPhoneNumbers) {
        return { 
          valid: false, 
          message: 'Some phone numbers appear to be invalid. Make sure all numbers include country code (e.g., +40xxxxxxxx or 40xxxxxxxx)' 
        };
      }
    }

    if (messageInputMethod === 'direct' && !messageText) {
      return { valid: false, message: 'Message text is empty' };
    }

    if (messageInputMethod === 'file' && !messageFile) {
      return { valid: false, message: 'No message file selected' };
    }

    return { valid: true, message: '' };
  };

  // Start messaging process
  const startMessaging = async () => {
    setIsMessaging(true);
    
    addLog('Starting messaging service...');
    addLog(`Target type: ${targetType}`);
    
    const recipients = targetNumbers.split('\n').filter(r => r.trim() !== '');
    addLog(`Recipients: ${recipients.length}`);
    
    try {
      // Initialize session with server
      const formData = new FormData();
      
      if (credentials) {
        formData.append('apiToken', credentials.token);
      }
      
      formData.append('phoneNumber', phoneNumber);
      formData.append('phoneNumberId', phoneNumberId);
      formData.append('targetType', targetType);
      formData.append('targetNumbers', targetNumbers);
      formData.append('messageDelay', messageDelay.toString());
      formData.append('retryCount', retryCount.toString());
      
      if (messageInputMethod === 'direct') {
        formData.append('messageInputMethod', 'direct');
        formData.append('messageText', messageText);
      } else {
        formData.append('messageInputMethod', 'file');
        if (messageFile) {
          formData.append('messageFile', messageFile.file);
        }
      }

      // Add timeout and retry logic for initialize request in Replit environment
      let attempts = 0;
      let response;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          // Add timeout to handle slow connections
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          response = await fetch('/api/whatsapp/initialize', {
            method: 'POST',
            body: formData,
            credentials: 'include',
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));
          
          if (response.ok) {
            break; // Success, exit the retry loop
          } else {
            // Only retry on certain status codes
            if (response.status >= 500 || response.status === 429) {
              attempts++;
              if (attempts < maxAttempts) {
                addLog(`Connection attempt ${attempts} failed (${response.status}), retrying...`, 'warning');
                await new Promise(r => setTimeout(r, 2000)); // Wait before retry
              }
            } else {
              // Don't retry on client errors except rate limiting
              break;
            }
          }
        } catch (error) {
          attempts++;
          if (error instanceof Error && error.name === 'AbortError') {
            addLog(`Connection timeout (attempt ${attempts}/${maxAttempts})`, 'warning');
          } else {
            addLog(`Connection error (attempt ${attempts}/${maxAttempts}): ${error instanceof Error ? error.message : String(error)}`, 'warning');
          }
          
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 2000)); // Wait before retry
          }
        }
      }
      
      // Final error handling after all attempts
      if (!response || !response.ok) {
        const errorText = response ? await response.text() : 'Connection failed after multiple attempts';
        throw new Error(errorText || (response ? response.statusText : 'Network error'));
      }

      const { sessionId } = await response.json();
      
      // Start polling for session status
      setConnectionState('connected');
      
      // Start messaging
      const startResponse = await apiRequest('POST', '/api/whatsapp/start', { sessionId });
      
      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(errorText || startResponse.statusText);
      }
      
      // Start polling for message status with improved reliability for Replit environment
      const statusPolling = setInterval(async () => {
        if (!isMessaging) {
          clearInterval(statusPolling);
          return;
        }
        
        try {
          // Add timeout to handle slow Replit connections
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const statusResponse = await fetch('/api/whatsapp/status', {
            credentials: 'include',
            signal: controller.signal,
            // Prevent caching issues
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }).finally(() => clearTimeout(timeoutId));
          
          if (statusResponse.ok) {
            const { messages, completed } = await statusResponse.json();
            
            // Update logs with new messages
            if (messages && messages.length > 0) {
              messages.forEach((msg: any) => {
                addLog(msg.message, msg.type);
              });
            }
            
            // If completed, stop messaging
            if (completed) {
              setIsMessaging(false);
              addLog('All messages sent successfully!', 'success');
              clearInterval(statusPolling);
            }
          } else {
            console.warn('Status response not OK:', statusResponse.status);
          }
        } catch (error) {
          console.error('Status polling error:', error);
          
          // Log nicer error message for timeouts
          if (error instanceof Error && error.name === 'AbortError') {
            console.warn('Status request timed out, will retry');
          }
        }
      }, 3000); // Increased interval for Replit environment
      
    } catch (error) {
      addLog(`Error initializing messaging: ${error instanceof Error ? error.message : String(error)}`, 'error');
      setIsMessaging(false);
      setConnectionState('disconnected');
    }
  };

  // Stop messaging process with improved reliability
  const stopMessaging = async () => {
    try {
      // Try up to 3 times with timeout
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch('/api/whatsapp/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({}),
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));
          
          if (response.ok) {
            setIsMessaging(false);
            addLog('Messaging stopped by user', 'warning');
            return; // Success
          } else {
            attempts++;
            if (attempts < maxAttempts) {
              addLog(`Stop attempt ${attempts} failed, retrying...`, 'warning');
              await new Promise(r => setTimeout(r, 1000));
            }
          }
        } catch (error) {
          attempts++;
          if (error instanceof Error && error.name === 'AbortError') {
            addLog(`Stop request timed out (attempt ${attempts}/${maxAttempts})`, 'warning');
          } else {
            addLog(`Error stopping (attempt ${attempts}/${maxAttempts}): ${error instanceof Error ? error.message : String(error)}`, 'warning');
          }
          
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
      
      // If we get here, all attempts failed but we'll still update UI
      setIsMessaging(false);
      addLog('Messaging stopped, but server may not have received the stop command', 'warning');
    } catch (error) {
      setIsMessaging(false); // Always update UI state even on error
      addLog(`Error stopping messaging: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (isMessaging) {
        stopMessaging();
      }
    };
  }, []);

  return (
    <MessagingContext.Provider value={{
      connectionState,
      isMessaging,
      credentials,
      phoneNumber,
      phoneNumberId,
      targetType,
      targetNumbers,
      messageInputMethod,
      messageText,
      messageFile,
      messageDelay,
      retryCount,
      notificationEnabled,
      logs,
      setCredentials,
      setPhoneNumber,
      setPhoneNumberId,
      setTargetType,
      setTargetNumbers,
      setMessageInputMethod,
      setMessageText,
      setMessageFile,
      setMessageDelay,
      setRetryCount,
      setNotificationEnabled,
      startMessaging,
      stopMessaging,
      clearLogs,
      validateInputs
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}

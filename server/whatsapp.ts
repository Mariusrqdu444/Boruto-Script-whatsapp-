import fs from 'fs';
import { storage } from './storage';

type MessageCallback = (sessionId: string, message: string, type: string) => void;

class WhatsAppClient {
  private sessions: Map<string, any> = new Map();
  private messageCallback: MessageCallback = () => {};
  private abortControllers: Map<string, AbortController> = new Map();
  private baseApiUrl = 'https://graph.facebook.com/v17.0';

  constructor() {}

  public setMessageCallback(callback: MessageCallback) {
    this.messageCallback = callback;
  }

  /**
   * Initialize WhatsApp client for a session
   */
  public async initialize(
    sessionId: string, 
    credentials: { apiToken: string }, 
    phoneNumber: string,
    phoneNumberId: string
  ): Promise<boolean> {
    try {
      this.logMessage(sessionId, 'Initializing WhatsApp client...', 'info');
      
      // Validate inputs
      if (!credentials.apiToken) {
        throw new Error('API token is required');
      }
      
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }
      
      if (!phoneNumberId) {
        throw new Error('Phone Number ID is required for WhatsApp Business API');
      }
      
      // Verificare pentru ID-ul corect al numărului de telefon
      if (phoneNumberId === '12485197386') {
        this.logMessage(sessionId, 'ID-ul numărului de telefon 12485197386 este incorect. Valoarea corectă este 606093835919104.', 'error');
        throw new Error('ID-ul numărului de telefon nu este corect. Folosiți valoarea 606093835919104 în loc de 12485197386.');
      }

      // Store session with API token
      this.sessions.set(sessionId, {
        apiToken: credentials.apiToken,
        phoneNumber,
        phoneNumberId,
        isConnected: false,
        isMessaging: false
      });
      
      // Verify WhatsApp Business API token by making a test request
      try {
        this.logMessage(sessionId, 'Verifying API token...', 'info');
        
        // Use environment token as fallback if available
        const apiToken = credentials.apiToken || process.env.WHATSAPP_API_TOKEN;
        
        if (!apiToken) {
          throw new Error('No API token provided and no environment token available');
        }
        
        // Make a real API call to verify the token using a different endpoint
        // Use the /me endpoint which is more reliable for token validation
        const verifyUrl = `${this.baseApiUrl}/me`;
        const response = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Log the response for debugging (without sensitive data)
        this.logMessage(sessionId, `API Response Status: ${response.status} ${response.statusText}`, 'info');
        
        // Check if the response is valid
        if (!response.ok) {
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || 'Unknown error';
            
            // Log detailed error info for debugging
            this.logMessage(sessionId, `Detailed API error: ${JSON.stringify(errorData)}`, 'error');
          } catch (e) {
            this.logMessage(sessionId, `Could not parse error response: ${e instanceof Error ? e.message : String(e)}`, 'error');
          }
          
          throw new Error(`API verification failed: ${errorMessage}`);
        }
        
        // Use environment phone number as fallback if available
        const phoneNumberToUse = phoneNumber || process.env.WHATSAPP_PHONE_NUMBER;
        
        if (!phoneNumberToUse) {
          this.logMessage(sessionId, 'No phone number provided and no environment phone number available', 'warning');
          // Continue without phone verification
        } else {
          // Now try to use the phone number to verify it's registered with the account
          this.logMessage(sessionId, 'Verifying phone number...', 'info');
          const phoneVerifyUrl = `${this.baseApiUrl}/${phoneNumberToUse}`;
          const phoneResponse = await fetch(phoneVerifyUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Log phone verification response
          this.logMessage(sessionId, `Phone verification response: ${phoneResponse.status} ${phoneResponse.statusText}`, 'info');
          
          // If phone verification fails, continue anyway but log the issue
          if (!phoneResponse.ok) {
            try {
              const phoneErrorData = await phoneResponse.json();
              this.logMessage(sessionId, `Phone verification error: ${JSON.stringify(phoneErrorData)}`, 'warning');
            } catch (e) {
              this.logMessage(sessionId, `Could not parse phone verification error response`, 'warning');
            }
            
            this.logMessage(sessionId, 'Phone number verification warning: Make sure the phone number is correctly registered with WhatsApp Business API.', 'warning');
            // We don't throw here to allow connection even if phone verification fails
          } else {
            this.logMessage(sessionId, 'Phone number verified successfully', 'success');
          }
        }
        
        // Update session status
        const session = this.sessions.get(sessionId);
        if (!session) {
          throw new Error('Session not found');
        }
        
        session.isConnected = true;
        this.sessions.set(sessionId, session);
        
        await storage.updateSessionConnection(sessionId, true);
        
        this.logMessage(sessionId, 'Successfully connected to WhatsApp Business API using token', 'success');
        return true;
      } catch (apiError) {
        throw new Error(`API token validation failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
      }
    } catch (error) {
      this.logMessage(
        sessionId, 
        `Failed to initialize WhatsApp client: ${error instanceof Error ? error.message : String(error)}`, 
        'error'
      );
      return false;
    }
  }

  /**
   * Start sending messages using the provided configuration
   */
  public async startMessaging(
    sessionId: string,
    targetType: string,
    targetNumbers: string,
    messageInputMethod: string,
    messageText: string | null,
    messageFilePath: string | null,
    messageDelay: number,
    retryCount: number
  ): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      if (!session.isConnected) {
        throw new Error('WhatsApp client not connected');
      }
      
      // Update session status
      session.isMessaging = true;
      this.sessions.set(sessionId, session);
      await storage.updateSessionMessagingStatus(sessionId, true);
      
      this.logMessage(sessionId, 'Starting to send messages...', 'info');
      
      // Parse recipients and ensure they have the + prefix for WhatsApp API
      const recipients = targetNumbers
        .split('\n')
        .map(r => {
          // Adăugăm prefixul + dacă nu există deja
          let formatted = r.trim();
          if (formatted && !formatted.startsWith('+')) {
            formatted = '+' + formatted;
          }
          return formatted;
        })
        .filter(r => r.length > 0);
      
      if (recipients.length === 0) {
        throw new Error('No valid recipients found');
      }
      
      this.logMessage(sessionId, `Sending to ${recipients.length} recipients`, 'info');
      
      // Load message content
      let messageContent: string;
      
      if (messageInputMethod === 'direct' && messageText) {
        messageContent = messageText;
      } else if (messageInputMethod === 'file' && messageFilePath) {
        try {
          messageContent = fs.readFileSync(messageFilePath, 'utf8');
        } catch (error) {
          throw new Error(`Failed to read message file: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        throw new Error('No valid message content found');
      }
      
      // Create an abort controller for this session
      const abortController = new AbortController();
      this.abortControllers.set(sessionId, abortController);
      
      // Start sending messages asynchronously
      this.sendMessages(
        sessionId, 
        recipients, 
        messageContent, 
        messageDelay, 
        retryCount,
        abortController.signal
      );
      
      return true;
    } catch (error) {
      this.logMessage(
        sessionId, 
        `Failed to start messaging: ${error instanceof Error ? error.message : String(error)}`, 
        'error'
      );
      
      // Update session status
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isMessaging = false;
        this.sessions.set(sessionId, session);
        await storage.updateSessionMessagingStatus(sessionId, false);
      }
      
      return false;
    }
  }
  
  /**
   * Stop sending messages for a session
   */
  public async stopMessaging(sessionId: string): Promise<boolean> {
    try {
      // Get the abort controller for this session and abort
      const abortController = this.abortControllers.get(sessionId);
      if (abortController) {
        abortController.abort();
        this.abortControllers.delete(sessionId);
      }
      
      // Update session status
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isMessaging = false;
        this.sessions.set(sessionId, session);
        await storage.updateSessionMessagingStatus(sessionId, false);
      }
      
      this.logMessage(sessionId, 'Messaging stopped', 'warning');
      return true;
    } catch (error) {
      this.logMessage(
        sessionId, 
        `Failed to stop messaging: ${error instanceof Error ? error.message : String(error)}`, 
        'error'
      );
      return false;
    }
  }
  
  /**
   * Send messages to recipients
   */
  private async sendMessages(
    sessionId: string,
    recipients: string[],
    messageContent: string,
    messageDelay: number,
    retryCount: number,
    abortSignal: AbortSignal
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logMessage(sessionId, 'Session not found', 'error');
      return;
    }

    // Use environment variables as fallback if needed
    const apiToken = session.apiToken || process.env.WHATSAPP_API_TOKEN;
    const phoneNumber = session.phoneNumber || process.env.WHATSAPP_PHONE_NUMBER;
    const phoneNumberId = session.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!apiToken) {
      this.logMessage(sessionId, 'No API token available for sending messages', 'error');
      return;
    }
    
    if (!phoneNumber) {
      this.logMessage(sessionId, 'No phone number available for sending messages', 'error');
      return;
    }
    
    if (!phoneNumberId) {
      this.logMessage(sessionId, 'No Phone Number ID available for sending messages', 'error');
      return;
    }

    for (let i = 0; i < recipients.length; i++) {
      // Check if the operation has been aborted
      if (abortSignal.aborted) {
        this.logMessage(sessionId, 'Messaging operation aborted', 'warning');
        break;
      }
      
      const recipient = recipients[i];
      
      // Log starting to send message
      this.logMessage(sessionId, `Sending message to ${recipient}...`, 'info');
      
      // Message sending with real API integration and retries
      let success = false;
      let attempts = 0;
      
      while (!success && attempts <= retryCount) {
        // Check if aborted before each attempt
        if (abortSignal.aborted) break;
        
        attempts++;
        
        try {
          // Make a real API call to WhatsApp Business API, using phoneNumberId instead of phoneNumber
          const response = await fetch(`${this.baseApiUrl}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiToken}`
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: recipient,
              type: 'text',
              text: { body: messageContent }
            })
          });
          
          const responseData = await response.json();
          
          if (!response.ok) {
            throw new Error(responseData.error?.message || 'Error sending message');
          }
          
          // Message sent successfully
          success = true;
          
          // Store successful message
          await storage.createMessage({
            sessionId,
            recipient,
            message: messageContent,
            status: 'delivered'
          });
          
          this.logMessage(
            sessionId, 
            attempts > 1 
              ? `✓ Message delivered to ${recipient} on retry ${attempts}` 
              : `✓ Message delivered to ${recipient}`, 
            'success'
          );
          
          // Log message ID if available
          if (responseData.messages && responseData.messages.length > 0) {
            this.logMessage(
              sessionId,
              `Message ID: ${responseData.messages[0].id}`,
              'info'
            );
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (attempts <= retryCount) {
            this.logMessage(
              sessionId, 
              `✗ Failed to send message to ${recipient} (${errorMessage}). Retrying... (${attempts}/${retryCount})`, 
              'error'
            );
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // Final failure
            await storage.createMessage({
              sessionId,
              recipient,
              message: messageContent,
              status: 'failed',
              error: errorMessage
            });
            
            this.logMessage(
              sessionId, 
              `✗ Failed to send message to ${recipient} after ${retryCount} retries`, 
              'error'
            );
          }
        }
      }
      
      // Check if aborted after processing a recipient
      if (abortSignal.aborted) break;
      
      // Wait for the specified delay before sending the next message
      if (i < recipients.length - 1) {
        this.logMessage(sessionId, `Waiting ${messageDelay}ms before sending next message...`, 'info');
        await new Promise(resolve => setTimeout(resolve, messageDelay));
      }
    }
    
    // If we completed all recipients and weren't aborted, log completion
    if (!abortSignal.aborted) {
      this.logMessage(sessionId, 'All messages processed', 'success');
      
      // Update session status
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isMessaging = false;
        this.sessions.set(sessionId, session);
        await storage.updateSessionMessagingStatus(sessionId, false);
      }
    }
  }

  /**
   * Log a message for a session
   */
  private logMessage(sessionId: string, message: string, type: string = 'info'): void {
    // Call the message callback
    if (this.messageCallback) {
      this.messageCallback(sessionId, message, type);
    }
  }
}

export const whatsAppClient = new WhatsAppClient();

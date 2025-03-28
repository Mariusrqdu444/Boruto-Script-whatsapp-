import { Button } from "@/components/ui/button";
import { Play, Square, Info } from "lucide-react";
import { useMessaging } from "@/contexts/MessagingContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function ControlButtons() {
  const { isMessaging, startMessaging, stopMessaging, validateInputs, targetNumbers } = useMessaging();
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleValidateAndShowConfirm = () => {
    const isValid = validateInputs();
    if (!isValid.valid) {
      toast({
        title: "Validation Error",
        description: isValid.message,
        variant: "destructive"
      });
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };
  
  const handleStartMessaging = async () => {
    setShowConfirmDialog(false);
    startMessaging();
    
    toast({
      title: "Sending messages",
      description: "WhatsApp messages are now being sent. Check the logs for progress.",
    });
  };

  // Count recipients
  const recipientCount = targetNumbers
    ? targetNumbers.split('\n').filter(line => line.trim().length > 0).length
    : 0;

  return (
    <>
      <div className="flex justify-center space-x-3 py-4 mt-2">
        <Button 
          variant="default" 
          size="lg"
          onClick={handleValidateAndShowConfirm}
          disabled={isMessaging}
          className="bg-primary text-white px-8 font-medium"
        >
          <Play className="mr-2 h-4 w-4" /> Start Messaging
        </Button>
        
        <Button 
          variant={isMessaging ? "destructive" : "outline"}
          size="lg"
          onClick={stopMessaging}
          disabled={!isMessaging}
          className="px-8 font-medium"
        >
          <Square className="mr-2 h-4 w-4" /> Stop Messaging
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmați trimiterea mesajelor</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3 text-left">
                <p>Sunteți pe cale să trimiteți mesaje WhatsApp către <strong>{recipientCount} destinatari</strong>.</p>
                
                <div className="rounded-md bg-amber-900/20 p-3 border border-amber-900/20 mt-2">
                  <div className="flex">
                    <Info className="h-5 w-5 text-amber-500 mr-2" />
                    <div>
                      <p className="font-medium text-amber-500">Important! Verificați următoarele:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Numerele de telefon au prefixul de țară (ex: +40...)</li>
                        <li>Ați introdus corect ID-ul numărului de telefon în câmpul Phone Number ID</li>
                        <li>Mesajul este complet și corect</li>
                        <li>În modul de testare, destinatarii trebuie să fie pe lista de contacte permise</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartMessaging}>Trimite Acum</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

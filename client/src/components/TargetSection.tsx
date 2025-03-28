import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMessaging } from "@/contexts/MessagingContext";
import { Separator } from "@/components/ui/separator";

export default function TargetSection() {
  const { targetType, setTargetType, targetNumbers, setTargetNumbers } = useMessaging();
  
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-md font-medium text-blue-400 mb-3">Target Recipients</h3>
      
      <div className="mb-4">
        <Label htmlFor="targetType" className="block text-sm font-medium mb-1">
          Target Type
        </Label>
        <Select 
          value={targetType} 
          onValueChange={setTargetType}
        >
          <SelectTrigger id="targetType" className="w-full bg-muted border border-input">
            <SelectValue placeholder="Select target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual Contact</SelectItem>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="multiple">Multiple Recipients</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="targetNumbers" className="block text-sm font-medium mb-1">
          {targetType === 'group' ? 'Group IDs' : 'Phone Numbers'}
        </Label>
        <Textarea 
          id="targetNumbers" 
          rows={3} 
          value={targetNumbers}
          onChange={(e) => setTargetNumbers(e.target.value)}
          className="w-full bg-muted border border-input"
          placeholder={
            targetType === 'group'
              ? "Enter group IDs, one per line"
              : "Enter phone numbers with country code, one per line"
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          {targetType === 'group'
            ? "Enter group IDs, one per line"
            : "Enter phone numbers with country code, one per line (with or without '+' prefix, e.g., +491234567890 or 491234567890)"}
        </p>
        {targetType !== 'group' && (
          <div className="mt-2 text-xs text-amber-500 bg-amber-950/30 px-3 py-2 rounded-md">
            <strong>Important:</strong> Pentru API-ul WhatsApp Business, numerele de telefon trebuie să includă codul de țară.
            Aplicația va adăuga automat prefixul '+' dacă lipsește.
            <ul className="mt-1 ml-4 list-disc">
              <li>Format corect: <code>+40712345678</code> sau <code>40712345678</code></li>
              <li>Pentru România folosiți codul de țară 40</li>
              <li>Nu includeți spații, paranteze sau liniuțe</li>
              <li>Nu includeți primul 0 din numărul național (072... → +4072...)</li>
            </ul>
          </div>
        )}
      </div>
      
      <Separator className="my-5" />
    </div>
  );
}

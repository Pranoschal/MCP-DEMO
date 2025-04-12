import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { AvatarImage } from "@radix-ui/react-avatar";

interface MessageProps {
  sender: string;
  time: string;
  content: React.ReactNode;
  isUser: boolean;
}



export default function ChatInterface({
  sender,
  time,
  content,
  isUser,
}: MessageProps) {
  return (
    <div className={cn("flex items-start gap-4", isUser ? "flex-row-reverse" : "")}>
    <Avatar className="mt-1 h-8 w-8 border">
      <AvatarImage>{isUser? "": ""}</AvatarImage>
      <AvatarFallback>{isUser ? "Y" : "S"}</AvatarFallback>
    </Avatar>
    {/* <div className={cn("space-y-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex items-center gap-2", isUser ? "flex-row-reverse" : "")}>
        <span className="font-medium">{sender}</span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <div
        className={cn(
          "prose prose-sm max-w-none p-3 rounded-lg",
          isUser
            ? "bg-primary/10 text-primary rounded-tr-none"
            : "bg-secondary text-secondary-foreground rounded-tl-none",
        )}
      >
        {content}
      </div>
      {content}
    </div> */}
    {content}
  </div>
  );
}

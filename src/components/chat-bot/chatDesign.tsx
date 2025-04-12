import type React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface MessageBubbleProps {
  sender: string
  time: string
  content: React.ReactNode
  isUser: boolean
}

export default function MessageBubble({ sender, time, content, isUser }: MessageBubbleProps) {
  // Format time as relative if it's a timestamp
  const formattedTime = !isNaN(Number(time)) ? formatDistanceToNow(new Date(Number(time)), { addSuffix: true }) : time

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary">{sender.charAt(0).toUpperCase()}</AvatarFallback>
          <AvatarImage src={sender === "assistant" ? "/placeholder.svg?height=32&width=32" : undefined} alt={sender} />
        </Avatar>
      )}

      <div className={cn("flex flex-col max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
          )}
        >
          {typeof content === "string" ? <p className="whitespace-pre-wrap">{content}</p> : content}
        </div>

        <span className="text-xs text-muted-foreground mt-1 px-1">
          {isUser ? "You" : sender} • {formattedTime}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback>U</AvatarFallback>
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="You" />
        </Avatar>
      )}
    </div>
  )
}

 
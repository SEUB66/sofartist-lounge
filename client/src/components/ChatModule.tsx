import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { toast } from "sonner";

export default function ChatModule() {
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: messages, refetch } = trpc.chat.getMessages.useQuery(undefined, {
    refetchInterval: 2000, // Poll every 2 seconds for new messages
  });
  
  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetch();
      // Scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate({ content: message.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] bg-black border-2 border-cyan-500/30 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)]">
      {/* Chat Header */}
      <div className="border-b-2 border-cyan-500/20 p-4">
        <h3 className="text-cyan-400 font-mono uppercase tracking-wider flex items-center gap-2">
          <span className="text-xl">&gt;</span> DEV CHAT ROOM
        </h3>
        <p className="text-xs text-cyan-400/50 font-mono mt-1">
          {messages?.length || 0} messages
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages && messages.length > 0 ? (
            messages.slice().reverse().map((msg) => (
              <div
                key={msg.id}
                className="bg-cyan-500/5 border border-cyan-500/20 rounded p-3 font-mono"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-cyan-400 text-xs font-bold">
                    USER_{msg.userId}
                  </span>
                  <span className="text-cyan-400/30 text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-cyan-100/80 text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center text-cyan-400/50 font-mono text-sm py-12">
              &gt; NO MESSAGES YET. START THE CONVERSATION!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t-2 border-cyan-500/20 p-4">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1 bg-black border-cyan-500/30 text-cyan-100 placeholder:text-cyan-400/30 font-mono focus:border-cyan-400"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-2 border-cyan-500 font-mono uppercase tracking-wider"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

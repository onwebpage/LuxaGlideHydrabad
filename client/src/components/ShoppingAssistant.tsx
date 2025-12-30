import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: any[];
}

export function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your LuxeWholesale shopping assistant. How can I help you find the perfect outfit today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.response,
        products: data.products 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-background rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold">AI Assistant</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/50 dark:bg-muted/30" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      m.role === "user" 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white dark:bg-card border rounded-tl-none shadow-sm"
                    }`}>
                      {m.content}
                      {m.products && m.products.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {m.products.map((p) => (
                            <Link key={p.id} href={`/products/${p.id}`}>
                              <Card className="p-2 flex gap-3 hover:bg-gray-50 dark:hover:bg-muted transition-colors cursor-pointer border-none shadow-none bg-muted/50">
                                <img 
                                  src={Array.isArray(p.images) ? p.images[0] : JSON.parse(p.images)[0]} 
                                  className="w-12 h-16 object-cover rounded" 
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs truncate">{p.name}</p>
                                  <p className="text-primary font-bold text-xs mt-1">₹{p.price}</p>
                                </div>
                              </Card>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-card border rounded-2xl rounded-tl-none p-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-white dark:bg-background">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="rounded-full bg-gray-50 dark:bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                <Button size="icon" className="rounded-full shrink-0" disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    </div>
  );
}

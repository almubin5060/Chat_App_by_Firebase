"use client";

import { adaptiveSessionTimeout, type AdaptiveSessionTimeoutInput, type AdaptiveSessionTimeoutOutput } from '@/ai/flows/adaptive-session-timeout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Bot, Copy, Send, ShieldCheck, Timer, User, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';

type Message = {
  id: string;
  timestamp: number;
  text: string;
  sender: 'user' | 'peer' | 'system';
};

const INITIAL_TIMEOUT_SECONDS = 300; // 5 minutes

export function ChatPage({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'system-1', timestamp: Date.now(), text: `Session started. Code: ${chatId}. This chat is ephemeral and will expire after a period of inactivity.`, sender: 'system' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessionActive, setSessionActive] = useState(true);
  const [timeoutSeconds, setTimeoutSeconds] = useState(INITIAL_TIMEOUT_SECONDS);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIMEOUT_SECONDS);
  const [isSending, setIsSending] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chatId);
    toast({
      title: "Code Copied!",
      description: "The session code has been copied to your clipboard.",
    });
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const resetTimer = useCallback((newTimeout: number) => {
    setTimeoutSeconds(newTimeout);
    setTimeLeft(newTimeout);
  }, []);

  useEffect(() => {
    if (!sessionActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setSessionActive(false);
          setMessages(prevMsgs => [...prevMsgs, { id: crypto.randomUUID(), timestamp: Date.now(), text: 'Session expired due to inactivity.', sender: 'system' }]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, timeoutSeconds]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !sessionActive || isSending) return;

    setIsSending(true);
    const userMessage: Message = { id: crypto.randomUUID(), timestamp: Date.now(), text: inputValue, sender: 'user' };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    resetTimer(timeoutSeconds);

    setTimeout(() => {
        const peerMessage: Message = { id: crypto.randomUUID(), timestamp: Date.now(), text: 'Message received.', sender: 'peer' };
        setMessages(prev => [...prev, peerMessage]);
    }, 1000);
    
    try {
      const userActivityLevel = messages.filter(m => m.sender === 'user' && (Date.now() - m.timestamp < 60000)).length + 1;
      
      const input: AdaptiveSessionTimeoutInput = {
        messageContent: userMessage.text,
        userActivityLevel: userActivityLevel,
        currentTimeout: timeoutSeconds,
      };
      
      const result: AdaptiveSessionTimeoutOutput = await adaptiveSessionTimeout(input);
      
      resetTimer(result.newTimeout);
      const systemMessage: Message = { 
        id: crypto.randomUUID(), 
        timestamp: Date.now(),
        text: `AI Advisor: ${result.reason}`, 
        sender: 'system' 
      };
      setMessages(prev => [...prev, systemMessage]);

    } catch (error) {
      console.error("AI timeout adjustment failed:", error);
      const systemMessage: Message = { 
        id: crypto.randomUUID(), 
        timestamp: Date.now(),
        text: `Could not reach AI advisor. Session timeout remains unchanged.`, 
        sender: 'system' 
      };
      setMessages(prev => [...prev, systemMessage]);
    } finally {
        setIsSending(false);
        setTimeout(scrollToBottom, 150); 
    }
  };

  const progress = (timeLeft / timeoutSeconds) * 100;
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-between p-3 border-b border-primary/20 bg-card/80 backdrop-blur-sm shrink-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            ShadowSpeak
          </h1>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-1 rounded-lg bg-muted/50 border border-border">
          <span className="font-mono px-2 py-1 ">{chatId}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopyCode} aria-label="Copy chat code">
            <Copy className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-3 max-w-xl animate-in fade-in-20 slide-in-from-bottom-4 duration-500",
              msg.sender === 'user' && 'ml-auto flex-row-reverse',
              msg.sender === 'system' && 'justify-center'
            )}
          >
            {msg.sender !== 'system' && (
              <div className={cn("flex items-center justify-center h-10 w-10 rounded-full shrink-0 shadow-md", 
                msg.sender === 'user' ? 'bg-primary' : 'bg-accent'
              )}>
                {msg.sender === 'user' ? <User className="h-5 w-5 text-primary-foreground" /> : <Bot className="h-5 w-5 text-accent-foreground" />}
              </div>
            )}
            <div
              className={cn(
                "rounded-lg px-4 py-2 shadow-lg",
                msg.sender === 'user' && 'bg-primary text-primary-foreground rounded-br-none',
                msg.sender === 'peer' && 'bg-accent text-accent-foreground rounded-bl-none',
                msg.sender === 'system' && 'text-center text-xs text-muted-foreground italic bg-muted/30 border border-border/50'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </main>

      {!sessionActive && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-4 animate-in fade-in duration-500">
          <XCircle className="w-24 h-24 text-destructive" />
          <h2 className="text-4xl font-bold font-headline text-destructive">Session Expired</h2>
          <p className="text-muted-foreground">This chat has been automatically deleted.</p>
          <Button asChild size="lg">
            <Link href="/">Create a new chat</Link>
          </Button>
        </div>
      )}

      <footer className="p-4 border-t border-primary/20 bg-card/80 backdrop-blur-sm shrink-0 z-10">
        <div className="space-y-2 max-w-3xl mx-auto">
            <div className="flex items-center text-xs text-muted-foreground gap-2">
                <Timer className="h-4 w-4 text-primary" />
                <span>Session expires in: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</span>
            </div>
          <Progress value={progress} className="h-1 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-purple-500" />
          <form onSubmit={handleSendMessage} className="flex items-start gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your secure message..."
              className="flex-1 resize-none bg-input focus:ring-primary"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              disabled={!sessionActive || isSending}
              aria-label="Chat message input"
            />
            <Button type="submit" size="icon" disabled={!sessionActive || isSending || !inputValue.trim()} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}

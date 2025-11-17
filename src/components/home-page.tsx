"use client";

import { useRouter } from 'next/navigation';
import { useActionState, useState } from 'react';
import { ArrowRight, KeyRound, MessageSquarePlus, ShieldCheck } from 'lucide-react';
import { joinChat } from '@/lib/actions';
import { generateChatCode } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [state, formAction] = useActionState(joinChat, undefined);
  const { toast } = useToast();

  const handleCreateChat = () => {
    setIsCreating(true);
    const code = generateChatCode();
    toast({
      title: 'Generating secure room...',
      description: `Your new chat code is ${code}`,
    });
    setTimeout(() => {
      router.push(`/chat/${code}`);
    }, 1000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
      <div className="absolute inset-0 -z-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-background to-accent/10"></div>
      
      <Card className="w-full max-w-md z-10 bg-card/80 backdrop-blur-sm border-primary/20 shadow-primary/10 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <ShieldCheck className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              ShadowSpeak
            </h1>
          </div>
          <CardDescription className="text-muted-foreground">
            Ephemeral, secure chat for temporary, private conversations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button 
              onClick={handleCreateChat} 
              className="w-full h-12 text-lg font-semibold"
              disabled={isCreating}
            >
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              {isCreating ? 'Generating...' : 'Create Secure Chat'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Generate a unique, single-use code for a new chat session.</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Separator className="flex-1 bg-border" />
            <span className="text-xs text-muted-foreground uppercase">Or</span>
            <Separator className="flex-1 bg-border" />
          </div>
          
          <form action={formAction} className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                name="code"
                placeholder="Enter connection code..."
                className="pl-10 h-12 text-lg"
                required
                aria-label="Connection code"
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full h-12 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground">
              Join Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {state?.error?.code && <p className="text-sm text-destructive text-center">{state.error.code[0]}</p>}
          </form>
        </CardContent>
      </Card>
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground z-10">
        <p>&copy; {new Date().getFullYear()} ShadowSpeak. All rights dissolved after session expiry.</p>
      </footer>
    </main>
  );
}

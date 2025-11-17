import { ChatPage } from '@/components/chat-page';

type ChatRoomPageProps = {
  params: {
    chatId: string;
  };
};

export default function ChatRoomPage({ params }: ChatRoomPageProps) {
  return <ChatPage chatId={params.chatId} />;
}

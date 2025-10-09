import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ArrowLeft, History, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Guide {
  id: string;
  name: string;
  description: string;
  emoji: string;
  systemPrompt: string;
}

interface Conversation {
  id: string;
  userId: string;
  guideId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function GuidesWindow() {
  const { toast } = useToast();
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const { data: guidesData, isLoading: guidesLoading, error: guidesError } = useQuery<{ data: Guide[] }>({
    queryKey: ['/api/guides']
  });

  const { data: conversationsData } = useQuery<{ data: Conversation[] }>({
    queryKey: ['/api/conversations'],
    enabled: !!selectedGuide
  });

  if (guidesError) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <p className="text-destructive mb-2">Failed to load spiritual guides</p>
          <p className="text-sm text-muted-foreground">{String(guidesError)}</p>
        </div>
      </div>
    );
  }

  const { data: messagesData, isLoading: messagesLoading } = useQuery<{ data: Message[] }>({
    queryKey: activeConversation ? [`/api/conversations/${activeConversation.id}/messages`] : ['disabled'],
    enabled: !!activeConversation
  });

  const createConversationMutation = useMutation({
    mutationFn: async ({ guideId, guideName }: { guideId: string; guideName: string }) => {
      const res = await apiRequest('POST', '/api/conversations', { 
        guideId, 
        title: `Chat with ${guideName}` 
      });
      return res.json();
    },
    onSuccess: (result) => {
      setActiveConversation(result.data);
      setShowHistory(false);
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest('POST', `/api/conversations/${activeConversation?.id}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      if (activeConversation) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/conversations/${activeConversation.id}/messages`] 
        });
      }
      setMessageInput('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    }
  });

  const handleGuideSelect = (guide: Guide) => {
    setSelectedGuide(guide);
    setShowHistory(false);
    createConversationMutation.mutate({ guideId: guide.id, guideName: guide.name });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    if (selectedGuide) {
      createConversationMutation.mutate({ guideId: selectedGuide.id, guideName: selectedGuide.name });
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && activeConversation) {
      sendMessageMutation.mutate(messageInput);
    }
  };

  const handleBack = () => {
    setSelectedGuide(null);
    setActiveConversation(null);
    setShowHistory(false);
  };

  if (guidesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const guides = guidesData?.data || [];
  const conversations = conversationsData?.data || [];

  // Get conversation counts per guide
  const getConversationCount = (guideId: string) => {
    return conversations.filter(c => c.guideId === guideId).length;
  };

  // Guide selection view
  if (!selectedGuide) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Spiritual Guides</h2>
        <p className="text-sm text-muted-foreground">Choose a guide to start a conversation</p>
        <div className="grid grid-cols-2 gap-3">
          {guides.map(guide => {
            const count = getConversationCount(guide.id);
            return (
              <button
                key={guide.id}
                onClick={() => handleGuideSelect(guide)}
                data-testid={`button-guide-${guide.id}`}
                className="p-3 rounded-lg border border-border bg-card hover-elevate active-elevate-2 text-left"
              >
                <div className="text-2xl mb-1">{guide.emoji}</div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-foreground">{guide.name}</div>
                  {count > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="w-3 h-3" />
                      <span>{count}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{guide.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Get conversations for current guide
  const guideConversations = conversations.filter(c => c.guideId === selectedGuide.id);
  
  // Show history view
  if (showHistory) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => setShowHistory(false)} data-testid="button-back-to-chat">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Conversation History</h2>
            <p className="text-xs text-muted-foreground">{selectedGuide.emoji} {selectedGuide.name}</p>
          </div>
          <Button size="sm" onClick={handleNewConversation} data-testid="button-new-conversation">
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto space-y-2">
          {guideConversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            guideConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full p-3 rounded-lg border border-border text-left hover-elevate ${
                  activeConversation?.id === conv.id ? 'bg-primary/10 border-primary' : 'bg-card'
                }`}
                data-testid={`history-conversation-${conv.id}`}
              >
                <div className="text-sm font-medium text-foreground line-clamp-1">{conv.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }
  
  // Chat view
  const messages = messagesData?.data || [];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={handleBack} data-testid="button-back-to-guides">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">{selectedGuide.emoji} {selectedGuide.name}</h2>
          <p className="text-xs text-muted-foreground">{selectedGuide.description}</p>
        </div>
        {guideConversations.length > 0 && (
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => setShowHistory(true)}
            data-testid="button-show-history"
          >
            <History className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {messagesLoading || createConversationMutation.isPending ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto space-y-3 mb-3" data-testid="messages-container">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Start a conversation with your spiritual guide
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg max-w-[85%] ${
                      msg.role === 'user'
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                    data-testid={`message-${msg.role}-${msg.id}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))
              )}
              {sendMessageMutation.isPending && (
                <div className="p-3 rounded-lg bg-card border border-border max-w-[85%]">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask your spiritual guide..."
                disabled={sendMessageMutation.isPending}
                data-testid="input-guide-message"
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

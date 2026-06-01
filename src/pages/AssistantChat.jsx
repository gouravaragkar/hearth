import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Send, Bot, Sparkles } from 'lucide-react';
import MessageBubble from '@/components/AssistantMessageBubble';

export default function AssistantChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Start or load conversation
  useEffect(() => {
    const init = async () => {
      try {
        const convs = await base44.agents.listConversations({ agent_name: 'homespend_assistant' });
        let conv;
        if (convs && convs.length > 0) {
          conv = await base44.agents.getConversation(convs[0].id);
        } else {
          conv = await base44.agents.createConversation({
            agent_name: 'homespend_assistant',
            metadata: { name: 'My HomeSpend Chat' },
          });
        }
        setConversation(conv);
        setMessages(conv.messages || []);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !conversation) return;
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Bot size={32} className="animate-pulse text-primary" />
          <p className="text-sm">Starting your assistant…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full bg-background">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles size={18} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">HomeSpend Assistant</p>
          <p className="text-xs text-muted-foreground">Your friendly expense helper</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground pt-12">
            <span className="text-5xl">👋</span>
            <p className="font-medium text-foreground">Hi! I'm your HomeSpend Assistant.</p>
            <p className="text-sm max-w-xs">I can help you log expenses, check your spending, and keep you on budget. Just say something!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… e.g. 'Log $45 for groceries today'"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="rounded-xl shrink-0 h-10 w-10"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useHome } from '@/context/HomeContext';
import { useHomeData } from '@/hooks/useHomeData';
import { useQueryClient } from '@tanstack/react-query';
import { getMonthlyEquivalent } from '@/lib/utils';
import { Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'assistant_chat_messages';

const defaultMessages = [{
  role: 'assistant',
  content: `Hi! I'm your HomeSpend assistant 👋\n\nI can help you log expenses, check your spending, and answer questions about your finances.\n\nWhat would you like to do?`
}];

const SUGGESTIONS = [
  'Add $120 electricity bill',
  'How much did I spend this month?',
  'Add $800 monthly rent',
  'What are my recurring expenses?',
  'Add $50 groceries today',
];

export default function AssistantChat() {
  const { activeHome } = useHome();
  const { expenses, recurring, budgets, mutateShared } = useHomeData();
  const qc = useQueryClient();
  const [messages, setMessages] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const currency = activeHome?.currency || 'AUD';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const getHomeContext = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const thisMonthExpenses = expenses.filter(e =>
      e.date && isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
    );
    const totalSpent = thisMonthExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const recurringTotal = recurring.reduce((s, e) => s + getMonthlyEquivalent(e.amount, e.frequency), 0);
    const currentMonth = now.toISOString().slice(0, 7);
    const budget = budgets.find(b => b.month === currentMonth)?.amount || 0;

    return {
      homeName: activeHome?.name || 'My Home',
      currency,
      totalSpent: (totalSpent + recurringTotal).toFixed(2),
      budget,
      recurringCount: recurring.length,
    };
  };

  const handleAction = async (actionData) => {
    console.log('ACTION DATA:', JSON.stringify(actionData));
    try {
      if (actionData.action === 'create_expense') {
        const { type, ...expenseFields } = actionData.data;
        const expenseData = {
          ...expenseFields,
          home_id: activeHome?.id,
          currency,
        };
        await mutateShared('Expense', 'create', expenseData);
        qc.invalidateQueries({ queryKey: ['homeData'] });
        return '✅ Expense added successfully!';
      } else if (actionData.action === 'create_recurring') {
        await mutateShared('RecurringExpense', 'create', {
          ...actionData.data,
          home_id: activeHome?.id,
          currency,
          start_date: actionData.data.start_date || new Date().toISOString().slice(0, 10),
        });
        qc.invalidateQueries({ queryKey: ['homeData'] });
        return '✅ Recurring expense added successfully!';
      }
    } catch (e) {
      console.error('FULL ERROR:', JSON.stringify(e), e.message, e.code, e.details, e.hint);
      return '❌ Failed to add expense. Please try again.';
    }
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            homeContext: getHomeContext(),
          }),
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      let assistantContent = data.content;

      // Check if response contains a JSON action
      const jsonMatch = assistantContent.match(/\{[\s\S]*"action"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const actionData = JSON.parse(jsonMatch[0]);
          const actionResult = await handleAction(actionData);
          // Remove JSON from display text
          assistantContent = assistantContent.replace(jsonMatch[0], '').trim();
          if (actionResult) assistantContent += '\n' + actionResult;
        } catch (e) {
          console.error('Failed to parse action:', e);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);
    } catch (e) {
      console.error('Assistant error:', e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Something went wrong. Please try again.'
      }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setMessages(defaultMessages);
  };

  return (
    <div className="flex flex-col h-full pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles size={20} className="text-primary" /> AI Assistant
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Powered by Claude</p>
        </div>
        <Button variant="ghost" size="icon" onClick={clearChat} title="Clear chat">
          <Trash2 size={16} className="text-muted-foreground" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (show only at start) */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto shrink-0">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => sendMessage(s)}
              className="shrink-0 text-xs bg-muted hover:bg-muted/70 text-muted-foreground rounded-full px-3 py-1.5 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex gap-2 bg-card border border-border rounded-2xl px-4 py-2 shadow-warm-sm">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask me anything or log an expense..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="text-primary disabled:opacity-30 transition-opacity"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

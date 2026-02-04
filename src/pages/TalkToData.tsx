import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useRequests } from '@/hooks/useRequests';
import { groups } from '@/data/mockData';
import { categoryLabels, priorityLabels } from '@/types/requests';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function TalkToData() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu assistente de dados. Posso responder perguntas sobre suas solicitações, grupos e estatísticas. Experimente perguntar:\n\n• Quantas solicitações temos?\n• Quais são os grupos ativos?\n• Quais solicitações são de alta prioridade?\n• Qual categoria tem mais solicitações?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { requests, resolvedIds, archivedIds } = useRequests();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const activeRequests = requests.filter(r => !archivedIds.has(r.id));
  const resolvedRequests = requests.filter(r => resolvedIds.has(r.id));

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();

    // Total requests
    if (q.includes('quantas solicitações') || q.includes('total de solicitações') || q.includes('número de solicitações')) {
      return `Temos **${requests.length} solicitações** no total:\n• ${activeRequests.length} ativas\n• ${archivedIds.size} arquivadas\n• ${resolvedIds.size} resolvidas`;
    }

    // Groups
    if (q.includes('grupos') || q.includes('condomínios')) {
      const activeGroups = groups.filter(g => g.isActive);
      const inactiveGroups = groups.filter(g => !g.isActive);
      return `Temos **${groups.length} grupos** cadastrados:\n\n**Ativos (${activeGroups.length}):**\n${activeGroups.map(g => `• ${g.name}: ${g.requestCount} solicitações, ${g.members.length} membros`).join('\n')}\n\n**Inativos (${inactiveGroups.length}):**\n${inactiveGroups.map(g => `• ${g.name}`).join('\n')}`;
    }

    // High priority
    if (q.includes('alta prioridade') || q.includes('urgente') || q.includes('prioridade alta')) {
      const highPriority = activeRequests.filter(r => r.priority === 'high');
      if (highPriority.length === 0) {
        return 'Não há solicitações de alta prioridade ativas no momento. 🎉';
      }
      return `Temos **${highPriority.length} solicitações de alta prioridade**:\n\n${highPriority.map(r => `• **${categoryLabels[r.category]}** - ${r.groupName}: "${r.message.substring(0, 50)}..."`).join('\n')}`;
    }

    // Low priority
    if (q.includes('baixa prioridade') || q.includes('prioridade baixa')) {
      const lowPriority = activeRequests.filter(r => r.priority === 'low');
      return `Temos **${lowPriority.length} solicitações de baixa prioridade** ativas.`;
    }

    // Categories
    if (q.includes('categoria') || q.includes('tipo de solicitação') || q.includes('categorias')) {
      const categoryCount = activeRequests.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
      const topCategory = sorted[0];
      
      return `**Distribuição por categoria:**\n\n${sorted.map(([cat, count]) => `• ${categoryLabels[cat as keyof typeof categoryLabels]}: ${count} solicitações`).join('\n')}\n\nA categoria com mais solicitações é **${categoryLabels[topCategory[0] as keyof typeof categoryLabels]}** com ${topCategory[1]} solicitações.`;
    }

    // Resolved
    if (q.includes('resolvidas') || q.includes('resolvidos') || q.includes('concluídas')) {
      return `Temos **${resolvedIds.size} solicitações marcadas como resolvidas** de um total de ${requests.length}.`;
    }

    // Archived
    if (q.includes('arquivadas') || q.includes('arquivados')) {
      return `Temos **${archivedIds.size} solicitações arquivadas**.`;
    }

    // Members/participants
    if (q.includes('membros') || q.includes('participantes') || q.includes('pessoas')) {
      const totalMembers = groups.reduce((acc, g) => acc + g.members.length, 0);
      return `Temos **${totalMembers} membros** distribuídos em ${groups.length} grupos:\n\n${groups.map(g => `• ${g.name}: ${g.members.length} membros`).join('\n')}`;
    }

    // Specific group
    for (const group of groups) {
      if (q.includes(group.name.toLowerCase())) {
        const groupRequests = activeRequests.filter(r => r.groupId === group.id);
        return `**${group.name}**:\n• ${group.members.length} membros\n• ${groupRequests.length} solicitações ativas\n• Status: ${group.isActive ? 'Ativo ✅' : 'Inativo ⚪'}\n\n**Membros mais ativos:**\n${group.members.sort((a, b) => b.participationCount - a.participationCount).slice(0, 3).map(m => `• ${m.name}: ${m.participationCount} participações`).join('\n')}`;
      }
    }

    // Specific category
    for (const [key, label] of Object.entries(categoryLabels)) {
      if (q.includes(label.toLowerCase())) {
        const catRequests = activeRequests.filter(r => r.category === key);
        if (catRequests.length === 0) {
          return `Não há solicitações ativas na categoria **${label}**.`;
        }
        return `Temos **${catRequests.length} solicitações** na categoria **${label}**:\n\n${catRequests.map(r => `• ${r.groupName} - ${r.senderName}: "${r.message.substring(0, 40)}..."`).join('\n')}`;
      }
    }

    // Default response
    return 'Desculpe, não entendi sua pergunta. Tente perguntar sobre:\n\n• Número de solicitações\n• Grupos e membros\n• Solicitações por prioridade\n• Categorias de solicitações\n• Nome de um grupo específico';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const response = generateResponse(input);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fale com seus Dados</h1>
            <p className="text-sm text-muted-foreground">Pergunte sobre solicitações, grupos e estatísticas</p>
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

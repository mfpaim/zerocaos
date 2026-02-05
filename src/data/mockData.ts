import { Request, Group, GroupMember, Category, RequestType, Status, categoryPriority, priorityScores } from '@/types/requests';

// Helper to create members
const createMembers = (groupId: string): GroupMember[] => {
  const memberNames: Record<string, string[]> = {
    '1': ['Dona Gigi', 'Sra. Helena', 'Marta', 'Seu Antônio', 'Roberto Silva', 'Ana Maria', 'Carlos Eduardo', 'Fernanda Costa'],
    '2': ['Sr. Carlos', 'Fernando', 'Giulia', 'Luciana', 'Pedro Henrique', 'Mariana Lima', 'João Victor'],
    '3': ['Maria Clara', 'Ana Paula', 'Pedro', 'Ricardo', 'Beatriz Santos', 'Lucas Oliveira', 'Camila Souza', 'Rafael Martins', 'Julia Pereira'],
    '4': ['João Pedro', 'Roberto', 'Carla', 'Silvia', 'Eduardo Costa', 'Patricia Lima'],
    '5': ['Marcos', 'Renata', 'Bruno Alves', 'Sandra Rocha', 'Thiago Mendes'],
  };

  const names = memberNames[groupId] || [];
  return names.map((name, index) => ({
    id: `${groupId}-member-${index + 1}`,
    name,
    participationCount: Math.floor(Math.random() * 15) + 1,
    lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  }));
};

export const groups: Group[] = [
  { id: '1', name: 'Condomínio Garbins', requestCount: 5, isActive: true, members: createMembers('1') },
  { id: '2', name: 'Condomínio Moreno', requestCount: 4, isActive: true, members: createMembers('2') },
  { id: '3', name: 'Residencial Aurora', requestCount: 3, isActive: true, members: createMembers('3') },
  { id: '4', name: 'Edifício Central', requestCount: 4, isActive: true, members: createMembers('4') },
  { id: '5', name: 'Vila das Flores', requestCount: 2, isActive: false, members: createMembers('5') },
];

const createRequest = (
  id: string,
  groupId: string,
  groupName: string,
  senderName: string,
  message: string,
  category: Category,
  daysAgo: number = 0,
  hoursAgo: number = 0,
  requestType: RequestType = 'solicitacao',
  status: Status = 'pendente'
): Request => {
  const priority = categoryPriority[category];
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() - daysAgo);
  timestamp.setHours(timestamp.getHours() - hoursAgo);
  
  return {
    id,
    groupId,
    groupName,
    senderName,
    message,
    category,
    priority,
    priorityScore: priorityScores[priority],
    timestamp,
    messageLink: `https://wa.me/group/${groupId}/message/${id}`,
    isResolved: false,
    requestType,
    status,
  };
};

export const requests: Request[] = [
  // Alta prioridade
  createRequest('1', '1', 'Condomínio Garbins', 'Dona Gigi', 'Estou presa no elevador, socorro! O elevador parou no 5º andar e não abre a porta!', 'elevador', 0, 1, 'reclamacao'),
  createRequest('2', '2', 'Condomínio Moreno', 'Sr. Carlos', 'Urgente! Vazamento de água no apartamento 302, está descendo água pelo teto do 202!', 'agua', 0, 2, 'reclamacao'),
  createRequest('3', '3', 'Residencial Aurora', 'Maria Clara', 'Gente, estou sentindo um cheiro forte de gás no corredor do 3º andar. Alguém mais sentiu?', 'gas', 0, 3, 'reclamacao'),
  createRequest('4', '4', 'Edifício Central', 'João Pedro', 'O portão da garagem não está fechando! Já são 23h e qualquer pessoa pode entrar.', 'portao', 0, 4, 'reclamacao'),
  createRequest('5', '1', 'Condomínio Garbins', 'Sra. Helena', 'O elevador de serviço está fazendo um barulho estranho e travando. Melhor verificar antes que pare de vez.', 'elevador', 0, 6, 'solicitacao'),
  
  // Média prioridade
  createRequest('6', '2', 'Condomínio Moreno', 'Fernando', 'Tem duas luzes queimadas no corredor do 4º andar. Está muito escuro à noite.', 'iluminacao', 1, 2, 'solicitacao'),
  createRequest('7', '3', 'Residencial Aurora', 'Ana Paula', 'O vizinho do 501 está com som alto de novo. Já passa das 22h e não consigo dormir!', 'barulho', 1, 4, 'reclamacao'),
  createRequest('8', '4', 'Edifício Central', 'Roberto', 'A lâmpada do hall de entrada está piscando faz 3 dias. Pode causar mal-estar.', 'iluminacao', 1, 8, 'solicitacao'),
  createRequest('9', '1', 'Condomínio Garbins', 'Marta', 'O cachorro do 202 não para de latir durante a madrugada. Já faz uma semana assim.', 'barulho', 2, 3, 'reclamacao'),
  
  // Baixa prioridade
  createRequest('10', '2', 'Condomínio Moreno', 'Giulia', 'Minha gata fugiu! Ela é cinza com manchas brancas, atende por Mimi. Se alguém ver, me avisa?', 'animais', 2, 5, 'solicitacao'),
  createRequest('11', '3', 'Residencial Aurora', 'Pedro', 'Alguém sujou minha vaga de garagem com óleo. Gostaria de saber quem foi.', 'limpeza', 2, 12, 'reclamacao'),
  createRequest('12', '4', 'Edifício Central', 'Carla', 'O boleto do condomínio não chegou esse mês. Como faço para solicitar a 2ª via?', 'boleto', 3, 2, 'solicitacao'),
  createRequest('13', '1', 'Condomínio Garbins', 'Seu Antônio', 'Meu cachorro Rex escapou do apartamento. Ele é um labrador dourado, muito dócil.', 'animais', 3, 6, 'solicitacao'),
  createRequest('14', '2', 'Condomínio Moreno', 'Luciana', 'Tem muito lixo acumulado na área de descarte. Está atraindo baratas.', 'limpeza', 3, 10, 'reclamacao'),
  createRequest('15', '3', 'Residencial Aurora', 'Ricardo', 'Gostaria de saber quando vai ser feita a taxa extra para pintura. Não recebi informação.', 'boleto', 4, 3, 'solicitacao'),
  createRequest('16', '4', 'Edifício Central', 'Silvia', 'Encontrei um gatinho abandonado na escada. Alguém perdeu ou quer adotar?', 'animais', 4, 7, 'solicitacao'),
  createRequest('17', '5', 'Vila das Flores', 'Marcos', 'A área de churrasqueira precisa de uma limpeza geral. Está bem suja.', 'limpeza', 5, 2, 'sugestao'),
  createRequest('18', '5', 'Vila das Flores', 'Renata', 'Sobre o boleto atrasado, já paguei mas continua constando em aberto no sistema.', 'boleto', 5, 8, 'reclamacao'),
];

// Dados para gráficos
export const getRequestsByDay = () => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
  });

  const countsByDay = last7Days.map((day, index) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (6 - index));
    const count = requests.filter(r => {
      const reqDate = new Date(r.timestamp);
      return reqDate.toDateString() === targetDate.toDateString();
    }).length;
    return { day, count };
  });

  return countsByDay;
};

export const getRequestsByCategory = () => {
  const categories = requests.reduce((acc, req) => {
    acc[req.category] = (acc[req.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categories).map(([category, count]) => ({
    category,
    count,
  }));
};
export type Priority = 'high' | 'medium' | 'low';

export type Category = 
  | 'elevador' 
  | 'agua' 
  | 'gas' 
  | 'portao' 
  | 'iluminacao' 
  | 'barulho' 
  | 'boleto' 
  | 'animais' 
  | 'limpeza' 
  | 'outros';

export type RequestType = 'reclamacao' | 'sugestao' | 'solicitacao';

export type Status = 'pendente' | 'em_andamento' | 'respondido' | 'resolvido';

export interface Request {
  id: string;
  groupId: string;
  groupName: string;
  senderName: string;
  message: string;
  category: Category;
  priority: Priority;
  priorityScore: number;
  timestamp: Date;
  messageLink: string;
  isResolved: boolean;
  requestType: RequestType;
  status: Status;
  resolvedBy?: string;
  resolvedAt?: Date;
  statusComments?: Partial<Record<Status, string[]>>;
}

export interface GroupMember {
  id: string;
  name: string;
  participationCount: number;
  lastActivity: Date;
}

export interface Group {
  id: string;
  name: string;
  requestCount: number;
  isActive: boolean;
  members: GroupMember[];
}

export const categoryLabels: Record<Category, string> = {
  elevador: 'Elevador',
  agua: 'Água',
  gas: 'Gás',
  portao: 'Portão',
  iluminacao: 'Iluminação',
  barulho: 'Barulho',
  boleto: 'Boleto',
  animais: 'Animais',
  limpeza: 'Limpeza',
  outros: 'Outros',
};

export const priorityLabels: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export const requestTypeLabels: Record<RequestType, string> = {
  reclamacao: 'Reclamação',
  sugestao: 'Sugestão',
  solicitacao: 'Solicitação',
};

export const statusLabels: Record<Status, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  respondido: 'Respondido',
  resolvido: 'Resolvido',
};

export const categoryKeywords: Record<Category, string[]> = {
  elevador: ['elevador', 'presa', 'parado', 'travado'],
  agua: ['vazamento', 'água', 'torneira', 'cano', 'alagado', 'inundação'],
  gas: ['gás', 'cheiro de gás', 'vazamento de gás'],
  portao: ['portão', 'não fecha', 'travado', 'portaria'],
  iluminacao: ['luz', 'lâmpada', 'escuro', 'queimada', 'apagada'],
  barulho: ['barulho', 'festa', 'som alto', 'música', 'cachorro latindo'],
  boleto: ['boleto', 'pagamento', 'taxa', 'condomínio', 'cobrança'],
  animais: ['gato', 'cachorro', 'fugiu', 'animal', 'pet'],
  limpeza: ['sujeira', 'lixo', 'garagem', 'sujo', 'limpar'],
  outros: [],
};

export const categoryPriority: Record<Category, Priority> = {
  elevador: 'high',
  agua: 'high',
  gas: 'high',
  portao: 'high',
  iluminacao: 'medium',
  barulho: 'medium',
  boleto: 'low',
  animais: 'low',
  limpeza: 'low',
  outros: 'medium',
};

export const priorityScores: Record<Priority, number> = {
  high: 100,
  medium: 50,
  low: 10,
};

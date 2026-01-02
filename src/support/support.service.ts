// support.service.ts
import { Injectable } from '@nestjs/common';
import { SupportRepository } from '@src/support/repository/support.repository';

const MAX_CHATS_PER_AGENT = 5;

@Injectable()
export class SupportService {
  // in-memory live agent state
  private activeAgents = new Map<
    string,
    { socketId: string; activeChats: number }
  >();

  constructor(private supportRepository: SupportRepository) {}

  registerAgent(agentId: string, socketId: string) {
    this.activeAgents.set(agentId, {
      socketId,
      activeChats: 0,
    });
  }

  unregisterAgent(agentId: string) {
    this.activeAgents.delete(agentId);
  }

  async startConversation(patientId: string) {
    return this.supportRepository.createConversation(patientId);
  }

  findAvailableAgent() {
    return [...this.activeAgents.entries()]
      .map(([agentId, data]) => ({ agentId, ...data }))
      .filter((a) => a.activeChats < MAX_CHATS_PER_AGENT)
      .sort((a, b) => a.activeChats - b.activeChats)[0];
  }

  async assignAgentIfPossible(conversationId: string) {
    const agent = this.findAvailableAgent();
    if (!agent) return null;

    await this.supportRepository.assignAgent(conversationId, agent.agentId);
    agent.activeChats++;

    return agent;
  }

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: 'agent' | 'patient';
    content: string;
  }) {
    return this.supportRepository.saveMessage(data);
  }

  async getMessages(conversationId: string) {
    return this.supportRepository.getMessages(conversationId);
  }
}

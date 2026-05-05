import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { v4 as uuidv4 } from 'uuid';
import { ChatbotRepository } from './repository/chatbot.repository';
import { SendMessageDto } from './dto/send-message-dto';

@Injectable()
export class ChatbotService {
  private groq: Groq;

  constructor(private readonly chatbotRepository: ChatbotRepository) {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  async sendMessage(patientId: string, dto: SendMessageDto) {
    const sessionId = dto.sessionId ?? uuidv4(); // new session if none provided

    // 1. save patient message
    await this.chatbotRepository.saveMessage({
      patientId,
      sessionId,
      role: 'user',
      content: dto.message,
    });

    // 2. pull session history
    const history = await this.chatbotRepository.getSessionMessages(sessionId);

    // 3. send to Groq
    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful medical assistant for Jiggy Care, a telemedicine platform. 
          Help patients understand their symptoms, provide general health guidance, 
          and recommend they consult a doctor when necessary. 
          Never diagnose or prescribe medication. Always be empathetic and professional.`,
        },
        ...history.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = response.choices[0].message.content ?? '';
  


    // 4. save assistant response
    await this.chatbotRepository.saveMessage({
      patientId,
      sessionId,
      role: 'assistant',
      content: reply,
    });

    return { sessionId, reply };
  }

  async getSessionHistory(sessionId: string) {
    return this.chatbotRepository.getSessionMessages(sessionId);
  }

  async getPatientSessions(patientId: string) {
    return this.chatbotRepository.getPatientSessions(patientId);
  }
}

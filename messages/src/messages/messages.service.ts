import { Injectable } from '@nestjs/common';
import { MessageRepository } from './messages.repository';

// Service = business logic layer. Here it is a thin facade that just
// forwards to the repository; in a real app validation, authorization,
// and business rules would live here. It depends on the repository via
// constructor DI (private parameter -> injected provider).
@Injectable()
export class MessageService {
  constructor(private messageRepository: MessageRepository) {}

  async findAll() {
    return this.messageRepository.findAll();
  }

  async findOne(id: string) {
    return this.messageRepository.findOne(id);
  }

  async create(content: string) {
    return this.messageRepository.create(content);
  }
}

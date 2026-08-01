import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessageService } from './messages.service';
import { MessageRepository } from './messages.repository';

@Module({
  controllers: [MessagesController],
  providers: [MessageService, MessageRepository],
})
export class MessagesModule {}

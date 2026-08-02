import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessageService } from './messages.service';
import { MessageRepository } from './messages.repository';

// Root module of the "messages" project. It wires the three classic Nest
// layers — controller (HTTP) -> service (logic) -> repository (persistence) —
// by simply listing them. Nest constructs the dependency chain via the
// constructor parameters of each provider (DI); no explicit wiring needed.
@Module({
  controllers: [MessagesController],
  providers: [MessageService, MessageRepository],
})
export class MessagesModule {}

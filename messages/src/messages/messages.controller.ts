import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dtos/create-message.dto';
import { MessageService } from './messages.service';

// Controller = HTTP concern only: parse the request (params, body via DTO),
// delegate to the service, translate service results into HTTP statuses.
// `public` on the constructor makes DI explicit and lets the spec test
// reach the instance (dependency is NOT private here, unlike the service).
@Controller('messages')
export class MessagesController {
  constructor(public messageService: MessageService) {}

  @Get()
  // GET /messages -> all stored messages as a JSON object.
  listMessages() {
    return this.messageService.findAll();
  }

  @Post()
  // POST /messages -> body is validated against CreateMessageDto by the
  // global ValidationPipe (main.ts), then only `content` is passed down.
  // Returns 201 with an empty body (see service).
  createMessage(@Body() body: CreateMessageDto) {
    return this.messageService.create(body.content);
  }

  @Get('/:id')
  // GET /messages/:id -> a single message by string id. The repository keeps
  // ids as object keys, so the param is a string (no Number() coercion).
  // 404 is the controller's job: it knows HTTP, the service stays generic.
  async getMessage(@Param('id') id: string) {
    const message = await this.messageService.findOne(id);

    if (!message) {
      throw new NotFoundException(`Message ${id} not found`);
    }

    return message;
  }
}

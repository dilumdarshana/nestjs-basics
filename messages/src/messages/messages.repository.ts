import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';

// Repository = the ONLY layer allowed to touch persistence. Here the "db"
// is a plain JSON file (messages.json), read/written with fs/promises.
// NOTE: './messages.json' is a relative path resolved against the process
// working directory, so `pnpm start:dev` must be run from this project folder.
// The file format is a flat object keyed by string id:
//   { "12": { "id": 12, "content": "hello" }, ... }
@Injectable()
export class MessageRepository {
  // Returns the whole store. The declared return type is wrong on purpose in
  // the original code (Promise<{ content: string[] }> — a typo); it actually
  // resolves to the full parsed JSON record.
  async findAll(): Promise<Record<string, { id: number; content: string }>> {
    const contents = await readFile('./messages.json', 'utf8');
    const messages = JSON.parse(contents);

    return messages;
  }

  // Returns a single message by string id (the JSON object key). If the id
  // is missing, JSON.parse lookup yields `undefined` — the controller turns
  // that into a 404.
  async findOne(id: string): Promise<{ id: number; content: string }> {
    const contents = await readFile('./messages.json', 'utf-8');
    const messages = JSON.parse(contents);

    return messages[id];
  }

  // Creates a message with a random numeric id, writes the whole store back
  // to disk, and returns nothing -> the controller answers 201 with an empty
  // body. Known trade-off: Math.random() can collide and silently overwrite
  // an existing entry.
  async create(content: string) {
    const contents = await readFile('./messages.json', 'utf8');
    const messages = JSON.parse(contents);

    const id = Math.floor(Math.random() * 999);

    messages[id] = { id, content };

    await writeFile('./messages.json', JSON.stringify(messages));
  }
}

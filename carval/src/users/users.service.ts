import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  create(email: string, password: string) {
    // without .create method, we can call .save straight away.
    // but, in that case, it doesn't create Entity instance. So, any
    // hooks or listeners won't be triggered.
    //
    // repo.create() builds a plain Entity instance (runs column defaults,
    // hooks like @AfterInsert won't fire until save()); save() then inserts.
    // NOTE: the entity's default admin=true applies here on insert.
    const user = this.repo.create({ email, password });

    return this.repo.save(user);
  }

  findOne(id: number) {
    return !id ? null : this.repo.findOneBy({ id });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async update(id: number, attr: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found!!!');
    }

    // merge into a NEW object rather than mutating the entity — avoids
    // triggering @BeforeUpdate hooks unnecessarily and keeps the update
    // explicit. save() then does an UPDATE (id already exists).
    const newUser = { ...user, ...attr };

    return this.repo.save(newUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    // remove() needs the full entity (to know the PK); if not found it
    // would throw — findOne returns null only when id is falsy.
    return this.repo.remove(user);
  }
}

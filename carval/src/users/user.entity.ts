import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Report } from '../reports/report.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  // NOTE: every new user is an admin by default (tutorial decision) — change
  // the column default for real use (README Gotchas).
  admin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  // TypeORM lifecycle hooks fire on repo.save()/remove() when the record is
  // actually an Entity instance (see UsersService.create — why it uses
  // repo.create() first). These log examples demonstrate the hook ordering.
  @AfterInsert()
  logInsert() {
    console.log('Inserted User with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated User with id', this.id);
  }

  @AfterRemove()
  logRemove() {
    console.log('Removed User with id', this.id);
  }
}

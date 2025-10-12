import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'findOneByEmail')
  findOneByEmail(data: { email: string }) {
    return this.usersService.findOneByEmail(data.email);
  }

  @GrpcMethod('UserService', 'findOneById')
  findOneById(data: { id: string }) {
    return this.usersService.findOneById(data.id);
  }

  @GrpcMethod('UserService', 'createOne')
  createOne(data: { name: string; email: string; passwordHash: string }) {
    return this.usersService.createOne(data);
  }

  @GrpcMethod('UserService', 'verifyOne')
  verifyOne(data: { userId: string }) {
    return this.usersService.verifyOne(data.userId);
  }
}

import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersDAO } from './dao/users.dao';
import { toTimestamp } from 'src/common/util/googleTimestamp';

@Injectable()
export class UsersService {
  constructor(private readonly usersDao: UsersDAO) {}
    async findOneByEmail(email: string): Promise<Omit<User, 'createdAt' | 'updatedAt'> & { createdAt: google.protobuf.Timestamp; updatedAt: google.protobuf.Timestamp } | null> {
        const user = await this.usersDao.findOneByEmail(email);
        if(!user) return null;
        return {
            ...user,
            createdAt: toTimestamp(user.createdAt),
            updatedAt: toTimestamp(user.updatedAt),
        };
    }

    async findOneById(id: string): Promise<(Omit<any, 'passwordHash'> & { createdAt: google.protobuf.Timestamp; updatedAt: google.protobuf.Timestamp }) | null> {
        const user = await this.usersDao.findOneById(id);
        if(!user) return null;
        return {
            ...user,
            createdAt: toTimestamp(user.createdAt),
            updatedAt: toTimestamp(user.updatedAt),
        };
    }

    async createOne(user: {name: string, email: string, passwordHash: string}): Promise<Omit<User, 'passwordHash'>> {
        return await this.usersDao.createOne(user);
    }

    async verifyOne(userId: string){
        return await this.usersDao.verifyOne(userId);
    }
}
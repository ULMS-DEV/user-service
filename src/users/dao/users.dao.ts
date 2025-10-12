import { Injectable } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UsersDAO {
    constructor(private readonly prisma: PrismaService) {}

    async findOneByEmail(email: string): Promise<User & { role: Omit<Role, 'createdAt' | 'updatedAt'> | null } | null> {
        return await this.prisma.user.findUnique({
            where: { email },
            include: {
                role: {
                    omit: {
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
    }

    async findOneById(id: string): Promise<(Omit<User & { role: Omit<Role, 'createdAt' | 'updatedAt'> | null }, 'passwordHash'>) | null> {
        return await this.prisma.user.findUnique({ 
            where: { id }, 
            omit: {
                passwordHash: true 
            },
            include: {
                role: {
                    omit: {
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },
        });
    }

    async createOne(user: {name: string, email: string, passwordHash: string}): Promise<Omit<User & { role: Omit<Role, 'createdAt' | 'updatedAt'> | null }, 'passwordHash'>> {
        const userRole = await this.prisma.role.findFirst({
            where: {
                name: 'USER'
            }
        });

        if(!userRole) throw new Error('User role not found');

        return await this.prisma.user.create({
            data: {
                ...user,
                isActive: false,
                role: {
                    connect: {
                        id: userRole.id
                    }
                }
            },
            omit: {
                passwordHash: true,
            },
            include: {
                role: {
                    omit: {
                        createdAt: true,
                        updatedAt: true
                    }
                }
            },
        })
    }

    async verifyOne(userId: string){
        return await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isActive: true
            }
        })
    }
}
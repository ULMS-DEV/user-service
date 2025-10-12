import { PrismaClient } from "@prisma/client";
import * as argon2 from 'argon2';
import { ROLE_MASKS } from "ulms-contracts";

const prisma = new PrismaClient();

async function main() {
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: { permsMask: BigInt(ROLE_MASKS.ADMIN.toString()) },
        create: { name: 'ADMIN', permsMask: BigInt(ROLE_MASKS.ADMIN.toString()) },
    });

    const staffRole = await prisma.role.upsert({
        where: { name: 'STAFF' },
        update: { permsMask: BigInt(ROLE_MASKS.STAFF.toString()) },
        create: { name: 'STAFF', permsMask: BigInt(ROLE_MASKS.STAFF.toString()) },
    });

    const userRole = await prisma.role.upsert({
        where: { name: 'USER' },
        update: { permsMask: BigInt(ROLE_MASKS.USER.toString()) },
        create: { name: 'USER', permsMask: BigInt(ROLE_MASKS.USER.toString()) },
    });

    await prisma.user.upsert({
      where: {email: "admin@email.com"},
      update: {},
      create: {
        email: "admin@email.com",
        name: "Admin",
        passwordHash: await argon2.hash("123"),
        roleId: adminRole.id
      }
    })

    await prisma.user.upsert({
      where: {email: "staff@email.com"},
      update: {},
      create: {
        email: "staff@email.com",
        name: "Staff",
        passwordHash: await argon2.hash("123"),
        roleId: staffRole.id
      }
    })

    await prisma.user.upsert({
      where: {email: "user@email.com"},
      update: {},
      create: {
        email: "user@email.com",
        name: "User",
        passwordHash: await argon2.hash("123"),
        roleId: userRole.id
      }
    })
}

main().finally(() => prisma.$disconnect())
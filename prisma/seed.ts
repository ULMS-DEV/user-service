import { PrismaClient, StudentLevel } from '@prisma/client';
import * as argon2 from 'argon2';
import { ROLE_MASKS } from 'ulms-contracts';
import { LEGACY_SEED_PREFIX, SEED_IDS } from '../../../docker/presentation-seed-ids';

const prisma = new PrismaClient();
const PASSWORD = 'Presentation123!';

async function main() {
  await prisma.student.deleteMany({
    where: { userId: { startsWith: LEGACY_SEED_PREFIX } },
  });
  await prisma.professor.deleteMany({
    where: { userId: { startsWith: LEGACY_SEED_PREFIX } },
  });
  await prisma.user.deleteMany({
    where: { id: { startsWith: LEGACY_SEED_PREFIX } },
  });

  const passwordHash = await argon2.hash(PASSWORD);

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { permsMask: ROLE_MASKS.ADMIN },
    create: { name: 'ADMIN', permsMask: ROLE_MASKS.ADMIN },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: { permsMask: ROLE_MASKS.STAFF },
    create: { name: 'STAFF', permsMask: ROLE_MASKS.STAFF },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: { permsMask: ROLE_MASKS.STUDENT },
    create: { name: 'STUDENT', permsMask: ROLE_MASKS.STUDENT },
  });

  await prisma.user.upsert({
    where: { id: SEED_IDS.users.admin },
    update: { isActive: true },
    create: {
      id: SEED_IDS.users.admin,
      email: 'admin@digitopia.edu',
      name: 'Alex Admin',
      passwordHash,
      isActive: true,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { id: SEED_IDS.users.professor },
    update: { isActive: true, roleId: staffRole.id },
    create: {
      id: SEED_IDS.users.professor,
      email: 'prof.cs@digitopia.edu',
      name: 'Dr. Sarah Chen',
      passwordHash,
      isActive: true,
      roleId: staffRole.id,
    },
  });
  await prisma.professor.upsert({
    where: { userId: SEED_IDS.users.professor },
    update: { title: 'Associate Professor', departmentCode: 'CS' },
    create: {
      userId: SEED_IDS.users.professor,
      title: 'Associate Professor',
      departmentCode: 'CS',
    },
  });

  const students = [
    {
      id: SEED_IDS.users.student1,
      email: 'alice.cs@digitopia.edu',
      name: 'Alice Nguyen',
      studentNumber: 'CS-2024-001',
    },
    {
      id: SEED_IDS.users.student2,
      email: 'bob.cs@digitopia.edu',
      name: 'Bob Martinez',
      studentNumber: 'CS-2024-002',
    },
    {
      id: SEED_IDS.users.student3,
      email: 'carol.cs@digitopia.edu',
      name: 'Carol Okonkwo',
      studentNumber: 'CS-2024-003',
    },
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where: { id: s.id },
      update: { isActive: true, roleId: studentRole.id },
      create: {
        id: s.id,
        email: s.email,
        name: s.name,
        passwordHash,
        isActive: true,
        roleId: studentRole.id,
      },
    });
    await prisma.student.upsert({
      where: { userId: s.id },
      update: { studentNumber: s.studentNumber, major: 'Computer Science' },
      create: {
        userId: s.id,
        studentNumber: s.studentNumber,
        level: StudentLevel.undergrad,
        major: 'Computer Science',
      },
    });
  }

  console.log('User service seeded (CS presentation data).');
  console.log('Login accounts (password for all):', PASSWORD);
  console.log('  admin@digitopia.edu');
  console.log('  prof.cs@digitopia.edu');
  console.log('  alice.cs@digitopia.edu / bob.cs@digitopia.edu / carol.cs@digitopia.edu');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

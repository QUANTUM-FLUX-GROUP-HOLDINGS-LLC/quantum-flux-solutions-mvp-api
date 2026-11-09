import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const groups = await prisma.dispute.groupBy({ by: ['status'], _count: true });
console.log(JSON.stringify(groups, null, 2));
await prisma.$disconnect();

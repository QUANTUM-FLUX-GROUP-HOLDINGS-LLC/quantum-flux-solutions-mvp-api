import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);
  
  const users = [
    // Staff Members
    { email: 'admin@test.com', name: 'Admin User', role: 'ADMIN' },
    { email: 'credit@test.com', name: 'Credit User', role: 'CREDIT_REPAIR' },
    { email: 'tax@test.com', name: 'Tax User', role: 'TAX_PERSONAL' },
    { email: 'business@test.com', name: 'Business Owner User', role: 'TAX_BUSINESS' },
    { email: 'bookkeeper@test.com', name: 'Bookkeeper User', role: 'BOOKKEEPING' },
    // Real Clients
    { email: 'client1@test.com', name: 'John Doe', role: 'CLIENT' },
    { email: 'client2@test.com', name: 'Jane Smith', role: 'CLIENT' },
  ];

  for (const u of users) {
    await prisma.customer.upsert({
      where: { email: u.email },
      update: { role: u.role, name: u.name }, // Force update role if user exists
      create: { ...u, password },
    });
  }
  console.log('✅ Seed completed: Test users and clients created.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

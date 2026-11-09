import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const seeds = [
  {
    bureau: 'Equifax',
    title: 'Equifax Dispute Letter',
    content: 'To Whom It May Concern,\n\nI am writing to dispute the following information in my file. The items I dispute are also encircled on the attached copy of the report I received.\n\nThis item is inaccurate. I am requesting that you investigate this matter and remove the inaccurate information.\n\nSincerely,\n[CLIENT NAME]',
  },
  {
    bureau: 'Experian',
    title: 'Experian Dispute Letter',
    content: 'To Whom It May Concern,\n\nI am writing to dispute the following information in my file.\n\nThis item is inaccurate. I am requesting that you investigate this matter and remove the inaccurate information.\n\nSincerely,\n[CLIENT NAME]',
  },
  {
    bureau: 'TransUnion',
    title: 'TransUnion Dispute Letter',
    content: 'To Whom It May Concern,\n\nI am writing to dispute the following information in my file.\n\nThis item is inaccurate. I am requesting that you investigate this matter and remove the inaccurate information.\n\nSincerely,\n[CLIENT NAME]',
  },
];

for (const t of seeds) {
  await p.letterTemplate.upsert({ where: { bureau: t.bureau }, update: {}, create: t });
}
console.log('Seeded:', seeds.length, 'letter templates');
await p.$disconnect();

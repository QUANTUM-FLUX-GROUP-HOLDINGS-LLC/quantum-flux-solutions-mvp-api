// Read-only audit of uploads consistency. Reports counts and detail,
// never deletes anything. Run: node audit-uploads.mjs
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const docs = await prisma.document.findMany();
console.log(`Document rows in DB: ${docs.length}`);

const mock = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_URL.includes('dummy');
if (!mock) {
  console.log('Real Supabase storage configured; disk audit skipped.');
} else {
  const dir = path.join(process.cwd(), 'uploads');
  // Mock mode flattens storagePath onto the disk (slashes become underscores).
  const onDisk = new Set(fs.existsSync(dir) ? fs.readdirSync(dir) : []);
  let missingFiles = 0;
  for (const d of docs) {
    const flat = d.storagePath.replace(/\//g, '_');
    if (!onDisk.has(flat)) {
      missingFiles += 1;
      console.log(`MISSING FILE  ${d.id}  customer=${d.customerId}  path=${flat}`);
    }
  }
  console.log(`Rows whose file is absent on disk: ${missingFiles}`);
  const referenced = new Set(docs.map((d) => d.storagePath.replace(/\//g, '_')));
  let stray = 0;
  for (const f of onDisk) {
    if (!referenced.has(f)) {
      stray += 1;
      console.log(`STRAY FILE    ${f}`);
    }
  }
  console.log(`Files on disk without a DB row: ${stray}`);
}
await prisma.$disconnect();

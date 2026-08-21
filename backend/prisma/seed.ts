import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  ['Vehicle Breakdown & Automotive', 'Emergency breakdown response, diagnostics, battery, tyre assistance'],
  ['Industrial Machinery Breakdown', 'Troubleshooting and repair of industrial machines, electrical/control faults'],
  ['School & Institutional Repairs', 'Electrical, plumbing, carpentry, masonry, equipment repairs for institutions'],
  ['Plumbing', 'Leaks, blocked pipes, installations, water systems'],
  ['Electrical', 'Electrical faults, installations, wiring maintenance and repairs'],
  ['Appliance & Equipment Repair', 'Household, office and commercial equipment repair'],
  ['Carpentry & Furniture', 'Furniture, doors, fittings, fixtures, woodwork'],
  ['Painting & Finishing', 'Residential, commercial and institutional painting and restoration'],
  ['Masonry & Building Maintenance', 'Walls, floors, fixtures, general building maintenance'],
  ['General Technical Maintenance', 'Other skilled repair, installation and preventive maintenance'],
];

async function main() {
  for (const [name, description] of CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { name },
      update: {},
      create: { name, description },
    });
  }

  const adminEmail = 'admin@dofix.local';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'Dofix Admin',
        passwordHash: await bcrypt.hash('ChangeMe123!', 10),
        role: 'ADMIN',
      },
    });
    console.log(`Seeded admin user: ${adminEmail} / ChangeMe123!`);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

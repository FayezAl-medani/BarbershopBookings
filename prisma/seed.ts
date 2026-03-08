import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrator' },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: 'Super Administrator' },
  });

  const barberRole = await prisma.role.upsert({
    where: { name: 'BARBER' },
    update: {},
    create: { name: 'BARBER', description: 'Barber Staff' },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER', description: 'Customer' },
  });

  console.log('Roles created:', { adminRole, superAdminRole, barberRole, customerRole });

  // Create default admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { phoneNumber: '+1000000000' },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '+1000000000',
      email: 'admin@barbershop.com',
      status: 'ACTIVE',
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      email: 'admin@barbershop.com',
    },
  });

  await prisma.userCredential.upsert({
    where: { id: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      method: 'PASSWORD',
      identifier: 'admin@barbershop.com',
      secretHash: adminPassword,
    },
  });

  // Assign SUPER_ADMIN role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('Default admin created: admin@barbershop.com / Admin@123');

  // Create sample services
  const services = [
    { name: 'Haircut', description: 'Standard haircut with clippers and scissors', duration: 30, price: 25.00 },
    { name: 'Beard Trim', description: 'Beard shaping and trimming', duration: 15, price: 15.00 },
    { name: 'Hot Towel Shave', description: 'Classic hot towel straight razor shave', duration: 45, price: 35.00 },
    { name: 'Hair & Beard Combo', description: 'Haircut plus beard trim', duration: 45, price: 35.00 },
    { name: 'Kids Haircut', description: 'Haircut for children under 12', duration: 20, price: 15.00 },
    { name: 'Hair Coloring', description: 'Full hair coloring service', duration: 60, price: 50.00 },
  ];

  for (const svc of services) {
    const existing = await prisma.service.findFirst({ where: { name: svc.name } });
    if (!existing) {
      await prisma.service.create({ data: svc });
    }
  }

  console.log('Sample services created');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

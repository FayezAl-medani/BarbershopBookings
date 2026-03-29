import { PrismaClient, DayOfWeek, BookingStatus, type User } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── 1. Roles ──────────────────────────────────────────
  const roles = await seedRoles();
  console.log('✅ Roles created');

  // ─── 2. Admin Users ────────────────────────────────────
  const admins = await seedAdmins(roles);
  console.log('✅ Admin users created');

  // ─── 3. Barbershops & Owners ──────────────────────────
  const barbershops = await seedBarbershops(roles);
  console.log('✅ Barbershops & owners created');

  // ─── 4. Barbers ────────────────────────────────────────
  const barbers = await seedBarbers(roles, barbershops);
  console.log('✅ Barbers created');

  // ─── 5. Customers ──────────────────────────────────────
  const customers = await seedCustomers(roles);
  console.log('✅ Customers created');

  // ─── 6. Services ───────────────────────────────────────
  const services = await seedServices(barbershops);
  console.log('✅ Services created');

  // ─── 7. Barber-Service Mapping ─────────────────────────
  await seedBarberServices(barbers, services);
  console.log('✅ Barber-service mappings created');

  // ─── 8. Schedules ──────────────────────────────────────
  await seedSchedules(barbers);
  console.log('✅ Barber schedules created');

  // ─── 9. Bookings ───────────────────────────────────────
  const bookings = await seedBookings(customers, barbers, services);
  console.log('✅ Bookings created');

  // ─── 10. Reviews ───────────────────────────────────────
  await seedReviews(customers, barbers, barbershops, bookings);
  console.log('✅ Reviews created');

  // ─── 11. Commissions ───────────────────────────────────
  await seedCommissions(barbers, bookings);
  console.log('✅ Commissions created');

  // ─── Print Accounts ────────────────────────────────────
  printAccounts();
}

// ═══════════════════════════════════════════════════════════
//  ROLES
// ═══════════════════════════════════════════════════════════

async function seedRoles() {
  const roleData = [
    { name: 'SUPER_ADMIN', description: 'Super Administrator / مدير عام' },
    { name: 'ADMIN', description: 'Administrator / مدير' },
    { name: 'BARBERSHOP_OWNER', description: 'Barbershop Owner / صاحب صالون' },
    { name: 'BARBER', description: 'Barber Staff / حلاق' },
    { name: 'CUSTOMER', description: 'Customer / عميل' },
  ];

  const roles: Record<string, { id: string }> = {};

  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roles[r.name] = role;
  }

  return roles;
}

// ═══════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════

async function createUserWithRole(
  data: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    password?: string;
  },
  roleId: string,
) {
  const user = await prisma.user.upsert({
    where: { phoneNumber: data.phoneNumber },
    update: {},
    create: {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      status: 'ACTIVE',
    },
  });

  // Password credential (for admin/barber dashboard login)
  if (data.password) {
    const hash = await bcrypt.hash(data.password, 10);
    const existing = await prisma.userCredential.findFirst({
      where: { userId: user.id, method: 'PASSWORD' },
    });
    if (!existing) {
      await prisma.userCredential.create({
        data: {
          userId: user.id,
          method: 'PASSWORD',
          identifier: data.email,
          secretHash: hash,
        },
      });
    }
  }

  // Phone OTP credential (for app/website login)
  const existingOtp = await prisma.userCredential.findFirst({
    where: { userId: user.id, method: 'PHONE_OTP' },
  });
  if (!existingOtp) {
    await prisma.userCredential.create({
      data: {
        userId: user.id,
        method: 'PHONE_OTP',
        identifier: data.phoneNumber,
      },
    });
  }

  // Role assignment
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId } },
    update: {},
    create: { userId: user.id, roleId },
  });

  return user;
}

// ═══════════════════════════════════════════════════════════
//  ADMINS
// ═══════════════════════════════════════════════════════════

async function seedAdmins(roles: Record<string, { id: string }>) {
  const adminData = [
    {
      firstName: 'Super',
      lastName: 'Admin',
      phoneNumber: '+1000000000',
      email: 'admin@barbershop.com',
      password: 'Admin@123',
    },
    {
      // Arabic name admin
      firstName: 'أحمد',
      lastName: 'المدير',
      phoneNumber: '+966500000001',
      email: 'ahmed@barbershop.com',
      password: 'Admin@123',
    },
  ];

  const admins: User[] = [];
  for (const data of adminData) {
    const user = await createUserWithRole(data, roles.SUPER_ADMIN.id);

    await prisma.admin.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, email: data.email },
    });

    admins.push(user);
  }

  return admins;
}

// ═══════════════════════════════════════════════════════════
//  BARBERSHOPS & OWNERS
// ═══════════════════════════════════════════════════════════

async function seedBarbershops(roles: Record<string, { id: string }>) {
  const ownerData = [
    {
      firstName: 'Sultan',
      lastName: 'Al-Otaibi',
      phoneNumber: '+966510000001',
      email: 'sultan@barbershop.com',
      password: 'Owner@123',
    },
    {
      firstName: 'ناصر',
      lastName: 'الغامدي',
      phoneNumber: '+966510000002',
      email: 'nasser.owner@barbershop.com',
      password: 'Owner@123',
    },
    {
      firstName: 'Fahad',
      lastName: 'Al-Harbi',
      phoneNumber: '+966510000003',
      email: 'fahad@barbershop.com',
      password: 'Owner@123',
    },
  ];

  const owners: User[] = [];
  for (const data of ownerData) {
    const user = await createUserWithRole(data, roles.BARBERSHOP_OWNER.id);
    owners.push(user);
  }

  const barbershopData = [
    {
      name: 'Royal Barbershop / صالون رويال',
      description: 'Premium barbershop in the heart of Riyadh. Modern equipment with classic service. / صالون حلاقة فاخر في قلب الرياض. أجهزة حديثة مع خدمة كلاسيكية.',
      address: 'King Fahd Road, Al Olaya District / طريق الملك فهد، حي العليا',
      city: 'Riyadh / الرياض',
      latitude: 24.7136,
      longitude: 46.6753,
      phone: '+966111111111',
      ownerId: owners[0].id,
    },
    {
      name: 'Elite Cuts / قصات النخبة',
      description: 'Trendy barbershop specializing in modern styles. / صالون عصري متخصص في القصات الحديثة.',
      address: 'Prince Sultan Road, Al Rawdah / طريق الأمير سلطان، حي الروضة',
      city: 'Jeddah / جدة',
      latitude: 21.5433,
      longitude: 39.1728,
      phone: '+966222222222',
      ownerId: owners[1].id,
    },
    {
      name: 'The Classic Barber / الحلاق الكلاسيكي',
      description: 'Traditional barbershop with a modern touch. / صالون حلاقة تقليدي بلمسة عصرية.',
      address: 'King Abdullah Road, Al Khobar / طريق الملك عبدالله، الخبر',
      city: 'Dammam / الدمام',
      latitude: 26.2172,
      longitude: 50.1971,
      phone: '+966333333333',
      ownerId: owners[2].id,
    },
  ];

  const barbershops: Array<{ id: string; name: string; ownerId: string }> = [];

  for (const data of barbershopData) {
    const existing = await prisma.barbershop.findFirst({
      where: { name: data.name },
    });
    if (existing) {
      barbershops.push(existing);
    } else {
      const created = await prisma.barbershop.create({ data });
      barbershops.push(created);
    }
  }

  return barbershops;
}

// ═══════════════════════════════════════════════════════════
//  BARBERS
// ═══════════════════════════════════════════════════════════

async function seedBarbers(
  roles: Record<string, { id: string }>,
  barbershops: Array<{ id: string }>,
) {
  const barberData = [
    {
      firstName: 'Mohammed',
      lastName: 'Al-Rashid',
      phoneNumber: '+966511111111',
      email: 'mohammed@barbershop.com',
      password: 'Barber@123',
      bio: 'Senior barber with 10+ years of experience. Specializing in classic and modern cuts. | حلاق أول بخبرة أكثر من 10 سنوات. متخصص في القصات الكلاسيكية والحديثة.',
      specialization: 'Classic Cuts / قصات كلاسيكية',
      barbershopIdx: 0,
      commissionRate: 0.15,
    },
    {
      firstName: 'خالد',
      lastName: 'العتيبي',
      phoneNumber: '+966522222222',
      email: 'khalid@barbershop.com',
      password: 'Barber@123',
      bio: 'Expert in beard styling and hot towel shaves. | خبير في تصفيف اللحية والحلاقة بالمنشفة الساخنة.',
      specialization: 'Beard Styling / تصفيف اللحية',
      barbershopIdx: 0,
      commissionRate: 0.12,
    },
    {
      firstName: 'Omar',
      lastName: 'Hassan',
      phoneNumber: '+966533333333',
      email: 'omar@barbershop.com',
      password: 'Barber@123',
      bio: 'Trendy styles and hair coloring specialist. | متخصص في الصبغات والقصات العصرية.',
      specialization: 'Hair Coloring / صبغ الشعر',
      barbershopIdx: 1,
      commissionRate: 0.10,
    },
    {
      firstName: 'فيصل',
      lastName: 'الدوسري',
      phoneNumber: '+966544444444',
      email: 'faisal@barbershop.com',
      password: 'Barber@123',
      bio: 'Kids haircut specialist with a gentle touch. | متخصص في قص شعر الأطفال بلمسة لطيفة.',
      specialization: 'Kids Specialist / متخصص أطفال',
      barbershopIdx: 2,
      commissionRate: 0.10,
    },
  ];

  const barbers: Array<{ id: string; userId: string }> = [];

  for (const data of barberData) {
    const user = await createUserWithRole(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        password: data.password,
      },
      roles.BARBER.id,
    );

    const barber = await prisma.barber.upsert({
      where: { userId: user.id },
      update: {
        bio: data.bio,
        specialization: data.specialization,
        barbershopId: barbershops[data.barbershopIdx].id,
        commissionRate: data.commissionRate,
      },
      create: {
        userId: user.id,
        barbershopId: barbershops[data.barbershopIdx].id,
        bio: data.bio,
        specialization: data.specialization,
        commissionRate: data.commissionRate,
        isActive: true,
      },
    });

    barbers.push(barber);
  }

  return barbers;
}

// ═══════════════════════════════════════════════════════════
//  CUSTOMERS
// ═══════════════════════════════════════════════════════════

async function seedCustomers(roles: Record<string, { id: string }>) {
  const customerData = [
    {
      firstName: 'Ali',
      lastName: 'Ibrahim',
      phoneNumber: '+966555555555',
      email: 'ali@example.com',
      notes: 'Prefers short haircuts / يفضل القصات القصيرة',
    },
    {
      firstName: 'سعود',
      lastName: 'القحطاني',
      phoneNumber: '+966566666666',
      email: 'saud@example.com',
      notes: 'Sensitive skin - use hypoallergenic products / بشرة حساسة - استخدم منتجات مضادة للحساسية',
    },
    {
      firstName: 'Yousef',
      lastName: 'Ahmad',
      phoneNumber: '+966577777777',
      email: 'yousef@example.com',
      notes: 'Regular customer, every 2 weeks / عميل منتظم، كل أسبوعين',
    },
    {
      firstName: 'عبدالله',
      lastName: 'السبيعي',
      phoneNumber: '+966588888888',
      email: 'abdullah@example.com',
      notes: null,
    },
    {
      firstName: 'Nasser',
      lastName: 'Al-Mutairi',
      phoneNumber: '+966599999999',
      email: 'nasser@example.com',
      notes: 'Prefers Mohammed as barber / يفضل الحلاق محمد',
    },
    {
      firstName: 'طارق',
      lastName: 'الشمري',
      phoneNumber: '+966501234567',
      email: 'tariq@example.com',
      notes: null,
    },
  ];

  const customers: Array<{ id: string; userId: string }> = [];

  for (const data of customerData) {
    const user = await createUserWithRole(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
      },
      roles.CUSTOMER.id,
    );

    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        notes: data.notes,
      },
    });

    customers.push(customer);
  }

  return customers;
}

// ═══════════════════════════════════════════════════════════
//  SERVICES (now per barbershop)
// ═══════════════════════════════════════════════════════════

async function seedServices(barbershops: Array<{ id: string }>) {
  const serviceTemplates = [
    {
      name: 'Haircut / قص شعر',
      description: 'Standard haircut with clippers and scissors / قص شعر قياسي بالمكينة والمقص',
      duration: 30,
      price: 25.0,
    },
    {
      name: 'Beard Trim / تهذيب اللحية',
      description: 'Beard shaping and trimming / تشكيل وتهذيب اللحية',
      duration: 15,
      price: 15.0,
    },
    {
      name: 'Hot Towel Shave / حلاقة بالمنشفة الساخنة',
      description: 'Classic hot towel straight razor shave / حلاقة كلاسيكية بالموس والمنشفة الساخنة',
      duration: 45,
      price: 35.0,
    },
    {
      name: 'Hair & Beard Combo / كومبو شعر ولحية',
      description: 'Haircut plus beard trim package / باقة قص شعر مع تهذيب اللحية',
      duration: 45,
      price: 35.0,
    },
    {
      name: 'Kids Haircut / قص شعر أطفال',
      description: 'Haircut for children under 12 / قص شعر للأطفال أقل من 12 سنة',
      duration: 20,
      price: 15.0,
    },
    {
      name: 'Hair Coloring / صبغ الشعر',
      description: 'Full hair coloring service / خدمة صبغ الشعر الكامل',
      duration: 60,
      price: 50.0,
    },
    {
      name: 'Facial Treatment / علاج الوجه',
      description: 'Deep cleansing facial with mask / تنظيف عميق للوجه مع ماسك',
      duration: 40,
      price: 40.0,
    },
    {
      name: 'Hair Wash & Style / غسيل وتصفيف',
      description: 'Shampoo, condition and blow dry styling / شامبو وبلسم وتصفيف بالسشوار',
      duration: 25,
      price: 20.0,
    },
  ];

  // Create services for the first barbershop (Royal Barbershop)
  // Other shops can have different prices in a real scenario
  const services: Array<{ id: string; name: string }> = [];
  const mainShopId = barbershops[0].id;

  // Clear old services to avoid duplicates
  await prisma.barberService.deleteMany({});
  await prisma.service.deleteMany({});

  for (const svc of serviceTemplates) {
    const created = await prisma.service.create({
      data: { ...svc, barbershopId: mainShopId },
    });
    services.push(created);
  }

  // Also create basic services for other barbershops
  for (let i = 1; i < barbershops.length; i++) {
    for (const svc of serviceTemplates.slice(0, 4)) {
      await prisma.service.create({
        data: { ...svc, barbershopId: barbershops[i].id },
      });
    }
  }

  return services; // Return first barbershop's services for barber-service mapping
}

// ═══════════════════════════════════════════════════════════
//  BARBER-SERVICE MAPPING
// ═══════════════════════════════════════════════════════════

async function seedBarberServices(
  barbers: Array<{ id: string }>,
  services: Array<{ id: string; name: string }>,
) {
  // Mohammed: all services (senior barber) - barbershop 0
  // Khalid: beard-related + shave + facial - barbershop 0
  // Omar & Faisal are in different barbershops, they use their shop's services
  // For simplicity, map barbers 0 & 1 to the main services list

  const mappings: Array<{ barberIdx: number; serviceNames: string[] }> = [
    {
      barberIdx: 0,
      serviceNames: services.map((s) => s.name), // all
    },
    {
      barberIdx: 1,
      serviceNames: [
        'Beard Trim / تهذيب اللحية',
        'Hot Towel Shave / حلاقة بالمنشفة الساخنة',
        'Hair & Beard Combo / كومبو شعر ولحية',
        'Facial Treatment / علاج الوجه',
        'Haircut / قص شعر',
      ],
    },
  ];

  for (const mapping of mappings) {
    const barber = barbers[mapping.barberIdx];
    for (const svcName of mapping.serviceNames) {
      const service = services.find((s) => s.name === svcName);
      if (!service) continue;

      await prisma.barberService.upsert({
        where: {
          barberId_serviceId: {
            barberId: barber.id,
            serviceId: service.id,
          },
        },
        update: {},
        create: {
          barberId: barber.id,
          serviceId: service.id,
        },
      });
    }
  }

  // Map Omar and Faisal to their own barbershop services
  for (const barberIdx of [2, 3]) {
    const barber = barbers[barberIdx];
    const barberRecord = await prisma.barber.findUnique({ where: { id: barber.id } });
    if (!barberRecord) continue;

    const shopServices = await prisma.service.findMany({
      where: { barbershopId: barberRecord.barbershopId },
    });

    for (const svc of shopServices) {
      await prisma.barberService.upsert({
        where: {
          barberId_serviceId: {
            barberId: barber.id,
            serviceId: svc.id,
          },
        },
        update: {},
        create: {
          barberId: barber.id,
          serviceId: svc.id,
        },
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  SCHEDULES
// ═══════════════════════════════════════════════════════════

async function seedSchedules(barbers: Array<{ id: string }>) {
  const scheduleConfigs = [
    {
      // Mohammed: Sun-Thu 09:00-21:00
      barberIdx: 0,
      days: [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY],
      startTime: '09:00',
      endTime: '21:00',
    },
    {
      // Khalid: Sun-Thu 10:00-20:00, Sat 10:00-16:00
      barberIdx: 1,
      days: [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY],
      startTime: '10:00',
      endTime: '20:00',
    },
    {
      barberIdx: 1,
      days: [DayOfWeek.SATURDAY],
      startTime: '10:00',
      endTime: '16:00',
    },
    {
      // Omar: Mon-Fri 12:00-22:00
      barberIdx: 2,
      days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY],
      startTime: '12:00',
      endTime: '22:00',
    },
    {
      // Faisal: Sun-Thu 08:00-18:00
      barberIdx: 3,
      days: [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY],
      startTime: '08:00',
      endTime: '18:00',
    },
  ];

  for (const config of scheduleConfigs) {
    const barber = barbers[config.barberIdx];
    for (const day of config.days) {
      await prisma.schedule.upsert({
        where: {
          barberId_dayOfWeek: {
            barberId: barber.id,
            dayOfWeek: day,
          },
        },
        update: { startTime: config.startTime, endTime: config.endTime, isActive: true },
        create: {
          barberId: barber.id,
          dayOfWeek: day,
          startTime: config.startTime,
          endTime: config.endTime,
          isActive: true,
        },
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  BOOKINGS
// ═══════════════════════════════════════════════════════════

async function seedBookings(
  customers: Array<{ id: string }>,
  barbers: Array<{ id: string }>,
  services: Array<{ id: string; name: string }>,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  const haircut = services.find((s) => s.name.startsWith('Haircut'))!;
  const beardTrim = services.find((s) => s.name.startsWith('Beard'))!;
  const hotTowel = services.find((s) => s.name.startsWith('Hot Towel'))!;
  const combo = services.find((s) => s.name.startsWith('Hair & Beard'))!;
  const kidsHaircut = services.find((s) => s.name.startsWith('Kids'))!;
  const coloring = services.find((s) => s.name.startsWith('Hair Coloring'))!;
  const facial = services.find((s) => s.name.startsWith('Facial'))!;
  const washStyle = services.find((s) => s.name.startsWith('Hair Wash'))!;

  // Get service prices for totalPrice snapshot
  const svcPrices: Record<string, number> = {};
  for (const svc of services) {
    const full = await prisma.service.findUnique({ where: { id: svc.id } });
    if (full) svcPrices[svc.id] = Number(full.price);
  }

  const bookingData = [
    // ── Past bookings (completed) ──
    {
      customerId: customers[0].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: addDays(today, -14),
      startTime: '10:00',
      endTime: '10:30',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: 'Fade on the sides / تدريج على الجوانب',
    },
    {
      customerId: customers[1].id,
      barberId: barbers[1].id,
      serviceId: beardTrim.id,
      date: addDays(today, -12),
      startTime: '14:00',
      endTime: '14:15',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[beardTrim.id] || 15,
      notes: 'Keep it medium length / أبقها بطول متوسط',
    },
    {
      customerId: customers[2].id,
      barberId: barbers[0].id,
      serviceId: combo.id,
      date: addDays(today, -10),
      startTime: '11:00',
      endTime: '11:45',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[combo.id] || 35,
      notes: null,
    },
    {
      customerId: customers[3].id,
      barberId: barbers[0].id,
      serviceId: coloring.id,
      date: addDays(today, -9),
      startTime: '13:00',
      endTime: '14:00',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[coloring.id] || 50,
      notes: 'Dark brown color / لون بني غامق',
    },
    {
      customerId: customers[4].id,
      barberId: barbers[0].id,
      serviceId: kidsHaircut.id,
      date: addDays(today, -8),
      startTime: '09:00',
      endTime: '09:20',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[kidsHaircut.id] || 15,
      notes: 'For my son, age 7 / لابني عمره 7 سنوات',
    },
    {
      customerId: customers[0].id,
      barberId: barbers[1].id,
      serviceId: hotTowel.id,
      date: addDays(today, -7),
      startTime: '16:00',
      endTime: '16:45',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[hotTowel.id] || 35,
      notes: null,
    },
    {
      customerId: customers[5].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: addDays(today, -6),
      startTime: '15:00',
      endTime: '15:30',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: null,
    },
    {
      customerId: customers[2].id,
      barberId: barbers[0].id,
      serviceId: washStyle.id,
      date: addDays(today, -5),
      startTime: '12:00',
      endTime: '12:25',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[washStyle.id] || 20,
      notes: null,
    },

    // ── Past bookings (cancelled / no-show) ──
    {
      customerId: customers[3].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: addDays(today, -4),
      startTime: '10:00',
      endTime: '10:30',
      status: BookingStatus.CANCELLED,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: 'Had an emergency / حالة طارئة',
    },
    {
      customerId: customers[5].id,
      barberId: barbers[1].id,
      serviceId: beardTrim.id,
      date: addDays(today, -3),
      startTime: '11:00',
      endTime: '11:15',
      status: BookingStatus.NO_SHOW,
      totalPrice: svcPrices[beardTrim.id] || 15,
      notes: null,
    },

    // ── Today's bookings ──
    {
      customerId: customers[0].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: today,
      startTime: '09:00',
      endTime: '09:30',
      status: BookingStatus.COMPLETED,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: 'Same as last time / نفس المرة السابقة',
    },
    {
      customerId: customers[1].id,
      barberId: barbers[0].id,
      serviceId: combo.id,
      date: today,
      startTime: '10:00',
      endTime: '10:45',
      status: BookingStatus.CONFIRMED,
      totalPrice: svcPrices[combo.id] || 35,
      notes: null,
    },
    {
      customerId: customers[2].id,
      barberId: barbers[1].id,
      serviceId: facial.id,
      date: today,
      startTime: '14:00',
      endTime: '14:40',
      status: BookingStatus.CONFIRMED,
      totalPrice: svcPrices[facial.id] || 40,
      notes: 'First time trying facial / أول مرة أجرب علاج الوجه',
    },
    {
      customerId: customers[4].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: today,
      startTime: '15:00',
      endTime: '15:30',
      status: BookingStatus.PENDING,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: null,
    },
    {
      customerId: customers[5].id,
      barberId: barbers[0].id,
      serviceId: kidsHaircut.id,
      date: today,
      startTime: '16:00',
      endTime: '16:20',
      status: BookingStatus.CONFIRMED,
      totalPrice: svcPrices[kidsHaircut.id] || 15,
      notes: 'For my daughter / لبنتي',
    },

    // ── Future bookings (upcoming) ──
    {
      customerId: customers[0].id,
      barberId: barbers[0].id,
      serviceId: beardTrim.id,
      date: addDays(today, 1),
      startTime: '11:00',
      endTime: '11:15',
      status: BookingStatus.CONFIRMED,
      totalPrice: svcPrices[beardTrim.id] || 15,
      notes: null,
    },
    {
      customerId: customers[1].id,
      barberId: barbers[0].id,
      serviceId: coloring.id,
      date: addDays(today, 1),
      startTime: '13:00',
      endTime: '14:00',
      status: BookingStatus.CONFIRMED,
      totalPrice: svcPrices[coloring.id] || 50,
      notes: 'Ash blonde / أشقر رمادي',
    },
    {
      customerId: customers[3].id,
      barberId: barbers[1].id,
      serviceId: hotTowel.id,
      date: addDays(today, 2),
      startTime: '10:00',
      endTime: '10:45',
      status: BookingStatus.PENDING,
      totalPrice: svcPrices[hotTowel.id] || 35,
      notes: null,
    },
    {
      customerId: customers[4].id,
      barberId: barbers[0].id,
      serviceId: combo.id,
      date: addDays(today, 2),
      startTime: '14:00',
      endTime: '14:45',
      status: BookingStatus.CONFIRMED,
      totalPrice: svcPrices[combo.id] || 35,
      notes: 'Wedding preparation / تجهيز لزواج',
    },
    {
      customerId: customers[2].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: addDays(today, 3),
      startTime: '09:00',
      endTime: '09:30',
      status: BookingStatus.PENDING,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: null,
    },
    {
      customerId: customers[5].id,
      barberId: barbers[0].id,
      serviceId: washStyle.id,
      date: addDays(today, 3),
      startTime: '17:00',
      endTime: '17:25',
      status: BookingStatus.CONFIRMED,
      totalPrice: svcPrices[washStyle.id] || 20,
      notes: null,
    },
    {
      customerId: customers[0].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: addDays(today, 5),
      startTime: '18:00',
      endTime: '18:30',
      status: BookingStatus.PENDING,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: 'After work appointment / موعد بعد العمل',
    },
    {
      customerId: customers[1].id,
      barberId: barbers[0].id,
      serviceId: haircut.id,
      date: addDays(today, 7),
      startTime: '10:00',
      endTime: '10:30',
      status: BookingStatus.PENDING,
      totalPrice: svcPrices[haircut.id] || 25,
      notes: null,
    },
  ];

  // Clear existing bookings, reviews, and commissions to avoid duplicates on re-seed
  await prisma.commission.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.booking.deleteMany({});

  const createdBookings: Array<{ id: string; customerId: string; barberId: string; serviceId: string; status: string }> = [];

  for (const booking of bookingData) {
    const created = await prisma.booking.create({
      data: {
        ...booking,
        paymentStatus: booking.status === 'COMPLETED' ? 'PAID' : 'UNPAID',
        paymentMethod: 'CASH',
      },
    });
    createdBookings.push({
      id: created.id,
      customerId: created.customerId,
      barberId: created.barberId,
      serviceId: created.serviceId,
      status: created.status,
    });
  }

  return createdBookings;
}

// ═══════════════════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════════════════

async function seedReviews(
  customers: Array<{ id: string }>,
  barbers: Array<{ id: string }>,
  barbershops: Array<{ id: string }>,
  bookings: Array<{ id: string; customerId: string; barberId: string; status: string }>,
) {
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  const reviewData = [
    { bookingIdx: 0, rating: 5, comment: 'Excellent fade! Best barber in town / أفضل تدريج! أفضل حلاق في المدينة' },
    { bookingIdx: 1, rating: 4, comment: 'Great beard work / عمل رائع للحية' },
    { bookingIdx: 2, rating: 5, comment: 'Perfect combo service / خدمة كومبو ممتازة' },
    { bookingIdx: 3, rating: 4, comment: 'Good color, will come back / لون جيد، سأعود' },
    { bookingIdx: 4, rating: 5, comment: 'My son loved it! / ابني أحب القصة!' },
    { bookingIdx: 6, rating: 4, comment: 'Clean and professional / نظيف ومحترف' },
  ];

  for (const review of reviewData) {
    if (review.bookingIdx >= completedBookings.length) continue;
    const booking = completedBookings[review.bookingIdx];

    // Determine barbershop from barber
    const barber = await prisma.barber.findUnique({ where: { id: booking.barberId } });
    if (!barber) continue;

    await prisma.review.create({
      data: {
        customerId: booking.customerId,
        barbershopId: barber.barbershopId,
        barberId: booking.barberId,
        bookingId: booking.id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
//  COMMISSIONS
// ═══════════════════════════════════════════════════════════

async function seedCommissions(
  barbers: Array<{ id: string }>,
  bookings: Array<{ id: string; barberId: string; status: string }>,
) {
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  for (const booking of completedBookings) {
    const barber = await prisma.barber.findUnique({ where: { id: booking.barberId } });
    if (!barber || !barber.commissionRate) continue;

    const fullBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    if (!fullBooking) continue;

    const amount = Number(fullBooking.totalPrice) * Number(barber.commissionRate);

    // Mark some as collected, some as pending
    const isCollected = Math.random() > 0.5;

    await prisma.commission.create({
      data: {
        barberId: booking.barberId,
        bookingId: booking.id,
        amount,
        commissionRate: Number(barber.commissionRate),
        status: isCollected ? 'COLLECTED' : 'PENDING',
        collectedAt: isCollected ? new Date() : null,
      },
    });
  }
}

// ═══════════════════════════════════════════════════════════
//  PRINT ACCOUNTS
// ═══════════════════════════════════════════════════════════

function printAccounts() {
  console.log('\n════════════════════════════════════════════════════');
  console.log('  📋 TEST ACCOUNTS / حسابات تجريبية');
  console.log('════════════════════════════════════════════════════\n');

  console.log('🔑 ADMIN DASHBOARD LOGIN (Email + Password):');
  console.log('┌──────────────────────────────────────────────────┐');
  console.log('│ Super Admin                                      │');
  console.log('│   Email:    admin@barbershop.com                 │');
  console.log('│   Password: Admin@123                            │');
  console.log('│                                                  │');
  console.log('│ أحمد المدير (Ahmed)                               │');
  console.log('│   Email:    ahmed@barbershop.com                 │');
  console.log('│   Password: Admin@123                            │');
  console.log('└──────────────────────────────────────────────────┘\n');

  console.log('🏪 BARBERSHOP OWNER LOGIN (Email + Password):');
  console.log('┌──────────────────────────────────────────────────┐');
  console.log('│ Sultan Al-Otaibi (Royal Barbershop)              │');
  console.log('│   Email:    sultan@barbershop.com                │');
  console.log('│   Password: Owner@123                            │');
  console.log('│                                                  │');
  console.log('│ ناصر الغامدي (Elite Cuts)                         │');
  console.log('│   Email:    nasser.owner@barbershop.com          │');
  console.log('│   Password: Owner@123                            │');
  console.log('│                                                  │');
  console.log('│ Fahad Al-Harbi (The Classic Barber)              │');
  console.log('│   Email:    fahad@barbershop.com                 │');
  console.log('│   Password: Owner@123                            │');
  console.log('└──────────────────────────────────────────────────┘\n');

  console.log('💈 BARBER APP LOGIN (Phone OTP):');
  console.log('┌──────────────────────────────────────────────────┐');
  console.log('│ Mohammed Al-Rashid    +966511111111              │');
  console.log('│ خالد العتيبي (Khalid)  +966522222222              │');
  console.log('│ Omar Hassan           +966533333333              │');
  console.log('│ فيصل الدوسري (Faisal) +966544444444              │');
  console.log('└──────────────────────────────────────────────────┘\n');

  console.log('👤 CUSTOMER APP/WEBSITE LOGIN (Phone OTP):');
  console.log('┌──────────────────────────────────────────────────┐');
  console.log('│ Ali Ibrahim           +966555555555              │');
  console.log('│ سعود القحطاني (Saud)   +966566666666              │');
  console.log('│ Yousef Ahmad          +966577777777              │');
  console.log('│ عبدالله السبيعي        +966588888888              │');
  console.log('│ Nasser Al-Mutairi     +966599999999              │');
  console.log('│ طارق الشمري (Tariq)    +966501234567              │');
  console.log('└──────────────────────────────────────────────────┘\n');

  console.log('ℹ️  OTP Login: Use send-otp endpoint, check console/logs for the OTP code.');
  console.log('ℹ️  تسجيل الدخول بـ OTP: استخدم نقطة إرسال OTP، تحقق من الكونسول لرمز التحقق.\n');

  console.log('🌱 Seeding complete! / اكتمل تهيئة قاعدة البيانات!\n');
}

// ═══════════════════════════════════════════════════════════

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

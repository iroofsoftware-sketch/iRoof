const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { User } = require('./models/User');
const RateMaster = require('./models/RateMaster');
const SectionMaster = require('./models/SectionMaster');

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@iroofing.com',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    name: 'Sales Manager',
    email: 'sales@iroofing.com',
    password: 'Sales@123',
    role: 'sales'
  },
  {
    name: 'Project Manager',
    email: 'pm@iroofing.com',
    password: 'Pm@123',
    role: 'projectmanager'
  },
  {
    name: 'Design Engineer',
    email: 'design@iroofing.com',
    password: 'Design@123',
    role: 'design'
  },
  {
    name: 'Purchase Officer',
    email: 'purchase@iroofing.com',
    password: 'Purchase@123',
    role: 'purchase'
  },
  {
    name: 'Workshop Lead',
    email: 'workshop@iroofing.com',
    password: 'Workshop@123',
    role: 'workshop'
  },
  {
    name: 'Site Inspector',
    email: 'sitevisitor@iroofing.com',
    password: 'Site@123',
    role: 'sitevisitor'
  },
  {
    name: 'Accounts Executive',
    email: 'accounts@iroofing.com',
    password: 'Accounts@123',
    role: 'accounts'
  }
];

const DEFAULT_RATES = [
  { itemName: 'Roofing Sheet (0.50mm)', unit: 'ft²', rate: 48, category: 'sheeting' },
  { itemName: 'Structural Steel Tube', unit: 'kg', rate: 75, category: 'structural' },
  { itemName: 'Labour Erection & Fitting', unit: 'kg', rate: 26, category: 'labour' },
  { itemName: 'Fasteners & Sealants', unit: 'set', rate: 12, category: 'consumables' }
];

const DEFAULT_SECTIONS = [
  { sectionName: 'SHS 100x100x3.6mm', weight: 10.5, rate: 78, unit: 'kg' },
  { sectionName: 'RHS 150x75x4.0mm', weight: 13.2, rate: 80, unit: 'kg' },
  { sectionName: 'C-Purlin 150x50x2.0mm', weight: 4.8, rate: 82, unit: 'kg' },
  { sectionName: 'Base Plate 200x200x10mm', weight: 3.14, rate: 85, unit: 'kg' }
];

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.includes(':@cluster') || mongoUri.includes('YOUR_PASSWORD')) {
    console.error('\n❌ ERROR: Valid MONGO_URI not configured in backend/.env');
    console.error('Please open backend/.env and replace YOUR_PASSWORD with your actual Atlas database password.\n');
    process.exit(1);
  }

  try {
    console.log('\nConnecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB connection established.\n');

    // Seed Users
    console.log('Seeding initial role users...');
    for (const u of SEED_USERS) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        await User.create(u);
        console.log(`  ✓ Created user: [${u.role.padEnd(14)}] ${u.email}`);
      } else {
        console.log(`  ℹ Already exists: [${u.role.padEnd(14)}] ${u.email}`);
      }
    }

    // Seed Rate Masters if empty
    const rateCount = await RateMaster.countDocuments();
    if (rateCount === 0) {
      console.log('\nSeeding default Rate Masters...');
      await RateMaster.insertMany(DEFAULT_RATES);
      console.log(`  ✓ Inserted ${DEFAULT_RATES.length} default rates.`);
    }

    // Seed Section Masters if empty
    const sectionCount = await SectionMaster.countDocuments();
    if (sectionCount === 0) {
      console.log('\nSeeding default Section Masters...');
      await SectionMaster.insertMany(DEFAULT_SECTIONS);
      console.log(`  ✓ Inserted ${DEFAULT_SECTIONS.length} default sections.`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('🎉 iRoof v2 Database Initialized Successfully!');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('Log in at: http://localhost:5173\n');
    console.log('Credentials:');
    console.log('  Admin User:          admin@iroofing.com       / Admin@123');
    console.log('  Sales Lead:          sales@iroofing.com       / Sales@123');
    console.log('  Project Manager:     pm@iroofing.com          / Pm@123');
    console.log('  Design Engineer:     design@iroofing.com      / Design@123');
    console.log('  Purchase Officer:    purchase@iroofing.com    / Purchase@123');
    console.log('  Workshop Lead:       workshop@iroofing.com    / Workshop@123');
    console.log('  Site Inspector:      sitevisitor@iroofing.com / Site@123');
    console.log('  Accounts Executive:  accounts@iroofing.com    / Accounts@123');
    console.log('═══════════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed with error:', err.message);
    process.exit(1);
  }
};

seedDatabase();

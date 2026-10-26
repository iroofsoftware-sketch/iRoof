/**
 * clearData.js — Wipe all test/demo data from MongoDB
 * Keeps: Users (8 role accounts), RateMasters, SectionMasters
 * Deletes: Enquiries, Estimates, Customers, WorkOrders, DesignTasks,
 *          PurchaseRequests, PurchaseOrders, WorkshopJobs, SiteVisits,
 *          Invoices, Payments, Notifications, Suppliers
 *
 * Run: node src/clearData.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

dotenv.config({ path: path.join(__dirname, '../.env') });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const confirm = (question) =>
  new Promise((resolve) => rl.question(question, (ans) => resolve(ans.trim().toLowerCase())));

const clearDatabase = async () => {
  try {
    console.log('\n⚠️  iRoof Data Wipe Utility');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('This will DELETE all test/demo records:');
    console.log('  • Enquiries, Estimates, Customers');
    console.log('  • Work Orders, Design Tasks');
    console.log('  • Purchase Requests, Purchase Orders');
    console.log('  • Workshop Jobs, Site Visits');
    console.log('  • Invoices, Payments, Notifications');
    console.log('  • Suppliers');
    console.log('\nThis will KEEP:');
    console.log('  ✓ All 8 user accounts');
    console.log('  ✓ Rate Masters');
    console.log('  ✓ Section Masters');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const answer = await confirm('\nType "yes" to confirm wipe: ');
    if (answer !== 'yes') {
      console.log('\n❌ Cancelled. No data was deleted.\n');
      rl.close();
      process.exit(0);
    }

    console.log('\nConnecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected\n');

    const db = mongoose.connection.db;

    const collections = [
      'enquiries',
      'estimates',
      'customers',
      'workorders',
      'designtasks',
      'purchaserequests',
      'purchaseorders',
      'workshopjobs',
      'sitevisits',
      'invoices',
      'payments',
      'notifications',
      'suppliers',
    ];

    let totalDeleted = 0;

    for (const col of collections) {
      try {
        const result = await db.collection(col).deleteMany({});
        if (result.deletedCount > 0) {
          console.log(`  ✓ Cleared ${col}: ${result.deletedCount} records deleted`);
          totalDeleted += result.deletedCount;
        } else {
          console.log(`  — ${col}: already empty`);
        }
      } catch (e) {
        console.log(`  ⚠ ${col}: ${e.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Done. ${totalDeleted} total records deleted.`);
    console.log('   User accounts, Rate Masters, Section Masters preserved.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

clearDatabase();

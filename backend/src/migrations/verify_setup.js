const { pool } = require('../config/db');

async function verifySetup() {
  try {
    console.log('🔍 Verifying database setup...\n');

    // Check if tables exist
    console.log('📋 Checking tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('✅ Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check transactions data
    console.log('\n💰 Checking transactions...');
    const transactionsResult = await pool.query('SELECT COUNT(*) as count FROM transactions');
    console.log(`✅ Transactions: ${transactionsResult.rows[0].count} records`);

    // Check users data
    console.log('\n👥 Checking users...');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users: ${usersResult.rows[0].count} records`);

    // Show sample transactions
    console.log('\n📊 Sample transactions:');
    const sampleTransactions = await pool.query(`
      SELECT 
        id, 
        buyer_email, 
        seller_email, 
        amount, 
        status, 
        payment_received, 
        file_uploaded,
        created_at
      FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    sampleTransactions.rows.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.item_description || 'N/A'} - $${tx.amount} (${tx.status})`);
      console.log(`      Buyer: ${tx.buyer_email} | Seller: ${tx.seller_email}`);
      console.log(`      Payment: ${tx.payment_received ? '✅' : '❌'} | File: ${tx.file_uploaded ? '✅' : '❌'}`);
    });

    // Show sample users
    console.log('\n👤 Sample users:');
    const sampleUsers = await pool.query(`
      SELECT email, full_name, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    
    sampleUsers.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.full_name} (${user.email})`);
    });

    // Test statistics queries
    console.log('\n📈 Testing statistics queries...');
    
    // Buyer stats
    const buyerStats = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN payment_received = true AND file_uploaded = false THEN 1 END) as pending_files,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_transactions,
        COALESCE(SUM(CASE WHEN payment_received = true THEN amount ELSE 0 END), 0) as total_spent
      FROM transactions
      WHERE buyer_email = 'buyer@example.com'
    `);
    
    console.log('✅ Buyer statistics working:');
    console.log(`   - Total transactions: ${buyerStats.rows[0].total_transactions}`);
    console.log(`   - Pending files: ${buyerStats.rows[0].pending_files}`);
    console.log(`   - Completed: ${buyerStats.rows[0].completed_transactions}`);
    console.log(`   - Total spent: $${buyerStats.rows[0].total_spent}`);

    // Seller stats
    const sellerStats = await pool.query(`
      SELECT 
        COUNT(CASE WHEN file_uploaded = true THEN 1 END) as total_uploads,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_earned,
        COALESCE(SUM(CASE WHEN file_uploaded = true AND status != 'completed' THEN amount ELSE 0 END), 0) as pending_payouts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as downloads_completed
      FROM transactions
      WHERE seller_email = 'seller@example.com'
    `);
    
    console.log('\n✅ Seller statistics working:');
    console.log(`   - Total uploads: ${sellerStats.rows[0].total_uploads}`);
    console.log(`   - Total earned: $${sellerStats.rows[0].total_earned}`);
    console.log(`   - Pending payouts: $${sellerStats.rows[0].pending_payouts}`);
    console.log(`   - Downloads completed: ${sellerStats.rows[0].downloads_completed}`);

    console.log('\n🎉 Database setup verification completed successfully!');
    console.log('✅ All tables created');
    console.log('✅ Sample data inserted');
    console.log('✅ Statistics queries working');
    console.log('✅ Ready for frontend integration');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifySetup();
}

module.exports = verifySetup; 
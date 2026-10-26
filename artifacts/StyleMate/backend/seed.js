/**
 * Seed script - creates a demo user and sample wardrobe items
 * Run: node seed.js
 */
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'stylemate.db'));

async function seed() {
  console.log('🌱 Seeding StyleMate database...\n');

  // Create demo user
  const userId = uuidv4();
  const hashed = await bcrypt.hash('demo1234', 10);

  try {
    db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, password, gender, style_preference, favorite_colors)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'Alex Style',
      'demo@stylemate.app',
      hashed,
      'unisex',
      'casual',
      JSON.stringify(['navy', 'black', 'white', 'beige'])
    );
    console.log('✅ Demo user created');
    console.log('   Email: demo@stylemate.app');
    console.log('   Password: demo1234\n');
  } catch (e) {
    // User may already exist
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@stylemate.app');
    if (existing) {
      console.log('ℹ️  Demo user already exists\n');
    }
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@stylemate.app');
  if (!user) {
    console.error('Could not find demo user');
    process.exit(1);
  }

  const uid = user.id;

  // Clear existing demo wardrobe
  db.prepare('DELETE FROM wardrobe WHERE user_id = ?').run(uid);
  db.prepare('DELETE FROM outfits WHERE user_id = ?').run(uid);

  const items = [
    { name: 'Classic White Tee', category: 'top', subcategory: 'tshirt', color: 'white', season: 'all', occasion: 'casual', brand: 'Uniqlo' },
    { name: 'Navy Oxford Shirt', category: 'top', subcategory: 'shirt', color: 'navy', season: 'all', occasion: 'business', brand: 'Van Heusen' },
    { name: 'Black Crewneck Sweater', category: 'top', subcategory: 'sweater', color: 'black', season: 'winter', occasion: 'casual', brand: 'H&M' },
    { name: 'Olive Hoodie', category: 'top', subcategory: 'hoodie', color: 'olive', season: 'fall', occasion: 'casual', brand: 'Nike' },
    { name: 'Slim Fit Jeans', category: 'bottom', subcategory: 'jeans', color: 'blue', season: 'all', occasion: 'casual', brand: 'Levi\'s' },
    { name: 'Black Chinos', category: 'bottom', subcategory: 'pants', color: 'black', season: 'all', occasion: 'business', brand: 'Gap' },
    { name: 'Khaki Shorts', category: 'bottom', subcategory: 'shorts', color: 'khaki', season: 'summer', occasion: 'casual', brand: 'Old Navy' },
    { name: 'Grey Joggers', category: 'bottom', subcategory: 'pants', color: 'grey', season: 'all', occasion: 'workout', brand: 'Adidas' },
    { name: 'White Sneakers', category: 'shoes', subcategory: 'sneakers', color: 'white', season: 'all', occasion: 'casual', brand: 'Adidas' },
    { name: 'Brown Leather Boots', category: 'shoes', subcategory: 'boots', color: 'brown', season: 'winter', occasion: 'casual', brand: 'Timberland' },
    { name: 'Black Formal Shoes', category: 'shoes', subcategory: 'formal', color: 'black', season: 'all', occasion: 'formal', brand: 'Clarks' },
    { name: 'Denim Jacket', category: 'outerwear', subcategory: 'jacket', color: 'blue', season: 'spring', occasion: 'casual', brand: 'Levi\'s' },
    { name: 'Black Blazer', category: 'outerwear', subcategory: 'blazer', color: 'black', season: 'all', occasion: 'formal', brand: 'Zara' },
    { name: 'Beige Trench Coat', category: 'outerwear', subcategory: 'coat', color: 'beige', season: 'fall', occasion: 'business', brand: 'H&M' },
    { name: 'Leather Belt', category: 'accessory', subcategory: 'belt', color: 'brown', season: 'all', occasion: 'casual', brand: 'Local' },
    { name: 'Black Backpack', category: 'accessory', subcategory: 'bag', color: 'black', season: 'all', occasion: 'casual', brand: 'Nike' },
    { name: 'Silver Watch', category: 'accessory', subcategory: 'jewelry', color: 'silver', season: 'all', occasion: 'formal', brand: 'Casio' },
    { name: 'Baseball Cap', category: 'accessory', subcategory: 'hat', color: 'black', season: 'summer', occasion: 'casual', brand: 'Nike' },
  ];

  const stmt = db.prepare(`
    INSERT INTO wardrobe (id, user_id, name, category, subcategory, color, season, occasion, brand, times_worn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  items.forEach((item, idx) => {
    stmt.run(
      uuidv4(),
      uid,
      item.name,
      item.category,
      item.subcategory,
      item.color,
      item.season,
      item.occasion,
      item.brand,
      Math.floor(Math.random() * 12)
    );
  });

  console.log(`✅ Added ${items.length} wardrobe items`);

  // Create a couple of sample outfits
  const wardrobeItems = db.prepare('SELECT id, name, category FROM wardrobe WHERE user_id = ?').all(uid);
  const getByCat = (cat) => wardrobeItems.filter(i => i.category === cat);

  const outfit1Items = [
    getByCat('top')[0]?.id,
    getByCat('bottom')[0]?.id,
    getByCat('shoes')[0]?.id,
    getByCat('accessory')[0]?.id
  ].filter(Boolean);

  const outfit2Items = [
    getByCat('top')[1]?.id,
    getByCat('bottom')[1]?.id,
    getByCat('shoes')[2]?.id,
    getByCat('outerwear')[1]?.id
  ].filter(Boolean);

  if (outfit1Items.length >= 2) {
    db.prepare(`
      INSERT INTO outfits (id, user_id, name, occasion, season, item_ids, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), uid, 'Everyday Casual', 'casual', 'all', JSON.stringify(outfit1Items), 'Go-to weekend look');
  }

  if (outfit2Items.length >= 2) {
    db.prepare(`
      INSERT INTO outfits (id, user_id, name, occasion, season, item_ids, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), uid, 'Office Ready', 'business', 'all', JSON.stringify(outfit2Items), 'Smart casual for work');
  }

  console.log('✅ Sample outfits created');
  console.log('\n🎉 Seed complete! You can now login with the demo account.\n');
}

seed().catch(console.error);

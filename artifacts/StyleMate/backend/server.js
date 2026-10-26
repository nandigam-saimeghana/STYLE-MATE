const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'stylemate-secret-key-change-in-production-2026';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database setup
const db = new Database(path.join(__dirname, 'stylemate.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT DEFAULT 'unisex',
    style_preference TEXT DEFAULT 'casual',
    favorite_colors TEXT DEFAULT '[]',
    body_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wardrobe (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    color TEXT,
    season TEXT DEFAULT 'all',
    occasion TEXT DEFAULT 'casual',
    brand TEXT,
    image_url TEXT,
    notes TEXT,
    times_worn INTEGER DEFAULT 0,
    last_worn DATE,
    is_favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS outfits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    occasion TEXT,
    season TEXT,
    weather TEXT,
    item_ids TEXT NOT NULL,
    notes TEXT,
    is_favorite INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    worn_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS style_quiz (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    answers TEXT NOT NULL,
    result_style TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ========== AUTH ROUTES ==========
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    db.prepare(
      'INSERT INTO users (id, name, email, password, gender) VALUES (?, ?, ?, ?, ?)'
    ).run(id, name, email, hashed, gender || 'unisex');

    const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id, name, email, gender: gender || 'unisex' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        style_preference: user.style_preference,
        favorite_colors: JSON.parse(user.favorite_colors || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare(
    'SELECT id, name, email, gender, style_preference, favorite_colors, body_type FROM users WHERE id = ?'
  ).get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.favorite_colors = JSON.parse(user.favorite_colors || '[]');
  res.json(user);
});

app.put('/api/auth/profile', auth, (req, res) => {
  const { name, gender, style_preference, favorite_colors, body_type } = req.body;
  db.prepare(`
    UPDATE users SET
      name = COALESCE(?, name),
      gender = COALESCE(?, gender),
      style_preference = COALESCE(?, style_preference),
      favorite_colors = COALESCE(?, favorite_colors),
      body_type = COALESCE(?, body_type)
    WHERE id = ?
  `).run(
    name || null,
    gender || null,
    style_preference || null,
    favorite_colors ? JSON.stringify(favorite_colors) : null,
    body_type || null,
    req.userId
  );
  const user = db.prepare(
    'SELECT id, name, email, gender, style_preference, favorite_colors, body_type FROM users WHERE id = ?'
  ).get(req.userId);
  user.favorite_colors = JSON.parse(user.favorite_colors || '[]');
  res.json(user);
});

// ========== WARDROBE ROUTES ==========
app.get('/api/wardrobe', auth, (req, res) => {
  const { category, season, color, search } = req.query;
  let sql = 'SELECT * FROM wardrobe WHERE user_id = ?';
  const params = [req.userId];

  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (season) { sql += ' AND (season = ? OR season = "all")'; params.push(season); }
  if (color) { sql += ' AND color LIKE ?'; params.push(`%${color}%`); }
  if (search) { sql += ' AND (name LIKE ? OR brand LIKE ? OR notes LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  sql += ' ORDER BY created_at DESC';
  const items = db.prepare(sql).all(...params);
  res.json(items);
});

app.post('/api/wardrobe', auth, upload.single('image'), (req, res) => {
  try {
    const { name, category, subcategory, color, season, occasion, brand, notes } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required' });

    const id = uuidv4();
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    db.prepare(`
      INSERT INTO wardrobe (id, user_id, name, category, subcategory, color, season, occasion, brand, image_url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.userId, name, category,
      subcategory || null, color || null,
      season || 'all', occasion || 'casual',
      brand || null, image_url, notes || null
    );

    const item = db.prepare('SELECT * FROM wardrobe WHERE id = ?').get(id);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/wardrobe/:id', auth, upload.single('image'), (req, res) => {
  const item = db.prepare('SELECT * FROM wardrobe WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const { name, category, subcategory, color, season, occasion, brand, notes, is_favorite } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : item.image_url;

  db.prepare(`
    UPDATE wardrobe SET
      name = COALESCE(?, name),
      category = COALESCE(?, category),
      subcategory = COALESCE(?, subcategory),
      color = COALESCE(?, color),
      season = COALESCE(?, season),
      occasion = COALESCE(?, occasion),
      brand = COALESCE(?, brand),
      notes = COALESCE(?, notes),
      is_favorite = COALESCE(?, is_favorite),
      image_url = ?
    WHERE id = ?
  `).run(
    name || null, category || null, subcategory || null,
    color || null, season || null, occasion || null,
    brand || null, notes || null,
    is_favorite !== undefined ? Number(is_favorite) : null,
    image_url, req.params.id
  );

  res.json(db.prepare('SELECT * FROM wardrobe WHERE id = ?').get(req.params.id));
});

app.delete('/api/wardrobe/:id', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM wardrobe WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  db.prepare('DELETE FROM wardrobe WHERE id = ?').run(req.params.id);
  res.json({ message: 'Item deleted' });
});

app.post('/api/wardrobe/:id/wear', auth, (req, res) => {
  db.prepare(`
    UPDATE wardrobe SET times_worn = times_worn + 1, last_worn = DATE('now')
    WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.userId);
  res.json(db.prepare('SELECT * FROM wardrobe WHERE id = ?').get(req.params.id));
});

// ========== OUTFIT ROUTES ==========
app.get('/api/outfits', auth, (req, res) => {
  const outfits = db.prepare('SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  const enriched = outfits.map(o => {
    const ids = JSON.parse(o.item_ids || '[]');
    const items = ids.map(id => db.prepare('SELECT * FROM wardrobe WHERE id = ?').get(id)).filter(Boolean);
    return { ...o, items };
  });
  res.json(enriched);
});

app.post('/api/outfits', auth, (req, res) => {
  const { name, occasion, season, weather, item_ids, notes } = req.body;
  if (!name || !item_ids || !item_ids.length) {
    return res.status(400).json({ error: 'Name and at least one item required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO outfits (id, user_id, name, occasion, season, weather, item_ids, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.userId, name, occasion || null, season || null, weather || null, JSON.stringify(item_ids), notes || null);

  const outfit = db.prepare('SELECT * FROM outfits WHERE id = ?').get(id);
  const items = item_ids.map(i => db.prepare('SELECT * FROM wardrobe WHERE id = ?').get(i)).filter(Boolean);
  res.status(201).json({ ...outfit, items });
});

app.delete('/api/outfits/:id', auth, (req, res) => {
  db.prepare('DELETE FROM outfits WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ message: 'Outfit deleted' });
});

app.post('/api/outfits/:id/wear', auth, (req, res) => {
  const outfit = db.prepare('SELECT * FROM outfits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!outfit) return res.status(404).json({ error: 'Outfit not found' });

  db.prepare('UPDATE outfits SET worn_date = DATE("now") WHERE id = ?').run(req.params.id);
  const ids = JSON.parse(outfit.item_ids || '[]');
  ids.forEach(id => {
    db.prepare('UPDATE wardrobe SET times_worn = times_worn + 1, last_worn = DATE("now") WHERE id = ?').run(id);
  });
  res.json({ message: 'Outfit marked as worn' });
});

// ========== RECOMMENDATION ENGINE ==========
app.post('/api/recommend', auth, (req, res) => {
  const { occasion = 'casual', season = 'all', weather = 'mild', color_preference } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const wardrobe = db.prepare('SELECT * FROM wardrobe WHERE user_id = ?').all(req.userId);

  if (wardrobe.length < 2) {
    return res.json({
      message: 'Add more items to your wardrobe for better recommendations',
      suggestions: []
    });
  }

  // Rule-based recommendation engine
  const seasonMatch = (item) => item.season === 'all' || item.season === season || season === 'all';
  const occasionMatch = (item) => {
    if (occasion === 'formal') return ['formal', 'business', 'party'].includes(item.occasion);
    if (occasion === 'party') return ['party', 'formal', 'casual'].includes(item.occasion);
    if (occasion === 'workout') return item.occasion === 'workout' || item.category === 'activewear';
    return true;
  };

  const filtered = wardrobe.filter(i => seasonMatch(i) && occasionMatch(i));

  const tops = filtered.filter(i => ['top', 'shirt', 'tshirt', 'blouse', 'sweater', 'hoodie'].includes(i.category.toLowerCase()));
  const bottoms = filtered.filter(i => ['bottom', 'pants', 'jeans', 'skirt', 'shorts', 'trousers'].includes(i.category.toLowerCase()));
  const shoes = filtered.filter(i => ['shoes', 'sneakers', 'boots', 'sandals', 'heels'].includes(i.category.toLowerCase()));
  const outerwear = filtered.filter(i => ['jacket', 'coat', 'blazer', 'outerwear'].includes(i.category.toLowerCase()));
  const accessories = filtered.filter(i => ['accessory', 'bag', 'hat', 'scarf', 'jewelry'].includes(i.category.toLowerCase()));

  const suggestions = [];

  // Generate up to 5 outfit combinations
  for (let i = 0; i < Math.min(5, tops.length * bottoms.length || 1); i++) {
    const top = tops[i % Math.max(tops.length, 1)] || null;
    const bottom = bottoms[Math.floor(i / Math.max(tops.length, 1)) % Math.max(bottoms.length, 1)] || null;
    const shoe = shoes[i % Math.max(shoes.length, 1)] || null;
    const outer = (weather === 'cold' || weather === 'rainy') ? (outerwear[i % Math.max(outerwear.length, 1)] || null) : null;
    const acc = accessories[i % Math.max(accessories.length, 1)] || null;

    const items = [top, bottom, shoe, outer, acc].filter(Boolean);
    if (items.length >= 2) {
      // Simple color harmony score
      const colors = items.map(it => (it.color || '').toLowerCase()).filter(Boolean);
      let score = 70 + Math.floor(Math.random() * 25);
      if (color_preference && colors.some(c => c.includes(color_preference.toLowerCase()))) score += 5;

      suggestions.push({
        id: uuidv4(),
        name: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Look #${i + 1}`,
        occasion,
        season,
        weather,
        score,
        items,
        tip: generateTip(occasion, weather, items)
      });
    }
  }

  // Sort by score
  suggestions.sort((a, b) => b.score - a.score);

  res.json({
    user_style: user.style_preference,
    weather,
    occasion,
    suggestions: suggestions.slice(0, 4)
  });
});

function generateTip(occasion, weather, items) {
  const tips = {
    formal: 'Keep accessories minimal and opt for classic colors for a polished look.',
    casual: 'Mix textures for visual interest. A simple accessory can elevate the whole outfit.',
    party: 'Add a statement piece or bold color to stand out while staying comfortable.',
    workout: 'Prioritize breathable fabrics and proper footwear for performance.',
    business: 'Stick to neutral tones and well-fitted pieces for a professional appearance.'
  };
  let tip = tips[occasion] || 'Trust your instincts and wear what makes you feel confident.';
  if (weather === 'cold') tip += ' Layer up with a jacket or sweater.';
  if (weather === 'hot') tip += ' Choose light, breathable fabrics.';
  if (weather === 'rainy') tip += ' Consider waterproof outer layers.';
  return tip;
}

// ========== STYLE QUIZ ==========
app.post('/api/quiz', auth, (req, res) => {
  const { answers } = req.body;
  if (!answers) return res.status(400).json({ error: 'Answers required' });

  // Simple scoring
  const scores = { casual: 0, formal: 0, streetwear: 0, minimalist: 0, bohemian: 0 };
  answers.forEach(a => {
    if (scores[a] !== undefined) scores[a] += 1;
  });

  const result = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  const id = uuidv4();
  db.prepare(`
    INSERT OR REPLACE INTO style_quiz (id, user_id, answers, result_style)
    VALUES (?, ?, ?, ?)
  `).run(id, req.userId, JSON.stringify(answers), result);

  // Update user preference
  db.prepare('UPDATE users SET style_preference = ? WHERE id = ?').run(result, req.userId);

  res.json({
    result_style: result,
    description: getStyleDescription(result),
    scores
  });
});

function getStyleDescription(style) {
  const desc = {
    casual: 'You prefer comfortable, easy-going looks. Think jeans, tees, sneakers and relaxed fits.',
    formal: 'You lean towards polished, refined outfits. Suits, blazers, tailored pieces and classic colors suit you.',
    streetwear: 'Bold, urban and trend-forward. Hoodies, sneakers, graphic tees and statement pieces define your vibe.',
    minimalist: 'Less is more. Clean lines, neutral palettes, quality basics and understated elegance.',
    bohemian: 'Free-spirited and artistic. Flowing fabrics, earthy tones, patterns and unique accessories.'
  };
  return desc[style] || 'Your style is uniquely yours!';
}

app.get('/api/quiz', auth, (req, res) => {
  const quiz = db.prepare('SELECT * FROM style_quiz WHERE user_id = ?').get(req.userId);
  if (!quiz) return res.json(null);
  quiz.answers = JSON.parse(quiz.answers);
  res.json(quiz);
});

// ========== STATS ==========
app.get('/api/stats', auth, (req, res) => {
  const totalItems = db.prepare('SELECT COUNT(*) as count FROM wardrobe WHERE user_id = ?').get(req.userId).count;
  const totalOutfits = db.prepare('SELECT COUNT(*) as count FROM outfits WHERE user_id = ?').get(req.userId).count;
  const favorites = db.prepare('SELECT COUNT(*) as count FROM wardrobe WHERE user_id = ? AND is_favorite = 1').get(req.userId).count;
  const mostWorn = db.prepare('SELECT * FROM wardrobe WHERE user_id = ? ORDER BY times_worn DESC LIMIT 5').all(req.userId);
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count FROM wardrobe WHERE user_id = ? GROUP BY category ORDER BY count DESC
  `).all(req.userId);

  res.json({ totalItems, totalOutfits, favorites, mostWorn, byCategory });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'StyleMate', version: '1.0.0' });
});

// Start
app.listen(PORT, () => {
  console.log(`\n✨ StyleMate Backend running on http://localhost:${PORT}`);
  console.log(`   API docs: http://localhost:${PORT}/api/health\n`);
});

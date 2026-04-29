import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// ... qolgan importlar

const app = express();

// Xavfsizlik qatlamlari
app.use(helmet()); // Headerlarni himoya qilish
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://adolat-ai.uz'] : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// API so'rovlarini cheklash (Har 15 daqiqada max 100 ta so'rov)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Haddan tashqari ko'p so'rov yuborildi. Iltimos, birozdan so'ng urunib ko'ring." }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
// ... qolgan kodlar

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

import { search, SafeSearchType } from 'duck-duck-scrape';

initDB();

async function logAiCall(userId: any, provider: string, model: string, promptTokens: number, completionTokens: number, latency: number, cost: number, error: string | null) {
  try {
    await pool.query(
      `INSERT INTO ai_logs (user_id, provider, model, prompt_tokens, completion_tokens, total_tokens, latency_ms, cost_estimate, error_message) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId || null, provider, model, promptTokens, completionTokens, promptTokens + completionTokens, latency, cost, error]
    );
  } catch(e) {
    console.error("Failed to log AI call", e);
  }
}

async function callOpenAI(systemPrompt: string, messages: any[], model: string, timeoutMs: number, userId: any) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10).map((m: any) => ({ role: m.role, content: m.content }))],
      temperature: 0.1,
    }, { signal: controller.signal });
    clearTimeout(id);
    
    const latency = Date.now() - start;
    const pTokens = completion.usage?.prompt_tokens || 0;
    const cTokens = completion.usage?.completion_tokens || 0;
    const cost = (pTokens / 1000000 * 0.15) + (cTokens / 1000000 * 0.60);
    
    await logAiCall(userId, 'openai', model, pTokens, cTokens, latency, cost, null);
    return completion.choices[0].message.content;
  } catch (error: any) {
    await logAiCall(userId, 'openai', model, 0, 0, Date.now() - start, 0, error.message);
    throw error;
  }
}

async function callGemini(systemPrompt: string, messages: any[], model: string, timeoutMs: number, userId: any) {
  const start = Date.now();
  try {
    const geminiMessages = messages.slice(-10).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
    
    const response = await ai.models.generateContent({
      model: model,
      contents: geminiMessages,
      config: { systemInstruction: systemPrompt, temperature: 0.1 }
    });
    const latency = Date.now() - start;
    await logAiCall(userId, 'gemini', model, 0, 0, latency, 0, null);
    return response.text;
  } catch (error: any) {
    await logAiCall(userId, 'gemini', model, 0, 0, Date.now() - start, 0, error.message);
    throw error;
  }
}

app.post('/api/chat/ask', async (req, res) => {
  const { messages, language, tier, userId } = req.body;
  
  try {
    const lastMessage = messages[messages.length - 1].content;
    const context = await getLegalContext(lastMessage);

    const systemPrompt = `
Siz "Adolat AI" — O'zbekiston Respublikasining rasmiy huquqiy va davlat xizmatlari RAG tizimisiz.
Sizning yagona vazifangiz taqdim etilgan RASMIY KONTEKST asosida foydalanuvchi savoliga javob berish.

QAT'IY QOIDALAR:
1. FAQAT TAQDIM ETILGAN KONTEKSTGA TAYANING. O'z ichki bilimingizdan foydalanib ma'lumot to'qimang.
2. JAVOB QOIDASI: Agar taqdim etilgan kontekstda savolga javob bo'lmasa, aynan ushbu gapni ayting: 
   "Aniq rasmiy manba topilmadi. Savol bo'yicha rasmiy ma'lumotni tegishli davlat organi orqali tekshirish tavsiya etiladi."
3. JAVOB FORMATI (Har bir javobda quyidagilar bo'lishi shart):
   - Manba nomi:
   - Hujjat nomi:
   - Modda/band:
   - Sana (agar mavjud bo'lsa oxirgi yangilangan sana):
   - Havola (Link):
4. MULTI-SOURCE ANSWER POLICY (Ziddiyatlarni hal qilish):
   Agar bir nechta manba turlicha ma'lumot bersa:
   - Rasmiy normativ hujjat ustun qo'yilsin.
   - Eng yangi sana ustun qo'yilsin.
   - Lex.uz dagi amal qilayotgan hujjat ustun qo'yilsin.
   - Manbalar o'rtasida farq borligi foydalanuvchiga ochiq aytilsin.
5. UYDIRMA TAQIQLANADI: Mavjud bo'lmagan qonun, sana, raqam yoki moddani aslo yozmang.
6. TIL: Foydalanuvchi tilida javob bering.

KONTEKST (RASMIY MANBALAR):
${context || 'Hech qanday rasmiy ma\'lumot topilmadi.'}
`;

    const settingsReq = await pool.query("SELECT * FROM ai_settings LIMIT 1");
    const aiConfig = settingsReq.rows[0] || { primary_provider: 'openai', fallback_provider: 'gemini', timeout_ms: 10000 };
    
    const primary = process.env.AI_PRIMARY_PROVIDER || aiConfig.primary_provider;
    const fallback = process.env.AI_FALLBACK_PROVIDER || aiConfig.fallback_provider;
    
    const oModel = tier === 'vip' || tier === 'ultra' ? 'gpt-4o' : (aiConfig.primary_model || 'gpt-4o-mini');
    const gModel = tier === 'vip' || tier === 'ultra' ? 'gemini-2.5-pro' : (aiConfig.fallback_model || 'gemini-2.5-flash');

    let finalResponse = null;

    if (primary === 'openai') {
        try {
            finalResponse = await callOpenAI(systemPrompt, messages, oModel, aiConfig.timeout_ms, userId);
        } catch (e) {
            console.log("OpenAI failed, falling back to Gemini...");
            finalResponse = await callGemini(systemPrompt, messages, gModel, aiConfig.timeout_ms, userId);
        }
    } else {
        try {
            finalResponse = await callGemini(systemPrompt, messages, gModel, aiConfig.timeout_ms, userId);
        } catch (e) {
            console.log("Gemini failed, falling back to OpenAI...");
            finalResponse = await callOpenAI(systemPrompt, messages, oModel, aiConfig.timeout_ms, userId);
        }
    }

    res.json({ content: finalResponse });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: error.message || 'AI xatosi' });
  }
});

app.post('/api/admin/reindex', async (req, res) => {
    const { query } = req.body;
    try {
        const count = await reindexLegalData(query || "O'zbekiston yangi qonunlari");
        res.json({ success: true, indexedCount: count });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    // allow login via email or phone or 'admin' string
    const result = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $1', [login]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      user: {
        id: user.id.toString(),
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (full_name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [fullName, email, phone, hash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      user: {
        id: user.id.toString(),
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error detail:', error);
    res.status(500).json({ error: "Xatolik yuz berdi yoki bu email oldin ishlatilgan" });
  }
});

// ─── AUTH: Update Profile ─────────────────────────────────────────────────────
app.put('/api/auth/profile', async (req, res) => {
  const { fullName, phone, avatarUrl } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token kerak' });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    await pool.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), last_active = CURRENT_TIMESTAMP WHERE id = $3',
      [fullName, phone, decoded.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Profilni yangilashda xatolik" });
  }
});

// ─── AUTH: Change Password ────────────────────────────────────────────────────
app.post('/api/auth/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token kerak' });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Joriy parol noto'g'ri" });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, decoded.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Parolni o'zgartirishda xatolik" });
  }
});

// ─── AUTH: Forgot Password ────────────────────────────────────────────────────
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Bu email bilan foydalanuvchi topilmadi" });
    // Generate a temporary reset token valid 30 min
    const resetToken = jwt.sign({ id: result.rows[0].id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '30m' });
    // In production: send email. For now respond with token in dev.
    res.json({ success: true, message: "Parolni tiklash uchun yo'riqnoma yuborildi", resetToken });
  } catch (error) {
    res.status(500).json({ error: "Xatolik yuz berdi" });
  }
});

// ─── AUTH: Reset Password ─────────────────────────────────────────────────────
app.post('/api/auth/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    const decoded: any = jwt.verify(resetToken, JWT_SECRET);
    if (decoded.purpose !== 'reset') return res.status(400).json({ error: "Token noto'g'ri" });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, decoded.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: "Token muddati o'tgan yoki noto'g'ri" });
  }
});

// ─── ADMIN: Block / Unblock User ──────────────────────────────────────────────
app.post('/api/admin/users/:id/block', async (req, res) => {
  try {
    await pool.query('UPDATE users SET blocked = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/admin/users/:id/unblock', async (req, res) => {
  try {
    await pool.query('UPDATE users SET blocked = false WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ─── DOCUMENTS: Analyze ───────────────────────────────────────────────────────
app.post('/api/documents/analyze', async (req, res) => {
  const { fileName, fileContent, language } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const context = fileContent ? await getLegalContext(fileContent.slice(0, 1000)) : '';
    const lang = language || 'uz';
    const prompt = lang === 'uz'
      ? `Quyidagi hujjatni tahlil qil va JSON formatida qaytar:\n{"summary":"...","keyPoints":["..."],"risks":["..."],"recommendations":["..."]}\n\nHujjat:\n${fileContent?.slice(0,3000)}`
      : lang === 'ru'
      ? `Проанализируй документ и верни в JSON:\n{"summary":"...","keyPoints":["..."],"risks":["..."],"recommendations":["..."]}\n\nДокумент:\n${fileContent?.slice(0,3000)}`
      : `Analyze document and return JSON:\n{"summary":"...","keyPoints":["..."],"risks":["..."],"recommendations":["..."]}\n\nDocument:\n${fileContent?.slice(0,3000)}`;

    const settingsReq = await pool.query("SELECT * FROM ai_settings LIMIT 1");
    const aiConfig = settingsReq.rows[0] || {};
    
    let resultText = '';
    try {
      const completion = await openai.chat.completions.create({
        model: aiConfig.primary_model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });
      resultText = completion.choices[0].message.content || '{}';
    } catch (e) {
      const geminiRes = await ai.models.generateContent({
        model: aiConfig.fallback_model || 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      resultText = geminiRes.text || '{}';
    }

    const cleaned = resultText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Tahlil qilib bo\'lmadi' });
  }
});

// ─── DOCUMENTS: Generate ──────────────────────────────────────────────────────
app.post('/api/documents/generate', async (req, res) => {
  const { type, details, language } = req.body;
  try {
    const lang = language || 'uz';
    const typeNames: Record<string, Record<string, string>> = {
      uz: { ariza: 'Ariza', shikoyat: 'Shikoyat', davo: "Da'vo arizasi", tushuntirish: 'Tushuntirish xati', contract: 'Shartnoma' },
      ru: { ariza: 'Заявление', shikoyat: 'Жалоба', davo: 'Исковое заявление', tushuntirish: 'Объяснительная', contract: 'Договор' },
      en: { ariza: 'Application', shikoyat: 'Complaint', davo: 'Claim', tushuntirish: 'Explanation', contract: 'Contract' },
    };
    const typeName = typeNames[lang]?.[type] || type;
    const prompt = lang === 'uz'
      ? `O'zbek tilida rasmiy "${typeName}" yoz. Quyidagi ma'lumotlar asosida:\n${details}\n\nTo'liq va rasmiy hujjat yoz.`
      : lang === 'ru'
      ? `Напиши официальный документ "${typeName}" на основе:\n${details}`
      : `Write official "${typeName}" based on:\n${details}`;

    const settingsReq = await pool.query("SELECT * FROM ai_settings LIMIT 1");
    const aiConfig = settingsReq.rows[0] || {};

    let text = '';
    try {
      const completion = await openai.chat.completions.create({
        model: aiConfig.primary_model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });
      text = completion.choices[0].message.content || '';
    } catch (e) {
      const geminiRes = await ai.models.generateContent({
        model: aiConfig.fallback_model || 'gemini-2.5-flash',
        contents: prompt,
      });
      text = geminiRes.text || '';
    }
    res.json({ text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Hujjat yaratib bo\'lmadi' });
  }
});

// ─── PAYMENT: Payme ───────────────────────────────────────────────────────────
app.post('/api/payment/payme/generate', async (req, res) => {
  const { amount, userId, tierId, isYearly } = req.body;
  if (!amount || !userId) return res.status(400).json({ error: 'amount va userId kiritilishi shart' });
  try {
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, amount, 'pending']
    );
    const transactionId = result.rows[0].id;
    const paymeId = process.env.PAYME_MERCHANT_ID || '';
    const params = Buffer.from(`m=${paymeId};ac.order_id=${transactionId};a=${amount * 100}`).toString('base64');
    const url = `https://checkout.paycom.uz/${params}`;
    res.json({ url, transactionId });
  } catch (error) {
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

// ─── PAYMENT: Card (Uzcard/Humo/Visa) ────────────────────────────────────────
app.post('/api/payment/card/create', async (req, res) => {
  const { amount, userId, method, tierId, isYearly, promoCode } = req.body;
  if (!amount || !userId) return res.status(400).json({ error: 'amount va userId kiritilishi shart' });
  try {
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, amount, 'pending']
    );
    const transactionId = result.rows[0].id;
    // For now: Uzcard/Humo/Visa requires bank integration (Uzcard API, etc.)
    // Return pending status — admin confirms manually or bank webhook updates
    res.json({ 
      success: true, 
      transactionId,
      message: `${method?.toUpperCase()} orqali to'lov. Amalga oshirish uchun +998901234567 raqamiga bog'laning.`,
      bankDetails: {
        cardNumber: '8600 0000 0000 0001',
        owner: 'ADOLAT AI LLC',
        amount: amount,
        reference: `TX-${transactionId}`
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const [usersRes, tierRes, revenueRes, aiLogsRes, todayRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT tier, COUNT(*) FROM users GROUP BY tier"),
      pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'completed'"),
      pool.query('SELECT COUNT(*) FROM ai_logs WHERE created_at > NOW() - INTERVAL \'30 days\''),
      pool.query("SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE"),
    ]);
    
    const totalUsers = parseInt(usersRes.rows[0].count, 10);
    const newUsersToday = parseInt(todayRes.rows[0].count, 10);
    const totalRevenue = parseInt(revenueRes.rows[0].total, 10);
    const totalQueries = parseInt(aiLogsRes.rows[0].count, 10);
    
    const tierDist: any = { free: 0, pro: 0, ultra: 0, vip: 0 };
    tierRes.rows.forEach((r: any) => { if (tierDist[r.tier] !== undefined) tierDist[r.tier] = parseInt(r.count); });
    
    // Monthly growth data for charts (last 6 months)
    const growthRes = await pool.query(`
      SELECT TO_CHAR(date_trunc('month', created_at), 'Mon') as month, COUNT(*) as count
      FROM users WHERE created_at > NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY MIN(created_at)
    `);
    const revenueChartRes = await pool.query(`
      SELECT TO_CHAR(date_trunc('month', created_at), 'Mon') as month, COALESCE(SUM(amount),0) as total
      FROM transactions WHERE status = 'completed' AND created_at > NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY MIN(created_at)
    `);

    res.json({
      totalUsers,
      newUsersToday,
      activeSubscriptions: tierDist.pro + tierDist.ultra + tierDist.vip,
      totalRevenue,
      totalQueries,
      revenueChangePercent: 0,
      queriesChangePercent: 0,
      tierDistribution: tierDist,
      revenueChart: {
        labels: revenueChartRes.rows.map((r: any) => r.month) || ['Yan'],
        values: revenueChartRes.rows.map((r: any) => parseInt(r.total)) || [0]
      },
      userGrowth: {
        labels: growthRes.rows.map((r: any) => r.month) || ['Yan'],
        values: growthRes.rows.map((r: any) => parseInt(r.count)) || [totalUsers]
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    const users = result.rows.map(user => ({
      id: user.id.toString(),
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      tier: user.tier,
      createdAt: user.created_at,
      lastActive: user.last_active,
      blocked: user.blocked,
      totalChats: user.total_chats,
      totalDocs: user.total_docs,
      totalSpent: user.total_spent
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/ai-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_settings LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/ai-settings', async (req, res) => {
  const { primary_provider, fallback_provider, primary_model, fallback_model, timeout_ms, retry_count, is_active } = req.body;
  try {
    const count = await pool.query('SELECT COUNT(*) FROM ai_settings');
    if (parseInt(count.rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO ai_settings (primary_provider, fallback_provider, primary_model, fallback_model, timeout_ms, retry_count, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [primary_provider, fallback_provider, primary_model, fallback_model, timeout_ms, retry_count, is_active]
      );
    } else {
      await pool.query(
        'UPDATE ai_settings SET primary_provider = $1, fallback_provider = $2, primary_model = $3, fallback_model = $4, timeout_ms = $5, retry_count = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP',
        [primary_provider, fallback_provider, primary_model, fallback_model, timeout_ms, retry_count, is_active]
      );
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

const crypto = require('crypto');

app.post('/api/payment/click/generate', async (req, res) => {
  const { amount, userId } = req.body;
  
  if (!amount || !userId) {
    return res.status(400).json({ error: 'amount va userId kiritilishi shart' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO transactions (user_id, amount, status) VALUES ($1, $2, $3) RETURNING id',
      [userId, amount, 'pending']
    );
    const transactionId = result.rows[0].id;
    
    const serviceId = process.env.CLICK_SERVICE_ID;
    const merchantId = process.env.CLICK_MERCHANT_ID;
    const returnUrl = encodeURIComponent('https://adolat-ai.uz/payment-success'); // Mock return URL for professional look
    const url = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${amount}&transaction_param=${transactionId}&return_url=${returnUrl}`;
    
    res.json({ url, transactionId });
  } catch (error) {
    res.status(500).json({ error: 'Server xatoligi' });
  }
});

app.post('/api/payment/click/callback', async (req, res) => {
  const {
    click_trans_id, service_id, click_paydoc_id, merchant_trans_id,
    amount, action, error, error_note, sign_time, sign_string, merchant_prepare_id
  } = req.body;

  const secretKey = process.env.CLICK_SECRET_KEY;
  
  let signStringCheck = '';
  if (action == 0) {
    signStringCheck = crypto.createHash('md5').update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${action}${sign_time}`).digest('hex');
  } else if (action == 1) {
    signStringCheck = crypto.createHash('md5').update(`${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`).digest('hex');
  }

  if (sign_string !== signStringCheck) {
    return res.json({ error: -1, error_note: 'Sign check error' });
  }

  if (action == 0) { // Prepare
    const tx = await pool.query('SELECT * FROM transactions WHERE id = $1', [merchant_trans_id]);
    if (tx.rows.length === 0) return res.json({ error: -5, error_note: 'Transaction does not exist' });
    if (tx.rows[0].status !== 'pending') return res.json({ error: -4, error_note: 'Already paid or cancelled' });
    if (parseFloat(tx.rows[0].amount) !== parseFloat(amount)) return res.json({ error: -2, error_note: 'Incorrect amount' });
    
    await pool.query('UPDATE transactions SET click_trans_id = $1 WHERE id = $2', [click_trans_id, merchant_trans_id]);
    return res.json({ click_trans_id, merchant_trans_id, merchant_prepare_id: merchant_trans_id, error: 0, error_note: 'Success' });
  } else if (action == 1) { // Complete
    const tx = await pool.query('SELECT * FROM transactions WHERE id = $1', [merchant_trans_id]);
    if (tx.rows.length === 0) return res.json({ error: -5, error_note: 'Transaction does not exist' });
    if (tx.rows[0].status === 'completed') return res.json({ error: -4, error_note: 'Already paid' });
    
    if (error == 0) {
      await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', ['completed', merchant_trans_id]);
      await pool.query('UPDATE users SET total_spent = total_spent + $1 WHERE id = $2', [amount, tx.rows[0].user_id]);
      // Optional: upgrade tier logic here based on amount
    } else {
      await pool.query('UPDATE transactions SET status = $1 WHERE id = $2', ['cancelled', merchant_trans_id]);
    }
    
    return res.json({ click_trans_id, merchant_trans_id, merchant_confirm_id: merchant_trans_id, error: 0, error_note: 'Success' });
  }

  return res.json({ error: -3, error_note: 'Action not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


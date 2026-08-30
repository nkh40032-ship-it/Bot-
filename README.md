# 🤖 Azora Discord Bot

بوت ديسكورد احترافي لموقع **Azora Novels**:
- ينشر تلقائيًا في السيرفر عند صدور **رواية جديدة** أو **فصل جديد** على الموقع.
- أوامر Slash احترافية: `/latest` · `/novel` · `/stats` · `/setchannel` · `/help`.
- مربوط مباشرة بالقالب عبر REST API مخصص (`animax/v1`).

---

## 📁 هيكل المشروع

```
azora-discord-bot/
├── commands/          # أوامر Slash
├── utils/             # أدوات مساعدة (اتصال بالموقع + تخزين الروم)
├── index.js           # نقطة التشغيل الرئيسية (البوت + سيرفر الإشعارات)
├── deploy-commands.js # سكربت تسجيل الأوامر عند ديسكورد
├── package.json
└── .env.example
```

---

## 1️⃣ إنشاء تطبيق البوت على ديسكورد

1. ادخل على [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → اختر اسم (مثلاً `Azora Novels Bot`)
3. من تبويب **Bot** → **Reset Token** وانسخ التوكن (هتحتاجه في `DISCORD_TOKEN`)
4. من نفس الصفحة فعّل: **MESSAGE CONTENT INTENT** مش لازم لهذا البوت (مش مستخدم)، سيبها زي ما هي
5. من تبويب **OAuth2 → URL Generator**:
   - Scopes: `bot` + `applications.commands`
   - Bot Permissions: `Send Messages`, `Embed Links`, `Read Message History`
   - انسخ الرابط الناتج وافتحه لإضافة البوت لسيرفرك
6. من **General Information** انسخ **Application ID** (هو نفسه `CLIENT_ID`)

---

## 2️⃣ رفع المشروع على GitHub

```bash
cd azora-discord-bot
git init
git add .
git commit -m "Initial commit: Azora Discord Bot"
git branch -M main
git remote add origin https://github.com/USERNAME/azora-discord-bot.git
git push -u origin main
```

> ملاحظة: ملف `.env` مستثنى تلقائيًا عبر `.gitignore` — لا ترفعه أبدًا لأنه يحتوي التوكن السري.

---

## 3️⃣ الرفع على Railway

1. ادخل [railway.com](https://railway.com) وسجّل دخول بحساب GitHub
2. **New Project** → **Deploy from GitHub repo** → اختر مستودع `azora-discord-bot`
3. Railway هيكتشف `package.json` تلقائيًا ويبني المشروع (Nixpacks)
4. من تبويب **Variables** ضيف المتغيرات التالية:

| المتغير | القيمة |
|---|---|
| `DISCORD_TOKEN` | توكن البوت من الخطوة 1 |
| `CLIENT_ID` | Application ID |
| `ANNOUNCE_CHANNEL_ID` | معرف الروم الافتراضي للإشعارات (اختياري، تقدر تستخدم `/setchannel` بدلاً منه) |
| `SITE_API_URL` | `https://your-site.com/wp-json/animax/v1/` (من لوحة تحكم الموقع) |
| `WEBHOOK_SECRET` | نفس المفتاح السري المضبوط في لوحة تحكم الموقع |
| `PORT` | (اختياري، Railway بيحدده تلقائيًا) |

5. بعد أول نشر، Railway هيديك رابط عام (Public Domain) من تبويب **Settings → Networking → Generate Domain**
   - هيكون شكله: `https://azora-discord-bot-production.up.railway.app`
   - الرابط ده + `/notify` هو اللي هتحطه في **لوحة Animax → الإعدادات العامة → بوت ديسكورد → رابط الويب هوك**
   - مثال: `https://azora-discord-bot-production.up.railway.app/notify`

6. كل تحديث تعمله على GitHub (push) هيتنشر تلقائيًا على Railway (Auto Deploy).

---

## 4️⃣ تسجيل أوامر Slash

مرة واحدة بعد كل نشر (أو بعد إضافة/تعديل أمر):

**محليًا:**
```bash
npm install
cp .env.example .env   # واملأ القيم
npm run deploy-commands
```

**أو مباشرة على Railway** (من تبويب Deployments → افتح Shell، أو أضف الأمر مؤقتًا كـ One-off Command):
```bash
node deploy-commands.js
```

> لو حطيت `GUILD_ID` في `.env` هتظهر الأوامر فورًا في السيرفر ده بس (مفيد للتجربة).
> لو سبتها فاضية، هتُسجَّل بشكل عام لكل السيرفرات (قد تستغرق حتى ساعة للظهور أول مرة).

---

## 5️⃣ ربط البوت بالموقع

في **لوحة Animax → الإعدادات العامة → 🤖 بوت ديسكورد**:
1. الصق رابط الويب هوك: `https://your-bot.up.railway.app/notify`
2. اضغط **🎲 توليد مفتاح عشوائي** وانسخه، وحطه في متغير `WEBHOOK_SECRET` على Railway (لازم يكون **نفس القيمة بالظبط** في المكانين)
3. احفظ الإعدادات

من الآن، أي رواية أو فصل جديد يُنشر → إشعار تلقائي في روم ديسكورد المحدد.

---

## ⚡ الأوامر المتاحة

| الأمر | الوصف |
|---|---|
| `/latest [count]` | عرض أحدث الفصول المنشورة (1-10) |
| `/novel <اسم>` | البحث عن رواية بالاسم |
| `/stats` | إحصائيات الموقع (روايات، فصول، أعضاء) |
| `/setchannel <روم>` | تحديد روم الإشعارات التلقائية (للمشرفين فقط) |
| `/help` | عرض قائمة الأوامر |

---

## 🧪 تشغيل محلي (اختياري، للتطوير)

```bash
npm install
cp .env.example .env   # واملأ القيم
npm run deploy-commands
npm start
```

---

## 🛠️ استكشاف الأخطاء

- **الأوامر مش ظاهرة بديسكورد** → تأكد إنك شغّلت `node deploy-commands.js` بعد آخر تعديل
- **الإشعارات مش بتوصل** → تأكد إن `WEBHOOK_SECRET` نفسه في الموقع وفي Railway، وإن حد استخدم `/setchannel` أو ضبطت `ANNOUNCE_CHANNEL_ID`
- **خطأ 401 في لوجز Railway** → المفتاح السري مش متطابق بين الموقع والبوت
- **البوت مش بيرد** → تأكد إن الحالة على Railway "Active" مش "Crashed"، وراجع الـ Logs
- **خطأ "invalid json response body" عند `/stats` أو `/novel` أو `/latest`** → الموقع بيرجّع HTML بدل JSON. الأسباب الشائعة:
  1. **الروابط الدائمة (Permalinks)**: من ووردبريس → الإعدادات → الروابط الدائمة → احفظ التغييرات مجددًا (حتى لو متغيّرتش)
  2. **الاستضافة بتحجب طلبات خارجية عن `/wp-json/`**: شائع جدًا في الاستضافات المجانية (unaux, infinityfree, 000webhost). جرّب تفتح `https://موقعك.com/wp-json/animax/v1/stats` من متصفحك مباشرة — لو ظهرلك صفحة تحقق/حماية بدل JSON، لازم تستثني `/wp-json/*` من إعدادات الحماية بالاستضافة، أو تنقل لاستضافة حقيقية
  3. البوت (بعد آخر تحديث) بيرسل هيدرز متصفح حقيقية تلقائيًا لتفادي الحجب البسيط، وهيديك رسالة خطأ واضحة تحدد السبب بالظبط بدل رسالة تقنية غامضة

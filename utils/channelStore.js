/* ============================================================
   تخزين بسيط (ملف JSON) لروم الإشعارات لكل سيرفر.
   ملاحظة: نظام ملفات Railway غير دائم بين عمليات إعادة النشر —
   لو حبيت إعداد ثابت 100%، اضبط ANNOUNCE_CHANNEL_ID في Variables
   وهيُستخدم تلقائيًا كقيمة افتراضية لو مفيش روم محفوظ بالملف.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'channels.json');

function load() {
    try {
        return JSON.parse(fs.readFileSync(FILE, 'utf8'));
    } catch {
        return {};
    }
}

function save(data) {
    try {
        fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('تعذر حفظ channels.json:', err.message);
    }
}

function setAnnounceChannel(guildId, channelId) {
    const data = load();
    data[guildId] = channelId;
    save(data);
}

// يرجّع أول روم متاح: المحفوظ لأي سيرفر، أو القيمة الافتراضية من متغيرات البيئة
function getAnnounceChannel(guildId) {
    const data = load();
    return data[guildId] || process.env.ANNOUNCE_CHANNEL_ID || null;
}

function getAllAnnounceChannels() {
    const data = load();
    const ids = new Set(Object.values(data));
    if (process.env.ANNOUNCE_CHANNEL_ID) ids.add(process.env.ANNOUNCE_CHANNEL_ID);
    return [...ids];
}

module.exports = { setAnnounceChannel, getAnnounceChannel, getAllAnnounceChannels };

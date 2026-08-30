const fetch = require('node-fetch');

const BASE = (process.env.SITE_API_URL || '').replace(/\/+$/, '');

function apiUrl(path) {
    if (!BASE) throw new Error('SITE_API_URL غير مضبوط في متغيرات البيئة');
    return `${BASE}/${path.replace(/^\/+/, '')}`;
}

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'Accept': 'application/json',
};

async function fetchJson(url) {
    let res;
    try {
        res = await fetch(url, { headers: BROWSER_HEADERS, timeout: 10000 });
    } catch (err) {
        throw new Error(`تعذر الوصول للموقع أصلاً (${err.code || err.message}). تأكد إن SITE_API_URL صحيح والموقع شغال.`);
    }

    const contentType = res.headers.get('content-type') || '';
    const raw = await res.text();

    if (!contentType.includes('application/json')) {
        if (raw.includes('cf-browser-verification') || raw.includes('Just a moment') || /checking your browser/i.test(raw)) {
            throw new Error('الموقع محمي بجدار حماية (Cloudflare) بيحجب طلبات البوت. لازم تستثني مسار /wp-json/ من الحماية.');
        }
        if (res.status === 404) {
            throw new Error('الرابط رجّع 404. راجع إعدادات الروابط الدائمة (Permalinks) في ووردبريس واحفظها مجددًا.');
        }
        throw new Error(`الموقع رجّع صفحة HTML بدل بيانات JSON (الحالة: ${res.status}). الاستضافة غالبًا بتحجب طلبات السيرفرات الخارجية عن /wp-json/.`);
    }

    if (!res.ok) {
        throw new Error(`فشل الاتصال بالموقع (${res.status})`);
    }

    try {
        return JSON.parse(raw);
    } catch {
        throw new Error('رد الموقع بصيغة غير صالحة (JSON تالف).');
    }
}

async function getLatestChapters(limit = 5) {
    return fetchJson(apiUrl(`latest-chapters?limit=${limit}`));
}

async function searchNovel(query) {
    return fetchJson(apiUrl(`novel-search?q=${encodeURIComponent(query)}`));
}

async function getStats() {
    return fetchJson(apiUrl('stats'));
}

module.exports = { getLatestChapters, searchNovel, getStats };

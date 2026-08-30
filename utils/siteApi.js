const fetch = require('node-fetch');

const BASE = (process.env.SITE_API_URL || '').replace(/\/+$/, '');

function apiUrl(path) {
    if (!BASE) throw new Error('SITE_API_URL غير مضبوط في متغيرات البيئة');
    return `${BASE}/${path.replace(/^\/+/, '')}`;
}

async function getLatestChapters(limit = 5) {
    const res = await fetch(apiUrl(`latest-chapters?limit=${limit}`));
    if (!res.ok) throw new Error(`فشل الاتصال بالموقع (${res.status})`);
    return res.json();
}

async function searchNovel(query) {
    const res = await fetch(apiUrl(`novel-search?q=${encodeURIComponent(query)}`));
    if (!res.ok) throw new Error(`فشل الاتصال بالموقع (${res.status})`);
    return res.json();
}

async function getStats() {
    const res = await fetch(apiUrl('stats'));
    if (!res.ok) throw new Error(`فشل الاتصال بالموقع (${res.status})`);
    return res.json();
}

module.exports = { getLatestChapters, searchNovel, getStats };

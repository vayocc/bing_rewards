// hotKeywords.js
// Node.js 18+，自带 fetch，不需要 node-fetch！
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function fetchOnlineHotWords(isMobile) {
    const sources = isMobile
        ? [
            {
                name: "头条热榜",
                url: "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc",
                json: true,
                parser: (d) =>
                    d.data?.map(i => i.Title).filter(Boolean) || [],
            },
        ]
        : [
            {
                name: "百度热榜",
                url: "https://top.baidu.com/api/board?tab=realtime",
                json: true,
                parser: (d) =>
                    d.data?.cards?.[0]?.content?.map(i => i.word) || [],
            },
        ];

    for (const src of sources) {
        try {
            const res = await fetch(src.url, { headers: { "User-Agent": "Mozilla/5.0" } });
            const data = src.json ? await res.json() : await res.text();
            const words = src.parser(data).filter(w => w.length >= 2);

            if (words.length > 0) {
                console.log(`🌐 获取到 ${words.length} 个热词（来源: ${src.name}）`);
                return words;
            }
        } catch (err) {
            console.warn(`❌ ${src.name} 获取失败`, err.message);
        }
    }

    console.warn("⚠️ 在线热词获取失败，将使用本地默认词库");
    return null;
}

module.exports = {
    fetchOnlineHotWords,
};

const {chromium} = require('playwright');
const { findChromePath, getUserDataDir } = require("./playwrightEnv");
const { getLaunchOptions } = require("./launchConfig");
const { fetchOnlineHotWords } = require("./hotKeywords");
// -------------------- 配置区域 --------------------


const CN_BING_URL = "https://cn.bing.com";
const MIN_SEARCH_TIMES = 48; // 最少搜索次数
const MAX_SEARCH_TIMES = 60; // 最多搜索次数
const WAIT_TIME = [10, 18];    // 每次搜索后等待的时间范围（秒）

DEFAULT_KEYWORDS = [
    //  技术 & 编程
    "best programming languages 2025", "python vs javascript", "machine learning tutorials",
    "what is cloud computing", "how to build a website", "C++ smart pointers", "Git vs SVN",
    "docker vs virtual machine", "REST vs GraphQL", "how does blockchain work", "WebAssembly tutorial",

    //  ChatGPT & AI
    "how ChatGPT works", "latest OpenAI news", "future of artificial intelligence", "AI tools for productivity",
    "ChatGPT for coding", "DALL·E image generation", "prompt engineering tips",

    //  金融 & 投资
    "Tesla stock news", "Bitcoin price prediction", "how to invest in ETFs", "stock market news today",
    "is gold a good investment", "S&P 500 index meaning", "cryptocurrency tax rules",

    //  健康 & 生活方式
    "healthy breakfast ideas", "how to sleep better", "how to reduce stress", "is coffee healthy",
    "benefits of drinking water", "best home workouts", "intermittent fasting benefits",

    //  娱乐 & 热门文化
    "Game of Thrones recap", "best Netflix shows 2025", "funny cat videos", "Marvel vs DC",
    "upcoming movies 2025", "Oscars best picture winners", "top YouTubers 2025", "Twitch vs Kick",

    //  教育 & 学习
    "top universities in the world", "best online courses", "how to learn English fast",
    "study tips for exams", "what is the GRE test", "is SAT required in 2025",

    //  旅游 & 地理
    "best travel destinations 2025", "how to get cheap flights", "top 10 cities to live in",
    "weather in Tokyo", "hiking trails near me", "digital nomad lifestyle",

    //  社会热点 & 新闻
    "Ukraine conflict explained", "US presidential election", "global warming facts",
    "climate change solutions", "latest tech news", "AI replacing jobs", "privacy concerns with smartphones",

    //  商业 & 创业
    "how to start a business", "make money online", "passive income ideas", "top e-commerce platforms",
    "dropshipping vs Amazon FBA", "remote work trends", "freelancing vs full-time job",

    //  游戏 & 电竞
    "best PC games 2025", "Valorant tips and tricks", "how to get better at Fortnite",
    "Steam summer sale", "Nintendo Switch 2 rumors", "top esports teams",

    //  杂项 & 轻松话题
    "zodiac sign personality", "meaning of dreams", "fun trivia questions", "weird facts about space",
    "does pineapple belong on pizza", "best memes of 2025", "how to cook pasta",
    "coffee vs tea", "cats vs dogs", "funny dad jokes", "TikTok trends 2025",
    // 购物相关
    "Best laptops 2025", "Smartphone deals", "Fashion trends women", "Online shopping discounts",
    "Gaming console prices", "Home appliance reviews", "Sneaker brands", "Luxury watches",
    "Budget headphones", "Furniture sales", "Electronics deals", "Black Friday 2025",
    "Amazon best sellers", "Tech gadgets 2025", "Winter clothing trends", "Jewelry gift ideas",

    // 旅游与生活
    "Top travel destinations", "Cheap flights 2025", "Hotel booking tips", "Beach vacation ideas",
    "City break Europe", "Adventure travel packages", "Cruise deals 2025", "Travel insurance comparison",
    "Camping gear reviews", "Best hiking trails", "Family vacation spots", "Solo travel tips",
    "Backpacking destinations", "Luxury resorts Asia", "Travel safety tips", "Road trip ideas",

    // 新闻与时事
    "Breaking news today", "World news updates", "US election 2025", "Global economy trends",
    "Climate change solutions", "Political debates 2025", "International conflicts", "Tech industry updates",
    "Stock market predictions", "Health policy news", "Space mission updates", "Energy crisis 2025",

    // 学术与教育
    "Online courses free", "Best coding bootcamps", "Study abroad programs", "Scholarship opportunities",
    "Academic research tools", "Math learning apps", "History documentaries", "Science podcasts",
    "University rankings 2025", "Career training programs", "Language learning tips", "STEM resources",

    // 健康与健身
    "Weight loss diets", "Home workout routines", "Mental health tips", "Meditation apps",
    "Healthy meal plans", "Fitness equipment reviews", "Yoga for beginners", "Nutrition supplements",
    "Running shoes reviews", "Stress management techniques", "Sleep improvement tips", "Vegan recipes easy",

    // 娱乐与文化
    "New movie releases", "TV show reviews 2025", "Music festivals 2025", "Book recommendations",
    "Streaming service deals", "Celebrity news today", "Top video games 2025", "Art exhibitions",
    "Theater shows 2025", "Pop music charts", "Comedy specials Netflix", "Cultural events near me",

    // 科技与创新
    "Smart home devices 2025", "Wearable tech reviews", "Electric car prices", "AI innovations",
    "5G network updates", "Virtual reality headsets", "Drone technology", "Cybersecurity tips",
    "Tech startups 2025", "Cloud storage comparison", "Programming tutorials", "Data privacy laws",

    // 其他日常搜索
    "Local weather forecast", "Event planning ideas", "DIY craft projects", "Pet adoption near me",
    "Gardening for beginners", "Car maintenance tips", "Home renovation ideas", "Wedding planning guide",
    "Photography gear reviews", "Best coffee machines", "Restaurant reviews near me", "Online grocery delivery",
    "Real estate trends 2025", "Job search websites", "Personal finance apps", "Charity organizations"
]

// -------------------- 工具函数 --------------------

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------- 随机等待  范围秒 → 毫秒）--------------------
function randomWait([min, max]) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

// -------------------- 模拟人类滚动 --------------------
async function simulateHumanScroll(page) {
    try {
        // 获取页面高度
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);

        // 随机滚动次数（1-4次）
        const scrollTimes = Math.floor(Math.random() * 14) + 1;
        let currentPosition = 0;

        for (let i = 0; i < scrollTimes; i++) {
            // 随机滚动距离（100-500像素）
            let scrollDistance = Math.floor(Math.random() * (500 - 100 + 1)) + 100;

            // 30% 概率向上滚动
            if (Math.random() < 0.3) {
                scrollDistance = -scrollDistance;
            }

            const newPosition = currentPosition + scrollDistance;
            // 用 scrollBy → 相对移动（适合小幅度、人类滚轮式滚动）。
            // 用 scrollTo → 直接到目标位置（适合顶部 / 底部）。
            if (newPosition >= 0 && newPosition < pageHeight) {
                // 滚动相对距离
                await page.evaluate(y => {
                    window.scrollBy({ top: y, behavior: "smooth" });
                }, scrollDistance);
                currentPosition = newPosition;
            } else {
                // 滚动到顶部或底部
                const target = newPosition < 0 ? 0 : pageHeight;
                await page.evaluate(y => {
                    window.scrollTo({ top: y, behavior: "smooth" });
                }, target);
                break;
            }

            // 模拟人类阅读停顿（0.5 - 2秒）
            await page.waitForTimeout(Math.random() * (2000 - 500) + 500);
        }
    } catch (e) {
        console.error("❌ simulateHumanScroll 出错:", e);
    }
}

// -------------------- 登录检查 --------------------
async function isLoggedIn(page) {
    try {
        // 判断“登录”按钮是否可见
        const visible = await page.isVisible('#id_s');
        return !visible;  // 按钮不可见 = 已登录
    } catch (e) {
        return true; // 找不到元素，默认认为已登录
    }
}

// 等待用户登录，最多等 5 分钟
async function waitForLogin(page, maxWaitMinutes = 5) {
    const interval = 5000; // 每次间隔 5 秒
    const maxAttempts = (maxWaitMinutes * 60 * 1000) / interval; // 5 分钟最多 60 次
    let attempt = 0;

    console.log("🔑 检查是否已登录...");

    while (attempt < maxAttempts) {
        attempt++;
        const loggedIn = await isLoggedIn(page);

        if (loggedIn) {
            console.log(`✅ 已检测到登录成功！（第 ${attempt} 次检查）`);
            return true;
        } else {
            console.log(`⏳ 第 ${attempt} 次检查：尚未登录，等待中...`);
            await page.waitForTimeout(interval);
        }
    }
    console.log("❌ 超时：5 分钟内未完成登录，脚本已停止。");
    return false;
}


// -------------------- 主逻辑 --------------------
(async () => {
    const launchOptions = getLaunchOptions();
    // 1. 动态生成 Args，手机模式去掉最大化，PC模式保留
    const defaultArgs = [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
        "--disable-infobars",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
    ];

// 如果是 PC，则最大化；如果是 Mobile，则不最大化（让它保持手机视窗大小）
    const finalArgs = launchOptions.isMobile
        ? defaultArgs
        : [...defaultArgs, "--start-maximized"];



    // 根据 PC/Mobile 自动取热词
    let onlineWords = await fetchOnlineHotWords(launchOptions.isMobile);
    // const keywords = onlineWords?.length ? onlineWords : DEFAULT_KEYWORDS;
    const keywords = [...(onlineWords || []), ...DEFAULT_KEYWORDS];
    const USER_DATA_DIR = getUserDataDir();
    const CHROME_PATH = findChromePath();
    console.log(`✅ 使用用户数据路径: ${USER_DATA_DIR}`);
    console.log(`✅ Chrome 路径: ${CHROME_PATH}`);
    // -------------------- 启动浏览器 + 持久化 --------------------
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        slowMo: 100,      // 放慢操作，更像人类
        executablePath: CHROME_PATH,
        args: finalArgs,
        ...launchOptions,
        locale: "zh-CN",
        timezoneId: "Asia/Shanghai",
        extraHTTPHeaders: {"Accept-Language": "zh-CN,zh;q=0.9"}
    });
    // -------------------- 伪装 UA、语言、时区 --------------------
    // launchPersistentContext 本身就创建了 BrowserContext，所以可以直接改默认参数
    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();

    await page.setExtraHTTPHeaders({"Accept-Language": "zh-CN,zh;q=0.9"});
    await page.goto(CN_BING_URL, { waitUntil: 'networkidle' });
    const actualUA = await page.evaluate(() => navigator.userAgent);
    const windowSize = await page.evaluate(() => ({ w: window.innerWidth, h: window.innerHeight }));

    console.log(`🕵️ 实际 UserAgent: ${actualUA}`);
    console.log(`🕵️ 实际 窗口大小: ${windowSize.w} x ${windowSize.h}`);

    if (launchOptions.isMobile && !actualUA.includes('Mobile')) {
        console.error("⚠️ 警告：当前虽然是手机模式，但 UserAgent 不包含 Mobile 字段！积分可能无法累积。");
    }

    const page2 = await context.newPage();
    await page2.goto("https://www.browserscan.net/zh/bot-detection");
    //  检查是否已登录...
    const loggedIn = await waitForLogin(page, 5);
    if (!loggedIn) {
        return false;  // process.exit(1); // 或者 return，避免继续往下执行
    }

    // -------------------- 搜索循环 --------------------
    let successCount = 0;
    let attempt = 0; // 尝试
    const maxAttempts = MAX_SEARCH_TIMES + 10; // 最大尝试 = 最多搜索次数+10容错
    // 如果成功数<最少搜索次数 并且 尝试数<最大尝试数量
    while (successCount < MIN_SEARCH_TIMES && attempt < maxAttempts) {
        attempt++;

        const keyword = keywords[Math.floor(Math.random() * keywords.length)];
        console.log(`[${successCount + 1}/${MIN_SEARCH_TIMES}] Searching: ${keyword}`);

        try {
            // 等待搜索框可用
            const searchBox = await page.waitForSelector('input[name="q"]', {timeout: 5000});

            // 填写并提交搜索
            await searchBox.fill(keyword);
            await searchBox.press("Enter");

            // 等待搜索结果页加载完成
            await page.waitForTimeout(randomWait([2, 5])); // 随机等待2-5秒，确保页面稳定
            await simulateHumanScroll(page);
            successCount++;
        } catch (e) {
            console.log(`❌ 搜索失败（第 ${attempt} 次尝试）：${e}`);
            await page.goto(CN_BING_URL);
            await page.waitForTimeout(3000)
            continue;
        }

        // 随机等待，模拟人工操作
        await page.waitForTimeout(randomWait(WAIT_TIME));

        // 回到 Bing 首页，准备下一次搜索
        await page.goto(CN_BING_URL);
    }

    console.log(`\n🎉 成功搜索 ${successCount} 次，关闭浏览器。`);
    await context.close();
})();
// launchConfig.js
const { devices } = require("playwright");

function getSearchMode() {
    if (process.argv.includes("--mobile")) return "mobile";
    if (process.env.MOBILE === "1") return "mobile";
    return "pc";
}

function getLaunchOptions() {
    const mode = getSearchMode();
    console.log(`🔧 启动模式: ${mode === "pc" ? "PC" : "Mobile"}`);

    if (mode === "pc") {
        return {
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport: null,
            isMobile: false
            // deviceScaleFactor: 1,
        };
    }

    return {
        // https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json
        ...devices["Galaxy S24"],
        isMobile: true,
    };
    /*return {
           userAgent:
               "Mozilla/5.0 (Linux; Android 14; Pixel 6 Build/AP2A.240605.024) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36 Edge/121.0.2277.138",
           viewport: { width: 360, height: 640 },
           isMobile: true,
           deviceScaleFactor: 3,
       };*/
}

module.exports = {
    getLaunchOptions,
    getSearchMode,
};

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
}

module.exports = {
    getLaunchOptions,
    getSearchMode,
};

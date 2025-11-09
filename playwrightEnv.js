const os = require("os");
const fs = require("fs");
const path = require("path");

// 自动查找 Chrome 可执行路径
function findChromePath() {
    const platform = os.platform();
    const candidates = [];

    if (platform === "win32") {
        candidates.push(
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
            `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`
        );
    } else if (platform === "darwin") {
        candidates.push(
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            `${process.env.HOME}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
        );
    }

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    console.warn("⚠️ 未找到 Chrome 可执行文件，请检查是否安装。");
    return null;
}

// 自动选择用户数据路径
function getUserDataDir() {
    const platform = os.platform();
    if (platform === "win32") {
        return "C:\\Users\\vayo\\chrome-profile-pc";
    } else if (platform === "darwin") {
        return "/Users/vayo/chrome-profile-pc";
    }
    return path.join(__dirname, "chrome-profile");
}

// 是否需要重置用户数据（例如 node xxx.js --reset）
function shouldReset() {
    return process.argv.includes("--reset");
}

// 是否无头模式
function isHeadless() {
    return process.argv.includes("--headless");
}

module.exports = {
    findChromePath,
    getUserDataDir
};

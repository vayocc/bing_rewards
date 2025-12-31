/**
 * 这个文件项目里面没有用到， 备份的脚本文件而已
 */

const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");

function findChromePath() {
    const platform = os.platform();
    const candidates = [];

    if (platform === "win32") {
        // 常见安装路径
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
    } else if (platform === "linux") {
        try {
            const path = execSync("which google-chrome || which chromium-browser")
                .toString()
                .trim();
            if (path) return path;
        } catch {}
    }

    for (const path of candidates) {
        if (fs.existsSync(path)) return path;
    }

    return null;
}

const chromePath = findChromePath();
if (chromePath) {
    console.log("✅ 找到 Chrome 可执行文件路径：");
    console.log(chromePath);
} else {
    console.log("❌ 未找到 Chrome，请检查是否已安装。");
}

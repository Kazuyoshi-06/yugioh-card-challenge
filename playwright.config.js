const { defineConfig, devices } = require("@playwright/test");
const path = require("path");

module.exports = defineConfig({
    testDir: "./tests",
    timeout: 45000,
    expect: {
        timeout: 10000
    },
    use: {
        baseURL: "file:///" + path.resolve(__dirname).replace(/\\/g, "/"),
        trace: "retain-on-failure"
    },
    projects: [
        {
            name: "desktop-chromium",
            use: {
                ...devices["Desktop Chrome"]
            }
        },
        {
            name: "mobile-chromium",
            use: {
                ...devices["Pixel 7"]
            }
        }
    ]
});

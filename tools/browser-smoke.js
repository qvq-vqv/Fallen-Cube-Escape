#!/usr/bin/env node

const fs = require('fs');
let chromium = null;
let playwrightLoadError = null;

try {
    ({ chromium } = require('playwright'));
} catch (error) {
    playwrightLoadError = error;
}

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const screenshotPath = '/tmp/escape-browser-smoke.png';
const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:4174';

function assertCheck(failures, condition, message) {
    if (!condition) failures.push(message);
}

async function dismissPrologue(page) {
    await page.evaluate(() => {
        document.querySelector('#btn-prologue-skip')?.click();
        document.querySelector('#prologue-overlay')?.classList.remove('active');
    });
    await page.waitForTimeout(250);
}

(async () => {
    if (playwrightLoadError) {
        console.log(JSON.stringify({
            skipped: true,
            reason: 'Playwright is not installed in this workspace.',
            install: 'npm install --save-dev playwright',
            originalError: playwrightLoadError.message
        }, null, 2));
        return;
    }

    if (!fs.existsSync(chromePath)) {
        throw new Error(`Chrome executable not found: ${chromePath}`);
    }

    const browser = await chromium.launch({
        headless: true,
        executablePath: chromePath,
        args: ['--disable-gpu', '--no-sandbox']
    });

    const page = await browser.newPage({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1
    });

    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    const failures = [];

    await page.goto(`${baseUrl}/?smoke=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#landing-overlay', { state: 'visible', timeout: 15000 });
    await dismissPrologue(page);

    const landing = await page.evaluate(() => {
        const landingOverlay = document.querySelector('#landing-overlay');
        const buttonText = selector => document.querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim() || '';
        const startRect = document.querySelector('#landing-start-btn')?.getBoundingClientRect();
        const levelsRect = document.querySelector('#landing-levels-btn')?.getBoundingClientRect();

        return {
            landingActive: landingOverlay?.classList.contains('active'),
            subtitle: document.querySelector('.landing-subtitle')?.textContent.trim() || '',
            start: buttonText('#landing-start-btn'),
            levels: buttonText('#landing-levels-btn'),
            archive: buttonText('#landing-archive-btn'),
            settings: buttonText('#landing-settings-btn'),
            credits: buttonText('#landing-credits-btn'),
            startTallerThanLevels: Boolean(startRect && levelsRect && startRect.height > levelsRect.height),
            storyLoaded: Boolean(window.STORY_MODULE),
            gameEngineLoaded: Boolean(window.gameEngine),
            renderEngineLoaded: Boolean(window.renderEngine)
        };
    });

    assertCheck(failures, landing.landingActive, 'landing overlay should be active after prologue dismissal');
    assertCheck(failures, landing.subtitle.length > 0, 'landing subtitle should render');
    assertCheck(failures, landing.start.includes('开始逃亡'), 'landing start button should render');
    assertCheck(failures, landing.levels.includes('关卡选择'), 'landing level-select button should render');
    assertCheck(failures, landing.archive.includes('档案矩阵'), 'landing archive button should render');
    assertCheck(failures, landing.settings.includes('游戏设置'), 'landing settings button should render');
    assertCheck(failures, landing.credits.includes('制作名单'), 'landing credits button should render');
    assertCheck(failures, landing.startTallerThanLevels, 'start button should have stronger visual weight than level-select');
    assertCheck(failures, landing.gameEngineLoaded, 'window.gameEngine should exist');
    assertCheck(failures, landing.renderEngineLoaded, 'window.renderEngine should exist');

    await page.locator('#landing-levels-btn').click();
    await page.waitForSelector('#setup-overlay.active', { timeout: 10000 });
    await page.waitForSelector('#level-list .level-card', { timeout: 10000 });
    await page.locator('#level-list .level-card').first().click();
    await page.waitForTimeout(250);

    const levelBook = await page.evaluate(() => ({
        cards: document.querySelectorAll('#level-list .level-card').length,
        setupActive: document.querySelector('#setup-overlay')?.classList.contains('active'),
        inspectActive: document.querySelector('#inspect-overlay')?.classList.contains('active'),
        landingActive: document.querySelector('#landing-overlay')?.classList.contains('active'),
        startActionVisible: (() => {
            const start = document.querySelector('#start-game-btn');
            if (!start) return false;
            const rect = start.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        })(),
        inspectActionVisible: (() => {
            const start = document.querySelector('#inspect-start-btn');
            if (!start) return false;
            const rect = start.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        })()
    }));

    assertCheck(failures, levelBook.setupActive || levelBook.inspectActive, 'level book should open or advance into inspect preview from landing');
    assertCheck(failures, !levelBook.landingActive, 'landing overlay should close when level book opens');
    assertCheck(failures, levelBook.cards > 0, 'level book should render at least one level card');
    assertCheck(failures, levelBook.startActionVisible || levelBook.inspectActionVisible, 'a start/inspect action should be visible after selecting a level');

    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();

    if (errors.length > 0) failures.push('browser console/page errors were reported');

    const report = {
        baseUrl,
        landing,
        levelBook,
        screenshotPath,
        errors,
        failures
    };

    console.log(JSON.stringify(report, null, 2));

    if (failures.length > 0) {
        console.error('\nBrowser smoke failures:');
        failures.forEach(message => console.error(`- ${message}`));
        process.exitCode = 1;
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

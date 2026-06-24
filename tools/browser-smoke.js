#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
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

async function dismissPrologue(page) {
    const prologue = page.locator('#prologue-overlay.active');
    if (await prologue.count()) {
        await page.evaluate(() => document.querySelector('#btn-prologue-start')?.click());
        await page.waitForSelector('#setup-overlay.active');
    }
}

async function startLevel(page, index) {
    await page.goto(`${baseUrl}/?smoke=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#level-list .level-card');
    await dismissPrologue(page);
    await page.locator('#level-list .level-card').nth(index).click();
    await page.locator('#start-game-btn').click();
    await page.waitForSelector('#game-container', { state: 'visible' });
    await page.waitForTimeout(700);
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
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1
    });

    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => {
        if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });

    await page.goto(`${baseUrl}/?smoke=${Date.now()}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#level-list .level-card');
    await dismissPrologue(page);

    const setup = await page.evaluate(() => {
        const levelList = document.querySelector('#level-list');
        const start = document.querySelector('#start-game-btn');
        const startRect = start.getBoundingClientRect();
        const gridColumns = getComputedStyle(levelList).gridTemplateColumns
            .split(' ')
            .filter(Boolean).length;

        return {
            cards: document.querySelectorAll('.level-card').length,
            hasActTwoCardVisible: Array.from(document.querySelectorAll('.level-card-title'))
                .some(title => title.textContent.includes('L13')),
            storyLoaded: Boolean(window.STORY_MODULE),
            storyScenesInjected: Boolean(window.DIALOGUE_SCRIPT?.scenes?.eventKeyCollectedGuardDoor),
            gridColumns,
            conceptDisplay: getComputedStyle(document.querySelector('.level-card-concept')).display,
            startInViewport: startRect.top >= 0 && startRect.bottom <= window.innerHeight,
            hasInternalMetadataText: document.body.innerText.includes('validation') ||
                document.body.innerText.includes('mustUseRotation')
        };
    });

    await startLevel(page, 0);
    await page.locator('[data-terminal-tab="comms"]').click();
    const commsBeforeReply = await page.evaluate(() => ({
        sceneTitle: document.querySelector('#comms-scene-title').innerText,
        context: document.querySelector('#comms-context-line').innerText,
        bond: document.querySelector('#comms-bond-label').innerText
    }));
    await page.locator('[data-comms-choice="0"]').click();
    const commsAfterReply = await page.evaluate(() => ({
        live: document.querySelector('#comms-live-line').innerText,
        bubble: document.querySelector('#companion-bubble').innerText,
        bond: document.querySelector('#comms-bond-label').innerText
    }));
    await page.locator('[data-terminal-tab="map"]').click();
    await page.locator('#audio-toggle').click();
    await page.waitForTimeout(120);
    const audioOff = await page.evaluate(() => ({
        text: document.querySelector('#audio-toggle').innerText,
        mutedClass: document.querySelector('#audio-toggle').classList.contains('muted'),
        toast: document.querySelector('#feel-toast').innerText
    }));
    await page.locator('#audio-toggle').click();
    await page.waitForTimeout(120);
    const audioOn = await page.evaluate(() => ({
        text: document.querySelector('#audio-toggle').innerText,
        mutedClass: document.querySelector('#audio-toggle').classList.contains('muted'),
        toast: document.querySelector('#feel-toast').innerText
    }));
    const levelOneBase = await page.evaluate(() => ({
        rotationHidden: document.querySelector('#rotation-section').classList.contains('is-hidden'),
        threatHidden: document.querySelector('#threat-panel').classList.contains('is-hidden'),
        endTurnHidden: document.querySelector('#btn-end-turn').classList.contains('is-hidden'),
        axisHidden: document.querySelector('#axis-guide').classList.contains('is-hidden'),
        legendText: document.querySelector('.map-legend').innerText
    }));
    const actionBubble = await page.evaluate(async () => {
        const game = window.gameEngine;
        game.plannedPath = [game.exitPos];
        game.updateActionButtons();
        game.executePlannedPath();
        const afterRoute = document.querySelector('#companion-bubble').innerText;
        await new Promise(resolve => setTimeout(resolve, 350));
        const afterMove = document.querySelector('#companion-bubble').innerText;
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            afterRoute,
            afterMove,
            victoryActive: document.querySelector('#victory-overlay').classList.contains('active'),
            gameState: game.gameState
        };
    });
    const levelOne = { ...levelOneBase, audioOff, audioOn };

    await startLevel(page, 3);
    const levelFour = await page.evaluate(() => ({
        rotationVisible: !document.querySelector('#rotation-section').classList.contains('is-hidden'),
        threatVisible: !document.querySelector('#threat-panel').classList.contains('is-hidden'),
        axisVisible: !document.querySelector('#axis-guide').classList.contains('is-hidden'),
        rotationCost: document.querySelector('#rotation-charge').innerText,
        rotationHint: document.querySelector('#rotation-budget-hint').innerText,
        enemyText: document.querySelector('#ai-status-list').innerText
    }));

    await startLevel(page, 5);
    const levelSix = await page.evaluate(() => {
        const game = window.gameEngine;
        const guardian = game.ais.find(ai => ai.type === 'guardian');
        game.playerPos = game.resolveCoord({ face: 4, row: 0, col: 2 });
        game.updateUI();
        return {
            title: game.currentLevel.title,
            guardianAggro: guardian?.aggro,
            guardianState: guardian?.state,
            guardianPreviewLength: game.previewAIMovement(guardian).length,
            threatText: document.querySelector('#ai-status-list').innerText,
            enemyOnKey: game.keyPos !== null &&
                game.ais.some(ai => ai.pos === game.keyPos)
        };
    });

    await startLevel(page, 7);
    const levelEight = await page.evaluate(() => {
        const game = window.gameEngine;
        const keyCell = game.cells[game.keyPos];
        const keyAtFaceCenter = keyCell.row === Math.floor(game.N / 2) &&
            keyCell.col === Math.floor(game.N / 2);
        game.hasKey = true;
        game.keyPos = null;
        game.updateUI();
        return {
            keyAtFaceCenter,
            guardianState: game.ais.find(ai => ai.type === 'guardian')?.state,
            threatText: document.querySelector('#ai-status-list').innerText
        };
    });

    const failure = await page.evaluate(() => {
        const game = window.gameEngine;
        game.pushHistory('browser-smoke');
        game.ais[0].pos = game.playerPos;
        game.checkCollisions();
        return {
            overlayActive: document.querySelector('#gameover-overlay').classList.contains('active'),
            summary: document.querySelector('#failure-summary').innerText,
            undoDisabled: document.querySelector('#btn-gameover-undo').disabled
        };
    });

    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();

    const report = {
        setup,
        commsBeforeReply,
        commsAfterReply,
        actionBubble,
        levelOne,
        levelFour,
        levelSix,
        levelEight,
        failure,
        screenshotPath,
        errors
    };

    const failures = [];
    if (setup.cards !== 12) failures.push('setup should show 12 first-act level cards');
    if (setup.hasActTwoCardVisible) failures.push('act two cards should stay hidden before the act finale unlock');
    if (!setup.storyLoaded || !setup.storyScenesInjected) failures.push('story module should load and inject event scenes');
    if (setup.gridColumns < 4) failures.push('desktop setup should use compact 4-column level grid');
    if (setup.conceptDisplay !== 'none') failures.push('level card concepts should be hidden in compact cards');
    if (!setup.startInViewport) failures.push('start button should be visible in desktop first viewport');
    if (setup.hasInternalMetadataText) failures.push('internal validation metadata leaked into UI');
    if (!commsBeforeReply.sceneTitle.includes('L01') ||
        !commsBeforeReply.context.includes('通讯稳定') ||
        commsAfterReply.bond !== '同步：稳定' ||
        !commsAfterReply.live.includes('别乱画')) {
        failures.push('story comms should render context and update relationship state after a reply');
    }
    if (!levelOne.rotationHidden || !levelOne.threatHidden || !levelOne.endTurnHidden || !levelOne.axisHidden) {
        failures.push('level 1 should hide rotation/threat/skip/axis UI');
    }
    if (!actionBubble.afterRoute ||
        actionBubble.afterRoute === commsAfterReply.bubble ||
        !actionBubble.victoryActive ||
        actionBubble.gameState !== 'win') {
        failures.push('action barks should update the companion bubble and still trigger victory');
    }
    if (levelOne.audioOff.text !== '声音 关' || !levelOne.audioOff.mutedClass ||
        !levelOne.audioOff.toast.includes('声音已关闭') ||
        levelOne.audioOn.text !== '声音 开' || levelOne.audioOn.mutedClass ||
        !levelOne.audioOn.toast.includes('声音已开启')) {
        failures.push('audio toggle should switch visibly and show feedback');
    }
    if (!levelFour.rotationVisible || !levelFour.threatVisible || !levelFour.axisVisible ||
        levelFour.rotationCost !== '2 AP' || levelFour.rotationHint.includes('预算')) {
        failures.push('level 4 should show rotation/threat/axis UI with 2 AP cost and no budget wording');
    }
    if (levelSix.guardianAggro !== 'lure' || levelSix.enemyOnKey) {
        failures.push('level 6 guardian should be lureable and not occupy key');
    }
    if (levelSix.guardianState !== 'lure' || levelSix.guardianPreviewLength !== 1 ||
        !levelSix.threatText.includes('引诱追击')) {
        failures.push('level 6 guardian should chase one step when the player is on the key face');
    }
    if (levelEight.keyAtFaceCenter) {
        failures.push('level 8 rage key should not be on a face center');
    }
    if (levelEight.guardianState !== 'rage' || !levelEight.threatText.includes('狂暴追击')) {
        failures.push('level 8 guardian should publicly enter rage after key');
    }
    if (!failure.overlayActive || !failure.summary.includes('捕获者') ||
        !failure.summary.includes('捕获位置') || failure.undoDisabled) {
        failures.push('failure popup should show reason and enabled undo');
    }
    if (errors.length > 0) failures.push('browser console/page errors were reported');

    console.log(JSON.stringify(report, null, 2));

    if (failures.length > 0) {
        console.error('\nBrowser smoke failures:');
        failures.forEach(failureMessage => console.error(`- ${failureMessage}`));
        process.exitCode = 1;
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

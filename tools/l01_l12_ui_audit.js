#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'test_runs');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const remoteBaseUrl = process.env.QA_BASE_URL || '';
const localPort = Number(process.env.QA_PORT || 4175);

const levels = [
  { id: 'L01', rotation: false, tools: [], strongTutorial: true },
  { id: 'L02', rotation: false, tools: [], strongTutorial: true },
  { id: 'L03', rotation: false, tools: [], strongTutorial: true },
  { id: 'L04', rotation: true, tools: [], strongTutorial: true },
  { id: 'L05', rotation: true, tools: [], strongTutorial: false },
  { id: 'L06', rotation: false, tools: [], strongTutorial: false, enemies: ['guardian'] },
  { id: 'L07', rotation: false, tools: ['break'], strongTutorial: false, enemies: ['guardian'] },
  { id: 'L08', rotation: true, tools: [], strongTutorial: false },
  { id: 'L09', rotation: false, tools: [], strongTutorial: false },
  { id: 'L10', rotation: false, tools: ['break'], strongTutorial: false },
  { id: 'L11', rotation: true, tools: [], strongTutorial: false },
  { id: 'L12', rotation: true, tools: [], strongTutorial: false },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
];

const screenshotLevels = new Set(['L03', 'L04', 'L07', 'L09', 'L12']);

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
};

function ensureOutDir() {
  fs.mkdirSync(outDir, { recursive: true });
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(rootDir, safePath === '/' ? 'index.html' : safePath);

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content);
    });
  });

  return new Promise(resolve => {
    server.listen(localPort, '127.0.0.1', () => {
      resolve({ server, baseUrl: `http://127.0.0.1:${localPort}` });
    });
  });
}

async function dismissPrologue(page) {
  await page.evaluate(() => {
    document.querySelector('#btn-prologue-skip')?.click();
    document.querySelector('#prologue-overlay')?.classList.remove('active');
  });
  await page.waitForTimeout(150);
}

async function enterLevel(page, baseUrl, index) {
  await page.goto(`${baseUrl}/?qa=${Date.now()}-${index}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await dismissPrologue(page);
  await page.waitForSelector('#landing-levels-btn', { timeout: 12000 });
  await page.locator('#landing-levels-btn').click();
  await page.waitForSelector('#setup-overlay.active', { timeout: 12000 });
  const actOneTab = page.locator('.act-page-tab[data-act-page="1"]');
  if (await actOneTab.count()) {
    await actOneTab.click();
    await page.waitForTimeout(100);
  }
  const card = page.locator(`#level-list .level-card[data-level-index="${index}"]`);
  await card.waitFor({ state: 'visible', timeout: 12000 });
  await card.click();
  await page.waitForSelector('#inspect-overlay.active', { timeout: 12000 });
  await page.locator('#inspect-start-btn').click();
  await page.waitForTimeout(900);
}

async function collectState(page) {
  return page.evaluate(() => {
    const textOf = value => {
      if (!value) return '';
      if (typeof value === 'string') return value;
      return value.zh || value.en || '';
    };

    const visible = selectorOrElement => {
      const element = typeof selectorOrElement === 'string'
        ? document.querySelector(selectorOrElement)
        : selectorOrElement;
      if (!element || !element.isConnected) return false;
      let current = element;
      while (current && current.nodeType === 1) {
        const style = getComputedStyle(current);
        if (current.classList?.contains('is-hidden')) return false;
        if (current.getAttribute?.('aria-hidden') === 'true') return false;
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) <= 0.01) {
          return false;
        }
        if (current.classList?.contains('overlay') && !current.classList.contains('active')) return false;
        if (current.id === 'inspect-overlay' && !current.classList.contains('active')) return false;
        current = current.parentElement;
      }
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const read = selector => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        className: element.className || '',
        ariaHidden: element.getAttribute('aria-hidden') || '',
        disabled: Boolean(element.disabled),
        text: (element.textContent || '').replace(/\s+/g, ' ').trim(),
        visible: visible(element),
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        },
      };
    };

    const toolButtons = Array.from(document.querySelectorAll('[data-tool-mode]')).map(button => ({
      id: button.id || '',
      mode: button.dataset.toolMode || '',
      className: button.className || '',
      text: (button.textContent || '').replace(/\s+/g, ' ').trim(),
      disabled: Boolean(button.disabled),
      visible: visible(button),
    }));

    const overflow = Array.from(document.querySelectorAll('button, .level-card, .tutorial-dialogue-console, .tutorial-helper-card, .tool-mode-indicator, .floating-toolbox-menu, .help-tooltip'))
      .filter(element => visible(element))
      .map(element => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          id: element.id || '',
          className: String(element.className || ''),
          text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          rect: { width: Math.round(rect.width), height: Math.round(rect.height) },
          scrollWidth: element.scrollWidth,
          scrollHeight: element.scrollHeight,
        };
      })
      .filter(item => item.scrollWidth > item.rect.width + 3 || item.scrollHeight > item.rect.height + 3)
      .slice(0, 12);

    const level = window.gameEngine?.currentLevel || null;
    const ais = window.gameEngine?.ais || [];

    return {
      levelId: level?.id || '',
      levelTitle: textOf(level?.title),
      bodyClass: document.body.className || '',
      engine: {
        rotationEnabled: Boolean(window.gameEngine?.rotationEnabled),
        patchCharges: Number(window.gameEngine?.patchCharges || 0),
        beaconCharges: Number(window.gameEngine?.beaconCharges || 0),
        breakCharges: Number(window.gameEngine?.breakCharges || 0),
        toolMode: window.gameEngine?.toolMode || '',
        guardianAggro: level?.guardianAggro || '',
        ais: ais.map(ai => ({ type: ai.type, pos: ai.pos })),
      },
      routeTip: read('#route-tip'),
      modeIndicator: read('#tool-mode-indicator'),
      tutorialConsole: read('#tutorial-dialogue-console'),
      tutorialLook: read('#tutorial-look-gesture'),
      tutorialUiArrow: read('#tutorial-ui-arrow'),
      tutorialHelper: read('#tutorial-helper-card'),
      toolsBubble: read('#tools-float-bubble'),
      floatingToolbox: read('#floating-toolbox-menu'),
      phonePanel: read('#phone-panel'),
      phoneToolSection: read('#tool-section'),
      rotationSection: read('#rotation-section'),
      rotationPreview: read('#rotation-preview-chip'),
      oldTwistButton: read('#btn-twist-mode'),
      toolButtons,
      visibleToolModes: toolButtons.filter(button => button.visible).map(button => button.mode),
      hiddenOrMissing: {
        btnTwistModeExists: Boolean(document.querySelector('#btn-twist-mode')),
        patchVisible: toolButtons.some(button => button.mode === 'patch' && button.visible),
        beaconVisible: toolButtons.some(button => button.mode === 'beacon' && button.visible),
        breakVisible: toolButtons.some(button => button.mode === 'break' && button.visible),
      },
      overflow,
    };
  });
}

function evaluateLevel(viewport, expected, state) {
  const failures = [];
  const warnings = [];
  const hasTools = expected.tools.length > 0;
  const visibleConsumables = new Set(
    state.toolButtons
      .filter(button => button.visible && ['patch', 'beacon', 'break'].includes(button.mode))
      .map(button => button.mode),
  );

  if (state.levelId !== expected.id) {
    failures.push(`entered ${state.levelId || 'unknown'} instead of ${expected.id}`);
  }

  if (state.engine.rotationEnabled !== expected.rotation) {
    failures.push(`engine rotation=${state.engine.rotationEnabled}, expected ${expected.rotation}`);
  }

  if (expected.rotation && !state.bodyClass.includes('rotation-level-enabled')) {
    failures.push('rotation level does not set rotation-level-enabled body class');
  }

  if (!expected.rotation && state.bodyClass.includes('rotation-level-enabled')) {
    failures.push('non-rotation level still has rotation-level-enabled body class');
  }

  if (state.rotationSection?.visible || state.rotationPreview?.visible) {
    failures.push('legacy rotation panel/preview is still visible');
  }

  if (state.oldTwistButton?.visible || state.hiddenOrMissing.btnTwistModeExists) {
    failures.push('old rotation mode button still exists or is visible');
  }

  for (const mode of ['patch', 'beacon', 'break']) {
    if (!expected.tools.includes(mode) && visibleConsumables.has(mode)) {
      failures.push(`${mode} tool is visible but this level does not grant it`);
    }
    if (expected.tools.includes(mode) && !visibleConsumables.has(mode)) {
      failures.push(`${mode} tool should be visible but is hidden`);
    }
  }

  if (hasTools && !state.floatingToolbox?.visible) {
    failures.push('toolbox has tools but the floating menu is not auto-expanded');
  }

  if (!hasTools && (state.toolsBubble?.visible || state.floatingToolbox?.visible || state.phoneToolSection?.visible)) {
    failures.push('tool UI is visible on a level with no tools');
  }

  if (!expected.strongTutorial && state.tutorialLook?.visible) {
    failures.push('strong look/gesture tutorial overlay appears outside early tutorial levels');
  }

  if (!expected.strongTutorial && state.tutorialUiArrow?.visible) {
    warnings.push('tutorial UI arrow is visible outside early tutorial levels');
  }

  if (!expected.strongTutorial && state.tutorialConsole?.visible) {
    warnings.push(`dialogue console visible on non-tutorial-flag level: ${state.tutorialConsole.text.slice(0, 80)}`);
  }

  if (expected.id === 'L06') {
    const types = state.engine.ais.map(ai => ai.type).sort().join(',');
    if (types !== 'guardian') failures.push(`L06 enemies are ${types || 'none'}, expected guardian only`);
  }

  if (expected.id === 'L07' && state.engine.rotationEnabled) {
    failures.push('L07 unexpectedly allows rotation');
  }

  if (expected.id === 'L09' && state.engine.rotationEnabled) {
    failures.push('L09 unexpectedly allows rotation');
  }

  if (viewport.name === 'mobile' && state.overflow.length > 0) {
    warnings.push(`mobile visible text overflow candidates: ${state.overflow.map(item => item.id || item.className || item.tag).join(', ')}`);
  }

  return { failures, warnings };
}

async function run() {
  ensureOutDir();

  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome executable not found: ${chromePath}`);
  }

  const local = remoteBaseUrl ? null : await startStaticServer();
  const baseUrl = remoteBaseUrl || local.baseUrl;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--disable-gpu', '--no-sandbox', '--use-gl=swiftshader'],
  });

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewports: [],
    failures: [],
    warnings: [],
    screenshots: [],
    consoleErrors: [],
  };

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: Boolean(viewport.isMobile),
        hasTouch: Boolean(viewport.hasTouch),
        deviceScaleFactor: viewport.name === 'mobile' ? 2 : 1,
      });

      await context.addInitScript(() => {
        localStorage.setItem('dimensionHackDevMode', 'true');
        localStorage.setItem('dimensionHackUnlockedActs', JSON.stringify([1]));
        localStorage.removeItem('dimensionHackActTwoUnlocked');
        localStorage.setItem('dimensionHackAudioEnabled', 'false');
      });

      const page = await context.newPage();
      page.on('pageerror', error => report.consoleErrors.push(`${viewport.name}: pageerror: ${error.message}`));
      page.on('console', message => {
        if (message.type() === 'error') {
          report.consoleErrors.push(`${viewport.name}: console: ${message.text()}`);
        }
      });

      const viewportResult = { name: viewport.name, width: viewport.width, height: viewport.height, levels: [] };

      for (let index = 0; index < levels.length; index += 1) {
        const expected = levels[index];
        console.log(`[${viewport.name}] entering ${expected.id}`);
        await enterLevel(page, baseUrl, index);
        const state = await collectState(page);
        const evaluation = evaluateLevel(viewport, expected, state);
        const levelResult = { expected, state, ...evaluation };
        viewportResult.levels.push(levelResult);

        for (const failure of evaluation.failures) {
          report.failures.push(`${viewport.name} ${expected.id}: ${failure}`);
        }
        for (const warning of evaluation.warnings) {
          report.warnings.push(`${viewport.name} ${expected.id}: ${warning}`);
        }

        if (viewport.name === 'desktop' && screenshotLevels.has(expected.id)) {
          const screenshotPath = path.join(outDir, `l01_l12_ui_audit_${stamp}_${viewport.name}_${expected.id}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: false });
          report.screenshots.push(screenshotPath);
        }
      }

      report.viewports.push(viewportResult);
      await context.close();
    }
  } finally {
    await browser.close();
    if (local) {
      local.server.close();
    }
  }

  const reportPath = path.join(outDir, `l01_l12_ui_audit_${stamp}.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    reportPath,
    baseUrl,
    failures: report.failures,
    warnings: report.warnings,
    screenshots: report.screenshots,
    consoleErrors: report.consoleErrors,
  }, null, 2));

  if (report.failures.length > 0 || report.consoleErrors.length > 0) {
    process.exitCode = 1;
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

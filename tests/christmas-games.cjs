const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const base = process.env.GAMES_URL || 'http://127.0.0.1:8765';
const preview = '/campaign/preview/';
let browser;

before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function withGame(path, run, setup = async () => {}) {
    const page = await browser.newPage({
        viewport: { width: 320, height: 740 },
        isMobile: true,
        hasTouch: true,
        reducedMotion: 'reduce'
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
        if (response.url().startsWith(base) && response.status() >= 400) {
            errors.push(response.status() + ' ' + response.url());
        }
    });
    try {
        await setup(page);
        await page.goto(base + path);
        await run(page);
        assert.deepEqual(errors, []);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    } finally {
        await page.close();
    }
}

test('Toy Shop preserves a missed order and starts the next day on first craft', () =>
    withGame('/games/santas-toy-shop/', async page => {
        const timer = page.locator('#timer');
        await page.locator('#craft').click();
        await page.clock.runFor(46000);
        assert.equal(await timer.textContent(), '0:00');
        await page.reload();
        assert.equal(await timer.textContent(), '0:00');
        assert.equal(await page.locator('#order').textContent(), '1 / 12 ornaments packed');
        for (let i = 0; i < 11; i++) await page.locator('#craft').click();
        await page.locator('#ship').click();
        assert.equal(await page.locator('#coins').textContent(), '15');
        await page.clock.runFor(2000);
        assert.equal(await timer.textContent(), '0:48');
        await page.locator('#hire').click();
        await page.clock.runFor(2000);
        assert.match(await page.locator('#order').textContent(), /^[12] \/ 16/);
    }, page => page.clock.install()));

test('Advent unlocks at Mountain midnight and remembers a keyboard reveal', () =>
    withGame('/advent/', async page => {
        const first = page.locator('.door').first();
        const second = page.locator('.door').nth(1);
        const image = page.locator('#ornament');
        assert.equal(await first.getAttribute('aria-disabled'), 'true');
        assert.equal(await image.getAttribute('src'), null);
        await page.clock.runFor(31000);
        assert.equal(await first.getAttribute('aria-disabled'), 'false');
        assert.equal(await second.getAttribute('aria-disabled'), 'true');
        await first.focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('#ornament').naturalWidth > 0);
        assert.match(await image.getAttribute('src'), /day-1\.webp$/);
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('.door')), true);
        await page.reload();
        assert.match(await first.textContent(), /Collected/);
        assert.equal(await page.locator('#collection-progress').textContent(), '1 of 12 ornaments collected');
    }, page => page.clock.install({ time: new Date('2026-12-25T06:59:59Z') })));

test('Roulette lands on the awarded slice and saves one completed spin', () =>
    withGame(preview + '12_days_of_christmas_roulette.html', async page => {
        await page.locator('#sound-toggle-btn').click();
        await page.locator('#spin-btn').click();
        const dialog = page.locator('#prize-modal');
        assert.equal(await dialog.isVisible(), true);
        const result = await page.evaluate(() => {
            const turn = Math.PI * 2;
            const pointer = ((1.5 * Math.PI - currentAngle) % turn + turn) % turn;
            const slice = prizes[Math.floor(pointer / (turn / prizes.length))];
            return { title: slice.title, history: claimedHistory[0].title, streak };
        });
        assert.equal(result.history, result.title);
        assert.equal(result.streak, 1);
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.activeElement.id === 'spin-btn');
        await page.reload();
        assert.equal(await page.locator('#streak-count').textContent(), '1');
        assert.match(await page.locator('#history-container').textContent(), /Pts/);
    }, page => page.addInitScript(() => {
        if (!sessionStorage.getItem('seeded')) {
            localStorage.setItem('christmas_history_12', '{corrupt');
            sessionStorage.setItem('seeded', 'yes');
        }
    })));

test('Elf Workshop restores upgrades and production, and reset removes their effects', () =>
    withGame(preview + 'elf_workshop_tycoon.html', async page => {
        await page.clock.pauseAt(new Date('2026-12-25T07:00:01Z'));
        await page.locator('#craft-btn').click();
        await page.locator('#toy-lines-container button').first().click();
        const button = page.locator('#toy-lines-container button').first();
        await button.focus();
        await page.clock.runFor(2000);
        assert.equal(await button.evaluate(element => element === document.activeElement), true);
        await page.reload();
        assert.equal(await page.locator('#click-value').textContent(), '3');
        assert.equal(await page.evaluate(() => getPassiveRate()), 2);
        page.once('dialog', dialog => dialog.accept());
        await page.locator('#reset-game-btn').click();
        assert.equal(await page.locator('#click-value').textContent(), '1');
        assert.equal(await page.evaluate(() => getPassiveRate()), 0);
        await page.reload();
        assert.equal(await page.locator('#candy-display').textContent(), '100');
    }, async page => {
        await page.clock.install({ time: new Date('2026-12-25T07:00:00Z') });
        await page.addInitScript(() => {
            if (!sessionStorage.getItem('seeded')) {
                localStorage.setItem('elf-workshop-tycoon-v1', JSON.stringify({
                    candy: 100, upgrades: ['hot_cocoa', 'magic_dust']
                }));
                sessionStorage.setItem('seeded', 'yes');
            }
        });
    }));

test('Animated roulette ignores repeat input and lands under the pointer', () =>
    withGame(preview + '12_days_of_christmas_roulette.html', async page => {
        await page.locator('#sound-toggle-btn').click();
        await page.locator('#spin-btn').click();
        assert.equal(await page.locator('#spin-btn').isDisabled(), true);
        await page.evaluate(() => spinWheel());
        await page.clock.runFor(2800);
        assert.equal(await page.locator('#prize-modal').isVisible(), true);
        assert.equal(await page.evaluate(() => {
            const turn = Math.PI * 2;
            const pointer = ((1.5 * Math.PI - currentAngle) % turn + turn) % turn;
            return claimedHistory.length === 1 &&
                claimedHistory[0].title === prizes[Math.floor(pointer / (turn / prizes.length))].title;
        }), true);
    }, async page => {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.clock.install();
        await page.addInitScript(() => {
            Storage.prototype.setItem = () => { throw new Error('Storage is blocked'); };
        });
    }));

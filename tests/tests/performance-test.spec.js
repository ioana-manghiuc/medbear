const { test, expect } = require('@playwright/test');

test.describe('Performance Testing', () => {
    const BASE_URL = 'http://localhost:5173'; 
    const LOGIN_URL = `${BASE_URL}/log-in`;
    const HOME_URL = `${BASE_URL}/home`;
    const ACCOUNT_URL = `${BASE_URL}/user-account`;

    test('Measure page load time, API response time, and rendering time', async ({ page }) => {
        const startTime = performance.now();

        await page.goto(LOGIN_URL);
        const loginPageLoadTime = performance.now() - startTime;
        console.log(`Login page load time: ${loginPageLoadTime.toFixed(2)} ms`);

        const loginStart = performance.now();
        await page.fill('#login', 'bobo');
        await page.fill('#password', 'Bobo123!');
        await page.click('button.log-in-button');
        await expect(page).toHaveURL(HOME_URL);
        await expect(page.locator('h1.home')).toContainText('hello, bobo!');
        const loginResponseTime = performance.now() - loginStart;
        console.log(`Login API response time: ${loginResponseTime.toFixed(2)} ms`);

        const homePageLoadStart = performance.now();
        await page.waitForURL(HOME_URL);
        const homePageLoadTime = performance.now() - homePageLoadStart;
        console.log(`Home page load time: ${homePageLoadTime.toFixed(2)} ms`);

        await expect(page.locator('h1.home')).toContainText('hello, bobo!');

        const messageToSend = 'hi, this is bobo!';
        await page.fill('input.chat-input', messageToSend);
        const sendMessageStart = performance.now();
        await page.click('button.send-button');
        const sendMessageRenderTime = performance.now() - sendMessageStart;
        console.log(`Message send and render time: ${sendMessageRenderTime.toFixed(2)} ms`);

        await page.click('button.menu-button');
        await page.click('button.account-button');

        await expect(page).toHaveURL(ACCOUNT_URL);
        await expect(page.locator('h1.welcome-message')).toContainText('hello, bobo');

        await page.click('.header-edit .toggle-button');
        await page.click('button.edit-button');

        const newUsername = 'Bobo';
        await page.fill('.field input[type="text"]', newUsername);
        await page.click('button.save-button');

        await expect(page.locator('h1.welcome-message')).toContainText(`hello, ${newUsername}`);

        await page.click('button.back-button');
        await expect(page).toHaveURL(HOME_URL);
        await expect(page.locator('h1.home')).toContainText(`hello, ${newUsername}!`);

        const endToEndTime = performance.now() - startTime;
        console.log(`Total end-to-end test time: ${endToEndTime.toFixed(2)} ms`);

        expect(loginPageLoadTime).toBeLessThan(2000); 
        expect(homePageLoadTime).toBeLessThan(3000); 
        expect(sendMessageRenderTime).toBeLessThan(1000); 
        expect(endToEndTime).toBeLessThan(10000); 
    });
});
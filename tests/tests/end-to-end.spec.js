const { test, expect } = require('@playwright/test');

test.describe('End-to-End Flow: Log In -> Home -> Edit User Account', () => {
    const BASE_URL = 'http://localhost:5173'; 
    const LOGIN_URL = `${BASE_URL}/log-in`;
    const HOME_URL = `${BASE_URL}/home`;
    const ACCOUNT_URL = `${BASE_URL}/user-account`;

    test('Log in, edit username, and verify changes', async ({ page }) => {

        await page.goto(LOGIN_URL);

        await page.fill('#login', 'lola'); 
        await page.fill('#password', 'Lola123!'); 
        await page.click('button.log-in-button');

        await expect(page).toHaveURL(HOME_URL);
        await expect(page.locator('h1.home')).toContainText('hello, lola!');

        await page.click('button.menu-button');
        await page.click('button.account-button');

        await expect(page).toHaveURL(ACCOUNT_URL);
        await expect(page.locator('h1.welcome-message')).toContainText('hello, lola');

        await page.click('.header-edit .toggle-button');
        await page.click('button.edit-button');

        const newUsername = 'lolaaa';
        await page.fill('.field input[type="text"]', newUsername);
        await page.click('button.save-button');

        await expect(page.locator('h1.welcome-message')).toContainText(`hello, ${newUsername}`);

        await page.click('button.back-button');
        await expect(page).toHaveURL(HOME_URL);
        await expect(page.locator('h1.home')).toContainText(`hello, ${newUsername}!`);
    });
});
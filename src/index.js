const {Browser, Builder, By, Key, until, Actions, WebDriver, WebElement} = require('selenium-webdriver');
const { it, describe } = require('mocha');
const { expect } = require('chai');
const password = 'secret_sauce';
const users = [
  'standard_user',
  'locked_out_user',
  'problem_user',
  'performance_glitch_user'
]

const initialize = async (browserType) => await new Builder().forBrowser(browserType).build();
/**
 * Navigates to home and attempts to log user in.
 * @param {string} user username
 * @param {string} password user password
 * @param {WebDriver} driver selenium driver
 */
const loginAttempt = async (user, password, driver) => {
  await driver.get('https://www.saucedemo.com/');
  await driver.findElement(By.name('user-name')).sendKeys(user);
  await driver.findElement(By.name('password')).sendKeys(password, Key.RETURN);
}
/**
 * Checks for valid login by searching for an inventory container.
 * @param {WebDriver} driver 
 * @returns {Promise<WebElement[]>} elements
 */
const loginSuccess = async (driver) => {
  const loginSuccess = driver.findElements(By.id('inventory_container'));
  await driver.wait(loginSuccess, 1000);
  return loginSuccess;
}
const loginUsers = [
  'standard_user',
  'locked_out_user',
  'problem_user',
  'performance_glitch_user'
]
describe('logging in a user', () => {
  it('lets the user proceed to the shop', async () => {
    const driver = await initialize(Browser.CHROME);
    try {
      await loginAttempt('standard_user', password, driver);
      const success = await loginSuccess(driver);
      expect(success.length).greaterThan(0);
    } finally {
      await driver.quit();
    }
    
  });
});

describe('attempting to login a locked out user', () => {
  it('does not allow the user to proceed to the shop', () => {

  });

})



// (async function example() {
//   let driver = await new Builder().forBrowser(Browser.CHROME).build();
//   try {
//     await driver.get('https://www.saucedemo.com/');
//     await driver.findElement(By.name('user-name')).sendKeys('webdriver', Key.RETURN);
//     await driver.sleep(5000);
//     await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
//   } finally {
//     await driver.quit();
//   }
// })();
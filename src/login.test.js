const chromedriver = require('chromedriver');
const { By, Browser } = require('selenium-webdriver');
const { expect, use } = require('chai');
var chaiAsPromised = require("chai-as-promised");
use(chaiAsPromised);
const {
  initializeDriver, loginSuccess,
  maybeSleep, loginAttempt, users, password,
} = require('./utils');
const {
  standardUser, lockedUser
} = users;
/*
* BASIC LOGIN/LOCKOUT TEST
*/
module.exports = describe(
  'logging in as a standard user and locked out user', () => {
  it('lets the user proceed to the shop', async () => {
    const driver = await initializeDriver(Browser.CHROME);
    try {
      await loginAttempt(standardUser, password, driver);
      await loginSuccess(driver);
    } finally {
      await driver.quit();
    }
  });
  it('does not allow the user to proceed to the shop', async () => {
    const driver = await initializeDriver(Browser.CHROME);
    try {
      await loginAttempt(lockedUser, password, driver);
      await expect(loginSuccess(driver)).to.be.rejected;
    } finally {
      await driver.quit();
    }
  });
  it('shows a message indicating the user is locked out', async () => {
    const driver = await initializeDriver(Browser.CHROME);
    try {
      await loginAttempt(lockedUser, password, driver);
      const failure = await driver.findElements(By.className('error-message-container error'));
      expect(failure.length).greaterThan(0);
      await maybeSleep(driver);
    } finally {
      await driver.quit();
    }
  });
});
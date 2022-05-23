const chromedriver = require('chromedriver');
const { By, Browser } = require('selenium-webdriver');
const { expect, use } = require('chai');
var chaiAsPromised = require("chai-as-promised");
use(chaiAsPromised);
const {
  initializeDriver, userLogins, loginAttempt,
} = require('./utils');
const { password, users } = require('./utils/testData');
/*
* BASIC LOGIN/LOCKOUT TEST
*/
module.exports = describe(
  'logging in as a standard user and locked out user', () => {
  it('lets the user proceed to the shop', async () => {
    const driver = await initializeDriver(Browser.CHROME);
    try {
      await userLogins.standard(driver);
    } finally {
      await driver.quit();
    }
  });
  it('does not allow the user to proceed to the shop', async () => {
    const driver = await initializeDriver(Browser.CHROME);
    try {
      await expect(userLogins.locked(driver)).to.be.rejected;
    } finally {
      await driver.quit();
    }
  });
  it('shows a message indicating the user is locked out', async () => {
    const driver = await initializeDriver(Browser.CHROME);
    try {
      await loginAttempt(users.lockedUser, password, driver);
      const failure = await driver.findElements(By.className('error-message-container error'));
      expect(failure.length).greaterThan(0);
    } finally {
      await driver.quit();
    }
  });
});
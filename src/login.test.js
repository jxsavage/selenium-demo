const chromedriver = require('chromedriver');
const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const {
  initialize, loginSuccess,
  maybeSleep, loginAttempt, users
} = require('./utils');
const {
  password, standardUser, lockedUser
} = users;
/*
* BASIC LOGIN/LOCKOUT TEST
*/
module.exports = describe(
  'logging in as a standard user and locked out user', () => {
  it('lets the user proceed to the shop', async () => {
    const driver = await initialize(Browser.CHROME);
    let success = [];
    try {
      await loginAttempt(standardUser, password, driver);
      const success = await loginSuccess(driver);
      expect(success.length).greaterThan(0);
    } finally {
      await driver.quit();
    }
  });
  it('does not allow the user to proceed to the shop', async () => {
    const driver = await initialize(Browser.CHROME);
    try {
      await loginAttempt(lockedUser, password, driver);
      const success = await loginSuccess(driver);
      expect(success.length).lessThan(1);
      await maybeSleep(driver);
    } finally {
      await driver.quit();
    }
  });
  it('shows a message indicating the user is locked out', async () => {
    const driver = await initialize(Browser.CHROME);
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
const { WebDriver, By, Key, until } = require("selenium-webdriver");
const { users, password } = require("./testData");

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
 * Creates a function that only needs the driver
 * to login the specified user.
 * @param {string} user 
 * @param {string} password 
 */
const loginUser = (user, password) => {
  /**
   * Logs a user in with the parameters passed to loginUser
   * once the driver is supplied.
   * @param {WebDriver} driver 
   */
  const loginWrapper = async (driver) => {
    await loginAttempt(user, password, driver);
    await loginSuccess(driver);
  };
  return loginWrapper;
}
const {
  standardUser, lockedUser,
} = users;
const userLogins = {
  standard: loginUser(standardUser, password),
  locked: loginUser(lockedUser, password),
}

/**
 * Checks for valid login by searching for an inventory container.
 * @param {WebDriver} driver
 */
const loginSuccess = async (driver) => {
  await driver.wait(until.elementLocated(By.id('inventory_container')), 1000);
}

module.exports = {
  userLogins,
  loginAttempt,
}
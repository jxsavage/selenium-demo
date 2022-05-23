const { Browser, Builder, WebDriver } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const { verifyAtShoppingCart, getAllRemoveFromCartBtns, getAllAddToCartBtns } = require('./cart');
const { userLogins, loginAttempt } = require('./login');
const { openMenu, closeMenu, getAllMenuItemClicks } = require('./menu');
const { verifyAtProductPage, getProductPageInventoryProps } = require('./product');
const { testProductData } = require('./testData');
const testData = require('./testData');

/**
 * Initializes browser
 * @param {typeof Browser.CHROME} browserType 
 */
 const initializeDriver = async (browserType) => {
  const options = new Options();
  // Needed to supress errors in Windows that are irrelevant.
  options.excludeSwitches('enable-logging');
  const driver = await new Builder().forBrowser(browserType).build();
  return driver;
}

/**
 * Allows control of global sleep times to make it easier to see whats happening.
 * @param {WebDriver} driver selenium driver
 * @param {number} [timeOverride] optional parameter overrides the global sleep time
 */
 const maybeSleep = async (driver, timeOverride) => {
  const maybeSleepMS = 0;
  const sleepTime = timeOverride != undefined ? timeOverride : maybeSleepMS;
  await driver.sleep(sleepTime);
}

const getBtns = {
  page: {
    product: {
      add: getAllAddToCartBtns,
      remove: getAllRemoveFromCartBtns
    },
  cart: {
    remove: getAllRemoveFromCartBtns
    },
  },
}

module.exports = {
  testData,
  userLogins,
  testProductData,
  loginAttempt,
  openMenu,
  closeMenu,
  verifyAtShoppingCart,
  verifyAtProductPage,
  getAllMenuItemClicks,
  initializeDriver,
  getProductPageInventoryProps,
  getBtns,
}
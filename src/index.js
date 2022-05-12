const { Browser, Builder, By, Key, until, WebDriver, WebElement } = require('selenium-webdriver');
const chromedriver = require('chromedriver');
const { it, describe } = require('mocha');
const { expect } = require('chai');
const password = 'secret_sauce';
const users = [
  'standard_user',
  'locked_out_user',
  'problem_user',
  'performance_glitch_user'
]
const maybeSleepMS = 0;
/**
 * Allows control of global sleep times to make it easier to see whats happening.
 * @param {WebDriver} driver selenium driver
 * @param {number} [timeOverride] optional parameter overrides the global sleep time
 */
const maybeSleep = async (driver, timeOverride) => {
  const sleepTime = timeOverride != undefined ? timeOverride : maybeSleepMS;
  await driver.sleep(sleepTime);
}
/**
 * Initializes browser
 * @param {typeof Browser.CHROME} browserType 
 */
const initialize = async (browserType) => {
  const driver = await new Builder().forBrowser(browserType).build();
  return driver;
}
/**
 * Opens the menu
 * @param {WebDriver} driver 
 */
const openMenu = async (driver) => {
  const openMenuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
  await openMenuBtn.click();
}
/**
 * Closes the menu, waiting for the element to be visible to prevent errors.
 * @param {WebDriver} driver 
 */
const closeMenu = async (driver) => {
  const closeMenuBtn = await driver.findElement(By.id('react-burger-cross-btn'));
  await driver.wait(until.elementIsVisible(closeMenuBtn), 500);
  await closeMenuBtn.click();
}
/**
 * Determines if the menu is open, returns the promise of a boolean indicating the status.
 * @param {WebDriver} driver 
 * @returns {Promise<boolean>} Promise of boolean indicating wether or not the menu is open
 */
const menuIsOpen = async (driver) => {
  const menu = await driver.findElement(By.className('bm-menu-wrap'));
  const ariaHidden = await menu.getAttribute('aria-hidden');
  expect(ariaHidden).equals('true');
  console.log('ariaHidden:', ariaHidden);
  return ariaHidden === 'true' ? true : false;
}
const menuLinkIds = [
  'inventory_sidebar_link',
  'about_sidebar_link',
  'logout_sidebar_link',
  'reset_sidebar_link',
]
/**
 * Gets all menu items.
 * @param {WebDriver} driver 
 */
 const getAllMenuItemClicks = async (driver) => {
  const menuLinks = await Promise.all(menuLinkIds.map(async (menuLinkId) => await driver.findElement(By.id(menuLinkId))));
  const cartLink = await driver.findElement(By.className('shopping_cart_link'));
  menuLinks.push(cartLink);
  /**
   * Wraps the button or link in a function that ensures it's clickable,
   * if it's not it will open the menu and wait for it to be clickable. 
   * @param {WebElement} link
   */
  const ensureClickableFactory = (link) => {
    return async () => {
      const menuOpen = await menuIsOpen(driver);
      if(menuOpen === false) {
        await openMenu(driver);
      }
      await driver.wait(until.elementIsVisible(link), 1000);
      await link.click();
    }
  }
  const [
    clickInventoryLink, clickAboutLink, clickLogoutLink, clickResetLink, clickShoppingCartLink
  ] = menuLinks.map((menuLink) => ensureClickableFactory(menuLink));
  return {
    clickInventoryLink, clickAboutLink, clickLogoutLink, clickResetLink, clickShoppingCartLink,
  }
}

/**
 * Get functions that when called verify you're on a page via promise acceptance.
 * @param {WebDriver} driver 
 */
const getPageArrivalVerifications = (driver) => {
  const globalWaitToLocateTimeMS = 500;
  /**
   * Verifies we're at the Product page.
   * You can override wait time with optional parameter.
   * @param {number} [waitTimeMSOverride] optional wait time override.
   * @returns {Promise<void>} if the promise is accepted we're on the Product Page.
   */
  const verifyAtProductPage = async (waitTimeMSOverride) => {
    const waitTimeMS = waitTimeMSOverride !== undefined ? waitTimeMSOverride : globalWaitToLocateTimeMS;
    await driver.wait(until.elementLocated(By.id('inventory_container')), waitTimeMS);
  }
  /**
   * Verifies we're at the Shopping Cart Page.
   * You can override wait time with optional parameter.
   * @param {number} [waitTimeMSOverride] optional wait time override.
   * @returns {Promise<void>} if the promise is accepted we're on the Shopping Cart Page.
   */
  const verifyAtShoppingCart = async (waitTimeMSOverride) => {
    const waitTimeMS = waitTimeMSOverride !== undefined ? waitTimeMSOverride : globalWaitToLocateTimeMS;
    await driver.wait(until.elementLocated(By.id('cart_contents_container')), waitTimeMS);
  }
  return {
    verifyAtProductPage, verifyAtShoppingCart,
  }
}
/**
 * Navigates to home and attempts to log user in.
 * @param {string} user username
 * @param {string} password user password
 * @param {WebDriver} driver selenium driver
 */
const loginAttempt = async (user, password, driver) => {
  await driver.get('https://www.saucedemo.com/');
  await maybeSleep(driver);
  await driver.findElement(By.name('user-name')).sendKeys(user);
  await driver.findElement(By.name('password')).sendKeys(password, Key.RETURN);
  await maybeSleep(driver);
}
/**
 * Checks for valid login by searching for an inventory container.
 * @param {WebDriver} driver 
 * @returns {Promise<WebElement[]>} elements
 */
const loginSuccess = async (driver) => {
  const loginSuccess = driver.findElements(By.id('inventory_container'));
  await driver.wait(loginSuccess, 1000);
  await maybeSleep(driver);
  return loginSuccess;
}


const loginUsers = [
  'standard_user',
  'locked_out_user',
  'problem_user',
  'performance_glitch_user'
]
/*
* BASIC LOGIN/LOGOUT TEST
*/
describe('logging in a user', () => {
  it('lets the user proceed to the shop', async () => {
    const driver = await initialize(Browser.CHROME);
    let success = [];
    try {
      await loginAttempt('standard_user', password, driver);
      const success = await loginSuccess(driver);
      expect(success.length).greaterThan(0);
    } finally {
      await driver.quit();
    }
  });
});
/*
* LOCKED OUT USER TESTS
*/
describe('attempting to login a locked out user', () => {
  it('does not allow the user to proceed to the shop', async () => {
    const driver = await initialize(Browser.CHROME);
    try {
      await loginAttempt('locked-out-user', password, driver);
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
      await loginAttempt('locked-out-user', password, driver);
      const failure = await driver.findElements(By.className('error-message-container error'));
      expect(failure.length).greaterThan(0);
      await maybeSleep(driver);
    } finally {
      await driver.quit();
    }
  })
})

/*
* MENU FUNCTIONALITY TESTS
*/

describe('basic menu functionality', async () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {WebElement} */let menu = null;
  before(async () => {
    // Initialize and login
    driver = await initialize(Browser.CHROME);
    await loginAttempt('standard_user', password, driver);
    const loggedIn = await loginSuccess(driver);
    expect(loggedIn.length).greaterThan(0);
    menu = await driver.findElement(By.className('bm-menu-wrap'));
  })
  it('is hidden before the menu button is clicked', async () => {
    
    const ariaHidden = await menu.getAttribute('aria-hidden');
    expect(ariaHidden).equals('true');
  })
  it('is not hidden after the menu button is clicked', async () => {
    await openMenu(driver);
    const notAriaHidden = await menu.getAttribute('aria-hidden');
    const notHidden = await menu.getAttribute('hidden');
    expect(notAriaHidden).equals('false');
    expect(notHidden).equals(null);
  })
  it('hides again after the close button is clicked', async () => {
    await closeMenu(driver);
    const ariaHidden = await menu.getAttribute('aria-hidden');
    expect(ariaHidden).equals('true');
  })
  it('navigates to the shopping cart', async () => {
    const { clickShoppingCartLink } = await getAllMenuItemClicks(driver);
    await clickShoppingCartLink();
    const { verifyAtShoppingCart } = getPageArrivalVerifications(driver);
    await verifyAtShoppingCart();
    await closeMenu(driver);
  })
  it('navigates to the product page', async () => {
    const { clickInventoryLink } = await getAllMenuItemClicks(driver);
    console.log('menu is open?', await menuIsOpen(driver));
    await maybeSleep(driver, 5000);
    await openMenu(driver);
    await maybeSleep(driver);
    const product = await driver.findElement(By.id('inventory_sidebar_link'));
    await driver.wait(until.elementIsVisible(product), 1000);
    await product.click();
    // await clickInventoryLink();
    // await maybeSleep(driver, 2000)
    const { verifyAtProductPage } = getPageArrivalVerifications(driver);
    await verifyAtProductPage();
  })
  after(async () => {
    await driver.quit();
  })
})
/*
* SHOPING CART TESTS
*/
const addToCartPrefix = 'add-to-cart-'
const removeFromtCartPrefix = 'remove-'
const buttonIds = [
  'sauce-labs-backpack',
  'sauce-labs-bike-light',
  'sauce-labs-bolt-t-shirt',
  'sauce-labs-fleece-backpack',
  'sauce-labs-onesie',
  'test.allthethings()-t-shirt',
]
describe('product page functionality', async () => {
  const driver = await initialize(Browser.CHROME);
  it('adds items to the shopping cart', async () => {
    let success = [];
    try {
      await loginAttempt('standard_user', password, driver);
      const success = await loginSuccess(driver);
      expect(success.length).greaterThan(0);
    } finally {
      await driver.quit();
    }
  })
  after(async () => {
    await driver.quit();
  })
})
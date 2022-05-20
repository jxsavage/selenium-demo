const {
  WebElement, WebDriver, Browser, Builder, By, until, Key,
} = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const {
  password, users, testProductData, parseProductBtnId,
} = require("./testData");


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
 * Opens the menu
 * @param {WebDriver} driver 
 */
const openMenu = async (driver) => {
  const openMenuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
  const closeMenuBtn = await driver.findElement(By.id('react-burger-cross-btn'));
  await openMenuBtn.click();
  await driver.wait(until.elementIsVisible(closeMenuBtn), 500);
  
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
 * Gets all menu items.
 * @param {WebDriver} driver 
 */
 const getAllMenuItemClicks = async (driver) => {
  const menuLinkIds = [
    'inventory_sidebar_link',
    'about_sidebar_link',
    'logout_sidebar_link',
    'reset_sidebar_link',
  ];
  const menuLinks = await Promise.all(menuLinkIds.map(async (menuLinkId) => await driver.findElement(By.id(menuLinkId))));
  const cartLink = await driver.findElement(By.className('shopping_cart_link'));
  menuLinks.push(cartLink);
  /**
   * Wraps the button or link in a function that ensures it's clickable,
   * if it's not it will wait for it to be clickable. 
   * @param {WebElement} link
   */
  const ensureClickableFactory = (link) => {
    return async () => {
      await driver.wait(until.elementIsEnabled(link), 1000);
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
 */
const loginSuccess = async (driver) => {
  await driver.wait(until.elementLocated(By.id('inventory_container')), 1000);
}

/**
 * Given a product button element gets its id and returns
 * the wether it can add or remove a product,
 * its original id and the base of its id.
 * @param {WebElement} productBtn
 */
const productBtnToId = async (productBtn) => {
  const btnId = await productBtn.getAttribute('id');
  return parseProductBtnId(btnId);
}
/**
 * Get the price as a number from the element on the product page.
 * @param {WebElement} priceEle 
 * @returns {Promise<number>} price
 */
const priceEleToNumber = async (priceEle) => {
  const priceTxt = await priceEle.getText();
  return Number(priceTxt.replace(/\$/g, ""));
}

/**
 * Get productId, BtnId, Btn, price, and can add can remove status.
 * @param {WebElement} productEle product page product element.
 */
const getProductPropsFromEle = async (productEle) => {

  const [priceEle, productBtn] = await Promise.all([
    await productEle.findElement(By.className('inventory_item_price')),
    await productEle.findElement(By.className('btn_inventory')),
  ]);
  const [price, btnProps] = await Promise.all([
    await priceEleToNumber(priceEle),
    await productBtnToId(productBtn),
  ]);
  return {...btnProps, price, productBtn}
}
//** @typedef {{ price: number, productBtn: WebElement, addBtnId: string, removeBtnId: string, btnId: string, productName: string, canAdd: boolean, canRemove: boolean}[]} ProductProperties */
/**
 * 
 * @param {WebDriver} driver 
 * returns {Promise<ProductProperties>}
 */
const getProductPageIventoryProps = async (driver) => {
  const productEles = await driver.wait(until.elementsLocated(
    By.className('inventory_item'),
  ));

  //** @type {ProductProperties} */
  const propsArray = await Promise.all(productEles.map(
    async (element) => {
    const props = await getProductPropsFromEle(element);
    return props;
  }));
  return propsArray;
}
const getCartCounter = async (driver) => {
  const [cartCounter] = await driver.findElements(
    By.className('shopping_cart_badge'),
  );
  let count = 0;
  if (cartCounter) {
    const countTxt = await cartCounter.getText();
    count = Number(countTxt);
  }
  return count;
}
/**
 * Gets the add to cart buttons on the product page
 * @param {WebDriver} driver 
 * @returns {Promise<WebElement[]>}
 */
const getAllAddToCartBtns = async (driver) => {
  return await Promise.all(
    testProductData.addIdArray.map(
      async (addBtnId) => {
        const [btnEle] = await driver.findElements(
          By.id(addBtnId),
        );
        return btnEle;
  }));
};
/**
 * Gets the add to cart buttons on the product and cart page
 * @param {WebDriver} driver 
 * @returns {Promise<WebElement[]>}
 */
const getAllRemoveFromCartBtns = async (driver) => {
  return await Promise.all(
    testProductData.removeIdArray.map(
      async (removeBtnId) => {
        const [btnEle] = await driver.findElements(
          By.id(removeBtnId),
        );
        return btnEle;
  }));
};
const getBtns = {
  page: {
    product: {
      add: getAllAddToCartBtns,
      remove: getAllRemoveFromCartBtns
    },
  cart: {
    remove: getAllRemoveFromCartBtns
  }
  },
}
module.exports = {
  users,
  password,
  getBtns,
  openMenu,
  closeMenu,
  maybeSleep,
  loginAttempt,
  loginSuccess,
  initializeDriver,
  getAllMenuItemClicks,
  getProductPageIventoryProps,
  getPageArrivalVerifications,
}
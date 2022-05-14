const { Browser, Builder, By, Key, until, WebDriver, WebElement } = require('selenium-webdriver');
const chromedriver = require('chromedriver');
const { it, describe } = require('mocha');
const { expect, assert } = require('chai');
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
  })
  it('navigates to the product page', async () => {
    const { clickInventoryLink } = await getAllMenuItemClicks(driver);
    await openMenu(driver);
    await clickInventoryLink();
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
  'sauce-labs-fleece-jacket',
  'sauce-labs-onesie',
  'test.allthethings()-t-shirt-(red)',
]
describe('product page functionality', async () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {WebElement[]} */let addToCartButtons = null;
  /** @type {WebElement[]} */let removeFromCartButtons = [];
  before(async () => {
    // Initialize and login
    driver = await initialize(Browser.CHROME);
    await loginAttempt('standard_user', password, driver);
    const loggedIn = await loginSuccess(driver);
    expect(loggedIn.length).greaterThan(0);
    addToCartButtons = await Promise.all(
      buttonIds.map(
        async (buttonId) => await driver.findElement(By.id(`${addToCartPrefix}${buttonId}`))
      ));
  })
  it('has no counter on the shopping cart before items are added', async () => {
    const [cartCounter] = await driver.findElements(By.className('shopping_cart_badge'));
    expect(cartCounter).equals(undefined);
  });
  buttonIds.forEach((buttonId, index) => {
    
    it(`adds item ${buttonId} to the shopping cart`, async () => {
      await addToCartButtons[index].click();
      await driver.sleep(500);
    });
    it(`changes the add item button to a remove button for the ${buttonId}`, async () => {
      const removeBtn = await driver.findElement(By.id(`${removeFromtCartPrefix}${buttonId}`));
      removeFromCartButtons.push(removeBtn);
    });
    it(`increments the shopping cart item counter to ${index+1}`, async () => {
      const cartCounter = await driver.findElement(By.className('shopping_cart_badge')).getText();
      expect(Number(cartCounter)).equals(index+1);
    });
  });
  buttonIds.forEach((buttonId, index) => {
    it(`removes ${buttonId} from the shopping cart`, async () => {
      await removeFromCartButtons.shift().click();
    });
    it(`changes the ${buttonId} remove button back to an add to cart button`, async () => {
      const addBtn = await driver.findElement(By.id(`${addToCartPrefix}${buttonId}`));
      await driver.wait(until.elementIsVisible(addBtn), 500);
    });
    it(`decrements the shopping cart item counter to ${buttonIds.length - (index + 1)}`, async () => {
      const [cartCounter] = await driver.findElements(By.className('shopping_cart_badge'));
      
      if((index) === buttonIds.length - 1) {
        expect(cartCounter).equal(undefined);
      } else {
        const count = await cartCounter.getText();
        expect(Number(count)).equals(buttonIds.length - (index + 1));
      }
      
    });
  })
  
  after(async () => {
    await driver.quit();
  });
});
/*
* SHOPPING CART PAGE TESTS
*/
describe('shopping cart page functionality', async () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {number[]} */let productPagePrices = [];
  before(async () => {
    // Initialize and login
    driver = await initialize(Browser.CHROME);
    await loginAttempt('standard_user', password, driver);
    const loggedIn = await loginSuccess(driver);
    expect(loggedIn.length).greaterThan(0);
    const priceElements = await driver.wait(until.elementsLocated(By.className('inventory_item_price')), 500);
    /** @type {number[]} */productPagePrices = await Promise.all(
      priceElements.map(async (PriceEle) => {
        const priceTxt = await PriceEle.getText();
        const noCurrencySymbolPrice = Number(priceTxt.replace(/\$/g, ""));
        return Number(noCurrencySymbolPrice);
      })
    );
  })
  buttonIds.forEach((buttonId, index) => {
    
    it(`adds item ${buttonId} to the shopping cart page after being added from the product page`, async () => {
      await driver.sleep(500);
      /** @type {WebElement[]} */const addToCartButtons = await Promise.all(
      buttonIds.map(
          async (buttonId, index) => {
            return await driver.wait(until.elementLocated(By.id(`${addToCartPrefix}${buttonId}`)), 500)
          } 
      ));
      await addToCartButtons[index].click();
      const { clickShoppingCartLink } = await getAllMenuItemClicks(driver);
      await clickShoppingCartLink();
      const cartElements = await driver.findElement(By.className('inventory_item_name'));
      await driver.wait(until.elementIsVisible(cartElements), 500);
      await driver.sleep(500);
    });
    it(`adds the right product: ${buttonId}`, async () => {
      const removeBtn = await driver.wait(until.elementLocated(By.id(`${removeFromtCartPrefix}${buttonId}`)), 500);
      await driver.sleep(500);
    });
    it(`${buttonId} has the correct quantity of 1`, async () => {
      const quantity = await driver.wait(until.elementLocated(By.className('cart_quantity')), 500).getText();
      expect(Number(quantity)).equals(1);
    });
    it(`${buttonId} shopping cart price matches the product page price`, async () => {
      const priceTxt = await driver.wait(until.elementLocated(By.className('inventory_item_price')), 500).getText();
      const shoppingCartPrice = Number(priceTxt.replace(/\$/g, ""));
      assert.isNumber(shoppingCartPrice);
      assert.strictEqual(shoppingCartPrice, productPagePrices[index]);
    });
    it(`removes ${buttonId} from the shopping cart item remove item button`, async () => {
      const removeBtn = await driver.wait(until.elementLocated(By.id(`${removeFromtCartPrefix}${buttonId}`)), 500);
      await removeBtn.click();
      const cartQuantityElements = await driver.findElements(By.className('inventory_item_name'));
      expect(cartQuantityElements.length).equals(0);
      await driver.navigate().back();
      await driver.sleep(500);
    });
  })
  
  after(async () => {
    await driver.quit();
  });
});
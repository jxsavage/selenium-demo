const chromedriver = require('chromedriver');
const { expect, assert } = require('chai');
const {
  By, WebDriver, WebElement, until,
} = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const {
  initialize, loginSuccess, productAttribute,
  loginAttempt, getAllMenuItemClicks, users, productPageProps,
} = require('./utils');
const {
  password, standardUser
} = users;
/*
* SHOPPING CART PAGE TESTS
*/
describe('shopping cart page functionality', () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {number[]} */let productPagePrices = [];
  before(async () => {
    // Initialize and login
    driver = await initialize(Browser.CHROME);
    await loginAttempt(standardUser, password, driver);
    await loginSuccess(driver);
    const priceElements = await driver.wait(until.elementsLocated(By.className('inventory_item_price')), 500);
    /** @type {number[]} */productPagePrices = await Promise.all(
      priceElements.map(async (PriceEle) => {
        const priceTxt = await PriceEle.getText();
        const noCurrencySymbolPrice = Number(priceTxt.replace(/\$/g, ""));
        return Number(noCurrencySymbolPrice);
      })
    );
  })
  productPageProps.buttonIdBases.forEach((buttonId, index) => {

    it(`adds item ${buttonId} to the shopping cart page after being added from the product page`,
    async () => {
      /** @type {WebElement[]} */const addToCartButtons = await Promise.all(
        productPageProps.buttonIdBases.map(
          async (buttonId, index) => {
            return await driver.wait(until.elementLocated(By.id(`${productAttribute.addToCartPrefix}${buttonId}`)), 500)
          }
        ));
      await addToCartButtons[index].click();
      const { clickShoppingCartLink } = await getAllMenuItemClicks(driver);
      await clickShoppingCartLink();
      const cartElements = await driver.findElement(
        By.className('inventory_item_name'),
      );
      await driver.wait(until.elementIsVisible(cartElements), 500);
    });
    it(`adds the right product: ${buttonId}`, async () => {
      await driver.wait(
        until.elementLocated(By.id(
          `${productAttribute.removeFromCartPrefix}${buttonId}`)), 500,
      );
    });
    it(`${buttonId} has the correct quantity of 1`,
    async () => {
      const quantity = await driver.wait(
        until.elementLocated(By.className('cart_quantity')), 500,
      ).getText();
      expect(Number(quantity)).equals(1);
    });
    it(`${buttonId} shopping cart price matches the product page price`,
    async () => {
      const priceTxt = await driver.wait(until.elementLocated(
        By.className('inventory_item_price')), 500,
      ).getText();
      const shoppingCartPrice = Number(priceTxt.replace(/\$/g, ""));
      assert.isNumber(shoppingCartPrice);
      assert.strictEqual(shoppingCartPrice, productPagePrices[index]);
    });
    it(`removes ${buttonId} from the shopping cart item remove item button`,
    async () => {
      const removeBtn = await driver.wait(
        until.elementLocated(
          By.id(`${productAttribute.removeFromCartPrefix}${buttonId}`)), 500,
        );
      await removeBtn.click();
      const cartQuantityElements = await driver.findElements(
        By.className('inventory_item_name'),
      );
      expect(cartQuantityElements.length).equals(0);
      await driver.navigate().back();
    });
  })

  after(async () => {
    await driver.quit();
  });
});
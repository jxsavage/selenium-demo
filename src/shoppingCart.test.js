const chromedriver = require('chromedriver');
const { expect, assert } = require('chai');
const {
  By, WebDriver, WebElement, until,
} = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const {
  initializeDriver, userLogins,
  getAllMenuItemClicks, testProductData,
} = require('./utils');
/*
* SHOPPING CART PAGE TESTS
*/
describe('shopping cart page functionality', () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {number[]} */let productPagePrices = [];
  before(async () => {
    // Initialize and login
    driver = await initializeDriver(Browser.CHROME);
    await userLogins.standard(driver);
    const priceElements = await driver.wait(until.elementsLocated(By.className('inventory_item_price')), 500);
    /** @type {number[]} */productPagePrices = await Promise.all(
      priceElements.map(async (PriceEle) => {
        const priceTxt = await PriceEle.getText();
        const noCurrencySymbolPrice = Number(priceTxt.replace(/\$/g, ""));
        return Number(noCurrencySymbolPrice);
      })
    );
  })
  testProductData.productArray.forEach((testProduct, index) => {

    it(`adds item ${testProduct.title} to the shopping cart page after being added from the product page`,
    async () => {
      /** @type {WebElement[]} */const addToCartButtons = await Promise.all(
        testProductData.addIdArray.map(
          async (buttonId, index) => {
            return await driver.wait(
              until.elementLocated(By.id(buttonId)), 500)
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
    it(`adds the right product: ${testProduct.title}`, async () => {
      await driver.wait(
        until.elementLocated(By.id(
          testProduct.removeBtnId)), 500,
      );
    });
    it(`${testProduct.title} has the correct quantity of 1`,
    async () => {
      const quantity = await driver.wait(
        until.elementLocated(By.className('cart_quantity')), 500,
      ).getText();
      expect(Number(quantity)).equals(1);
    });
    it(`${testProduct.title} shopping cart price matches the product page price of ${testProduct.price}`,
    async () => {
      const priceTxt = await driver.wait(until.elementLocated(
        By.className('inventory_item_price')), 500,
      ).getText();
      const shoppingCartPrice = Number(priceTxt.replace(/\$/g, ""));
      assert.isNumber(shoppingCartPrice);
      // TODO refactor to use baseCssId to get price from test data rather than index.
      assert.strictEqual(shoppingCartPrice, productPagePrices[index]);
    });
    it(`removes ${testProduct.title} from the shopping cart item remove item button`,
    async () => {
      const removeBtn = await driver.wait(
        until.elementLocated(
          By.id(testProduct.removeBtnId)), 500,
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
const chromedriver = require('chromedriver');
const { expect, assert } = require('chai');
const {
  By, WebDriver, WebElement, until,
} = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const {
  initializeDriver, userLogins,
  getAllMenuItemClicks, testProductData, getCartPageInventoryProps, getProductPageInventoryProps, verifyAtShoppingCart,
} = require('./utils');
/*
* SHOPPING CART PAGE TESTS
*/
describe('shopping cart page functionality', () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {ReturnType<getCartPageInventoryProps>} */let cartProductProps;
  before(async () => {
    // Initialize and login
    driver = await initializeDriver(Browser.CHROME);
    await userLogins.standard(driver);
    cartProductProps = getCartPageInventoryProps(driver);
  })
  testProductData.productArray.forEach((testProduct, i) => {

    it(`adds item ${testProduct.title} to the shopping cart page after being added from the product page`,
    async () => {
      const productPageProps = await getProductPageInventoryProps(driver);
      const product = productPageProps.find(({baseCssId}) => {
        return baseCssId === testProduct.baseCssId;
      });
      await product.productBtn.click();
      const { clickShoppingCartLink } = await getAllMenuItemClicks(driver);
      await clickShoppingCartLink();
      await verifyAtShoppingCart(driver);
      const [ currentItem ] = await getCartPageInventoryProps(driver);
      expect(currentItem.baseCssId).equals(testProduct.baseCssId);
    });
    it(`adds the right product: ${testProduct.title}`, async () => {
      const [ currentCartItem ] = await getCartPageInventoryProps(driver);
      expect(currentCartItem.baseCssId).equals(testProduct.baseCssId);
    });
    it(`${testProduct.title} has the correct quantity of 1`,
    async () => {
      const [ currentItem ] = await getCartPageInventoryProps(driver);
      expect(Number(currentItem.quantity)).equals(1);
    });
    it(`${testProduct.title} shopping cart price matches the product page price of ${testProduct.price}`,
    async () => {
      const [ currentItem ] = await getCartPageInventoryProps(driver);
      assert.isNumber(currentItem.price);
      assert.strictEqual(currentItem.price, testProductData.products[currentItem.baseCssId].price);
    });
    it(`removes ${testProduct.title} from the shopping cart item remove item button`,
    async () => {
      const [ currentItem ] = await getCartPageInventoryProps(driver);
      await currentItem.productBtn.click();
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
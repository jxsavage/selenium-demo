const chromedriver = require('chromedriver');
const {
  By, WebDriver, until,
} = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const { expect, use, } = require('chai');
var chaiAsPromised = require("chai-as-promised");
use(chaiAsPromised);
const {
  initializeDriver, getProductPageInventoryProps,
  userLogins, testProductData,
} = require('./utils');
/*
* PRODUCT PAGE TESTS
*/
describe('product page functionality', () => {
  /** @type {WebDriver} */let driver = null;
  // /** @type {WebElement[]} */let addToCartButtons = null;
  /** type {import('./utils').ProductProperties} */
  
  /** @type {ReturnType<getProductPageInventoryProps>} */ let inventoryProps;
  before(async () => {
    // Initialize and login
    driver = await initializeDriver(Browser.CHROME);
    await userLogins.standard(driver);
    inventoryProps = getProductPageInventoryProps(driver);
  });
  it('has no counter on the shopping cart before items are added', async () => {
    const [cartCounter] = await driver.findElements(
      By.className('shopping_cart_badge'),
    );
    expect(cartCounter).equals(undefined);
  });
  const removeBtns = {};
  let currentProduct;
  testProductData.productArray.forEach((testProduct, index) => {
    it(`adds item ${testProduct.title} to the shopping cart`, async () => {
      const actualProps = await inventoryProps;
      currentProduct = actualProps.find((product) => {
        return product.baseCssId === testProduct.baseCssId;
      });
      await currentProduct.productBtn.click();
    });
    it(`changes the add item button to a remove button for the ${testProduct.title}`,
    async () => {
      removeBtns[testProduct.baseCssId] = await driver.wait(
        until.elementLocated(By.id(testProduct.removeBtnId)),
          500);
    });
    it(`increments the shopping cart item counter to ${index+1}`,
    async () => {
      const cartCounter = await driver.wait(
       until.elementLocated(By.className('shopping_cart_badge')),
        500).getText();
      expect(Number(cartCounter)).equals(index+1);
    });
  });
  testProductData.productArray.forEach((testProduct, index) => {
    
    it(`removes ${testProduct.title} from the shopping cart`,
    async () => {
      const actualProps = await inventoryProps;
      currentProduct = actualProps.find((actualProduct) => {
        return testProduct.baseCssId === actualProduct.baseCssId;
      });
      await removeBtns[currentProduct.baseCssId].click();
    });
    it(`changes the ${testProduct.title} remove button back to an add to cart button`,
    async () => {
      await driver.wait(until.elementLocated(By.id(testProduct.addBtnId)), 500);
    });
    it(`decrements the shopping cart item counter to ${testProductData.productArray.length - (index + 1)}`,
    async () => {
      const [cartCounter] = await driver.findElements(
        By.className('shopping_cart_badge'),
      );
      if((index) === testProductData.productArray.length - 1) {
        expect(cartCounter).equal(undefined);
      } else {
        const count = await cartCounter.getText();
        expect(Number(count))
            .equals(testProductData.productArray.length - (index + 1));
      }
    });
  });
  after(async () => {
    await driver.quit();
  });
});
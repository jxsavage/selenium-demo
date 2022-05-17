const chromedriver = require('chromedriver');
const {
  By, WebDriver, until,
} = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const { expect, use, } = require('chai');
var chaiAsPromised = require("chai-as-promised");
use(chaiAsPromised);
const {
  initialize, loginSuccess,
  loginAttempt, users, productAttribute, getBtns, maybeSleep, getProductPageIventoryProps, productPageProps
} = require('./utils');
const {
  password, standardUser
} = users;
/*
* PRODUCT PAGE TESTS
*/
describe('product page functionality', () => {
  /** @type {WebDriver} */let driver = null;
  // /** @type {WebElement[]} */let addToCartButtons = null;
  /** @type {import('./utils').ProductProperties} */ let inventoryProps = [];
  before(async () => {
    // Initialize and login
    driver = await initialize(Browser.CHROME);
    await loginAttempt(standardUser, password, driver);
    await loginSuccess(driver);
    inventoryProps = await productPageProps.get(driver);
  });
  it('has no counter on the shopping cart before items are added', async () => {
    const [cartCounter] = await driver.findElements(
      By.className('shopping_cart_badge'),
    );
    expect(cartCounter).equals(undefined);
  });
  const removeBtns = {};
  let currentProduct = null;
  let currentAddBtn = null;
  productPageProps.buttonIdBases.forEach((productName, index) => {
    
    
    it(`adds item ${productName} to the shopping cart`, async () => {
      currentProduct = inventoryProps.find((product) => {
        return product.productName === productName;
      });
      currentAddBtn = currentProduct.productBtn;
      console.log(`test 1 case ${index}`);
      await currentAddBtn.click();
    });
    it(`changes the add item button to a remove button for the ${productName}`,
    async () => {
      removeBtns[productName] = await driver.wait(
        until.elementLocated(By.id(currentProduct.removeBtnId)),
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
  productPageProps.buttonIdBases.forEach((productName, index) => {
    
    it(`removes ${productName} from the shopping cart`,
    async () => {
      currentProduct = inventoryProps.find((product) => {
        return product.productName === productName;
      });
      await removeBtns[productName].click();
    });
    it(`changes the ${productName} remove button back to an add to cart button`,
    async () => {
      await driver.wait(until.elementLocated(By.id(currentProduct.addBtnId)), 500);
    });
    it(`decrements the shopping cart item counter to ${productPageProps.buttonIdBases.length - (index + 1)}`,
    async () => {
      const [cartCounter] = await driver.findElements(
        By.className('shopping_cart_badge'),
      );
      if((index) === productPageProps.buttonIdBases.length - 1) {
        expect(cartCounter).equal(undefined);
      } else {
        const count = await cartCounter.getText();
        expect(Number(count))
            .equals(productPageProps.buttonIdBases.length - (index + 1));
      }
    });
  });
  after(async () => {
    await driver.quit();
  });
});
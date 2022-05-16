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
  loginAttempt, users, productAttribute, getBtns, maybeSleep, getProductPageIventoryProps
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
  /** type {import('./utils').ProductProperties} */ let inventoryProps = [];
  before(async () => {
    // Initialize and login
    driver = await initialize(Browser.CHROME);
    await loginAttempt(standardUser, password, driver);
    await loginSuccess(driver);
    // addToCartButtons = await getBtns.page.product.add(driver);
    const invProps = await getProductPageIventoryProps(driver);
    inventoryProps = invProps;
    // await Promise.all(
    //   productAttribute.buttonIds.map(
    //     async (buttonId) => await driver.findElement(
    //       By.id(`${productAttribute.addToCartPrefix}${buttonId}`,
    // ))),
  });
  it('has no counter on the shopping cart before items are added', async () => {
    const [cartCounter] = await driver.findElements(
      By.className('shopping_cart_badge'),
    );
    expect(cartCounter).equals(undefined);
  });
  inventoryProps.forEach((props, index) => {
    const {
      productBtn, productName, removeBtnId
    } = props;
    it(`adds item ${productName} to the shopping cart`, async () => {
      await productBtn.click();
    });
    it(`changes the add item button to a remove button for the ${productName}`, async () => {
      const removeBtn = await driver.findElement(By.id(removeBtnId));
      props.productBtn = removeBtn;
    });
    it(`increments the shopping cart item counter to ${index+1}`, async () => {
      const cartCounter = await driver.findElement(
        By.className('shopping_cart_badge'),
      ).getText();
      expect(Number(cartCounter)).equals(index+1);
    });
  });
  inventoryProps.forEach((props, index) => {
    const {
      productBtn, productName, addBtnId
    } = props;
    it(`removes ${productName} from the shopping cart`, async () => {
      await productBtn.click();
    });
    it(`changes the ${productName} remove button back to an add to cart button`, async () => {
      await driver.wait(until.elementLocated(By.id(addBtnId)), 500);
    });
    it(`decrements the shopping cart item counter to ${productAttribute.buttonIds.length - (index + 1)}`,
      async () => {
        const [cartCounter] = await driver.findElements(
          By.className('shopping_cart_badge'),
        );
        if((index) === productAttribute.buttonIds.length - 1) {
          expect(cartCounter).equal(undefined);
        } else {
          const count = await cartCounter.getText();
          expect(Number(count))
              .equals(
                productAttribute.buttonIds.length - (index + 1),
          );
    }});
  })
  after(async () => {
    await driver.quit();
  });
});
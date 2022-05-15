const chromedriver = require('chromedriver');
const { expect } = require('chai');
const {
  By, WebDriver, WebElement, until,
} = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const {
  initialize, loginSuccess,
  loginAttempt, users, productAttribute
} = require('./utils');
const {
  password, standardUser
} = users;
/*
* PRODUCT PAGE TESTS
*/
describe('product page functionality', async () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {WebElement[]} */let addToCartButtons = null;
  /** @type {WebElement[]} */let removeFromCartButtons = [];
  before(async () => {
    // Initialize and login
    driver = await initialize(Browser.CHROME);
    await loginAttempt(standardUser, password, driver);
    const loggedIn = await loginSuccess(driver);
    expect(loggedIn.length).greaterThan(0);
    addToCartButtons = await Promise.all(
      productAttribute.buttonIds.map(
        async (buttonId) => await driver.findElement(
          By.id(`${productAttribute.addToCartPrefix}${buttonId}`,
    ))),
  )});
  it('has no counter on the shopping cart before items are added', async () => {
    const [cartCounter] = await driver.findElements(
      By.className('shopping_cart_badge'),
    );
    expect(cartCounter).equals(undefined);
  });
  productAttribute.buttonIds.forEach((buttonId, index) => {
    
    it(`adds item ${buttonId} to the shopping cart`, async () => {
      await addToCartButtons[index].click();
      await driver.sleep(500);
    });
    it(`changes the add item button to a remove button for the ${buttonId}`, async () => {
      const removeBtn = await driver.findElement(
        By.id(`${productAttribute.removeFromCartPrefix}${buttonId}`
      ));
      removeFromCartButtons.push(removeBtn);
    });
    it(`increments the shopping cart item counter to ${index+1}`, async () => {
      const cartCounter = await driver.findElement(
        By.className('shopping_cart_badge'),
      ).getText();
      expect(Number(cartCounter)).equals(index+1);
    });
  });
  productAttribute.buttonIds.forEach((buttonId, index) => {
    it(`removes ${buttonId} from the shopping cart`, async () => {
      await removeFromCartButtons.shift().click();
    });
    it(`changes the ${buttonId} remove button back to an add to cart button`, async () => {
      const addBtn = await driver.findElement(
        By.id(`${productAttribute.addToCartPrefix}${buttonId}`,
        ));
      await driver.wait(until.elementIsVisible(addBtn), 500);
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
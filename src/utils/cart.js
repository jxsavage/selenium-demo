const { WebDriver, WebElement, By, until } = require("selenium-webdriver");
const { testProductData } = require("./testData");

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
 * Verifies we're at the Shopping Cart Page.
 * You can override wait time with optional parameter.
 * @param {WebDriver} driver Selenium Driver
 * @param {number} [waitTimeMSOverride] optional wait time override.
 * @returns {Promise<void>} if the promise is accepted we're on the Shopping Cart Page.
 */
const verifyAtShoppingCart = async (driver, waitTimeMSOverride) => {
  const waitToVerifyMS = 500;
  const waitTimeMS = waitTimeMSOverride !== undefined ?
    waitTimeMSOverride : waitToVerifyMS;
  await driver.wait(until.elementLocated(By.id('cart_contents_container')), waitTimeMS);
}

module.exports = {
  verifyAtShoppingCart,
  getAllAddToCartBtns,
  getAllRemoveFromCartBtns,
}
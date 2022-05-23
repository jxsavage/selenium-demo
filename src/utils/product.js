const { WebElement, By, WebDriver, until } = require("selenium-webdriver");
const { priceEleToNumber, productBtnToId } = require("./helpers");

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
  return { ...btnProps, price, productBtn }
}

/**
 * 
 * @param {WebDriver} driver 
 * returns {Promise<ProductProperties>}
 */
const getProductPageInventoryProps = async (driver) => {
  const productEles = await driver.wait(until.elementsLocated(
    By.className('inventory_item'),
  ), 500);
  const propsArray = await Promise.all(productEles.map(
    async (element) => {
      const props = await getProductPropsFromEle(element);
      return props;
    }));
  return propsArray;
}

/**
 * Verifies we're at the Product page.
 * You can override wait time with optional parameter.
 * @param {WebDriver} driver Selenium Driver
 * @param {number} [waitTimeMSOverride] optional wait time override.
 * @returns {Promise<void>} if the promise is accepted we're on the Product Page.
 */
const verifyAtProductPage = async (driver, waitTimeMSOverride) => {
  const waitToVerifyMS = 500;
  const waitTimeMS = waitTimeMSOverride !== undefined ?
    waitTimeMSOverride : waitToVerifyMS;
  await driver.wait(until.elementLocated(By.id('inventory_container')), waitTimeMS);
}

module.exports = {
  verifyAtProductPage,
  getProductPageInventoryProps,
}
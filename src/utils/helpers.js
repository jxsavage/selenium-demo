const { WebElement, By, WebDriver } = require("selenium-webdriver");
const { parseProductBtnId } = require("./testData");

/**
 * Given a product button element gets its id and returns
 * the wether it can add or remove a product,
 * its original id and the base of its id.
 * @param {WebElement} productBtn
 */
 const productBtnToId = async (productBtn) => {
  const btnId = await productBtn.getAttribute('id');
  return parseProductBtnId(btnId);
}
/**
 * Get the price as a number from the element on the product page.
 * @param {WebElement} priceEle 
 * @returns {Promise<number>} price
 */
const priceEleToNumber = async (priceEle) => {
  const priceTxt = await priceEle.getText();
  return Number(priceTxt.replace(/\$/g, ""));
}
/**
 * 
 * @param {WebDriver} driver 
 * @returns 
 */
const getCartCounter = async (driver) => {
  const [cartCounter] = await driver.findElements(
    By.className('shopping_cart_badge'),
  );
  let count = 0;
  if (cartCounter) {
    const countTxt = await cartCounter.getText();
    count = Number(countTxt);
  }
  return count;
}
module.exports = {
  productBtnToId,
  priceEleToNumber,
}
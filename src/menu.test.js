const chromedriver = require('chromedriver');
const { expect } = require('chai');
const { By, WebDriver, WebElement } = require('selenium-webdriver');
const { Browser } = require('selenium-webdriver');
const {
  initializeDriver, loginSuccess, openMenu,
  loginAttempt, closeMenu, getAllMenuItemClicks,
  getPageArrivalVerifications, users, password
} = require('./utils');
const {
  standardUser
} = users;

/*
* MENU FUNCTIONALITY TESTS
*/
describe('basic menu functionality', async () => {
  /** @type {WebDriver} */let driver = null;
  /** @type {WebElement} */let menu = null;
  before(async () => {
    // Initialize and login
    driver = await initializeDriver(Browser.CHROME);
    await loginAttempt(standardUser, password, driver);
    await loginSuccess(driver);
    menu = await driver.findElement(By.className('bm-menu-wrap'));
  })
  it('is hidden before the menu button is clicked', async () => {
    
    const ariaHidden = await menu.getAttribute('aria-hidden');
    expect(ariaHidden).equals('true');
  })
  it('is not hidden after the menu button is clicked', async () => {
    await openMenu(driver);
    const notAriaHidden = await menu.getAttribute('aria-hidden');
    const notHidden = await menu.getAttribute('hidden');
    expect(notAriaHidden).equals('false');
    expect(notHidden).equals(null);
  })
  it('hides again after the close button is clicked', async () => {
    await closeMenu(driver);
    const ariaHidden = await menu.getAttribute('aria-hidden');
    expect(ariaHidden).equals('true');
  })
  it('navigates to the shopping cart', async () => {
    const { clickShoppingCartLink } = await getAllMenuItemClicks(driver);
    await clickShoppingCartLink();
    const { verifyAtShoppingCart } = getPageArrivalVerifications(driver);
    await verifyAtShoppingCart();
  })
  it('navigates to the product page', async () => {
    const { clickInventoryLink } = await getAllMenuItemClicks(driver);
    await openMenu(driver);
    await clickInventoryLink();
    const { verifyAtProductPage } = getPageArrivalVerifications(driver);
    await verifyAtProductPage();
  })
  after(async () => {
    await driver.quit();
  })
})
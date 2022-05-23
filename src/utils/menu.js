const { WebDriver, By, until, WebElement } = require("selenium-webdriver");

/**
 * Opens the menu
 * @param {WebDriver} driver 
 */
 const openMenu = async (driver) => {
  const openMenuBtn = await driver.findElement(By.id('react-burger-menu-btn'));
  const closeMenuBtn = await driver.findElement(By.id('react-burger-cross-btn'));
  await openMenuBtn.click();
  await driver.wait(until.elementIsVisible(closeMenuBtn), 500);
  
}
/**
 * Closes the menu, waiting for the element to be visible to prevent errors.
 * @param {WebDriver} driver 
 */
const closeMenu = async (driver) => {
  const closeMenuBtn = await driver.findElement(By.id('react-burger-cross-btn'));
  await driver.wait(until.elementIsVisible(closeMenuBtn), 500);
  await closeMenuBtn.click();
}
/**
 * Gets all menu items.
 * @param {WebDriver} driver 
 */
 const getAllMenuItemClicks = async (driver) => {
  const menuLinkIds = [
    'inventory_sidebar_link',
    'about_sidebar_link',
    'logout_sidebar_link',
    'reset_sidebar_link',
  ];
  const menuLinks = await Promise.all(menuLinkIds.map(async (menuLinkId) => await driver.findElement(By.id(menuLinkId))));
  const cartLink = await driver.findElement(By.className('shopping_cart_link'));
  menuLinks.push(cartLink);
  /**
   * Wraps the button or link in a function that ensures it's clickable,
   * if it's not it will wait for it to be clickable. 
   * @param {WebElement} link
   */
  const ensureClickableFactory = (link) => {
    return async () => {
      await driver.wait(until.elementIsEnabled(link), 1000);
      await link.click();
    }
  }
  const [
    clickInventoryLink, clickAboutLink, clickLogoutLink, clickResetLink, clickShoppingCartLink
  ] = menuLinks.map((menuLink) => ensureClickableFactory(menuLink));
  return {
    clickInventoryLink, clickAboutLink, clickLogoutLink, clickResetLink, clickShoppingCartLink,
  }
}

module.exports = {
  openMenu,
  closeMenu,
  getAllMenuItemClicks,
}
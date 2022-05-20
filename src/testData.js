const password = 'secret_sauce';
const users = {
  ProblemUser: 'problem_user',
  standardUser: 'standard_user',
  lockedUser: 'locked_out_user',
  PerformanceGlitchUser: 'performance_glitch_user',
}
const buttonIdBases = [
  'sauce-labs-backpack',
  'sauce-labs-bike-light',
  'sauce-labs-bolt-t-shirt',
  'sauce-labs-fleece-jacket',
  'sauce-labs-onesie',
  'test.allthethings()-t-shirt-(red)',
];
// If these change, change the regex below.
const addToCartPrefix = 'add-to-cart-';
const removeFromCartPrefix = 'remove-';
/**
 * Given a button id determines if it is an add or remove product button
 * and returns the base of the button id, can add or can remove as
 * a boolean and the original button id.
 * @param {string} btnCssId the css id of the button
 * @returns button properties
 */
const parseProductBtnId = (btnCssId) => {
  const [
    , addPrefix, removePrefix, baseCssId,
  ] = /^(?:(add-to-cart-)|(remove-))(\S+)/.exec(btnCssId);
  const canAdd = addPrefix === addToCartPrefix;
  const canRemove = removePrefix === removeFromCartPrefix;
  return {
    canAdd,
    canRemove,
    btnCssId,
    baseCssId,
  }
}
const sauceLabsOnsieBaseCssId = 'sauce-labs-onesie';
const sauceLabsBackpackBaseCssId = 'sauce-labs-backpack';
const sauceLabsBikeLightBaseCssId = 'sauce-labs-bike-light';
const sauceLabsBoltTShirtBaseCssId = 'sauce-labs-bolt-t-shirt';
const sauceLabsFleeceJacketBaseCssId = 'sauce-labs-fleece-jacket';
const testAllTheThingsTShirtRed = 'test.allthethings()-t-shirt-(red)'; 
const baseTestProductData = {
  addToCartPrefix,
  removeFromCartPrefix,
  products: {
    [sauceLabsBackpackBaseCssId]: {
      price: 29.99,
      title: 'Sauce Labs Backpack',
      baseCssId: sauceLabsBackpackBaseCssId,
      addBtnId: `${addToCartPrefix}${sauceLabsBackpackBaseCssId}`,
      removeBtnId: `${removeFromCartPrefix}${sauceLabsBackpackBaseCssId}`,
    },
    [sauceLabsBikeLightBaseCssId]: {
      price: 9.99,
      title: 'Sauce Labs Bike Light',
      baseCssId: sauceLabsBikeLightBaseCssId,
      addBtnId: `${addToCartPrefix}${sauceLabsBikeLightBaseCssId}`,
      removeBtnId: `${removeFromCartPrefix}${sauceLabsBikeLightBaseCssId}`,
    },
    [sauceLabsBoltTShirtBaseCssId]: {
      price: 15.99,
      title: 'Sauce Bolt T-Shirt',
      baseCssId: sauceLabsBoltTShirtBaseCssId,
      addBtnId: `${addToCartPrefix}${sauceLabsBoltTShirtBaseCssId}`,
      removeBtnId: `${removeFromCartPrefix}${sauceLabsBoltTShirtBaseCssId}`,
    },
    [sauceLabsFleeceJacketBaseCssId]: {
      price: 49.99,
      title: 'Sauce Labs Fleece Jacket',
      baseCssId: sauceLabsFleeceJacketBaseCssId,
      addBtnId: `${addToCartPrefix}${sauceLabsFleeceJacketBaseCssId}`,
      removeBtnId: `${removeFromCartPrefix}${sauceLabsFleeceJacketBaseCssId}`,
    },
    [sauceLabsOnsieBaseCssId]: {
      price: 7.99,
      title: 'Sauce Labs Onesie',
      baseCssId: sauceLabsOnsieBaseCssId,
      addBtnId: `${addToCartPrefix}${sauceLabsOnsieBaseCssId}`,
      removeBtnId: `${removeFromCartPrefix}${sauceLabsOnsieBaseCssId}`,
    },
    [testAllTheThingsTShirtRed]: {
      price: 15.99,
      title: 'Test.allTheThings() T-Shirt (Red)',
      baseCssId: testAllTheThingsTShirtRed,
      addBtnId: `${addToCartPrefix}${testAllTheThingsTShirtRed}`,
      removeBtnId: `${removeFromCartPrefix}${testAllTheThingsTShirtRed}`,
    },
  },
}
const baseProductIdArray = Object
  .values(baseTestProductData.products).map(({baseCssId}) => baseCssId);
const addProductToCartBtnIds = Object
  .values(baseTestProductData.products).map(({addBtnId}) => addBtnId);
const removeProductFromCartBtnIds = Object
  .values(baseTestProductData.products).map(({removeBtnId}) => removeBtnId);
const productArray = Object
.values(baseTestProductData.products).map(product => product);

const testProductData = {
  ...baseTestProductData,
  productArray,
  baseIdArray: baseProductIdArray,
  addIdArray: addProductToCartBtnIds,
  removeIdArray: removeProductFromCartBtnIds,
}

module.exports = {
  users,
  password,
  testProductData,
  parseProductBtnId,
}
/**
 * Evaluates on the browser context (puppeteer) by filling and checking fields
 * @param {Puppeteer.Page} page Puppeteer page where the selectors will be evaluated.
 * @param {*} fieldSelectors An object with CSS selectors.
 * @param {*} fieldValues An object with the corresponding key and value for each field to be evaluated.
 */
const fillFields = async (page, fieldSelectors, fieldValues) => {
  /* Note that this will only evaluate for keys which have corresponding value on fieldValues => fieldSelectors. */
  for (const key of Object.keys(fieldValues)) {
    await page.$eval(
      fieldSelectors[key],
      (element, fieldValues, key) => {
        if (element.type == "checkbox" || element.type == "radio") {
          element.checked = fieldValues[key] ? true : false;
        } else {
          element.value = fieldValues[key];
        }
      },
      fieldValues,
      key
    );
  }
};

export default fillFields;

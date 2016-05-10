// return different path properties
export let getPaths = (path: Front.Path) => {
  let k = path.slice(-1)[0]; //.last()
  let id = path.join('-');  // /^[a-zA-Z][\w:.-]*$/
  let model = path.join('?.'); //'.'  //ng2 elvis operator to prevent crashing if some element is missing
  let variable = id.replace(/-/g, '_');
  return { k, id, model, variable };
}

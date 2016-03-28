// return different path properties
let getPaths = (path) => {
  let k = path.slice(-1)[0]; //.last()
  let id = path.join('-');  // /^[a-zA-Z][\w:.-]*$/
  // let model = path.join('.');
  let elvis = path.join('?.');  //ng2 elvis operator to prevent crashing if some element is missing
  let variable = id.replace(/-/g, '_');
  return { k: k, id: id, model: elvis, variable: variable };
}

export { getPaths };

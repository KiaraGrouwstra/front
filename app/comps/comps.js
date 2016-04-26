// be careful trying to import from here, it actually often result in an error!:
// Unexpected directive value 'undefined' on the View of component <NAME>

// output
export { ScalarComp } from './slim/output/scalar/scalar';
export { ULComp     } from './slim/output/ul/ul';
export { DLComp     } from './slim/output/dl/dl';
export { ArrayComp  } from './slim/output/array/array';
export { ObjectComp } from './slim/output/object/object';
export { TableComp  } from './slim/output/table/table';
export { ValueComp  } from './slim/output/value/value';

// input
export { InputComp        } from './slim/input/input/input-input';
export { FieldComp        } from './slim/input/field/input-field';
export { InputArrayComp   } from './slim/input/array/input-array';
export { InputObjectComp  } from './slim/input/object/input-object';
export { InputStructComp  } from './slim/input/struct/input-struct';
export { InputTableComp   } from './slim/input/table/input-table';
export { InputValueComp   } from './slim/input/value/input-value';
export { FormComp         } from './slim/input/form/input-form';

// misc
export { App          } from './fat/app/app';
export { AuthUiComp   } from './fat/auth_ui/auth_ui';
export { FnUiComp     } from './fat/fn_ui/fn_ui';
export { InputUiComp  } from './fat/input_ui/input_ui';

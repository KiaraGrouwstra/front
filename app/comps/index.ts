// be careful trying to import from here, it actually often result in an error!:
// Unexpected directive value 'undefined' on the View of component <NAME>

// output
export { IframeComp } from './slim/output/iframe/iframe';
export { ULComp     } from './slim/output/ul/ul';
export { DLComp     } from './slim/output/dl/dl';
export { ArrayComp  } from './slim/output/array/array';
export { ObjectComp } from './slim/output/object/object';
export { TableComp  } from './slim/output/table/table';
export { ValueComp  } from './slim/output/value/value';

// input
export { FieldComp        } from './slim/input/field/input_field';
export { InputArrayComp   } from './slim/input/array/input_array';
export { InputObjectComp  } from './slim/input/object/input_object';
export { InputStructComp  } from './slim/input/struct/input_struct';
export { InputTableComp   } from './slim/input/table/input_table';
export { InputValueComp   } from './slim/input/value/input_value';
export { FormComp         } from './slim/input/form/input_form';

// misc
export { App          } from './fat/app/app';
export { AuthUiComp   } from './fat/auth_ui/auth_ui';
export { FnUiComp     } from './fat/fn_ui/fn_ui';
export { InputUiComp  } from './fat/input_ui/input_ui';

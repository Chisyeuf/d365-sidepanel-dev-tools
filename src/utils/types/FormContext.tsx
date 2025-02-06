
export type FormContext = Xrm.Page | null;
export type FormDocument = Document | null;

export const defaultFormContextDocument = { formContext: null, formDocument: null };
export type FormContextDocument = { formContext: FormContext, formDocument: FormDocument };
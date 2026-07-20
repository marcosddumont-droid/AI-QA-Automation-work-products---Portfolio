export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const validCustomer: CustomerInfo = {
  firstName: 'Marcos',
  lastName: 'Tester',
  postalCode: 'B1900',
};

/** Casos negativos del formulario de checkout: cada campo vacío por separado. */
export const incompleteCustomers: Array<{ data: CustomerInfo; error: string }> = [
  {
    data: { ...validCustomer, firstName: '' },
    error: 'Error: First Name is required',
  },
  {
    data: { ...validCustomer, lastName: '' },
    error: 'Error: Last Name is required',
  },
  {
    data: { ...validCustomer, postalCode: '' },
    error: 'Error: Postal Code is required',
  },
];

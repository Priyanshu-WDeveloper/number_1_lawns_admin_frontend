import type { FormFieldConfig } from '@/types/forms';

export const customerFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter customer name',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: false,
    placeholder: 'Enter email address',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'text',
    required: true,
    placeholder: 'Enter phone number',
  },
  {
    name: 'location',
    label: 'Location',
    type: 'location',
    required: false,
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    required: true,
    placeholder: 'Enter full address',
  },
  {
    name: 'postalCode',
    label: 'Postal Code',
    type: 'text',
    placeholder: 'Enter postal code',
  },
  {
    name: 'city',
    label: 'City',
    type: 'text',
    required: true,
    placeholder: 'Enter city',
  },
  {
    name: 'state',
    label: 'State',
    type: 'text',
    required: true,
    placeholder: 'Enter state',
  },
  {
    name: 'country',
    label: 'Country',
    type: 'text',
    required: true,
    placeholder: 'Enter country',
  },
];
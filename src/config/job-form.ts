import type { FormFieldConfig } from '@/types/forms';

export const jobFields: FormFieldConfig[] = [
  {
    name: 'customer',
    label: 'Select Customer',
    type: 'select',
    required: true,
    options: [
      { label: 'Customer 1', value: 'customer-1' },
      { label: 'Customer 2', value: 'customer-2' },
    ],
  },
  {
    name: 'employee',
    label: 'Select Employee',
    type: 'select',
    required: true,
    options: [
      { label: 'Employee 1', value: 'employee-1' },
      { label: 'Employee 2', value: 'employee-2' },
    ],
  },
  {
    name: 'jobAddress',
    label: 'Job Address',
    type: 'textarea',
    required: true,
    placeholder: 'Enter job address',
  },
  {
    name: 'jobLocation',
    label: 'Job Address Lat/Lng',
    type: 'location',
    required: false,
  },
  {
    name: 'jobType',
    label: 'Job Type',
    type: 'select',
    required: true,
    options: [
      { label: 'One Time', value: 'one-time' },
      { label: 'Recurring', value: 'recurring' },
    ],
  },
  {
    name: 'frequencyValue',
    label: 'Frequency Value',
    type: 'number',
    conditional: {
      field: 'jobType',
      value: 'recurring',
    },
  },
  {
    name: 'frequencyUnit',
    label: 'Frequency Unit',
    type: 'select',
    conditional: {
      field: 'jobType',
      value: 'recurring',
    },
    options: [
      { label: 'Day', value: 'day' },
      { label: 'Week', value: 'week' },
      { label: 'Month', value: 'month' },
      { label: 'Year', value: 'year' },
    ],
  },
  {
    name: 'paymentType',
    label: 'Payment Type',
    type: 'select',
    required: true,
    options: [
      { label: 'Bank Transfer', value: 'bank-transfer' },
      { label: 'Cash', value: 'cash' },
      { label: 'Drop Invoice', value: 'drop-invoice' },
    ],
  },
  {
    name: 'jobDate',
    label: 'Job Date',
    type: 'date',
    required: true,
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter job description',
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Enter any additional notes',
  },
];
'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FormFieldConfig } from '@/types/forms';
import { LocationField } from './location-field';
import { AddressPicker } from './address-picker';
import { UploadField } from './upload-field';

interface FormFieldProps {
  field: FormFieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export function FormField({
  field,
  value,
  onChange,
  error,
}: FormFieldProps) {
  const handleChange = (newValue: unknown) => {
    onChange(newValue);
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#151515]">
            {field.label}
            {field.required && (
              <span className="text-[#16610E] ml-1">*</span>
            )}
          </label>
          <Input
            type={
              field.type === 'date'
                ? 'date'
                : field.type === 'number'
                  ? 'number'
                  : 'text'
            }
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(e.target.value)
            }
            required={field.required}
            className="h-12 border-[#e5e5e5] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#16610E] focus:ring-[#16610E] transition-all placeholder:text-[#999]"
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#151515]">
            {field.label}
            {field.required && (
              <span className="text-[#16610E] ml-1">*</span>
            )}
          </label>
          <Textarea
            placeholder={field.placeholder}
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            className="min-h-[100px] p-4 border-[#e5e5e5] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#16610E] focus:ring-[#16610E] transition-all resize-none placeholder:text-[#999]"
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#151515]">
            {field.label}
            {field.required && (
              <span className="text-[#16610E] ml-1">*</span>
            )}
          </label>
          <Select
            value={(value as string) || ''}
            onValueChange={handleChange}
          >
            <SelectTrigger className="h-12 border-[#e5e5e5] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#16610E] focus:ring-[#16610E] transition-all">
              <SelectValue
                placeholder={
                  field.placeholder || `Select ${field.label}`
                }
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[#e5e5e5] shadow-lg">
              {field.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-lg focus:bg-[#edf8e7]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      );

    case 'location':
    case 'address':
      return field.type === 'address' ? (
        <AddressPicker
          label={field.label}
          value={value as string | undefined}
          onChange={handleChange as (value: string) => void}
          required={field.required}
        />
      ) : (
        <LocationField
          label={field.label}
          value={
            value as
              | { latitude?: string; longitude?: string }
              | undefined
          }
          onChange={
            handleChange as (value: {
              latitude: string;
              longitude: string;
            }) => void
          }
          required={field.required}
        />
      );

    case 'file':
      return (
        <UploadField
          label={field.label}
          value={value as File | null | undefined}
          onChange={handleChange as (file: File | null) => void}
          required={field.required}
        />
      );

    default:
      return null;
  }
}

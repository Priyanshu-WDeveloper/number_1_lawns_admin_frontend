import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import {
  ArrowLeft,
  UserPlus,
  Mail,
  FileText,
  Check,
  Upload,
  X,
  Image,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { Stepper } from '@/components/ui/stepper';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEmployeeStore } from '@/store/employeeStore';
import type { EmployeeDocument } from '@/store/employeeStore';

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  // phone: z.e164().min(1, 'Phone is required'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number'),
  address: z.string().optional(),
});

type FormData = z.infer<typeof employeeSchema>;

const steps = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Basic details',
    icon: <UserPlus className="h-4 w-4" />,
  },
  {
    id: 2,
    title: 'Contact',
    description: 'Contact information',
    icon: <Mail className="h-4 w-4" />,
  },
  {
    id: 3,
    title: 'Documents',
    description: 'Upload files',
    icon: <FileText className="h-4 w-4" />,
  },
];

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) {
    return <Image className="h-5 w-5 text-blue-500" />;
  }
  if (type === 'application/pdf') {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <FileText className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addEmployee = useEmployeeStore((state) => state.addEmployee);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    // setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const formValues = watch();

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const existingNames = documents.map((d) => d.name);
      const newFiles = Array.from(files).filter(
        (f) => !existingNames.includes(f.name),
      );
      setDocuments([...documents, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index);
    setDocuments(newDocs);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(['name']);
      if (isValid) setCurrentStep(2);
    } else if (currentStep === 2) {
      const isValid = await trigger(['email', 'phone']);
      if (isValid) setCurrentStep(3);
      // If invalid, stays on step 2 with errors shown
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    const employeeDocs: EmployeeDocument[] = documents.map(
      (file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      }),
    );

    const employeeId = `EMP-${Date.now().toString().slice(-6)}`;

    addEmployee({
      id: employeeId,
      employeeId: employeeId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      status: 'Active',
      documents: employeeDocs,
    });

    navigate('/employees');
  };

  // const handlePhoneChange = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const value = e.target.value.replace(/[^\d\s\-\+\(\)]/g, '');
  //   setValue('phone', value, { shouldValidate: true });
  // };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-[#777] mb-4 uppercase tracking-wide">
                Personal Details
              </h4>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#151515]">
                    Full Name{' '}
                    <span className="text-[#16610E]">*</span>
                  </label>
                  <Input
                    placeholder="Enter full name"
                    {...register('name')}
                    className="h-12 border-[#e5e5e5] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#16610E] focus:ring-[#16610E] transition-all"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#151515]">
                    Address
                  </label>
                  <Textarea
                    placeholder="Enter full address"
                    {...register('address')}
                    className="min-h-[80px] p-4 border-[#e5e5e5] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#16610E] focus:ring-[#16610E] transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-[#777] mb-4 uppercase tracking-wide">
                Contact Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#151515]">
                    Email Address{' '}
                    <span className="text-[#16610E]">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...register('email')}
                    className="h-12 border-[#e5e5e5] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#16610E] focus:ring-[#16610E] transition-all"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#151515]">
                    Phone Number{' '}
                    <span className="text-[#16610E]">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    {...register('phone')}
                    // onChange={handlePhoneChange}`
                    className="h-12 border-[#e5e5e5] rounded-xl bg-[#fafaf8] focus:bg-white focus:border-[#16610E] focus:ring-[#16610E] transition-all"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-[#777] mb-4 uppercase tracking-wide">
                Upload Documents
              </h4>

              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-[#16610E] bg-[#edf8e7]'
                    : 'border-[#e5e5e5] hover:border-[#16610E]'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={(e) => handleFileChange(e.target.files)}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                <div className="h-16 w-16 rounded-full bg-[#edf8e7] flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-[#16610E]" />
                </div>
                <p className="text-[#151515] font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-[#777]">
                  PDF, PNG, JPG, DOC up to 10MB
                </p>
              </div>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-[#151515]">
                    Uploaded Files ({documents.length})
                  </p>
                  {documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#fafaf8] rounded-lg border border-[#e5e5e5]"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-[#151515]">
                            {file.name}
                          </p>
                          <p className="text-xs text-[#777]">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-[#777] hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 p-6 bg-[#fafaf8] rounded-xl border border-dashed border-[#e5e5e5]">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-[#edf8e7] flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-[#16610E]" />
                  </div>
                  <h5 className="text-lg font-semibold text-[#151515] mb-2">
                    Review & Submit
                  </h5>
                  <div className="text-left bg-white rounded-lg p-4 text-sm space-y-2 mt-4">
                    <p>
                      <span className="text-[#777]">Name:</span>{' '}
                      <span className="font-medium">
                        {formValues.name || '-'}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#777]">Email:</span>{' '}
                      <span className="font-medium">
                        {formValues.email || '-'}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#777]">Phone:</span>{' '}
                      <span className="font-medium">
                        {formValues.phone || '-'}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#777]">Address:</span>{' '}
                      <span className="font-medium">
                        {formValues.address || '-'}
                      </span>
                    </p>
                    <p>
                      <span className="text-[#777]">Documents:</span>{' '}
                      <span className="font-medium">
                        {documents.length} file(s)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <main className="flex-1 w-full overflow-y-auto px-4 pt-5 pb-5">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/employees')}
            className="mb-6 text-[#777] hover:text-[#16610E] hover:bg-[#edf8e7] gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#151515]">
              Create New Employee
            </h1>
            <p className="text-[#777] mt-1">
              Add employee details and upload required documents
            </p>
          </div>

          <div className="mb-8 p-6 bg-white rounded-2xl border border-[#ececec] shadow-sm">
            <Stepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#ececec] shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-[#ececec] bg-[#fafaf8]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#edf8e7] flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-[#16610E]" />
                </div>
                <div>
                  <p className="text-sm text-[#777]">
                    Step {currentStep} of {steps.length}
                  </p>
                  <h3 className="text-xl font-semibold text-[#151515]">
                    {currentStep === 1 && 'Personal Information'}
                    {currentStep === 2 && 'Contact Details'}
                    {currentStep === 3 && 'Documents & Review'}
                  </h3>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-8">{renderStepContent()}</div>

              <div className="px-8 py-6 border-t border-[#ececec] bg-[#fafaf8] flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="h-12 px-6 rounded-xl border-[#e5e5e5] text-[#777] hover:text-[#16610E] hover:border-[#16610E] hover:bg-[#edf8e7] transition-all disabled:opacity-50"
                >
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-12 px-8 rounded-xl bg-[#16610E] hover:bg-[#1a7a12] text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="h-12 px-8 rounded-xl bg-[#16610E] hover:bg-[#1a7a12] text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Create Employee
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

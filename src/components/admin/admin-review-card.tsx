import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Map,
  Hash,
  Globe,
  FileText,
} from 'lucide-react';

import { DocumentRow } from './document-row';
import { DocumentPreviewModal } from './document-preview-modal';
import { ReviewField } from './review-field';
import type { NamedDoc } from './named-document-upload';

interface AdminReviewCardProps {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  profileImage?: string;
  companyName?: string;
  gstNumber?: string;
  bankAccountNumber?: string;
  invoiceLogo?: string;
  documents?: NamedDoc[];
}

export function AdminReviewCard({
  firstName,
  lastName,
  email,
  countryCode,
  phoneNumber,
  address,
  city,
  state,
  postalCode,
  country,
  latitude,
  longitude,
  profileImage,
  companyName,
  gstNumber,
  bankAccountNumber,
  invoiceLogo,
  documents = [],
}: AdminReviewCardProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handlePreview = (doc: NamedDoc) => {
    if (doc.file) setPreviewFile(doc.file);
  };

  const hasDocuments = documents.some((d) => d.file);
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="space-y-5">
      {/* Employee Information Card */}
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3.5">
            <div className="w-[42px] h-[42px] rounded-xl bg-[#2d6a4f] flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">
                Employee Information
              </div>
              <div className="text-xs text-[#6b7280] mt-0.5">
                {email} &middot; {countryCode} {phoneNumber}
              </div>
            </div>
          </div>
          {profileImage && (
            <img
              src={profileImage}
              alt={fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ReviewField
              icon={<User className="h-3 w-3" />}
              label="First Name"
              value={firstName}
            />
            <ReviewField
              icon={<User className="h-3 w-3" />}
              label="Last Name"
              value={lastName}
            />
            <ReviewField
              icon={<Mail className="h-3 w-3" />}
              label="Email"
              value={email}
            />
            <ReviewField
              icon={<Phone className="h-3 w-3" />}
              label="Phone Number"
              value={`${countryCode} ${phoneNumber}`}
            />
            <ReviewField
              icon={<MapPin className="h-3 w-3" />}
              label="Address"
              value={address}
            />
            <ReviewField
              icon={<Building2 className="h-3 w-3" />}
              label="City"
              value={city}
            />
            <ReviewField
              icon={<Map className="h-3 w-3" />}
              label="State"
              value={state}
            />
            <ReviewField
              icon={<Hash className="h-3 w-3" />}
              label="Postal Code"
              value={postalCode}
            />
            <ReviewField
              icon={<Globe className="h-3 w-3" />}
              label="Country"
              value={country}
            />
            {latitude !== undefined && longitude !== undefined ? (
              <>
                <ReviewField
                  icon={<Map className="h-3 w-3" />}
                  label="Latitude"
                  value={String(latitude)}
                />
                <ReviewField
                  icon={<Map className="h-3 w-3" />}
                  label="Longitude"
                  value={String(longitude)}
                />
              </>
            ) : (
              <ReviewField
                icon={<Map className="h-3 w-3" />}
                label="Coordinates"
                value="Not provided"
              />
            )}
          </div>
        </div>
      </div>

      {/* Company Details Card */}
      {companyName && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
            <div className="flex items-center gap-3.5">
              <div className="w-[42px] h-[42px] rounded-xl bg-[#2d6a4f] flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#111827]">
                  Company Details
                </div>
              </div>
            </div>
            {invoiceLogo && (
              <img
                src={invoiceLogo}
                alt="Invoice Logo"
                className="h-10 w-10 rounded object-cover"
              />
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ReviewField
                icon={<Building2 className="h-3 w-3" />}
                label="Company Name"
                value={companyName}
              />
              <ReviewField
                icon={<Hash className="h-3 w-3" />}
                label="GST Number"
                value={gstNumber ?? '-'}
              />
              <ReviewField
                icon={<Hash className="h-3 w-3" />}
                label="Bank Account"
                value={bankAccountNumber ?? '-'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Documents Card */}
      {hasDocuments && (
        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <div className="flex items-center gap-3.5 px-6 py-4 border-b border-[#e5e7eb]">
            <div className="w-[42px] h-[42px] rounded-xl bg-[#2d6a4f] flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">
                Documents
              </div>
              <div className="text-xs text-[#6b7280] mt-0.5">
                {documents.filter((d) => d.file).length} file(s)
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {documents
              .filter((d) => d.file)
              .map((doc, index) => (
                <DocumentRow
                  key={index}
                  doc={doc}
                  onPreview={handlePreview}
                />
              ))}
          </div>
        </div>
      )}

      <DocumentPreviewModal
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

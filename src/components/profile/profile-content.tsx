import { useState, useCallback, useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  Navigation,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import type { IAdminUser } from '@/types';
import {
  useUpdateProfileMutation,
  useUploadDocumentMutation,
} from '@/API/api';
import ProfileHero from './profile-hero';
import ProfileSectionCard from './profile-section-card';
import ProfileField from './profile-field';
import { PhoneInput } from '@/components/forms/phone-input';
import toast from 'react-hot-toast';

interface ProfileContentProps {
  admin: IAdminUser;
  onBack: () => void;
}

export default function ProfileContent({
  admin,
  onBack,
}: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(
    {},
  );
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateProfileMutation();
  const [uploadDocument] = useUploadDocumentMutation();
  const profileImageFileRef = useRef<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] =
    useState<string>('');

  const fullName =
    admin.fullName || `${admin.firstName} ${admin.lastName}`;

  const handleEditClick = useCallback(() => {
    if (!isEditing) {
      setFormData({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        phoneNumber: admin.phoneNumber || '',
        countryCode: admin.countryCode || '+64',
        address: admin.address || '',
        city: admin.city || '',
        state: admin.state || '',
        postalCode: admin.postalCode || '',
        country: admin.country || '',
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, admin]);

  const handleProfileImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        profileImageFileRef.current = file;
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const handleChange = useCallback((key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      let payload = { ...formData };

      if (profileImageFileRef.current) {
        const fd = new FormData();
        fd.append('file', profileImageFileRef.current);
        const res = (await uploadDocument(fd).unwrap()) as {
          fileUrl: string;
          file: { url: string };
        };
        payload = { ...payload, profileImage: res.fileUrl };
      }

      const res = await updateProfile(payload).unwrap();

      if (res.admin) {
        const successMsg =
          (res as any)?.message ??
          'Admin profile updated successfully';
        toast.success(successMsg);
      }
      setIsEditing(false);
      setProfileImagePreview('');
      profileImageFileRef.current = null;
    } catch {
      // error handled by RTK
    }
  }, [updateProfile, formData, uploadDocument]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData({});
    setProfileImagePreview('');
    profileImageFileRef.current = null;
  }, []);

  return (
    <div className="w-full px-5 sm:px-8 py-5 sm:py-8 space-y-6">
      <ProfileHero
        profileImage={profileImagePreview || admin.profileImage}
        fullName={fullName}
        email={admin.email}
        status={admin.status}
        role={admin.role}
        balance={admin.balance ?? 0}
        onBack={onBack}
        isEditing={isEditing}
        onEditClick={handleEditClick}
        onProfileImageChange={handleProfileImageChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileSectionCard
          icon={<User className="h-4 w-4" />}
          title="Personal Information"
          delay={150}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField
              label="First Name"
              value={isEditing ? formData.firstName : admin.firstName}
              editing={isEditing}
              onChange={(v) => handleChange('firstName', v)}
            />
            <ProfileField
              label="Last Name"
              value={isEditing ? formData.lastName : admin.lastName}
              editing={isEditing}
              onChange={(v) => handleChange('lastName', v)}
            />
            <ProfileField label="Admin ID" value={admin.adminId} />
          </div>
        </ProfileSectionCard>

        <ProfileSectionCard
          icon={<Mail className="h-4 w-4" />}
          title="Contact"
          delay={250}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField
              label="Email"
              editing={isEditing}
              onChange={(v) => handleChange('email', v)}
              value={isEditing ? formData.email : admin.email}
            />
            {isEditing ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(val: string) =>
                    handleChange('phoneNumber', val)
                  }
                  countryCode={formData.countryCode}
                  onCountryCodeChange={(code: string) =>
                    handleChange('countryCode', code)
                  }
                />
              </div>
            ) : (
              <ProfileField
                label="Phone"
                value={
                  admin.countryCode
                    ? `${admin.countryCode} ${admin.phoneNumber}`
                    : admin.phoneNumber
                }
                editing={false}
              />
            )}
          </div>
        </ProfileSectionCard>

        <ProfileSectionCard
          icon={<MapPin className="h-4 w-4" />}
          title="Address"
          delay={350}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField
              label="Address"
              value={
                isEditing ? formData.address : admin.address || '-'
              }
              fullWidth
              editing={isEditing}
              onChange={(v) => handleChange('address', v)}
            />
            <ProfileField
              label="City"
              value={isEditing ? formData.city : admin.city || '-'}
              editing={isEditing}
              onChange={(v) => handleChange('city', v)}
            />
            <ProfileField
              label="State"
              value={isEditing ? formData.state : admin.state || '-'}
              editing={isEditing}
              onChange={(v) => handleChange('state', v)}
            />
            <ProfileField
              label="Postal Code"
              value={
                isEditing
                  ? formData.postalCode
                  : admin.postalCode || '-'
              }
              editing={isEditing}
              onChange={(v) => handleChange('postalCode', v)}
            />
            <ProfileField
              label="Country"
              value={
                isEditing ? formData.country : admin.country || '-'
              }
              editing={isEditing}
              onChange={(v) => handleChange('country', v)}
            />
          </div>
        </ProfileSectionCard>

        <ProfileSectionCard
          icon={<Navigation className="h-4 w-4" />}
          title="Location Coordinates"
          delay={450}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField
              label="Latitude"
              value={admin.location?.coordinates?.[1] ?? '-'}
            />
            <ProfileField
              label="Longitude"
              value={admin.location?.coordinates?.[0] ?? '-'}
            />
            {admin.location?.coordinates && (
              <div className="sm:col-span-2 bg-[#d8f3dc] rounded-lg px-3 py-2.5 text-xs text-[#1a3c2e] flex items-center gap-2">
                <Navigation className="h-3.5 w-3.5 shrink-0" />
                Coordinates: [{admin.location.coordinates[0]},{' '}
                {admin.location.coordinates[1]}] — Point location
                saved
              </div>
            )}
          </div>
        </ProfileSectionCard>
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-3 pt-2 pb-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-10 px-6 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-6 rounded-xl bg-[var(--sidebar-bg-from)] text-white text-sm font-medium hover:bg-[var(--sidebar-bg-to)] transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

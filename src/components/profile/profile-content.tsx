import { useState, useCallback } from 'react';
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
import { useUpdateProfileMutation } from '@/API/api';
import ProfileHero from './profile-hero';
import ProfileSectionCard from './profile-section-card';
import ProfileField from './profile-field';

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

  const fullName =
    admin.fullName || `${admin.firstName} ${admin.lastName}`;

  const handleEditClick = useCallback(() => {
    if (!isEditing) {
      setFormData({
        firstName: admin.firstName || '',
        lastName: admin.lastName || '',
        email: admin.email || '',
        phoneNumber: admin.phoneNumber || '',
        address: admin.address || '',
        city: admin.city || '',
        state: admin.state || '',
        postalCode: admin.postalCode || '',
        country: admin.country || '',
      });
    }
    setIsEditing(!isEditing);
  }, [isEditing, admin]);

  const handleChange = useCallback((key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateProfile(formData).unwrap();
      setIsEditing(false);
    } catch {
      // error handled by RTK
    }
  }, [updateProfile, formData]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setFormData({});
  }, []);

  return (
    <div className="w-full px-5 sm:px-8 py-5 sm:py-8 space-y-6">
      <ProfileHero
        profileImage={admin.profileImage}
        fullName={fullName}
        email={admin.email}
        status={admin.status}
        role={admin.role}
        balance={admin.balance ?? 0}
        onBack={onBack}
        isEditing={isEditing}
        onEditClick={handleEditClick}
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
            <ProfileField
              label="Phone"
              value={
                isEditing
                  ? formData.phoneNumber
                  : admin.countryCode
                    ? `${admin.countryCode} ${admin.phoneNumber}`
                    : admin.phoneNumber
              }
              editing={isEditing}
              onChange={(v) => handleChange('phoneNumber', v)}
            />
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

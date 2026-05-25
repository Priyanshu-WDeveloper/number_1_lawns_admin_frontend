import { User, Mail, MapPin, Navigation } from 'lucide-react';
import type { IAdminUser } from '@/types';
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
  const fullName =
    admin.fullName || `${admin.firstName} ${admin.lastName}`;
  const initials =
    `${admin.firstName?.charAt(0) || ''}${admin.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="w-full px-5 sm:px-8 py-5 sm:py-8 space-y-6">
      <ProfileHero
        profileImage={admin.profileImage}
        fullName={fullName}
        email={admin.email}
        initials={initials}
        status={admin.status}
        role={admin.role}
        balance={admin.balance ?? 0}
        onBack={onBack}
      />

      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ProfileStatCard
          label="Total Customers"
          value={stats.totalCustomers}
          delay={100}
        />
        <ProfileStatCard
          label="Active Customers"
          value={stats.activeCustomers}
          accentColor="#2a9d1e"
          delay={200}
        />
        <ProfileStatCard
          label="Inactive Customers"
          value={stats.inactiveCustomers}
          accentColor="#9ca3af"
          delay={300}
        />
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileSectionCard
          icon={<User className="h-4 w-4" />}
          title="Personal Information"
          delay={150}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="Full Name" value={fullName} />
            <ProfileField label="Admin ID" value={admin.adminId} />
          </div>
        </ProfileSectionCard>

        <ProfileSectionCard
          icon={<Mail className="h-4 w-4" />}
          title="Contact"
          delay={250}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="Email" value={admin.email} />
            <ProfileField
              label="Phone"
              value={
                admin.countryCode
                  ? `${admin.countryCode} ${admin.phoneNumber}`
                  : admin.phoneNumber
              }
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
              value={admin.address || '-'}
              fullWidth
            />
            <ProfileField label="City" value={admin.city || '-'} />
            <ProfileField label="State" value={admin.state || '-'} />
            <ProfileField
              label="Postal Code"
              value={admin.postalCode || '-'}
            />
            <ProfileField
              label="Country"
              value={admin.country || '-'}
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
    </div>
  );
}

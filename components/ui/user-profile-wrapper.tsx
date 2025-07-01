"use client";

import { UserProfile } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

export function UserProfileWrapper() {
  const { user } = useUser();
  
  // Get user role from metadata or organization membership
  const userRole = user?.publicMetadata?.role || 'teacher';
  const isTeacher = userRole === 'teacher';
  
  return (
    <UserProfile
      appearance={{
        elements: {
          // Hide billing tab for teachers
          ...(isTeacher && {
            'cl-profileSectionPrimaryButton__billing': { display: 'none' },
            'cl-profilePage__billing': { display: 'none' },
            'cl-profileSectionItem__billing': { display: 'none' }
          })
        }
      }}
    />
  );
} 
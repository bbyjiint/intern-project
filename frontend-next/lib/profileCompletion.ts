// lib/profileCompletion.ts

export function calculateProfileCompletion(profile: any | null): number {
  if (!profile) return 0

  const checks = [
    !!profile.profileImage,                                        // Profile Photo
    !!profile.fullName?.split(' ')[0]?.trim(),                     // First Name
    !!profile.fullName?.split(' ').slice(1).join(' ')?.trim(),     // Last Name
    !!profile.gender,                                              // Gender
    !!profile.dateOfBirth,                                         // Date of Birth
    !!profile.nationality,                                         // Nationality
    !!(profile.bio?.trim()),                                       // About You
    !!(profile.contactEmail || profile.email),                     // Email
    !!profile.phoneNumber,                                         // Phone Number
    !!(profile.preferredPositions?.length),                        // Position(s) of Interest
    !!(profile.preferredLocations?.length),                        // Preferred Location(s)
    !!profile.internshipPeriod,                                    // Internship Period
  ]

  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}
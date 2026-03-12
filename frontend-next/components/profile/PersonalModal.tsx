"use client";

import { useState, useEffect, useRef } from "react";
import { ProfileData } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

interface Province {
  id: string;
  name: string;
  thname: string | null;
}

const DEFAULT_POSITIONS = [
  "HR",
  "Accounting",
  "Marketing",
  "IT",
  "Finance",
  "Sales",
  "Operations",
  "Engineering",
];

interface PersonalModalProps {
  isOpen: boolean;
  profile: ProfileData | null;
  onClose: () => void;
  onSave: () => Promise<void> | void;
}

export default function PersonalModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: PersonalModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [provinces, setProvinces] = useState<Province[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    email: "",
    bio: "",
    photo: "",
    positionsOfInterest: [] as string[],
    preferredLocations: [] as string[],
    startDate: "",
    endDate: "",
  });

  // ---------- Sync profile ----------
  useEffect(() => {
    if (!isOpen) return;
    if (!profile) return;

    const names = (profile.fullName || "").split(" ");

    const [start, end] = profile.internshipPeriod?.includes(" - ")
      ? profile.internshipPeriod.split(" - ")
      : ["", ""];

    const dob = profile.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : "";

    setFormData({
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",
      gender: profile.gender?.trim().toLowerCase() || "",
      dateOfBirth: dob,
      nationality: profile.nationality || "",
      phoneNumber: (() => {
        const digits = (profile.phoneNumber || "")
          .replace(/\D/g, "")
          .slice(0, 10);
        if (digits.length > 6)
          return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
        if (digits.length > 3)
          return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return digits;
      })(),
      email: profile.contactEmail || "",
      bio: profile.professionalSummary || profile.bio || "",
      photo: profile.profileImage || "",
      positionsOfInterest: profile.preferredPositions ?? [],
      preferredLocations: profile.preferredLocations || [],
      startDate: start || "",
      endDate: end || "",
    });

    setImagePreview(
      profile.profileImage
        ? profile.profileImage.startsWith("http")
          ? profile.profileImage
          : `http://localhost:5001${profile.profileImage}`
        : "https://placehold.co/150x150",
    );
  }, [profile, isOpen]);

  // ---------- Load provinces ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ provinces: Province[] }>(
          "/api/addresses/provinces",
        );
        if (!cancelled) setProvinces(res.provinces || []);
      } catch {
        if (!cancelled) setProvinces([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- Image upload ----------
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch<{ url: string }>(
        "/api/candidates/profile/image",
        {
          method: "POST",
          body: formData,
        },
      );
      setFormData((prev) => ({ ...prev, photo: res.url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image");
    }
  };
  // ---------- Save ----------
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        ...profile,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        professionalSummary: formData.bio,
        bio: formData.bio,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        contactEmail: formData.email,
        profileImage: formData.photo,
        positionsOfInterest: formData.positionsOfInterest,
        preferredPositions: formData.positionsOfInterest,
        preferredLocations: formData.preferredLocations,
        internshipPeriod:
          formData.startDate && formData.endDate
            ? `${formData.startDate} - ${formData.endDate}`
            : formData.startDate || "",
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      const response = await apiFetch("/api/candidates/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response) {
        await onSave();
        onClose();
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Profile Information
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-5">
          {/* Name + Photo Row */}
          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender<span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {["Male", "Female"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === g.toLowerCase()}
                        onChange={() =>
                          setFormData((prev) => ({
                            ...prev,
                            gender: g.toLowerCase(),
                          }))
                        }
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div
              className="relative cursor-pointer shrink-0 mt-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={imagePreview}
                alt="Profile"
                className="w-40 h-40 rounded-xl object-cover border border-gray-200"
              />
              <div className="absolute bottom-1.5 right-1.5 bg-white border border-gray-200 p-1.5 rounded-full shadow-sm">
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Date of Birth + Nationality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date of birth<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nationality<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.nationality}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Thai">Thai</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* About You */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              About You
            </label>
            <p className="text-xs text-gray-400 mb-1.5">
              Add a short description highlighting your background, skills, or
              interests.
            </p>
            <textarea
              rows={5}
              value={formData.bio || ""}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone Number<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                let formatted = digits;
                if (digits.length > 6) {
                  formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
                } else if (digits.length > 3) {
                  formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                }
                setFormData({ ...formData, phoneNumber: formatted });
              }}
              placeholder="0XX-XXX-XXXX"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Career Preference Section */}
          <div className="pt-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Career Preference
            </h3>

            {/* Positions of Interest */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Position(s) of Interest<span className="text-red-500">*</span>
              </label>
              <MultiSelectDropdown
                options={DEFAULT_POSITIONS.map((p) => ({ value: p, label: p }))}
                value={formData.positionsOfInterest}
                onChange={(selected) =>
                  setFormData({ ...formData, positionsOfInterest: selected })
                }
                placeholder="Select one or more positions (e.g., HR, Accounting)"
                helperText="Select one or more positions (e.g., HR, Accounting)"
              />
            </div>

            {/* Preferred Locations */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Preferred Location(s)<span className="text-red-500">*</span>{" "}
                <span className="text-gray-400 font-normal text-xs">
                  (Select up to 3 provinces)
                </span>
              </label>
              <MultiSelectDropdown
                options={provinces.map((p) => ({
                  value: p.id,
                  label: p.thname ? `${p.name} (${p.thname})` : p.name,
                }))}
                value={formData.preferredLocations}
                onChange={(selected) => {
                  if (selected.length <= 3) {
                    setFormData({ ...formData, preferredLocations: selected });
                  }
                }}
                placeholder="Add preferred province"
                maxSelections={3}
              />
            </div>

            {/* Internship Period */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Internship Period<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center min-w-[80px]"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

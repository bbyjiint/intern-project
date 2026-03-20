"use client";

import { useState, useEffect, useRef } from "react";
import { ProfileData } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { POSITION_OPTIONS } from "@/constants/positionOptions";

interface Province {
  id: string;
  name: string;
  thname: string | null;
}

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
    firstName: "", lastName: "", gender: "", dateOfBirth: "",
    nationality: "", phoneNumber: "", email: "", bio: "",
    photo: "", positionsOfInterest: [] as string[],
    preferredLocations: [] as string[], startDate: "", endDate: "",
  });

  useEffect(() => {
    if (!isOpen || !profile) return;
    const names = (profile.fullName || "").split(" ");
    let start = ""; let end = "";
    if (profile.internshipPeriod?.includes(" - ")) {
      [start, end] = profile.internshipPeriod.split(" - ");
    } else if (profile.internshipDetails?.availableStartDate && profile.internshipDetails?.availableEndDate) {
      start = profile.internshipDetails.availableStartDate.split("T")[0];
      end = profile.internshipDetails.availableEndDate.split("T")[0];
    }
    const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : "";

    setFormData({
      firstName: names[0] || "",
      lastName: names.slice(1).join(" ") || "",
      gender: profile.gender?.trim().toLowerCase() || "",
      dateOfBirth: dob,
      nationality: (profile.nationality || "Thai"),
      phoneNumber: profile.phoneNumber || "",
      email: profile.contactEmail || "",
      bio: profile.professionalSummary || profile.bio || "",
      photo: profile.profileImage || "",
      positionsOfInterest: profile.preferredPositions ?? [],
      preferredLocations: profile.preferredLocations || [],
      startDate: start,
      endDate: end,
    });

    setImagePreview(
      profile.profileImage
        ? profile.profileImage.startsWith("http") ? profile.profileImage : `http://localhost:5001${profile.profileImage}`
        : "https://placehold.co/150x150"
    );
  }, [profile, isOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<{ provinces: Province[] }>("/api/addresses/provinces");
        if (!cancelled) setProvinces(res.provinces || []);
      } catch { if (!cancelled) setProvinces([]); }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiFetch<{ url: string }>("/api/candidates/profile/image", { method: "POST", body: fd });
      setFormData((prev) => ({ ...prev, photo: res.url }));
    } catch (err) { alert("Failed to upload image"); }
  };

  const handleSave = async () => {
  if (isSaving) return;
  setIsSaving(true);
  try {
    const payload = {
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      bio: formData.bio,
      aboutYou: formData.bio,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      contactEmail: formData.email,
      profileImage: formData.photo,
      positionsOfInterest: formData.positionsOfInterest,
      preferredLocations: formData.preferredLocations,
      internshipPeriod: formData.startDate && formData.endDate
        ? `${formData.startDate} - ${formData.endDate}`
        : undefined,
    };
    await apiFetch("/api/candidates/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await onSave();
    onClose();
  } catch (error) { alert("Failed to save changes"); } finally { setIsSaving(false); }
};

  if (!isOpen) return null;

  const labelClass = "block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1.5";
  const inputClass = "w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
            Profile Information
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-6">
          
          {/* Name + Photo Row */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="flex-1 w-full space-y-5">
              <div>
                <label className={labelClass}>First Name<span className="text-red-500">*</span></label>
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name<span className="text-red-500">*</span></label>
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender<span className="text-red-500">*</span></label>
                <div className="flex gap-6 mt-2">
                  {["Male", "Female"].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="gender"
                        checked={formData.gender === g.toLowerCase()}
                        onChange={() => setFormData((prev) => ({ ...prev, gender: g.toLowerCase() }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-900 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
              <img src={imagePreview} alt="Profile" className="w-40 h-40 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/40 text-white text-xs px-2 py-1 rounded-lg">Change Photo</div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          {/* DOB + Nationality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date of birth<span className="text-red-500">*</span></label>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nationality<span className="text-red-500">*</span></label>
              <select value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} className={inputClass}>
                <option value="Thai">Thai</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* About You */}
          <div>
            <label className={labelClass}>About You</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Highlight your background, skills, or interests.</p>
            <textarea rows={4} value={formData.bio || ""} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className={inputClass} placeholder="Tell us about yourself..." />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email<span className="text-red-500">*</span></label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number<span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  let f = digits;
                  if (digits.length > 6) f = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
                  else if (digits.length > 3) f = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                  setFormData({ ...formData, phoneNumber: f });
                }}
                placeholder="0XX-XXX-XXXX"
                className={inputClass}
              />
            </div>
          </div>

          {/* Career Preference */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Career Preference</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Position(s) of Interest<span className="text-red-500">*</span></label>
                <MultiSelectDropdown
                  options={POSITION_OPTIONS.map((p) => ({ value: p, label: p }))}
                  value={formData.positionsOfInterest ?? []}
                  onChange={(s) => setFormData({ ...formData, positionsOfInterest: s })}
                  placeholder="Select positions"
                />
              </div>
              <div>
                <label className={labelClass}>Preferred Location(s)<span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-2">(Max 3)</span></label>
                <MultiSelectDropdown
                  options={provinces.map(p => ({ value: p.name, label: p.thname ? `${p.name} (${p.thname})` : p.name }))}
                  value={formData.preferredLocations ?? []}
                  onChange={(s) => s.length <= 3 && setFormData({ ...formData, preferredLocations: s })}
                  placeholder="Add preferred province"
                />
              </div>
              <div>
                <label className={labelClass}>Internship Period<span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3">
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className={inputClass} />
                  <span className="text-gray-400">to</span>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <button onClick={onClose} disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:bg-blue-400"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
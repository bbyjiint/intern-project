"use client";

import { useRouter } from "next/navigation";

export type PageBackButtonProps = {
  label?: string;
  className?: string;
  /** If set, navigates here instead of history back (e.g. one-off flows like a success screen). */
  fallbackHref?: string;
};

export default function PageBackButton({
  label = "Back",
  className = "",
  fallbackHref,
}: PageBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        fallbackHref ? router.push(fallbackHref) : router.back()
      }
      className={`group -ml-1 mb-2 flex min-h-[44px] w-fit items-center gap-1 rounded-lg px-1.5 py-1 text-left text-sm font-bold text-gray-600 transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:text-slate-400 dark:hover:text-white sm:mb-3 sm:text-[15px] ${className}`}
    >
      <span
        className="text-lg leading-none transition-transform group-hover:-translate-x-0.5"
        aria-hidden
      >
        ←
      </span>
      {label}
    </button>
  );
}

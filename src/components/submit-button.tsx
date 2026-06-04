"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-300 ${className ?? ""}`}
    >
      {pending ? "保存中..." : children}
    </button>
  );
}

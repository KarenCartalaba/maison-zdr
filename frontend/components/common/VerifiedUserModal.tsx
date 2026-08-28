"use client";

import { CheckCircle, X } from "lucide-react";

interface VerifiedUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifiedUserModal({ isOpen, onClose }: VerifiedUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-[#1a5c2a]" />
          <h2 className="text-xl font-bold text-[#1a5c2a]">Verified User</h2>
          <p className="text-muted-foreground">
            Congratulations, your account is verified!
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle, X } from "lucide-react";

interface UnverifiedUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnverifiedUserModal({ isOpen, onClose }: UnverifiedUserModalProps) {
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
          <AlertTriangle className="h-12 w-12 text-[#1a5c2a]" />
          <h2 className="text-xl font-bold text-[#1a5c2a]">Unverified User</h2>
          <p className="text-muted-foreground">
            Verify your account to register events.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { SignupChoiceModal } from "./signup-choice-modal";

export function GetStartedButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[4px] bg-[#000000] px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0000000a] transition-colors hover:bg-[#111111]"
      >
        Get Started
      </button>
      {open && <SignupChoiceModal onClose={() => setOpen(false)} />}
    </>
  );
}

type ProofLinkHelpProps = {
  audience?: "cub" | "parent";
  variant?: "focus" | "video" | "slideshow";
};

const CUB_STEPS: Record<NonNullable<ProofLinkHelpProps["variant"]>, string[]> = {
  focus: [
    "Save your photo, document, or video on this device.",
    "Open Google Drive, iCloud, or a folder your parent set up.",
    "Upload the file (or add it to a shared folder).",
    "Tap Share → Copy link.",
    "Paste the link in the box below.",
  ],
  video: [
    "Record or save your video on this device.",
    "Upload it to Google Drive, iCloud, or another app your parent uses.",
    "Tap Share → Copy link.",
    "Paste the link in the box below.",
  ],
  slideshow: [
    "Save your slideshow (PowerPoint, Google Slides, etc.).",
    "Upload it to Drive, iCloud, or a folder your parent uses.",
    "Tap Share → Copy link.",
    "Paste the link in the box below.",
  ],
};

export function ProofLinkHelp({
  audience = "cub",
  variant = "focus",
}: ProofLinkHelpProps) {
  if (audience === "parent") {
    return (
      <p className="mt-2 text-xs text-zinc-500">
        The Cub uploads to a parent-approved cloud app, copies the share link, and
        pastes it here. Show the work, not the child.
      </p>
    );
  }

  const steps = CUB_STEPS[variant];

  return (
    <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
      <p className="text-xs font-medium text-zinc-300">How to add your proof</p>
      <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs leading-relaxed text-zinc-500">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-zinc-600">
        Ask your parent if you are not sure which app to use.
      </p>
    </div>
  );
}

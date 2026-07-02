/** In-app path for beta feedback instructions. */
export const BETA_FEEDBACK_PATH = "/feedback";

/** Parent-facing label for nav links and buttons. */
export const BETA_FEEDBACK_LABEL = "Report a glitch";

/** Settings and dashboard button labels. */
export const BETA_FEEDBACK_GIVE_LABEL = "Give Beta Feedback";
export const BETA_FEEDBACK_SUBMIT_LABEL = "Submit Feedback";
export const BETA_FEEDBACK_REPORT_GLITCH_LABEL = "Report a Glitch";
export const BETA_TESTING_SECTION_TITLE = "Beta Testing";
export const HELP_IMPROVE_BETA_TITLE = "Help Improve The CUB Code";

/**
 * Google Form URL for beta bug reports. Replace via env when your form is ready:
 * NEXT_PUBLIC_BETA_FEEDBACK_FORM_URL=https://docs.google.com/forms/d/e/.../viewform
 */
export const BETA_FEEDBACK_FORM_URL =
  process.env.NEXT_PUBLIC_BETA_FEEDBACK_FORM_URL?.trim() ||
  "https://forms.gle/placeholder-replace-with-your-form";

export const BETA_FEEDBACK_PRIVACY_NOTE =
  "Please do not include real child names, photos, school names, addresses, medical information, therapy details, or sensitive family information.";

export const BETA_FEEDBACK_DEVICE_TIPS = [
  "What you were trying to do, and what happened instead",
  "Your device (for example: iPhone 15, Samsung tablet, MacBook)",
  "Your browser or app (for example: Safari, Chrome, in-app browser)",
  "The page or feature where the glitch happened",
  "A screenshot only if it shows no real child or family details",
] as const;

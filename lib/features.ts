// Feature flags for content that is built but not yet live on the website.

// Coconut Villa is finished but hidden until it is ready to take bookings.
// To go live: set this to true AND set the villa's `isActive` column to true
// in the database (the booking form and booking API both read `isActive`).
export const SHOW_COCONUT_VILLA = false;

// Villas that are hidden from the public site but must stay visible in the
// admin dashboard so dates and calendar feeds can be set up ahead of launch.
export const HIDDEN_VILLA_SLUGS: string[] = SHOW_COCONUT_VILLA
  ? []
  : ["coconut-villa"];

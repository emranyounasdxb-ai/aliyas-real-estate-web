/** Format a recorded project price without implying that it is a current offer. */
export const formatPrice = (price: number) =>
  `AED ${price >= 1000000 ? `${(price / 1000000).toFixed(2).replace(/0$/, '')}M` : `${Math.round(price / 1000)}K`}`;

export const catalogueNotice =
  'Project information and visuals carry page-specific qualifications. Confirm current availability, prices, payment terms, completion forecasts and final specifications with Aliyas.';

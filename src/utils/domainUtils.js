export const calculateDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate || expiryDate === 'N/A') return 'N/A';

  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  return diffDays;
};

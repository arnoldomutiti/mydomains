export const getRegistrarLogoUrl = (name) => {
  if (!name || name === "Unknown") return null;

  // Clean name: remove Inc, LLC, Ltd, etc.
  const cleanName = name
    .replace(/,? (Inc|LLC|Ltd|Corp|GmbH|B\.V\.|S\.A\.|S\.R\.L\.|Pvt|Public Limited Company)\.?$/i, '')
    .replace(/[.,]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  return `https://img.logo.dev/${cleanName}.com?token=pk_X-bjM4U5QeeTFlMqueWvHQ`;
};

export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const getPasswordStrength = (password) => {
  if (!password) return 0;

  let strength = 0;
  if (password.length > 5) strength++;
  if (password.length > 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return strength;
};

export const getPasswordStrengthLabel = (strength) => {
  if (strength <= 2) return { text: 'Weak', class: 'strength-weak' };
  if (strength <= 4) return { text: 'Medium', class: 'strength-medium' };
  return { text: 'Strong', class: 'strength-strong' };
};

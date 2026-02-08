export default function getRegistrarLogoUrl(name) {
  if (!name || name === 'Unknown') return null;
  const cleanName = name
    .replace(/,? (Inc|LLC|Ltd|Corp|GmbH|B\.V\.|S\.A\.|S\.R\.L\.|Pvt|Public Limited Company)\.?$/i, '')
    .replace(/[.,]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  return `https://img.logo.dev/${cleanName}.com?token=pk_X-bjM4U5QeeTFlMqueWvHQ`;
}

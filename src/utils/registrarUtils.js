export const getRegistrarWebsite = (registrarName) => {
  if (!registrarName) return '#';

  const name = registrarName.toLowerCase().trim();

  const registrarMap = {
    'godaddy': 'https://www.godaddy.com',
    'namecheap': 'https://www.namecheap.com',
    'name.com': 'https://www.name.com',
    'google domains': 'https://domains.google',
    'squarespace': 'https://domains.squarespace.com',
    'cloudflare': 'https://www.cloudflare.com',
    'hover': 'https://www.hover.com',
    'enom': 'https://www.enom.com',
    'networksolutions': 'https://www.networksolutions.com',
    'network solutions': 'https://www.networksolutions.com',
    'tucows': 'https://www.tucows.com',
    'ionos': 'https://www.ionos.com',
    '1&1': 'https://www.ionos.com',
    'bluehost': 'https://www.bluehost.com',
    'hostgator': 'https://www.hostgator.com',
    'domain.com': 'https://www.domain.com',
    'dynadot': 'https://www.dynadot.com',
    'porkbun': 'https://porkbun.com',
    'gandi': 'https://www.gandi.net',
    'ovh': 'https://www.ovh.com',
    'register.com': 'https://www.register.com',
    'moniker': 'https://www.moniker.com',
    'namesilo': 'https://www.namesilo.com',
    'epik': 'https://www.epik.com',
    'spaceship': 'https://www.spaceship.com',
    'crazy domains': 'https://www.crazydomains.com',
    'crazydomains': 'https://www.crazydomains.com'
  };

  for (const [key, url] of Object.entries(registrarMap)) {
    if (name.includes(key)) {
      return url;
    }
  }

  const firstWord = registrarName.split(' ')[0].toLowerCase().replace(/[.,]+/g, '');
  return `https://${firstWord}.com`;
};

const REGISTRAR_LOGO_MAP = {
  'godaddy': '/images/registrars/Godaddy.png',
  'godaddycom': '/images/registrars/Godaddy.png',
  'godaddyllc': '/images/registrars/Godaddy.png',
  'godaddydomains': '/images/registrars/Godaddy.png',
  'webhostkenya': '/images/registrars/webhost-kenya.jpg',
  'namecheap': '/images/registrars/Namecheap.png',
  'namecheapcom': '/images/registrars/Namecheap.png',
  'cloudflare': '/images/registrars/Cloudflare Registrar.png',
  'cloudflareregistrar': '/images/registrars/Cloudflare Registrar.png',
  'cloudflareinc': '/images/registrars/Cloudflare Registrar.png',
  'gandi': '/images/registrars/Gandi.net.png',
  'gandinet': '/images/registrars/Gandi.net.png',
  'gandisas': '/images/registrars/Gandi.net.png',
  'namecom': '/images/registrars/Name.com',
  'namecominc': '/images/registrars/Name.com',
  'hostinger': '/images/registrars/hostinger.png',
  'hostingerinternationalsro': '/images/registrars/hostinger.png',
  'hostingerinternational': '/images/registrars/hostinger.png',
  'networksolutions': '/images/registrars/network-solutions.jpg',
  'networksolutionsllc': '/images/registrars/network-solutions.jpg',
  'wix': '/images/registrars/wix.png',
  'wixcom': '/images/registrars/wix.png',
  'wixcomltd': '/images/registrars/wix.png',
  'dimensiondata': '/images/registrars/dimension-data.png',
  'dimensiondataptyltd': '/images/registrars/dimension-data.png',
  'dimensiondatasolutionseastafrica': '/images/registrars/dimension-data.png',
  'safaricom': '/images/registrars/safaricom.jpg',
  'safaricomlimited': '/images/registrars/safaricom.jpg',
  'safaricomltd': '/images/registrars/safaricom.jpg'
};

export const getRegistrarLogoUrl = (name) => {
  if (!name || name === "Unknown") return null;

  const cleanName = name.replace(/,? (Inc|LLC|Ltd|Corp|GmbH|B\.V\.|S\.A\.|S\.R\.L\.|Pvt|Public Limited Company|S\.L\.)\.?$/i, '')
    .replace(/[.,]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  const localLogo = REGISTRAR_LOGO_MAP[cleanName];
  if (localLogo) {
    return localLogo;
  }

  return `https://img.logo.dev/${cleanName}.com?token=pk_X-bjM4U5QeeTFlMqueWvHQ`;
};

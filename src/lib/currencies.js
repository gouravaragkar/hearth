export const CURRENCIES = [
  { code: 'AUD', symbol: '$',  name: 'Australian Dollar',   locale: 'en-AU' },
  { code: 'USD', symbol: '$',  name: 'US Dollar',            locale: 'en-US' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',         locale: 'en-IN' },
  { code: 'EUR', symbol: '€',  name: 'Euro',                 locale: 'de-DE' },
  { code: 'GBP', symbol: '£',  name: 'British Pound',        locale: 'en-GB' },
  { code: 'CAD', symbol: '$',  name: 'Canadian Dollar',      locale: 'en-CA' },
  { code: 'NZD', symbol: '$',  name: 'New Zealand Dollar',   locale: 'en-NZ' },
  { code: 'SGD', symbol: '$',  name: 'Singapore Dollar',     locale: 'en-SG' },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',         locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',         locale: 'zh-CN' },
  { code: 'HKD', symbol: '$',  name: 'Hong Kong Dollar',     locale: 'en-HK' },
  { code: 'KRW', symbol: '₩',  name: 'South Korean Won',     locale: 'ko-KR' },
  { code: 'THB', symbol: '฿',  name: 'Thai Baht',            locale: 'th-TH' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit',    locale: 'ms-MY' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah',    locale: 'id-ID' },
  { code: 'PHP', symbol: '₱',  name: 'Philippine Peso',      locale: 'en-PH' },
  { code: 'VND', symbol: '₫',  name: 'Vietnamese Dong',      locale: 'vi-VN' },
  { code: 'AED', symbol: 'د.إ',name: 'UAE Dirham',           locale: 'ar-AE' },
  { code: 'SAR', symbol: '﷼',  name: 'Saudi Riyal',          locale: 'ar-SA' },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand',   locale: 'en-ZA' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real',       locale: 'pt-BR' },
  { code: 'MXN', symbol: '$',  name: 'Mexican Peso',         locale: 'es-MX' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',          locale: 'de-CH' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona',        locale: 'sv-SE' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone',      locale: 'nb-NO' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone',         locale: 'da-DK' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty',         locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna',         locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint',     locale: 'hu-HU' },
  { code: 'RUB', symbol: '₽',  name: 'Russian Ruble',        locale: 'ru-RU' },
  { code: 'TRY', symbol: '₺',  name: 'Turkish Lira',         locale: 'tr-TR' },
  { code: 'PKR', symbol: '₨',  name: 'Pakistani Rupee',      locale: 'ur-PK' },
  { code: 'BDT', symbol: '৳',  name: 'Bangladeshi Taka',     locale: 'bn-BD' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee',     locale: 'si-LK' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee',       locale: 'ne-NP' },
];

export function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

export function formatCurrency(amount, currencyCode = 'AUD') {
  const cur = getCurrency(currencyCode);
  return new Intl.NumberFormat(cur.locale, {
    style: 'currency',
    currency: cur.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}
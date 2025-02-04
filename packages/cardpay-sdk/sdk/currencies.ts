enum CryptoCurrency {
  ETH = 'ETH',
  DAI = 'DAI',
  CARD = 'CARD',
}

enum NativeCurrency {
  SPD = 'SPD',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AUD = 'AUD',
  CNY = 'CNY',
  KRW = 'KRW',
  RUB = 'RUB',
  INR = 'INR',
  JPY = 'JPY',
  TRY = 'TRY',
  CAD = 'CAD',
  NZD = 'NZD',
  ZAR = 'ZAR',
}

type Currency = CryptoCurrency | NativeCurrency;

export type { Currency };
export { CryptoCurrency, NativeCurrency };

interface CurrencyInfo {
  alignment: string;
  assetLimit: number;
  currency: string;
  decimals: number;
  label: string;
  mask: string;
  placeholder: string;
  smallThreshold: number;
  symbol: string;
  emojiName?: string;
}

const cryptoCurrencies: Record<CryptoCurrency, CurrencyInfo> = {
  ETH: {
    alignment: 'left',
    assetLimit: 0.001,
    currency: 'ETH',
    decimals: 18,
    label: 'Ethereum',
    mask: '[09999999999]{.}[999999999999999999]',
    placeholder: '0',
    smallThreshold: 0.003,
    symbol: 'Ξ',
  },
  DAI: {
    alignment: 'left',
    assetLimit: 0.001,
    currency: 'DAI',
    decimals: 18,
    label: 'Dai',
    mask: '[09999999999]{.}[999999999999999999]',
    placeholder: '0',
    smallThreshold: 0.003,
    symbol: '',
  },
  CARD: {
    alignment: 'left',
    assetLimit: 0.1,
    currency: 'CARD',
    decimals: 18,
    label: 'CARD',
    mask: '[09999999999]{.}[999999999999999999]',
    placeholder: '0',
    smallThreshold: 1,
    symbol: '',
  },
};

const nativeCurrencies: Record<NativeCurrency, CurrencyInfo> = {
  SPD: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'SPD',
    decimals: 0,
    label: 'SPEND',
    mask: '[099999999999]',
    placeholder: '0',
    smallThreshold: 1,
    symbol: '§',
  },
  USD: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'USD',
    decimals: 2,
    emojiName: 'united_states',
    label: 'United States Dollar',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 1,
    symbol: '$',
  },
  EUR: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'EUR',
    decimals: 2,
    emojiName: 'european_union',
    label: 'Euro',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 1,
    symbol: '€',
  },
  GBP: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'GBP',
    decimals: 2,
    emojiName: 'united_kingdom',
    label: 'British Pound',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 1,
    symbol: '£',
  },
  AUD: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'AUD',
    decimals: 2,
    emojiName: 'australia',
    label: 'Australian Dollar',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 1,
    symbol: 'A$',
  },
  CNY: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'CNY',
    decimals: 2,
    emojiName: 'china',
    label: 'Chinese Yuan',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 5,
    symbol: '¥',
  },
  KRW: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'KRW',
    decimals: 0,
    emojiName: 'south_korea',
    label: 'South Korean Won',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 1000,
    symbol: '₩',
  },
  RUB: {
    alignment: 'right',
    assetLimit: 1,
    currency: 'RUB',
    decimals: 2,
    emojiName: 'russia',
    label: 'Russian Ruble',
    mask: '[099999999999]{,}[00]',
    placeholder: '0.00',
    smallThreshold: 75,
    symbol: '₽',
  },
  INR: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'INR',
    decimals: 2,
    emojiName: 'india',
    label: 'Indian Rupee',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 75,
    symbol: '₹',
  },
  JPY: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'JPY',
    decimals: 2,
    emojiName: 'japan',
    label: 'Japanese Yen',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 100,
    symbol: '¥',
  },
  TRY: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'TRY',
    decimals: 2,
    emojiName: 'turkey',
    label: 'Turkish Lira',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 8,
    symbol: '₺',
  },
  CAD: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'CAD',
    decimals: 2,
    emojiName: 'canada',
    label: 'Canadian Dollar',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 1,
    symbol: 'CAN$',
  },
  NZD: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'NZD',
    decimals: 2,
    emojiName: 'new_zealand',
    label: 'New Zealand Dollar',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 1.5,
    symbol: 'NZ$',
  },
  ZAR: {
    alignment: 'left',
    assetLimit: 1,
    currency: 'ZAR',
    decimals: 2,
    emojiName: 'south_africa',
    label: 'South African Rand',
    mask: '[099999999999]{.}[00]',
    placeholder: '0.00',
    smallThreshold: 15,
    symbol: 'R',
  },
};

const currencies: Record<Currency, CurrencyInfo> = {
  ...cryptoCurrencies,
  ...nativeCurrencies,
};

export { nativeCurrencies, cryptoCurrencies, currencies };

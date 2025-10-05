import { sub, format } from "date-fns";

export type CryptoId = "BTC" | "ETH" | "SOL";
export type TimeRange = "30m" | "1h" | "24h" | "7d" | "30d" | "1y";
export type Currency = "USD" | "BRL";

export interface CryptoDataPoint {
  date: string;
  price: number;
}

export interface CryptoInfo {
  id: CryptoId;
  name: string;
  usd: number;
  brl: number;
  usd_24h_change: number;
  brl_24h_change: number;
}

export const CRYPTO_CURRENCIES: { id: CryptoId; name: string }[] = [
  { id: "BTC", name: "Bitcoin" },
  { id: "ETH", name: "Ethereum" },
  { id: "SOL", name: "Solana" },
];

const BASE_PRICES: Record<CryptoId, number> = {
  BTC: 656963 / 5.44, // Roughly 120765
  ETH: 3500,
  SOL: 228.40,
};

const VOLATILITY: Record<CryptoId, number> = {
  BTC: 0.1,
  ETH: 0.15,
  SOL: 0.25,
};

const USD_TO_BRL = 5.44;

const generatePrice = (basePrice: number, volatility: number) => {
  return basePrice * (1 + (Math.random() - 0.5) * volatility);
};

const generateChartData = (
  cryptoId: CryptoId,
  timeRange: TimeRange,
  currency: Currency
): CryptoDataPoint[] => {
  const basePrice = BASE_PRICES[cryptoId] * (currency === "BRL" ? USD_TO_BRL : 1);
  const cryptoVolatility = VOLATILITY[cryptoId];
  const now = new Date();
  let data: CryptoDataPoint[] = [];

  switch (timeRange) {
    case "30m": {
      data = Array.from({ length: 30 }, (_, i) => {
        const date = sub(now, { minutes: 29 - i });
        return {
          date: date.toISOString(),
          price: generatePrice(basePrice, cryptoVolatility * 0.1),
        };
      });
      break;
    }
    case "1h": {
      data = Array.from({ length: 60 }, (_, i) => {
        const date = sub(now, { minutes: 59 - i });
        return {
          date: date.toISOString(),
          price: generatePrice(basePrice, cryptoVolatility * 0.15),
        };
      });
      break;
    }
    case "24h": {
      data = Array.from({ length: 24 }, (_, i) => {
        const date = sub(now, { hours: 23 - i });
        return {
          date: date.toISOString(),
          price: generatePrice(basePrice, cryptoVolatility * 0.2),
        };
      });
      break;
    }
    case "7d": {
      data = Array.from({ length: 7 }, (_, i) => {
        const date = sub(now, { days: 6 - i });
        return {
          date: date.toISOString(),
          price: generatePrice(basePrice, cryptoVolatility * 0.5),
        };
      });
      break;
    }
    case "30d": {
      data = Array.from({ length: 30 }, (_, i) => {
        const date = sub(now, { days: 29 - i });
        return {
          date: date.toISOString(),
          price: generatePrice(basePrice, cryptoVolatility),
        };
      });
      break;
    }
    case "1y": {
      data = Array.from({ length: 12 }, (_, i) => {
        const date = sub(now, { months: 11 - i });
        const monthPrice = generatePrice(basePrice * (1 + (i-6)*0.1), cryptoVolatility * 2);
        return {
          date: date.toISOString(),
          price: monthPrice > 0 ? monthPrice : basePrice * 0.1,
        };
      });
      break;
    }
  }
  return data;
};

const generateCryptoInfo = (): Record<CryptoId, CryptoInfo> => {
    const info: Record<CryptoId, CryptoInfo> = {} as Record<CryptoId, CryptoInfo>;
    for (const crypto of CRYPTO_CURRENCIES) {
        const usdPrice = generatePrice(BASE_PRICES[crypto.id], VOLATILITY[crypto.id] * 0.05);
        const brlPrice = usdPrice * USD_TO_BRL;
        const usdChange = (Math.random() - 0.45) * 5; // % change
        const brlChange = usdChange + (Math.random() - 0.5) * 0.1;

        info[crypto.id] = {
            id: crypto.id,
            name: crypto.name,
            usd: usdPrice,
            brl: brlPrice,
            usd_24h_change: usdChange,
            brl_24h_change: brlChange,
        };
    }
    return info;
};


export const fetchCryptoData = async (
  cryptoId: CryptoId,
  timeRange: TimeRange,
  currency: Currency
): Promise<{ info: Record<CryptoId, CryptoInfo>; history: CryptoDataPoint[] }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

  const info = generateCryptoInfo();
  const history = generateChartData(cryptoId, timeRange, currency);

  return { info, history };
};

import { sub, getUnixTime } from "date-fns";

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

export const CRYPTO_CURRENCIES: { id: CryptoId; name: string, coingeckoId: string }[] = [
  { id: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { id: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { id: "SOL", name: "Solana", coingeckoId: "solana" },
];

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

const getCoinGeckoId = (cryptoId: CryptoId) => {
    return CRYPTO_CURRENCIES.find(c => c.id === cryptoId)?.coingeckoId || 'bitcoin';
}

const getTimeRangeParameters = (timeRange: TimeRange): { days?: string, from?: number, to?: number } => {
    const now = new Date();
    const to = getUnixTime(now);
    switch(timeRange) {
        case '30m':
             return { from: getUnixTime(sub(now, { minutes: 30 })), to: to };
        case '1h':
            return { from: getUnixTime(sub(now, { hours: 1 })), to: to, days: "1" };
        case '24h':
            return { days: "1" };
        case '7d':
            return { days: "7" };
        case '30d':
            return { days: "30" };
        case '1y':
            return { days: "365" };
        default:
            return { days: "1" };
    }
}

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchCryptoData = async (
  cryptoId: CryptoId,
  timeRange: TimeRange,
  currency: Currency
): Promise<{ info: Record<CryptoId, CryptoInfo>; history: CryptoDataPoint[] }> => {
  const coingeckoIds = CRYPTO_CURRENCIES.map(c => c.coingeckoId).join(',');
  const selectedCoingeckoId = getCoinGeckoId(cryptoId);
  const vsCurrencies = "usd,brl";

  try {
    // Fetch current prices and 24h change for all cryptos
    const infoUrl = `${COINGECKO_API_URL}/simple/price?ids=${coingeckoIds}&vs_currencies=${vsCurrencies}&include_24hr_change=true`;
    const infoResponse = await fetch(infoUrl);
    if (!infoResponse.ok) throw new Error(`Failed to fetch price data from CoinGecko: ${infoResponse.statusText}`);
    const infoData = await infoResponse.json();
    
    const info: Record<CryptoId, CryptoInfo> = {} as Record<CryptoId, CryptoInfo>;
    for (const crypto of CRYPTO_CURRENCIES) {
        const data = infoData[crypto.coingeckoId];
        if (data) {
            info[crypto.id] = {
                id: crypto.id,
                name: crypto.name,
                usd: data.usd,
                brl: data.brl,
                usd_24h_change: data.usd_24h_change,
                brl_24h_change: data.brl_24h_change,
            };
        }
    }

    // Add a small delay to avoid hitting API rate limits
    await delay(500);

    // Fetch historical data for the selected crypto
    const timeParams = getTimeRangeParameters(timeRange);
    let historyUrl: string;

    if (timeRange === '30m' || timeRange === '1h') {
        historyUrl = `${COINGECKO_API_URL}/coins/${selectedCoingeckoId}/market_chart/range?vs_currency=${currency.toLowerCase()}&from=${timeParams.from}&to=${timeParams.to}`;
    } else {
        historyUrl = `${COINGECKO_API_URL}/coins/${selectedCoingeckoId}/market_chart?vs_currency=${currency.toLowerCase()}&days=${timeParams.days}`;
    }
    
    const historyResponse = await fetch(historyUrl);
    if (!historyResponse.ok) throw new Error(`Failed to fetch historical data from CoinGecko: ${historyResponse.statusText}`);
    const historyData = await historyResponse.json();

    const history: CryptoDataPoint[] = historyData.prices.map((p: [number, number]) => ({
      date: new Date(p[0]).toISOString(),
      price: p[1],
    }));

    return { info, history };

  } catch (error) {
    console.error("Error fetching data from CoinGecko:", error);
    // Return empty/default state in case of an API error to avoid crashing the app
    return {
      info: {} as Record<CryptoId, CryptoInfo>,
      history: [],
    };
  }
};
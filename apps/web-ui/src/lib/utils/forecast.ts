import type { BinanceKlineMetric } from "@root/lib/slices/api.slice.types";
import type { GroupBy } from "@root/lib/slices/ui.slice.types";

/**
 * Calculate CAGR (Compound Annual Growth Rate) from historical price data
 */
export const calculateCagr = (prices: BinanceKlineMetric[]): number => {
  if (prices.length < 2) return 0;

  const firstPrice = parseFloat(prices[0].closePrice);
  const lastPrice = parseFloat(prices[prices.length - 1].closePrice);
  const firstDate = new Date(prices[0].closeTime);
  const lastDate = new Date(prices[prices.length - 1].closeTime);

  const timeInYears =
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  if (timeInYears <= 0 || firstPrice <= 0) return 0;

  // CAGR formula: (final_value / initial_value)^(1/time_in_years) - 1
  return (Math.pow(lastPrice / firstPrice, 1 / timeInYears) - 1) * 100;
};

/**
 * Add controlled randomness to a value
 */
export const addRandomness = (value: number, volatility = 0.15): number => {
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * volatility;
  return value * randomFactor;
};

/**
 * Get time interval in milliseconds based on groupBy
 */
const getTimeInterval = (groupBy: GroupBy): number => {
  const intervals: Record<GroupBy, number> = {
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "2h": 2 * 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "12h": 12 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "3d": 3 * 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
  };

  return intervals[groupBy] || intervals["1d"];
};

/**
 * Generate forecast data based on CAGR
 */
export const generateForecastData = (
  basePrice: number,
  cagr: number,
  years = 5,
  groupBy: GroupBy = "1M"
): BinanceKlineMetric[] => {
  const forecastData: BinanceKlineMetric[] = [];
  const timeInterval = getTimeInterval(groupBy);
  const intervalsPerYear = (365.25 * 24 * 60 * 60 * 1000) / timeInterval;
  const totalIntervals = Math.floor(years * intervalsPerYear);

  let currentPrice = basePrice;
  let currentTime = Date.now();

  for (let i = 0; i < totalIntervals; i++) {
    // Calculate growth factor for this interval
    const annualGrowthFactor = 1 + cagr / 100;
    const intervalGrowthFactor = Math.pow(
      annualGrowthFactor,
      1 / intervalsPerYear
    );

    // Apply growth with some randomness
    const growthWithRandomness = addRandomness(intervalGrowthFactor, 0.1);
    currentPrice *= growthWithRandomness;

    // Generate volume with some randomness
    const baseVolume = 1000000; // Base volume
    const volumeRandomness = addRandomness(baseVolume, 0.3);

    // Create kline data
    const openPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
    const highPrice =
      Math.max(openPrice, currentPrice) * (1 + Math.random() * 0.01);
    const lowPrice =
      Math.min(openPrice, currentPrice) * (1 - Math.random() * 0.01);
    const closePrice = currentPrice;

    const kline: BinanceKlineMetric = {
      openTime: currentTime,
      openPrice: openPrice.toString(),
      highPrice: highPrice.toString(),
      lowPrice: lowPrice.toString(),
      closePrice: closePrice.toString(),
      volume: volumeRandomness.toString(),
      closeTime: currentTime + timeInterval,
      quoteAssetVolume: volumeRandomness.toString(),
      numberOfTrades: Math.floor(Math.random() * 1000) + 100,
      takerBuyBaseAssetVolume: (volumeRandomness * 0.6).toString(),
      takerBuyQuoteAssetVolume: (
        volumeRandomness *
        0.6 *
        currentPrice
      ).toString(),
    };

    forecastData.push(kline);
    currentTime += timeInterval;
  }

  return forecastData;
};

/**
 * Generate forecast data that continues from the last historical data point
 */
export const generateForecastFromHistorical = (
  historicalData: BinanceKlineMetric[],
  cagr: number,
  years = 5,
  groupBy: GroupBy = "1M"
): BinanceKlineMetric[] => {
  if (historicalData.length === 0) return [];

  const lastDataPoint = historicalData[historicalData.length - 1];
  const basePrice = parseFloat(lastDataPoint.closePrice);
  const startTime = lastDataPoint.closeTime;

  const forecastData = generateForecastData(basePrice, cagr, years, groupBy);

  // Adjust timestamps to continue from the last historical point
  const timeInterval = getTimeInterval(groupBy);
  forecastData.forEach((kline, index) => {
    kline.openTime = startTime + index * timeInterval;
    kline.closeTime = startTime + (index + 1) * timeInterval;
  });

  return forecastData;
};

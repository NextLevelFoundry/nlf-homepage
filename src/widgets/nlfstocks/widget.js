/**
 * NLF Stocks Widget
 * API configuration for Polygon.io
 *
 * To use, add to services.yaml:
 * - My Watchlist:
 *     widget:
 *       type: nlfstocks
 *       key: your-polygon-api-key
 *       watchlist:
 *         - AAPL
 *         - GOOGL
 */

import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  // Polygon.io API
  api: "https://api.polygon.io/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    // Get current quote for a ticker
    // https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__prev
    quote: {
      endpoint: "v2/aggs/ticker/{symbol}/prev",
      map: (data) => {
        if (!data.results || data.results.length === 0) {
          return { error: "No data" };
        }
        const result = data.results[0];
        return {
          c: result.c, // close price (current)
          o: result.o, // open price
          h: result.h, // high
          l: result.l, // low
          v: result.v, // volume
          dp: result.c && result.o ? ((result.c - result.o) / result.o) * 100 : 0,
        };
      },
    },

    // Get intraday aggregates for sparkline
    // https://polygon.io/docs/stocks/get_v2_aggs_ticker__stocksticker__range__multiplier___timespan___from___to
    intraday: {
      endpoint: "v2/aggs/ticker/{symbol}/range/5/minute/{from}/{to}",
      params: ["from", "to"],
      // Will be populated with today's date by component
    },

    // Get market status
    // https://polygon.io/docs/stocks/get_v1_marketstatus_now
    status: {
      endpoint: "v1/marketstatus/now",
      map: (data) => ({
        isOpen: data.market === "open" || data.afterHours === true,
        market: data.market,
      }),
    },

    // Get ticker details (for company name, etc)
    details: {
      endpoint: "v3/reference/tickers/{symbol}",
      map: (data) => data.results || {},
    },
  },
};

export default widget;

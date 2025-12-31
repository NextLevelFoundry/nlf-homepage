/**
 * NLF Stocks Widget
 * Yahoo Finance sidebar style with inline sparkcharts
 *
 * Features:
 * - Intraday sparkline chart
 * - Opening price marker on chart
 * - Green when above open, red when below
 * - Compact watchlist layout
 *
 * Config example in services.yaml:
 * widget:
 *   type: nlfstocks
 *   provider: polygon  # polygon or finnhub
 *   key: your-api-key
 *   watchlist:
 *     - AAPL
 *     - GOOGL
 *     - MSFT
 *   showSparkline: true
 *   showMarketStatus: true
 */

import classNames from "classnames";
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

// SVG Sparkline component
function Sparkline({ data, open, width = 60, height = 20 }) {
  if (!data || data.length < 2) {
    return <div className={`w-[${width}px] h-[${height}px]`} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Normalize data to SVG coordinates
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  // Calculate opening price Y position
  const openY = height - ((open - min) / range) * height;

  // Determine if current price is above or below open
  const currentPrice = data[data.length - 1];
  const isAboveOpen = currentPrice >= open;
  const strokeColor = isAboveOpen ? "#10b981" : "#ef4444"; // emerald-500 : red-500
  const fillColor = isAboveOpen ? "#10b98120" : "#ef444420";

  return (
    <svg width={width} height={height} className="inline-block">
      {/* Opening price reference line */}
      <line
        x1="0"
        y1={openY}
        x2={width}
        y2={openY}
        stroke="#6b728080"
        strokeWidth="1"
        strokeDasharray="2,2"
      />

      {/* Fill area under the line */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={fillColor}
      />

      {/* Price line */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Opening price marker (small circle at start) */}
      <circle
        cx="0"
        cy={openY}
        r="2"
        fill="#6b7280"
      />

      {/* Current price marker (small circle at end) */}
      <circle
        cx={width}
        cy={height - ((currentPrice - min) / range) * height}
        r="2"
        fill={strokeColor}
      />
    </svg>
  );
}

function MarketStatus({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "status", {
    exchange: "US",
  });

  if (error || !data) {
    return null;
  }

  const { isOpen } = data;

  return (
    <span
      className={classNames(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
        isOpen
          ? "bg-green-500/10 text-green-400/90 ring-green-500/20"
          : "bg-red-400/10 text-red-400/60 ring-red-400/10"
      )}
    >
      {isOpen ? t("nlfstocks.open") || "Open" : t("nlfstocks.closed") || "Closed"}
    </span>
  );
}

function StockRow({ service, ticker, showSparkline }) {
  const { t } = useTranslation();
  const { widget } = service;

  // Fetch current quote
  const { data: quoteData, error: quoteError } = useWidgetAPI(widget, "quote", {
    symbol: ticker,
  });

  // Fetch intraday data for sparkline (if enabled)
  const { data: intradayData } = useWidgetAPI(
    widget,
    showSparkline ? "intraday" : "",
    { symbol: ticker }
  );

  if (quoteError) {
    return (
      <div className="flex items-center justify-between p-1.5 text-xs text-red-400">
        <span>{ticker}</span>
        <span>Error</span>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="flex items-center justify-between p-1.5 text-xs animate-pulse">
        <span className="font-medium">{ticker}</span>
        <span className="text-theme-500">...</span>
      </div>
    );
  }

  // Extract data (adjust based on API response format)
  const currentPrice = quoteData.c || quoteData.price || 0;
  const openPrice = quoteData.o || quoteData.open || currentPrice;
  const changePercent = quoteData.dp || quoteData.changePercent || 0;
  const isPositive = changePercent >= 0;

  // Extract sparkline data points
  const sparklineData = intradayData?.results?.map((r) => r.c) ||
    intradayData?.values?.map((v) => v.close) ||
    [];

  return (
    <div
      className={classNames(
        "flex items-center justify-between p-1.5 rounded",
        "hover:bg-theme-200/30 dark:hover:bg-theme-700/30 transition-colors"
      )}
    >
      {/* Ticker Symbol */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium text-xs text-theme-800 dark:text-theme-200 w-12 truncate">
          {ticker}
        </span>

        {/* Sparkline */}
        {showSparkline && sparklineData.length > 0 && (
          <Sparkline
            data={sparklineData}
            open={openPrice}
            width={50}
            height={16}
          />
        )}
      </div>

      {/* Price & Change */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-theme-700 dark:text-theme-300">
          {t("common.number", {
            value: currentPrice,
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2,
          })}
        </span>
        <span
          className={classNames(
            "font-bold min-w-[3.5rem] text-right",
            isPositive ? "text-emerald-500" : "text-red-500"
          )}
        >
          {isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const {
    watchlist = [],
    showSparkline = true,
    showMarketStatus = true,
  } = widget;

  // Validation
  if (!watchlist || watchlist.length === 0) {
    return (
      <Container service={service}>
        <Block value={t("nlfstocks.noWatchlist") || "No watchlist configured"} />
      </Container>
    );
  }

  if (watchlist.length > 20) {
    return (
      <Container service={service}>
        <Block value={t("nlfstocks.tooMany") || "Maximum 20 tickers allowed"} />
      </Container>
    );
  }

  return (
    <Container service={service}>
      {/* Market Status Badge */}
      {showMarketStatus && (
        <div className={classNames(service.description ? "-top-10" : "-top-8", "absolute right-1 z-20")}>
          <MarketStatus service={service} />
        </div>
      )}

      {/* Watchlist */}
      <div className="flex flex-col w-full divide-y divide-theme-200/50 dark:divide-theme-700/50">
        {watchlist.map((ticker) => (
          <StockRow
            key={ticker}
            service={service}
            ticker={ticker}
            showSparkline={showSparkline}
          />
        ))}
      </div>
    </Container>
  );
}

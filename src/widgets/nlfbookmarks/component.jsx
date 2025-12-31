/**
 * NLF Bookmarks Widget
 * Dense icon grid layout inspired by start.me
 *
 * Config example in services.yaml:
 * widget:
 *   type: nlfbookmarks
 *   columns: 6  # number of columns in grid
 *   iconSize: sm | md | lg  # icon size
 *   showLabels: true  # show text labels under icons
 *   items:
 *     - name: GitHub
 *       icon: si-github  # Simple Icons prefix
 *       href: https://github.com
 *     - name: Gmail
 *       icon: mdi-gmail  # MDI prefix
 *       href: https://mail.google.com
 */

import classNames from "classnames";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { useTranslation } from "next-i18next";

// Icon size classes
const iconSizes = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

// Grid column classes
const gridCols = {
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  8: "grid-cols-8",
  10: "grid-cols-10",
  12: "grid-cols-12",
};

function BookmarkIcon({ icon, name, size = "md" }) {
  const sizeClass = iconSizes[size] || iconSizes.md;

  // Handle different icon prefixes
  if (icon?.startsWith("si-")) {
    // Simple Icons
    const iconName = icon.replace("si-", "");
    return (
      <img
        src={`https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/${iconName}.svg`}
        alt={name}
        className={classNames(sizeClass, "dark:invert opacity-80 hover:opacity-100 transition-opacity")}
      />
    );
  }

  if (icon?.startsWith("mdi-")) {
    // Material Design Icons (via iconify)
    const iconName = icon.replace("mdi-", "");
    return (
      <span
        className={classNames(sizeClass, "iconify text-theme-700 dark:text-theme-300")}
        data-icon={`mdi:${iconName}`}
      />
    );
  }

  if (icon?.startsWith("http")) {
    // Custom URL
    return <img src={icon} alt={name} className={classNames(sizeClass, "object-contain")} />;
  }

  // Fallback to dashboard icon system
  return (
    <div className={classNames(sizeClass, "bg-theme-300/50 dark:bg-theme-700/50 rounded flex items-center justify-center")}>
      <span className="text-xs font-bold text-theme-600 dark:text-theme-400">
        {name?.charAt(0)?.toUpperCase() || "?"}
      </span>
    </div>
  );
}

function BookmarkItem({ item, iconSize, showLabels }) {
  const { name, icon, href } = item;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(
        "flex flex-col items-center justify-center p-2 rounded",
        "hover:bg-theme-200/50 dark:hover:bg-theme-700/50 transition-colors",
        "group cursor-pointer"
      )}
      title={name}
    >
      <BookmarkIcon icon={icon} name={name} size={iconSize} />
      {showLabels && (
        <span className="mt-1 text-xs text-theme-600 dark:text-theme-400 truncate max-w-full text-center">
          {name}
        </span>
      )}
    </a>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const {
    items = [],
    columns = 6,
    iconSize = "md",
    showLabels = true,
  } = widget;

  // Validation
  if (!items || items.length === 0) {
    return (
      <Container service={service}>
        <Block value={t("nlfbookmarks.noItems") || "No bookmarks configured"} />
      </Container>
    );
  }

  const gridColClass = gridCols[columns] || gridCols[6];

  return (
    <Container service={service}>
      <div className={classNames("grid gap-1 w-full", gridColClass)}>
        {items.map((item, index) => (
          <BookmarkItem
            key={item.href || index}
            item={item}
            iconSize={iconSize}
            showLabels={showLabels}
          />
        ))}
      </div>
    </Container>
  );
}

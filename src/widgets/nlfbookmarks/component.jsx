/**
 * NLF Bookmarks Widget
 * Dense icon grid layout with grouped sections
 * Inspired by start.me - icons only with tooltip on hover
 *
 * Config example in services.yaml:
 * - ucontrolnetwork.com:
 *     description: Admin & Monitoring
 *     widget:
 *       type: nlfbookmarks
 *       groups:
 *         - name: Admin Tools
 *           items:
 *             - name: Portainer
 *               icon: si-portainer
 *               href: https://portainer.example.com
 *             - name: Authentik
 *               icon: si-authentik
 *               href: https://auth.example.com
 *         - name: Monitoring
 *           items:
 *             - name: Grafana
 *               icon: si-grafana
 *               href: https://grafana.example.com
 */

import classNames from "classnames";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { useTranslation } from "next-i18next";

function BookmarkIcon({ icon, name, href, size = "md" }) {
  // Icon size classes
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Render icon based on prefix
  const renderIcon = () => {
    if (icon?.startsWith("si-")) {
      // Simple Icons (via CDN)
      const iconName = icon.replace("si-", "");
      return (
        <img
          src={`https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/${iconName}.svg`}
          alt={name}
          className={classNames(sizeClass, "dark:invert opacity-70 group-hover:opacity-100 transition-opacity")}
        />
      );
    }

    if (icon?.startsWith("mdi-")) {
      // Material Design Icons (via iconify CDN)
      const iconName = icon.replace("mdi-", "");
      return (
        <span
          className={classNames(
            sizeClass,
            "iconify text-theme-600 dark:text-theme-400 opacity-70 group-hover:opacity-100 transition-opacity"
          )}
          data-icon={`mdi:${iconName}`}
        />
      );
    }

    if (icon?.startsWith("http")) {
      // Custom URL icon
      return (
        <img
          src={icon}
          alt={name}
          className={classNames(sizeClass, "object-contain opacity-70 group-hover:opacity-100 transition-opacity")}
        />
      );
    }

    if (icon?.startsWith("/icons/")) {
      // Local icon from public/icons folder
      return (
        <img
          src={icon}
          alt={name}
          className={classNames(sizeClass, "object-contain opacity-70 group-hover:opacity-100 transition-opacity")}
        />
      );
    }

    // Fallback: first letter
    return (
      <div
        className={classNames(
          sizeClass,
          "bg-theme-300/50 dark:bg-theme-700/50 rounded flex items-center justify-center",
          "opacity-70 group-hover:opacity-100 transition-opacity"
        )}
      >
        <span className="text-xs font-bold text-theme-600 dark:text-theme-400">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </span>
      </div>
    );
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      className={classNames(
        "group flex items-center justify-center p-1.5 rounded",
        "hover:bg-theme-200/60 dark:hover:bg-theme-700/60 transition-all",
        "cursor-pointer"
      )}
    >
      {renderIcon()}
    </a>
  );
}

function BookmarkGroup({ group, iconSize }) {
  const { name, items = [] } = group;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="mb-2 last:mb-0">
      {/* Group header */}
      {name && (
        <div className="text-[10px] font-semibold uppercase tracking-wider text-theme-500 dark:text-theme-400 mb-1 px-1">
          {name}
        </div>
      )}

      {/* Icon grid */}
      <div className="flex flex-wrap gap-0.5">
        {items.map((item, index) => (
          <BookmarkIcon
            key={item.href || index}
            icon={item.icon}
            name={item.name}
            href={item.href}
            size={iconSize}
          />
        ))}
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const {
    groups = [],
    items = [],  // Flat list fallback (no groups)
    iconSize = "md",
  } = widget;

  // Support both grouped and flat item lists
  const hasGroups = groups && groups.length > 0;
  const hasItems = items && items.length > 0;

  if (!hasGroups && !hasItems) {
    return (
      <Container service={service}>
        <Block value={t("nlfbookmarks.noItems") || "No bookmarks configured"} />
      </Container>
    );
  }

  // If flat items provided (no groups), wrap in a single group
  const displayGroups = hasGroups
    ? groups
    : [{ name: null, items }];

  return (
    <Container service={service}>
      <div className="flex flex-col w-full">
        {displayGroups.map((group, index) => (
          <BookmarkGroup
            key={group.name || index}
            group={group}
            iconSize={iconSize}
          />
        ))}
      </div>
    </Container>
  );
}

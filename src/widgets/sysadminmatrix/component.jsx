/**
 * Sys Admin Matrix Widget
 * Grid display of systems and their admin tools
 *
 * Features:
 * - Columns for each system (Marvel-themed hosts)
 * - Header row with system icons
 * - Tool rows for admin interfaces in priority order
 */

import classNames from "classnames";
import Container from "components/services/widget/container";

// Tool row definitions with icons and labels
const TOOL_ROWS = [
  { key: "proxmox", label: "Proxmox", icon: "si-proxmox" },
  { key: "synology", label: "Synology", icon: "si-synology" },
  { key: "unifi", label: "UniFi", icon: "si-ubiquiti" },
  { key: "cockpit", label: "Cockpit", icon: "mdi-airplane-cog" },
  { key: "portainer", label: "Portainer", icon: "si-portainer" },
  { key: "glances", label: "Glances", icon: "mdi-chart-line" },
  { key: "netdata", label: "NetData", icon: "si-netdata" },
  { key: "dockhand", label: "Dockhand", icon: "mdi-ferry" },
];

function SystemIcon({ icon, name, size = "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };
  const sizeClass = sizeClasses[size] || sizeClasses.lg;

  if (!icon) {
    return (
      <div
        className={classNames(
          sizeClass,
          "bg-theme-300/50 dark:bg-theme-700/50 rounded-full flex items-center justify-center",
        )}
      >
        <span className="text-xs font-bold text-theme-600 dark:text-theme-400">
          {name?.substring(0, 2)?.toUpperCase() || "??"}
        </span>
      </div>
    );
  }

  if (icon.startsWith("si-")) {
    const iconName = icon.replace("si-", "");
    return (
      <img
        src={`https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/${iconName}.svg`}
        alt={name}
        className={classNames(sizeClass, "dark:invert")}
      />
    );
  }

  if (icon.startsWith("mdi-")) {
    const iconName = icon.replace("mdi-", "");
    return (
      <span
        className={classNames(sizeClass, "iconify text-theme-600 dark:text-theme-400")}
        data-icon={`mdi:${iconName}`}
      />
    );
  }

  if (icon.startsWith("http") || icon.startsWith("/icons/") || icon.startsWith("data:")) {
    return <img src={icon} alt={name} className={classNames(sizeClass, "object-contain rounded-full")} />;
  }

  // Fallback to showing icon as text/emoji
  return (
    <div
      className={classNames(
        sizeClass,
        "bg-theme-300/50 dark:bg-theme-700/50 rounded-full flex items-center justify-center text-xl",
      )}
    >
      {icon}
    </div>
  );
}

function ToolIcon({ icon, size = "sm" }) {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
  };
  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  if (icon.startsWith("si-")) {
    const iconName = icon.replace("si-", "");
    return (
      <img
        src={`https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/${iconName}.svg`}
        alt=""
        className={classNames(sizeClass, "dark:invert opacity-70")}
      />
    );
  }

  if (icon.startsWith("mdi-")) {
    const iconName = icon.replace("mdi-", "");
    return (
      <span
        className={classNames(sizeClass, "iconify text-theme-500 dark:text-theme-400")}
        data-icon={`mdi:${iconName}`}
      />
    );
  }

  return null;
}

function MatrixCell({ href, icon, systemName, toolName }) {
  if (!href) {
    return (
      <div className="w-8 h-8 flex items-center justify-center text-theme-400/30 dark:text-theme-600/30">
        <span className="text-lg">-</span>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${toolName} on ${systemName}`}
      className="w-8 h-8 flex items-center justify-center rounded hover:bg-theme-200/60 dark:hover:bg-theme-700/60 transition-all cursor-pointer group"
    >
      <ToolIcon icon={icon} />
    </a>
  );
}

export default function Component({ service }) {
  const { widget } = service;
  const { systems = [], showLabels = false, compact = false } = widget;

  // Filter to only show tool rows that have at least one system with that tool
  const activeToolRows = TOOL_ROWS.filter((tool) => systems.some((system) => system[tool.key]));

  if (!systems || systems.length === 0) {
    return (
      <Container service={service}>
        <div className="text-center py-4">
          <p className="text-sm text-theme-500">No systems configured</p>
        </div>
      </Container>
    );
  }

  return (
    <Container service={service}>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header row with system icons */}
          <thead>
            <tr>
              {showLabels && <th className="w-16" />}
              {systems.map((system, idx) => (
                <th key={system.name || idx} className="px-1 py-1 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <SystemIcon icon={system.icon} name={system.name} size={compact ? "md" : "lg"} />
                    {!compact && (
                      <span className="text-[9px] text-theme-500 dark:text-theme-400 truncate max-w-[60px]">
                        {system.name}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Tool rows */}
          <tbody>
            {activeToolRows.map((tool) => (
              <tr key={tool.key} className="border-t border-theme-200/30 dark:border-theme-700/30">
                {showLabels && (
                  <td className="pr-2 py-0.5">
                    <div className="flex items-center gap-1">
                      <ToolIcon icon={tool.icon} size="xs" />
                      <span className="text-[10px] text-theme-500 dark:text-theme-400">{tool.label}</span>
                    </div>
                  </td>
                )}
                {systems.map((system, idx) => (
                  <td key={`${tool.key}-${system.name || idx}`} className="px-1 py-0.5 text-center">
                    <div className="flex justify-center">
                      <MatrixCell
                        href={system[tool.key]}
                        icon={tool.icon}
                        systemName={system.name}
                        toolName={tool.label}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}

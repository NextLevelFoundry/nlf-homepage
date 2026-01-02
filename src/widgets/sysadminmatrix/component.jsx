/**
 * Sys Admin Matrix Widget
 * Compact grid of systems with their admin tools
 *
 * Features:
 * - Each system shows as a column with icon and sorted tool links
 * - Tools sorted by priority (Proxmox > Synology > Cockpit > Portainer > etc.)
 * - Color icons from dashboardicons.com
 */

import classNames from "classnames";
import Container from "components/services/widget/container";

// Tool priority order and icon definitions (using dashboardicons.com)
const TOOL_PRIORITY = [
  { key: "proxmox", label: "Proxmox", icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/proxmox.png" },
  { key: "synology", label: "DSM", icon: "/icons/service_icons/DSM7_64.png" },
  { key: "unifi", label: "UniFi", icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/unifi.png" },
  {
    key: "unifi_protect",
    label: "Protect",
    icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/unifi-protect.png",
  },
  { key: "cockpit", label: "Cockpit", icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/cockpit.png" },
  {
    key: "portainer",
    label: "Portainer",
    icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/portainer.png",
  },
  { key: "glances", label: "Glances", icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/glances.png" },
  { key: "netdata", label: "NetData", icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/netdata.png" },
  { key: "dockhand", label: "Dockhand", icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/docker.png" },
];

function SystemIcon({ icon, name, size = "md" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (!icon) {
    return (
      <span className="text-xs font-bold text-theme-600 dark:text-theme-400">
        {name?.substring(0, 2)?.toUpperCase() || "??"}
      </span>
    );
  }

  if (icon.startsWith("http") || icon.startsWith("/icons/") || icon.startsWith("data:")) {
    return <img src={icon} alt={name} className={classNames(sizeClass, "object-contain")} />;
  }

  // Fallback to showing icon as text
  return (
    <span className="text-xs font-bold text-theme-600 dark:text-theme-400">
      {name?.substring(0, 2)?.toUpperCase() || "??"}
    </span>
  );
}

function ToolLink({ href, tool, systemName }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${tool.label} on ${systemName}`}
      className="flex items-center gap-1.5 px-1 py-0.5 rounded hover:bg-theme-200/60 dark:hover:bg-theme-700/60 transition-all"
    >
      <img src={tool.icon} alt={tool.label} className="w-4 h-4 object-contain" />
      <span className="text-[10px] text-theme-600 dark:text-theme-300">{tool.label}</span>
    </a>
  );
}

function SystemColumn({ system }) {
  // Get tools this system has, sorted by priority
  const systemTools = TOOL_PRIORITY.filter((tool) => system[tool.key]).map((tool) => ({
    ...tool,
    href: system[tool.key],
  }));

  if (systemTools.length === 0) return null;

  return (
    <div className="flex flex-col items-center min-w-[60px]">
      {/* System icon only - no name */}
      <div className="mb-1" title={system.name}>
        <SystemIcon icon={system.icon} name={system.name} size="md" />
      </div>

      {/* Tool links sorted by priority */}
      <div className="flex flex-col items-start w-full">
        {systemTools.map((tool) => (
          <ToolLink key={tool.key} href={tool.href} tool={tool} systemName={system.name} />
        ))}
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { widget } = service;
  const { systems = [] } = widget;

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
        <div className="flex flex-wrap gap-3 justify-start">
          {systems.map((system, idx) => (
            <SystemColumn key={system.name || idx} system={system} />
          ))}
        </div>
      </div>
    </Container>
  );
}

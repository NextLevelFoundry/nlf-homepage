/**
 * NLF Bookmarks Widget
 * Dense icon grid with grouped sections and settings UI
 *
 * Features:
 * - Settings button to configure widget via web interface
 * - Add/edit/remove groups and bookmarks
 * - Icon upload or URL specification
 * - Tooltip on hover
 */

import classNames from "classnames";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
import { MdAdd, MdClose, MdDelete, MdDragHandle, MdSave, MdSettings, MdUpload } from "react-icons/md";

// Storage key prefix for widget configs
const STORAGE_KEY_PREFIX = "nlfbookmarks_";

function BookmarkIcon({ icon, name, href, size = "md" }) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  const renderIcon = () => {
    if (icon?.startsWith("si-")) {
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
      const iconName = icon.replace("mdi-", "");
      return (
        <span
          className={classNames(
            sizeClass,
            "iconify text-theme-600 dark:text-theme-400 opacity-70 group-hover:opacity-100",
          )}
          data-icon={`mdi:${iconName}`}
        />
      );
    }

    if (icon?.startsWith("http") || icon?.startsWith("/icons/") || icon?.startsWith("data:")) {
      return (
        <img
          src={icon}
          alt={name}
          className={classNames(sizeClass, "object-contain opacity-70 group-hover:opacity-100 transition-opacity")}
        />
      );
    }

    return (
      <div
        className={classNames(
          sizeClass,
          "bg-theme-300/50 dark:bg-theme-700/50 rounded flex items-center justify-center opacity-70 group-hover:opacity-100",
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
      className="group flex items-center justify-center p-1.5 rounded hover:bg-theme-200/60 dark:hover:bg-theme-700/60 transition-all cursor-pointer"
    >
      {renderIcon()}
    </a>
  );
}

function BookmarkGroup({ group, iconSize }) {
  const { name, items = [] } = group;
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-2 last:mb-0">
      {name && (
        <div className="text-[10px] font-semibold uppercase tracking-wider text-theme-500 dark:text-theme-400 mb-1 px-1">
          {name}
        </div>
      )}
      <div className="flex flex-wrap gap-0.5">
        {items.map((item, index) => (
          <BookmarkIcon key={item.href || index} icon={item.icon} name={item.name} href={item.href} size={iconSize} />
        ))}
      </div>
    </div>
  );
}

// Settings Modal Component
function SettingsModal({ isOpen, onClose, config, onSave, widgetId }) {
  const [editConfig, setEditConfig] = useState({ groups: [], ...config });
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setEditConfig({ groups: [], ...config });
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleAddGroup = () => {
    setEditConfig((prev) => ({
      ...prev,
      groups: [...(prev.groups || []), { name: "New Group", items: [] }],
    }));
  };

  const handleUpdateGroup = (groupIndex, updates) => {
    setEditConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) => (i === groupIndex ? { ...g, ...updates } : g)),
    }));
  };

  const handleDeleteGroup = (groupIndex) => {
    setEditConfig((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== groupIndex),
    }));
  };

  const handleAddItem = (groupIndex) => {
    setEditConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, i) =>
        i === groupIndex
          ? { ...g, items: [...(g.items || []), { name: "New Bookmark", href: "https://", icon: "" }] }
          : g,
      ),
    }));
  };

  const handleUpdateItem = (groupIndex, itemIndex, updates) => {
    setEditConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, gi) =>
        gi === groupIndex
          ? { ...g, items: g.items.map((item, ii) => (ii === itemIndex ? { ...item, ...updates } : item)) }
          : g,
      ),
    }));
  };

  const handleDeleteItem = (groupIndex, itemIndex) => {
    setEditConfig((prev) => ({
      ...prev,
      groups: prev.groups.map((g, gi) =>
        gi === groupIndex ? { ...g, items: g.items.filter((_, ii) => ii !== itemIndex) } : g,
      ),
    }));
  };

  const handleIconUpload = (groupIndex, itemIndex, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleUpdateItem(groupIndex, itemIndex, { icon: event.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(editConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-theme-100 dark:bg-theme-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-200 dark:border-theme-700">
          <h2 className="text-lg font-semibold text-theme-800 dark:text-theme-200">Widget Settings</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-theme-200 dark:hover:bg-theme-700">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Groups */}
          {editConfig.groups?.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-theme-200 dark:border-theme-700 rounded-lg p-3">
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-3">
                <MdDragHandle className="w-4 h-4 text-theme-400 cursor-move" />
                <input
                  type="text"
                  value={group.name || ""}
                  onChange={(e) => handleUpdateGroup(groupIndex, { name: e.target.value })}
                  placeholder="Group Name"
                  className="flex-1 px-2 py-1 text-sm bg-theme-50 dark:bg-theme-900 border border-theme-200 dark:border-theme-700 rounded"
                />
                <button
                  onClick={() => handleAddItem(groupIndex)}
                  className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                  title="Add Bookmark"
                >
                  <MdAdd className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteGroup(groupIndex)}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  title="Delete Group"
                >
                  <MdDelete className="w-4 h-4" />
                </button>
              </div>

              {/* Items */}
              <div className="space-y-2 pl-6">
                {group.items?.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-2 p-2 bg-theme-50 dark:bg-theme-900 rounded">
                    {/* Icon Preview */}
                    <div className="w-6 h-6 flex-shrink-0">
                      <BookmarkIcon icon={item.icon} name={item.name} href="#" size="sm" />
                    </div>

                    {/* Name */}
                    <input
                      type="text"
                      value={item.name || ""}
                      onChange={(e) => handleUpdateItem(groupIndex, itemIndex, { name: e.target.value })}
                      placeholder="Name"
                      className="w-24 px-2 py-1 text-xs bg-white dark:bg-theme-800 border border-theme-200 dark:border-theme-700 rounded"
                    />

                    {/* URL */}
                    <input
                      type="text"
                      value={item.href || ""}
                      onChange={(e) => handleUpdateItem(groupIndex, itemIndex, { href: e.target.value })}
                      placeholder="URL"
                      className="flex-1 px-2 py-1 text-xs bg-white dark:bg-theme-800 border border-theme-200 dark:border-theme-700 rounded"
                    />

                    {/* Icon Input */}
                    <input
                      type="text"
                      value={item.icon || ""}
                      onChange={(e) => handleUpdateItem(groupIndex, itemIndex, { icon: e.target.value })}
                      placeholder="si-icon or URL"
                      className="w-28 px-2 py-1 text-xs bg-white dark:bg-theme-800 border border-theme-200 dark:border-theme-700 rounded"
                    />

                    {/* Upload Icon */}
                    <label
                      className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded cursor-pointer"
                      title="Upload Icon"
                    >
                      <MdUpload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleIconUpload(groupIndex, itemIndex, e)}
                      />
                    </label>

                    {/* Delete Item */}
                    <button
                      onClick={() => handleDeleteItem(groupIndex, itemIndex)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      title="Delete"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add Group Button */}
          <button
            onClick={handleAddGroup}
            className="w-full py-2 border-2 border-dashed border-theme-300 dark:border-theme-600 rounded-lg text-theme-500 hover:border-theme-400 hover:text-theme-600 transition-colors flex items-center justify-center gap-2"
          >
            <MdAdd className="w-5 h-5" />
            Add Group
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-theme-200 dark:border-theme-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-theme-600 dark:text-theme-400 hover:bg-theme-200 dark:hover:bg-theme-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded flex items-center gap-2"
          >
            <MdSave className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { iconSize = "md" } = widget;

  // Generate unique widget ID from service name
  const widgetId = service.name?.toLowerCase().replace(/\s+/g, "_") || "default";
  const storageKey = `${STORAGE_KEY_PREFIX}${widgetId}`;

  // State for widget config (from localStorage or YAML)
  const [config, setConfig] = useState(() => {
    // Try localStorage first
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved config:", e);
        }
      }
    }
    // Fall back to YAML config
    return { groups: widget.groups || [], items: widget.items || [] };
  });

  const [showSettings, setShowSettings] = useState(false);

  // Save config to localStorage
  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
    }
  };

  // Determine what to display
  const hasGroups = config.groups && config.groups.length > 0;
  const hasItems = config.items && config.items.length > 0;
  const displayGroups = hasGroups ? config.groups : hasItems ? [{ name: null, items: config.items }] : [];

  return (
    <Container service={service}>
      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className={classNames(
          "absolute z-10 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-theme-200/80 dark:hover:bg-theme-700/80 text-theme-500 hover:text-theme-700 dark:hover:text-theme-300",
          service.description ? "-top-9 right-1" : "-top-7 right-1",
        )}
        title="Settings"
      >
        <MdSettings className="w-4 h-4" />
      </button>

      {/* Bookmarks Display */}
      {displayGroups.length > 0 ? (
        <div className="flex flex-col w-full">
          {displayGroups.map((group, index) => (
            <BookmarkGroup key={group.name || index} group={group} iconSize={iconSize} />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-theme-500 mb-2">No bookmarks configured</p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Bookmarks
          </button>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onSave={handleSaveConfig}
        widgetId={widgetId}
      />
    </Container>
  );
}


import React from 'react';

const TOOLS = [
  { id: 'Select', icon: '👆', label: 'Select' },
  { id: 'Move', icon: '✋', label: 'Move' },
  { id: 'Clone', icon: '📋', label: 'Clone' },
  { id: 'Draw Path', icon: '🛣️', label: 'Draw Path' },
  { id: 'Edit Points', icon: '📌', label: 'Edit Points' },
  { id: 'Delete', icon: '🗑️', label: 'Delete' },
];

const THEME_TEAL = '#0D9488';
const DEFAULT_ROAD_COLOR = '#e8cd9e';

const PathToolsPanel = ({
  activeTool = 'Select',
  activeRoad,
  onSetActiveTool,
  onSetActiveLayer,
  onDeleteRoad,
  onUndoLastPoint,
  onSelectNextPoint,
  onUpdateRoadWidth,
  onUpdateRoadDash,
  onUpdateRoadColor,
  onClearRoadPoints,
}) => {
  const hasRoad = Boolean(activeRoad?.id);

  const points = Array.isArray(activeRoad?.points)
    ? activeRoad.points
    : [];

  const hasPoints = points.length >= 2;

  // Only the currently selected tool gets the theme color.
  const toolStyles = (isActive) =>
    isActive
      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-md ring-2 ring-[#0D9488]/30 font-bold'
      : 'bg-white text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300';

  const handleToolSelect = (toolId) => {
    onSetActiveTool?.(toolId);

    if (
      toolId === 'Draw Path' ||
      toolId === 'Edit Points'
    ) {
      onSetActiveLayer?.('Roads & Paths');
    }
  };

  const handleClearPoints = () => {
    if (!hasRoad || !hasPoints || !onClearRoadPoints) return;

    const confirmed = window.confirm(
      `Clear all points from "${activeRoad.name || 'Untitled'}"? ` +
      'The road object and its settings will be preserved.'
    );

    if (confirmed) {
      onClearRoadPoints(activeRoad.id);
    }
  };

  const handleDeleteRoad = () => {
    if (!hasRoad || !onDeleteRoad) return;

    const confirmed = window.confirm(
      `Delete "${activeRoad.name || 'Untitled'}" completely? ` +
      'Only this road path will be removed.'
    );

    if (confirmed) {
      onDeleteRoad(activeRoad.id);
    }
  };

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Path Tools
        </h3>

        <span
          className="rounded-full bg-teal-100 px-2 py-1 text-[10px] font-semibold text-teal-700"
          style={{ color: THEME_TEAL }}
        >
          {activeTool}
        </span>
      </div>

      {/* Tool selection */}
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              aria-pressed={isActive}
              title={`Select ${tool.label} tool`}
              onClick={() => handleToolSelect(tool.id)}
              className={[
                'min-h-[66px] flex flex-col items-center justify-center',
                'gap-1 p-2 rounded-xl border text-[11px]',
                'transition-all duration-150 cursor-pointer',
                'focus:outline-none focus-visible:ring-2',
                'focus-visible:ring-[#0D9488]',
                toolStyles(isActive),
              ].join(' ')}
            >
              <span className="text-base" aria-hidden="true">
                {tool.icon}
              </span>

              <span>{tool.label}</span>

              {isActive && (
                <span className="text-[9px] font-bold uppercase tracking-wide">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Point actions */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onUndoLastPoint}
          disabled={!hasRoad || !hasPoints}
          className="flex items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ↩️ Undo Last Point
        </button>

        <button
          type="button"
          onClick={onSelectNextPoint}
          disabled={!hasRoad || !hasPoints}
          className="flex items-center justify-center gap-1 rounded-lg border border-teal-200 bg-teal-50 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ⏭️ Next Point
        </button>
      </div>

      {/* Road style and width */}
      <div className="space-y-3 border-t border-slate-200 pt-3">
        <h4 className="text-[11px] font-bold uppercase text-slate-700">
          Road Style &amp; Width
        </h4>

        {/* Width */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="road-width"
              className="text-[11px] font-medium text-slate-600"
            >
              Road Width
            </label>

            <span className="text-xs font-bold text-teal-700">
              {activeRoad?.width || 36}px
            </span>
          </div>

          <input
            id="road-width"
            type="range"
            min="10"
            max="80"
            step="1"
            value={activeRoad?.width || 36}
            disabled={!hasRoad}
            onChange={(event) =>
              onUpdateRoadWidth?.(Number(event.target.value))
            }
            className="w-full cursor-pointer accent-teal-600 disabled:opacity-40"
          />
        </div>

        {/* Line style */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-600">
            Line Style
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!hasRoad}
              aria-pressed={Boolean(activeRoad?.dash?.length)}
              onClick={() => onUpdateRoadDash?.([10, 10])}
              className={`rounded-lg border px-3 py-1 text-[10px] font-bold transition disabled:opacity-40 ${
                activeRoad?.dash?.length
                  ? 'bg-[#0D9488] text-white border-[#0D9488]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
              }`}
            >
              Dashed
            </button>

            <button
              type="button"
              disabled={!hasRoad}
              aria-pressed={!activeRoad?.dash?.length}
              onClick={() => onUpdateRoadDash?.(undefined)}
              className={`rounded-lg border px-3 py-1 text-[10px] font-bold transition disabled:opacity-40 ${
                !activeRoad?.dash?.length
                  ? 'bg-[#0D9488] text-white border-[#0D9488]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
              }`}
            >
              Solid
            </button>
          </div>
        </div>

        {/* Road color */}
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="road-color"
            className="text-[11px] font-medium text-slate-600"
          >
            Road Color
          </label>

          <input
            id="road-color"
            type="color"
            value={activeRoad?.color || DEFAULT_ROAD_COLOR}
            disabled={!hasRoad}
            onChange={(event) =>
              onUpdateRoadColor?.(event.target.value)
            }
            className="h-8 w-12 cursor-pointer rounded border border-slate-200 bg-white disabled:opacity-40"
          />
        </div>

        {/* Clear points only */}
        <button
          type="button"
          onClick={handleClearPoints}
          disabled={!hasRoad || !hasPoints}
          className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear Current Path Points
        </button>

        {/* Delete the entire selected road */}
        <button
          type="button"
          onClick={handleDeleteRoad}
          disabled={!hasRoad}
          className="w-full rounded-lg border border-red-700 bg-red-600 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Delete This Road Path
        </button>

        <p className="text-[10px] leading-relaxed text-slate-500">
          Clear removes points only. Delete removes the entire selected road.
        </p>
      </div>
    </section>
  );
};

export default PathToolsPanel;

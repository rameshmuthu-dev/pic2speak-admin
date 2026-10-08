import React from 'react';

const PathToolsPanel = ({ activeTool, activeRoad, onSetActiveTool, onSetActiveLayer, onDeleteRoad, onUndoLastPoint, onSelectNextPoint, onUpdateRoadWidth, onUpdateRoadDash, onUpdateRoadColor, onClearRoadPoints }) => {
  return (
    <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Path Tools</h3>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          { id: 'Select', icon: '👆', label: 'Select' },
          { id: 'Draw Path', icon: '🛣️', label: 'Draw Path' },
          { id: 'Edit Points', icon: '📌', label: 'Edit Points' },
          { id: 'Delete', icon: '🗑️', label: 'Delete' }
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === 'Delete') {
                if (activeRoad && confirm(`Delete road path "${activeRoad.name || 'Untitled'}"? This cannot be undone.`)) {
                  onDeleteRoad();
                }
                onSetActiveTool('Select');
                return;
              }
              onSetActiveTool(tool.id);
              if (tool.id === 'Draw Path' || tool.id === 'Edit Points') {
                onSetActiveLayer('Roads & Paths');
              }
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-medium transition cursor-pointer ${
              activeTool === tool.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold scale-105'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-sm mb-0.5">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={onUndoLastPoint}
          className="py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold border border-amber-200 transition cursor-pointer flex items-center justify-center gap-1"
        >
          <span>↩️</span> Undo Last Point
        </button>
        <button
          onClick={onSelectNextPoint}
          className="py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold border border-teal-200 transition cursor-pointer flex items-center justify-center gap-1"
        >
          <span>⏭️</span> Next Point
        </button>
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-200">
        <span className="text-[11px] font-bold text-slate-700 uppercase">Road Style & Width</span>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 font-medium">Width: {activeRoad?.width || 40}px</span>
          <input
            type="range"
            min="10"
            max="80"
            value={activeRoad?.width || 40}
            onChange={(e) => {
              const val = Number(e.target.value);
              onUpdateRoadWidth(val);
            }}
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-600 font-medium">Line Style:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateRoadDash([10, 10])}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${activeRoad?.dash ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200'}`}
            >
              Dashed
            </button>
            <button
              onClick={() => onUpdateRoadDash(undefined)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${!activeRoad?.dash ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-700 border-slate-200'}`}
            >
              Solid
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-600 font-medium">Road Color:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeRoad?.color || '#e8cd9e'}
              onChange={(e) => {
                const col = e.target.value;
                onUpdateRoadColor(col);
              }}
              className="w-8 h-6 rounded border cursor-pointer bg-transparent shrink-0"
            />
            <input
              type="text"
              value={activeRoad?.color || '#e8cd9e'}
              onChange={(e) => {
                const col = e.target.value;
                onUpdateRoadColor(col);
              }}
              placeholder="#e8cd9e"
              className="w-20 px-2 py-1 text-[10px] font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <button
          onClick={onClearRoadPoints}
          className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition cursor-pointer"
        >
          Clear Current Path Points
        </button>

        <button
          onClick={() => {
            if (activeRoad && confirm(`Delete road path "${activeRoad.name || 'Untitled'}"? This cannot be undone.`)) {
              onDeleteRoad();
            }
          }}
          className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold border border-red-700 transition cursor-pointer"
        >
          Delete This Road Path
        </button>
      </div>
    </div>
  );
};

export default PathToolsPanel;
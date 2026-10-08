import React from 'react';

const PathPropertiesPanel = ({ activeRoad, selectedPointIndex, onUpdateRoadName, onUpdateRoadWidth, onToggleRoadVisibility, onDeletePoint, onUpdatePoint }) => {
  return (
    <div className="mb-6 p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
      <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-3 flex items-center justify-between">
        <span>🛣️ Path Properties</span>
        <span className="text-[10px] bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full">
          {activeRoad?.points.length / 2 || 0} Points
        </span>
      </h3>

      <div className="space-y-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Path Name</label>
          <input
            type="text"
            value={activeRoad?.name || ''}
            onChange={(e) => {
              const val = e.target.value;
              onUpdateRoadName(val);
            }}
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Road Width</label>
            <input
              type="number"
              value={activeRoad?.width || 40}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateRoadWidth(val);
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Visibility</label>
            <button
              onClick={onToggleRoadVisibility}
              className={`w-full py-1.5 text-xs font-bold rounded-lg border cursor-pointer ${activeRoad?.visible ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-200 text-slate-700'}`}
            >
              {activeRoad?.visible ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {selectedPointIndex !== null && activeRoad?.points[selectedPointIndex * 2] !== undefined && (
          <div className="pt-2 border-t border-teal-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-teal-900">Point #{selectedPointIndex + 1}</span>
              <button
                onClick={onDeletePoint}
                className="px-2 py-0.5 bg-red-500 text-white rounded text-[9px] font-bold cursor-pointer"
              >
                Delete Point
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={Math.round(activeRoad.points[selectedPointIndex * 2])}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdatePoint(selectedPointIndex, 'x', val);
                }}
                className="w-full px-2 py-1 text-xs bg-white border border-teal-200 rounded font-medium text-slate-800"
                placeholder="X"
              />
              <input
                type="number"
                value={Math.round(activeRoad.points[selectedPointIndex * 2 + 1])}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdatePoint(selectedPointIndex, 'y', val);
                }}
                className="w-full px-2 py-1 text-xs bg-white border border-teal-200 rounded font-medium text-slate-800"
                placeholder="Y"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PathPropertiesPanel;

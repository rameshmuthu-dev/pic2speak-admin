import React from 'react';

const MapSettingsPanel = ({ mapTitle, mapActive, onSetMapTitle, onToggleMapActive, onClearAll }) => {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Map Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Map Title</label>
          <input
            type="text"
            value={mapTitle}
            onChange={(e) => onSetMapTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-700">Map Active</span>
          <button onClick={onToggleMapActive} className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${mapActive ? 'bg-teal-600 justify-end' : 'bg-slate-200 justify-start'}`}>
            <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapSettingsPanel;

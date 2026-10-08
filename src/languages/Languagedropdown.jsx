import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLanguages,
  fetchActiveLanguageSetting,
  updateActiveLanguageSetting,
  selectActiveLanguages,
  selectActiveLanguageCode,
  selectLanguagesStatus,
  selectActiveLangSettingStatus,
} from '../redux/slices/Languagesslice';

const LanguageDropdown = ({ onManageClick }) => {
  const dispatch = useDispatch();
  const languages = useSelector(selectActiveLanguages);
  const activeLanguage = useSelector(selectActiveLanguageCode);
  const status = useSelector(selectLanguagesStatus);
  const activeLangStatus = useSelector(selectActiveLangSettingStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLanguages());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (activeLangStatus === 'idle') {
      dispatch(fetchActiveLanguageSetting());
    }
  }, [activeLangStatus, dispatch]);

  const isLoading = status === 'loading' && languages.length === 0;
  const current = languages.find((l) => l.code === activeLanguage);

  const handleChange = (e) => {
    dispatch(updateActiveLanguageSetting(e.target.value));
  };

  if (!isLoading && languages.length === 0) {
    return (
      <button
        type="button"
        onClick={onManageClick}
        className="flex items-center gap-1.5 text-xs font-bold text-teal-700 cursor-pointer whitespace-nowrap"
        title="No languages yet — add your first one to start building content"
      >
        <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">+</span>
        Add Language
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={activeLanguage}
        onChange={handleChange}
        disabled={isLoading}
        className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-teal-500 disabled:opacity-60"
      >
        {isLoading && <option>Loading…</option>}
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} · {lang.name}
          </option>
        ))}
      </select>

      {current?.direction === 'rtl' && (
        <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">RTL</span>
      )}

      <button
        type="button"
        onClick={onManageClick}
        className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 cursor-pointer whitespace-nowrap"
      >
        Manage languages →
      </button>
    </div>
  );
};

export default LanguageDropdown;
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLanguages,
  createLanguage,
  updateLanguage,
  changeLanguageStatus,
  setDefaultLanguage,
  selectAllLanguages,
  selectLanguagesStatus,
  selectLanguagesActionStatus,
  selectLanguagesError,
  clearLanguagesError,
} from '../redux/slices/Languagesslice';

const emptyForm = {
  name: '',
  code: '',
  nativeName: '',
  direction: 'ltr',
  flagUrl: '',
  isActive: true,
};

const StatCard = ({ icon, iconBg, value, label, sub, valueColor = 'text-slate-900' }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${iconBg}`}>
      {icon}
    </div>
    <div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="text-[11px] text-slate-400">{sub}</div>
    </div>
  </div>
);

const LanguageManager = () => {
  const dispatch = useDispatch();
  const languages = useSelector(selectAllLanguages);
  const status = useSelector(selectLanguagesStatus);
  const actionStatus = useSelector(selectLanguagesActionStatus);
  const error = useSelector(selectLanguagesError);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [originalIsActive, setOriginalIsActive] = useState(true);
  const [editingLangIsDefault, setEditingLangIsDefault] = useState(false);

  useEffect(() => {
    dispatch(fetchLanguages('all'));
    return () => dispatch(clearLanguagesError());
  }, [dispatch]);

  const totalLanguages = languages.length;
  const defaultLanguages = languages.filter((l) => l.isDefault).length;
  const activeLanguages = languages.filter((l) => l.isActive).length;

  const filteredLanguages = languages.filter((l) => {
    const matchesSearch =
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName?.toLowerCase().includes(search.toLowerCase()) ||
      l.code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && l.isActive) ||
      (statusFilter === 'inactive' && !l.isActive);
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOriginalIsActive(true);
    setEditingLangIsDefault(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (lang) => {
    setEditingId(lang._id);
    setForm({
      name: lang.name || '',
      code: lang.code || '',
      nativeName: lang.nativeName || '',
      direction: lang.direction || 'ltr',
      flagUrl: lang.flagUrl || '',
      isActive: !!lang.isActive,
    });
    setOriginalIsActive(!!lang.isActive);
    setEditingLangIsDefault(!!lang.isDefault);
    setFormError('');
    setIsModalOpen(true);
  };

  const toggleLocked = editingLangIsDefault && originalIsActive;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.code.trim() || !form.nativeName.trim()) {
      setFormError('Name, Code and Native Name are required.');
      return;
    }
    if (!/^[a-zA-Z-]{2,5}$/.test(form.code.trim())) {
      setFormError('Use a short ISO 639-1 style code, e.g. "hi" or "zh-CN".');
      return;
    }

    if (editingId) {
      const { isActive, ...editableFields } = form;

      const result = await dispatch(
        updateLanguage({
          id: editingId,
          data: editableFields,
          ...editableFields,
        })
      );

      if (result.meta.requestStatus !== 'fulfilled') {
        setFormError(result.payload || 'Something went wrong. Please try again.');
        return;
      }

      if (isActive !== originalIsActive) {
        const statusResult = await dispatch(
          changeLanguageStatus({ id: editingId, isActive })
        );
        if (statusResult.meta.requestStatus !== 'fulfilled') {
          setFormError(
            statusResult.payload || 'Language saved, but status change failed.'
          );
          return;
        }
      }

      await dispatch(fetchLanguages('all'));
      setIsModalOpen(false);
    } else {
      const result = await dispatch(createLanguage(form));
      if (result.meta.requestStatus === 'fulfilled') {
        await dispatch(fetchLanguages('all'));
        setIsModalOpen(false);
      } else {
        setFormError(result.payload || 'Something went wrong. Please try again.');
      }
    }
  };

  const handleToggleStatus = useCallback(
    async (lang) => {
      const result = await dispatch(
        changeLanguageStatus({ id: lang._id, isActive: !lang.isActive })
      );
      if (result.meta.requestStatus === 'rejected') {
        alert(result.payload || 'Could not update status.');
      } else {
        await dispatch(fetchLanguages('all'));
      }
    },
    [dispatch]
  );

  const handleSetDefault = useCallback(
    async (lang) => {
      const result = await dispatch(setDefaultLanguage(lang._id));
      if (result.meta.requestStatus === 'rejected') {
        alert(result.payload || 'Could not set default language.');
      } else {
        await dispatch(fetchLanguages('all'));
      }
    },
    [dispatch]
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Language Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and customize app languages</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer transition"
        >
          + Add Language
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon="🌐" iconBg="bg-emerald-50" value={totalLanguages} label="Total Languages" sub="All languages in the app" />
        <StatCard icon="✅" iconBg="bg-blue-50" value={defaultLanguages} label="Default Languages" sub="Set as default for UI" valueColor="text-blue-600" />
        <StatCard icon="🟢" iconBg="bg-green-50" value={activeLanguages} label="Active Languages" sub="Visible in language picker" valueColor="text-green-600" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-800">All Languages</h2>
          <p className="text-xs text-slate-500 mt-0.5">View and manage all supported languages in the application</p>
        </div>

        <div className="p-5 flex flex-col sm:flex-row gap-3 border-b border-slate-100">
          <input
            type="text"
            placeholder="Search language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && (
          <div className="p-5 text-xs font-semibold text-red-600">{error}</div>
        )}

        {status === 'loading' ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading languages…</div>
        ) : filteredLanguages.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">No languages match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="px-5 py-3 font-semibold">Language</th>
                  <th className="px-5 py-3 font-semibold">Native Name</th>
                  <th className="px-5 py-3 font-semibold">Code</th>
                  <th className="px-5 py-3 font-semibold">Direction</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Default</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLanguages.map((lang) => (
                  <tr key={lang._id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-800 flex items-center gap-2">
                      {lang.flagUrl ? (
                        <img src={lang.flagUrl} alt="" className="w-5 h-4 object-cover rounded-sm" />
                      ) : (
                        <span className="w-5 h-4 rounded-sm bg-slate-100 flex items-center justify-center text-[9px]">🏳️</span>
                      )}
                      {lang.name}
                      {lang.isDefault && (
                        <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">Default</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{lang.nativeName}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono">{lang.code}</td>
                    <td className="px-5 py-3 text-slate-500">{(lang.direction || 'ltr').toUpperCase()}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleStatus(lang)}
                        disabled={lang.isDefault && lang.isActive}
                        title={lang.isDefault && lang.isActive ? 'Default language cannot be deactivated' : ''}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                          lang.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {lang.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      {!lang.isDefault && lang.isActive && (
                        <button
                          onClick={() => handleSetDefault(lang)}
                          className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                        >
                          Set as default
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openEditModal(lang)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold">{editingId ? 'Edit Language' : 'Add New Language'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Language Name (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Hindi"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Native Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., हिंदी"
                  value={form.nativeName}
                  onChange={(e) => setForm({ ...form, nativeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Language Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., hi"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!editingId}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">ISO 639-1 code. Locked after creation.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Text Direction</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="direction"
                      checked={form.direction === 'ltr'}
                      onChange={() => setForm({ ...form, direction: 'ltr' })}
                    />
                    LTR (Left to Right)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="direction"
                      checked={form.direction === 'rtl'}
                      onChange={() => setForm({ ...form, direction: 'rtl' })}
                    />
                    RTL (Right to Left)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Flag URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://…/flag.png"
                  value={form.flagUrl}
                  onChange={(e) => setForm({ ...form, flagUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    {form.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {toggleLocked
                      ? 'Default language cannot be deactivated.'
                      : 'Controls whether this language shows up in picker.'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  disabled={toggleLocked}
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative w-10 h-5 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                    form.isActive ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      form.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {formError && <p className="text-[11px] font-semibold text-red-600">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionStatus === 'loading'}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer disabled:opacity-60"
                >
                  {actionStatus === 'loading' ? 'Saving…' : editingId ? 'Save Changes' : 'Add Language'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageManager;
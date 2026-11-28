import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gamepad2,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Map,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  EyeOff,
  X,
  Save,
  RefreshCw,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Package,
  Upload,
  Link2,
  Loader2,
  ImageOff,
} from 'lucide-react';
import API from '../../api/api';
import Loading from '../../ui/Loading';

// ── Constants ────────────────────────────────────────────────────────────────

const GAME_TYPE_OPTIONS = [
  { value: 'sentence_builder', label: 'Sentence Builder' },
  { value: 'word_match',       label: 'Word Match' },
  { value: 'speed_quiz',       label: 'Speed Quiz' },
  { value: 'story_train',      label: 'Story Train' },
  { value: 'flashcards',       label: 'Flashcards' },
  { value: 'custom',           label: 'Custom' },
];

const EMPTY_FORM = {
  gameKey:         '',
  title:           '',
  description:     '',
  thumbnailUrl:    '',
  gameType:        'sentence_builder',
  usesAdventureMap: false,
  isActive:        true,
  isComingSoon:    false,
  order:           0,
};

const EMPTY_LEVEL_FORM = {
  levelOrder:  0,
  title:       '',
  isActive:    true,
  // payload fields (generic + Story Train specific)
  coachImageUrl: '',
  audioUrl:      '',
  sentences:     '',   // newline-separated; serialised to array on save
  customJson:    '',   // raw JSON escape hatch
};

// ── Small shared UI helpers ───────────────────────────────────────────────────

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-bold text-slate-600 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const TextInput = ({ value, onChange, placeholder, disabled, type = 'text', className = '' }) => (
  <input
    type={type}
    value={value}
    disabled={disabled}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
  />
);

const ErrorBanner = ({ msg }) =>
  msg ? (
    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
      <AlertCircle size={15} className="shrink-0" />
      <span>{msg}</span>
    </div>
  ) : null;

// ── GameConfig Create/Edit Modal ──────────────────────────────────────────────

/**
 * ThumbnailField
 * Dual-mode thumbnail input:
 *   • Tab A — paste an external URL directly
 *   • Tab B — pick a local file, upload instantly to Cloudinary, auto-fill URL
 * Shows a live preview whenever thumbnailUrl is non-empty.
 */
const ThumbnailField = ({ thumbnailUrl, setThumbnailUrl }) => {
  const [mode, setMode]               = useState('url');   // 'url' | 'file'
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef                  = useRef(null);

  // Reset preview broken flag whenever the URL changes
  useEffect(() => { setPreviewError(false); }, [thumbnailUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);
      const res = await API.post('/games/admin/upload-thumbnail', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.url) {
        setThumbnailUrl(res.data.url);
      } else {
        throw new Error(res.data?.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed. Try pasting a URL instead.');
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2.5">
      <FieldLabel>Thumbnail</FieldLabel>

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
            mode === 'url'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Link2 size={13} />
          Paste URL
        </button>
        <button
          type="button"
          onClick={() => { setMode('file'); setUploadError(''); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors ${
            mode === 'file'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Upload size={13} />
          Upload File
        </button>
      </div>

      {/* URL input */}
      {mode === 'url' && (
        <input
          type="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
        />
      )}

      {/* File upload input */}
      {mode === 'file' && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={handleFileChange}
            className="sr-only"
            id="game-thumbnail-file"
          />
          <label
            htmlFor="game-thumbnail-file"
            className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors cursor-pointer ${
              uploading
                ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                : 'border-[#14B8A6]/40 bg-teal-50/40 text-[#14B8A6] hover:bg-teal-50 hover:border-[#14B8A6]'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading to Cloudinary…
              </>
            ) : (
              <>
                <Upload size={16} />
                Choose image (JPEG · PNG · WebP)
              </>
            )}
          </label>
          {uploadError && (
            <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center gap-1">
              <AlertCircle size={12} />
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Live preview */}
      {thumbnailUrl && !uploading && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
          {previewError ? (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff size={24} />
              <span className="text-xs font-semibold">Preview unavailable</span>
            </div>
          ) : (
            <img
              src={thumbnailUrl}
              alt="Thumbnail preview"
              className="w-full h-36 object-cover"
              onError={() => setPreviewError(true)}
            />
          )}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
              Preview
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const GameFormModal = ({ isOpen, editingGameKey, form, setForm, saving, modalError, onClose, onSave }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
            {editingGameKey ? `Edit Game: ${editingGameKey}` : 'Create New Game'}
          </h3>
          <button type="button" onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <ErrorBanner msg={modalError} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* gameKey */}
              <div>
                <FieldLabel required>Game Key</FieldLabel>
                <TextInput
                  value={form.gameKey}
                  disabled={Boolean(editingGameKey)}
                  onChange={(e) => setForm((p) => ({ ...p, gameKey: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  placeholder="e.g. word_match"
                  className="font-mono"
                />
              </div>
              {/* order */}
              <div>
                <FieldLabel>Display Order</FieldLabel>
                <TextInput type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} />
              </div>
            </div>

            {/* title */}
            <div>
              <FieldLabel required>Title</FieldLabel>
              <TextInput value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Word Match" />
            </div>

            {/* description */}
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Short description shown on the Play Hub card..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] resize-none"
              />
            </div>

            {/* ── Dual-mode Thumbnail ── */}
            <ThumbnailField
              thumbnailUrl={form.thumbnailUrl}
              setThumbnailUrl={(url) => setForm((p) => ({ ...p, thumbnailUrl: url }))}
            />

            {/* gameType */}
            <div>
              <FieldLabel>Game Type</FieldLabel>
              <select
                value={form.gameType}
                onChange={(e) => setForm((p) => ({ ...p, gameType: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
              >
                {GAME_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* usesAdventureMap toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-800">Uses Adventure Map</p>
                <p className="text-xs text-slate-500">Pulls lessons and progression from the Adventure Map.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.usesAdventureMap}
                onClick={() => setForm((p) => ({ ...p, usesAdventureMap: !p.usesAdventureMap }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${form.usesAdventureMap ? 'bg-[#14B8A6]' : 'bg-slate-300'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.usesAdventureMap ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Status checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { key: 'isActive',    label: 'Active',       sub: 'Visible in Play Hub',  accent: 'accent-[#14B8A6]' },
                { key: 'isComingSoon', label: 'Coming Soon', sub: 'Show preview badge',   accent: 'accent-amber-500'  },
              ].map(({ key, label, sub, accent }) => (
                <label key={key} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                    className={`w-4 h-4 ${accent} rounded`}
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-800">{label}</span>
                    <span className="block text-[11px] text-slate-500">{sub}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-white border border-slate-200 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-[#14B8A6] text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50">
              <Save size={15} />
              {saving ? 'Saving...' : editingGameKey ? 'Save Changes' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── GameContent Levels Modal ──────────────────────────────────────────────────

/**
 * Builds a payload object from the level form.
 * For Story Train: includes coachImageUrl, audioUrl, sentences[].
 * For anything else: tries to parse customJson, otherwise empty object.
 */
const buildPayload = (levelForm, gameType) => {
  if (gameType === 'story_train') {
    const sentences = levelForm.sentences
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      coachImageUrl: levelForm.coachImageUrl.trim(),
      audioUrl:      levelForm.audioUrl.trim(),
      sentences,
    };
  }

  if (levelForm.customJson.trim()) {
    try {
      return JSON.parse(levelForm.customJson.trim());
    } catch {
      return {};
    }
  }
  return {};
};

/** Flatten a payload back into the level form for editing */
const payloadToForm = (payload = {}, gameType) => {
  if (gameType === 'story_train') {
    return {
      coachImageUrl: payload.coachImageUrl || '',
      audioUrl:      payload.audioUrl      || '',
      sentences:     Array.isArray(payload.sentences) ? payload.sentences.join('\n') : '',
      customJson:    '',
    };
  }
  return {
    coachImageUrl: '',
    audioUrl:      '',
    sentences:     '',
    customJson:    payload && Object.keys(payload).length ? JSON.stringify(payload, null, 2) : '',
  };
};

const LevelFormFields = ({ game, levelForm, setLevelForm }) => {
  const isStoryTrain = game?.gameType === 'story_train';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Level Title</FieldLabel>
          <TextInput value={levelForm.title} onChange={(e) => setLevelForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Coach 1 — Animals" />
        </div>
        <div>
          <FieldLabel>Level Order</FieldLabel>
          <TextInput type="number" value={levelForm.levelOrder} onChange={(e) => setLevelForm((p) => ({ ...p, levelOrder: e.target.value }))} />
        </div>
      </div>

      {isStoryTrain ? (
        <>
          <div>
            <FieldLabel>Coach Image URL</FieldLabel>
            <TextInput type="url" value={levelForm.coachImageUrl} onChange={(e) => setLevelForm((p) => ({ ...p, coachImageUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <FieldLabel>Audio URL</FieldLabel>
            <TextInput type="url" value={levelForm.audioUrl} onChange={(e) => setLevelForm((p) => ({ ...p, audioUrl: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <FieldLabel>Sentences (one per line)</FieldLabel>
            <textarea
              rows={5}
              value={levelForm.sentences}
              onChange={(e) => setLevelForm((p) => ({ ...p, sentences: e.target.value }))}
              placeholder={"The cat sat on the mat.\nShe runs very fast."}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] resize-none font-mono"
            />
          </div>
        </>
      ) : (
        <div>
          <FieldLabel>Custom Payload (JSON)</FieldLabel>
          <textarea
            rows={6}
            value={levelForm.customJson}
            onChange={(e) => setLevelForm((p) => ({ ...p, customJson: e.target.value }))}
            placeholder={'{\n  "key": "value"\n}'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] resize-none"
          />
        </div>
      )}

      <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
        <input
          type="checkbox"
          checked={levelForm.isActive}
          onChange={(e) => setLevelForm((p) => ({ ...p, isActive: e.target.checked }))}
          className="w-4 h-4 accent-[#14B8A6] rounded"
        />
        <div>
          <span className="block text-sm font-bold text-slate-800">Active</span>
          <span className="block text-[11px] text-slate-500">Visible to players</span>
        </div>
      </label>
    </div>
  );
};

const ContentModal = ({ game, onClose }) => {
  const [levels, setLevels]           = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [levelError, setLevelError]   = useState('');
  const [levelFeedback, setLevelFeedback] = useState('');

  const [addingLevel, setAddingLevel]   = useState(false);
  const [editingLevel, setEditingLevel] = useState(null); // level doc
  const [levelForm, setLevelForm]       = useState({ ...EMPTY_LEVEL_FORM });
  const [savingLevel, setSavingLevel]   = useState(false);
  const [levelModalError, setLevelModalError] = useState('');
  const [deletingLevelId, setDeletingLevelId] = useState(null);
  const [expandedLevelId, setExpandedLevelId] = useState(null);

  const fetchLevels = useCallback(async () => {
    setLoadingLevels(true);
    setLevelError('');
    try {
      const res = await API.get(`/games/content/admin/${encodeURIComponent(game.gameKey)}`);
      setLevels(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setLevelError(err.response?.data?.message || 'Failed to load content levels.');
    } finally {
      setLoadingLevels(false);
    }
  }, [game.gameKey]);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const showLevelFeedback = (msg) => {
    setLevelFeedback(msg);
    setTimeout(() => setLevelFeedback((p) => (p === msg ? '' : p)), 3200);
  };

  const openAddLevel = () => {
    setEditingLevel(null);
    setLevelForm({ ...EMPTY_LEVEL_FORM, levelOrder: levels.length + 1 });
    setLevelModalError('');
    setAddingLevel(true);
  };

  const openEditLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({
      levelOrder:   level.levelOrder ?? 0,
      title:        level.title || '',
      isActive:     level.isActive !== false,
      ...payloadToForm(level.payload, game.gameType),
    });
    setLevelModalError('');
    setAddingLevel(true);
  };

  const closeAddLevel = () => {
    if (savingLevel) return;
    setAddingLevel(false);
    setEditingLevel(null);
    setLevelModalError('');
  };

  const handleSaveLevel = async (e) => {
    e.preventDefault();
    setLevelModalError('');
    if (!levelForm.title.trim()) { setLevelModalError('Title is required.'); return; }

    setSavingLevel(true);
    try {
      const payload = buildPayload(levelForm, game.gameType);
      const body = {
        levelOrder: Number(levelForm.levelOrder) || 0,
        title:      levelForm.title.trim(),
        payload,
        isActive:   Boolean(levelForm.isActive),
      };

      if (editingLevel) {
        await API.put(`/games/content/admin/${encodeURIComponent(game.gameKey)}/${editingLevel._id}`, body);
        showLevelFeedback(`Updated "${body.title}".`);
      } else {
        await API.post(`/games/content/admin/${encodeURIComponent(game.gameKey)}`, body);
        showLevelFeedback(`Created "${body.title}".`);
      }
      setAddingLevel(false);
      setEditingLevel(null);
      await fetchLevels();
    } catch (err) {
      setLevelModalError(err.response?.data?.message || 'Failed to save level.');
    } finally {
      setSavingLevel(false);
    }
  };

  const handleDeleteLevel = async (level) => {
    if (!window.confirm(`Delete level "${level.title}"? This cannot be undone.`)) return;
    setDeletingLevelId(level._id);
    setLevelError('');
    try {
      await API.delete(`/games/content/admin/${encodeURIComponent(game.gameKey)}/${level._id}`);
      showLevelFeedback(`Deleted "${level.title}".`);
      await fetchLevels();
    } catch (err) {
      setLevelError(err.response?.data?.message || 'Failed to delete level.');
    } finally {
      setDeletingLevelId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">
              Content Levels — {game.title}
            </h3>
            <code className="text-[11px] text-slate-400 font-mono">{game.gameKey}</code>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddLevel}
              className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <Plus size={15} />
              Add Level
            </button>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Inline Level Form */}
        {addingLevel && (
          <div className="border-b border-slate-100 bg-slate-50/40 px-6 py-5 shrink-0">
            <h4 className="font-black text-slate-700 text-xs uppercase tracking-wider mb-4">
              {editingLevel ? `Edit Level: ${editingLevel.title}` : 'New Level'}
            </h4>
            <form onSubmit={handleSaveLevel}>
              <ErrorBanner msg={levelModalError} />
              <div className="mt-3">
                <LevelFormFields game={game} levelForm={levelForm} setLevelForm={setLevelForm} />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={closeAddLevel} disabled={savingLevel}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 border border-slate-200 hover:bg-white transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={savingLevel}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-[#14B8A6] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  <Save size={14} />
                  {savingLevel ? 'Saving…' : editingLevel ? 'Update Level' : 'Create Level'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Feedback / Error */}
        {(levelFeedback || levelError) && (
          <div className={`mx-6 mt-4 shrink-0 flex items-center gap-2.5 p-3.5 rounded-2xl text-sm font-bold ${levelFeedback ? 'bg-teal-50 border border-teal-200 text-teal-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {levelFeedback ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{levelFeedback || levelError}</span>
          </div>
        )}

        {/* Levels List */}
        <div className="overflow-y-auto flex-1 p-6 space-y-3">
          {loadingLevels ? (
            <div className="py-10 flex justify-center"><Loading message="Loading levels…" /></div>
          ) : levels.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold">
              No content levels yet. Click &ldquo;Add Level&rdquo; to create the first one.
            </div>
          ) : (
            levels.map((level) => {
              const isExpanded = expandedLevelId === level._id;
              return (
                <div key={level._id} className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* Level row */}
                  <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-black text-xs shrink-0">
                        {level.levelOrder}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{level.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {level.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 size={10} />Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                              <EyeOff size={10} />Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedLevelId(isExpanded ? null : level._id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        title={isExpanded ? 'Hide payload' : 'Show payload'}
                      >
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      <button type="button" onClick={() => openEditLevel(level)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#14B8A6]/10 text-slate-600 hover:text-[#14B8A6] transition-colors" title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button type="button" onClick={() => handleDeleteLevel(level)} disabled={deletingLevelId === level._id}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded payload preview */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Payload</p>
                      <pre className="text-xs text-slate-600 font-mono overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(level.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main GamesManager Component ───────────────────────────────────────────────

const GamesManager = () => {
  const [games, setGames]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [feedback, setFeedback]   = useState('');

  // GameConfig create/edit modal
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [editingGameKey, setEditingGameKey] = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [modalError, setModalError]       = useState('');
  const [deletingKey, setDeletingKey]     = useState(null);

  // Content (levels) modal
  const [contentGame, setContentGame] = useState(null); // game object whose levels to manage

  // ── data ──────────────────────────────────────────────────────────────────

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/games/admin/all');
      setGames(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Play Hub games.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback((p) => (p === msg ? '' : p)), 3500);
  };

  // ── GameConfig CRUD ───────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingGameKey(null);
    setForm({ ...EMPTY_FORM, order: games.length + 1 });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (game) => {
    setEditingGameKey(game.gameKey);
    setForm({
      gameKey:          game.gameKey        || '',
      title:            game.title          || '',
      description:      game.description    || '',
      thumbnailUrl:     game.thumbnailUrl   || '',
      gameType:         game.gameType       || 'sentence_builder',
      usesAdventureMap: Boolean(game.usesAdventureMap),
      isActive:         game.isActive !== undefined ? Boolean(game.isActive) : true,
      isComingSoon:     Boolean(game.isComingSoon),
      order:            game.order          ?? 0,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingGameKey(null);
    setModalError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError('');
    const trimmedKey   = form.gameKey.trim().toLowerCase().replace(/\s+/g, '_');
    const trimmedTitle = form.title.trim();
    if (!editingGameKey && !trimmedKey)  { setModalError('Game Key is required (e.g., word_match).'); return; }
    if (!trimmedTitle)                    { setModalError('Title is required.'); return; }

    setSaving(true);
    try {
      const payload = {
        title:            trimmedTitle,
        description:      form.description.trim(),
        thumbnailUrl:     form.thumbnailUrl.trim(),
        gameType:         form.gameType,
        usesAdventureMap: Boolean(form.usesAdventureMap),
        isActive:         Boolean(form.isActive),
        isComingSoon:     Boolean(form.isComingSoon),
        order:            Number(form.order) || 0,
      };
      if (editingGameKey) {
        await API.put(`/games/admin/${encodeURIComponent(editingGameKey)}`, payload);
        showFeedback(`Updated "${trimmedTitle}" successfully.`);
      } else {
        await API.post('/games/admin', { ...payload, gameKey: trimmedKey });
        showFeedback(`Created "${trimmedTitle}" successfully.`);
      }
      setIsModalOpen(false);
      setEditingGameKey(null);
      await fetchGames();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save game configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (game) => {
    if (!game?.gameKey || game.gameKey === 'sentence_builder') return;
    if (!window.confirm(`Delete "${game.title}" (${game.gameKey})? This cannot be undone.`)) return;
    setDeletingKey(game.gameKey);
    setError('');
    try {
      await API.delete(`/games/admin/${encodeURIComponent(game.gameKey)}`);
      showFeedback(`Deleted "${game.title}" successfully.`);
      await fetchGames();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete game.');
    } finally {
      setDeletingKey(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading && games.length === 0) {
    return <Loading message="Loading Play Hub games..." />;
  }

  return (
    <div className="w-full max-w-400 mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6] flex items-center justify-center shrink-0">
            <Gamepad2 size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Play Hub Games Manager</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
              Configure arcade games, display order, Adventure Map integration, and availability.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button type="button" onClick={fetchGames} disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button type="button" onClick={openCreateModal}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
            <Plus size={16} />
            Add Game
          </button>
        </div>
      </div>

      {/* ── Feedback / Error ────────────────────────────────────────────── */}
      {feedback && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-bold">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Games Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-4 px-5 w-20">Order</th>
                <th className="py-4 px-5">Title / Key</th>
                <th className="py-4 px-5">Type</th>
                <th className="py-4 px-5">Map Source</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {games.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No games configured yet. Click &ldquo;Add Game&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                games.map((game) => {
                  const isCore       = game.gameKey === 'sentence_builder';
                  const isStandalone = !game.usesAdventureMap;

                  return (
                    <tr key={game._id || game.gameKey} className="hover:bg-slate-50/60 transition-colors">

                      {/* Order */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-black text-xs">
                          {game.order ?? 0}
                        </span>
                      </td>

                      {/* Title / Key */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {game.thumbnailUrl ? (
                            <img src={game.thumbnailUrl} alt={game.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <Gamepad2 size={20} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-800 truncate">{game.title}</span>
                              {isCore && (
                                <span title="Core system game (protected)" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                                  <ShieldCheck size={11} />Core
                                </span>
                              )}
                            </div>
                            <code className="text-xs text-slate-400 font-mono">{game.gameKey}</code>
                            {game.description && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-xs">{game.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                          {game.gameType || 'sentence_builder'}
                        </span>
                      </td>

                      {/* Map Source */}
                      <td className="py-4 px-5">
                        {game.usesAdventureMap ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold">
                            <Map size={13} />Adventure Map
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                            <Layers size={13} />Standalone
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {game.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                              <CheckCircle2 size={12} />Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-bold">
                              <EyeOff size={12} />Inactive
                            </span>
                          )}
                          {game.isComingSoon && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                              <Clock size={12} />Coming Soon
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Manage Levels — only for standalone games */}
                          {isStandalone && (
                            <button
                              type="button"
                              onClick={() => setContentGame(game)}
                              title="Manage content levels for this game"
                              className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-500 transition-colors"
                            >
                              <ListOrdered size={16} />
                            </button>
                          )}

                          <button type="button" onClick={() => openEditModal(game)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#14B8A6]/10 text-slate-600 hover:text-[#14B8A6] transition-colors" title="Edit game">
                            <Edit3 size={16} />
                          </button>

                          {isCore ? (
                            <button type="button" disabled title="Core 'sentence_builder' game cannot be deleted"
                              className="p-2 rounded-xl bg-slate-50 text-slate-300 cursor-not-allowed">
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button type="button" onClick={() => handleDelete(game)} disabled={deletingKey === game.gameKey}
                              title="Delete game"
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-50">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Standalone games info banner ─────────────────────────────────── */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
        <Package size={16} className="shrink-0 mt-0.5" />
        <span>
          Standalone games (not backed by Adventure Map) show a{' '}
          <ListOrdered size={12} className="inline -mt-0.5" />{' '}
          <strong>Manage Levels</strong> button. Use it to create, edit, and reorder game-specific assets like Story Train coaches, Word Match card sets, or Speed Quiz question banks.
        </span>
      </div>

      {/* ── GameConfig Create / Edit Modal ──────────────────────────────── */}
      <GameFormModal
        isOpen={isModalOpen}
        editingGameKey={editingGameKey}
        form={form}
        setForm={setForm}
        saving={saving}
        modalError={modalError}
        onClose={closeModal}
        onSave={handleSave}
      />

      {/* ── Content Levels Modal ─────────────────────────────────────────── */}
      {contentGame && (
        <ContentModal
          game={contentGame}
          onClose={() => setContentGame(null)}
        />
      )}
    </div>
  );
};

export default GamesManager;

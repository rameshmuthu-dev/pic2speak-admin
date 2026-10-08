import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  fetchLessonMasters,
  createLessonMaster,
  deleteLessonMaster,
  selectAllLessonMasters,
  selectLessonMasterStatus,
  selectLessonMasterActionStatus as selectLessonActionStatus,
} from '../redux/slices/lessonMasterSlice';
import {
  fetchLessonContentsByLesson,
  createLessonContent,
  updateLessonContent,
  selectAllLessonContents,
  selectLessonContentActionStatus,
  selectLessonContentError,
  clearLessonContentError,
  resetLessonContentItems,
} from '../redux/slices/lessonContentSlice';
import {
  fetchLanguages,
  selectActiveLanguages,
} from '../redux/slices/Languagesslice';

const getLangId = (content) =>
  typeof content.languageId === 'object' ? content.languageId?._id : content.languageId;

const LessonContent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const lessons = useSelector(selectAllLessonMasters);
  const lessonsStatus = useSelector(selectLessonMasterStatus);
  const lessonActionStatus = useSelector(selectLessonActionStatus);

  const contentItems = useSelector(selectAllLessonContents);
  const contentActionStatus = useSelector(selectLessonContentActionStatus);
  const contentError = useSelector(selectLessonContentError);

  const languages = useSelector(selectActiveLanguages);

  const [lessonMode, setLessonMode] = useState('new');
  const [selectedLessonId, setSelectedLessonId] = useState('');

  const [orderMode, setOrderMode] = useState('auto');
  const [order, setOrder] = useState('');
  const [completionXP, setCompletionXP] = useState(20);
  const [rewardCoins, setRewardCoins] = useState(10);

  const [contentLanguageId, setContentLanguageId] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [visibility, setVisibility] = useState('visible');
  const [availableFrom, setAvailableFrom] = useState('');
  const [editingContentId, setEditingContentId] = useState(null);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchLessonMasters());
    dispatch(fetchLanguages('active'));
  }, [dispatch]);

  useEffect(() => {
    if (languages.length > 0 && !contentLanguageId) {
      setContentLanguageId(languages[0]._id);
    }
  }, [languages, contentLanguageId]);

  useEffect(() => {
    if (lessonMode === 'existing' && selectedLessonId) {
      dispatch(fetchLessonContentsByLesson(selectedLessonId));
    } else {
      dispatch(resetLessonContentItems());
    }
  }, [lessonMode, selectedLessonId, dispatch]);

  useEffect(() => {
    if (lessonMode !== 'existing' || !selectedLessonId || !contentLanguageId) return;

    const match = contentItems.find((c) => getLangId(c) === contentLanguageId);

    if (match) {
      setEditingContentId(match._id);
      setTitle(match.title || '');
      setStatus(match.status || 'draft');
      setVisibility(match.visibility || 'visible');
      setAvailableFrom(match.availableFrom ? match.availableFrom.substring(0, 10) : '');
    } else {
      setEditingContentId(null);
      setTitle('');
      setStatus('draft');
      setVisibility('visible');
      setAvailableFrom('');
    }
  }, [contentItems, contentLanguageId, lessonMode, selectedLessonId]);

  const currentLastOrder = useMemo(() => {
    if (!lessons.length) return 0;
    return Math.max(...lessons.map((l) => l.order || 0));
  }, [lessons]);

  const nextAutoOrder = currentLastOrder + 1;

  const selectedExistingLesson = useMemo(
    () => lessons.find((l) => l._id === selectedLessonId),
    [lessons, selectedLessonId]
  );

  const switchToNewLessonMode = () => {
    setLessonMode('new');
    setSelectedLessonId('');
    setOrderMode('auto');
    setOrder('');
    setCompletionXP(20);
    setRewardCoins(10);
    setEditingContentId(null);
    setTitle('');
    setStatus('draft');
    setVisibility('visible');
    setAvailableFrom('');
    setFormError('');
  };

  const switchToExistingLessonMode = (id) => {
    setLessonMode('existing');
    setSelectedLessonId(id);
    setFormError('');
  };

  const buildOrderToSubmit = () => (orderMode === 'auto' ? nextAutoOrder : Number(order));

  const handleSubmit = async (e, { publish }) => {
    e.preventDefault();
    setFormError('');
    dispatch(clearLessonContentError());

    if (!title.trim()) {
      setFormError('Lesson Name is required.');
      return;
    }
    if (!contentLanguageId) {
      setFormError('Please select a language for this content.');
      return;
    }

    let targetLessonId = selectedLessonId;

    if (lessonMode === 'new') {
      if (orderMode === 'manual' && (!order || Number(order) < 1)) {
        setFormError('Please choose a valid lesson order.');
        return;
      }

      const orderToSubmit = buildOrderToSubmit();

      const lessonResult = await dispatch(
        createLessonMaster({ order: orderToSubmit, completionXP, rewardCoins })
      );

      if (lessonResult.meta.requestStatus !== 'fulfilled') {
        setFormError(lessonResult.payload || 'Could not create lesson.');
        return;
      }

      targetLessonId = lessonResult.payload._id;
    } else {
      if (!targetLessonId) {
        setFormError('Please select an existing lesson first.');
        return;
      }
    }

    const contentPayload = {
      title: title.trim(),
      status: publish ? 'published' : status,
      visibility,
      availableFrom: availableFrom || null,
    };

    let contentResult;

    if (editingContentId) {
      const updateData = {
        title: contentPayload.title,
        status: contentPayload.status,
        visibility: contentPayload.visibility,
      };

      if (contentPayload.availableFrom) {
        updateData.availableFrom = contentPayload.availableFrom;
      }

      contentResult = await dispatch(updateLessonContent({ id: editingContentId, formData: updateData }));
    } else {
      const createData = {
        lessonMasterId: targetLessonId,
        languageId: contentLanguageId,
        title: contentPayload.title,
        status: contentPayload.status,
        visibility: contentPayload.visibility,
      };

      if (contentPayload.availableFrom) {
        createData.availableFrom = contentPayload.availableFrom;
      }

      contentResult = await dispatch(createLessonContent(createData));
    }

    if (contentResult.meta.requestStatus !== 'fulfilled') {
      if (lessonMode === 'new' && targetLessonId) {
        await dispatch(deleteLessonMaster(targetLessonId));
      }
      setFormError(contentResult.payload || 'Could not save lesson content. Lesson rolled back.');
      toast.error('Failed to save lesson.');
      return;
    }

    toast.success(editingContentId ? 'Lesson updated successfully!' : 'Lesson created successfully!');

    dispatch(fetchLessonMasters());

    if (lessonMode === 'new' && targetLessonId) {
      setLessonMode('existing');
      setSelectedLessonId(targetLessonId);
    }
  };

  const activeLanguageObj = languages.find((l) => l._id === contentLanguageId);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create New Lesson</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dashboard <span className="mx-1">›</span> Lessons <span className="mx-1">›</span> Create New Lesson
          </p>
        </div>
      </div>

      {contentError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {contentError}
        </div>
      )}
      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {formError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Choose a Lesson</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={switchToNewLessonMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
              lessonMode === 'new' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            + New Lesson
          </button>
          <span className="text-xs text-slate-400">or edit an existing lesson's content:</span>
          <select
            value={lessonMode === 'existing' ? selectedLessonId : ''}
            onChange={(e) => switchToExistingLessonMode(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl cursor-pointer"
          >
            <option value="">Select existing lesson</option>
            {lessons.map((l) => (
              <option key={l._id} value={l._id}>Lesson {l.order}</option>
            ))}
          </select>
          {lessonsStatus === 'loading' && (
            <span className="text-[10px] text-slate-400">Loading lessons…</span>
          )}
        </div>
      </div>

      {selectedLessonId && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-teal-900">Next Step: Add Scenes</h3>
            <p className="text-[10px] text-teal-700 mt-0.5">
              This lesson is ready. Now you can add sentences, dialogues, or flashcards for this lesson.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/admin/scenes/create/${selectedLessonId}`)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer whitespace-nowrap"
          >
            Manage Scenes →
          </button>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, { publish: false })}>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h2 className="text-sm font-bold text-slate-800">1. Lesson Information</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content Language</label>
              <select
                value={contentLanguageId}
                onChange={(e) => setContentLanguageId(e.target.value)}
                className="w-full md:w-64 px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang._id} value={lang._id}>{lang.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Name ({activeLanguageObj?.name || 'Language'}) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g., Kitchen"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    {title.length} / 100
                  </span>
                </div>
                {editingContentId && (
                  <p className="text-[10px] text-teal-600 mt-1">Editing existing content for this language.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Order <span className="text-red-500">*</span>
                </label>
                {lessonMode === 'existing' ? (
                  <div className="px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-semibold">
                    Lesson {selectedExistingLesson?.order ?? '-'} (fixed)
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-3 space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="orderMode"
                        checked={orderMode === 'auto'}
                        onChange={() => setOrderMode('auto')}
                        className="mt-0.5"
                      />
                      <span className="text-xs">
                        <span className="font-semibold text-slate-800">Add as next lesson (Auto)</span>
                        <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          This will be lesson <span className="font-bold text-slate-600">{nextAutoOrder}</span>
                        </p>
                      </span>
                    </label>

                    <div className="border-t border-slate-100 pt-3">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="orderMode"
                          checked={orderMode === 'manual'}
                          onChange={() => setOrderMode('manual')}
                          className="mt-0.5"
                        />
                        <span className="text-xs font-semibold text-slate-800">Choose specific order</span>
                      </label>
                      <select
                        disabled={orderMode !== 'manual'}
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        className="w-full mt-2 px-3 py-2 text-xs border border-slate-200 rounded-xl disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                      >
                        <option value="">Select lesson order</option>
                        {Array.from({ length: currentLastOrder + 1 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        Current last lesson order: {currentLastOrder}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-800">2. Lesson Settings</h2>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 rounded-xl cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl cursor-pointer"
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Available From</label>
                <input
                  type="date"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Completion XP {lessonMode === 'existing' && <span className="text-slate-400 font-normal">(lesson-wide)</span>}
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={lessonMode === 'existing'}
                  value={lessonMode === 'existing' ? (selectedExistingLesson?.completionXP ?? 0) : completionXP}
                  onChange={(e) => setCompletionXP(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Reward Coins {lessonMode === 'existing' && <span className="text-slate-400 font-normal">(lesson-wide)</span>}
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={lessonMode === 'existing'}
                  value={lessonMode === 'existing' ? (selectedExistingLesson?.rewardCoins ?? 0) : rewardCoins}
                  onChange={(e) => setRewardCoins(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">3. Summary</h2>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Language</span>
                  <span className="font-semibold text-slate-800">{activeLanguageObj?.name || '-'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Lesson Name</span>
                  <span className="font-semibold text-slate-800">{title || '-'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Lesson Order</span>
                  <span className="font-semibold text-slate-800">
                    {lessonMode === 'existing'
                      ? selectedExistingLesson?.order ?? '-'
                      : orderMode === 'auto'
                        ? `Auto (Next: ${nextAutoOrder})`
                        : order || '-'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Visibility</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${visibility === 'visible' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {visibility === 'visible' ? 'Visible' : 'Hidden'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Available From</span>
                  <span className="font-semibold text-slate-800">{availableFrom || '-'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Completion XP</span>
                  <span className="font-semibold text-amber-500">
                    ⭐ {lessonMode === 'existing' ? (selectedExistingLesson?.completionXP ?? 0) : completionXP}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Reward Coins</span>
                  <span className="font-semibold text-amber-500">
                    🪙 {lessonMode === 'existing' ? (selectedExistingLesson?.rewardCoins ?? 0) : rewardCoins}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            disabled={lessonActionStatus === 'loading' || contentActionStatus === 'loading'}
            onClick={(e) => handleSubmit(e, { publish: false })}
            className="px-5 py-2.5 border border-teal-600 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-50 cursor-pointer disabled:opacity-60"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={lessonActionStatus === 'loading' || contentActionStatus === 'loading'}
            onClick={(e) => handleSubmit(e, { publish: true })}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 cursor-pointer disabled:opacity-60"
          >
            {lessonActionStatus === 'loading' || contentActionStatus === 'loading'
              ? 'Saving…'
              : editingContentId
                ? '+ Update Lesson'
                : '+ Create Lesson'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LessonContent;
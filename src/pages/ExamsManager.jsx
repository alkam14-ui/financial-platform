import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

function ExamsManager({
  teacherId,
  teacherName,
  schoolName,
  directorateName,
  currentGradeName,
  allLessonsDatabase,
  allSemesterLessons,
  onBackToDashboard
}) {
  const mainLessonsArray = allLessonsDatabase || allSemesterLessons || [];
  const examModelsCollectionRef = collection(db, 'examModels');

  const [activeExamType, setActiveExamType] = useState('first');
  const [startLesson, setStartLesson] = useState('');
  const [endLesson, setEndLesson] = useState('');
  const [showGeneratedExamPaper, setShowGeneratedExamPaper] = useState(false);
  const [seeds, setSeeds] = useState({ s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0, s7: 0 });
  const [savedExamModels, setSavedExamModels] = useState([]);
  const [generatedExam, setGeneratedExam] = useState(null);
  const [examDraft, setExamDraft] = useState(null);
  const [editingExam, setEditingExam] = useState(false);
  const [currentExamDocId, setCurrentExamDocId] = useState('');
  const [savingExam, setSavingExam] = useState(false);

  const gradeNamesMap = {
    '7': 'الصف السابع',
    '8': 'الصف الثامن',
    '9': 'الصف التاسع',
    '10': 'الصف العاشر',
    '11': 'الصف الحادي عشر',
    '12': 'الصف الثاني عشر (التوجيهي)'
  };

  const examTypeNames = {
    first: 'امتحان التقويم الأول',
    second: 'امتحان التقويم الثاني',
    final: 'الامتحان النهائي'
  };

  const getInitialGrade = () => {
    const name = String(currentGradeName || '').toLowerCase();
    if (name.includes('سابع') || name.includes('7')) return '7';
    if (name.includes('ثامن') || name.includes('8')) return '8';
    if (name.includes('تاسع') || name.includes('9')) return '9';
    if (name.includes('عاشر') || name.includes('10')) return '10';
    if (name.includes('حادي') || name.includes('11')) return '11';
    if (name.includes('ثاني عشر') || name.includes('12') || name.includes('توجيهي')) return '12';
    return '7';
  };

  const [selectedGrade, setSelectedGrade] = useState(getInitialGrade);
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [examConfig, setExamConfig] = useState({
    mcqCount: 0, mcqMark: 0,
    vocabCount: 0, vocabMark: 0,
    listCount: 0, listMark: 0,
    explainCount: 0, explainMark: 0,
    tfCount: 0, tfMark: 0,
    reasonCount: 0, reasonMark: 0,
    blankCount: 0, blankMark: 0
  });

  const filteredLessons = useMemo(() => {
    if (!mainLessonsArray || !Array.isArray(mainLessonsArray)) return [];

    return mainLessonsArray.filter((lesson) => {
      const lessonGrade = String(
        lesson.grade_id || lesson.grade ||
        (lesson.lesson_id?.includes('g7') ? '7' :
          lesson.lesson_id?.includes('g8') ? '8' :
            lesson.lesson_id?.includes('g9') ? '9' :
              lesson.lesson_id?.includes('g10') ? '10' :
                lesson.lesson_id?.includes('g11') ? '11' :
                  lesson.lesson_id?.includes('g12') ? '12' : '')
      );

      if (lessonGrade !== selectedGrade) return false;
      if (selectedGrade === '12' && selectedSemester === 'both') return true;

      const lessonSem = lesson.semester
        ? String(lesson.semester)
        : (lesson.lesson_id?.includes('_s1_') ? '1' : lesson.lesson_id?.includes('_s2_') ? '2' : '1');

      return lessonSem === selectedSemester;
    });
  }, [mainLessonsArray, selectedGrade, selectedSemester]);

  const totalExamMarks = examConfig.mcqMark + examConfig.vocabMark + examConfig.listMark + examConfig.explainMark + examConfig.tfMark + examConfig.reasonMark + examConfig.blankMark;

  useEffect(() => {
    if (selectedGrade !== '12' && selectedSemester === 'both') {
      setSelectedSemester('1');
    }
  }, [selectedGrade, selectedSemester]);

  useEffect(() => {
    if (filteredLessons.length > 0) {
      setStartLesson(filteredLessons[0].lesson_id);
      setEndLesson(filteredLessons[filteredLessons.length - 1].lesson_id);
    } else {
      setStartLesson('');
      setEndLesson('');
    }
  }, [filteredLessons]);

  useEffect(() => {
    const fetchSavedExamModels = async () => {
      if (!teacherId) {
        setSavedExamModels([]);
        return;
      }

      try {
        const snapshot = await getDocs(query(examModelsCollectionRef, where('teacherId', '==', teacherId)));
        const models = snapshot.docs
          .map((examDoc) => ({ ...examDoc.data(), id: examDoc.id }))
          .sort((a, b) => String(b.createdAtText || '').localeCompare(String(a.createdAtText || '')));
        setSavedExamModels(models);
      } catch (error) {
        console.error('خطأ في جلب نماذج الامتحانات:', error);
      }
    };

    fetchSavedExamModels();
  }, [teacherId]);

  const handleConfigChange = (field, value) => {
    setExamConfig((previous) => ({ ...previous, [field]: parseInt(value) || 0 }));
  };

  const getMarkPerItem = (totalMark, count) => {
    if (count <= 0) return 0;
    const mark = totalMark / count;
    return Number.isInteger(mark) ? mark : mark.toFixed(1);
  };

  const createSection = (type, title, count, totalMark, pool, seedKey, seedSource = seeds) => ({
    type,
    title,
    markPerItem: getMarkPerItem(totalMark, count),
    items: [...Array(count)].map((_, index) => ({
      id: `${type}-${index}`,
      prompt: pool[(index + seedSource[seedKey]) % pool.length].prompt,
      options: pool[(index + seedSource[seedKey]) % pool.length].options || []
    }))
  });

  const buildExamModel = (seedSource = seeds) => {
    const sections = [];
    const pools = {
      mcq: [
        { prompt: 'أي من الآتي يعتبر أقدم الأشكال المالية التاريخية التي مارسها البشر في القديم؟', options: ['أ. النقود الورقية القانونية المطبوعة', 'ب. ظاهرة المقايضة السلعية الصامتة', 'ج. الشيكات البنكية المكتوبة', 'د. العملات والمحافظ الإلكترونية المشفرة'] },
        { prompt: 'تتميز قطع العملات النقدية المعدنية عن الأوراق النقدية بصفة أساسية هي:', options: ['أ. سرعة التلف والتمزق الفوري', 'ب. العمر الطويل والمقاومة الكبيرة للعوامل', 'ج. الاعتماد الكامل على شبكة البلوكتشين', 'د. انعدام القبول المطلق في الأسواق'] }
      ],
      vocab: [
        { prompt: 'المال (Money)' },
        { prompt: 'المقايضة (Barter)' },
        { prompt: 'النقود القانونية' },
        { prompt: 'الائتمان المصرفي' }
      ],
      list: [
        { prompt: 'عدد ثلاثة من أبرز أشكال ومظاهر المال في العصر الحديث المعاصر.' },
        { prompt: 'اذكر ميزات النقود الورقية القانونية الصادرة عن البنك المركزي الأردني.' }
      ],
      explain: [
        { prompt: 'وضح أهمية وجود النقود القانونية في تنظيم التعاملات الاقتصادية.' },
        { prompt: 'اشرح كيف تساعد الثقافة المالية الفرد على اتخاذ قرارات رشيدة.' }
      ],
      tf: [
        { prompt: 'تعد النقود الورقية الحديثة الملموسة جزءاً فرعياً من المظلة الشاملة للمال.' },
        { prompt: 'جميع أشكال المال والعملات بلا استثناء تصدر بقرار مباشر وحصري من البنك المركزي الأردني.' },
        { prompt: 'تعتمد العملات الرقمية المشفرة مثل البيتكوين على تكنولوجيا تسمى سلسلة الكتل البلوكتشين.' }
      ],
      reason: [
        { prompt: 'علل: لا يكفي توفر الدخل وحده لتحقيق الاستقرار المالي.' },
        { prompt: 'علل: تعد المقايضة أقل كفاءة من استخدام النقود في التبادل.' }
      ],
      blank: [
        { prompt: 'يطلق على تبادل سلعة بسلعة أخرى دون استخدام النقود اسم __________.' },
        { prompt: 'الجهة المسؤولة عن إصدار العملة الوطنية في الأردن هي __________.' }
      ]
    };

    if (examConfig.mcqCount > 0) sections.push(createSection('mcq', 'اختر رمز الإجابة الصحيحة في كل مما يأتي', examConfig.mcqCount, examConfig.mcqMark, pools.mcq, 's1', seedSource));
    if (examConfig.vocabCount > 0) sections.push(createSection('vocab', 'عرّف المفاهيم والمصطلحات المالية التالية بدقة', examConfig.vocabCount, examConfig.vocabMark, pools.vocab, 's2', seedSource));
    if (examConfig.listCount > 0) sections.push(createSection('list', 'اذكر / عدد النقاط المطلوبة باختصار', examConfig.listCount, examConfig.listMark, pools.list, 's3', seedSource));
    if (examConfig.explainCount > 0) sections.push(createSection('explain', 'وضح / اشرح العبارات الاقتصادية التالية', examConfig.explainCount, examConfig.explainMark, pools.explain, 's4', seedSource));
    if (examConfig.tfCount > 0) sections.push(createSection('tf', 'ضع إشارة (✓) بجانب العبارة الصحيحة وإشارة (✗) بجانب العبارة غير الصحيحة', examConfig.tfCount, examConfig.tfMark, pools.tf, 's5', seedSource));
    if (examConfig.reasonCount > 0) sections.push(createSection('reason', 'علل لما يأتي واذكر الأسباب', examConfig.reasonCount, examConfig.reasonMark, pools.reason, 's6', seedSource));
    if (examConfig.blankCount > 0) sections.push(createSection('blank', 'أملأ الفراغ بالكلمة والمصطلح المالي المناسب', examConfig.blankCount, examConfig.blankMark, pools.blank, 's7', seedSource));

    return {
      title: `${examTypeNames[activeExamType]} - ${gradeNamesMap[selectedGrade]}`,
      activeExamType,
      selectedGrade,
      selectedSemester,
      totalExamMarks,
      sections,
      createdAtText: new Date().toISOString()
    };
  };

  const handleGenerateExam = () => {
    const model = buildExamModel();
    setGeneratedExam(model);
    setExamDraft(model);
    setCurrentExamDocId('');
    setEditingExam(false);
    setShowGeneratedExamPaper(true);
  };

  const handleRebuildAllExecution = () => {
    const nextSeeds = { s1: seeds.s1 + 1, s2: seeds.s2 + 1, s3: seeds.s3 + 1, s4: seeds.s4 + 1, s5: seeds.s5 + 1, s6: seeds.s6 + 1, s7: seeds.s7 + 1 };
    const model = buildExamModel(nextSeeds);
    setSeeds(nextSeeds);
    setGeneratedExam(model);
    setExamDraft(model);
    setCurrentExamDocId('');
    setEditingExam(false);
    setShowGeneratedExamPaper(true);
  };

  const handleSaveExamModel = async () => {
    const modelToSave = editingExam ? examDraft : generatedExam;
    if (!modelToSave) return;
    if (!teacherId) {
      alert('يرجى تسجيل الدخول قبل حفظ نموذج الامتحان.');
      return;
    }

    try {
      setSavingExam(true);
      const payload = {
        title: modelToSave.title,
        model: modelToSave,
        teacherId,
        teacherName,
        schoolName,
        directorateName,
        createdAtText: new Date().toISOString(),
        createdAt: serverTimestamp()
      };
      const newDoc = await addDoc(examModelsCollectionRef, payload);
      setSavedExamModels([{ ...payload, id: newDoc.id }, ...savedExamModels]);
      setCurrentExamDocId(newDoc.id);
      setGeneratedExam(modelToSave);
      setEditingExam(false);
      alert('تم حفظ نموذج الامتحان في Firebase.');
    } catch (error) {
      console.error('خطأ في حفظ نموذج الامتحان:', error);
      alert('حدث خطأ أثناء حفظ نموذج الامتحان.');
    } finally {
      setSavingExam(false);
    }
  };

  const handleOpenSavedExam = (savedExam) => {
    setGeneratedExam(savedExam.model);
    setExamDraft(savedExam.model);
    setCurrentExamDocId(savedExam.id);
    setSelectedGrade(savedExam.model.selectedGrade || selectedGrade);
    setSelectedSemester(savedExam.model.selectedSemester || selectedSemester);
    setActiveExamType(savedExam.model.activeExamType || activeExamType);
    setEditingExam(false);
    setShowGeneratedExamPaper(true);
  };

  const handleStartExamEdit = () => {
    setExamDraft(JSON.parse(JSON.stringify(generatedExam)));
    setEditingExam(true);
  };

  const handleCancelExamEdit = () => {
    setExamDraft(generatedExam);
    setEditingExam(false);
  };

  const handleSaveExamEdits = async () => {
    try {
      setGeneratedExam(examDraft);
      if (currentExamDocId) {
        await updateDoc(doc(db, 'examModels', currentExamDocId), {
          model: examDraft,
          title: examDraft.title,
          updatedAt: serverTimestamp()
        });
        setSavedExamModels(savedExamModels.map((savedExam) => savedExam.id === currentExamDocId ? { ...savedExam, title: examDraft.title, model: examDraft } : savedExam));
      }
      setEditingExam(false);
    } catch (error) {
      console.error('خطأ في حفظ تعديلات النموذج:', error);
      alert('حدث خطأ أثناء حفظ تعديلات النموذج.');
    }
  };

  const handleDraftPromptChange = (sectionIndex, itemIndex, value) => {
    setExamDraft((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next.sections[sectionIndex].items[itemIndex].prompt = value;
      return next;
    });
  };

  const handleDraftOptionChange = (sectionIndex, itemIndex, optionIndex, value) => {
    setExamDraft((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next.sections[sectionIndex].items[itemIndex].options[optionIndex] = value;
      return next;
    });
  };

  const arabicNumbers = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع'];
  const displayedExam = editingExam ? examDraft : generatedExam;

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif', direction: 'rtl' }} id="printable-exam-sheet-container">
      <div className="no-print" style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '2px solid #0369a1', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={onBackToDashboard} style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '2px solid #0284c7', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', fontFamily: 'Cairo' }}>
            🔙 العودة للوحة التحكم الرئيسية
          </button>
          <h4 style={{ fontSize: '22px', color: '#0369a1', margin: '0', textAlign: 'center', flex: 1 }}>🎯 مركز التقييم والقياس وصياغة الامتحانات الذكية</h4>
          <div style={{ width: '160px' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
          <button onClick={() => { setActiveExamType('first'); setShowGeneratedExamPaper(false); }} style={{ padding: '8px 16px', borderRadius: '8px', border: 0, cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', backgroundColor: activeExamType === 'first' ? '#0284c7' : '#e0f2fe', color: activeExamType === 'first' ? '#fff' : '#0369a1' }}>📝 التقويم الأول</button>
          <button onClick={() => { setActiveExamType('second'); setShowGeneratedExamPaper(false); }} style={{ padding: '8px 16px', borderRadius: '8px', border: 0, cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', backgroundColor: activeExamType === 'second' ? '#0284c7' : '#e0f2fe', color: activeExamType === 'second' ? '#fff' : '#0369a1' }}>📝 التقويم الثاني</button>
          <button onClick={() => { setActiveExamType('final'); setShowGeneratedExamPaper(false); }} style={{ padding: '8px 16px', borderRadius: '8px', border: 0, cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', backgroundColor: activeExamType === 'final' ? '#0369a1' : '#e0f2fe', color: activeExamType === 'final' ? '#fff' : '#0369a1' }}>🎓 الامتحان النهائي</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px', color: '#0369a1' }}>🏫 الصف الدراسي:</label>
            <select value={selectedGrade} onChange={(e) => { setSelectedGrade(e.target.value); setShowGeneratedExamPaper(false); }} style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #0284c7', fontFamily: 'Cairo', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              <option value="7">الصف السابع</option>
              <option value="8">الصف الثامن</option>
              <option value="9">الصف التاسع</option>
              <option value="10">الصف العاشر</option>
              <option value="11">الصف الحادي عشر</option>
              <option value="12">الصف الثاني عشر (التوجيهي)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px', color: '#0369a1' }}>📅 الفصل الدراسي:</label>
            <select value={selectedSemester} onChange={(e) => { setSelectedSemester(e.target.value); setShowGeneratedExamPaper(false); }} style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #0284c7', fontFamily: 'Cairo', backgroundColor: '#fff', cursor: 'pointer' }}>
              <option value="1">الفصل الدراسي الأول</option>
              <option value="2">الفصل الدراسي الثاني</option>
              {selectedGrade === '12' && <option value="both">الفصلين معاً (الدورة الكاملة)</option>}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px' }}>📖 المادة من درس:</label>
            <select value={startLesson} onChange={(e) => setStartLesson(e.target.value)} style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'Cairo', backgroundColor: '#fff' }}>
              {filteredLessons.length > 0 ? filteredLessons.map((lesson) => (<option key={lesson.lesson_id} value={lesson.lesson_id}>{lesson.lesson_title}</option>)) : <option value="">لا توجد دروس متاحة لهذا النطاق</option>}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px' }}>📖 إلى درس:</label>
            <select value={endLesson} onChange={(e) => setEndLesson(e.target.value)} style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'Cairo', backgroundColor: '#fff' }}>
              {filteredLessons.length > 0 ? filteredLessons.map((lesson) => (<option key={lesson.lesson_id} value={lesson.lesson_id}>{lesson.lesson_title}</option>)) : <option value="">لا توجد دروس متاحة لهذا النطاق</option>}
            </select>
          </div>
        </div>

        <table className="exam-setup-table">
          <thead>
            <tr><th>نمط وسؤال الاختبار المتاح</th><th>عدد الفقرات المطلوبة</th><th>العلامة المخصصة للسؤال الكلي</th></tr>
          </thead>
          <tbody>
            <tr><td>1. الاختيار من متعدد (أ، ب، ج، د)</td><td><input type="number" min="0" value={examConfig.mcqCount} onChange={(e) => handleConfigChange('mcqCount', e.target.value)} style={{ width: '70px' }} /> فقرة</td><td><input type="number" min="0" value={examConfig.mcqMark} onChange={(e) => handleConfigChange('mcqMark', e.target.value)} style={{ width: '70px' }} /> علامة</td></tr>
            <tr><td>2. عرّف المفاهيم والمصطلحات المالية التالية</td><td><input type="number" min="0" value={examConfig.vocabCount} onChange={(e) => handleConfigChange('vocabCount', e.target.value)} style={{ width: '70px' }} /> مفاهيم</td><td><input type="number" min="0" value={examConfig.vocabMark} onChange={(e) => handleConfigChange('vocabMark', e.target.value)} style={{ width: '70px' }} /> علامة</td></tr>
            <tr><td>3. اذكر / عدد النقاط المطلوبة باختصار</td><td><input type="number" min="0" value={examConfig.listCount} onChange={(e) => handleConfigChange('listCount', e.target.value)} style={{ width: '70px' }} /> فقرة</td><td><input type="number" min="0" value={examConfig.listMark} onChange={(e) => handleConfigChange('listMark', e.target.value)} style={{ width: '70px' }} /> علامة</td></tr>
            <tr><td>4. وضح / اشرح العبارات الاقتصادية التالية</td><td><input type="number" min="0" value={examConfig.explainCount} onChange={(e) => handleConfigChange('explainCount', e.target.value)} style={{ width: '70px' }} /> فقرة</td><td><input type="number" min="0" value={examConfig.explainMark} onChange={(e) => handleConfigChange('explainMark', e.target.value)} style={{ width: '70px' }} /> علامة</td></tr>
            <tr><td>5. ضع إشارة (✓) بجانب العبارة الصحيحة وإشارة (✗) بجانب الخاطئة</td><td><input type="number" min="0" value={examConfig.tfCount} onChange={(e) => handleConfigChange('tfCount', e.target.value)} style={{ width: '70px' }} /> فقرة</td><td><input type="number" min="0" value={examConfig.tfMark} onChange={(e) => handleConfigChange('tfMark', e.target.value)} style={{ width: '70px' }} /> علامة</td></tr>
            <tr><td>6. علل لما يأتي واذكر الأسباب</td><td><input type="number" min="0" value={examConfig.reasonCount} onChange={(e) => handleConfigChange('reasonCount', e.target.value)} style={{ width: '70px' }} /> فقرة</td><td><input type="number" min="0" value={examConfig.reasonMark} onChange={(e) => handleConfigChange('reasonMark', e.target.value)} style={{ width: '70px' }} /> علامة</td></tr>
            <tr><td>7. أملأ الفراغ بالكلمة والمصطلح المالي المناسب</td><td><input type="number" min="0" value={examConfig.blankCount} onChange={(e) => handleConfigChange('blankCount', e.target.value)} style={{ width: '70px' }} /> فقرة</td><td><input type="number" min="0" value={examConfig.blankMark} onChange={(e) => handleConfigChange('blankMark', e.target.value)} style={{ width: '70px' }} /> علامة</td></tr>
          </tbody>
        </table>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={handleGenerateExam} style={{ backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', border: 0, padding: '12px 28px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Cairo' }}>⚡ صياغة وتوليد ورقة الامتحان الحالية</button>
        </div>

        {savedExamModels.length > 0 && (
          <div style={{ marginTop: '24px', border: '1px solid #bae6fd', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f0f9ff', padding: '12px 16px', color: '#0369a1', fontWeight: '900' }}>النماذج السابقة المحفوظة</div>
            {savedExamModels.map((savedExam) => (
              <button key={savedExam.id} type="button" onClick={() => handleOpenSavedExam(savedExam)} style={{ display: 'block', width: '100%', textAlign: 'right', backgroundColor: currentExamDocId === savedExam.id ? '#e0f2fe' : '#fff', border: 0, borderBottom: '1px solid #e2e8f0', padding: '12px 16px', cursor: 'pointer', fontFamily: 'Cairo', color: '#0f172a' }}>
                <strong>{savedExam.title}</strong>
                <span style={{ display: 'block', color: '#64748b', fontSize: '12px' }}>{savedExam.schoolName || schoolName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showGeneratedExamPaper && displayedExam && (
        <div id="printable-exam-sheet">
          <div className="no-print" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => window.print()} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>🖨️ طباعة ورقة الامتحان</button>
            {!editingExam && <button onClick={handleSaveExamModel} disabled={savingExam} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: savingExam ? 'not-allowed' : 'pointer', fontFamily: 'Cairo' }}>{savingExam ? 'جاري الحفظ...' : 'حفظ النموذج'}</button>}
            {!editingExam && <button onClick={handleStartExamEdit} style={{ backgroundColor: '#f97316', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>تعديل الأسئلة</button>}
            {editingExam && <button onClick={handleSaveExamEdits} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>حفظ التعديلات</button>}
            {editingExam && <button onClick={handleCancelExamEdit} style={{ backgroundColor: '#64748b', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>تراجع</button>}
            {!editingExam && !currentExamDocId && <button onClick={handleRebuildAllExecution} style={{ backgroundColor: '#4b5563', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>🔄 توليد نموذج بديل كامل</button>}
          </div>

          <div className="exam-paper">
            <div className="exam-header">
              <div className="exam-header-right">
                وزارة التربية والتعليم<br />
                مديرية التربية والتعليم: {directorateName}<br />
                اسم المدرسة: {schoolName}
              </div>
              <div className="exam-header-center">
                <strong>{examTypeNames[displayedExam.activeExamType]}</strong>
                <span>مبحث: الثقافة المالية</span>
                <span>{gradeNamesMap[displayedExam.selectedGrade]}</span>
              </div>
              <div className="exam-header-left">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                  <span>الاسم:</span>
                  <span style={{ flex: 1, borderBottom: '1px solid #000', minWidth: '210px', height: '18px' }}></span>
                </div>
                <div>الشعبة: ( &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; )</div>
                <div>العلامة: ( {displayedExam.totalExamMarks} ) علامة</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#000000', marginTop: '20px' }}>
              {displayedExam.sections.map((section, sectionIndex) => (
                <div key={`${section.type}-${sectionIndex}`}>
                  <strong>السؤال {arabicNumbers[sectionIndex] || (sectionIndex + 1)}: {section.title}، لكل فقرة ({section.markPerItem}) علامة:</strong>
                  <ol style={{ margin: '8px 0', paddingRight: '24px', listStyleType: 'none' }}>
                    {section.items.map((item, itemIndex) => (
                      <li key={item.id} style={{ marginBottom: '16px' }}>
                        {editingExam ? (
                          <textarea value={item.prompt} onChange={(event) => handleDraftPromptChange(sectionIndex, itemIndex, event.target.value)} style={{ width: '100%', minHeight: '70px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                        ) : (
                          <span>{section.type === 'tf' ? '(    ) ' : ''}{itemIndex + 1}. {item.prompt}</span>
                        )}

                        {section.type === 'mcq' && (
                          <div>
                            {item.options.map((option, optionIndex) => editingExam ? (
                              <input key={optionIndex} type="text" value={option} onChange={(event) => handleDraftOptionChange(sectionIndex, itemIndex, optionIndex, event.target.value)} style={{ display: 'block', width: '100%', marginTop: '8px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'Cairo' }} />
                            ) : (
                              <span key={optionIndex} className="mcq-option-block">{option}</span>
                            ))}
                          </div>
                        )}

                        {section.type !== 'mcq' && section.type !== 'tf' && !editingExam && (
                          <>
                            <div className="exam-space-line"></div>
                            {(section.type === 'list' || section.type === 'explain' || section.type === 'reason') && <div className="exam-space-line"></div>}
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '50px', fontWeight: 'bold', borderTop: '2px solid #000', paddingTop: '12px', fontSize: '18px' }}>
              مع تمنياتي لكم بالنجاح معلم المادة: {teacherName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamsManager;

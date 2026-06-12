import React, { useEffect, useMemo, useState } from 'react';

const shapesActivitiesPool = [
  "يقسم الصف إلى مجموعات، وتختار كل مجموعة مثالًا من واقعها اليومي لتوضيح فكرة الدرس، ثم تعرضه في دقيقة واحدة.",
  "نشاط عصف ذهني سريع: يكتب الطلاب أكبر عدد ممكن من الأمثلة المرتبطة بمفهوم الدرس، ثم تُصنّف الإجابات على السبورة.",
  "بطاقات المواقف: يقرأ كل فريق موقفًا قصيرًا، ثم يربطه بالمفهوم المناسب من الدرس ويبرر اختياره."
];

const getTemplateValue = (lessonData, key, fallback) => lessonData?.[key] ?? fallback;

const makeQuestionId = (prefix, index) => `${prefix}-${index}`;

const hasItems = (items) => Array.isArray(items) && items.length > 0;

const normalizeLesson = (lessonData) => {
  const templateExplore = getTemplateValue(lessonData, 'استكشف', null);
  const templateLearn = getTemplateValue(lessonData, 'أتعلم', null);
  const templateActivity = getTemplateValue(lessonData, 'نشاط صفي', null);
  const templateAssessment = getTemplateValue(lessonData, 'أقيم تعلمي', null);
  const templateWorksheet = getTemplateValue(lessonData, 'ورقة عمل', null);
  const templateExamBank = getTemplateValue(lessonData, 'أسئلة لبنك الامتحان', null);
  const templateAnswers = getTemplateValue(lessonData, 'الإجابات النموذجية', null);

  const learnSections = [];

  if (templateLearn?.main_idea) {
    learnSections.push({ title: 'الفكرة الرئيسة', content: templateLearn.main_idea });
  }

  if (templateLearn?.sections) {
    learnSections.push(...templateLearn.sections);
  }

  if (templateLearn?.applied_example) {
    const example = templateLearn.applied_example;
    learnSections.push({
      title: example.title || 'تطبيق',
      content: [example.scenario, ...(example.allocation || []).map((item) => `${item.purpose}: ${item.amount}`), example.conclusion].filter(Boolean).join('\n')
    });
  }

  if (!templateLearn && lessonData?.shapes_of_money) {
    learnSections.push({
      title: lessonData.shapes_of_money.title || 'أشكال المال',
      content: lessonData.shapes_of_money.context,
      cards: lessonData.shapes_of_money.types?.map((item) => ({
        title: `${item.number ? `${item.number}. ` : ''}${item.name}`,
        text: item.details
      }))
    });
  }

  if (!templateLearn && lessonData?.critical_distinction) {
    const distinction = lessonData.critical_distinction;
    learnSections.push({
      title: distinction.title || 'مفهوم مهم',
      content: [
        distinction.intro,
        distinction.money_section?.definition,
        ...(distinction.money_section?.examples || []),
        distinction.currency_details?.definition
      ].filter(Boolean).join('\n')
    });
  }

  const classroomActivities = templateActivity
    ? [templateActivity]
    : (lessonData?.classroom_activities || []);

  const assessmentQuestions = templateAssessment?.map((item, index) => ({
    id: item.id || makeQuestionId('assessment', index),
    question_text: item.question,
    model_answer: item.model_answer
  })) || lessonData?.assessment_questions || [];

  const examBank = templateExamBank?.map((item, index) => ({
    id: item.id || makeQuestionId('bank', index),
    type: item.type,
    difficulty: item.difficulty,
    question_text: item.question,
    options: item.options,
    model_answer: item.correct_answer || item.model_answer
  })) || lessonData?.exam_bank_questions || lessonData?.assessment_questions || [];

  return {
    title: lessonData?.lesson_title || 'درس',
    identity: lessonData?.lesson_identity || {},
    duration: lessonData?.duration_minutes || 45,
    outcomes: getTemplateValue(lessonData, 'نتاجات التعلم', lessonData?.learning_outcomes || []),
    explore: {
      title: templateExplore ? 'استكشف' : (lessonData?.exploration_stage?.title || 'استكشف'),
      method: templateExplore?.teacher_move || lessonData?.exploration_stage?.pedagogy_method,
      context: templateExplore?.context,
      prompts: templateExplore?.discussion_prompts || lessonData?.exploration_stage?.prompts || []
    },
    terms: getTemplateValue(lessonData, 'المفاهيم والمصطلحات', lessonData?.core_vocabulary || []),
    learnSections,
    classroomActivities,
    assessmentQuestions,
    worksheet: templateWorksheet || lessonData?.worksheet || null,
    examBank,
    answers: templateAnswers || lessonData?.model_answers || null,
    teacherNotes: getTemplateValue(lessonData, 'ملاحظات المعلم', lessonData?.teacher_notes || []),
    resources: getTemplateValue(lessonData, 'روابط أو ملفات مساعدة', lessonData?.resources || [])
  };
};

const sectionStyle = {
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid #bae6fd'
};

function LessonView({ lessonData, teacherName, onBackToDashboard }) {
  const [showPrepModel, setShowPrepModel] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [classDuration, setClassDuration] = useState(45);
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [showAlternativeActivity, setShowAlternativeActivity] = useState(false);
  const [alternativeActivityIndex, setAlternativeActivityIndex] = useState(0);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  const lesson = useMemo(() => normalizeLesson(lessonData || {}), [lessonData]);

  useEffect(() => {
    const savedData = localStorage.getItem('school_students');
    if (savedData) setAllStudents(JSON.parse(savedData));
  }, []);

  const uniqueGrades = [...new Set(allStudents.map((student) => student.grade))].filter(Boolean);
  const uniqueSections = [...new Set(allStudents.filter((student) => student.grade === selectedGrade).map((student) => student.section))].filter(Boolean);
  const availableStudents = allStudents.filter((student) => student.grade === selectedGrade && student.section === selectedSection);

  useEffect(() => {
    if (uniqueGrades.length > 0 && !uniqueGrades.includes(selectedGrade)) setSelectedGrade(uniqueGrades[0]);
  }, [allStudents, selectedGrade, uniqueGrades]);

  useEffect(() => {
    if (uniqueSections.length > 0 && !uniqueSections.includes(selectedSection)) setSelectedSection(uniqueSections[0]);
  }, [selectedGrade, selectedSection, uniqueSections]);

  const timeAllocation = {
    45: { explore: 5, learn: 20, activities: 10, assessment: 10 },
    35: { explore: 5, learn: 15, activities: 8, assessment: 7 }
  };
  const currentTimes = timeAllocation[classDuration];

  const toggleAnswer = (id) => setVisibleAnswers((previous) => ({ ...previous, [id]: !previous[id] }));

  const handlePickStudent = () => {
    if (availableStudents.length === 0) {
      alert('لا يوجد طلاب مسجلين في هذه الشعبة. يرجى رفع الأسماء من شاشة إدارة الطلاب.');
      return;
    }

    setIsPicking(true);
    setSelectedStudent('جاري السحب...');
    let counter = 0;
    const interval = setInterval(() => {
      const randomName = availableStudents[Math.floor(Math.random() * availableStudents.length)].name;
      setSelectedStudent(randomName);
      counter += 1;
      if (counter > 12) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 100);
  };

  const [prepList, setPrepList] = useState([
    { id: 1, text: 'تحضير المادة العلمية للدرس وعرضها بشكل منظم.', checked: false },
    { id: 2, text: 'تأمين أوراق العمل أو الأنشطة الصفية إن وجدت.', checked: false },
    { id: 3, text: 'كتابة نتاجات التعلم بوضوح على السبورة.', checked: false }
  ]);

  if (showPrepModel) {
    return (
      <div dir="rtl" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Cairo' }}>
        <style>{`
          @media print {
            @page { size: A4 landscape; margin: 5mm; }
            body { background-color: #fff !important; -webkit-print-color-adjust: exact; zoom: 0.85; }
            .no-print { display: none !important; }
            .print-full { width: 100% !important; border: none !important; background: white !important; padding: 0 !important; }
          }
          .editable-cell:focus { outline: 2px solid #0284c7; background-color: #f0f9ff; }
        `}</style>

        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowPrepModel(false)} style={{ backgroundColor: '#f1f5f9', color: '#0369a1', border: '2px solid #cbd5e1', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
            العودة لشرح الدرس
          </button>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => setIsEditingPlan(!isEditingPlan)} style={{ backgroundColor: isEditingPlan ? '#16a34a' : '#f59e0b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
              {isEditingPlan ? 'حفظ التعديلات' : 'تفعيل التعديل على الخطة'}
            </button>
            <button onClick={() => window.print()} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
              طباعة الخطة
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <aside className="no-print" style={{ width: '25%', backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', position: 'sticky', top: '20px' }}>
            <strong style={{ fontSize: '16px', color: '#0369a1', display: 'block', marginBottom: '16px', borderBottom: '2px solid #f0f9ff', paddingBottom: '8px' }}>مهام التحضير السريع:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prepList.map((item) => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14.5px', color: '#4a5568', cursor: 'pointer', lineHeight: '1.5' }}>
                  <input type="checkbox" checked={item.checked} onChange={() => setPrepList(prepList.map((task) => task.id === item.id ? { ...task, checked: !task.checked } : task))} style={{ marginTop: '4px', cursor: 'pointer', transform: 'scale(1.2)' }} />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          </aside>

          <main className="print-full" style={{ width: '75%', backgroundColor: '#ffffff', border: '2px solid #0f172a', padding: '32px', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', margin: '0 0 24px', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>خطة التخطيط اليومي للدرس</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '24px', fontSize: '15px' }}>
              <tbody>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', width: '15%', backgroundColor: '#f1f5f9' }}>المبحث:</th>
                  <td style={{ padding: '8px', border: '1px solid #000', width: '35%' }}>{lesson.identity.subject || 'الثقافة المالية'}</td>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', width: '15%', backgroundColor: '#f1f5f9' }}>موضوع الدرس:</th>
                  <td style={{ padding: '8px', border: '1px solid #000', width: '35%' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>{lesson.title}</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', backgroundColor: '#f1f5f9' }}>الصف/المستوى:</th>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>{lesson.identity.grade || 'الصف السابع'}</td>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', backgroundColor: '#f1f5f9' }}>زمن الحصة:</th>
                  <td style={{ padding: '8px', border: '1px solid #000' }}>{classDuration} دقيقة</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', backgroundColor: '#f1f5f9' }}>النتاجات المستهدفة:</th>
                  <td colSpan="3" style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>
                    <ul style={{ margin: 0, paddingRight: '20px' }}>
                      {lesson.outcomes.map((outcome, index) => <li key={index}>{outcome}</li>)}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '8px', border: '1px solid #000' }}>مرحلة الحصة</th>
                  <th style={{ padding: '8px', border: '1px solid #000' }}>دور المعلم</th>
                  <th style={{ padding: '8px', border: '1px solid #000' }}>دور المتعلم</th>
                  <th style={{ padding: '8px', border: '1px solid #000' }}>الزمن</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['استكشف', 'تهيئة المتعلمين وطرح أسئلة تستدعي الخبرات السابقة.', 'يستمع ويشارك في الحوار ويقدم أمثلة من واقعه.', currentTimes.explore],
                  ['أتعلم', 'عرض المفاهيم الرئيسة وتنظيمها وربطها بالأمثلة.', 'يقرأ ويناقش ويدون الملاحظات ويقارن بين المفاهيم.', currentTimes.learn],
                  ['أنشطة وتطبيق', 'إدارة النشاط أو ورقة العمل وتوجيه العمل الفردي أو الجماعي.', 'ينفذ المهمة ويتعاون مع زملائه ويعرض نتائجه.', currentTimes.activities],
                  ['أقيم تعلمي', 'طرح أسئلة التقويم ومناقشة الإجابات النموذجية عند الحاجة.', 'يجيب ويفسر ويصحح فهمه في ضوء التغذية الراجعة.', currentTimes.assessment]
                ].map(([stage, teacherRole, learnerRole, minutes]) => (
                  <tr key={stage}>
                    <td style={{ padding: '8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>{stage}</td>
                    <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>{teacherRole}</td>
                    <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>{learnerRole}</td>
                    <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{minutes} دقائق</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Cairo, sans-serif', color: '#1e293b' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: #fff !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '18px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0369a1', fontSize: '26px', fontWeight: '900' }}>{lesson.title}</h2>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontWeight: 'bold' }}>{lesson.identity.subject || 'الثقافة المالية'} | {lesson.identity.grade || 'الصف السابع'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#334155' }}>
            زمن الحصة:
            <select value={classDuration} onChange={(event) => setClassDuration(Number(event.target.value))} style={{ padding: '9px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: 'Cairo', fontWeight: 'bold' }}>
              <option value={45}>45 دقيقة</option>
              <option value={35}>35 دقيقة</option>
            </select>
          </label>
          <button onClick={() => setShowPrepModel(true)} style={{ backgroundColor: '#f59e0b', color: '#fff', border: 0, padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
            خطة الدرس
          </button>
          <button onClick={() => window.print()} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
            طباعة
          </button>
          <button onClick={onBackToDashboard} style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '2px solid #bae6fd', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
            العودة للوحة التحكم
          </button>
        </div>
      </div>

      <section style={{ ...sectionStyle, borderRight: '5px solid #0369a1' }}>
        <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px', fontWeight: 'bold' }}>نتاجات التعلم</h3>
        {hasItems(lesson.outcomes) ? (
          <ul style={{ margin: 0, paddingRight: '20px', lineHeight: 1.9 }}>
            {lesson.outcomes.map((outcome, index) => <li key={index}>{outcome}</li>)}
          </ul>
        ) : <p style={{ color: '#64748b', margin: 0 }}>لم ترفق نتاجات تعلم لهذا الدرس بعد.</p>}
      </section>

      <section style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '8px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '20px', color: '#0369a1', margin: 0, fontWeight: 'bold' }}>استكشف</h3>
          <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>{currentTimes.explore} دقائق</span>
        </div>
        {lesson.explore.method && (
          <p style={{ fontSize: '14.5px', color: '#059669', margin: '0 0 10px', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
            <strong>الإجراء: </strong>{lesson.explore.method}
          </p>
        )}
        {lesson.explore.context && <p style={{ lineHeight: 1.9, whiteSpace: 'pre-line', marginTop: 0 }}>{lesson.explore.context}</p>}
        {hasItems(lesson.explore.prompts) && (
          <ul style={{ margin: 0, paddingRight: '20px', lineHeight: 1.8 }}>
            {lesson.explore.prompts.map((prompt, index) => <li key={index}>{prompt}</li>)}
          </ul>
        )}
      </section>

      <section style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', color: '#0369a1', margin: 0, fontWeight: 'bold' }}>أتعلم</h3>
          <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>{currentTimes.learn} دقيقة</span>
        </div>

        {hasItems(lesson.terms) && (
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ margin: '0 0 10px', color: '#0f766e' }}>المفاهيم والمصطلحات</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {lesson.terms.map((term, index) => (
                <div key={`${term.term}-${index}`} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', borderRight: '4px solid #27ae60' }}>
                  <strong style={{ color: '#27ae60', display: 'block', marginBottom: '6px' }}>{term.term}</strong>
                  <p style={{ margin: 0, lineHeight: 1.7 }}>{term.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasItems(lesson.learnSections) ? lesson.learnSections.map((section, index) => (
          <article key={`${section.title}-${index}`} style={{ borderTop: index ? '1px solid #e2e8f0' : 0, paddingTop: index ? '16px' : 0, marginTop: index ? '16px' : 0 }}>
            <h4 style={{ margin: '0 0 10px', color: '#0369a1', fontSize: '18px' }}>{section.title}</h4>
            {section.content && <p style={{ lineHeight: 1.9, margin: 0, whiteSpace: 'pre-line' }}>{section.content}</p>}
            {hasItems(section.cards) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '12px' }}>
                {section.cards.map((card, cardIndex) => (
                  <div key={`${card.title}-${cardIndex}`} style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
                    <strong style={{ color: '#0369a1' }}>{card.title}</strong>
                    <p style={{ margin: '6px 0 0', lineHeight: 1.6 }}>{card.text}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        )) : <p style={{ color: '#64748b', margin: 0 }}>لم يرفق محتوى هذا القسم بعد.</p>}
      </section>

      <section style={{ ...sectionStyle, backgroundColor: '#f0fdfa', border: '2px solid #ccfbf1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '20px', color: '#0f766e', margin: 0, fontWeight: 'bold' }}>نشاط صفي</h3>
          <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '6px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>{currentTimes.activities} دقائق</span>
        </div>
        {hasItems(lesson.classroomActivities) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {lesson.classroomActivities.map((activity, index) => (
              <div key={`${activity.title}-${index}`} style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #99f6e4' }}>
                <h4 style={{ margin: '0 0 10px', color: '#115e59' }}>{activity.title}</h4>
                {activity.objective && <p style={{ margin: '0 0 10px', fontWeight: 'bold' }}>{activity.objective}</p>}
                <ul style={{ paddingRight: '20px', margin: 0, lineHeight: 1.8 }}>
                  {(activity.steps || []).map((step, stepIndex) => <li key={stepIndex}>{step}</li>)}
                </ul>
              </div>
            ))}
          </div>
        ) : <p style={{ color: '#64748b', margin: 0 }}>لم يرفق نشاط صفي لهذا الدرس بعد.</p>}

        <div className="no-print" style={{ borderTop: '1px dashed #99f6e4', paddingTop: '14px', marginTop: '16px' }}>
          <button onClick={() => { setShowAlternativeActivity(!showAlternativeActivity); if (!showAlternativeActivity) setAlternativeActivityIndex((previous) => (previous + 1) % shapesActivitiesPool.length); }} style={{ backgroundColor: '#f1f5f9', color: '#0369a1', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
            {showAlternativeActivity ? 'إخفاء نشاط بديل' : 'إظهار نشاط بديل'}
          </button>
          {showAlternativeActivity && (
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #2563eb', marginTop: '10px' }}>
              {shapesActivitiesPool[alternativeActivityIndex]}
            </div>
          )}
        </div>
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 16px', fontWeight: 'bold' }}>أقيم تعلمي</h3>
        {hasItems(lesson.assessmentQuestions) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {lesson.assessmentQuestions.map((question, index) => (
              <div key={question.id || index} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, lineHeight: 1.8, fontWeight: 'bold', whiteSpace: 'pre-line' }}>{question.question_text}</p>
              </div>
            ))}
          </div>
        ) : <p style={{ color: '#64748b', margin: 0 }}>لم ترفق أسئلة تقويم لهذا الدرس بعد.</p>}
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontSize: '20px', color: '#0891b2', margin: '0 0 16px', fontWeight: 'bold' }}>ورقة عمل</h3>
        {lesson.worksheet ? (
          <>
            {lesson.worksheet.student_instructions && <p style={{ lineHeight: 1.8 }}>{lesson.worksheet.student_instructions}</p>}
            {(lesson.worksheet.questions || []).map((question, index) => (
              <div key={`${question.prompt}-${index}`} style={{ borderTop: index ? '1px solid #e2e8f0' : 0, paddingTop: index ? '12px' : 0, marginTop: index ? '12px' : 0 }}>
                <strong>{question.type}</strong>
                <p style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>{question.prompt}</p>
              </div>
            ))}
          </>
        ) : <p style={{ color: '#64748b', margin: 0 }}>لم ترفق ورقة عمل لهذا الدرس بعد.</p>}
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontSize: '20px', color: '#9333ea', margin: '0 0 16px', fontWeight: 'bold' }}>أسئلة بنك الامتحان</h3>
        {hasItems(lesson.examBank) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {lesson.examBank.map((question, index) => {
              const questionId = question.id || makeQuestionId('bank', index);
              return (
                <div key={questionId} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 8px', color: '#64748b', fontWeight: 'bold' }}>{[question.type, question.difficulty].filter(Boolean).join(' | ')}</p>
                  <p style={{ margin: 0, lineHeight: 1.8, fontWeight: 'bold', whiteSpace: 'pre-line' }}>{question.question_text}</p>
                  {hasItems(question.options) && (
                    <ul style={{ margin: '10px 0 0', paddingRight: '20px', lineHeight: 1.8 }}>
                      {question.options.map((option, optionIndex) => <li key={optionIndex}>{option}</li>)}
                    </ul>
                  )}
                  {question.model_answer && (
                    <div style={{ marginTop: '14px' }}>
                      <button onClick={() => toggleAnswer(questionId)} style={{ backgroundColor: visibleAnswers[questionId] ? '#f1f5f9' : '#e0f2fe', color: visibleAnswers[questionId] ? '#475569' : '#0284c7', border: '1px solid #bae6fd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
                        {visibleAnswers[questionId] ? 'إخفاء الإجابة النموذجية' : 'إظهار الإجابة النموذجية'}
                      </button>
                      {visibleAnswers[questionId] && (
                        <div style={{ marginTop: '12px', padding: '14px', backgroundColor: '#ecfdf5', borderRight: '4px solid #10b981', borderRadius: '8px', lineHeight: 1.8 }}>
                          {question.model_answer}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : <p style={{ color: '#64748b', margin: 0 }}>لم ترفق أسئلة بنك امتحان لهذا الدرس بعد.</p>}
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontSize: '20px', color: '#475569', margin: '0 0 16px', fontWeight: 'bold' }}>ملاحظات المعلم</h3>
        {hasItems(lesson.teacherNotes) ? (
          <ul style={{ margin: 0, paddingRight: '20px', lineHeight: 1.8 }}>
            {lesson.teacherNotes.map((note, index) => <li key={index}>{note}</li>)}
          </ul>
        ) : <p style={{ color: '#64748b', margin: 0 }}>لا توجد ملاحظات مرفقة لهذا الدرس بعد.</p>}
      </section>

      <section style={sectionStyle}>
        <h3 style={{ fontSize: '20px', color: '#0e7490', margin: '0 0 16px', fontWeight: 'bold' }}>روابط أو ملفات مساعدة</h3>
        {hasItems(lesson.resources) ? (
          <ul style={{ margin: 0, paddingRight: '20px', lineHeight: 1.8 }}>
            {lesson.resources.map((resource, index) => <li key={index}>{resource.title || resource.name || resource.url || resource}</li>)}
          </ul>
        ) : <p style={{ color: '#64748b', margin: 0 }}>لا توجد روابط أو ملفات مساعدة مرفقة لهذا الدرس بعد.</p>}
      </section>

      <section className="no-print" style={{ ...sectionStyle, border: '2px solid #0284c7' }}>
        <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 14px', fontWeight: 'bold' }}>محرك القرعة والمشاركة العشوائية</h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '18px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>الصف الدراسي:</label>
            <select value={selectedGrade} onChange={(event) => setSelectedGrade(event.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }}>
              <option value="">اختر..</option>
              {uniqueGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>الشعبة:</label>
            <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }}>
              <option value="">اختر..</option>
              {uniqueSections.map((section) => <option key={section} value={section}>{section}</option>)}
            </select>
          </div>
          <button onClick={handlePickStudent} disabled={isPicking} style={{ flex: '1 1 220px', backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo', opacity: isPicking ? 0.7 : 1 }}>
            {isPicking ? 'جاري تدوير الأسماء...' : 'سحب طالب عشوائي من الشعبة'}
          </button>
        </div>
        <div style={{ backgroundColor: '#f8fafc', border: '2px dashed #bae6fd', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '22px', fontWeight: '900', color: isPicking ? '#0284c7' : '#0f172a', minHeight: '34px' }}>
          {selectedStudent || 'اضغط على الزر لسحب اسم طالب'}
        </div>
      </section>
    </div>
  );
}

export default LessonView;

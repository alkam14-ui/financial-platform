import React, { useState, useEffect } from 'react';

// مخزن الأنشطة البديلة
const shapesActivitiesPool = [
  "يقسم الصف إلى 6 مجموعات، تمثل كل منها حقبة تاريخية (المقايصة، النقود الورقية، العملات الرقمية). تقنع كل مجموعة البقية بقبول وسيلتها لشراء 'علبة ماء'.",
  "تحدي 'مزاد المقاعد الصامت': يحاول الطلاب مقايضة أشيائهم الخاصة دون التحدث لمدة دقيقتين، ثم نناقش الصعوبة لاستنتاج أهمية النقود.",
  "نشاط 'تتبع رحلة الدينار': وقوف 3 طلاب لتمثيل (المشتري، التاجر، البنك)، ومحاكاة انتقال الأوراق المالية إلكترونياً وورقياً."
];

const distinctionActivitiesPool = [
  "لعبة مظلة المال الكبرى: نرسم دائرة عملاقة على السبورة، ونكتب خارجها أصولاً (ذهب، شيك، دينار). ندخل الأصول التي تصلح كمال داخلها، لتوضيح المفهوم الأشمل.",
  "نشاط 'محكمة المصطلحات': طالب يدافع عن مفهوم 'المال' وآخر عن 'النقود'، وبقية الصف لفرز الأوراق المالية كقضاة.",
  "تحدي 'خزنة البطاقات': نعرض رسمة لبطاقة صراف، وندير عصفاً ذهنياً لاستنتاج هل الرصيد الرقمي يمثل مالاً أم نقداً قانونياً."
];

function LessonView({ lessonData, teacherName, onBackToDashboard }) {
  const [showPrepModel, setShowPrepModel] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [classDuration, setClassDuration] = useState(45); 
  
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [showShapesAct, setShowShapesAct] = useState(false);
  const [shapesActIndex, setShapesActIndex] = useState(0);
  const [showDistinctionAct, setShowDistinctionAct] = useState(false);
  const [distinctionActIndex, setDistinctionActIndex] = useState(0);

  const [allStudents, setAllStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('school_students');
    if (savedData) setAllStudents(JSON.parse(savedData));
  }, []);

  const uniqueGrades = [...new Set(allStudents.map(s => s.grade))].filter(Boolean);
  const uniqueSections = [...new Set(allStudents.filter(s => s.grade === selectedGrade).map(s => s.section))].filter(Boolean);
  const availableStudents = allStudents.filter(s => s.grade === selectedGrade && s.section === selectedSection);

  useEffect(() => {
    if (uniqueGrades.length > 0 && !uniqueGrades.includes(selectedGrade)) setSelectedGrade(uniqueGrades[0]);
  }, [allStudents, uniqueGrades, selectedGrade]);

  useEffect(() => {
    if (uniqueSections.length > 0 && !uniqueSections.includes(selectedSection)) setSelectedSection(uniqueSections[0]);
  }, [selectedGrade, uniqueSections, selectedSection]);

  const toggleAnswer = (id) => setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const handlePickStudent = () => {
    if (availableStudents.length === 0) {
      alert("لا يوجد طلاب مسجلين في هذه الشعبة. يرجى رفع الأسماء من شاشة إدارة الطلاب.");
      return;
    }
    setIsPicking(true);
    setSelectedStudent('جاري السحب...');
    let counter = 0;
    const interval = setInterval(() => {
      const randomName = availableStudents[Math.floor(Math.random() * availableStudents.length)].name;
      setSelectedStudent(randomName);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 100);
  };

  const [prepList, setPrepList] = useState([
    { id: 1, text: "تحضير المادة العلمية للدرس وعرضها بشكل منظم.", checked: false },
    { id: 2, text: "تأمين أوراق العمل المطبوعة للأنشطة الصفية.", checked: false },
    { id: 3, text: "كتابة الأهداف التعليمية للدرس بوضوح على السبورة.", checked: false }
  ]);

  const timeAllocation = {
    45: { explore: 5, concepts: 10, shapes: 10, distinction: 5, activities: 15 },
    35: { explore: 5, concepts: 5, shapes: 10, distinction: 5, activities: 10 }
  };
  const currentTimes = timeAllocation[classDuration];

  // --------------------------------------------------------------------------------
  // شاشة خطة الدرس اليومية
  // --------------------------------------------------------------------------------
  if (showPrepModel) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Cairo' }}>
        
        {/* ستايل الطباعة القوي لحصر الخطة في صفحة واحدة */}
        <style>{`
          @media print {
            @page {
              size: A4 landscape; /* الوضع العرضي */
              margin: 5mm; /* هوامش ضيقة جداً لتوفير المساحة */
            }
            body { 
              background-color: #fff !important; 
              -webkit-print-color-adjust: exact; 
              zoom: 0.85; /* تصغير الصفحة بأكملها لضمان حصرها في صفحة واحدة */
            }
            .no-print { display: none !important; }
            .print-full { 
              width: 100% !important; 
              border: none !important; 
              background: white !important; 
              padding: 0 !important;
            }
            /* تصغير الخطوط والمسافات الداخلية لتقليص الارتفاع */
            h2 { font-size: 18px !important; margin: 0 0 6px 0 !important; }
            h3 { font-size: 15px !important; margin: 8px 0 4px 0 !important; border-bottom: 1px solid #000 !important; padding-bottom: 2px !important;}
            table { font-size: 11.5px !important; margin-bottom: 8px !important; }
            th, td { padding: 4px 6px !important; line-height: 1.3 !important; }
            ul { margin-bottom: 0 !important; padding-right: 15px !important; }
            .editable-cell { border: none !important; outline: none !important; background: transparent !important; }
            /* تصغير مساحات التأمل الذاتي */
            .reflection-box { padding: 8px !important; line-height: 1.8 !important; margin-top: 4px !important; }
          }
          .editable-cell:focus { outline: 2px solid #0284c7; background-color: #f0f9ff; }
        `}</style>
        
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <button onClick={() => setShowPrepModel(false)} style={{ backgroundColor: '#f1f5f9', color: '#0369a1', border: '2px solid #cbd5e1', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
            🔙 العودة لشرح الدرس
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setIsEditingPlan(!isEditingPlan)} style={{ backgroundColor: isEditingPlan ? '#16a34a' : '#f59e0b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
              {isEditingPlan ? '💾 إنهاء التعديلات' : '✏️ تفعيل التعديل على الخطة'}
            </button>
            <button onClick={() => window.print()} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
              🖨️ طباعة الخطة
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div className="no-print" style={{ width: '25%', backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1', position: 'sticky', top: '20px' }}>
            <strong style={{ fontSize: '16px', color: '#0369a1', display: 'block', marginBottom: '16px', borderBottom: '2px solid #f0f9ff', paddingBottom: '8px' }}>📋 مهام التحضير السريع:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prepList.map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14.5px', color: '#4a5568', cursor: 'pointer', lineHeight: '1.5' }}>
                  <input type="checkbox" checked={item.checked} onChange={() => setPrepList(prepList.map(p => p.id === item.id ? { ...p, checked: !p.checked } : p))} style={{ marginTop: '4px', cursor: 'pointer', transform: 'scale(1.2)' }} />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="print-full" style={{ width: '75%', backgroundColor: '#ffffff', border: '2px solid #0f172a', padding: '32px', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', margin: '0 0 24px 0', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>خطة التخطيط اليومي للدروس</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '24px', fontSize: '15px' }}>
              <tbody>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', width: '15%', backgroundColor: '#f1f5f9' }}>المبحث:</th>
                  <td style={{ padding: '8px', border: '1px solid #000', width: '35%' }}>الثقافة المالية</td>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', width: '15%', backgroundColor: '#f1f5f9' }}>موضوع الدرس:</th>
                  <td style={{ padding: '8px', border: '1px solid #000', width: '35%' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>{lessonData?.lesson_title}</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', backgroundColor: '#f1f5f9' }}>الصف/المستوى:</th>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>السابع الأساسي</td>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', backgroundColor: '#f1f5f9' }}>زمن الحصة:</th>
                  <td style={{ padding: '8px', border: '1px solid #000' }}>{classDuration} دقيقة</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', backgroundColor: '#f1f5f9' }}>التعلم القبلي:</th>
                  <td colSpan="3" style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>تحديد الفجوات المعرفية وربط خبرات الطلاب بممارساتهم المالية اليومية.</td>
                </tr>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'right', backgroundColor: '#f1f5f9' }}>النتاجات المستهدفة:</th>
                  <td colSpan="3" style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>
                    <ul style={{ margin: 0, paddingRight: '20px' }}>
                      {lessonData?.learning_outcomes?.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '24px', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '8px', border: '1px solid #000', width: '15%' }}>مراحل الحصة</th>
                  <th style={{ padding: '8px', border: '1px solid #000', width: '35%' }}>دور المعلم (Teacher)</th>
                  <th style={{ padding: '8px', border: '1px solid #000', width: '35%' }}>دور المتعلم (Learner)</th>
                  <th style={{ padding: '8px', border: '1px solid #000', width: '15%' }}>الزمن المقترح</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>التهيئة والاندماج</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>طرح أسئلة عصف ذهني تمهيدية موجهة لاستدراج المعارف السابقة.</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>يستمع بانتباه، يستحضر خبراته، ويشارك في نقاش حواري.</td>
                  <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{currentTimes.explore} دقائق</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>الشرح وبناء المفاهيم</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>شرح المفاهيم وتدوينها على السبورة مع ضرب أمثلة من واقع الطلاب.</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>يناقش المصطلحات، يسجل الملاحظات، ويدرك الفروق الجوهرية.</td>
                  <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{currentTimes.concepts + currentTimes.shapes + currentTimes.distinction} دقيقة</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>التوسع والأنشطة</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>توجيه المجموعات لتنفيذ الأنشطة التعاونية وتوزيع الأدوار وتيسير العمل.</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>يعمل بروح الفريق، ينجز المهام الموكلة إليه ضمن النشاط.</td>
                  <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{currentTimes.activities} دقيقة</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px', border: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>تأكيد التعلم (التقويم)</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>مراجعة شاملة وتكليف الطلاب بحل أسئلة (أقيم تعلمي).</td>
                  <td style={{ padding: '8px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>يتأمل في تعلمه، يثبت حلول الأسئلة، ويقيم فهمه للدرس.</td>
                  <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>ختامي</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
              <div>
                <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', borderBottom: '2px solid #0f172a', paddingBottom: '4px', display: 'inline-block' }}>جدول متابعة التنفيذ:</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '6px', border: '1px solid #000' }}>اليوم والتاريخ</th>
                      <th style={{ padding: '6px', border: '1px solid #000' }}>الشعبة</th>
                      <th style={{ padding: '6px', border: '1px solid #000' }}>الحصة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '12px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan}></td><td style={{ border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan}></td><td style={{ border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan}></td></tr>
                    <tr><td style={{ padding: '12px', border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan}></td><td style={{ border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan}></td><td style={{ border: '1px solid #000' }} suppressContentEditableWarning contentEditable={isEditingPlan}></td></tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', margin: '0 0 10px 0', borderBottom: '2px solid #0f172a', paddingBottom: '4px', display: 'inline-block' }}>التأمل الذاتي حول الدرس:</h3>
                <div className="reflection-box" style={{ border: '1px solid #000', padding: '16px', lineHeight: '2.2', fontSize: '14px' }}>
                  <strong>أشعر بالرضا عن:</strong> <span suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>................................................</span><br/>
                  <strong>تحديات واجهتني:</strong> <span suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>................................................</span><br/>
                  <strong>اقتراحات للتحسين:</strong> <span suppressContentEditableWarning contentEditable={isEditingPlan} className={isEditingPlan ? 'editable-cell' : ''}>................................................</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------------
  // الشاشة الرئيسية للدرس
  // --------------------------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Cairo, sans-serif', color: '#1e293b' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #bae6fd', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div>
          <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 'bold' }}>المادة العلمية التفاعلية</span>
          <h2 style={{ fontSize: '26px', color: '#0369a1', margin: '4px 0', fontWeight: '900' }}>{lessonData?.lesson_title || "مفهوم المال وأشكاله"}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          <div style={{ backgroundColor: '#f0f9ff', padding: '8px 16px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#0369a1', marginLeft: '10px' }}>⏱️ اختر زمن الحصة:</label>
            <select value={classDuration} onChange={(e) => setClassDuration(Number(e.target.value))} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #0284c7', fontFamily: 'Cairo', fontWeight: 'bold', color: '#0f172a' }}>
              <option value={45}>45 دقيقة</option>
              <option value={35}>35 دقيقة</option>
            </select>
          </div>

          <button onClick={() => setShowPrepModel(true)} style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
            📋 خطة الدرس اليومية
          </button>
          <button onClick={onBackToDashboard} style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '2px solid #bae6fd', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
            🔙 العودة للوحة التحكم
          </button>
        </div>
      </div>

      <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', borderRight: '5px solid #0369a1' }}>
        <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px 0', fontWeight: 'bold', borderBottom: '1px solid #edf2f7', paddingBottom: '6px' }}>🎯 نتاجات الدرس ومخرجات التعلم</h3>
        <ul style={{ margin: '0', paddingRight: '20px', listStyleType: 'disc', lineHeight: '1.8' }}>
          {lessonData?.learning_outcomes?.map((outcome, idx) => <li key={idx} style={{ fontSize: '16px', color: '#2d3748' }}>{outcome}</li>)}
        </ul>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '6px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: 0, fontWeight: 'bold' }}>🧭 {lessonData?.exploration_stage?.title || "مرحلة أستكشف"}</h3>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>⏱️ {currentTimes.explore} دقائق</span>
          </div>
          <p style={{ fontSize: '14.5px', color: '#059669', margin: '0 0 10px 0', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
            <strong>📋 الإجراء:</strong> {lessonData?.exploration_stage?.pedagogy_method || "طرح أسئلة عصف ذهني."}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {lessonData?.exploration_stage?.prompts?.map((prompt, idx) => (
              <p key={idx} style={{ fontSize: '15.5px', margin: 0, lineHeight: '1.7', color: '#2d3748' }}>• {prompt}</p>
            ))}
          </div>
        </section>

        <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '6px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: 0, fontWeight: 'bold' }}>📖 المفاهيم والمصطلحات الأساسية</h3>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>⏱️ {currentTimes.concepts} دقائق</span>
          </div>
          <p style={{ fontSize: '14.5px', color: '#059669', margin: '0 0 10px 0', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
            <strong>📋 الإجراء:</strong> تدوين المصطلحات على السبورة، وشرحها مع ضرب أمثلة من واقع الطلاب.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {lessonData?.core_vocabulary?.map((vocab, idx) => (
              <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', borderRight: '4px solid #27ae60' }}>
                <strong style={{ color: '#27ae60', fontSize: '15px', display: 'block', marginBottom: '4px' }}>{vocab.term}</strong>
                <p style={{ fontSize: '14.5px', margin: 0, lineHeight: '1.6', color: '#4a5568' }}>{vocab.definition}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '6px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: 0, fontWeight: 'bold' }}>💰 {lessonData?.shapes_of_money?.title || "أشكال المال"}</h3>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>⏱️ {currentTimes.shapes} دقائق</span>
          </div>
          <p style={{ fontSize: '14.5px', color: '#059669', margin: '0 0 10px 0', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
            <strong>📋 الإجراء:</strong> مناقشة الأشكال المختلفة للمال وتوجيه الطلاب للمقارنة بينها.
          </p>
          <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#2d3748', margin: '0 0 14px 0', textAlign: 'justify' }}>{lessonData?.shapes_of_money?.context}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '16px', flex: 1 }}>
            {lessonData?.shapes_of_money?.types && lessonData.shapes_of_money.types.map((type) => (
              <div key={type.number} style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
                <strong style={{ color: '#0369a1', fontSize: '14px' }}>شكل {type.number}: {type.name}</strong>
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: '#4a5568', lineHeight: '1.5' }}>{type.details}</p>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px dashed #bae6fd', paddingTop: '14px' }}>
            <button onClick={() => { setShowShapesAct(!showShapesAct); if(!showShapesAct) setShapesActIndex(0); }} style={{ backgroundColor: '#f1f5f9', color: '#0369a1', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13px', width: '100%' }}>
              {showShapesAct ? "❌ إخفاء النشاط البديل" : "✨ إظهار نشاط توليدي بديل للفقرة"}
            </button>
            {showShapesAct && (
              <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #2563eb', marginTop: '10px' }}>
                <p style={{ fontSize: '14px', color: '#1e3a8a', margin: 0, lineHeight: '1.6' }}>{shapesActivitiesPool[shapesActIndex]}</p>
              </div>
            )}
          </div>
        </section>

        <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', borderRight: '5px solid #0284c7', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '6px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: 0, fontWeight: 'bold' }}>⚖️ {lessonData?.critical_distinction?.title || "الفروق الجوهرية"}</h3>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>⏱️ {currentTimes.distinction} دقائق</span>
          </div>
          <p style={{ fontSize: '14.5px', color: '#059669', margin: '0 0 10px 0', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
            <strong>📋 الإجراء:</strong> تبيان الفروق الدقيقة والمصطلحات القانونية لضمان عدم الخلط.
          </p>
          <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#2d3748', margin: '0 0 12px 0' }}>{lessonData?.critical_distinction?.intro}</p>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {lessonData?.critical_distinction?.money_section && (
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0369a1', fontSize: '14.5px', display: 'block', marginBottom: '4px' }}>{lessonData.critical_distinction.money_section.definition}</strong>
                {lessonData.critical_distinction.money_section.examples.map((ex, idx) => (
                  <p key={idx} style={{ fontSize: '14px', margin: '2px 10px 0 0', color: '#4a5568' }}>• {ex}</p>
                ))}
              </div>
            )}
            {lessonData?.critical_distinction?.currency_details && (
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '14.5px', margin: 0, lineHeight: '1.6', color: '#2d3748' }}><strong style={{ color: '#0369a1' }}>النقود القانونية:</strong> {lessonData.critical_distinction.currency_details.definition}</p>
              </div>
            )}
          </div>
        </section>

      </div>

      {lessonData.classroom_activities && lessonData.classroom_activities.length > 0 && (
        <section style={{ backgroundColor: '#f0fdfa', padding: '24px', borderRadius: '16px', border: '2px solid #ccfbf1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>🛠️</span>
              <h3 style={{ fontSize: '22px', color: '#0f766e', margin: '0', fontWeight: 'bold' }}>الأنشطة الصفية التفاعلية</h3>
            </div>
            <span style={{ backgroundColor: '#ccfbf1', color: '#0f766e', padding: '6px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>⏱️ الزمن المخصص للأنشطة: {currentTimes.activities} دقيقة</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {lessonData.classroom_activities.map((activity, index) => (
              <div key={index} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #99f6e4' }}>
                <h4 style={{ fontSize: '18px', color: '#115e59', marginTop: '0', marginBottom: '12px', fontWeight: 'bold' }}>{activity.title}</h4>
                {activity.objective && <p style={{ fontSize: '14.5px', color: '#334155', fontWeight: 'bold', marginBottom: '10px' }}>🎯 {activity.objective}</p>}
                <div style={{ marginTop: '15px' }}>
                  <strong style={{ fontSize: '14.5px', color: '#1e293b' }}>📝 خطوات التنفيذ:</strong>
                  <ul style={{ paddingRight: '20px', marginTop: '10px', color: '#475569', lineHeight: '1.7', fontSize: '14px' }}>
                    {activity.steps.map((step, i) => <li key={i} style={{ marginBottom: '8px' }}>{step}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '6px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', color: '#0369a1', margin: 0, fontWeight: 'bold' }}>✏️ أسئلة تقويم الأداء وتأكيد التعلم (أقيم تعلمي)</h3>
          <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>واجب تقييمي وختامي</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px' }}>
          {lessonData?.assessment_questions?.map((q) => (
            <div key={q.id} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15.5px', margin: 0, fontWeight: 'bold', color: '#1e293b' }}>{q.question_text}</p>
                  {q.sub_questions && q.sub_questions.map((sub, sIdx) => (
                    <p key={sIdx} style={{ fontSize: '14.5px', margin: '8px 12px 0 0', color: '#475569' }}>
                      • {sub.text} 
                      {sub.correct_answer && visibleAnswers[q.id] && (
                        <span style={{ color: '#059669', fontWeight: 'bold' }}> (مفتاح الإجابة: {sub.correct_answer})</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
              {q.model_answer && (
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <button 
                    onClick={() => toggleAnswer(q.id)}
                    style={{ backgroundColor: visibleAnswers[q.id] ? '#f1f5f9' : '#e0f2fe', color: visibleAnswers[q.id] ? '#475569' : '#0284c7', border: '1px solid', borderColor: visibleAnswers[q.id] ? '#cbd5e1' : '#bae6fd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13px' }}
                  >
                    {visibleAnswers[q.id] ? "🙈 إخفاء الإجابة" : "👁️ عرض الإجابة النموذجية"}
                  </button>
                </div>
              )}
              {q.model_answer && visibleAnswers[q.id] && (
                <div style={{ marginTop: '12px', padding: '14px', backgroundColor: '#ecfdf5', borderRight: '4px solid #10b981', borderRadius: '8px' }}>
                  <strong style={{ color: '#047857', fontSize: '14px', display: 'block', marginBottom: '6px' }}>💡 الإجابة النموذجية المعتمدة:</strong>
                  <p style={{ margin: 0, fontSize: '14.5px', color: '#065f46', lineHeight: '1.6' }}>{q.model_answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '2px solid #0284c7', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #edf2f7', paddingBottom: '10px' }}>
          <span style={{ fontSize: '26px' }}>🎲</span>
          <div>
            <strong style={{ fontSize: '18px', color: '#0369a1', display: 'block' }}>محرك القرعة والمشاركة العشوائية</strong>
            <span style={{ fontSize: '13px', color: '#64748b' }}>أداة مساعدة لاختيار الطلاب بشكل عادل بناءً على قوائم الأسماء المحفوظة.</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>الصف الدراسي:</label>
            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo', fontSize: '14px' }}>
              <option value="">اختر..</option>
              {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>الشعبة:</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo', fontSize: '14px' }}>
               <option value="">اختر..</option>
              {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
             <button onClick={handlePickStudent} disabled={isPicking} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo', width: '100%', fontSize: '15px', opacity: isPicking ? 0.7 : 1 }}>
              {isPicking ? "جاري تدوير الأسماء..." : "⚡ سحب طالب عشوائي من الشعبة"}
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '2px dashed #bae6fd', padding: '16px', borderRadius: '12px', textAlign: 'center', fontSize: '22px', fontWeight: '900', color: isPicking ? '#0284c7' : '#0f172a', minHeight: '34px' }}>
          {selectedStudent || "إضغط على الزر لسحب اسم طالب"}
        </div>
      </section>

    </div>
  );
}

export default LessonView;
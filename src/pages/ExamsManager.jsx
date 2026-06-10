import React, { useState, useMemo, useEffect } from 'react';

function ExamsManager({ 
  teacherName, 
  schoolName, 
  directorateName, 
  currentGradeName, 
  allLessonsDatabase, // هنا نستقبل قاعدة البيانات كاملة لجميع الصفوف دون فلترة مسبقة
  allSemesterLessons,  // حماية إضافية في حال تم تمريرها بالاسم القديم
  onBackToDashboard 
}) {
  
  // دمج البيانات المستقبلة لضمان استقرار التطبيق
  const mainLessonsArray = allLessonsDatabase || allSemesterLessons || [];

  const [activeExamType, setActiveExamType] = useState('first'); 
  const [startLesson, setStartLesson] = useState('');
  const [endLesson, setEndLesson] = useState('');
  const [showGeneratedExamPaper, setShowGeneratedExamPaper] = useState(false);
  const [seeds, setSeeds] = useState({ s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0, s7: 0 });

  // خريطة أسماء الصفوف لعرضها بشكل أنيق ومطابقتها برمجياً
  const gradeNamesMap = {
    '7': 'الصف السابع',
    '8': 'الصف الثامن',
    '9': 'الصف التاسع',
    '10': 'الصف العاشر',
    '11': 'الصف الحادي عشر',
    '12': 'الصف الثاني عشر (التوجيهي)'
  };

  // دالة ذكية لتحديد الصف الافتراضي عند فتح الشاشة بناءً على اختيار المعلم الأخير في اللوحة الرئيسية
  const getInitialGrade = () => {
    const name = String(currentGradeName || '').toLowerCase();
    if (name.includes('سابع') || name.includes('7')) return '7';
    if (name.includes('ثامن') || name.includes('8')) return '8';
    if (name.includes('تاسع') || name.includes('9')) return '9';
    if (name.includes('عاشر') || name.includes('10')) return '10';
    if (name.includes('حادي') || name.includes('11')) return '11';
    if (name.includes('ثاني عشر') || name.includes('12') || name.includes('توجيهي')) return '12';
    return '7'; // افتراضي
  };

  // حالات الفلاتر المستقلة داخل شاشة الامتحانات
  const [selectedGrade, setSelectedGrade] = useState(getInitialGrade);
  const [selectedSemester, setSelectedSemester] = useState('1');

  // حماية حالة التطبيق: إذا تحول المعلم من الصف 12 لصف آخر وكان خيار "الفصلين" نشطاً، يتم إرجاعه تلقائياً للفصل الأول
  useEffect(() => {
    if (selectedGrade !== '12' && selectedSemester === 'both') {
      setSelectedSemester('1');
    }
  }, [selectedGrade, selectedSemester]);

  // الفلترة الداخلية الشاملة بناءً على المدخلات المستقلة الجديدة
  const filteredLessons = useMemo(() => {
    if (!mainLessonsArray || !Array.isArray(mainLessonsArray)) return [];
    
    return mainLessonsArray.filter(lesson => {
      // 1. استخراج رقم الصف من بيانات الدرس بطريقة مرنة
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

      // 2. تصفية بناءً على الفصل الدراسي المختار
      if (selectedGrade === '12' && selectedSemester === 'both') return true; // عرض الفصلين معاً للتوجيهي
      
      const lessonSem = lesson.semester ? String(lesson.semester) : (lesson.lesson_id?.includes('_s1_') ? '1' : lesson.lesson_id?.includes('_s2_') ? '2' : '1');
      
      return lessonSem === selectedSemester;
    });
  }, [mainLessonsArray, selectedGrade, selectedSemester]);

  // تحديث تلقائي لنطاق القوائم المنسدلة (من / إلى) فور تغير الفلاتر لمنع بقاء قيم قديمة معلقة
  useEffect(() => {
    if (filteredLessons.length > 0) {
      setStartLesson(filteredLessons[0].lesson_id);
      setEndLesson(filteredLessons[filteredLessons.length - 1].lesson_id);
    } else {
      setStartLesson('');
      setEndLesson('');
    }
  }, [filteredLessons]);

  const [examConfig, setExamConfig] = useState({
    mcqCount: 0, mcqMark: 0,
    vocabCount: 0, vocabMark: 0,
    listCount: 0, listMark: 0,      
    explainCount: 0, explainMark: 0, 
    tfCount: 0, tfMark: 0,
    reasonCount: 0, reasonMark: 0,
    blankCount: 0, blankMark: 0
  });

  const handleConfigChange = (field, value) => {
    setExamConfig(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const getMarkPerItem = (totalMark, count) => {
    if (count <= 0) return 0;
    const mark = totalMark / count;
    return Number.isInteger(mark) ? mark : mark.toFixed(1);
  };

  const totalExamMarks = examConfig.mcqMark + examConfig.vocabMark + examConfig.listMark + examConfig.explainMark + examConfig.tfMark + examConfig.reasonMark + examConfig.blankMark;

  const handleRebuildAllExecution = () => {
    setSeeds(prev => ({ s1: prev.s1 + 1, s2: prev.s2 + 1, s3: prev.s3 + 1, s4: prev.s4 + 1, s5: prev.s5 + 1, s6: prev.s6 + 1, s7: prev.s7 + 1 }));
    alert("تمت إعادة صياغة وتبديل كافة أسئلة النموذج بالكامل.");
  };

  const arabicNumbers = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع"];
  let renderedQuestionsCount = 0;

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

        {/* لوحة التحكم بالفلاتر المستقلة */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '20px', alignItems: 'center' }}>
          
          {/* 1. قائمة اختيار الصف مستقلة */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px', color: '#0369a1' }}>🏫 الصف الدراسي:</label>
            <select 
              value={selectedGrade} 
              onChange={(e) => { setSelectedGrade(e.target.value); setShowGeneratedExamPaper(false); }} 
              style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #0284c7', fontFamily: 'Cairo', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <option value="7">الصف السابع</option>
              <option value="8">الصف الثامن</option>
              <option value="9">الصف التاسع</option>
              <option value="10">الصف العاشر</option>
              <option value="11">الصف الحادي عشر</option>
              <option value="12">الصف الثاني عشر (التوجيهي)</option>
            </select>
          </div>

          {/* 2. قائمة اختيار الفصل الدراسي بناءً على نوع الصف */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px', color: '#0369a1' }}>📅 الفصل الدراسي:</label>
            <select 
              value={selectedSemester} 
              onChange={(e) => { setSelectedSemester(e.target.value); setShowGeneratedExamPaper(false); }} 
              style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #0284c7', fontFamily: 'Cairo', backgroundColor: '#fff', cursor: 'pointer' }}
            >
              <option value="1">الفصل الدراسي الأول</option>
              <option value="2">الفصل الدراسي الثاني</option>
              {selectedGrade === '12' && <option value="both">الفصلين معاً (الدورة الكاملة)</option>}
            </select>
          </div>

          {/* 3. اختيار نطاق المادة من درس */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px' }}>📖 المادة من درس:</label>
            <select value={startLesson} onChange={(e) => setStartLesson(e.target.value)} style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'Cairo', backgroundColor: '#fff' }}>
              {filteredLessons.length > 0 ? (
                filteredLessons.map(l => (<option key={l.lesson_id} value={l.lesson_id}>{l.lesson_title}</option>))
              ) : (
                <option value="">لا توجد دروس متاحة لهذا النطاق</option>
              )}
            </select>
          </div>

          {/* 4. اختيار نطاق المادة إلى درس */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px' }}>📖 إلى درس:</label>
            <select value={endLesson} onChange={(e) => setEndLesson(e.target.value)} style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'Cairo', backgroundColor: '#fff' }}>
              {filteredLessons.length > 0 ? (
                filteredLessons.map(l => (<option key={l.lesson_id} value={l.lesson_id}>{l.lesson_title}</option>))
              ) : (
                <option value="">لا توجد دروس متاحة لهذا النطاق</option>
              )}
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
          <button onClick={() => setShowGeneratedExamPaper(true)} style={{ backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', border: 0, padding: '12px 28px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontFamily: 'Cairo' }}>⚡ صياغة وتوليد ورقة الامتحان الحالية</button>
        </div>
      </div>

      {showGeneratedExamPaper && (
        <div id="printable-exam-sheet">
          <div className="no-print" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', marginBottom: '20px' }}>
            <button onClick={() => window.print()} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>🖨️ طباعة ورقة الامتحان</button>
            <button onClick={handleRebuildAllExecution} style={{ backgroundColor: '#4b5563', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>🔄 توليد نموذج بديل كامل</button>
          </div>

          <div className="exam-paper">
            <div className="exam-header">
              <div className="exam-header-right">
                وزارة التربية والتعليم<br />
                مديرية التربية والتعليم: {directorateName}<br />
                اسم المدرسة: {schoolName}
              </div>
              <div className="exam-header-center">
                <strong>{activeExamType === 'first' ? "امتحان التقويم الأول" : activeExamType === 'second' ? "امتحان التقويم الثاني" : "الامتحان النهائي"}</strong>
                <span>مبحث: الثقافة المالية / {gradeNamesMap[selectedGrade]}</span>
              </div>
              <div className="exam-header-left">
                <div>اسم الطالب: __________________</div>
                <div>الشعبة: ( &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; )</div>
                <div>العلامة: ( {totalExamMarks} ) علامة</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', color: '#000000', marginTop: '20px' }}>
              {/* 1. اختيار من متعدد */}
              {examConfig.mcqCount > 0 && (() => {
                const title = `السؤال ${arabicNumbers[renderedQuestionsCount] || (renderedQuestionsCount + 1)}: اختر رمز الإجابة الصحيحة في كل مما يأتي، لكل فقرة (${getMarkPerItem(examConfig.mcqMark, examConfig.mcqCount)}) علامة:`;
                renderedQuestionsCount++;
                return (
                  <div>
                    <strong>{title}</strong>
                    <ol style={{ margin: '8px 0', paddingRight: '24px', listStyleType: 'none' }}>
                      {[...Array(examConfig.mcqCount)].map((_, idx) => {
                        const mcqPool = [
                          { q: "أي من الآتي يعتبر أقدم الأشكال المالية التاريخية التي مارسها البشر في القديم؟", a: "أ. النقود الورقية القانونية المطبوعة", b: "ب. ظاهرة المقايصة السلعية الصامتة", c: "ج. الشيكات البنكية المكتوبة", d: "د. العملات والمحافظ الإلكترونية المشفرة" },
                          { q: "تتميز قطع العملات النقدية المعدنية عن الأوراق النقدية بصفة أساسية هي:", a: "أ. سرعة التلف والتمزق الفوري", b: "ب. العمر الطويل والمقاومة الكبيرة للعوامل", c: "ج. الاعتماد الكامل على شبكة البلوكتشين", d: "د. انعدام القبول المطلق في الأسواق" }
                        ];
                        const item = mcqPool[(idx + seeds.s1) % mcqPool.length];
                        return (
                          <li key={idx} style={{ marginBottom: '16px' }}>
                            {idx + 1}. {item.q}
                            <span className="mcq-option-block">{item.a}</span>
                            <span className="mcq-option-block">{item.b}</span>
                            <span className="mcq-option-block">{item.c}</span>
                            <span className="mcq-option-block">{item.d}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })()}

              {/* 2. المفاهيم */}
              {examConfig.vocabCount > 0 && (() => {
                const title = `السؤال ${arabicNumbers[renderedQuestionsCount] || (renderedQuestionsCount + 1)}: عرّف المفاهيم والمصطلحات المالية التالية بدقة، لكل فقرة (${getMarkPerItem(examConfig.vocabMark, examConfig.vocabCount)}) علامة:`;
                renderedQuestionsCount++;
                return (
                  <div>
                    <strong>{title}</strong>
                    <ol style={{ margin: '8px 0', paddingRight: '24px', listStyleType: 'none' }}>
                      {[...Array(examConfig.vocabCount)].map((_, idx) => {
                        const vocabPool = ["المال (Money)", "المقايصة (Barter)", "النقود القانونية", "الائتمان المصرفي"];
                        return (
                          <li key={idx} style={{ marginBottom: '10px' }}>
                            {idx + 1}. {vocabPool[(idx + seeds.s2) % vocabPool.length]} :
                            <div className="exam-space-line"></div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })()}

              {/* 3. اذكر / عدد */}
              {examConfig.listCount > 0 && (() => {
                const title = `السؤال ${arabicNumbers[renderedQuestionsCount] || (renderedQuestionsCount + 1)}: اذكر / عدد النقاط المطلوبة باختصار، لكل فقرة (${getMarkPerItem(examConfig.listMark, examConfig.listCount)}) علامة:`;
                renderedQuestionsCount++;
                return (
                  <div>
                    <strong>{title}</strong>
                    <ol style={{ margin: '8px 0', paddingRight: '24px', listStyleType: 'none' }}>
                      {[...Array(examConfig.listCount)].map((_, idx) => {
                        const listPool = ["عدد ثلاثة من أبرز أشكال ومظاهر المال في العصر الحديث المعاصر.", "اذكر ميزات النقود الورقية القانونية الصادرة عن البنك المركزي الأردني."];
                        return (
                          <li key={idx} style={{ marginBottom: '10px' }}>
                            {idx + 1}. {listPool[(idx + seeds.s3) % listPool.length]}
                            <div className="exam-space-line"></div>
                            <div className="exam-space-line"></div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })()}

              {/* 5. ضع إشارة صح أو خطأ */}
              {examConfig.tfCount > 0 && (() => {
                const title = `السؤال ${arabicNumbers[renderedQuestionsCount] || (renderedQuestionsCount + 1)}: ضع إشارة (✓) بجانب العبارة الصحيحة وإشارة (✗) بجانب العبارة غير الصحيحة، لكل فقرة (${getMarkPerItem(examConfig.tfMark, examConfig.tfCount)}) علامة:`;
                renderedQuestionsCount++;
                return (
                  <div>
                    <strong>{title}</strong>
                    <ol style={{ margin: '8px 0', paddingRight: '24px', listStyleType: 'none' }}>
                      {[...Array(examConfig.tfCount)].map((_, idx) => {
                        const tfPool = [
                          "تُعد النقود الورقية الحديثة الملموسة جزءاً فرعياً من المظلة الشاملة للمال.",
                          "جميع أشكال المال والعملات بلا استثناء تصدر بقرار مباشر وحصري من البنك المركزي الأردني.",
                          "تعتمد العملات الرقمية المشفرة مثل البيتكوين على تكنولوجيا تسمى سلسلة الكتل البلوكتشين."
                        ];
                        return (
                          <li key={idx} style={{ marginBottom: '12px' }}>
                            ( &nbsp; &nbsp; ) {idx + 1}. {tfPool[(idx + seeds.s5) % tfPool.length]}
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })()}
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
import React, { useState } from 'react';
function ExamsManager({ teacherName, schoolName, directorateName, currentGradeName, allSemesterLessons, onBackToDashboard }) {
  const [activeExamType, setActiveExamType] = useState('first'); 
  const [startLesson, setStartLesson] = useState('g7_s1_u1_l1');
  const [endLesson, setEndLesson] = useState('g7_s1_u1_l4');
  const [showGeneratedExamPaper, setShowGeneratedExamPaper] = useState(false);
  const [seeds, setSeeds] = useState({ s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0, s7: 0 });

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
    <div style={{ fontFamily: 'Cairo, sans-serif' }} id="printable-exam-sheet-container">
      
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px' }}>📖 المادة من درس:</label>
            <select value={startLesson} onChange={(e) => setStartLesson(e.target.value)} style={{ fontSize: '14px', width: 'auto' }}>
              {allSemesterLessons.map(l => (<option key={l.lesson_id} value={l.lesson_id}>{l.lesson_title}</option>))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '15px' }}>📖 إلى درس:</label>
            <select value={endLesson} onChange={(e) => setEndLesson(e.target.value)} style={{ fontSize: '14px', width: 'auto' }}>
              {allSemesterLessons.map(l => (<option key={l.lesson_id} value={l.lesson_id}>{l.lesson_title}</option>))}
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
                <span>مبحث: الثقافة المالية / {currentGradeName}</span>
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
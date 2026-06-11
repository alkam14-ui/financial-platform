import React from 'react';

function ExamPaperView({
  displayedExam,
  editingExam,
  examTypeNames,
  gradeNamesMap,
  directorateName,
  schoolName,
  teacherName,
  currentExamDocId,
  savingExam,
  onPrint,
  onSaveModel,
  onStartEdit,
  onSaveEdits,
  onCancelEdit,
  onRebuild,
  onDraftPromptChange,
  onDraftOptionChange
}) {
  const arabicNumbers = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع'];

  if (!displayedExam) return null;

  return (
    <div id="printable-exam-sheet">
      <div className="no-print" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={onPrint} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>🖨️ طباعة ورقة الامتحان</button>
        {!editingExam && <button onClick={onSaveModel} disabled={savingExam} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: savingExam ? 'not-allowed' : 'pointer', fontFamily: 'Cairo' }}>{savingExam ? 'جاري الحفظ...' : 'حفظ النموذج'}</button>}
        {!editingExam && <button onClick={onStartEdit} style={{ backgroundColor: '#f97316', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>تعديل الأسئلة</button>}
        {editingExam && <button onClick={onSaveEdits} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>حفظ التعديلات</button>}
        {editingExam && <button onClick={onCancelEdit} style={{ backgroundColor: '#64748b', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>تراجع</button>}
        {!editingExam && !currentExamDocId && <button onClick={onRebuild} style={{ backgroundColor: '#4b5563', color: '#fff', border: 0, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>🔄 توليد نموذج بديل كامل</button>}
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
                      <textarea value={item.prompt} onChange={(event) => onDraftPromptChange(sectionIndex, itemIndex, event.target.value)} style={{ width: '100%', minHeight: '70px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', fontFamily: 'Cairo', boxSizing: 'border-box' }} />
                    ) : (
                      <span>{section.type === 'tf' ? '(    ) ' : ''}{itemIndex + 1}. {item.prompt}</span>
                    )}

                    {section.type === 'mcq' && (
                      <div>
                        {item.options.map((option, optionIndex) => editingExam ? (
                          <input key={optionIndex} type="text" value={option} onChange={(event) => onDraftOptionChange(sectionIndex, itemIndex, optionIndex, event.target.value)} style={{ display: 'block', width: '100%', marginTop: '8px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'Cairo' }} />
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
  );
}

export default ExamPaperView;

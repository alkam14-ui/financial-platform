import React from 'react';

function Sidebar({ curriculumData, onSelectLesson, selectedLesson, currentGrade, setSelectedGrade, currentSemester, setSelectedSemester, currentUnitsList, selectedUnit, setSelectedUnit, currentLessonsList, selectedLessonId, setSelectedLesson, onBackToDashboard }) {
  
  return (
    <aside className="platform-sidebar" style={{ width: '300px', background: '#f8fafc', padding: '1.25rem', borderLeft: '2px solid #bae6fd', height: 'calc(100vh - 72px)', overflowY: 'auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      
      <button onClick={onBackToDashboard} style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '1px solid #bae6fd', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', width: '100%', textAlign: 'center' }}>
        🔙 العودة للوحة التحكم الرئيسية
      </button>

      <div style={{ borderBottom: '2px solid #0369a1', paddingBottom: '8px', marginTop: '5px' }}>
        <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#0369a1', fontWeight: '900' }}>📚 تصفح المناهج والخطط</h3>
      </div>

      {/* أدوات التصفح والاختيار الديناميكية التي كانت باللوحة */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#fff', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>الصف الدراسي:</label>
          <select value={currentGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ padding: '4px 8px !important', fontSize: '0.85rem !important', marginTop: '4px' }}>
            {curriculumData.grades.map(g => (<option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>الفصل الدراسي:</label>
          <select value={currentSemester} onChange={(e) => setSelectedSemester(e.target.value)} style={{ padding: '4px 8px !important', fontSize: '0.85rem !important', marginTop: '4px' }}>
            {curriculumData.grades.find(g => g.grade_id === currentGrade)?.semesters.map(s => (<option key={s.semester_id} value={s.semester_id}>{s.semester_name}</option>))}
          </select>
        </div>
      </div>

      {/* عرض شجرة الوحدات والدروس بناءً على الفلاتر المحددة */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {currentUnitsList.map((unit) => (
          <div key={unit.unit_id} style={{ marginBottom: '1rem' }}>
            <strong style={{ display: 'block', color: '#27ae60', marginBottom: '0.4rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {unit.unit_title}
            </strong>
            <ul style={{ listStyle: 'none', padding: 0, paddingRight: '10px', margin: 0, borderRight: '2px dashed #cbd5e1' }}>
              {unit.lessons.map((lesson) => {
                const isSelected = selectedLessonId === lesson.lesson_id;
                return (
                  <li 
                    key={lesson.lesson_id}
                    onClick={() => {
                      setSelectedUnit(unit.unit_id);
                      setSelectedLesson(lesson.lesson_id);
                      onSelectLesson(lesson);
                    }}
                    style={{ 
                      padding: '6px 10px', 
                      cursor: 'pointer', 
                      borderRadius: '6px',
                      marginBottom: '3px',
                      backgroundColor: isSelected ? '#e0f2fe' : 'transparent',
                      color: isSelected ? '#0369a1' : '#334155',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: '0.8rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {lesson.lesson_title}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
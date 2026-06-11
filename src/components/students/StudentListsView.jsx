import React from 'react';

function StudentListsView({
  listName,
  onListNameChange,
  onFileUpload,
  studentLists,
  selectedListId,
  selectedList,
  selectedListStudents,
  editingList,
  editingDrafts,
  onSelectList,
  onDeleteList,
  onPrint,
  onStartEdit,
  onSaveEdits,
  onCancelEdits,
  onDraftChange
}) {
  return (
    <div>
      <div className="no-print" style={{ backgroundColor: '#f0f9ff', padding: '24px', borderRadius: '16px', border: '1px dashed #0284c7', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <strong style={{ color: '#0369a1', fontSize: '18px', display: 'block', marginBottom: '8px' }}>📥 رفع ملف أسماء الطلاب (Excel)</strong>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px' }}>يجب أن يحتوي الملف على أعمدة: <strong>اسم الطالب</strong> و<strong>الصف</strong> و<strong>الشعبة</strong></p>
          <input
            type="text"
            value={listName}
            onChange={(event) => onListNameChange(event.target.value)}
            placeholder="اكتب اسم القائمة، مثال: الصف السابع أ"
            style={{ width: '100%', maxWidth: '420px', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: 'Cairo', marginBottom: '10px' }}
          />
          <input type="file" accept=".xlsx, .xls" onChange={onFileUpload} style={{ display: 'block', marginTop: '10px', fontFamily: 'Cairo', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'center', minWidth: '150px' }}>
            <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}>{studentLists.length}</span>
            <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: 'bold' }}>قائمة محفوظة ☁️</span>
          </div>
        </div>
      </div>

      {studentLists.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: '20px', alignItems: 'start' }}>
          <div className="no-print" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', fontWeight: '900', color: '#0369a1', borderBottom: '1px solid #e2e8f0' }}>
              القوائم المرفوعة
            </div>
            {studentLists.map((list) => (
              <div key={list.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', borderBottom: '1px solid #f1f5f9', backgroundColor: selectedListId === list.id ? '#e0f2fe' : '#fff' }}>
                <button
                  type="button"
                  onClick={() => onSelectList(list.id)}
                  style={{ flex: 1, textAlign: 'right', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'Cairo', color: '#0f172a' }}
                >
                  <strong style={{ display: 'block', color: '#0369a1' }}>{list.name}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{list.count} طالب/طالبة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteList(list)}
                  style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold' }}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>

          <div className="students-list-print" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', overflowX: 'auto' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0369a1', fontSize: '22px' }}>{selectedList?.name || 'قائمة الطلاب'}</h3>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{selectedListStudents.length} طالب/طالبة</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={onPrint} style={{ backgroundColor: '#10b981', color: '#fff', border: 0, padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                  طباعة
                </button>
                {editingList ? (
                  <>
                    <button type="button" onClick={onSaveEdits} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                      حفظ
                    </button>
                    <button type="button" onClick={onCancelEdits} style={{ backgroundColor: '#f97316', color: '#fff', border: 0, padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                      تراجع
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={onStartEdit} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                    تحرير
                  </button>
                )}
              </div>
            </div>

            <h3 className="print-only">{selectedList?.name || 'قائمة الطلاب'}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1', width: '70px' }}>م</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>اسم الطالب</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1', width: '140px' }}>الصف</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1', width: '140px' }}>الشعبة</th>
                </tr>
              </thead>
              <tbody>
                {selectedListStudents.map((student, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>
                      {editingList ? (
                        <input type="text" value={editingDrafts[student.id]?.name || ''} onChange={(event) => onDraftChange(student.id, 'name', event.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }} />
                      ) : student.name}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {editingList ? (
                        <input type="text" value={editingDrafts[student.id]?.grade || ''} onChange={(event) => onDraftChange(student.id, 'grade', event.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }} />
                      ) : student.grade}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {editingList ? (
                        <input type="text" value={editingDrafts[student.id]?.section || ''} onChange={(event) => onDraftChange(student.id, 'section', event.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }} />
                      ) : student.section}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="no-print" style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          لا توجد قوائم طلاب مرفوعة حتى الآن.
        </div>
      )}
    </div>
  );
}

export default StudentListsView;

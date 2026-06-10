import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';

function StudentsManager({ onBackToDashboard }) {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('manager'); 
  const [activeSemester, setActiveSemester] = useState('s1');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [loading, setLoading] = useState(true);

  const studentsCollectionRef = collection(db, "students");

  // جلب البيانات من Firebase عند تحميل الشاشة
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getDocs(studentsCollectionRef);
        setStudents(data.docs.map((d) => ({ ...d.data(), id: d.id })));
      } catch (error) {
        console.error("خطأ في جلب البيانات من فايربيس:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const uniqueGrades = [...new Set(students.map(s => s.grade))].filter(Boolean);
  const uniqueSections = [...new Set(students.filter(s => s.grade === selectedGrade).map(s => s.section))].filter(Boolean);

  useEffect(() => {
    if (uniqueGrades.length > 0 && !uniqueGrades.includes(selectedGrade)) setSelectedGrade(uniqueGrades[0]);
  }, [students, uniqueGrades, selectedGrade]);

  useEffect(() => {
    if (uniqueSections.length > 0 && !uniqueSections.includes(selectedSection)) setSelectedSection(uniqueSections[0]);
  }, [selectedGrade, uniqueSections, selectedSection]);

  const filteredStudents = students.filter(s => s.grade === selectedGrade && s.section === selectedSection);

  // رفع ملف Excel وحفظه في Firebase
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const batch = writeBatch(db);
        const newStudents = data.map((row) => {
          const cleanRow = {};
          for (let key in row) cleanRow[key.trim()] = row[key];
          return {
            name: cleanRow['اسم الطالب'] || cleanRow['الاسم'] || cleanRow['الاسم الرباعي'] || cleanRow['Name'] || 'غير مسجل',
            grade: cleanRow['الصف'] || cleanRow['صف'] || cleanRow['Grade'] || 'غير محدد',
            section: cleanRow['الشعبة'] || cleanRow['شعبة'] || cleanRow['Section'] || 'غير محدد',
            s1_g1: '', s1_g2: '', s1_g3: '', s1_final: '', s1_notes: '',
            s2_g1: '', s2_g2: '', s2_g3: '', s2_final: '', s2_makeup: '', s2_notes: ''
          };
        });

        for (const student of newStudents) {
          const newDocRef = doc(studentsCollectionRef);
          batch.set(newDocRef, student);
        }
        await batch.commit();

        // إعادة جلب البيانات من Firebase بدلاً من reload
        const updated = await getDocs(studentsCollectionRef);
        setStudents(updated.docs.map((d) => ({ ...d.data(), id: d.id })));
      } catch (error) {
        console.error("خطأ في رفع الملف:", error);
        alert("حدث خطأ أثناء رفع الملف. تحقق من الاتصال بالإنترنت.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // تحديث علامة طالب في Firebase
  const handleUpdateStudentData = async (id, field, value) => {
    try {
      const studentDoc = doc(db, "students", id);
      await updateDoc(studentDoc, { [field]: value });
      setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
    } catch (error) {
      console.error("خطأ في تحديث البيانات:", error);
    }
  };

  // حذف طالب من Firebase
  const handleDeleteStudent = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب من السحابة؟')) {
      try {
        await deleteDoc(doc(db, "students", id));
        setStudents(students.filter(s => s.id !== id));
      } catch (error) {
        console.error("خطأ في الحذف:", error);
        alert("حدث خطأ أثناء الحذف.");
      }
    }
  };

  // حذف جميع الطلاب من Firebase
  const handleClearAll = async () => {
    if (window.confirm('⚠️ تحذير: هل أنت متأكد من مسح جميع بيانات وعلامات الطلاب من السحابة؟')) {
      try {
        const batch = writeBatch(db);
        students.forEach(s => batch.delete(doc(db, "students", s.id)));
        await batch.commit();
        setStudents([]);
        setActiveTab('manager');
      } catch (error) {
        console.error("خطأ في المسح الكامل:", error);
        alert("حدث خطأ أثناء المسح.");
      }
    }
  };

  return (
    <div className="manager-container" style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '2px solid #bae6fd', fontFamily: 'Cairo, sans-serif' }}>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background-color: #ffffff !important; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .manager-container { padding: 0 !important; border: none !important; }
          .print-header { 
            display: flex !important; 
            justify-content: space-between !important; 
            font-weight: bold !important; 
            font-size: 16px !important; 
            color: #000 !important; 
            margin-bottom: 10px !important;
          }
          table { border-collapse: collapse !important; width: 100% !important; border: 2px solid #000 !important; table-layout: fixed !important; }
          th, td { border: 1px solid #000 !important; color: #000 !important; font-size: 13px !important; text-align: center; }
          th { background-color: #f8fafc !important; }
          input[type="number"], input[type="text"] {
            border: none !important; background: transparent !important; color: #000 !important;
            font-weight: bold; font-size: 13px !important; width: 100% !important; text-align: center; padding: 0 !important;
          }
          input::placeholder { color: transparent !important; }
        }
        .vertical-text-container {
          display: flex; flex-direction: column; align-items: center;
          justify-content: space-between; height: 100%;
        }
        .vertical-text {
          writing-mode: vertical-rl; text-orientation: mixed;
          white-space: nowrap; height: 120px;
          display: flex; align-items: center; justify-content: center; font-size: 13px;
        }
        .header-letter { border-bottom: 1px solid #cbd5e1; width: 100%; padding: 4px 0; font-weight: bold; }
        .header-percent { border-top: 1px solid #cbd5e1; width: 100%; padding: 4px 0; font-size: 11px; }
        @media print {
          .header-letter, .header-percent { border-color: #000 !important; }
        }
        @media screen {
          .print-header { display: none !important; }
        }
      `}</style>

      {/* الترويسة العلوية */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f9ff', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>{activeTab === 'manager' ? '👥' : '📓'}</span>
          <h2 style={{ fontSize: '26px', color: '#0369a1', margin: '0', fontWeight: 'bold' }}>
            {activeTab === 'manager' ? 'إدارة قوائم الطلاب' : 'دفتر العلامات الرسمي'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'gradebook' && filteredStudents.length > 0 && (
            <button onClick={() => window.print()} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
              🖨️ طباعة صفحة {activeSemester === 's1' ? 'الفصل الأول' : 'الفصل الثاني'}
            </button>
          )}
          {students.length > 0 && (
            <button onClick={() => setActiveTab(activeTab === 'manager' ? 'gradebook' : 'manager')} style={{ backgroundColor: activeTab === 'manager' ? '#0284c7' : '#f8fafc', color: activeTab === 'manager' ? '#fff' : '#0284c7', border: '2px solid #0284c7', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
              {activeTab === 'manager' ? '📓 الانتقال لدفتر العلامات' : '👥 إدارة قوائم الطلاب'}
            </button>
          )}
          <button onClick={onBackToDashboard} style={{ backgroundColor: '#f8fafc', color: '#64748b', border: '2px solid #cbd5e1', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
            🔙 لوحة التحكم
          </button>
        </div>
      </div>

      {/* شاشة التحميل */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#0369a1', fontSize: '18px' }}>
          ⏳ جاري تحميل البيانات من السحابة...
        </div>
      )}

      {/* شاشة إدارة الطلاب */}
      {!loading && activeTab === 'manager' && (
        <div className="no-print">
          <div style={{ backgroundColor: '#f0f9ff', padding: '24px', borderRadius: '16px', border: '1px dashed #0284c7', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#0369a1', fontSize: '18px', display: 'block', marginBottom: '8px' }}>📥 رفع ملف أسماء الطلاب (Excel)</strong>
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px' }}>يجب أن يحتوي الملف على أعمدة: <strong>اسم الطالب</strong> و<strong>الصف</strong> و<strong>الشعبة</strong></p>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'block', marginTop: '10px', fontFamily: 'Cairo', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <div style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'center', minWidth: '150px' }}>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}>{students.length}</span>
                <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: 'bold' }}>طالب مسجل في السحابة ☁️</span>
              </div>
              {students.length > 0 && (
                <button onClick={handleClearAll} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13px' }}>
                  🗑️ مسح جميع البيانات
                </button>
              )}
            </div>
          </div>

          {students.length > 0 && (
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>م</th>
                    <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>اسم الطالب</th>
                    <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>الصف</th>
                    <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1' }}>الشعبة</th>
                    <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{student.name}</td>
                      <td style={{ padding: '12px 14px' }}>{student.grade}</td>
                      <td style={{ padding: '12px 14px' }}>{student.section}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button onClick={() => handleDeleteStudent(student.id)} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Cairo' }}>حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* شاشة دفتر العلامات */}
      {!loading && activeTab === 'gradebook' && (
        <div style={{ animation: 'fadeIn 0.3s' }}>

          <div className="print-header">
            <div>الصف : {selectedGrade}</div>
            <div>الشعبة ( {selectedSection} )</div>
            <div>المادة الدراسية : الثقافة المالية</div>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>🎓 اختر الصف:</label>
              <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }}>
                {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>🏫 اختر الشعبة:</label>
              <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'Cairo' }}>
                {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📄 اختر صفحة الفصل:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setActiveSemester('s1')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #0284c7', backgroundColor: activeSemester === 's1' ? '#0284c7' : '#fff', color: activeSemester === 's1' ? '#fff' : '#0284c7', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>الفصل الأول</button>
                <button onClick={() => setActiveSemester('s2')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #0284c7', backgroundColor: activeSemester === 's2' ? '#0284c7' : '#fff', color: activeSemester === 's2' ? '#fff' : '#0284c7', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo' }}>الفصل الثاني</button>
              </div>
            </div>
          </div>

          {filteredStudents.length > 0 ? (
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                  <tr>
                    <th style={{ width: '4%', padding: '4px' }}>الرقم المتسلسل</th>
                    <th style={{ width: '22%', padding: '4px' }}>الاســـــــــــــــــم</th>
                    {activeSemester === 's1' ? (
                      <>
                        <th style={{ width: '8%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">أ</div>
                            <div className="vertical-text">التقويم الأول</div>
                            <div className="header-percent">20%</div>
                          </div>
                        </th>
                        <th style={{ width: '8%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">ب</div>
                            <div className="vertical-text">التقويم الثاني</div>
                            <div className="header-percent">20%</div>
                          </div>
                        </th>
                        <th style={{ width: '8%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">ج</div>
                            <div className="vertical-text">التقويم الثالث</div>
                            <div className="header-percent">20%</div>
                          </div>
                        </th>
                        <th style={{ width: '8%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">د</div>
                            <div className="vertical-text">الاختبار النهائي</div>
                            <div className="header-percent">40%</div>
                          </div>
                        </th>
                        <th style={{ width: '8%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">هـ</div>
                            <div className="vertical-text">المجــــمـــوع</div>
                            <div className="header-percent">100%</div>
                          </div>
                        </th>
                        <th style={{ width: '26%', padding: '4px' }}>ملحوظات</th>
                      </>
                    ) : (
                      <>
                        <th style={{ width: '6%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">و</div>
                            <div className="vertical-text">التقويم الأول</div>
                            <div className="header-percent">20%</div>
                          </div>
                        </th>
                        <th style={{ width: '6%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">ز</div>
                            <div className="vertical-text">التقويم الثاني</div>
                            <div className="header-percent">20%</div>
                          </div>
                        </th>
                        <th style={{ width: '6%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">ح</div>
                            <div className="vertical-text">التقويم الثالث</div>
                            <div className="header-percent">20%</div>
                          </div>
                        </th>
                        <th style={{ width: '6%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">ط</div>
                            <div className="vertical-text">الاختبار النهائي</div>
                            <div className="header-percent">40%</div>
                          </div>
                        </th>
                        <th style={{ width: '6%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">ي</div>
                            <div className="vertical-text">المجــــمـــوع</div>
                            <div className="header-percent">100%</div>
                          </div>
                        </th>
                        <th style={{ width: '7%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter" style={{ fontSize: '10px' }}>هـ + ي / 2</div>
                            <div className="vertical-text">النتيجة السنوية</div>
                            <div className="header-percent">100%</div>
                          </div>
                        </th>
                        <th style={{ width: '6%', padding: 0 }}>
                          <div className="vertical-text-container">
                            <div className="header-letter">-</div>
                            <div className="vertical-text">اختبار الإكمال</div>
                            <div className="header-percent">-</div>
                          </div>
                        </th>
                        <th style={{ width: '23%', padding: '4px' }}>ملحوظات</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const s1Total = (parseFloat(student.s1_g1) || 0) + (parseFloat(student.s1_g2) || 0) + (parseFloat(student.s1_g3) || 0) + (parseFloat(student.s1_final) || 0);
                    const s2Total = (parseFloat(student.s2_g1) || 0) + (parseFloat(student.s2_g2) || 0) + (parseFloat(student.s2_g3) || 0) + (parseFloat(student.s2_final) || 0);
                    const annualResult = (s1Total > 0 && s2Total > 0) ? Math.round((s1Total + s2Total) / 2) : '-';

                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '8px' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 'bold', textAlign: 'right' }}>{student.name}</td>
                        {activeSemester === 's1' ? (
                          <>
                            <td style={{ padding: 0 }}><input type="number" value={student.s1_g1 || ''} onChange={(e) => handleUpdateStudentData(student.id, 's1_g1', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: 0 }}><input type="number" value={student.s1_g2 || ''} onChange={(e) => handleUpdateStudentData(student.id, 's1_g2', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: 0 }}><input type="number" value={student.s1_g3 || ''} onChange={(e) => handleUpdateStudentData(student.id, 's1_g3', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: 0 }}><input type="number" value={student.s1_final || ''} onChange={(e) => handleUpdateStudentData(student.id, 's1_final', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{s1Total > 0 ? s1Total : ''}</td>
                            <td style={{ padding: 0 }}><input type="text" value={student.s1_notes || ''} onChange={(e) => handleUpdateStudentData(student.id, 's1_notes', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'right', fontFamily: 'Cairo' }} /></td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: 0 }}><input type="number" value={student.s2_g1 || ''} onChange={(e) => handleUpdateStudentData(student.id, 's2_g1', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: 0 }}><input type="number" value={student.s2_g2 || ''} onChange={(e) => handleUpdateStudentData(student.id, 's2_g2', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: 0 }}><input type="number" value={student.s2_g3 || ''} onChange={(e) => handleUpdateStudentData(student.id, 's2_g3', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: 0 }}><input type="number" value={student.s2_final || ''} onChange={(e) => handleUpdateStudentData(student.id, 's2_final', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{s2Total > 0 ? s2Total : ''}</td>
                            <td style={{ padding: '8px', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>{annualResult}</td>
                            <td style={{ padding: 0 }}><input type="number" value={student.s2_makeup || ''} onChange={(e) => handleUpdateStudentData(student.id, 's2_makeup', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'center', fontFamily: 'Cairo' }} /></td>
                            <td style={{ padding: 0 }}><input type="text" value={student.s2_notes || ''} onChange={(e) => handleUpdateStudentData(student.id, 's2_notes', e.target.value)} style={{ width: '100%', padding: '8px', border: 'none', textAlign: 'right', fontFamily: 'Cairo' }} /></td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-print" style={{ textAlign: 'center', padding: '30px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px dashed #f87171', color: '#991b1b' }}>
              لا يوجد طلاب مسجلين في هذا الصف وهذه الشعبة.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentsManager;

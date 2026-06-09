import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

function StudentsManager({ onBackToDashboard }) {
  const [students, setStudents] = useState([]);

  // جلب البيانات من المتصفح عند فتح الصفحة
  useEffect(() => {
    const savedData = localStorage.getItem('school_students');
    if (savedData) {
      setStudents(JSON.parse(savedData));
    }
  }, []);

  // دالة قراءة ملف الإكسل (تم تحديثها لتكون أكثر ذكاءً)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0]; // قراءة الورقة الأولى
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      const formattedData = data.map((row, index) => {
        // 1. تنظيف العناوين: إزالة أي مسافات مخفية في بداية أو نهاية اسم العمود
        const cleanRow = {};
        for (let key in row) {
          cleanRow[key.trim()] = row[key];
        }

        // 2. مطابقة ذكية للبيانات مع السماح بعدة خيارات لاسم العمود
        return {
          id: new Date().getTime() + index,
          name: cleanRow['اسم الطالب'] || cleanRow['الاسم'] || cleanRow['الاسم الرباعي'] || cleanRow['Name'] || 'غير مسجل',
          grade: cleanRow['الصف'] || cleanRow['صف'] || cleanRow['Grade'] || 'غير محدد',
          section: cleanRow['الشعبة'] || cleanRow['شعبة'] || cleanRow['Section'] || 'غير محدد',
          stars: 0 
        };
      });

      // دمج الطلاب الجدد مع الطلاب الحاليين (إن وجدوا)
      const updatedStudents = [...students, ...formattedData];
      setStudents(updatedStudents);
      localStorage.setItem('school_students', JSON.stringify(updatedStudents));
    };
    reader.readAsBinaryString(file);
  };

  const handleClearAll = () => {
    if(window.confirm('⚠️ هل أنت متأكد من مسح جميع بيانات الطلاب المحفوظة؟')) {
      setStudents([]);
      localStorage.removeItem('school_students');
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '2px solid #bae6fd', fontFamily: 'Cairo, sans-serif' }}>
      
      {/* الترويسة وزر العودة */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f9ff', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>👥</span>
          <h2 style={{ fontSize: '26px', color: '#0369a1', margin: '0', fontWeight: 'bold' }}>إدارة الطلاب وسجل التقييم التكويني</h2>
        </div>
        <button onClick={onBackToDashboard} style={{ backgroundColor: '#f8fafc', color: '#0284c7', border: '2px solid #bae6fd', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
          🔙 العودة للوحة التحكم
        </button>
      </div>

      {/* منطقة رفع الملف والتعليمات */}
      <div style={{ backgroundColor: '#f0f9ff', padding: '24px', borderRadius: '16px', border: '1px dashed #0284c7', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <strong style={{ color: '#0369a1', fontSize: '18px', display: 'block', marginBottom: '8px' }}>📥 رفع ملف أسماء الطلاب (Excel)</strong>
          <p style={{ color: '#475569', fontSize: '14.5px', margin: '0 0 10px 0', lineHeight: '1.6' }}>
            الآن المنصة تتعرف بذكاء على الأعمدة! فقط تأكد من وجود العناوين <strong style={{ color: '#0f766e' }}>(الاسم، الصف، الشعبة)</strong> في الصف الأول.
          </p>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            style={{ display: 'block', marginTop: '10px', fontFamily: 'Cairo', cursor: 'pointer' }}
          />
        </div>
        <div style={{ backgroundColor: '#e0f2fe', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'center', minWidth: '150px' }}>
          <span style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#0284c7' }}>{students.length}</span>
          <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: 'bold' }}>طالب مسجل</span>
        </div>
      </div>

      {/* جدول استعراض الطلاب */}
      {students.length > 0 ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', color: '#1e293b', margin: '0' }}>قائمة الطلاب المحفوظة في المنصة:</h3>
            <button onClick={handleClearAll} style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', fontFamily: 'Cairo' }}>
              🗑️ مسح جميع السجلات
            </button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontSize: '15px' }}>م</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontSize: '15px' }}>اسم الطالب</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontSize: '15px' }}>الصف</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontSize: '15px' }}>الشعبة</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: '#0f172a' }}>{student.name}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{student.grade}</td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{student.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <span style={{ fontSize: '40px', color: '#94a3b8' }}>📭</span>
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>لا توجد بيانات طلاب حالياً. قم برفع ملف الإكسل للبدء.</p>
        </div>
      )}

    </div>
  );
}

export default StudentsManager;
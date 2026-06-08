import React from 'react';

function Navbar({ teacherName, schoolName, directorateName, onLogout }) {
  return (
    <header className="platform-navbar" style={{ padding: '1rem 2rem', background: '#2c3e50', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff', fontWeight: '900' }}>منصة الثقافة المالية</h1>
        {teacherName && (
          <span style={{ fontSize: '0.85rem', color: '#bae6fd', marginTop: '4px' }}>
            المدرسة: {schoolName} | المديرية: {directorateName}
          </span>
        )}
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {teacherName ? (
          <>
            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>👤 الأستاذ {teacherName}</span>
            <button onClick={onLogout} style={{ background: '#e74c3c', color: '#fff', border: 0, padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '0.85rem' }}>تسجيل الخروج</button>
          </>
        ) : (
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>بإشراف الأستاذ حسين علقم</span>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
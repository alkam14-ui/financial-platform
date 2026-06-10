import React, { useState, useEffect } from 'react';
import curriculumIndex from './data/curriculum_index.json';
import lessonDataL1 from './data/curriculum_g7_s1.json';

import Navbar from './components/Navbar.jsx';
import LessonView from './pages/LessonView.jsx';
import ExamsManager from './pages/ExamsManager.jsx';
import StudentsManager from './pages/StudentsManager.jsx';
import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

function App() {
  const [teacherName, setTeacherName] = useState(() => localStorage.getItem('teacherName') || '');
  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('schoolName') || '');
  const [directorateName, setDirectorateName] = useState(() => localStorage.getItem('directorateName') || '');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [authMode, setAuthMode] = useState('signup');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [navigationPage, setNavigationPage] = useState(() => {
    if (localStorage.getItem('teacherName') && localStorage.getItem('schoolName')) {
      return 'dashboard';
    }
    return 'registration';
  });

  const [selectedGrade, setSelectedGrade] = useState('g7');
  const [selectedSemester, setSelectedSemester] = useState('s1');
  const [selectedUnit, setSelectedUnit] = useState('g7_s1_u1');
  const [selectedLesson, setSelectedLesson] = useState('g7_s1_u1_l1');
  const [activeLessonData, setActiveLessonData] = useState(null);

  const applyTeacherProfile = (profile) => {
    setTeacherName(profile.teacherName || '');
    setSchoolName(profile.schoolName || '');
    setDirectorateName(profile.directorateName || '');
    localStorage.setItem('teacherName', profile.teacherName || '');
    localStorage.setItem('schoolName', profile.schoolName || '');
    localStorage.setItem('directorateName', profile.directorateName || '');
  };

  const currentGradeObj = curriculumIndex.grades.find(g => g.grade_id === selectedGrade);
  const currentSemesterObj = currentGradeObj?.semesters.find(s => s.semester_id === selectedSemester);
  const currentUnitsList = currentSemesterObj?.units || [];
  const currentUnitObj = currentUnitsList.find(u => u.unit_id === selectedUnit);
  const currentLessonsList = currentUnitObj?.lessons || [];

  // ==========================================
  // إضافة جديدة: استخراج كافة الدروس لجميع الصفوف لفك ارتباط شاشة الامتحانات
  // ==========================================
  const allLessonsFlatArray = [];
  if (curriculumIndex && curriculumIndex.grades) {
    curriculumIndex.grades.forEach(grade => {
      grade.semesters?.forEach(semester => {
        semester.units?.forEach(unit => {
          unit.lessons?.forEach(lesson => {
            allLessonsFlatArray.push({
              ...lesson,
              // تنظيف رقم الصف والفصل لتسهيل الفلترة في شاشة الامتحانات
              grade_id: grade.grade_id.replace('g', ''), 
              semester: semester.semester_id.replace('s', '') 
            });
          });
        });
      });
    });
  }
  // ==========================================

  useEffect(() => {
    if (currentUnitsList.length > 0) {
      setSelectedUnit(currentUnitsList[0].unit_id);
    }
  }, [selectedGrade, selectedSemester]);

  useEffect(() => {
    if (currentLessonsList.length > 0) {
      setSelectedLesson(currentLessonsList[0].lesson_id);
    }
  }, [selectedUnit]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthError('');

      if (!user) {
        setNavigationPage('registration');
        setAuthLoading(false);
        return;
      }

      try {
        const teacherRef = doc(db, 'teachers', user.uid);
        const teacherSnap = await getDoc(teacherRef);

        if (teacherSnap.exists()) {
          applyTeacherProfile(teacherSnap.data());
          setTeacherEmail(user.email || '');
          setNavigationPage('dashboard');
        } else {
          setTeacherEmail(user.email || '');
          setNavigationPage('registration');
        }
      } catch (error) {
        console.error('Error loading teacher profile:', error);
        setAuthError('تعذر تحميل بيانات الحساب. حاول مرة أخرى.');
        setNavigationPage('registration');
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson.lesson_id);
    if (lesson.lesson_id === 'g7_s1_u1_l1' || lesson.id === 'g7_s1_u1_l1') {
      setActiveLessonData(lessonDataL1.lesson);
    } else {
      setActiveLessonData({
        lesson_title: lesson.lesson_title,
        duration_minutes: 45,
        learning_outcomes: [
          `سيتم إضافة محتوى درس (${lesson.lesson_title}) قريباً.`,
        ],
        exploration_stage: {
          title: "قيد الإعداد",
          pedagogy_method: "سيتم التحديث قريباً",
          prompts: ["هذا الدرس قيد الإعداد، سيتوفر المحتوى الكامل قريباً."]
        },
        core_vocabulary: [
          { term: lesson.lesson_title, definition: "سيتم إضافة تعريف هذا المصطلح قريباً." }
        ],
        shapes_of_money: {
          title: "قيد الإعداد",
          context: "سيتم إضافة محتوى هذا القسم قريباً.",
          types: []
        },
        classroom_activities: [],
        assessment_questions: [
          { id: "q1", question_text: "سيتم إضافة أسئلة التقييم قريباً." }
        ]
      });
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    try {
      if (authMode === 'login') {
        const credential = await signInWithEmailAndPassword(auth, teacherEmail, teacherPassword);
        const teacherSnap = await getDoc(doc(db, 'teachers', credential.user.uid));

        if (teacherSnap.exists()) {
          applyTeacherProfile(teacherSnap.data());
          setNavigationPage('dashboard');
        } else {
          setAuthError('تم تسجيل الدخول، لكن لم يتم العثور على ملف المعلم. أنشئ حساباً جديداً أو تواصل مع مدير المنصة.');
        }
        return;
      }

      if (teacherName && schoolName && directorateName && teacherEmail && teacherPassword) {
        const credential = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
        const profile = {
          teacherName,
          schoolName,
          directorateName,
          email: credential.user.email,
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, 'teachers', credential.user.uid), profile);
        applyTeacherProfile(profile);
        setNavigationPage('dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      const errorMessages = {
        'auth/email-already-in-use': 'هذا البريد مستخدم مسبقاً. جرّب تسجيل الدخول بدلاً من إنشاء حساب.',
        'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة.',
        'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        'auth/weak-password': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'
      };
      setAuthError(errorMessages[error.code] || 'حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('teacherName');
    localStorage.removeItem('schoolName');
    localStorage.removeItem('directorateName');
    
    setTeacherName('');
    setSchoolName('');
    setDirectorateName('');
    setTeacherEmail('');
    setTeacherPassword('');
    setCurrentUser(null);
    await signOut(auth);
    setNavigationPage('registration');
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', direction: 'rtl', backgroundColor: '#e0f2fe', fontFamily: 'Cairo, sans-serif', color: '#0369a1', fontWeight: '900', fontSize: '22px' }}>
        جاري تحميل المنصة...
      </div>
    );
  }

  return (
    <div className="platform-root-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: 'rtl', backgroundColor: '#e0f2fe' }}>

      {/* شاشة التسجيل */}
      {navigationPage === 'registration' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 1rem', fontFamily: 'Cairo, sans-serif' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', border: '2px solid #bae6fd', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '42px', color: '#0369a1', margin: '0 0 5px 0', fontWeight: '900' }}>منصة الثقافة المالية</h1>
            <p style={{ fontSize: '18px', color: '#0284c7', fontWeight: 'bold', margin: '0 0 35px 0' }}>إعداد المشرف التربوي: حسين علقم</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: '#f0f9ff', padding: '6px', borderRadius: '14px', border: '1px solid #bae6fd', marginBottom: '22px' }}>
              <button type="button" onClick={() => setAuthMode('signup')} style={{ backgroundColor: authMode === 'signup' ? '#0284c7' : 'transparent', color: authMode === 'signup' ? '#fff' : '#0369a1', border: 0, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '900' }}>حساب جديد</button>
              <button type="button" onClick={() => setAuthMode('login')} style={{ backgroundColor: authMode === 'login' ? '#0284c7' : 'transparent', color: authMode === 'login' ? '#fff' : '#0369a1', border: 0, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo', fontWeight: '900' }}>تسجيل دخول</button>
            </div>
            <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'right' }}>
              {authMode === 'signup' && (
                <>
                  <div>
                    <label style={{ fontSize: '15px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>👤 اسم المعلم / المعلمة:</label>
                    <input type="text" placeholder="أدخل الاسم الكامل هنا" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '15px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>🏫 اسم المدرسة:</label>
                    <input type="text" placeholder="أدخل اسم مدرستك الرسمية" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '15px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>📂 اسم المديرية:</label>
                    <input type="text" placeholder="أدخل اسم مديرية التربية والتعليم" value={directorateName} onChange={(e) => setDirectorateName(e.target.value)} required />
                  </div>
                </>
              )}
              <div>
                <label style={{ fontSize: '15px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>البريد الإلكتروني:</label>
                <input type="email" placeholder="teacher@example.com" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '15px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#334155' }}>كلمة المرور:</label>
                <input type="password" placeholder="6 أحرف على الأقل" value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} required minLength={6} />
              </div>
              {authError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold' }}>
                  {authError}
                </div>
              )}
              <button type="submit" disabled={authSubmitting} style={{ backgroundColor: authSubmitting ? '#94a3b8' : '#0284c7', color: '#fff', fontWeight: '900', border: 0, padding: '14px', borderRadius: '12px', fontSize: '17px', cursor: authSubmitting ? 'not-allowed' : 'pointer', marginTop: '10px', fontFamily: 'Cairo' }}>
                {authSubmitting ? 'جاري المعالجة...' : authMode === 'signup' ? 'إنشاء حساب وتفعيل المنصة' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* لوحة التحكم الرئيسية */}
      {navigationPage === 'dashboard' && (
        <>
          <Navbar teacherName={teacherName} schoolName={schoolName} directorateName={directorateName} onLogout={handleLogout} />
          <div style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '34px', color: '#0369a1', margin: '0', fontWeight: '900' }}>مرحباً بك، أستاذ {teacherName}</h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: '8px 0 0 0' }}>يرجى اختيار القسم المطلوب لبدء الحصة التفاعلية:</p>
            </div>
            
            {/* Grid Box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              
              {/* بطاقة الدروس */}
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #bae6fd', padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '2px solid #f0f9ff', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>📚</span>
                  <h3 style={{ fontSize: '24px', color: '#0369a1', margin: '0', fontWeight: 'bold' }}>منصة الدروس والأنشطة</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0', textAlign: 'justify' }}>اختر الدرس المطلوب وابدأ الحصة التفاعلية مباشرة.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>🎓 الصف الدراسي:</label>
                    <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
                      {curriculumIndex.grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>📅 الفصل الدراسي:</label>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                      {curriculumIndex.grades.find(g => g.grade_id === selectedGrade)?.semesters.map(s => <option key={s.semester_id} value={s.semester_id}>{s.semester_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>📦 الوحدة:</label>
                    <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                      {currentUnitsList.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>📖 الدرس:</label>
                    <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
                      {currentLessonsList.map(l => <option key={l.lesson_id} value={l.lesson_id}>{l.lesson_title}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={() => { const lesson = currentLessonsList.find(l => l.lesson_id === selectedLesson); if (lesson) handleSelectLesson(lesson); setNavigationPage('lessons_page'); }} style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', border: 0, padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Cairo' }}>🚀 ابدأ الدرس الآن</button>
              </div>

              {/* بطاقة الامتحانات */}
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #bae6fd', padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '2px solid #f0f9ff', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>📝</span>
                  <h3 style={{ fontSize: '24px', color: '#0369a1', margin: '0', fontWeight: 'bold' }}>إعداد الامتحانات</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0', textAlign: 'justify' }}>بناء وتوليد اختبارات التقويم الأول والثاني والنهائي بشكل دقيق، وتوزيع حقول العلامات والفقرات بالتساوي، مع طباعة الأوراق الرسمية فوراً.</p>
                <button onClick={() => setNavigationPage('exams_page')} style={{ backgroundColor: '#0369a1', color: '#fff', fontWeight: 'bold', border: 0, padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Cairo', marginTop: '10px' }}>دخول</button>
              </div>

              {/* بطاقة إدارة الطلاب */}
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #bae6fd', padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '2px solid #f0f9ff', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>👥</span>
                  <h3 style={{ fontSize: '24px', color: '#0369a1', margin: '0', fontWeight: 'bold' }}>إدارة الطلاب</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0', textAlign: 'justify' }}>رفع قوائم أسماء الطلاب عبر ملفات Excel لربطها ببنك التقييم التكويني والمشاركة الصفية.</p>
                <button onClick={() => setNavigationPage('students_manager')} style={{ backgroundColor: '#0369a1', color: '#fff', fontWeight: 'bold', border: 0, padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Cairo', marginTop: '10px' }}>دخول</button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* شاشة محتوى الدرس */}
      {navigationPage === 'lessons_page' && (
        <>
          <Navbar teacherName={teacherName} schoolName={schoolName} directorateName={directorateName} onLogout={handleLogout} />
          <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', boxSizing: 'border-box', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
            {activeLessonData ? (
              <LessonView lessonData={activeLessonData} teacherName={teacherName} onBackToDashboard={() => setNavigationPage('dashboard')} />
            ) : (
              <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '24px', textAlign: 'center', fontFamily: 'Cairo' }}>
                <h3>يرجى العودة واختيار درس من لوحة التحكم</h3>
                <button onClick={() => setNavigationPage('dashboard')} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', marginTop: '16px' }}>🔙 العودة للوحة التحكم</button>
              </div>
            )}
          </main>
        </>
      )}

      {/* شاشة الامتحانات (تم تعديل الخصائص المرسلة هنا) */}
      {navigationPage === 'exams_page' && (
        <>
          <div className="no-print">
            <Navbar teacherName={teacherName} schoolName={schoolName} directorateName={directorateName} onLogout={handleLogout} />
          </div>
          <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <ExamsManager 
              teacherName={teacherName} 
              schoolName={schoolName} 
              directorateName={directorateName} 
              currentGradeName={currentGradeObj?.grade_name || "الصف السابع الأساسي"} 
              allLessonsDatabase={allLessonsFlatArray} 
              onBackToDashboard={() => setNavigationPage('dashboard')} 
            />
          </div>
        </>
      )}

      {/* شاشة إدارة الطلاب */}
      {navigationPage === 'students_manager' && (
        <>
          <div className="no-print">
            <Navbar teacherName={teacherName} schoolName={schoolName} directorateName={directorateName} onLogout={handleLogout} />
          </div>
          <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <StudentsManager onBackToDashboard={() => setNavigationPage('dashboard')} />
          </div>
        </>
      )}

    </div>
  );
}

export default App;

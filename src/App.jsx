import React, { useState, useEffect } from 'react';
import curriculumIndex from './data/curriculum_index.json';
import lessonDataL1 from './data/curriculum_g7_s1.json';

// استيراد المكونات الفرعية والمحركات المُنظمة الشاملة
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import LessonView from './pages/LessonView.jsx';
import ExamsManager from './pages/ExamsManager.jsx';

function App() {
  // --- 1. حالات نظام التسجيل وبوابة التحكم الرئيسية ---
  const [navigationPage, setNavigationPage] = useState('registration');
  const [teacherName, setTeacherName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [directorateName, setDirectorateName] = useState('');

  // --- 2. حالات الفهرس والتصفح الشامل للمناهج ---
  const [selectedGrade, setSelectedGrade] = useState('g7');
  const [selectedSemester, setSelectedSemester] = useState('s1');
  const [selectedUnit, setSelectedUnit] = useState('g7_s1_u1');
  const [selectedLesson, setSelectedLesson] = useState('g7_s1_u1_l1');
  const [activeLessonData, setActiveLessonData] = useState(null);

  // استخراج القوائم والبيانات الهيكلية بشكل ديناميكي بناءً على الفلاتر (من كودك الأصلي)
  const currentGradeObj = curriculumIndex.grades.find(g => g.grade_id === selectedGrade);
  const currentSemesterObj = currentGradeObj?.semesters.find(s => s.semester_id === selectedSemester);
  const currentUnitsList = currentSemesterObj?.units || [];
  const currentUnitObj = currentUnitsList.find(u => u.unit_id === selectedUnit);
  const currentLessonsList = currentUnitObj?.lessons || [];
  const allSemesterLessons = currentUnitsList.flatMap(u => u.lessons) || [];

  // تزامنات الفهرس الذكية عند تغيير الصف أو الفصل الدراسي لضمان استقرار الاختيارات
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

  // دالة المعالجة والتوجيه عند اختيار درس محدد من القائمة الجانبية (Sidebar)
  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson.lesson_id);
    
    // التحقق المطابق من المعرف الفريد للدرس الأول لربطه بملف الأنشطة والمفاهيم التفصيلي
    if (lesson.lesson_id === 'g7_s1_u1_l1' || lesson.id === 'g7_s1_u1_l1') {
      setActiveLessonData(lessonDataL1.lesson);
    } else {
      // محرك التوليد التلقائي لضمان مرونة المنصة وتصفح بقية عناصر المنهاج بالفهرس الشامل
      setActiveLessonData({
        lesson_title: lesson.lesson_title,
        duration_minutes: 45,
        learning_outcomes: [
          `استنتاج المفهوم المعرفي والمالي العام لدرس (${lesson.lesson_title}).`,
          "تطبيق السلوك المالي الرشيد المرتبط بالموضوع صفيّاً وعمليّاً.",
          "حل المشكلات واتخاذ القرارات المالية السليمة المستدامة."
        ],
        exploration_stage: {
          title: "أستكشف (نشاط استهلالي تفاعلي)",
          prompts: [
            `ما الذي يتبادر إلى ذهنك مباشرة عند سماع عنوان درس (${lesson.lesson_title})؟`,
            "كيف يمكننا تطبيق ممارسات هذا المفهوم في المقصف المدرسي أو المنزل بحكمة؟"
          ]
        },
        core_vocabulary: [
          { term: lesson.lesson_title, definition: "المصطلح والركيزة الأساسية المستهدفة في هذه الحصة الصفية بناءً على الخطة المعتمدة." },
          { term: "التوعية المالية المستدامة", definition: "إدارة وتوجيه الموارد المتاحة بطريقة تحقق الاستقرار وتمنع الهدر المالي." }
        ],
        shapes_of_money: {
          title: "محاور ومفاهيم الشرح والتحليل المعرفي",
          context: `يعتبر درس (${lesson.lesson_title}) من الركائز الهامة لطلبة ${currentGradeObj?.grade_name || 'المرحلة الدراسية'}، ويهدف لبناء وعي استهلاكي تكتيكي وثقافة مالية تواكب متطلبات العصر الحديث.`,
          types: [
            { number: 1, name: "المحور الأول: البناء النظري", details: "القراءة التحليلية للنصوص والمؤشرات الواردة في الدليل الدراسي المعتمد حرفياً." },
            { number: 2, name: "المحور الثاني: التطبيق الحركي", details: "الربط المباشر بالأنشطة والممارسات المالية اليومية والواقعية للطلاب." }
          ]
        },
        assessment_questions: [
          { id: "q1", question_text: `وضح المفهوم الجوهري لدرس (${lesson.lesson_title}) بأسلوبك العلمي الخاص.` },
          { id: "q2", question_text: "عدد اثنتين من الممارسات الإيجابية التي تساهم في دعم هذا التوجه الاقتصادي صفيّاً." }
        ],
        whatsapp_hybrid_delivery: {
          broadcast_text: `🌟 *تحدي منزلي ذكي: ثقافة مالية (الصف السابع)* 🌟\n\nأعزائي الطلاب، ناقشنا اليوم درس محوري بعنوان *(${lesson.lesson_title})*، يرجى كتابة ملخص تفاعلي من سطرين على دفاتركم المخصصة حول أثر هذا المفهوم في حياتنا اليومية!\n\n✍️ *الحل على الدفتر المالي، وسيتم مراجعة الإجابات والثناء على المتميزين في بداية الحصة القادمة!*`
        }
      });
    }
  };

  // معالجة تسجيل الدخول والخروج في النظام
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    if (teacherName && schoolName && directorateName) {
      setNavigationPage('dashboard');
    }
  };

  const handleLogout = () => {
    setTeacherName('');
    setSchoolName('');
    setDirectorateName('');
    setNavigationPage('registration');
  };

  return (
    <div className="platform-root-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: 'rtl', backgroundColor: '#e0f2fe' }}>
      
      {/* 📥 شاشة الدخول والتسجيل المقيدة بالبيانات الأساسية */}
      {navigationPage === 'registration' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem 1rem', fontFamily: 'Cairo, sans-serif' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', border: '2px solid #bae6fd', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '42px', color: '#0369a1', margin: '0 0 5px 0', fontWeight: '900' }}>منصة الثقافة المالية</h1>
            <p style={{ fontSize: '18px', color: '#0284c7', fontWeight: 'bold', margin: '0 0 35px 0' }}>إعداد المشرف التربوي: حسين علقم</p>
            
            <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'right' }}>
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
              <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: '900', border: 0, padding: '14px', borderRadius: '12px', fontSize: '17px', cursor: 'pointer', marginTop: '10px', fontFamily: 'Cairo' }}>💾 تسجيل الدخول وتفعيل المنصة</button>
            </form>
          </div>
        </div>
      )}

      {/* 🗺️ شاشة لوحة التحكم الكبرى (بوابة الاختيار التفاعلية الرئيسية) */}
      {navigationPage === 'dashboard' && (
        <>
          <Navbar teacherName={teacherName} schoolName={schoolName} directorateName={directorateName} onLogout={handleLogout} />
          <div style={{ flex: 1, padding: '3rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box', fontFamily: 'Cairo, sans-serif' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '34px', color: '#0369a1', margin: '0', fontWeight: '900' }}>مرحباً بك، أستاذ {teacherName}</h2>
              <p style={{ fontSize: '16px', color: '#64748b', margin: '8px 0 0 0' }}>يرجى اختيار القسم البرمجي والمحرك التربوي المطلوب لبدء الحصة التفاعلية المخصصة:</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* خيار مركز الدروس والتحضير */}
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #bae6fd', padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '2px solid #f0f9ff', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>📚</span>
                  <h3 style={{ fontSize: '24px', color: '#0369a1', margin: '0', fontWeight: 'bold' }}>منصة الدروس والأنشطة</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '12px 0 24px 0', textAlign: 'justify' }}>عرض محتويات المحاور والكتب المنهجية، وتفعيل خطة التحضير اليومية المعتمدة للوزارة، وتوليد الأنشطة البديلة الفورية وصفر تكلفة لإدارة الصفوف الكثيفة.</p>
                <button onClick={() => setNavigationPage('lessons_page')} style={{ backgroundColor: '#0284c7', color: '#fff', fontWeight: 'bold', border: 0, padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', marginTop: 'auto', fontFamily: 'Cairo' }}>
                  🚪 دخول لصفحة المادة والتحضير الصفّي
                </button>
              </div>

              {/* خيار مركز قياس وصياغة الامتحانات والطباعة */}
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #bae6fd', padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '2px solid #f0f9ff', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>📝</span>
                  <h3 style={{ fontSize: '24px', color: '#0369a1', margin: '0', fontWeight: 'bold' }}>إعداد الامتحانات والاختبارات</h3>
                </div>
                <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '12px 0 24px 0', textAlign: 'justify' }}>بناء وتوليد اختبارات التقويم الأول والثاني والنهائي بشكل تكتيكي دقيق، وتوزيع حقول العلامات والفقرات بالتساوي، مع طباعة الأوراق الرسمية المعتمدة للمدرسة فوراً.</p>
                <button onClick={() => setNavigationPage('exams_page')} style={{ backgroundColor: '#0369a1', color: '#fff', fontWeight: 'bold', border: 0, padding: '14px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', marginTop: 'auto', fontFamily: 'Cairo' }}>
                  🚪 دخول لصفحة بناء وضبط الامتحانات
                </button>
              </div>
            </div>

          </div>
        </>
      )}

      {/* 📖 شاشة مركز المادة والخطط (القائمة الجانبية + محرك محتوى الدرس المزدوج) */}
      {navigationPage === 'lessons_page' && (
        <>
          <Navbar teacherName={teacherName} schoolName={schoolName} directorateName={directorateName} onLogout={handleLogout} />
          <div style={{ display: 'flex', flex: 1 }}>
            <Sidebar 
              curriculumData={curriculumIndex}
              onSelectLesson={handleSelectLesson}
              selectedLessonId={selectedLesson}
              currentGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              currentSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              currentUnitsList={currentUnitsList}
              selectedUnit={selectedUnit}
              setSelectedUnit={setSelectedUnit}
              onBackToDashboard={() => setNavigationPage('dashboard')}
            />
            <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', height: 'calc(100vh - 72px)', boxSizing: 'border-box' }}>
              {selectedLesson ? (
                /* استدعاء المكون المحدث مع تمرير دالة العودة للوحة الرئيسية */
                <LessonView 
                  lessonData={activeLessonData} 
                  teacherName={teacherName} 
                  onBackToDashboard={() => setNavigationPage('dashboard')} 
                />
              ) : (
                <div style={{ backgroundColor: '#ffffff', padding: '48px', borderRadius: '24px', textAlign: 'center', fontFamily: 'Cairo' }}>
                  <h3>يرجى اختيار درس من الفهرس الجانبي لبدء تصفح كامل الخطط والأدوات التفاعلية</h3>
                </div>
              )}
            </main>
          </div>
        </>
      )}

      {/* 📝 شاشة مركز صياغة الامتحانات المستقل للطباعة النظيفة */}
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
              allSemesterLessons={allSemesterLessons}
            />
          </div>
        </>
      )}

    </div>
  );
}

export default App;
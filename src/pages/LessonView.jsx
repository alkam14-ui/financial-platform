import React, { useState, useEffect, useRef } from 'react';

// مخزن الأنشطة البديلة التوليدية المخصصة للحصص الكثيفة وصفر تكلفة
const shapesActivitiesPool = [
  "يقسم الصف إلى 6 مجموعات، كل مجموعة تمثل حقبة تاريخية (مجموعة المقايصة بالتمر، مجموعة النقود الورقية، مجموعة العملات الرقمية). يطلب المعلم من كل مجموعة إقناع المجموعات الأخرى بقبول وسيلتها لشراء 'علبة ماء خيالية'، ليستنتج الطلاب ميزات وعيوب كل شكل يدوياً وصفر تكلفة.",
  "تحدي 'مزاد المقاعد الصامت': يطلب المعلم من الطلاب محاولة مقايضة أشيائهم الخاصة (قلم، دفتر، ممحاة) مع جيرانهم دون التحدث نهائياً ولمدة دقيقتين، ثم يناقش معهم الصعوبة التي واجهوها لاستنتج كيف جاءت النقود والعملات لتختصر هذا العناء.",
  "نشاط 'تتبع رحلة الدينار الأردني الحركي': يطلب المعلم من ثلاثة طلاب الوقوف لتمثيل دور المشتري والتاجر والبنك، والقيام بمحاكاة ملموسة لانتقال الأوراق المالية الإلكترونية والورقية لتثبيت خصائص الأنواع المعاصرة."
];

const distinctionActivitiesPool = [
  "لعبة Mظلة والمطر المعرفي: يرسم المعلم دائرة عملاقة على السبورة باسم 'مظلة المال الكبرى'، ويكتب خارجها أصولاً مبعثرة (ذهب، شيك، ساعة، قمح، دينار). يطلب من الطلاب إدخال الأصول التي تصلح كمال داخلها، وتلوين العملات الحكومية بلون مستقل ليدركوا أن النقود جزء من مظلة المال الأشمل.",
  "نشاط 'محكمة المصطلحات التنافسية': يختار المعلم طالبين، أحدهما يدافع عن مفهوم 'المال' والآخر عن 'النقود' ويقوم بقية طلاب الصف بدور لجنة التحكيم لفرز وتصنيف الأوراق المالية البنكية والشيكات لتحديد المفهوم الأشمل.",
  "تحدي 'خزنة الأسرار والبطاقات': يعرض المعلم على الطلاب رسمة لبطاقة صراف آلي، ويدير عصفاً ذهنياً لاستنتاج هل الرصيد الرقمي يمثل مالاً أم نقداً قانونياً، لترسيخ الفروق الحرفية الواردة في الدليل."
];

function LessonView({ lessonData, teacherName, onBackToDashboard }) {
  // --- حالات الميزات التوليدية والأدوات الذكية ---
  const [activeSmartTab, setActiveSmartTab] = useState('plan');
  const [activeStep, setActiveStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 دقيقة بثوانيها
  const [timerRunning, setTimerRunning] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isPicking, setIsPicking] = useState(false);
  const [showPrepModel, setShowPrepModel] = useState(false);

  // حالة للتحكم بظهور وإخفاء الإجابات النموذجية لكل سؤال بشكل مستقل
  const [visibleAnswers, setVisibleAnswers] = useState({});

  const toggleAnswer = (id) => {
    setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [showShapesAct, setShowShapesAct] = useState(false);
  const [shapesActIndex, setShapesActIndex] = useState(0);
  const [showDistinctionAct, setShowDistinctionAct] = useState(false);
  const [distinctionActIndex, setDistinctionActIndex] = useState(0);

  const timerRef = useRef(null);

  const students = [
    "أحمد اليوسف", "محمد عبيدات", "يوسف جرادات", "عمر المصري", 
    "حمزة الشريف", "عبد الرحمن الزعبي", "سند الحايك", "كرم الخالدي", 
    "ليث الضامن", "زيد العتوم", "رعد القضاة", "هاشم المومني", 
    "علي بني هاني", "إبراهيم غرايبة", "صالح الرشدان", "سيف الدين"
  ];

  const steps = [
    { id: 1, title: "التهيئة واستدراج المعارف (عصف ذهني)", duration: "5 دقائق", durationSeconds: 300, activity: "طرح سؤال عام مثير للتفكير: 'لو كنت مسؤولاً عن ميزانية الأسرة، كيف ستتصرف؟'.", tips: "شجع الطلاب على تقديم إجابات متنوعة دون إصدار أحكام فورية." },
    { id: 2, title: "الاستكشاف وبناء المفاهيم المدرسية", duration: "10 دقائق", durationSeconds: 600, activity: "قراءة ومناقشة فقرات الدرس الرسمية وتكليف الطلاب بتلخيص النقاط الهامة في دفاترهم المخصصة.", tips: "اكتب المصطلحات الرئيسية على السبورة وتأكد من تدوينها من قِبل الجميع." },
    { id: 3, title: "النشاط التطبيقي للمجموعات الكثيفة", duration: "15 دقيقة", durationSeconds: 900, activity: "توزيع أوراق عمل تتضمن سيناريوهات مالية تطبيقية، والطلب من الطلاب العمل في مجموعات الدليل الحركي.", tips: "تجول بين المجموعات لتقديم الدعم والتأكد من مشاركة الجميع." },
    { id: 4, title: "الالتقاط والتقييم التكويني الختامي", duration: "10 دقائق", durationSeconds: 600, activity: "عرض أسئلة سريعة وصح/خطأ على السبورة، وإجابة المجموعات وتعيين أسئلة 'أقيم تعلمي' كواجب مدرسي للبيت.", tips: "أثنِ على المتميزين وقدم التغذية الراجعة الإيجابية الشاملة للصف." }
  ];

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, timeLeft]);

  useEffect(() => {
    if (!timerRunning) return;
    const elapsedSeconds = 2400 - timeLeft;
    let currentStepIndex = 0;
    let accumulatedTime = 0;
    
    for (let i = 0; i < steps.length; i++) {
      accumulatedTime += steps[i].durationSeconds;
      if (elapsedSeconds < accumulatedTime) {
        currentStepIndex = i;
        break;
      }
      if (i === steps.length - 1) currentStepIndex = steps.length - 1;
    }
    if (currentStepIndex !== activeStep) setActiveStep(currentStepIndex);
  }, [timeLeft, timerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePickStudent = () => {
    setIsPicking(true);
    setSelectedStudent('جاري تدوير الأسماء واختيار طالب...');
    let counter = 0;
    const interval = setInterval(() => {
      const randomName = students[Math.floor(Math.random() * students.length)];
      setSelectedStudent(randomName);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 100);
  };

  const handleCopyWhatsapp = () => {
    const text = document.getElementById('whatsapp-text-box')?.innerText || "";
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const [prepList, setPrepList] = useState([
    { id: 1, text: "تحضير المادة العلمية للدرس وعرضها بشكل منظم.", checked: false },
    { id: 2, text: "تأمين أوراق العمل المطبوعة للنشاط الجماعي المخصص للـ 40 طالباً.", checked: false },
    { id: 3, text: "كتابة الأهداف التعليمية للدرس بوضوح على السبورة.", checked: false },
    { id: 4, text: "تجهيز بطاقات الأرقام والمشابك لتوزيع مجموعات الدليل الحركي.", checked: false }
  ]);

  const whatsappMessage = `السلام عليكم ورحمة الله وبركاته، أهالي طلاب الصف الكرام 🌹
لقد أنهينا اليوم بحمد الله درس الثقافة المالية بعنوان *(${lessonData?.lesson_title || "مفهوم المال وأشكاله"})* لخطة الحصة التفاعلية المخصصة.

*أهم ما تعلمه الطلاب اليوم:*
1️⃣ المفاهيم الأساسية للدرس وكيفية ربطها بالتطبيق العملي والتخطيط المالي السليم.
2️⃣ ممارسات استهلاكية إيجابية وإدارة الموارد المالية الشخصية بطريقة تحقق الاستقرار والاستدامة.

*النشاط التفاعلي للـ 40 طالباً حركياً:*
شارك الطلاب بنشاط حركي غامر ومنظم داخل الغرفة الصفية لتجسيد المفاهيم بمسؤولية كاملة وصفر تكلفة.

*الواجب المنزلي:*
يرجى حث أبنائنا المتميزين على حل أسئلة تقويم الدرس في الكتاب المدرسي وتثبيتها على الدفاتر.

*معلم المادة: الأستاذ ${teacherName || ""}* 👨‍🏫`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'Cairo, sans-serif', color: '#1e293b' }}>
      
      {copiedToast && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', backgroundColor: '#16a34a', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, fontWeight: 'bold' }}>
          ✓ تم نسخ رسالة بث الواجب المنزلي للأهالي بنجاح!
        </div>
      )}

      {/* الرأس العلوي لمعلومات الدرس الفعلي ونظام التنقل للداش بورد */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
        <div>
          <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 'bold' }}>تحضير خطة الدرس والمادة العلمية للحصة</span>
          <h2 style={{ fontSize: '26px', color: '#0369a1', margin: '4px 0', fontWeight: '900' }}>{lessonData?.lesson_title || "مفهوم المال وأشكاله"}</h2>
        </div>
        <button onClick={onBackToDashboard} style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '2px solid #0284c7', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Cairo' }}>
          🔙 العودة للوحة التحكم الرئيسية
        </button>
      </div>

      {/* 💻 شاشة العرض المزدوجة المتكاملة */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* العمود الأول (اليمين): نصوص المادة المنهجية الكاملة مأخوذة مباشرة من الـ JSON */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* نتاجات التعلم */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', borderRight: '5px solid #0369a1' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px 0', fontWeight: 'bold', borderBottom: '1px solid #edf2f7', paddingBottom: '6px' }}>🎯 نتاجات الدرس ومخرجات التعلم المعتمدة</h3>
            <ul style={{ margin: '0', paddingRight: '20px', listStyleType: 'disc', lineHeight: '1.8' }}>
              {lessonData?.learning_outcomes?.map((outcome, idx) => (
                <li key={idx} style={{ fontSize: '16px', color: '#2d3748' }}>{outcome}</li>
              )) || <li>يتعرف الطالب على المفاهيم المنهجية المحددة للدرس المختار ويطبقها في ممارساته اليومية.</li>}
            </ul>
          </section>

          {/* مرحلة أستكشف */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px 0', fontWeight: 'bold', borderBottom: '1px solid #edf2f7', paddingBottom: '6px' }}>🧭 {lessonData?.exploration_stage?.title || "مرحلة أستكشف"}</h3>
            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#4a5568', margin: '0 0 8px 0' }}>الاستراتيجية الموصى بها: {lessonData?.exploration_stage?.pedagogy_method || "العصف الذهني والحوار الموجه"}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lessonData?.exploration_stage?.prompts?.map((prompt, idx) => (
                <p key={idx} style={{ fontSize: '16px', margin: 0, lineHeight: '1.7', color: '#2d3748' }}>• {prompt}</p>
              ))}
            </div>
          </section>

          {/* المفاهيم والمصطلحات */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px 0', fontWeight: 'bold', borderBottom: '1px solid #edf2f7', paddingBottom: '6px' }}>📖 المفاهيم والمصطلحات الأساسية للدرس</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {lessonData?.core_vocabulary?.map((vocab, idx) => (
                <div key={idx} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', borderRight: '4px solid #27ae60' }}>
                  <strong style={{ color: '#27ae60', fontSize: '16px', display: 'block', marginBottom: '4px' }}>{vocab.term}</strong>
                  <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.6', color: '#4a5568' }}>{vocab.definition}</p>
                </div>
              ))}
            </div>
          </section>

          {/* تفاصيل الشرح وأشكال المال وأزرار التوليد المقترنة بها */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px 0', fontWeight: 'bold', borderBottom: '1px solid #edf2f7', paddingBottom: '6px' }}>💰 {lessonData?.shapes_of_money?.title || "أشكال المال"}</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#2d3748', margin: '0 0 14px 0', textAlign: 'justify' }}>{lessonData?.shapes_of_money?.context}</p>
            
            {lessonData?.shapes_of_money?.types && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                {lessonData.shapes_of_money.types.map((type) => (
                  <div key={type.number} style={{ backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
                    <strong style={{ color: '#0369a1', fontSize: '15px' }}>شكل {type.number}: {type.name}</strong>
                    <p style={{ fontSize: '13.5px', margin: '4px 0 0 0', color: '#4a5568', lineHeight: '1.5' }}>{type.details}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px dashed #bae6fd', paddingTop: '14px', display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowShapesAct(!showShapesAct); if(!showShapesAct) setShapesActIndex(0); }} style={{ backgroundColor: '#0284c7', color: '#fff', border: '0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13.5px' }}>
                {showShapesAct ? "❌ إخفاء النشاط المولد" : "✨ توليد نشاط بديل لهذه الفقرة"}
              </button>
              {showShapesAct && (
                <button onClick={() => setShapesActIndex((prev) => (prev + 1) % shapesActivitiesPool.length)} style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '1px solid #0284c7', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13.5px' }}>
                  🔄 توليد خيار بديل آخر
                </button>
              )}
            </div>
            {showShapesAct && (
              <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #2563eb', marginTop: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e40af', marginBottom: '4px' }}>⚙️ نشاط بديل ومبتكر للمعلم (النموذج رقم {shapesActIndex + 1}):</strong>
                <p style={{ fontSize: '15px', color: '#1e3a8a', margin: 0, lineHeight: '1.7' }}>{shapesActivitiesPool[shapesActIndex]}</p>
              </div>
            )}
          </section>

          {/* الفروق الجوهرية (المال والنقود) والأنشطة التوليدية المقترنة بها */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd', borderRight: '5px solid #0284c7' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px 0', fontWeight: 'bold', borderBottom: '1px solid #edf2f7', paddingBottom: '6px' }}>⚖️ {lessonData?.critical_distinction?.title || "محور الفروร الجوهرية والتحكيم المعرفي"}</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#2d3748', margin: '0 0 12px 0' }}>{lessonData?.critical_distinction?.intro}</p>
            
            {lessonData?.critical_distinction?.money_section && (
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                <strong style={{ color: '#0369a1', fontSize: '15px', display: 'block', marginBottom: '4px' }}>{lessonData.critical_distinction.money_section.definition}</strong>
                {lessonData.critical_distinction.money_section.examples.map((ex, idx) => (
                  <p key={idx} style={{ fontSize: '14.5px', margin: '2px 10px 0 0', color: '#4a5568' }}>• {ex}</p>
                ))}
              </div>
            )}
            {lessonData?.critical_distinction?.currency_details && (
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '15px', margin: 0, lineHeight: '1.6', color: '#2d3748' }}><strong style={{ color: '#0369a1' }}>النقود القانونية:</strong> {lessonData.critical_distinction.currency_details.definition}</p>
              </div>
            )}

            <div style={{ borderTop: '1px dashed #bae6fd', paddingTop: '14px', display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => { setShowDistinctionAct(!showDistinctionAct); if(!showDistinctionAct) setDistinctionActIndex(0); }} style={{ backgroundColor: '#0284c7', color: '#fff', border: '0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13.5px' }}>
                {showDistinctionAct ? "❌ إخفاء النشاط المولد" : "✨ توليد نشاط تمايز بديل للفقرة"}
              </button>
              {showDistinctionAct && (
                <button onClick={() => setDistinctionActIndex((prev) => (prev + 1) % distinctionActivitiesPool.length)} style={{ backgroundColor: '#ffffff', color: '#0284c7', border: '1px solid #0284c7', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13.5px' }}>
                  🔄 توليد خيار بديل آخر
                </button>
              )}
            </div>
            {showDistinctionAct && (
              <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #2563eb', marginTop: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#1e40af', marginBottom: '4px' }}>⚙️ نشاط تمايز ودعم الفروق الفردية (النموذج رقم {distinctionActIndex + 1}):</strong>
                <p style={{ fontSize: '15px', color: '#1e3a8a', margin: 0, lineHeight: '1.7' }}>{distinctionActivitiesPool[distinctionActIndex]}</p>
              </div>
            )}
          </section>
{/* قسم الأنشطة الصفية */}
      {lessonData.classroom_activities && lessonData.classroom_activities.length > 0 && (
        <div style={{ marginTop: '30px', backgroundColor: '#f0fdfa', padding: '24px', borderRadius: '16px', border: '2px solid #ccfbf1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px' }}>🛠️</span>
            <h3 style={{ fontSize: '22px', color: '#0f766e', margin: '0', fontWeight: 'bold' }}>الأنشطة الصفية التفاعلية</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {lessonData.classroom_activities.map((activity, index) => (
              <div key={index} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #99f6e4', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <h4 style={{ fontSize: '18px', color: '#115e59', marginTop: '0', marginBottom: '12px', fontWeight: 'bold' }}>
                  {activity.title}
                </h4>
                
                {activity.allocated_time_minutes && (
                  <div style={{ display: 'inline-block', backgroundColor: '#ccfbf1', color: '#0f766e', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>
                    ⏱️ الوقت المخصص: {activity.allocated_time_minutes} دقائق
                  </div>
                )}
                
                {activity.objective && (
                  <p style={{ fontSize: '15px', color: '#334155', fontWeight: 'bold', marginBottom: '10px' }}>
                    🎯 {activity.objective}
                  </p>
                )}
                
                {activity.tools && (
                  <p style={{ fontSize: '14px', color: '#475569', marginBottom: '15px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    🧰 <span style={{ fontWeight: 'bold' }}>الأدوات:</span> {activity.tools.replace('الأدوات:', '')}
                  </p>
                )}

                <div style={{ marginTop: '15px' }}>
                  <strong style={{ fontSize: '15px', color: '#1e293b' }}>📝 خطوات التنفيذ:</strong>
                  <ul style={{ paddingRight: '20px', marginTop: '10px', color: '#475569', lineHeight: '1.7', fontSize: '15px' }}>
                    {activity.steps.map((step, i) => (
                      <li key={i} style={{ marginBottom: '8px' }}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
{/* أسئلة أقيم تعلمي الختامية للدرس */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <h3 style={{ fontSize: '20px', color: '#0369a1', margin: '0 0 12px 0', fontWeight: 'bold', borderBottom: '1px solid #edf2f7', paddingBottom: '6px' }}>✏️ أسئلة تقويم الأداء وتأكيد التعلم (أقيم تعلمي)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              {lessonData?.assessment_questions?.map((q) => (
                <div key={q.id} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  
                  {/* رأس السؤال وزر الإظهار */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '16px', margin: 0, fontWeight: 'bold', color: '#1e293b' }}>{q.question_text}</p>
                      
                      {/* الفروع الخاصة بالصح والخطأ أو الدوائر */}
                      {q.sub_questions && q.sub_questions.map((sub, sIdx) => (
                        <p key={sIdx} style={{ fontSize: '14.5px', margin: '6px 12px 0 0', color: '#475569' }}>
                          • {sub.text} 
                          {/* الشرط هنا: لن يظهر مفتاح الإجابة إلا إذا تم الضغط على الزر */}
                          {sub.correct_answer && visibleAnswers[q.id] && (
                            <span style={{ color: '#059669', fontWeight: 'bold' }}> (مفتاح الإجابة: {sub.correct_answer})</span>
                          )}
                        </p>
                      ))}
                    </div>
                    
                    {/* زر عرض الإجابة النموذجية */}
                    {q.model_answer && (
                      <button 
                        onClick={() => toggleAnswer(q.id)}
                        style={{ backgroundColor: visibleAnswers[q.id] ? '#f1f5f9' : '#e0f2fe', color: visibleAnswers[q.id] ? '#475569' : '#0284c7', border: '1px solid', borderColor: visibleAnswers[q.id] ? '#cbd5e1' : '#bae6fd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13.5px', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                      >
                        {visibleAnswers[q.id] ? "🙈 إخفاء الإجابة" : "👁️ عرض الإجابة النموذجية"}
                      </button>
                    )}
                  </div>

                  {/* مربع الإجابة النموذجية المنسق */}
                  {q.model_answer && visibleAnswers[q.id] && (
                    <div style={{ marginTop: '16px', padding: '14px', backgroundColor: '#ecfdf5', borderRight: '4px solid #10b981', borderRadius: '8px' }}>
                      <strong style={{ color: '#047857', fontSize: '14.5px', display: 'block', marginBottom: '6px' }}>💡 الإجابة النموذجية المعتمدة:</strong>
                      <p style={{ margin: 0, fontSize: '15px', color: '#065f46', lineHeight: '1.7' }}>{q.model_answer}</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </section>
        </div>

        {/* العمود الثاني (اليسار): أدوات المعلم ومؤقت مراحل الحصة الأربع والقرعة العشوائية */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* مؤقت مراحل الحصة وإدارة الأربعين دقيقة */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '2px solid #0284c7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '2px solid #f0f9ff', paddingBottom: '10px' }}>
              <span style={{ fontSize: '24px' }}>⏱️</span>
              <strong style={{ fontSize: '18px', color: '#0369a1' }}>مؤقت وإدارة خطة الحصة التنازلية (40 دقيقة)</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', fontFamily: 'monospace', background: '#fff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>المرحلة الصفية النشطة حالياً:</span>
                <strong style={{ fontSize: '14.5px', color: '#0284c7' }}>{steps[activeStep].title}</strong>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setTimerRunning(!timerRunning)} style={{ backgroundColor: timerRunning ? '#e74c3c' : '#16a34a', color: '#fff', border: 0, padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', fontFamily: 'Cairo' }}>
                  {timerRunning ? "إيقاف" : "تشغيل"}
                </button>
                <button onClick={() => { setTimerRunning(false); setTimeLeft(2400); setActiveStep(0); }} style={{ backgroundColor: '#64748b', color: '#fff', border: 0, padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', fontFamily: 'Cairo' }}>
                  تصفير
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {steps.map((step, idx) => (
                <div 
                  key={step.id} 
                  onClick={() => { setActiveStep(idx); const remaining = steps.slice(idx).reduce((acc, s) => acc + s.durationSeconds, 0); setTimeLeft(remaining); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', border: '1px solid', backgroundColor: activeStep === idx ? '#e0f2fe' : '#ffffff', borderColor: activeStep === idx ? '#0284c7' : '#e2e8f0', cursor: 'pointer' }}
                >
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: activeStep === idx ? '#0284c7' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>{idx + 1}</span>
                  <span style={{ flex: 1, fontSize: '13.5px', fontWeight: activeStep === idx ? 'bold' : 'normal', color: activeStep === idx ? '#0369a1' : '#1e293b' }}>{step.title}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{step.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* تبويبات الإجراءات والدليل الحركي للـ 40 طالباً */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <nav style={{ display: 'flex', gap: '4px', borderBottom: '2px solid #bae6fd', paddingBottom: '8px', marginBottom: '14px' }}>
              <button onClick={() => setActiveSmartTab('plan')} style={{ backgroundColor: activeSmartTab === 'plan' ? '#0284c7' : 'transparent', color: activeSmartTab === 'plan' ? '#fff' : '#0284c7', border: 0, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13px' }}>📋 إجراءات خطة الحصة</button>
              <button onClick={() => setActiveSmartTab('kinetic')} style={{ backgroundColor: activeSmartTab === 'kinetic' ? '#0284c7' : 'transparent', color: activeSmartTab === 'kinetic' ? '#fff' : '#0284c7', border: 0, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13px' }}>🏃‍♂️ الدليل الحركي للتنظيم</button>
              <button onClick={() => setActiveSmartTab('whatsapp')} style={{ backgroundColor: activeSmartTab === 'whatsapp' ? '#0284c7' : 'transparent', color: activeSmartTab === 'whatsapp' ? '#fff' : '#0284c7', border: 0, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo', fontSize: '13px' }}>📱 رسالة الواجب للأهالي</button>
            </nav>

            <div style={{ minHeight: '160px', fontSize: '14px', lineHeight: '1.6' }}>
              {activeSmartTab === 'plan' && (
                <div>
                  <strong style={{ color: '#0369a1', display: 'block', marginBottom: '4px' }}>💻 تكتيك وعمل المرحلة النشطة حالياً صفيّاً:</strong>
                  <p style={{ margin: '0 0 8px 0', color: '#334155', fontSize: '14.5px' }}>{steps[activeStep].activity}</p>
                  <div style={{ background: '#f0f9ff', padding: '10px 12px', borderRadius: '6px', borderRight: '3px solid #0284c7', fontSize: '13.5px', color: '#0369a1' }}>
                    <strong>💡 توجيه وإدارة الصف الكثيف:</strong> {steps[activeStep].tips}
                  </div>
                </div>
              )}

              {activeSmartTab === 'kinetic' && (
                <div>
                  <strong style={{ color: '#27ae60', display: 'block', marginBottom: '4px' }}>🏃‍♂️ هندسة حركة وتوزيع الـ 40 طالباً صفياً:</strong>
                  <p style={{ color: '#475569', margin: '0 0 8px 0', fontSize: '14px' }}>يتم تقسيم الصف الكثيف شجرياً إلى 4 مجموعات رئيسية متكافئة (10 طلاب لكل مجموعة)، ويحدد لكل طالب دور تكتيكي مباشر (القائد، الموثق، المتحدث، الأعضاء الحركيون) لضمان أعلى مشاركة تنظيمية ومنع الضوضاء.</p>
                  <span style={{ fontSize: '12.5px', color: '#0284c7', background: '#e0f2fe', padding: '6px 10px', borderRadius: '4px', display: 'inline-block' }}>🚷 <strong>قاعدة الحركة:</strong> يتحرك القادة والمتحدثون الرسميون فقط بالتناوب لتسليم واستعراض النتائج أمام الصف، ويبقى الـ 36 طالباً في مقاعدهم للتشاور ثنائياً بهدوء تام.</span>
                </div>
              )}

              {activeSmartTab === 'whatsapp' && (
                <div>
                  <div id="whatsapp-text-box" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '8px', fontSize: '13px', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: '#0369a1', marginBottom: '10px' }}>
                    {whatsappMessage}
                  </div>
                  <button onClick={handleCopyWhatsapp} style={{ backgroundColor: '#16a34a', color: '#fff', border: 0, padding: '10px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo', width: '100%', fontSize: '14px' }}>
                    📋 نسخ نص رسالة البث ومشاركتها مع الأهالي
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* محرك القرعة العشوائية */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <strong style={{ fontSize: '14.5px', color: '#1e293b', display: 'block', marginBottom: '6px' }}>🎲 محرك القرعة والسحب العشوائي (تكافؤ الفرص والعدالة في الصف الكثيف):</strong>
            <div style={{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '10px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: isPicking ? '#0284c7' : '#0f172a', marginBottom: '10px', minHeight: '28px' }}>
              {selectedStudent || "إضغط على الزر لسحب اسم الطالب المشارك التالي"}
            </div>
            <button onClick={handlePickStudent} disabled={isPicking} style={{ backgroundColor: '#0284c7', color: '#fff', border: 0, padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Cairo', width: '100%', fontSize: '14px', opacity: isPicking ? 0.7 : 1 }}>
              {isPicking ? "جاري سحب عينة الاسم العشوائية..." : "⚡ تدوير الأسماء وسحب طالب عشوائي"}
            </button>
          </div>

          {/* مهام التحضير المسبق للمعلم */}
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <strong style={{ fontSize: '15px', color: '#1e293b', display: 'block', marginBottom: '10px', borderBottom: '1px solid #edf2f7', paddingBottom: '4px' }}>📋 مهام التحضير المسبق السريع للمعلم:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {prepList.map(item => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#4a5568', cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.checked} onChange={() => setPrepList(prepList.map(p => p.id === item.id ? { ...p, checked: !p.checked } : p))} style={{ marginTop: '3px', cursor: 'pointer', width: 'auto' }} />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 📋 نموذج تحضير الوزارة اليومي الرسمي كامل الأركان وباللغة العربية */}
      <div style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px dashed #bae6fd', marginTop: '10px' }}>
        <button onClick={() => setShowPrepModel(!showPrepModel)} style={{ backgroundColor: '#ffffff', color: '#0284c7', fontWeight: '700', padding: '14px 28px', borderRadius: '12px', fontSize: '16px', border: '2px solid #bae6fd', cursor: 'pointer', fontFamily: 'Cairo' }}>
          {showPrepModel ? "❌ إخفاء نموذج تحضير الدرس اليومي للوزارة" : "📋 عرض نموذج تخطيط وتحضير الدرس اليومي الرسمي المقترح للوزارة"}
        </button>
      </div>

      {showPrepModel && (
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #bae6fd', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', color: '#0369a1', textAlign: 'center', margin: 0, fontWeight: 'bold' }}>📋 نموذج تخطيط الدروس اليومي المقترح للوزارة</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'rtl', border: '1px solid #cbd5e1' }}>
            <tbody>
              <tr>
                <th style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', width: '15%' }}>المبحث:</th>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', width: '18%' }}>الثقافة المالية</td>
                <th style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', width: '15%' }}>موضوع الدرس:</th>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', width: '35%' }}>{lessonData?.lesson_title || "مفهوم المال وأشكاله"}</td>
                <th style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', width: '10%' }}>عدد الحصص:</th>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', width: '7%' }}>1 حصة</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>عنوان الوحدة:</th>
                <td colSpan="2" style={{ padding: '12px', border: '1px solid #cbd5e1' }}>الوحدة الأولى: المال وأشكاله</td>
                <th style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>التعلم القبلي:</th>
                <td colSpan="2" style={{ padding: '12px', border: '1px solid #cbd5e1' }}>تحديد الفجوات المعرفية وربط خبرات الطلاب بممارساتهم المالية والشخصية اليومية حوارياً وبشكل ملموس.</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right' }}>النتاجات المستهدفة:</th>
                <td colSpan="5" style={{ padding: '12px', border: '1px solid #cbd5e1' }}>
                  <ul style={{ margin: 0, paddingRight: '20px', fontSize: '15px', lineHeight: '1.7', color: '#2d3748' }}>
                    {lessonData?.learning_outcomes?.map((outcome, idx) => (
                      <li key={idx}>{outcome}</li>
                    )) || (
                      <>
                        <li>تعرّف مفهوم المال وتمييز ميزاته الواردة في المنهج المعتمد.</li>
                        <li>التمييز الدقيق بين أشكال المال الورقية، الإلكترونية والشيكات.</li>
                        <li>استنتاج الفرق الجوهري والقانوني بين مفهوم المال ومفهوم النقود.</li>
                      </>
                    )}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f9ff', color: '#0369a1' }}>
                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', width: '20%' }}>مراحل الحصة</th>
                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', width: '40%' }}>دور المعلم Teacher Action</th>
                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'right', width: '30%' }}>دور المتعلم Learner Action</th>
                <th style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', width: '10%' }}>الزمن</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>1- التهيئة والاندماج</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>طرح أسئلة عصف ذهني تمهيدية موجهة ومثيرة للتفكير لربط خبرات الطلاب بممارساتهم الحياتية واليومية بالإنفاق وعرض النتاجات.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>يستمع بانتباه، ويستحضر ممارساته الحياتية السابقة بالإنفاق والمقصف، ويشارك بنقاش تفاعلي حواري هادئ.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>5 دقائق</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>2- الشرح وبناء المفاهيم</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>تبيان وشرح المفاهيم الحرفية (مثل المال، المقايضة، النقود) وتثبيتها على السبورة ومناقشتها لدعم التمايز بأسلوب علمي رصين وبأمثلة معاصرة من دليل المعرفي.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>يتفاعل مع مناقشة المصطلحات الجديدة ويدون ميزاتها وخصائصها في الدفاتر المخصصة ويدرك الفروق الدقيقة بين مظلة المال والنقود.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>20 دقيقة</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>3- التوسع والأنشطة البديلة</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>توجيه المجموعات الكثيفة لتنفيذ الأنشطة التعاونية الموضعية التوليدية البديلة المقترحة (مثل محاكاة الحقب التاريخية أو سلسلة العملات) وصفر تكلفة وبمسؤولية كاملة.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>يعمل تعاونياً بروح الفريق ضمن المجموعات الأربع الموزعة هندسياً حركياً ويصيغ مع زملائه الحلول والنتائج لسيناريو النشاط المولد.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>10 دقائق</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontWeight: 'bold', backgroundColor: '#f8fafc' }}>4- تأكيد التعلم والغلق الختامي</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>مراجعة وتلخيص شامل لمحاور الحصة الأساسية، وحل تدريبات وأسئلة تقويم 'أقيم تعلمي' المعتمدة، وبث رسالة تحدي الواجب المنزلي عبر الواتساب للأهالي.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', fontSize: '14.5px', lineHeight: '1.6' }}>يتأمل في تعلمه الفردي، ويثبت حلول الأسئلة والتدريبات الرسمية على الدفتر، ويسلم تذاكر الخروج للمعلم بشكل منظم حركياً وبكل هدوء.</td>
                <td style={{ padding: '12px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>5 دقائق</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default LessonView;
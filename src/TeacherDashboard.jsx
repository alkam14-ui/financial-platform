import React, { useState, useEffect, useRef } from 'react';
import lessonData7 from './data/curriculum_g7_s1.json';
import curriculumIndex from './data/curriculum_index.json';

export default function TeacherDashboard() {
  // Selectors State
  const [selectedGrade, setSelectedGrade] = useState('7');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedLesson, setSelectedLesson] = useState('مفهوم المال وأشكاله');
  
  // Interactive UI State
  const [showSmartGenerated, setShowSmartGenerated] = useState(false);
  const [activeTextbookTab, setActiveTextbookTab] = useState('explore');
  const [activeSmartTab, setActiveSmartTab] = useState('plan');
  
  // Lesson Plan and Active Step States
  const [activeStep, setActiveStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isPicking, setIsPicking] = useState(false);
  
  // Timer Reference
  const timerRef = useRef(null);

  // Helper to extract lessons dynamically from curriculum_index.json
  const getAvailableLessons = () => {
    const gradeData = curriculumIndex.grades[selectedGrade];
    if (!gradeData) return [];
    const semesterData = gradeData.semesters[selectedSemester];
    if (!semesterData) return [];
    
    let allLessons = [];
    semesterData.units.forEach(unit => {
      allLessons = [...allLessons, ...unit.lessons];
    });
    return allLessons;
  };

  // Helper to get unit title dynamically for the selected lesson
  const getUnitTitleForLesson = (lessonName) => {
    const gradeData = curriculumIndex.grades[selectedGrade];
    if (!gradeData) return 'الوعي المالي والاستهلاكي';
    const semesterData = gradeData.semesters[selectedSemester];
    if (!semesterData) return 'الوعي المالي والاستهلاكي';
    
    const unit = semesterData.units.find(u => u.lessons.includes(lessonName));
    return unit ? unit.unitTitle : 'الوعي المالي والاستهلاكي';
  };

  // Keep lesson synchronized when grade or semester changes
  useEffect(() => {
    const available = getAvailableLessons();
    if (available.length > 0) {
      if (!available.includes(selectedLesson)) {
        setSelectedLesson(available[0]);
      }
    }
    // Close the generated pane on switch
    setShowSmartGenerated(false);
    setActiveTextbookTab('explore');
    setTimerRunning(false);
    setTimeLeft(2400);
    setActiveStep(0);
  }, [selectedGrade, selectedSemester]);

  // Reset active step and timer when lesson changes
  useEffect(() => {
    setShowSmartGenerated(false);
    setActiveTextbookTab('explore');
    setTimerRunning(false);
    setTimeLeft(2400);
    setActiveStep(0);
  }, [selectedLesson]);

  // Helper to fetch data for currently selected lesson
  const getCurrentLessonData = () => {
    const isMainLesson = selectedGrade === '7' && selectedSemester === '1' && selectedLesson === 'مفهوم المال وأشكاله';
    
    if (isMainLesson) {
      return lessonData7;
    }

    // Dynamic Mock Database Generator for all other lessons in the index
    const mockLessonTitle = selectedLesson;
    const mockUnitTitle = getUnitTitleForLesson(selectedLesson);
    const gradeName = curriculumIndex.grades[selectedGrade]?.gradeName || 'الصف السابع الأساسي';
    
    return {
      subject: "الثقافة المالية",
      grade: gradeName,
      duration: "40 دقيقة",
      unitTitle: mockUnitTitle,
      lessonTitle: mockLessonTitle,
      differenceBetweenMaalAndNuqood: null,
      textbook: {
        explore: {
          title: "أستكشف (نشاط استهلالي تفاعلي)",
          content: `النشاط الاستكشافي لدرس (${mockLessonTitle}): يُطلب من الطلاب تقسيم أنفسهم إلى أزواج ثنائية. يتخيل الطالب الأول أنه بحاجة للخدمة أو السلعة المذكورة في موضوع الدرس، ويقترح حلولاً بديلة للحصول عليها. يستمر النقاش لمدة 3 دقائق ثم يطرح المعلم الأسئلة الاستكشافية التالية:\n1. ما هي العقبات الأساسية التي تتوقع مواجهتها عند تطبيق هذا المفهوم في الحياة اليومية؟\n2. كيف يسهم تنظيم هذه العملية في تحقيق استقرارك المالي؟`
        },
        terms: [
          {
            name: `${mockLessonTitle}`,
            definition: `المفهوم المالي الرئيسي للدرس ويعبر عن الآليات والضوابط الاقتصادية المنظمة له.`
          },
          {
            name: "التخطيط المالي (Financial Planning)",
            definition: "تنظيم الدخل والإنفاق ووضع الأهداف المالية قصيرة وطويلة الأجل وتطوير سبل تحقيقها."
          },
          {
            name: "الوعي الاستهلاكي (Consumer Awareness)",
            definition: "قدرة الفرد على تمييز جودة السلع وملاءمة أسعارها ومعرفة حقوقه وواجباته في السوق."
          }
        ],
        explanation: {
          title: `الشرح والمفاهيم لدرس (${mockLessonTitle})`,
          paragraphs: [
            {
              subtitle: "أولاً: الأهمية والمفهوم العام",
              body: `يعتبر درس (${mockLessonTitle}) من الركائز الأساسية لمبحث الثقافة المالية لطلبة (${gradeName})، حيث يسلط الضوء على بناء الثقافة الاستهلاكية والاستثمارية وتنمية السلوك المالي الرشيد لمواجهة متطلبات الحياة المعاصرة.`
            },
            {
              subtitle: "ثانياً: التطبيقات الواقعية والممارسات المثلى",
              body: `لتحقيق أقصى استفادة من هذا المفهوم، يجب على الطالب ربط المعرفة الصفية بالتطبيق العملي في حياته اليومية، كتقييم خيارات الإنفاق والموازنة الذاتية وتجنب القروض غير الضرورية.`
            }
          ]
        },
        assessment: {
          title: "أسئلة أقيم تعلمي (التقييم الختامي)",
          questions: [
            `السؤال الأول: وضح بالرسم أو الكتابة المفهوم الجوهري لدرس (${mockLessonTitle}).`,
            `السؤال الثاني: عدد ثلاثة من الممارسات المالية الإيجابية المرتبطة بهذا الدرس.`,
            `السؤال الثالث: اقترح حلاً لسيناريو واقعي يعاني فيه شخص من مشكلة متعلقة بالموضوع.`
          ]
        }
      },
      steps: [
        {
          id: 1,
          title: "التهيئة واستدراج المعارف (عصف ذهني)",
          duration: "5 دقائق",
          durationSeconds: 300,
          objective: `إثارة انتباه الطلاب لموضوع (${mockLessonTitle}) وربطه بخبراتهم.`,
          activity: `طرح سؤال عام مثير للتفكير: 'لو كنت مسؤولاً عن إدارة ميزانية هذا الموضوع، كيف كنت ستتصرف؟'. مشاركة الطلاب في مناقشة سريعة.`,
          tips: "شجع الطلاب على تقديم إجابات متنوعة دون إصدار أحكام فورية.",
          concepts: ["التهيئة", "العصف الذهني"]
        },
        {
          id: 2,
          title: "الاستكشاف وبناء المفاهيم",
          duration: "10 دقائق",
          durationSeconds: 600,
          objective: "استنتاج القوانين والمبادئ الأساسية للدرس بشكل جماعي.",
          activity: `قراءة ومناقشة فقرات الدرس الرسمية من علامة تبويب الشرح، وتكليف الطلاب بتلخيص النقاط الهامة في دفاترهم.`,
          tips: "اكتب المصطلحات الرئيسية على السبورة وتأكد من تدوينها من قِبل جميع الطلاب.",
          concepts: [mockLessonTitle, "المفاهيم الأساسية"]
        },
        {
          id: 3,
          title: "النشاط التطبيقي للمجموعات",
          duration: "15 دقيقة",
          durationSeconds: 900,
          objective: "تطبيق المبادئ النظرية للدرس في ورقة عمل عملية.",
          activity: "توزيع أوراق عمل تتضمن سيناريوهات مالية تطبيقية، والطلب من الطلاب العمل في مجموعات للتوصل للحل الأنسب.",
          tips: "تجول بين المجموعات لتقديم الدعم والتأكد من مشاركة جميع أفراد المجموعة.",
          concepts: ["التطبيق العملي", "العمل التعاوني"]
        },
        {
          id: 4,
          title: "التقييم التكويني والمراجعة",
          duration: "7 دقائق",
          durationSeconds: 420,
          objective: "التحقق من استيعاب الطلاب للمفاهيم الأساسية وتصحيح الأخطاء الشائعة.",
          activity: "عرض أسئلة سريعة وصح/خطأ على السبورة وإجابة المجموعات عنها بشكل تنافسي ممتع.",
          tips: "ركز على النقاط التي أظهر الطلاب صعوبة في فهمها أثناء النشاط العملي.",
          concepts: ["التقييم التكويني"]
        },
        {
          id: 5,
          title: "الغلق والواجب المنزلي",
          duration: "3 دقائق",
          durationSeconds: 180,
          objective: "تلخيص نقاط الدرس وتكليف الطلاب بالتقييم الذاتي والواجب.",
          activity: "طلب تلخيص شفهي سريع من أحد الطلاب، وتعيين أسئلة 'أقيم تعلمي' كواجب منزلي.",
          tips: "أثنِ على الطلاب المتميزين وقدم التغذية الراجعة الإيجابية للصف.",
          concepts: ["تذكرة الخروج", "الواجب المنزلي"]
        }
      ],
      concepts: [
        {
          title: mockLessonTitle,
          icon: "⚡",
          desc: `المبدأ الرئيسي المنظم لدرس (${mockLessonTitle}) والواجب فهمه جيداً.`
        },
        {
          title: "التخطيط والوعي المالي",
          icon: "📊",
          desc: "إدارة وتوجيه الموارد المالية المتاحة للفرد بطريقة تحقق الاستقرار الذاتي وتمنع الوقوع في الأزمات."
        }
      ],
      prepList: [
        `تحضير المادة العلمية لدرس (${mockLessonTitle}) وعرضها.`,
        "تأمين أوراق العمل المطبوعة للنشاط الجماعي والتأكد من عددها.",
        "كتابة الأهداف التعليمية للدرس على جانب السبورة.",
        "تجهيز بطاقات الأرقام لتوزيع المجموعات."
      ],
      students: [
        "أحمد اليوسف", "محمد عبيدات", "يوسف جرادات", "عمر المصري", 
        "حمزة الشريف", "عبد الرحمن الزعبي", "سند الحايك", "كرم الخالدي", 
        "ليث الضامن", "زيد العتوم", "رعد القضاة", "هاشم المومني", 
        "علي بني هاني", "إبراهيم غرايبة", "صالح الرشدان", "سيف الدين"
      ],
      kineticGuide: {
        title: `الدليل الحركي لتنظيم 40 طالباً في الصف الكثيف لدرس (${mockLessonTitle})`,
        intro: `دليل استراتيجي يهدف لتنظيم حركة 40 طالباً داخل الصف الكثيف أثناء تطبيق أنشطة درس (${mockLessonTitle})، لضمان أعلى مشاركة وأقل ضوضاء.`,
        grouping: {
          title: "توزيع المجموعات والأدوار للـ 40 طالباً:",
          details: `يتم تقسيم الطلاب إلى 4 مجموعات متكافئة (10 طلاب لكل مجموعة)، ويحدد لكل مجموعة دور محدد في محاكاة الدرس:\n• المجموعة الأولى: مجموعة 'التخطيط والتحليل'.\n• المجموعة الثانية: مجموعة 'التنفيذ والمحاكاة الميدانية'.\n• المجموعة الثالثة: مجموعة 'الرقابة المالية والتقييم'.\n• المجموعة الرابعة: مجموعة 'العرض والحلول البديلة'.\nداخل كل مجموعة، يعين المعلم: قائد المجموعة (لتنظيم الصف)، الموثق (لكتابة المعطيات)، المتحدث (للعرض)، و7 أعضاء متفاعلين حركياً.`
        },
        phases: [
          {
            time: "الدقيقة 0 - 10",
            phaseTitle: "مرحلة التفكير الانفرادي والتشاور الثنائي",
            action: "يقوم الطلاب بحل نشاط أستكشف في مقاعدهم ثنائياً. يتحرك قادة المجموعات فقط لتجميع الأفكار وتسجيلها لدى الموثقين.",
            movementRule: "حركة محدودة جداً لقادة المجموعات فقط. يبقى 36 طالباً في مقاعدهم للتشاور الهادئ."
          },
          {
            time: "الدقيقة 10 - 25",
            phaseTitle: "المناظرة الحركية للمجموعات الأربع",
            action: "يقوم قادة المجموعة الأولى والثانية بالانتقال للمساحة الأمامية للصف لمناقشة السيناريو المالي مع المعلم، بينما تقوم المجموعتان الثالثة والرابعة بالاستماع وتقييم الحوار وكتابة الملاحظات وتمريرها للقادة.",
            movementRule: "يتحرك القادة والمتحدثون فقط (4 طلاب) للمنطقة الأمامية. يمرر باقي الطلاب الأوراق يدوياً دون وقوف."
          },
          {
            time: "الدقيقة 25 - 35",
            phaseTitle: "صياغة الحلول المشتركة والتحكيم المالي",
            action: "تتكامل المجموعات وتصيغ كل مجموعة ورقة عمل نهائية للدرس. يتناوب متحدثو المجموعات لعرض النتائج أمام الصف في دقيقتين لكل مجموعة.",
            movementRule: "يقف المتحدث الرسمي لكل مجموعة في مكانه للتحدث، ويتحرك قادة المجموعات لتسليم ورقة العمل النهائية للمعلم."
          },
          {
            time: "الدقيقة 35 - 40",
            phaseTitle: "تذاكر الخروج والتقييم المنظم",
            action: "كتابة تذاكر الخروج وتمريرها للخلف حيث يجمعها الطالب الأخير ويسلمها للمعلم.",
            movementRule: "يتحرك فقط 4 طلاب (الطالب الأخير في كل صف) لتسليم التذاكر للمعلم لضمان خروج منظم."
          }
        ]
      }
    };
  };

  // Get active lesson data dynamically
  const currentLessonData = getCurrentLessonData();
  const steps = currentLessonData.steps;
  const students = currentLessonData.students;

  // WhatsApp Message dynamic generator
  const whatsappMessage = `السلام عليكم ورحمة الله وبركاته، أهالي طلاب الصف الكرام 🌹
لقد أنهينا اليوم بحمد الله درس الثقافة المالية بعنوان *(${currentLessonData.lessonTitle})* ضمن وحدة *(${currentLessonData.unitTitle})* لخطة الحصة التفاعلية (${currentLessonData.duration}).

*أهم ما تعلمه الطلاب اليوم:*
1️⃣ المفاهيم الأساسية لدرس (${currentLessonData.lessonTitle}).
2️⃣ كيفية ربط هذه المبادئ بالواقع العملي والتخطيط المالي السليم والمستدام.
${currentLessonData.differenceBetweenMaalAndNuqood ? `3️⃣ الفرق الدقيق بين المال والنقود:
   - *المال*: كل ما له قيمة مادية ملموسة أو معنوية ويمكن حيازته وتملكه والانتفاع به.
   - *النقود*: هي وسيط التبادل ومقياس القيم المقبول عاماً (وهي أخص من المال).
   - القاعدة الذهبية: *(كل نقودٍ مالٌ، وليس كل مالٍ نقوداً).*` : '3️⃣ ممارسات استهلاكية إيجابية وإدارة الموارد المالية الشخصية.'}

*النشاط التفاعلي للـ 40 طالباً:*
شارك الطلاب بنشاط حركي منظم داخل الغرفة الصفية لتجسيد المفاهيم والتداول والعمل التعاوني بمسؤولية كاملة.

*الواجب المنزلي:*
يرجى حث أبنائنا على حل أسئلة الدرس في الكتاب المدرسي.

شاكرين تعاونكم ومتابعتكم المستمرة لأبنائنا. 
*معلم المادة* 👨‍🏫`;

  // Timer Effect
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

  // Synchronize active step based on timer progression
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
      if (i === steps.length - 1) {
        currentStepIndex = steps.length - 1;
      }
    }
    
    if (currentStepIndex !== activeStep) {
      setActiveStep(currentStepIndex);
    }
  }, [timeLeft, timerRunning]);

  // Preparation Checklist State loaded dynamically
  const [prepList, setPrepList] = useState([]);
  
  useEffect(() => {
    setPrepList(
      currentLessonData.prepList.map((text, idx) => ({ id: idx + 1, text, checked: false }))
    );
    setCompletedSteps(new Array(steps.length).fill(false));
  }, [selectedLesson]);

  // Completed Steps State
  const [completedSteps, setCompletedSteps] = useState([]);

  // Time Formatter
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setTimerRunning(!timerRunning);
  };

  const handleReset = () => {
    setTimerRunning(false);
    const totalRemainingAtStartOfStep = steps.slice(activeStep).reduce((acc, step) => acc + step.durationSeconds, 0);
    setTimeLeft(totalRemainingAtStartOfStep);
  };

  const handleResetAll = () => {
    setTimerRunning(false);
    setTimeLeft(2400);
    setActiveStep(0);
    setCompletedSteps(new Array(steps.length).fill(false));
  };

  const setTimerToStep = (index) => {
    setActiveStep(index);
    const totalRemaining = steps.slice(index).reduce((acc, step) => acc + step.durationSeconds, 0);
    setTimeLeft(totalRemaining);
  };

  const toggleStepCompleted = (index, e) => {
    e.stopPropagation();
    const newCompleted = [...completedSteps];
    newCompleted[index] = !newCompleted[index];
    setCompletedSteps(newCompleted);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopiedToast(true);
    setTimeout(() => {
      setCopiedToast(false);
    }, 3000);
  };

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(whatsappMessage);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handlePickStudent = () => {
    setIsPicking(true);
    setSelectedStudent('جاري الاختيار...');
    let counter = 0;
    const interval = setInterval(() => {
      const randomName = students[Math.floor(Math.random() * students.length)];
      setSelectedStudent(randomName);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 100);
  };

  const togglePrepItem = (id) => {
    setPrepList(
      prepList.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // SVGs for Icons
  const Icons = {
    BookOpen: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    ),
    Clock: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    ),
    Copy: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
    ),
    Share2: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    ),
    UserCheck: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
    ),
    Check: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    ),
    Play: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    ),
    Pause: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
    ),
    RotateCcw: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><polyline points="3 3 3 8 8 8"/></svg>
    ),
    Send: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    ),
    Sparkles: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>
    ),
    Info: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
    )
  };

  // Timer Circle Math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = (timeLeft / 2400) * 100;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="toast">
          <Icons.Check />
          <span>تم نسخ رسالة الواتساب إلى الحافظة بنجاح!</span>
        </div>
      )}

      {/* Selectors Bar & Subject Name */}
      <section className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          {/* Official Subject Header */}
          <div>
            <span style={{ 
              fontSize: '0.8rem', 
              color: 'var(--accent-gold)', 
              fontWeight: 800, 
              letterSpacing: '1px', 
              textTransform: 'uppercase',
              background: 'var(--accent-gold-glow)',
              padding: '0.25rem 0.75rem',
              borderRadius: '50px',
              border: '1px solid rgba(243, 198, 35, 0.3)'
            }}>
              المادة الرسمية: الثقافة المالية
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
              منصة التخطيط والتدريس التفاعلي الذكي
            </h2>
          </div>

          {/* Selectors Dropdowns */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Grade Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>اختر الصف:</label>
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 1.5rem 0.5rem 0.5rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Object.keys(curriculumIndex.grades).map((gradeKey) => (
                  <option key={gradeKey} value={gradeKey}>
                    {curriculumIndex.grades[gradeKey].gradeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>الفصل الدراسي:</label>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 1.5rem 0.5rem 0.5rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="1">الفصل الأول</option>
                <option value="2">الفصل الثاني</option>
              </select>
            </div>

            {/* Lesson Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>الدرس المقرّر:</label>
              <select 
                value={selectedLesson} 
                onChange={(e) => setSelectedLesson(e.target.value)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 1.5rem 0.5rem 0.5rem',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '220px'
                }}
              >
                {getAvailableLessons().map((les, index) => (
                  <option key={index} value={les}>{les}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Dynamic Warning for Demo selections */}
        {!(selectedGrade === '7' && selectedSemester === '1' && selectedLesson === 'مفهوم المال وأشكاله') && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>💡</span>
            <span>لقد اخترت درساً تجريبياً من الفهرس. لعرض المحتوى الكامل المكتوب من المنهاج الأردني المعتمد، يرجى اختيار <strong>الصف السابع ← الفصل الأول ← درس "مفهوم المال وأشكاله"</strong>.</span>
          </div>
        )}
      </section>

      {/* Main Page title & Generator Button */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📖</span>
            <span>كتاب الطالب: {currentLessonData.lessonTitle}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            وحدة: {currentLessonData.unitTitle} • {currentLessonData.grade} • المادة: {currentLessonData.subject}
          </p>
        </div>

        {/* The Smart Generator Button */}
        <button 
          className="btn btn-primary"
          onClick={() => setShowSmartGenerated(!showSmartGenerated)}
          style={{
            padding: '1rem 2rem',
            borderRadius: 'var(--border-radius-md)',
            fontSize: '1rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-gold) 0%, #eab308 100%)',
            boxShadow: '0 0 20px var(--accent-gold-glow)',
            border: '1px solid rgba(255,255,255,0.1)',
            animation: !showSmartGenerated ? 'pulse-button 2s infinite' : 'none'
          }}
        >
          <Icons.Sparkles />
          <span>{showSmartGenerated ? 'إخفاء الخطة الذكية والأنشطة' : 'توليد الأنشطة والخطط الذكية للحصص الكثيفة'}</span>
        </button>
      </section>

      {/* Custom Keyframe for the pulsing button */}
      <style>{`
        @keyframes pulse-button {
          0% { box-shadow: 0 0 0 0 rgba(243, 198, 35, 0.4); }
          70% { box-shadow: 0 0 20px 8px rgba(243, 198, 35, 0); }
          100% { box-shadow: 0 0 0 0 rgba(243, 198, 35, 0); }
        }
      `}</style>

      {/* Flexible Two-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showSmartGenerated ? '1fr 1.05fr' : '1fr',
        gap: '2rem',
        transition: 'all 0.5s ease-in-out'
      }}>

        {/* COLUMN 1: OFFICIAL TEXTBOOK (Default View - ALWAYS VISIBLE) */}
        <section className="glass-card" style={{ height: 'fit-content' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icons.BookOpen />
              <span>نص الكتاب المدرسي الرسمي (بالحرف دون تعديل)</span>
            </div>
          </div>

          {/* Textbook Navigation subtabs */}
          <nav className="tab-nav" style={{ marginTop: '1rem' }}>
            <button 
              className={`tab-btn ${activeTextbookTab === 'explore' ? 'active' : ''}`}
              onClick={() => setActiveTextbookTab('explore')}
            >
              أستكشف (نشاط استهلالي)
            </button>
            <button 
              className={`tab-btn ${activeTextbookTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTextbookTab('terms')}
            >
              المصطلحات
            </button>
            <button 
              className={`tab-btn ${activeTextbookTab === 'explanation' ? 'active' : ''}`}
              onClick={() => setActiveTextbookTab('explanation')}
            >
              الشرح والفرق بين المال والنقود
            </button>
            <button 
              className={`tab-btn ${activeTextbookTab === 'assessment' ? 'active' : ''}`}
              onClick={() => setActiveTextbookTab('assessment')}
            >
              أسئلة أقيم تعلمي
            </button>
          </nav>

          {/* Textbook Tabs Contents */}
          <div style={{ padding: '1rem 0', minHeight: '350px' }}>
            
            {/* SUBTAB 1: EXPLORE */}
            {activeTextbookTab === 'explore' && (
              <div style={{ animation: 'fade-in-textbook 0.3s ease' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1rem', fontWeight: 800 }}>
                  {currentLessonData.textbook.explore.title}
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-line', color: 'var(--text-primary)' }}>
                  {currentLessonData.textbook.explore.content}
                </p>
              </div>
            )}

            {/* SUBTAB 2: TERMS */}
            {activeTextbookTab === 'terms' && (
              <div style={{ animation: 'fade-in-textbook 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', fontWeight: 800 }}>
                  قائمة المصطلحات الرسمية المعتمدة
                </h3>
                {currentLessonData.textbook.terms.map((term, index) => (
                  <div 
                    key={index}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1rem',
                      borderLeft: '4px solid var(--accent-emerald)'
                    }}
                  >
                    <strong style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.25rem' }}>
                      {term.name}
                    </strong>
                    <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                      {term.definition}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* SUBTAB 3: EXPLANATION & DIFFERENCE */}
            {activeTextbookTab === 'explanation' && (
              <div style={{ animation: 'fade-in-textbook 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                  {currentLessonData.textbook.explanation.title}
                </h3>
                
                {/* Difference Highlight Section (unabbreviated) */}
                {currentLessonData.differenceBetweenMaalAndNuqood && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(243, 198, 35, 0.07) 0%, rgba(16, 185, 129, 0.07) 100%)',
                    border: '1px solid rgba(243, 198, 35, 0.25)',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <strong style={{ color: 'var(--accent-gold)', fontSize: '1.15rem', display: 'block', marginBottom: '0.5rem' }}>
                      🌟 {currentLessonData.differenceBetweenMaalAndNuqood.title} (هام جداً للطلاب)
                    </strong>
                    <p style={{ fontSize: '0.98rem', color: 'var(--text-primary)', lineHeight: 1.7, textAlign: 'justify' }}>
                      {currentLessonData.differenceBetweenMaalAndNuqood.content}
                    </p>
                  </div>
                )}

                {/* Paragraphs */}
                {currentLessonData.textbook.explanation.paragraphs.map((para, index) => (
                  <div key={index}>
                    <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)', marginBottom: '0.5rem', fontWeight: 700 }}>
                      {para.subtitle}
                    </h4>
                    <p style={{ fontSize: '0.98rem', lineHeight: 1.75, color: 'var(--text-secondary)', textAlign: 'justify', whiteSpace: 'pre-line' }}>
                      {para.body}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* SUBTAB 4: QUESTIONS */}
            {activeTextbookTab === 'assessment' && (
              <div style={{ animation: 'fade-in-textbook 0.3s ease' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1rem', fontWeight: 800 }}>
                  {currentLessonData.textbook.assessment.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentLessonData.textbook.assessment.questions.map((question, index) => (
                    <div 
                      key={index} 
                      style={{
                        background: 'rgba(0, 0, 0, 0.15)',
                        border: '1px solid var(--border-color)',
                        padding: '1.25rem',
                        borderRadius: '8px',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                      }}
                    >
                      <span style={{
                        background: 'var(--accent-emerald)',
                        color: 'var(--bg-primary)',
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        flexShrink: 0,
                        marginTop: '0.2rem'
                      }}>
                        {index + 1}
                      </span>
                      <p style={{ fontSize: '0.98rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {question}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <style>{`
            @keyframes fade-in-textbook {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </section>

        {/* COLUMN 2: SMART GENERATED PLAN (Conditionally Visible) */}
        {showSmartGenerated && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'slide-in-right-pane 0.5s ease-in-out' }}>
            
            {/* Split controls tab inside generated pane */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="card-title emerald">
                <Icons.Sparkles />
                <span>الخطط الذكية المتولدة للحصص الكثيفة (40 طالباً)</span>
              </div>

              {/* Navigation Tabs for Smart Features */}
              <nav className="tab-nav" style={{ marginTop: '1rem' }}>
                <button 
                  className={`tab-btn ${activeSmartTab === 'plan' ? 'active' : ''}`}
                  onClick={() => setActiveSmartTab('plan')}
                >
                  خطة الدرس التفاعلية (40د)
                </button>
                <button 
                  className={`tab-btn ${activeSmartTab === 'kinetic' ? 'active' : ''}`}
                  onClick={() => setActiveSmartTab('kinetic')}
                >
                  الدليل الحركي للـ 40 طالباً
                </button>
                <button 
                  className={`tab-btn ${activeSmartTab === 'whatsapp' ? 'active' : ''}`}
                  onClick={() => setActiveSmartTab('whatsapp')}
                >
                  رسالة الواتساب للأهالي
                </button>
              </nav>

              {/* Smart Generated Tabs Content */}
              <div style={{ minHeight: '350px', padding: '1rem 0' }}>

                {/* FEATURE 1: 40-MINUTE PLAN & TIMER */}
                {activeSmartTab === 'plan' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                    
                    {/* Integrated countdown timer widget */}
                    <div style={{
                      background: 'radial-gradient(circle at center, var(--bg-tertiary) 0%, var(--bg-secondary) 100%)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                          <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }} viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                            <circle 
                              cx="80" 
                              cy="80" 
                              r="70" 
                              fill="none" 
                              stroke="var(--accent-emerald)" 
                              strokeWidth="10" 
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                          </svg>
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.2rem', fontWeight: 800 }}>
                            {formatTime(timeLeft)}
                          </div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--accent-gold)', display: 'block', fontSize: '0.95rem' }}>مؤقت الحصة التنازلي</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            المرحلة الحالية: {steps[activeStep]?.title.substring(0, 18)}...
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="timer-btn" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.9rem' }} onClick={handleStartPause}>
                          {timerRunning ? <Icons.Pause /> : <Icons.Play />}
                        </button>
                        <button className="timer-btn" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.9rem' }} onClick={handleReset}>
                          <Icons.RotateCcw />
                        </button>
                        <button className="btn" style={{ padding: '0.5rem', height: '2.5rem' }} onClick={handleResetAll} title="إعادة تعيين بالكامل">
                          تصفير الكل
                        </button>
                      </div>
                    </div>

                    {/* Timeline list */}
                    <div className="timeline">
                      {steps.map((step, idx) => {
                        const isStepActive = activeStep === idx;
                        const isStepCompleted = completedSteps[idx];
                        
                        return (
                          <div 
                            key={idx} 
                            className={`timeline-step ${isStepActive ? 'active' : ''} ${isStepCompleted ? 'completed' : ''}`}
                            onClick={() => setActiveStep(idx)}
                          >
                            <div 
                              className="timeline-marker"
                              onClick={(e) => toggleStepCompleted(idx, e)}
                              style={{ cursor: 'pointer' }}
                            >
                              {isStepCompleted ? <Icons.Check /> : idx + 1}
                            </div>
                            <div className="timeline-content" style={{ padding: '1rem' }}>
                              <div className="step-header">
                                <span className="step-title" style={{ fontSize: '1rem' }}>{step.title}</span>
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span className="step-duration" style={{ fontSize: '0.75rem' }}>{step.duration}</span>
                                  <button 
                                    className="btn" 
                                    style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', height: 'auto' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTimerToStep(idx);
                                    }}
                                  >
                                    مزامنة
                                  </button>
                                </div>
                              </div>
                              <p className="step-details" style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
                                🎯 {step.objective}
                              </p>
                              {isStepActive && (
                                <div style={{ marginTop: '0.75rem', padding: '0.75rem 0 0 0', borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    💻 <strong>النشاط المقترح:</strong> {step.activity}
                                  </p>
                                  <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', borderLeft: '3px solid var(--accent-emerald)', color: 'var(--text-secondary)' }}>
                                    💡 <strong>توجيه الصف:</strong> {step.tips}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

                {/* FEATURE 2: KINETIC GUIDE FOR 40 STUDENTS */}
                {activeSmartTab === 'kinetic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ 
                      background: 'rgba(59, 130, 246, 0.05)', 
                      border: '1px solid var(--accent-blue-glow)', 
                      borderRadius: '8px', 
                      padding: '1rem',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>🏃‍♂️</span>
                      <div>
                        <strong style={{ color: 'var(--accent-blue)', display: 'block', fontSize: '0.98rem', marginBottom: '0.2rem' }}>
                          {currentLessonData.kineticGuide.title}
                        </strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {currentLessonData.kineticGuide.intro}
                        </p>
                      </div>
                    </div>

                    {/* Grouping breakdown */}
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '1rem'
                    }}>
                      <strong style={{ color: 'var(--accent-gold)', display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        {currentLessonData.kineticGuide.grouping.title}
                      </strong>
                      <p style={{ fontSize: '0.88rem', lineHeight: 1.6, whiteSpace: 'pre-line', color: 'var(--text-primary)' }}>
                        {currentLessonData.kineticGuide.grouping.details}
                      </p>
                    </div>

                    {/* Kinetic Stages timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>مراحل الحركة والتنقل داخل الحصة:</strong>
                      {currentLessonData.kineticGuide.phases.map((phase, index) => (
                        <div 
                          key={index}
                          style={{
                            background: 'rgba(0,0,0,0.15)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ 
                              background: 'var(--accent-emerald)', 
                              color: 'var(--bg-primary)', 
                              fontSize: '0.78rem', 
                              fontWeight: 'bold', 
                              padding: '0.2rem 0.6rem', 
                              borderRadius: '4px' 
                            }}>
                              ⏳ {phase.time}
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                              {phase.phaseTitle}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                            {phase.action}
                          </p>
                          <div style={{ 
                            fontSize: '0.78rem', 
                            color: 'var(--accent-blue)', 
                            background: 'var(--accent-blue-glow)', 
                            padding: '0.4rem', 
                            borderRadius: '4px',
                            display: 'flex',
                            gap: '0.25rem',
                            alignItems: 'center'
                          }}>
                            <span>🚷</span>
                            <strong>قاعدة الحركة:</strong>
                            <span>{phase.movementRule}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FEATURE 3: WHATSAPP Parental Message */}
                {activeSmartTab === 'whatsapp' && (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                      ملخص جاهز للأهالي يحتوي على نواتج الحصة والواجب المنزلي، لضمان استدامة التعلم خارج الغرفة الصفية.
                    </p>
                    
                    <div className="whatsapp-preview-box">
                      <div className="whatsapp-header">
                        <span>💬 معاينة الرسالة المخصصة للنسخ:</span>
                      </div>
                      <div className="whatsapp-text" style={{ fontSize: '0.88rem' }}>
                        {whatsappMessage}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button className="btn" onClick={handleCopyMessage}>
                        <Icons.Copy />
                        <span>نسخ الرسالة</span>
                      </button>
                      <button className="btn btn-emerald" onClick={handleSendWhatsApp}>
                        <Icons.Send />
                        <span>إرسال مباشرة عبر الواتساب</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Attendance & Preparation Tools */}
            <section className="glass-card">
              <h2 className="card-title blue">
                <Icons.UserCheck />
                <span>قائمة التحضير السريع للمعلم</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
                {prepList.map((item) => (
                  <div key={item.id} className="checklist-item">
                    <input 
                      type="checkbox" 
                      id={`prep-${item.id}`}
                      className="checklist-checkbox"
                      checked={item.checked}
                      onChange={() => togglePrepItem(item.id)}
                    />
                    <label htmlFor={`prep-${item.id}`} className="checklist-label">
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                  🎲 السحب العشوائي للطلاب (لأجل 40 طالباً):
                </strong>
                <div className="picker-container" style={{ marginTop: '0.5rem' }}>
                  <div className="picker-name">
                    {selectedStudent || 'تحديد الطالب التالي'}
                  </div>
                  <button className="btn btn-primary" onClick={handlePickStudent} disabled={isPicking} style={{ width: '100%' }}>
                    {isPicking ? 'جاري السحب...' : 'سحب طالب عشوائي'}
                  </button>
                </div>
              </div>
            </section>

          </section>
        )}

      </div>

      <style>{`
        @keyframes slide-in-right-pane {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

    </div>
  );
}

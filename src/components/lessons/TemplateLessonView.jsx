import React from 'react';

const getValue = (source, key, fallback) => source?.[key] ?? fallback;

const Section = ({ title, tone = '#0f766e', children }) => (
  <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', marginBottom: '16px' }}>
    <h2 style={{ margin: '0 0 14px', color: tone, fontSize: '22px' }}>{title}</h2>
    {children}
  </section>
);

const TextList = ({ items }) => {
  if (!items?.length) return null;
  return (
    <ul style={{ margin: 0, paddingRight: '22px', lineHeight: 1.9 }}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const InfoGrid = ({ items }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
    {items.map((item, index) => (
      <div key={`${item.term}-${index}`} style={{ border: '1px solid #dbeafe', background: '#eff6ff', borderRadius: '8px', padding: '14px' }}>
        <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '6px' }}>{item.term}</strong>
        <p style={{ margin: 0, lineHeight: 1.8 }}>{item.definition}</p>
      </div>
    ))}
  </div>
);

function TemplateLessonView({ lessonData, teacherName, onBackToDashboard }) {
  const identity = lessonData.lesson_identity || {};
  const outcomes = getValue(lessonData, 'نتاجات التعلم', []);
  const terms = getValue(lessonData, 'المفاهيم والمصطلحات', []);
  const explore = getValue(lessonData, 'استكشف', {});
  const learn = getValue(lessonData, 'أتعلم', {});
  const activity = getValue(lessonData, 'نشاط صفي', {});
  const assessment = getValue(lessonData, 'أقيم تعلمي', []);
  const worksheet = getValue(lessonData, 'ورقة عمل', {});
  const examBank = getValue(lessonData, 'أسئلة لبنك الامتحان', []);
  const answers = getValue(lessonData, 'الإجابات النموذجية', {});
  const teacherNotes = getValue(lessonData, 'ملاحظات المعلم', []);
  const resources = getValue(lessonData, 'روابط أو ملفات مساعدة', []);
  const hasItems = (items) => Array.isArray(items) && items.length > 0;
  const hasObjectContent = (item) => Boolean(item && Object.keys(item).length > 0);

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif', color: '#1e293b' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      <header className="no-print" style={{ background: '#0f172a', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={onBackToDashboard} style={{ border: 0, borderRadius: '8px', padding: '10px 16px', background: '#e2e8f0', color: '#0f172a', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
          العودة للوحة التحكم
        </button>
        <button onClick={() => window.print()} style={{ border: 0, borderRadius: '8px', padding: '10px 16px', background: '#16a34a', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Cairo' }}>
          طباعة الدرس
        </button>
      </header>

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px' }}>
        <section style={{ background: '#0f766e', color: '#fff', borderRadius: '8px', padding: '24px', marginBottom: '18px' }}>
          <p style={{ margin: '0 0 8px', opacity: 0.9 }}>{identity.subject} | {identity.grade} | {identity.semester}</p>
          <h1 style={{ margin: 0, fontSize: '32px', lineHeight: 1.35 }}>{identity.lesson_number}: {lessonData.lesson_title}</h1>
          <p style={{ margin: '10px 0 0', opacity: 0.9 }}>{identity.unit}</p>
          {teacherName && <p style={{ margin: '10px 0 0', opacity: 0.9 }}>المعلم: {teacherName}</p>}
        </section>

        {hasItems(outcomes) && (
          <Section title="نتاجات التعلم">
            <TextList items={outcomes} />
          </Section>
        )}

        {hasItems(terms) && (
          <Section title="المفاهيم والمصطلحات" tone="#1d4ed8">
            <InfoGrid items={terms} />
          </Section>
        )}

        {hasObjectContent(explore) && (
          <Section title="استكشف" tone="#b45309">
            <p style={{ lineHeight: 1.9, marginTop: 0, whiteSpace: 'pre-line' }}>{explore.context}</p>
            <TextList items={explore.discussion_prompts} />
            {explore.teacher_move && (
              <div style={{ marginTop: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px', lineHeight: 1.8 }}>
                <strong>دور المعلم: </strong>{explore.teacher_move}
              </div>
            )}
          </Section>
        )}

        {(learn.main_idea || hasItems(learn.sections) || learn.applied_example) && (
        <Section title="أتعلم" tone="#047857">
          {learn.main_idea && <p style={{ lineHeight: 1.9, marginTop: 0, fontWeight: 'bold' }}>{learn.main_idea}</p>}
          {learn.sections?.map((section, index) => (
            <article key={`${section.title}-${index}`} style={{ borderTop: index ? '1px solid #e2e8f0' : 0, paddingTop: index ? '14px' : 0, marginTop: index ? '14px' : 0 }}>
              <h3 style={{ color: '#065f46', margin: '0 0 8px' }}>{section.title}</h3>
              <p style={{ lineHeight: 1.9, margin: 0, whiteSpace: 'pre-line' }}>{section.content}</p>
              <TextList items={section.examples} />
              {section.teacher_note && <p style={{ margin: '8px 0 0', color: '#475569' }}><strong>ملاحظة: </strong>{section.teacher_note}</p>}
            </article>
          ))}
          {learn.applied_example && (
            <div style={{ marginTop: '16px', background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px' }}>
              <h3 style={{ margin: '0 0 8px', color: '#047857' }}>{learn.applied_example.title}</h3>
              <p style={{ lineHeight: 1.8 }}>{learn.applied_example.scenario}</p>
              <TextList items={learn.applied_example.allocation?.map(item => `${item.purpose}: ${item.amount}`)} />
              <p style={{ lineHeight: 1.8, marginBottom: 0 }}>{learn.applied_example.conclusion}</p>
            </div>
          )}
        </Section>
        )}

        {hasObjectContent(activity) && (
          <Section title="نشاط صفي" tone="#7c3aed">
            <h3 style={{ marginTop: 0 }}>{activity.title}</h3>
            {activity.grouping && <p><strong>طريقة العمل: </strong>{activity.grouping}</p>}
            <TextList items={activity.steps} />
            {activity.expected_output && <p style={{ marginBottom: 0 }}><strong>الناتج المتوقع: </strong>{activity.expected_output}</p>}
          </Section>
        )}

        {hasItems(assessment) && (
          <Section title="أقيم تعلمي" tone="#dc2626">
            <TextList items={assessment.map(item => item.question)} />
          </Section>
        )}

        {hasObjectContent(worksheet) && (
          <Section title={worksheet.title || 'ورقة عمل'} tone="#0891b2">
            <p style={{ lineHeight: 1.8, marginTop: 0 }}>{worksheet.student_instructions}</p>
            {worksheet.questions?.map((question, index) => (
              <div key={`${question.prompt}-${index}`} style={{ borderTop: index ? '1px solid #e2e8f0' : 0, paddingTop: index ? '12px' : 0, marginTop: index ? '12px' : 0 }}>
                <strong>{question.type}</strong>
                <p style={{ lineHeight: 1.8, margin: '6px 0' }}>{question.prompt}</p>
                {question.answer_space && <p style={{ color: '#64748b', margin: 0 }}>{question.answer_space}</p>}
              </div>
            ))}
          </Section>
        )}

        {hasItems(examBank) && (
          <Section title="أسئلة لبنك الامتحان" tone="#9333ea">
            {examBank.map((question) => (
              <div key={question.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>{question.type} | {question.difficulty}</p>
                <p style={{ margin: '0 0 8px', lineHeight: 1.8 }}>{question.question}</p>
                <TextList items={question.options} />
                <p style={{ margin: '8px 0 0', color: '#15803d' }}><strong>الإجابة: </strong>{question.correct_answer}</p>
              </div>
            ))}
          </Section>
        )}

        {hasObjectContent(answers) && (
          <Section title="الإجابات النموذجية" tone="#15803d">
            {Object.entries(answers).map(([groupTitle, groupAnswers]) => (
              <div key={groupTitle} style={{ marginBottom: '14px' }}>
                <h3 style={{ margin: '0 0 8px' }}>{groupTitle}</h3>
                <TextList items={groupAnswers?.map(item => `${item.question_id || item.question}: ${item.answer}`)} />
              </div>
            ))}
          </Section>
        )}

        {hasItems(teacherNotes) && (
          <Section title="ملاحظات المعلم" tone="#475569">
            <TextList items={teacherNotes} />
          </Section>
        )}

        {hasItems(resources) && (
          <Section title="روابط أو ملفات مساعدة" tone="#0e7490">
            <TextList items={resources.map(item => item.title || item.name || item.url || item)} />
          </Section>
        )}
      </main>
    </div>
  );
}

export default TemplateLessonView;

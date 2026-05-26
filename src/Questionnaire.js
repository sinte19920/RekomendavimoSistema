import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

const SECTIONS = [
    { key: 'savimonė', label: 'Savimonė', ids: [1] },
    { key: 'savivaldymas', label: 'Savivaldymas', ids: [2, 3, 4, 5] },
    { key: 'socialumas', label: 'Socialinis sąmoningumas', ids: [6, 7] },
    { key: 'santykiai', label: 'Santykių valdymas', ids: [8, 9, 10, 11, 12] },
    { key: 'asmenybes', label: 'Asmenybės bruožai', ids: [13, 14, 15, 16, 17] },
    { key: 'atviri', label: 'Atviri klausimai', ids: [18, 19, 20, 21] },
];

const isSectionComplete = (section, answers) => {
    return section.ids.every(id => {
        const val = answers[id];
        return val !== null && val !== undefined && val !== '';
    });
};

function Questionnaire({ onSubmit, onBack }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState(() => {
        const saved = sessionStorage.getItem('quizAnswers');
        return saved ? JSON.parse(saved) : {};
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentSection, setCurrentSection] = useState(() => {
        const saved = sessionStorage.getItem('quizSection');
        return saved ? parseInt(saved) : 0;
    });
    const [hasReachedEnd, setHasReachedEnd] = useState(() => {
        return sessionStorage.getItem('quizReachedEnd') === 'true';
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/questions`)
            .then(r => r.json())
            .then(data => {
                setQuestions(data);
                const saved = sessionStorage.getItem('quizAnswers');
                if (!saved) {
                    const defaults = {};
                    data.forEach(q => { if (q.type === 'scale') defaults[q.id] = null; });
                    setAnswers(defaults);
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Nepavyko prisijungti prie serverio. Patikrinti ar backend veikia (app.py).');
                setLoading(false);
            });
    }, []);

    const goToSection = (i) => {
        setCurrentSection(i);
        sessionStorage.setItem('quizSection', i);
        if (i === SECTIONS.length - 1) {
            setHasReachedEnd(true);
            sessionStorage.setItem('quizReachedEnd', 'true');
        }
    };

    const canNavigateTo = (i, s) => {
        return isSectionComplete(s, answers) || i <= currentSection || hasReachedEnd;
    };

    const handleScale = (id, value) => {
        setAnswers(prev => {
            const updated = { ...prev, [id]: value };
            sessionStorage.setItem('quizAnswers', JSON.stringify(updated));
            return updated;
        });
    };

    const handleOpen = (id, value) => {
        setAnswers(prev => {
            const updated = { ...prev, [id]: value };
            sessionStorage.setItem('quizAnswers', JSON.stringify(updated));
            return updated;
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            const data = await response.json();
            sessionStorage.removeItem('quizAnswers');
            sessionStorage.removeItem('quizSection');
            sessionStorage.removeItem('quizReachedEnd');
            onSubmit(data);
        } catch {
            setError('Klaida siunčiant duomenis. Pabandykite dar kartą.');
            setSubmitting(false);
        }
    };

    const answeredCount = Object.values(answers).filter(v => v !== null && v !== '').length;
    const totalScale = questions.length;
    const progressPct = totalScale > 0 ? Math.round((answeredCount / totalScale) * 100) : 0;

    const currentSectionData = SECTIONS[currentSection];
    const currentQuestions = questions.filter(q => currentSectionData.ids.includes(q.id));

    const canGoNext = currentSection < SECTIONS.length - 1;
    const isLastSection = currentSection === SECTIONS.length - 1;

    const allScaleAnswered = questions
        .filter(q => q.type === 'scale')
        .every(q => answers[q.id] !== null && answers[q.id] !== undefined);

    if (loading) return (
        <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p>Kraunama...</p>
        </div>
    );

    if (error) return (
        <div className="error-screen">
            <p>{error}</p>
            <button className="btn-primary" onClick={onBack}>← Grįžti atgal</button>
        </div>
    );

    return (
        <div className="quiz-container">
            {/* Progress bar */}
            <div className="quiz-progress-bar">
                <div className="progress-track">
                    {SECTIONS.map((s, i) => (
                        <React.Fragment key={s.key}>
                            <div
                                className={`progress-step ${isSectionComplete(s, answers) ? 'done' : i === currentSection ? 'active' : ''}`}
                                onClick={() => { if (canNavigateTo(i, s)) goToSection(i); }}
                                style={{ cursor: canNavigateTo(i, s) ? 'pointer' : 'default' }}
                            >
                                <div className="progress-dot">{isSectionComplete(s, answers) ? '✓' : i + 1}</div>
                                <span className="progress-step-label">{s.label}</span>
                            </div>
                            {i < SECTIONS.length - 1 && <div className="progress-line"></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Main layout */}
            <div className="quiz-layout">
                <div className="quiz-main">
                    <div className="quiz-section-title">{currentSectionData.label}</div>
                    <div className="quiz-section-heading">
                        {currentSection === 0 && 'Kaip pažįsti savo emocijas?'}
                        {currentSection === 1 && 'Kaip valdai emocijas ir prisitaikai?'}
                        {currentSection === 2 && 'Kaip supranti kitus žmones?'}
                        {currentSection === 3 && 'Kaip bendrauji ir bendradarbauji?'}
                        {currentSection === 4 && 'Kokie tavo asmenybės bruožai?'}
                        {currentSection === 5 && 'Papasakok apie save'}
                    </div>

                    {currentQuestions.map((q, idx) => (
                        q.type === 'scale' ? (
                            <div key={q.id} className="question-card">
                                <div className="q-meta">
                                    <div className="q-num">{q.id}</div>
                                    <span className="q-tag">{q.competency}</span>
                                </div>
                                <div className="q-text">{q.text}</div>
                                <div className="scale-row">
                                    <span className="scale-label-l">Nesutinku</span>
                                    <div className="scale-options">
                                        {[1, 2, 3, 4, 5].map(val => (
                                            <button
                                                key={val}
                                                className={`scale-btn ${answers[q.id] === val ? 'selected' : ''}`}
                                                onClick={() => handleScale(q.id, val)}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="scale-label-r">Sutinku</span>
                                </div>
                            </div>
                        ) : (
                            <div key={q.id} className="open-question-card">
                                <div className="q-meta">
                                    <div className="q-num q-num-open">{q.id}</div>
                                    <span className="q-tag q-tag-open">Atvirasis klausimas</span>
                                </div>
                                <div className="q-text">{q.text}</div>
                                <textarea
                                    className="open-textarea"
                                    rows={4}
                                    placeholder="Rašyk čia..."
                                    value={answers[q.id] || ''}
                                    onChange={e => handleOpen(q.id, e.target.value)}
                                />
                            </div>
                        )
                    ))}

                    {/* Navigation buttons bottom */}
                    <div className="quiz-nav-bottom">
                        <button
                            className="btn-nav-back"
                            onClick={() => {
                                if (currentSection > 0) {
                                    goToSection(currentSection - 1);
                                } else {
                                    sessionStorage.removeItem('quizAnswers');
                                    sessionStorage.removeItem('quizSection');
                                    sessionStorage.removeItem('quizReachedEnd');
                                    onBack();
                                }
                            }}
                        >
                            ← Atgal
                        </button>
                        {canGoNext && (
                            <button className="btn-nav-next" onClick={() => goToSection(currentSection + 1)}>
                                Toliau →
                            </button>
                        )}
                        {isLastSection && (
                            <button
                                className="btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting || !allScaleAnswered}
                            >
                                {submitting ? 'Skaičiuojama...' : 'Gauti rekomendaciją →'}
                            </button>
                        )}
                    </div>
                    {isLastSection && !allScaleAnswered && (
                        <p className="warning-text">Atsakyk į visus klausimus prieš tęsiant.</p>
                    )}
                </div>

                {/* Sidebar */}
                <div className="quiz-sidebar">
                    <div>
                        <div className="sidebar-progress-title">Progresas</div>
                        <div className="sidebar-progress-num">
                            {answeredCount} <span>/ {totalScale}</span>
                        </div>
                        <div className="progress-fill-bar">
                            <div className="progress-fill-inner" style={{ width: `${progressPct}%` }}></div>
                        </div>
                    </div>

                    <div className="sidebar-domain">
                        <div className="domain-label">Sekcijos</div>
                        {SECTIONS.map((s, i) => (
                            <div
                                key={s.key}
                                className={`domain-item ${isSectionComplete(s, answers) ? 'done' : i === currentSection ? 'active' : ''}`}
                                onClick={() => { if (canNavigateTo(i, s)) goToSection(i); }}
                                style={{ cursor: canNavigateTo(i, s) ? 'pointer' : 'default' }}
                            >
                                <div className="domain-dot"></div>
                                {s.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Questionnaire;
import React, { useState } from 'react';
import Questionnaire from './Questionnaire';
import Results from './Results';
import ProgramDetail from './ProgramDetail';
import './App.css';

const VU_LOGO = process.env.PUBLIC_URL + '/vu_logo.png';
const MIF_LOGO = process.env.PUBLIC_URL + '/mif_logo.png';

/* ══════════════════════════════════════
   MODAL TURINYS
══════════════════════════════════════ */
const MODAL_CONTENT = {
  ei: {
    title: 'Golemano emocinės kompetencijos modelis',
    source: 'Goleman & Boyatzis (2017). Emotional Self-Awareness. Harvard Business Review; Goleman (1998). Working with Emotional Intelligence.',
    body: (
      <div className="modal-body-ei">
        <div className="modal-domain">
          <h4 className="modal-domain-title">1 sritis — Savimonė (angl. Self-Awareness)</h4>
          <ul className="modal-comp-list">
            <li>
              <strong>Emocinė savimonė</strong>
              <p>Gebėjimas atpažinti savo emocijas ir jų poveikį sprendimams bei elgesiui. Asmenys, pasižymintys šia kompetencija, supranta savo vertybes ir tikslus bei geba susitelkti ties jais sudėtingose situacijose.</p>
            </li>
          </ul>
        </div>
        <div className="modal-domain">
          <h4 className="modal-domain-title">2 sritis — Savireguliacija (angl. Self-Management)</h4>
          <ul className="modal-comp-list">
            <li>
              <strong>Emocinė savikontrolė</strong>
              <p>Gebėjimas valdyti nerimą keliančias emocijas ir impulsus taip, kad jie netrukdytų veikti. Apima streso toleranciją ir psichologinę pusiausvyrą.</p>
            </li>
            <li>
              <strong>Orientacija į pasiekimus</strong>
              <p>Vidinis noras tobulinti savo ir kitų veiklos rezultatus; nuolatinis asmeninių tikslų kėlimas ir siekimas. Pasireiškia iniciatyvumu ir asmeniniu atsakingumu.</p>
            </li>
            <li>
              <strong>Pozityvus požiūris</strong>
              <p>Gebėjimas įžvelgti galimybes ir teigiamus aspektus situacijose, nepaisant kliūčių; optimistinis požiūris į ateitį ir tvari motyvacija.</p>
            </li>
            <li>
              <strong>Adaptyvumas</strong>
              <p>Lankstumas reaguojant į pokyčius, gebėjimas perorientuoti savo elgesį atsižvelgiant į naujas aplinkybes bei iššūkius.</p>
            </li>
          </ul>
        </div>
        <div className="modal-domain">
          <h4 className="modal-domain-title">3 sritis — Socialinė jautba (angl. Social Awareness)</h4>
          <ul className="modal-comp-list">
            <li>
              <strong>Empatija</strong>
              <p>Gebėjimas suprasti kitų žmonių emocines perspektyvas, jausti jų jausmus ir rūpintis jų rūpesčiais. Yra pagrindinis socialinių santykių kūrimo elementas.</p>
            </li>
            <li>
              <strong>Organizacinis sąmoningumas</strong>
              <p>Gebėjimas suvokti grupės, organizacijos ar sistemos socialinius tinklus, neformalias hierarchijas ir nusistovėjusias normas.</p>
            </li>
          </ul>
        </div>
        <div className="modal-domain">
          <h4 className="modal-domain-title">4 sritis — Santykių valdymas (angl. Relationship Management)</h4>
          <ul className="modal-comp-list">
            <li>
              <strong>Įtaka</strong>
              <p>Gebėjimas daryti teigiamą poveikį kitiems žmonėms; pateikti argumentus, kurie atsiliepia auditorijai ir skatina pokyčius.</p>
            </li>
            <li>
              <strong>Mentorystė ir ugdymas</strong>
              <p>Gebėjimas ugdyti kitų gebėjimus — suteikiant grįžtamąjį ryšį, nustatant iššūkius ir skatinant asmeninį augimą.</p>
            </li>
            <li>
              <strong>Konfliktų valdymas</strong>
              <p>Gebėjimas mediatoriaus vaidmenyje surasti konstruktyvius sprendimus esant nesutarimams; sumažinti įtampą ir ieškoti kompromisų.</p>
            </li>
            <li>
              <strong>Įkvepianti lyderystė</strong>
              <p>Gebėjimas vesti grupę link bendros vizijos; motyvuoti ir įkvėpti kitus, formuojant prasmingą tikslų jausmą.</p>
            </li>
            <li>
              <strong>Komandinis darbas</strong>
              <p>Gebėjimas bendradarbiauti ir prisidėti prie kolektyvinių pastangų; kurti tarpusavio pasitikėjimą ir siekti bendrų tikslų.</p>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  b5: {
    title: 'Big Five asmenybės bruožai',
    source: 'Vedel (2016). Big Five personality group differences across academic majors. Personality and Individual Differences; McCrae & Costa (1987). Validation of the Five-Factor Model of Personality.',
    body: (
      <div className="modal-body-b5">
        <div className="modal-trait">
          <strong>Atvirumas patirčiai (angl. Openness)</strong>
          <p>Atspindi intelektinį smalsumą, vaizduotę, estetinį jautrumą ir polinkį ieškoti naujų idėjų bei patirčių. Asmenys su aukštu atvirumo ballu labiau linkę domėtis menu, mokslu ir abstrakčiu mąstymu.</p>
        </div>
        <div className="modal-trait">
          <strong>Sąmoningumas (angl. Conscientiousness)</strong>
          <p>Apibūdina organizuotumą, patikimumą, discipliną ir tikslų siekimą. Yra vienas stipriausių akademinės sėkmės prognozuotojų nepriklausomai nuo studijų krypties. Ypač svarbus struktūrizuotose, metodiškose studijų programose.</p>
        </div>
        <div className="modal-trait">
          <strong>Ekstraversija (angl. Extraversion)</strong>
          <p>Išreiškia bendravimo norą, energingumą, draugiškumą ir komforto jausmą socialinėse situacijose. Ekstravertai aktyviau ieško socialinės stimuliacijos ir geriau funkcionuoja komandinėje aplinkoje.</p>
        </div>
        <div className="modal-trait">
          <strong>Sutariamumas (angl. Agreeableness)</strong>
          <p>Atspindi bendradarbiavimą, empatiją, pasitikėjimą ir rūpinimąsi kitais. Sutariantys asmenys yra linkę vengti konfliktų ir siekti harmonijos.</p>
        </div>
        <div className="modal-trait">
          <strong>Neurotizmas (angl. Neuroticism)</strong>
          <p>Apibūdina polinkį į neigiamas emocijas — nerimą, liūdesį, dirglumą ir emocinį nestabilumą. Aukštas neurotiškumas siejamas su didesniu stresu studijų metu ir mažesniu akademiniu pasitenkinimu. Kai kuriose metodologijose šis bruožas apverčiamas kaip „emocinis stabilumas“.</p>
        </div>
      </div>
    ),
  },
};

/* ══════════════════════════════════════
   INFO MODAL
══════════════════════════════════════ */
function InfoModal({ modalKey, onClose }) {
  if (!modalKey) return null;
  const content = MODAL_CONTENT[modalKey];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="info-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="info-modal">
        <button className="info-modal-close" onClick={onClose} aria-label="Uždaryti">✕</button>
        <h2 className="info-modal-title">{content.title}</h2>
        <p className="info-modal-source">{content.source}</p>
        {content.body}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   APP
══════════════════════════════════════ */
function App() {
  const [screen, setScreen] = useState(() => {
    if (sessionStorage.getItem('selectedProgram')) return 'program';
    if (sessionStorage.getItem('results')) return 'results';
    if (sessionStorage.getItem('quizAnswers')) return 'quiz';
    return 'welcome';
  });
  const [results, setResults] = useState(() => {
    const saved = sessionStorage.getItem('results');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedProgram, setSelectedProgram] = useState(() => {
    return sessionStorage.getItem('selectedProgram') || null;
  });
  const [activeModal, setActiveModal] = useState(null);

  const handleResults = (data) => {
    setResults(data);
    setScreen('results');
    sessionStorage.setItem('results', JSON.stringify(data));
  };

  const handleReset = () => {
    sessionStorage.removeItem('results');
    sessionStorage.removeItem('selectedProgram');
    sessionStorage.removeItem('quizAnswers');
    sessionStorage.removeItem('quizSection');
    setScreen('welcome');
    setResults(null);
    setSelectedProgram(null);
  };

  const handleProgramClick = (program) => {
    setSelectedProgram(program);
    setScreen('program');
    sessionStorage.setItem('selectedProgram', program);
  };

  return (
    <div className="app-wrapper">

      {/* ─ HEADER ─ */}
      <header className="site-header">
        <div className="logo-area" onClick={() => {
          sessionStorage.removeItem('quizAnswers');
          sessionStorage.removeItem('quizSection');
          sessionStorage.removeItem('quizReachedEnd');
          setScreen('welcome');
        }}>
          <img src={VU_LOGO} alt="Vilniaus universitetas" className="header-vu-logo" />
          <div className="header-divider" />
          <img src={MIF_LOGO} alt="MIF" className="header-mif-logo" />
          <div className="logo-text">
            <strong>Matematikos ir informatikos fakultetas</strong>
            <span>Studijų programų rekomendavimo sistema</span>
          </div>
        </div>
        <span className="header-lang">LT</span>
      </header>

      {/* ─ EKRANAI ─ */}
      {screen === 'welcome' && (
        <WelcomeScreen
          onStart={() => setScreen('quiz')}
          onInfoCard={(key) => setActiveModal(key)}
        />
      )}
      {screen === 'quiz' && <Questionnaire onSubmit={handleResults} onBack={() => setScreen('welcome')} />}
      {screen === 'results' && <Results data={results} onReset={handleReset} onProgramClick={handleProgramClick} />}
      {screen === 'program' && <ProgramDetail program={selectedProgram} onBack={() => {
        sessionStorage.removeItem('selectedProgram');
        setScreen('results');
      }} />}

      {/* ─ MODAL ─ */}
      <InfoModal modalKey={activeModal} onClose={() => setActiveModal(null)} />

      {/* ─ FOOTER ─ */}
      <footer className="site-footer">
        <div className="footer-logo-row">
          <img src={VU_LOGO} alt="VU" className="footer-vu-logo" />
          <span>© 2026 Vilniaus universitetas · Matematikos ir informatikos fakultetas</span>
        </div>
        <span>Bakalaurinio darbo prototipas</span>
      </footer>

    </div>
  );
}

/* ══════════════════════════════════════
   WELCOME SCREEN
══════════════════════════════════════ */
function WelcomeScreen({ onStart, onInfoCard }) {
  return (
    <>
      <div className="welcome-hero">
        <h1>Kokia studijų programa<br /><em>labiausiai tinka tau?</em></h1>
        <p>
          Atsakyk į trumpą klausimyną apie savo asmenybę ir emocinius gebėjimus —
          sistema pasiūlys geriausiai tinkančias VU MIF bakalauro programas.
        </p>
        <button className="btn-primary" onClick={onStart}>
          Pradėti klausimyną <span className="arrow">→</span>
        </button>
      </div>

      <div className="welcome-stats">
        <div className="stat-item">
          <div className="stat-num">8</div>
          <div className="stat-label">Bakalauro studijų programos</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">~10</div>
          <div className="stat-label">Minučių trukmės testas</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">17</div>
          <div className="stat-label">Vertinami bruožai</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">TOP 3</div>
          <div className="stat-label">Studijų rekomendacijos</div>
        </div>
      </div>

      <div className="welcome-info">
        <div
          className="info-card info-card--clickable"
          onClick={() => onInfoCard('ei')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onInfoCard('ei')}
          title="Sužinoti daugiau apie EI kompetencijas"
        >
          <h3>Emocinis intelektas</h3>
          <p>Klausimynas matuoja 12 Golemano modelio EI kompetencijų — nuo savimonės iki lyderystės.</p>
          <span className="info-card-hint">Sužinoti daugiau →</span>
        </div>
        <div
          className="info-card info-card--clickable"
          onClick={() => onInfoCard('b5')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onInfoCard('b5')}
          title="Sužinoti daugiau apie Big Five bruožus"
        >
          <h3>Asmenybės bruožai</h3>
          <p>Vertinami 5 Big Five asmenybės bruožai: atvirumas, sąmoningumas, ekstraversija ir kt.</p>
          <span className="info-card-hint">Sužinoti daugiau →</span>
        </div>
        <div className="info-card">
          <h3>Anonimiška</h3>
          <p>Duomenys renkami anonimiškai ir naudojami tik rekomendacijai generuoti.</p>
        </div>
      </div>
    </>
  );
}

export default App;
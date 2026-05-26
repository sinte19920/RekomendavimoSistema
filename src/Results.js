import React from 'react';

const PROGRAM_INFO = {
    'Duomenų mokslas': {
        field: 'Matematikos mokslai',
        description: 'Programa skirta studentams, kuriems patinka skaičiai, modeliai ir realių problemų sprendimas duomenų pagalba. Studijuosi statistiką, mašininį mokymąsi ir programavimą.',
        careers: ['Duomenų analitikai', 'Dirbtinio intelekto sprendimų kūrėjai', 'Prognozavimo ir modeliavimo specialistai', 'Duomenų inžinieriai'],
        topCompetencies: ['Sąmoningumas', 'Orientacija į pasiekimus', 'Atvirumas patirčiai', 'Komandinis darbas'],
        image: null, //'/karjeros/DuomenuMokslas.png'
    },
    'Finansų ir draudimo matematika': {
        field: 'Matematikos mokslai',
        description: 'Programa apjungia matematiką ir finansų teoriją. Tinkama tiems, kurie mėgsta skaičiavimus, riziką ir ekonominius modelius.',
        careers: ['Aktuarai', 'Produktų specialistai', 'Duomenų analizės specialistai', 'Inovacijų kūrėjai'],
        topCompetencies: ['Sąmoningumas', 'Orientacija į pasiekimus', 'Emocinė savikontrolė'],
        image: null,
    },
    'Matematika ir matematikos taikymai': {
        field: 'Matematikos mokslai',
        description: 'Klasikinė matematikos programa tiems, kuriems patinka abstraktus mąstymas ir teoriniai modeliai.',
        careers: ['Specialistai, taikantys matematinius metodus praktinėms problemoms spręsti', 'Rizikos valdymo, prognozių ir procesų optimizavimo specialistai', 'Duomenų analizės specialistai', 'Tyrėjai ir aukštos kvalifikacijos specialistai'],
        topCompetencies: ['Sąmoningumas', 'Orientacija į pasiekimus', 'Adaptyvumas'],
        image: null,
    },
    'Matematikos mokymas ir edukometrija': {
        field: 'Matematikos mokslai',
        description: 'Skirta tiems, kurie nori mokyti matematiką arba dirbti švietimo srityje. Akcentuojamas bendravimas ir pedagogika.',
        careers: ['Matematikos mokytojas', 'Edukologas', 'Švietimo analitikas'],
        topCompetencies: ['Empatija', 'Mentorystė', 'Pozityvus požiūris', 'Komandinis darbas'],
        image: null,
    },
    'Verslo duomenų analitika': {
        field: 'Matematikos mokslai',
        description: 'Jungia matematiką, IT ir verslo žinias. Tinka tiems, kurie nori dirbti verslo aplinkoje naudodami duomenis sprendimams priimti.',
        careers: ['Ekonominių, finansinių ir verslo duomenų analitikai', 'Verslo procesų prognozuotojai', 'Klientų elgsenos analitikai', 'Personalizuotų rekomendacinių sistemų kūrėjai'],
        topCompetencies: ['Sąmoningumas', 'Organizacinis sąmoningumas', 'Įtaka', 'Komandinis darbas'],
        image: null,
    },
    'Bioinformatika': {
        field: 'Informatikos mokslai',
        description: 'Apjungia biologiją ir informatikos metodus. Skirta tiems, kurie domisi bioinformacijos analize ir moksliniais tyrimais.',
        careers: ['Bioinformatikos programinės įrangos specialistai', 'Darbo su dideliais duomenimis specialistai', 'Genetinių tyrimų specialistai', 'Vaistų kūrėjai'],
        topCompetencies: ['Atvirumas patirčiai', 'Orientacija į pasiekimus', 'Sąmoningumas'],
        image: null,
    },
    'Informacinės technologijos': {
        field: 'Informatikos mokslai',
        description: 'Plataus profilio IT programa — apima programavimą, tinklus, duomenų bazes. Tinka tiems, kurie nori universalių IT žinių.',
        careers: ['IT specialistas', 'Sistemų administratorius', 'Programuotojas', 'IT projektų vadovas'],
        topCompetencies: ['Sąmoningumas', 'Atvirumas patirčiai', 'Adaptyvumas', 'Komandinis darbas'],
        image: null,
    },
    'Informacinių sistemų inžinerija': {
        field: 'Informatikos mokslai',
        description: 'Orientuota į didelių informacinių sistemų kūrimą ir valdymą. Daug dėmesio skiriama komandiniams projektams.',
        careers: ['IT sistemų architektais ir kūrėjais', 'Verslo procesų analitikais', 'Kibernetinės saugos ir IT sistemų patikimumo specialistais', 'Dirbtinio intelekto sistemų inžinieriais'],
        topCompetencies: ['Komandinis darbas', 'Sąmoningumas', 'Organizacinis sąmoningumas', 'Įtaka'],
        image: null,
    },
    'Informatika': {
        field: 'Informatikos mokslai',
        description: 'Teorinė ir praktinė informatika — algoritmika, programavimas, dirbtinis intelektas. Tinka tiems, kurie mėgsta spręsti sudėtingas technines problemas.',
        careers: ['IT konsultantai', 'Analitikai', 'Programinės įrangos kūrėjai', 'Intelektinių sistemų, robotikos ar didelio našumo skaičiavimų specialistai'],
        topCompetencies: ['Sąmoningumas', 'Orientacija į pasiekimus', 'Atvirumas patirčiai'],
        image: null,
    },
    'Programų sistemos': {
        field: 'Informatikos mokslai',
        description: 'Skirta programinės įrangos kūrimui — nuo dizaino iki testavimo. Daug praktinių projektų ir komandinio darbo.',
        careers: ['Inovatyvių elektroninių paslaugų kūrėjai', 'Programinės įrangos kūrėjai / priežiūros specialistai', 'Reikalavimų analitikai', 'Programuotojai'],
        topCompetencies: ['Komandinis darbas', 'Sąmoningumas', 'Adaptyvumas', 'Atvirumas patirčiai'],
        image: null,
    },
};

function Results({ data, onReset, onProgramClick }) {
    const { recommendations } = data;
    const medals = ['🥇', '🥈', '🥉'];

    const ordered = [recommendations[1], recommendations[0], recommendations[2]];
    const orderedRank = ['rank-2', 'rank-1', 'rank-3'];
    const orderedMedal = ['🥈', '🥇', '🥉'];

    return (
        <>
            <div className="results-hero">
                <div className="results-badge">✓ Analizė baigta</div>
                <h2>Tavo studijų programų rekomendacijos</h2>
                <p>Remiantis tavo EI profiliu ir asmenybės bruožais, labiausiai tinkamos programos:</p>

                <div className="results-cards-row">
                    {ordered.map((rec, i) => rec && (
                        <div
                            key={i}
                            className={`result-card ${orderedRank[i]}`}
                            onClick={() => onProgramClick(rec.program)}
                        >
                            {orderedRank[i] === 'rank-1' && (
                                <div className="best-match-banner">★ GERIAUSIAS ATITIKIMAS</div>
                            )}
                            <div className="result-rank-num">{orderedMedal[i]}</div>
                            <div className="result-program">{rec.program}</div>
                            <div className="result-field">
                                {PROGRAM_INFO[rec.program]?.field || 'VU MIF'}
                            </div>
                            <div className="result-score-label">Atitikimas</div>
                            <div className="result-bar">
                                <div className="result-bar-fill" style={{ width: `${rec.score}%` }}></div>
                            </div>
                            <div className="result-pct">{rec.score}%</div>
                            <div className="result-cta">Spausk norėdamas sužinoti daugiau →</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="results-body">
                <h3>Visos rekomendacijos</h3>
                <div className="all-results-list">
                    {recommendations.map((rec, i) => (
                        <div
                            key={i}
                            className="all-result-row"
                            onClick={() => onProgramClick(rec.program)}
                        >
                            <span className="all-result-medal">{medals[i]}</span>
                            <span className="all-result-name">{rec.program}</span>
                            <div className="all-result-bar-wrap">
                                <div className="all-result-bar">
                                    <div className="all-result-fill" style={{ width: `${rec.score}%` }}></div>
                                </div>
                            </div>
                            <span className="all-result-pct">{rec.score}%</span>
                            <span className="all-result-arrow">→</span>
                        </div>
                    ))}
                </div>

                <button className="btn-restart" onClick={onReset}>
                    ← Pildyti iš naujo
                </button>
            </div>
        </>
    );
}

export { PROGRAM_INFO };
export default Results;
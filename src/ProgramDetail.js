import React from 'react';
import { PROGRAM_INFO } from './Results';

const PROGRAM_URLS = {
    'Duomenų mokslas': 'https://www.vu.lt/stojantiesiems/bakalauro/duomenu-mokslas',
    'Finansų ir draudimo matematika': 'https://www.vu.lt/stojantiesiems/bakalauro/finansu-ir-draudimo-matematika',
    'Matematika ir matematikos taikymai': 'https://www.vu.lt/stojantiesiems/bakalauro/matematika-ir-taikymai',
    'Matematikos mokymas ir edukometrija': 'https://www.vu.lt/stojantiesiems/bakalauro/matematikos-mokymas-ir-edukometrija',
    'Verslo duomenų analitika': 'https://www.vu.lt/stojantiesiems/bakalauro/verslo-duomenu-analitika',
    'Bioinformatika': 'https://www.vu.lt/stojantiesiems/bakalauro/bioinformatika',
    'Informacinės technologijos': 'https://www.vu.lt/stojantiesiems/bakalauro/informacines-technologijos',
    'Informacinių sistemų inžinerija': 'https://www.vu.lt/stojantiesiems/bakalauro/informaciniu-sistemu-inzinerija',
    'Informatika': 'https://www.vu.lt/stojantiesiems/bakalauro/informatika',
    'Programų sistemos': 'https://www.vu.lt/stojantiesiems/bakalauro/programu-sistemos',
};

function ProgramDetail({ program, onBack }) {
    const info = PROGRAM_INFO[program] || {};
    const url = PROGRAM_URLS[program];

    return (
        <>
            <div className="program-detail-hero">
                <button className="back-link" onClick={onBack}>← Grįžti į rezultatus</button>
                <div className="program-type-badge" style={{ marginTop: '16px', marginLeft: '12px' }}>
                    {info.field || 'VU MIF'} · Bakalauras
                </div>
                {url ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="program-title-link"
                    >
                        <h2>{program}</h2>
                    </a>
                ) : (
                    <h2>{program}</h2>
                )}
                <p>{info.description}</p>
            </div>

            <div className="program-detail-body">
                {info.careers && (
                    <>
                        <h3>Karjeros galimybės</h3>

                        {info.image && (
                            <img
                                src={info.image}
                                alt={`${program} karjeros galimybės`}
                                style={{
                                    width: '100%',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    display: 'block'
                                }}
                            />
                        )}

                        <div className="career-grid">
                            {info.careers.map(c => (
                                <div key={c} className="career-item">
                                    <div className="career-dot"></div>
                                    {c}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <button className="btn-restart" onClick={onBack} style={{ marginTop: '24px' }}>
                    ← Grįžti į rezultatus
                </button>
            </div>
        </>
    );
}

export default ProgramDetail;
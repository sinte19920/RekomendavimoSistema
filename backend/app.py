from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

# ─ Groq (atviriems klausimams) ─
try:
    from groq import Groq
    from dotenv import load_dotenv
    load_dotenv()
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except ImportError:
    groq_client = None

app = Flask(__name__)
CORS(app)

# ════════════════════════════════════════
# DUOMENŲ BAZĖ — 7 LENTELĖS
# ════════════════════════════════════════

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres@localhost/mif_rekomendacijos"
)

def get_db():
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS vartotojas (
            id            SERIAL PRIMARY KEY,
            sesijos_id    VARCHAR(64) UNIQUE NOT NULL,
            sukurimo_data TIMESTAMP DEFAULT NOW(),
            baigtas       BOOLEAN DEFAULT FALSE
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS kompetencija (
            id          SERIAL PRIMARY KEY,
            pavadinimas VARCHAR(100) UNIQUE NOT NULL,
            kategorija  VARCHAR(20) NOT NULL,
            aprasymas   TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS klausimas (
            id              SERIAL PRIMARY KEY,
            tekstas         TEXT NOT NULL,
            tipas           VARCHAR(10) NOT NULL,
            eile            INTEGER UNIQUE NOT NULL,
            kompetencija_id INTEGER REFERENCES kompetencija(id)
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS atsakymas (
            id              SERIAL PRIMARY KEY,
            vartotojo_id    INTEGER REFERENCES vartotojas(id) ON DELETE CASCADE,
            klausimo_id     INTEGER REFERENCES klausimas(id),
            reiksme         INTEGER,
            tekstas         TEXT,
            nlp_rezultatas  JSON
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS programa (
            id          SERIAL PRIMARY KEY,
            pavadinimas VARCHAR(100) UNIQUE NOT NULL,
            kodas       VARCHAR(20),
            aprasymas   TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS programos_kompetencija (
            programa_id     INTEGER REFERENCES programa(id),
            kompetencija_id INTEGER REFERENCES kompetencija(id),
            svoris          DECIMAL(4,2) NOT NULL,
            PRIMARY KEY (programa_id, kompetencija_id)
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS rezultatas (
            id           SERIAL PRIMARY KEY,
            vartotojo_id INTEGER REFERENCES vartotojas(id) ON DELETE CASCADE,
            vieta        INTEGER NOT NULL,
            programa_id  INTEGER REFERENCES programa(id),
            balas        DECIMAL(5,2) NOT NULL
        );
    """)

    conn.commit()

    _seed_kompetencijos(cur, conn)
    _seed_klausimai(cur, conn)
    _seed_programos(cur, conn)
    _seed_svoriai(cur, conn)

    cur.close()
    conn.close()
    print("Duomenų bazė paruošta (7 lentelės).")


# ════════════════════════════════════════
# PRADINIŲ DUOMENŲ ĮKĖLIMAS (seed)
# ════════════════════════════════════════

def _seed_kompetencijos(cur, conn):
    cur.execute("SELECT COUNT(*) FROM kompetencija")
    if cur.fetchone()[0] > 0:
        return

    kompetencijos = [
        ("Emocinė savimonė",         "EI",      "Gebėjimas atpažinti savo emocijas ir suprasti jų įtaką"),
        ("Emocinė savikontrolė",     "EI",      "Gebėjimas valdyti impulsyvias emocijas ir elgesį"),
        ("Adaptyvumas",              "EI",      "Lankstumas prisitaikant prie besikeičiančių situacijų"),
        ("Orientacija į pasiekimus", "EI",      "Siekis tobulėti ir pasiekti aukštų standartų"),
        ("Pozityvus požiūris",       "EI",      "Gebėjimas matyti teigiamus aspektus situacijose"),
        ("Empatija",                 "EI",      "Gebėjimas suprasti kitų žmonių emocijas ir perspektyvą"),
        ("Organizacinis sąmoningumas","EI",     "Gebėjimas suprasti grupės dinamiką ir neformalius ryšius"),
        ("Įtaka",                    "EI",      "Gebėjimas daryti teigiamą įtaką ir įtikinti kitus"),
        ("Mentorystė ir ugdymas",    "EI",      "Gebėjimas ugdyti kitų gebėjimus ir dalintis žiniomis"),
        ("Konfliktų valdymas",       "EI",      "Gebėjimas konstruktyviai spręsti nesutarimus"),
        ("Komandinis darbas",        "EI",      "Gebėjimas efektyviai bendradarbiauti siekiant bendro tikslo"),
        ("Įkvepianti lyderystė",     "EI",      "Gebėjimas įkvėpti ir motyvuoti kitus"),
        ("Atvirumas patirčiai",      "BigFive", "Smalsumas, kūrybiškumas, polinkis į naujoves"),
        ("Sąmoningumas",             "BigFive", "Organizuotumas, kruopštumas, atsakingumas"),
        ("Ekstraversija",            "BigFive", "Komunikabilumas, energingumas, socialumas"),
        ("Sutariamumas",             "BigFive", "Bendradarbiavimas, pasitikėjimas, empatiškumas"),
        ("Emocinis stabilumas",      "BigFive", "Ramumas, atsparumas stresui (atvirkštinis neurotizmas)"),
    ]

    for pav, kat, apr in kompetencijos:
        cur.execute("""
            INSERT INTO kompetencija (pavadinimas, kategorija, aprasymas)
            VALUES (%s, %s, %s)
            ON CONFLICT (pavadinimas) DO UPDATE
                SET kategorija = EXCLUDED.kategorija,
                    aprasymas  = EXCLUDED.aprasymas
        """, (pav, kat, apr))

    conn.commit()
    print("DB kompetencijos įkeltos/atnaujintos.")


def _seed_klausimai(cur, conn):
    cur.execute("SELECT id, pavadinimas FROM kompetencija")
    komp_map = {row[1]: row[0] for row in cur.fetchall()}

    klausimai = [
        (1,  "Lengvai atpažįstu savo emocijas kasdienėse situacijose.",              "scale", "Emocinė savimonė"),
        (2,  "Sugebu suvaldyti pyktį ar nerimą stresinėse situacijose.",             "scale", "Emocinė savikontrolė"),
        (3,  "Man nesunku prisitaikyti prie netikėtų pokyčių.",                      "scale", "Adaptyvumas"),
        (4,  "Siekiu tobulėti ir kelti sau aukštus standartus.",                     "scale", "Orientacija į pasiekimus"),
        (5,  "Dažniausiai situacijas vertinu teigiamai.",                            "scale", "Pozityvus požiūris"),
        (6,  "Gerai suprantu kitų žmonių jausmus ir perspektyvą.",                   "scale", "Empatija"),
        (7,  "Jaučiu grupės dinamiką ir neformalius santykius komandoje.",           "scale", "Organizacinis sąmoningumas"),
        (8,  "Man sekasi įtikinti kitus ir gauti jų palaikymą.",                     "scale", "Įtaka"),
        (9,  "Mėgstu padėti kitiems mokytis ir tobulėti.",                           "scale", "Mentorystė ir ugdymas"),
        (10, "Sugebu rasti kompromisą konfliktinėse situacijose.",                   "scale", "Konfliktų valdymas"),
        (11, "Efektyviai dirbu komandoje siekdamas bendro tikslo.",                  "scale", "Komandinis darbas"),
        (12, "Man patinka eksperimentuoti su naujomis idėjomis.",                    "scale", "Atvirumas patirčiai"),
        (13, "Esu organizuotas ir kruopštus savo darbe.",                            "scale", "Sąmoningumas"),
        (14, "Mėgstu bendrauti ir esu energingas su žmonėmis.",                      "scale", "Ekstraversija"),
        (15, "Man svarbu bendradarbiauti ir išlaikyti gerus santykius.",             "scale", "Sutariamumas"),
        (16, "Dažnai jaučiu nerimą ar stresą.",                                     "scale", "Emocinis stabilumas"),
        (17, "Man patinka įkvėpti kitus ir rodyti pavyzdį siekiant bendro tikslo.",  "scale", "Įkvepianti lyderystė"),
        (18, "Prisimink situaciją, kai susidūrei su sunkumu ar nesėkme (pvz. mokykloje, sporte, draugystėje). Kaip jauteisi ir ką padarei?", "open", None),
        (19, "Papasakok apie situaciją, kai dirbai ar mokeisi kartu su kitais žmonėmis. Kas tau toje patirtyje patiko ar nepatiko?",        "open", None),
        (20, "Kas tau suteikia daugiausiai energijos — kai dirbi vienas ir giliniesi į temą, ar kai bendrauti ir veiki su žmonėmis? Kodėl?", "open", None),
        (21, "Ar esi kada nors padėjęs kitam žmogui išmokti ką nors naujo arba spręsti problemą? Kaip tai vyko ir kaip jauteisi?",          "open", None),
    ]

    for eile, tekstas, tipas, komp_pav in klausimai:
        komp_id = komp_map.get(komp_pav) if komp_pav else None
        cur.execute("""
            INSERT INTO klausimas (eile, tekstas, tipas, kompetencija_id)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (eile) DO UPDATE
                SET tekstas = EXCLUDED.tekstas
        """, (eile, tekstas, tipas, komp_id))

    conn.commit()
    print("DB klausimai įkelti/atnaujinti.")


def _seed_programos(cur, conn):
    cur.execute("SELECT COUNT(*) FROM programa")
    if cur.fetchone()[0] > 0:
        return

    programos = [
        ("Bioinformatika",                  "6121BX001", "Apjungia biologiją ir informatikos metodus."),
        ("Duomenų mokslas",                 "6121BX002", "Statistika, mašininis mokymasis ir programavimas."),
        ("Finansų ir draudimo matematika",  "6121BX003", "Matematika ir finansų teorija."),
        ("Informacinių sistemų inžinerija", "6121BX004", "Didelių informacinių sistemų kūrimas ir valdymas."),
        ("Informatika",                     "6121BX005", "Teorinė ir praktinė informatika."),
        ("Matematika ir taikymai",          "6121BX006", "Klasikinė matematika ir abstraktus mąstymas."),
        ("Programų sistemos",               "6121BX007", "Programinės įrangos kūrimas ir testavimas."),
        ("Verslo duomenų analitika",        "6121BX008", "Matematika, IT ir verslo žinios."),
    ]

    for pav, kodas, apr in programos:
        cur.execute("""
            INSERT INTO programa (pavadinimas, kodas, aprasymas)
            VALUES (%s, %s, %s)
            ON CONFLICT (pavadinimas) DO UPDATE
                SET kodas    = EXCLUDED.kodas,
                    aprasymas = EXCLUDED.aprasymas
        """, (pav, kodas, apr))

    conn.commit()
    print("DB programos įkeltos/atnaujintos.")


def _seed_svoriai(cur, conn):
    cur.execute("SELECT COUNT(*) FROM programos_kompetencija")
    if cur.fetchone()[0] > 0:
        return

    cur.execute("SELECT id, pavadinimas FROM programa")
    prog_map = {row[1]: row[0] for row in cur.fetchall()}

    cur.execute("SELECT id, pavadinimas FROM kompetencija ORDER BY id")
    komp_map = {row[1]: row[0] for row in cur.fetchall()}

    komp_eile = [
        "Emocinė savimonė", "Emocinė savikontrolė", "Adaptyvumas",
        "Orientacija į pasiekimus", "Pozityvus požiūris", "Empatija",
        "Organizacinis sąmoningumas", "Įtaka", "Mentorystė ir ugdymas",
        "Konfliktų valdymas", "Komandinis darbas", "Įkvepianti lyderystė",
        "Atvirumas patirčiai", "Sąmoningumas", "Ekstraversija",
        "Sutariamumas", "Emocinis stabilumas"
    ]

    svoriai = {
        "Bioinformatika":                  [2.33, 2.00, 2.33, 3.00, 2.67, 2.33, 2.00, 2.00, 2.00, 2.00, 2.67, 2.33, 2.67, 3.00, 1.67, 2.33, 2.33],
        "Duomenų mokslas":                 [2.00, 3.00, 2.67, 2.67, 2.67, 2.00, 2.33, 2.00, 1.67, 2.33, 3.00, 2.33, 2.33, 2.67, 1.67, 1.33, 2.00],
        "Finansų ir draudimo matematika":  [2.00, 2.00, 2.00, 2.00, 2.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 2.00, 3.00, 2.00, 2.00, 2.00],
        "Informacinių sistemų inžinerija": [3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 3.00, 2.00, 3.00, 3.00],
        "Informatika":                     [1.00, 1.00, 3.00, 0.00, 2.00, 1.00, 2.00, 0.00, 1.00, 2.00, 3.00, 2.00, 2.00, 2.00, 0.00, 2.00, 3.00],
        "Matematika ir taikymai":          [2.00, 1.00, 2.00, 3.00, 3.00, 1.00, 2.00, 2.00, 3.00, 2.00, 1.00, 1.00, 2.00, 3.00, 2.00, 2.00, 2.00],
        "Programų sistemos":               [2.00, 2.00, 2.00, 3.00, 3.00, 2.00, 2.00, 3.00, 2.00, 3.00, 3.00, 2.00, 3.00, 3.00, 2.00, 2.00, 2.00],
        "Verslo duomenų analitika":        [3.00, 2.00, 1.00, 3.00, 3.00, 3.00, 3.00, 3.00, 2.00, 2.00, 3.00, 2.00, 2.00, 3.00, 2.00, 1.00, 2.00],
    }

    for prog_pav, svoriu_sarasas in svoriai.items():
        prog_id = prog_map.get(prog_pav)
        if not prog_id:
            continue
        for i, svoris in enumerate(svoriu_sarasas):
            komp_pav = komp_eile[i]
            komp_id = komp_map.get(komp_pav)
            if not komp_id:
                continue
            cur.execute("""
                INSERT INTO programos_kompetencija
                    (programa_id, kompetencija_id, svoris)
                VALUES (%s, %s, %s)
                ON CONFLICT (programa_id, kompetencija_id) DO UPDATE
                    SET svoris = EXCLUDED.svoris
            """, (prog_id, komp_id, svoris))

    conn.commit()
    print("DB svorių matrica įkelta/atnaujinta.")


# ════════════════════════════════════════
# DB PAGALBINĖS FUNKCIJOS
# ════════════════════════════════════════

def gauti_klausimai_is_db():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT k.id, k.eile, k.tekstas, k.tipas,
               komp.pavadinimas as kompetencija
        FROM klausimas k
        LEFT JOIN kompetencija komp ON k.kompetencija_id = komp.id
        ORDER BY k.eile
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [dict(r) for r in rows]


def gauti_svoriai_is_db():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT p.pavadinimas as programa,
               pk.svoris,
               k.id as komp_id
        FROM programos_kompetencija pk
        JOIN programa p ON pk.programa_id = p.id
        JOIN kompetencija k ON pk.kompetencija_id = k.id
        ORDER BY p.pavadinimas, k.id
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    programs = {}
    for row in rows:
        prog = row["programa"]
        if prog not in programs:
            programs[prog] = []
        programs[prog].append(float(row["svoris"]))
    return programs


def issaugoti_sesija(sesijos_id: str, answers: dict,
                     top3: list, nlp_scores: dict):
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO vartotojas (sesijos_id, baigtas)
            VALUES (%s, TRUE) RETURNING id
        """, (sesijos_id,))
        vartotojo_id = cur.fetchone()[0]

        cur.execute("SELECT id, eile, tipas FROM klausimas ORDER BY eile")
        klausimai_db = {row[1]: (row[0], row[2]) for row in cur.fetchall()}

        nlp_json = json.dumps(nlp_scores) if nlp_scores else None

        for eile, (kl_id, tipas) in klausimai_db.items():
            reiksme = answers.get(str(eile)) or answers.get(eile)
            if reiksme is None:
                continue

            if tipas == "scale":
                cur.execute("""
                    INSERT INTO atsakymas
                        (vartotojo_id, klausimo_id, reiksme, nlp_rezultatas)
                    VALUES (%s, %s, %s, %s)
                """, (vartotojo_id, kl_id, int(float(reiksme)), None))
            else:
                cur.execute("""
                    INSERT INTO atsakymas
                        (vartotojo_id, klausimo_id, tekstas, nlp_rezultatas)
                    VALUES (%s, %s, %s, %s)
                """, (vartotojo_id, kl_id, str(reiksme),
                      nlp_json if eile == 21 else None))

        cur.execute("SELECT id, pavadinimas FROM programa")
        prog_map = {row[1]: row[0] for row in cur.fetchall()}

        for i, rez in enumerate(top3):
            prog_id = prog_map.get(rez["program"])
            cur.execute("""
                INSERT INTO rezultatas (vartotojo_id, vieta, programa_id, balas)
                VALUES (%s, %s, %s, %s)
            """, (vartotojo_id, i + 1, prog_id, rez["score"]))

        conn.commit()
        cur.close()
        conn.close()
        print(f"[DB] Sesija '{sesijos_id}' išsaugota (vartotojas #{vartotojo_id}).")
        return vartotojo_id

    except Exception as e:
        print(f"[DB] ⚠ Klaida: {e}")
        return None


# ════════════════════════════════════════
# NLP FUNKCIJA
# ════════════════════════════════════════

NLP_COMPETENCY_MAP = {
    "emotional_awareness":        [0],
    "emotional_control":          [1],
    "adaptability":               [2],
    "achievement_orientation":    [3],
    "positive_outlook":           [4],
    "empathy":                    [5],
    "organizational_awareness":   [6],
    "influence":                  [7],
    "mentoring":                  [8],
    "conflict_management":        [9],
    "teamwork":                   [10],
    "inspirational_leadership":   [11],
    "openness":                   [12],
    "conscientiousness":          [13],
    "extraversion":               [14],
    "agreeableness":              [15],
    "neuroticism":                [16],
}


def analyze_open_answers(q18_text: str, q19_text: str,
                         q20_text: str = "", q21_text: str = "") -> dict:
    if not groq_client:
        return {}

    combined = " | ".join(
        t for t in [q18_text, q19_text, q20_text, q21_text] if t and t.strip()
    )
    if not combined:
        return {}

    prompt = f"""Tu esi Vilniaus universiteto Matematikos ir informatikos fakulteto (VU MIF) studijų programų rekomendavimo sistemos dalis.

Tavo užduotis – išanalizuoti stojančiojo į bakalauro studijas (dažniausiai moksleivis) laisvos formos tekstinį atsakymą ir įvertinti psichologines kompetencijas pagal du modelius:

1. Golemano emocinio intelekto modelis (4 domenai, 12 kompetencijų):
   - Savimonė: emotional_awareness (emocinė savimonė)
   - Savivaldymas: emotional_control (emocinė savikontrolė), adaptability (adaptyvumas), achievement_orientation (orientacija į pasiekimus), positive_outlook (pozityvus požiūris)
   - Socialinis sąmoningumas: empathy (empatija)
   - Santykių valdymas: influence (įtaka), teamwork (komandinis darbas)

2. Big Five asmenybės modelis:
   - openness (atvirumas patirčiai)
   - conscientiousness (sąmoningumas)
   - extraversion (ekstraversija)

Kontekstas: VU MIF siūlo 10 bakalauro programų matematikos ir informatikos srityse. Svarbu nustatyti, ar stojantysis linkęs į analitinį, kūrybinį, socialinį ar lyderystės pobūdžio darbą.

Skalė: 0.0 (visiškai neatsispindi) – 1.0 (labai stipriai atsispindi).

Tekstas: "{combined}"

Atsakyk TIK JSON formatu, be jokio papildomo teksto:
{{
  "emotional_awareness": 0.0,
  "emotional_control": 0.0,
  "adaptability": 0.0,
  "achievement_orientation": 0.0,
  "positive_outlook": 0.0,
  "empathy": 0.0,
  "organizational_awareness": 0.0,
  "influence": 0.0,
  "mentoring": 0.0,
  "conflict_management": 0.0,
  "teamwork": 0.0,
  "inspirational_leadership": 0.0,
  "openness": 0.0,
  "conscientiousness": 0.0,
  "extraversion": 0.0,
  "agreeableness": 0.0,
  "neuroticism": 0.0
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=300,
        )
        raw = response.choices[0].message.content.strip()
        scores = json.loads(raw)

        validated = {}
        for key in NLP_COMPETENCY_MAP.keys():
            val = float(scores.get(key, 0.0))
            validated[key] = max(0.0, min(1.0, val))

        print(f"[NLP] Analizė sėkminga: {validated}")
        return validated

    except Exception as e:
        print(f"[NLP] ⚠ Klaida: {e}")
        return {}


# ════════════════════════════════════════
# ENDPOINT'AI
# ════════════════════════════════════════

@app.route('/api/questions', methods=['GET'])
def get_questions():
    klausimai = gauti_klausimai_is_db()
    return jsonify([{
        "id":         k["eile"],
        "text":       k["tekstas"],
        "competency": k["kompetencija"],
        "type":       k["tipas"]
    } for k in klausimai])


@app.route('/api/recommend', methods=['POST'])
def recommend():
    import uuid
    data = request.json
    answers = data.get('answers', {})

    programs = gauti_svoriai_is_db()

    student_profile = []
    for qid in range(1, 18):
        score = float(answers.get(str(qid), 3))
        student_profile.append((score - 1) / 4)

    q18 = answers.get("18", "")
    q19 = answers.get("19", "")
    q20 = answers.get("20", "")
    q21 = answers.get("21", "")
    nlp_scores = analyze_open_answers(q18, q19, q20, q21)

    NLP_WEIGHT = 0.2
    if nlp_scores:
        for competency, indices in NLP_COMPETENCY_MAP.items():
            nlp_val = nlp_scores.get(competency, 0.0)
            for idx in indices:
                student_profile[idx] = (
                    student_profile[idx] * (1 - NLP_WEIGHT) +
                    nlp_val * NLP_WEIGHT
                )

    program_names = list(programs.keys())
    program_matrix = np.array(list(programs.values()))
    program_matrix_norm = program_matrix / 3.0
    scores = cosine_similarity([student_profile], program_matrix_norm)[0]

    ranked = sorted(zip(program_names, scores), key=lambda x: x[1], reverse=True)
    top3 = [
        {"program": name, "score": round(float(score) * 100, 1)}
        for name, score in ranked[:3]
    ]

    sesijos_id = str(uuid.uuid4())[:8]
    issaugoti_sesija(sesijos_id, answers, top3, nlp_scores)

    return jsonify({
        "recommendations": top3,
        "open_answers": {"q18": q18, "q19": q19, "q20": q20, "q21": q21},
        "nlp_used": bool(nlp_scores)
    })


@app.route('/api/statistika', methods=['GET'])
def statistika():
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        cur.execute("SELECT COUNT(*) as sesiju_sk FROM vartotojas WHERE baigtas = TRUE")
        sesijos = cur.fetchone()

        cur.execute("""
            SELECT p.pavadinimas as programa,
                   COUNT(*) as kartu,
                   ROUND(AVG(r.balas)::numeric, 1) as vid_balas
            FROM rezultatas r
            JOIN programa p ON r.programa_id = p.id
            WHERE r.vieta = 1
            GROUP BY p.pavadinimas
            ORDER BY kartu DESC
        """)
        populiariausios = cur.fetchall()

        cur.close()
        conn.close()

        return jsonify({
            "uzbaigtu_sesiju": sesijos["sesiju_sk"],
            "populiariausios_programos": [dict(r) for r in populiariausios]
        })

    except Exception as e:
        return jsonify({"klaida": str(e)}), 500

# ════════════════════════════════════════
# PALEIDIMAS
# ════════════════════════════════════════

if __name__ == '__main__':
    if not groq_client:
        print("GROQ_API_KEY nenustatytas – sistema veiks be NLP analizės.")
    else:
        print("Groq NLP modulis aktyvus (llama-3.1-8b-instant)")

    init_db()
    app.run(debug=True, port=5001, host='0.0.0.0')
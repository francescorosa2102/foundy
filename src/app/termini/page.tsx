export default function TerminiPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: '3rem 1rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>Termini e Condizioni</h1>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 40 }}>Ultimo aggiornamento: Aprile 2025</p>

        {[
          {
            title: '1. Accettazione dei termini',
            content: 'Utilizzando Foundy accetti integralmente i presenti Termini e Condizioni. Se non accetti, ti preghiamo di non utilizzare la piattaforma. Foundy si riserva il diritto di modificare questi termini in qualsiasi momento.'
          },
          {
            title: '2. Descrizione del servizio',
            content: 'Foundy è una piattaforma digitale italiana che connette persone con idee imprenditoriali con potenziali co-founder, soci e collaboratori. Foundy non è un\'agenzia di lavoro, un intermediario finanziario né un consulente legale o fiscale.'
          },
          {
            title: '3. Requisiti di utilizzo',
            content: 'Per utilizzare Foundy devi avere almeno 18 anni di età. Registrandoti dichiari di avere l\'età minima richiesta e di fornire informazioni veritiere e accurate.'
          },
          {
            title: '4. Contenuti pubblicati dagli utenti',
            content: 'Gli utenti sono gli unici responsabili dei contenuti che pubblicano su Foundy, incluse idee, descrizioni, immagini e messaggi. Foundy non verifica, non approva e non è responsabile dei contenuti pubblicati dagli utenti. È vietato pubblicare contenuti illeciti, diffamatori, offensivi o che violino diritti di terzi.'
          },
          {
            title: '5. Proprietà intellettuale e idee',
            content: 'Foundy è una piattaforma di connessione e non rivendica alcun diritto sulle idee pubblicate dagli utenti. Le idee pubblicate sono visibili pubblicamente a tutti gli utenti registrati. Foundy non è responsabile per eventuali furti, copie o utilizzi non autorizzati di idee da parte di altri utenti. Chi pubblica un\'idea lo fa consapevolmente e volontariamente accettando la visibilità pubblica della stessa.'
          },
          {
            title: '6. Limitazione di responsabilità',
            content: 'Foundy non è responsabile per: danni diretti o indiretti derivanti dall\'uso della piattaforma; mancata conclusione di accordi tra utenti; comportamenti scorretti di altri utenti; perdita di dati; interruzioni del servizio. La piattaforma è fornita "così com\'è" senza garanzie di alcun tipo.'
          },
          {
            title: '7. Privacy e dati personali',
            content: 'Il trattamento dei dati personali è disciplinato dalla nostra Privacy Policy, disponibile in calce alla pagina. Foundy tratta i dati nel rispetto del Regolamento Europeo GDPR 2016/679.'
          },
          {
            title: '8. Sospensione e cancellazione',
            content: 'Foundy si riserva il diritto di sospendere o cancellare account che violano i presenti termini, pubblicano contenuti inappropriati o utilizzano la piattaforma in modo fraudolento, senza obbligo di preavviso.'
          },
          {
            title: '9. Legge applicabile',
            content: 'I presenti Termini e Condizioni sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro di Milano.'
          },
          {
            title: '10. Contatti',
            content: 'Per qualsiasi domanda sui presenti termini puoi contattarci all\'indirizzo email presente nel profilo del founder o tramite i nostri canali social @foundy.it.'
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: '#F1F5F9', marginBottom: 10 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}

        <div style={{ borderTop: '1px solid #2D3F5C', paddingTop: 24, marginTop: 16 }}>
          <a href="/" style={{ fontSize: 14, color: '#7C3AED' }}>← Torna alla home</a>
        </div>
      </div>
    </div>
  )
}
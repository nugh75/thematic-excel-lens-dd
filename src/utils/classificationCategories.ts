// File condiviso per le categorie di classificazione
// Utilizzato sia da BatchClassificationWizard che da ColumnConfiguration

export interface CategoryGroup {
  group: string;
  categories: Array<{ value: string; label: string }>;
}

// Categorie predefinite per anagrafiche organizzate in gruppi (sottotipo: chiusa)
export const demograficCategoryGroups: CategoryGroup[] = [
  {
    group: 'Dati personali di base',
    categories: [
      { value: 'età', label: 'Età' },
      { value: 'genere', label: 'Genere' },
      { value: 'data_nascita', label: 'Data di nascita' },
      { value: 'codice_fiscale', label: 'Codice fiscale' },
      { value: 'documento_identità', label: 'Documento di identità' }
    ]
  },
  {
    group: 'Istruzione e formazione',
    categories: [
      { value: 'titolo_studio', label: 'Titolo di studio' },
      { value: 'scuola_università', label: 'Scuola/Università' },
      { value: 'corso_studi', label: 'Corso di studi' },
      { value: 'voto_diploma_laurea', label: 'Voto diploma/laurea' },
      { value: 'formazione_professionale', label: 'Formazione professionale' },
      { value: 'certificazioni', label: 'Certificazioni' }
    ]
  },
  {
    group: 'Lavoro e professione',
    categories: [
      { value: 'professione', label: 'Professione' },
      { value: 'settore_lavorativo', label: 'Settore lavorativo' },
      { value: 'esperienza_lavorativa', label: 'Esperienza lavorativa' },
      { value: 'posizione_lavorativa', label: 'Posizione lavorativa' },
      { value: 'tipo_contratto', label: 'Tipo di contratto' },
      { value: 'azienda_ente', label: 'Azienda/Ente' },
      { value: 'dimensione_azienda', label: 'Dimensione azienda' }
    ]
  },
  {
    group: 'Situazione familiare',
    categories: [
      { value: 'stato_civile', label: 'Stato civile' },
      { value: 'nucleo_familiare', label: 'Nucleo familiare' },
      { value: 'numero_figli', label: 'Numero di figli' },
      { value: 'età_figli', label: 'Età dei figli' },
      { value: 'convivenza', label: 'Convivenza' },
      { value: 'caregiver', label: 'Ruolo di caregiver' }
    ]
  },
  {
    group: 'Ubicazione geografica',
    categories: [
      { value: 'residenza', label: 'Residenza/Località' },
      { value: 'domicilio', label: 'Domicilio' },
      { value: 'provincia', label: 'Provincia' },
      { value: 'regione', label: 'Regione' },
      { value: 'nazione', label: 'Nazione' },
      { value: 'cap', label: 'CAP' },
      { value: 'zona_geografica', label: 'Zona geografica' },
      { value: 'tipo_abitazione', label: 'Tipo di abitazione' }
    ]
  },
  {
    group: 'Aspetti culturali e linguistici',
    categories: [
      { value: 'nazionalità', label: 'Nazionalità' },
      { value: 'cittadinanza', label: 'Cittadinanza' },
      { value: 'lingua', label: 'Lingua' },
      { value: 'lingua_madre', label: 'Lingua madre' },
      { value: 'religione', label: 'Religione' },
      { value: 'etnia', label: 'Etnia' },
      { value: 'cultura_appartenenza', label: 'Cultura di appartenenza' }
    ]
  },
  {
    group: 'Aspetti economici',
    categories: [
      { value: 'reddito', label: 'Reddito' },
      { value: 'fascia_reddito', label: 'Fascia di reddito' },
      { value: 'reddito_familiare', label: 'Reddito familiare' },
      { value: 'situazione_economica', label: 'Situazione economica' },
      { value: 'patrimonio', label: 'Patrimonio' },
      { value: 'spese_mensili', label: 'Spese mensili' }
    ]
  },
  {
    group: 'Salute e benessere',
    categories: [
      { value: 'disabilità', label: 'Disabilità/Accessibilità' },
      { value: 'stato_salute', label: 'Stato di salute' },
      { value: 'condizioni_mediche', label: 'Condizioni mediche' },
      { value: 'limitazioni_funzionali', label: 'Limitazioni funzionali' },
      { value: 'allergie', label: 'Allergie' },
      { value: 'terapie_farmaci', label: 'Terapie/Farmaci' }
    ]
  },
  {
    group: 'Contatti e comunicazione',
    categories: [
      { value: 'telefono', label: 'Telefono' },
      { value: 'email', label: 'Email' },
      { value: 'indirizzo_postale', label: 'Indirizzo postale' },
      { value: 'social_media', label: 'Social media' },
      { value: 'preferenze_contatto', label: 'Preferenze di contatto' }
    ]
  },
  {
    group: 'Stile di vita e interessi',
    categories: [
      { value: 'hobby_interessi', label: 'Hobby e interessi' },
      { value: 'attività_sportive', label: 'Attività sportive' },
      { value: 'volontariato', label: 'Volontariato' },
      { value: 'viaggi', label: 'Viaggi' },
      { value: 'lettura_media', label: 'Lettura e media' },
      { value: 'tecnologia_uso', label: 'Uso della tecnologia' }
    ]
  },
  {
    group: 'Mobilità e trasporti',
    categories: [
      { value: 'patente_guida', label: 'Patente di guida' },
      { value: 'veicoli_posseduti', label: 'Veicoli posseduti' },
      { value: 'mezzi_trasporto', label: 'Mezzi di trasporto utilizzati' },
      { value: 'mobilità_limitazioni', label: 'Limitazioni alla mobilità' }
    ]
  }
];

// Categorie predefinite per domande aperte anagrafiche (sottotipo: aperta)
export const openDemograficCategoryGroups: CategoryGroup[] = [
  {
    group: 'Codici e identificativi',
    categories: [
      { value: 'codice_cliente', label: 'Codice cliente' },
      { value: 'codice_utente', label: 'Codice utente' },
      { value: 'username', label: 'Username' },
      { value: 'codice_fiscale_libero', label: 'Codice fiscale (testo libero)' },
      { value: 'numero_documento', label: 'Numero documento' },
      { value: 'codice_pratica', label: 'Codice pratica' },
      { value: 'numero_tessera', label: 'Numero tessera' },
      { value: 'codice_rispondente', label: 'Codice rispondente' },
      { value: 'id_partecipante', label: 'ID partecipante' },
      { value: 'codice_anonimo', label: 'Codice anonimo' }
    ]
  },
  {
    group: 'Data e ora',
    categories: [
      { value: 'data_nascita_libera', label: 'Data di nascita (testo libero)' },
      { value: 'data_compilazione', label: 'Data di compilazione' },
      { value: 'ora_compilazione', label: 'Ora di compilazione' },
      { value: 'timestamp', label: 'Timestamp' },
      { value: 'data_ora_compilazione', label: 'Data e ora di compilazione' },
      { value: 'data_iscrizione', label: 'Data di iscrizione' },
      { value: 'data_evento', label: 'Data evento' },
      { value: 'periodo_riferimento', label: 'Periodo di riferimento' }
    ]
  },
  {
    group: 'Informazioni di contatto',
    categories: [
      { value: 'indirizzo_completo', label: 'Indirizzo completo' },
      { value: 'email_libera', label: 'Email (testo libero)' },
      { value: 'telefono_libero', label: 'Telefono (testo libero)' },
      { value: 'sito_web_personale', label: 'Sito web personale' },
      { value: 'social_media_profilo', label: 'Profilo social media' }
    ]
  },
  {
    group: 'Descrizioni personali',
    categories: [
      { value: 'nome_completo', label: 'Nome completo' },
      { value: 'biografia', label: 'Biografia' },
      { value: 'presentazione', label: 'Presentazione personale' },
      { value: 'competenze_descrizione', label: 'Descrizione competenze' },
      { value: 'esperienza_descrizione', label: 'Descrizione esperienza' }
    ]
  },
  {
    group: 'Follow-up e note',
    categories: [
      { value: 'note_personali', label: 'Note personali' },
      { value: 'follow_up', label: 'Follow-up' },
      { value: 'promemoria', label: 'Promemoria' },
      { value: 'osservazioni', label: 'Osservazioni' },
      { value: 'commenti_aggiuntivi', label: 'Commenti aggiuntivi' }
    ]
  },
  {
    group: 'Informazioni di compilazione',
    categories: [
      { value: 'modalita_compilazione', label: 'Modalità di compilazione' },
      { value: 'dispositivo_utilizzato', label: 'Dispositivo utilizzato' },
      { value: 'browser_utilizzato', label: 'Browser utilizzato' },
      { value: 'ip_address', label: 'Indirizzo IP' },
      { value: 'sessione_id', label: 'ID sessione' },
      { value: 'tempo_compilazione', label: 'Tempo di compilazione' },
      { value: 'pagina_provenienza', label: 'Pagina di provenienza' }
    ]
  },
  {
    group: 'Altro',
    categories: [
      { value: 'motivazioni', label: 'Motivazioni' },
      { value: 'obiettivi', label: 'Obiettivi' },
      { value: 'aspettative', label: 'Aspettative' },
      { value: 'preferenze_descrizione', label: 'Descrizione preferenze' }
    ]
  }
];

// Categorie predefinite per domande non anagrafiche chiuse (sottotipo: chiusa)
export const questionCategoryGroups: CategoryGroup[] = [
  {
    group: 'Scale di valutazione',
    categories: [
      { value: 'scala_likert', label: 'Scala Likert (1-5, 1-7, etc.)' },
      { value: 'rating_numerico', label: 'Rating numerico' },
      { value: 'scala_semantica', label: 'Scala semantica differenziale' },
      { value: 'scala_visiva', label: 'Scala visiva analogica' },
      { value: 'scala_frequenza', label: 'Scala di frequenza' },
      { value: 'scala_importanza', label: 'Scala di importanza' },
      { value: 'scala_soddisfazione', label: 'Scala di soddisfazione' },
      { value: 'scala_probabilità', label: 'Scala di probabilità' }
    ]
  },
  {
    group: 'Domande chiuse',
    categories: [
      { value: 'scelta_multipla', label: 'Scelta multipla' },
      { value: 'scelta_singola', label: 'Scelta singola' },
      { value: 'si_no', label: 'Sì/No' },
      { value: 'vero_falso', label: 'Vero/Falso' },
      { value: 'accordo_disaccordo', label: 'Accordo/Disaccordo' },
      { value: 'presente_assente', label: 'Presente/Assente' },
      { value: 'applica_non_applica', label: 'Si applica/Non si applica' }
    ]
  },
  {
    group: 'Domande di ordinamento e priorità',
    categories: [
      { value: 'graduatoria', label: 'Graduatoria/Ranking' },
      { value: 'ordinamento', label: 'Ordinamento per priorità' },
      { value: 'confronto_coppie', label: 'Confronto a coppie' },
      { value: 'distribuzione_punti', label: 'Distribuzione punti' }
    ]
  },
  {
    group: 'Domande complesse',
    categories: [
      { value: 'matrice', label: 'Matrice di valutazione' },
      { value: 'griglia_domande', label: 'Griglia di domande' },
      { value: 'tabella_valutazione', label: 'Tabella di valutazione' },
      { value: 'matrice_correlazione', label: 'Matrice di correlazione' }
    ]
  },
  {
    group: 'Domande numeriche e quantitative',
    categories: [
      { value: 'numero_intero', label: 'Numero intero' },
      { value: 'numero_decimale', label: 'Numero decimale' },
      { value: 'percentuale', label: 'Percentuale' },
      { value: 'valuta', label: 'Valuta/Importo' },
      { value: 'quantità', label: 'Quantità' },
      { value: 'peso_misura', label: 'Peso/Misura' }
    ]
  },
  {
    group: 'Domande temporali',
    categories: [
      { value: 'data', label: 'Data' },
      { value: 'ora', label: 'Ora' },
      { value: 'data_ora', label: 'Data e ora' },
      { value: 'periodo', label: 'Periodo/Durata' },
      { value: 'anno', label: 'Anno' },
      { value: 'mese_anno', label: 'Mese e anno' }
    ]
  },
  {
    group: 'Domande di contatto e localizzazione',
    categories: [
      { value: 'email_question', label: 'Indirizzo email' },
      { value: 'telefono_question', label: 'Numero di telefono' },
      { value: 'indirizzo', label: 'Indirizzo' },
      { value: 'sito_web', label: 'Sito web/URL' },
      { value: 'coordinate', label: 'Coordinate geografiche' }
    ]
  },
  {
    group: 'Domande di upload e allegati',
    categories: [
      { value: 'file_upload', label: 'Upload file' },
      { value: 'immagine', label: 'Upload immagine' },
      { value: 'documento', label: 'Upload documento' },
      { value: 'audio_video', label: 'Upload audio/video' }
    ]
  }
];

// Categorie predefinite per domande non anagrafiche aperte (sottotipo: aperta)
export const openQuestionCategoryGroups: CategoryGroup[] = [
  {
    group: 'Feedback e commenti',
    categories: [
      { value: 'feedback_generale', label: 'Feedback generale' },
      { value: 'commenti_liberi', label: 'Commenti liberi' },
      { value: 'suggerimenti_miglioramento', label: 'Suggerimenti di miglioramento' },
      { value: 'critiche_costruttive', label: 'Critiche costruttive' },
      { value: 'recensione', label: 'Recensione' },
      { value: 'testimonianza', label: 'Testimonianza' }
    ]
  },
  {
    group: 'Descrizioni e spiegazioni',
    categories: [
      { value: 'descrizione_problema', label: 'Descrizione problema' },
      { value: 'spiegazione_motivazioni', label: 'Spiegazione motivazioni' },
      { value: 'descrizione_esperienza', label: 'Descrizione esperienza' },
      { value: 'racconto_situazione', label: 'Racconto situazione' },
      { value: 'caso_studio', label: 'Caso di studio' }
    ]
  },
  {
    group: 'Opinioni e valutazioni',
    categories: [
      { value: 'opinione_personale', label: 'Opinione personale' },
      { value: 'valutazione_qualitativa', label: 'Valutazione qualitativa' },
      { value: 'impressioni', label: 'Impressioni' },
      { value: 'considerazioni', label: 'Considerazioni' },
      { value: 'percezione', label: 'Percezione' }
    ]
  },
  {
    group: 'Domande comportamentali e psicometriche',
    categories: [
      { value: 'comportamento', label: 'Comportamento' },
      { value: 'atteggiamento', label: 'Atteggiamento' },
      { value: 'intenzione', label: 'Intenzione' },
      { value: 'motivazione', label: 'Motivazione' },
      { value: 'preferenza', label: 'Preferenza' },
      { value: 'aspettativa', label: 'Aspettativa' }
    ]
  },
  {
    group: 'Domande testuali libere',
    categories: [
      { value: 'testo_breve', label: 'Testo breve' },
      { value: 'testo_lungo', label: 'Testo lungo/Paragrafo' },
      { value: 'commento_libero', label: 'Commento libero' },
      { value: 'descrizione', label: 'Descrizione' },
      { value: 'spiegazione', label: 'Spiegazione/Motivazione' },
      { value: 'suggerimenti', label: 'Suggerimenti/Raccomandazioni' }
    ]
  }
];

// Funzione helper per ottenere le categorie appropriate
export const getCategoryGroups = (type: 'anagrafica' | 'non_anagrafica', subtype: 'chiusa' | 'aperta' | null): CategoryGroup[] => {
  if (type === 'anagrafica') {
    return subtype === 'aperta' ? openDemograficCategoryGroups : demograficCategoryGroups;
  } else {
    return subtype === 'aperta' ? openQuestionCategoryGroups : questionCategoryGroups;
  }
};

// Funzione helper per filtrare le categorie con ricerca
export const filterCategoryGroups = (groups: CategoryGroup[], searchTerm: string): CategoryGroup[] => {
  if (!searchTerm) return groups;
  
  return groups.map(group => ({
    ...group,
    categories: group.categories.filter(cat => 
      cat.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.categories.length > 0);
};

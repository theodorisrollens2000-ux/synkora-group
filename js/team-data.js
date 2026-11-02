/*
 * Équipe et identité légale de Synkora Group.
 *
 * Seul fichier à modifier quand les informations sont officielles.
 * Tant qu'un champ est vide, rien ne s'affiche sur le site :
 * - aucune personne nommée  -> la section « Équipe » et ses liens sont masqués ;
 * - immatriculation absente -> pas de sous-titre ni de bloc légal en bas de page.
 *
 * Personne : {
 *   name: 'Prénom Nom',              // nom complet
 *   title: 'Directeur général',      // fonction telle qu'elle figure dans la résolution de nomination
 *   focus: 'Une ligne sur ce qu'elle porte.',
 *   photo: 'assets/team/prenom-nom.jpg', // facultatif : sinon les initiales
 *   lead: true,                      // responsable : carte complète ; sinon nom seul, sans titre
 *   // Fiche ouverte au clic (tout est facultatif) :
 *   bio: 'Deux ou trois phrases.',
 *   education: [{ title: 'Master informatique', school: 'Université …', year: '2022' }],
 *   career: [{ title: 'Développeur', org: 'Entreprise …', period: '2022 – 2025' }]
 * }
 */
window.SYNKORA_COMPANY = {
  name: 'Synkora Group',
  legalForm: '',     // ex. 'SAS'
  registeredIn: '',  // ex. 'en France', 'à Haïti'
  country: '',       // ex. 'France'
  registration: '',  // numéro d'immatriculation
  founded: ''        // année de constitution, ex. '2026'
};

window.SYNKORA_TEAM = {
  // Bloc au-dessus des onglets : directeur général.
  direction: [],
  // Conseil, s'il existe.
  board: [],
  // Quatre onglets, toujours affichés (la description apparaît sous l'onglet).
  areas: [
    { id: 'produit', label: 'Produit et ingénierie', description: 'Conception, design et développement des plateformes.', people: [] },
    { id: 'croissance', label: 'Croissance', description: 'Acquisition, partenariats et relation client.', people: [] },
    { id: 'operations', label: 'Opérations et finances', description: 'Organisation, budget et suivi de l’activité.', people: [] },
    { id: 'juridique', label: 'Juridique et conformité', description: 'Contrats, données personnelles et obligations légales.', people: [] }
  ]
};

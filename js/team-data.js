/*
 * Équipe et identité légale de Synkora Group.
 *
 * Seul fichier à modifier quand les informations sont officielles.
 * Tant qu'un champ est vide, rien ne s'affiche sur le site :
 * - aucune personne nommée  -> la section « Équipe » et ses liens sont masqués ;
 * - immatriculation absente -> pas de sous-titre ni de bloc légal en bas de page.
 *
 * Personne : {
 *   name: 'Prénom Nom',                  // nom complet
 *   title: 'Directeur général',          // fonction
 *   photo: 'assets/team/prenom-nom.jpg', // facultatif : sinon les initiales
 *   bio: 'Quelques lignes de présentation.' // affichées au clic ; ligne vide = nouveau paragraphe
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
  // Premier onglet : la Direction (le directeur général en premier).
  leadership: [],
  // Onglets suivants : un par pôle, avec ses membres.
  areas: [
    { id: 'produit', label: 'Produit et ingénierie', description: 'Conception, design et développement des plateformes.', people: [] },
    { id: 'croissance', label: 'Croissance', description: 'Acquisition, partenariats et relation client.', people: [] },
    { id: 'operations', label: 'Opérations et finances', description: 'Organisation, budget et suivi de l’activité.', people: [] },
    { id: 'juridique', label: 'Juridique et conformité', description: 'Contrats, données personnelles et obligations légales.', people: [] }
  ]
};

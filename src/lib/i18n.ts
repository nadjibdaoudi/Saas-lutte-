/**
 * WrestleLab - Centralized Internationalization (i18n)
 * Supports English (en), French (fr - Standard Greco-Roman Terminology), Arabic (ar)
 */

export type LanguageCode = 'en' | 'fr' | 'ar';

export interface Translations {
  appName: string;
  tagline: string;
  
  // Navigation
  navDashboard: string;
  navAthletes: string;
  navTeams: string;
  navTests: string;
  navAssessments: string;
  navTraining: string;
  navAttendance: string;
  navWeight: string;
  navInjuries: string;
  navCompetitions: string;
  navAnalytics: string;
  navReports: string;
  navSettings: string;
  
  // Roles
  roleSuperAdmin: string;
  roleClubAdmin: string;
  roleCoach: string;
  roleAthlete: string;
  
  // Common Actions
  addAthlete: string;
  createSession: string;
  startTesting: string;
  recordResults: string;
  exportReport: string;
  filter: string;
  search: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  viewProfile: string;
  viewHistory: string;
  allCategories: string;
  allTeams: string;
  allWeights: string;
  quickEntry: string;
  confirm: string;
  close: string;
  
  // Dashboard Metrics
  totalAthletes: string;
  activeAthletes: string;
  coaches: string;
  teams: string;
  upcomingTests: string;
  upcomingCompetitions: string;
  attendanceRate: string;
  improvingAthletes: string;
  needsAttention: string;
  avgPhysicalScore: string;
  avgWrestlingScore: string;
  
  // Wrestling Terminology
  grecoRoman: string;
  takedowns: string;
  throws: string;
  clinch: string;
  parTerre: string;
  gutWrench: string;
  passivity: string;
  technicalSuperiority: string;
  fall: string;
  points: string;
  cautions: string;
  
  // Categories
  strength: string;
  power: string;
  speed: string;
  agility: string;
  endurance: string;
  mobility: string;
  flexibility: string;
  reaction: string;
  
  // Status
  statusActive: string;
  statusInjured: string;
  statusResting: string;
  statusInactive: string;
  
  // Empty States
  noAthletes: string;
  noAthletesDesc: string;
  noTests: string;
  noCompetitions: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    appName: "WrestleLab",
    tagline: "Greco-Roman Wrestling Performance OS",
    navDashboard: "Dashboard",
    navAthletes: "Athletes",
    navTeams: "Teams & Groups",
    navTests: "Physical Tests",
    navAssessments: "Wrestling Rubrics",
    navTraining: "Training Plans",
    navAttendance: "Attendance",
    navWeight: "Weight Tracking",
    navInjuries: "Injuries & Health",
    navCompetitions: "Competitions & Matches",
    navAnalytics: "Team Analytics",
    navReports: "Reports & Exports",
    navSettings: "Settings & System",
    
    roleSuperAdmin: "Super Admin",
    roleClubAdmin: "Club Director",
    roleCoach: "Head Coach",
    roleAthlete: "Athlete",
    
    addAthlete: "Add Athlete",
    createSession: "New Test Session",
    startTesting: "Matside Quick Entry",
    recordResults: "Record Results",
    exportReport: "Export Athlete Report",
    filter: "Filter",
    search: "Search athlete, test, team...",
    save: "Save Changes",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    viewProfile: "View Full Profile",
    viewHistory: "View History",
    allCategories: "All Categories",
    allTeams: "All Teams",
    allWeights: "All Weight Classes",
    quickEntry: "Matside Matrix Entry",
    confirm: "Confirm",
    close: "Close",
    
    totalAthletes: "Total Athletes",
    activeAthletes: "Active on Mat",
    coaches: "Coaching Staff",
    teams: "Squads / Teams",
    upcomingTests: "Next Test Session",
    upcomingCompetitions: "Next Tournament",
    attendanceRate: "Squad Attendance",
    improvingAthletes: "Progressing Athletes",
    needsAttention: "Needs Attention / Stalled",
    avgPhysicalScore: "Avg Physical Index",
    avgWrestlingScore: "Avg Technical Index",
    
    grecoRoman: "Greco-Roman",
    takedowns: "Takedowns & Snaps",
    throws: "Throws & Souplesse",
    clinch: "Pummeling & Clinch",
    parTerre: "Par Terre (Mat Top/Bottom)",
    gutWrench: "Gut Wrench / Roll",
    passivity: "Passivity Management",
    technicalSuperiority: "Technical Superiority (8 pts)",
    fall: "Victory by Fall (VFA)",
    points: "Points Decision",
    cautions: "Cautions (VCA)",
    
    strength: "Strength",
    power: "Power",
    speed: "Speed",
    agility: "Agility",
    endurance: "Endurance",
    mobility: "Mobility",
    flexibility: "Flexibility",
    reaction: "Reaction Time",
    
    statusActive: "Active",
    statusInjured: "Injured / Restricted",
    statusResting: "Resting",
    statusInactive: "Inactive",
    
    noAthletes: "No athletes registered in squad.",
    noAthletesDesc: "Add your wrestlers to start tracking testing, mat assessments, and weight history.",
    noTests: "No physical tests found.",
    noCompetitions: "No tournaments scheduled.",
  },
  
  fr: {
    appName: "WrestleLab",
    tagline: "Système de Performance Lutte Gréco-Romaine",
    navDashboard: "Tableau de Bord",
    navAthletes: "Luteurs & Effectif",
    navTeams: "Groupes & Collectifs",
    navTests: "Tests Physiques",
    navAssessments: "Évaluations Lutte",
    navTraining: "Entraînements & Plans",
    navAttendance: "Présences & Assiduité",
    navWeight: "Suivi du Poids",
    navInjuries: "Infirmerie & Blessures",
    navCompetitions: "Compétitions & Combats",
    navAnalytics: "Analytique Groupe",
    navReports: "Rapports & Bilans",
    navSettings: "Paramètres & Club",
    
    roleSuperAdmin: "Super Admin",
    roleClubAdmin: "Directeur de Club",
    roleCoach: "Entraîneur National / Club",
    roleAthlete: "Lutteur",
    
    addAthlete: "Ajouter un Lutteur",
    createSession: "Créer une Session de Test",
    startTesting: "Saisie Rapide Bord de Tapis",
    recordResults: "Enregistrer Résultats",
    exportReport: "Exporter le Bilan Athlète",
    filter: "Filtrer",
    search: "Rechercher lutteur, test, groupe...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    viewProfile: "Profil Complet",
    viewHistory: "Historique",
    allCategories: "Toutes Catégories",
    allTeams: "Tous Groupes",
    allWeights: "Toutes Catégories de Poids",
    quickEntry: "Grille Bord de Tapis",
    confirm: "Confirmer",
    close: "Fermer",
    
    totalAthletes: "Total Lutteurs",
    activeAthletes: "Actifs sur Tapis",
    coaches: "Staff Technique",
    teams: "Collectifs",
    upcomingTests: "Prochaine Session Test",
    upcomingCompetitions: "Prochaine Compétition",
    attendanceRate: "Taux de Présence",
    improvingAthletes: "En Progression",
    needsAttention: "À Surveiller / Vigilance",
    avgPhysicalScore: "Indice Physique Moyen",
    avgWrestlingScore: "Indice Technico-Tactique",
    
    grecoRoman: "Gréco-Romaine",
    takedowns: "Mises à Terre & Enfourchures",
    throws: "Projections & Souplesses",
    clinch: "Pummeling & Ceintures",
    parTerre: "Travail au Sol (Par Terre)",
    gutWrench: "Roulade / Tour de taille",
    passivity: "Gestion de la Passivité",
    technicalSuperiority: "Grande Supériorité (8 pts)",
    fall: "Victoire par Tombé (VFA)",
    points: "Victoire aux Points",
    cautions: "Avertissements (VCA)",
    
    strength: "Force",
    power: "Puissance",
    speed: "Vitesse",
    agility: "Agilité",
    endurance: "Endurance",
    mobility: "Mobilité",
    flexibility: "Souplesse",
    reaction: "Temps de Réaction",
    
    statusActive: "Actif",
    statusInjured: "Blessé / Restreint",
    statusResting: "Repos",
    statusInactive: "Inactif",
    
    noAthletes: "Aucun lutteur enregistré dans le collectif.",
    noAthletesDesc: "Enregistrez vos athlètes pour suivre tests physiques, évaluations technico-tactiques et pesées.",
    noTests: "Aucun test physique répertorié.",
    noCompetitions: "Aucune compétition programmée.",
  },
  
  ar: {
    appName: "WrestleLab",
    tagline: "منظومة أداء المصارعة الرومانية",
    navDashboard: "لوحة التحكم",
    navAthletes: "المصارعون",
    navTeams: "المجموعات والفرق",
    navTests: "الاختبارات البدنية",
    navAssessments: "التقييم الفني والتكتيكي",
    navTraining: "خطط التدريب",
    navAttendance: "الحضور والغياب",
    navWeight: "متابعة الوزن",
    navInjuries: "سجل الإصابات",
    navCompetitions: "البطولات والمباريات",
    navAnalytics: "تحليلات الفريق",
    navReports: "التقارير والكشوفات",
    navSettings: "الإعدادات والنظام",
    
    roleSuperAdmin: "مشرف عام",
    roleClubAdmin: "مدير النادي",
    roleCoach: "المدرب الرئيسي",
    roleAthlete: "المصارع",
    
    addAthlete: "إضافة مصارع",
    createSession: "جلسة اختبار جديدة",
    startTesting: "إدخال سريع بجانب البساط",
    recordResults: "تسجيل النتائج",
    exportReport: "تصدير تقرير المصارع",
    filter: "تصفية",
    search: "بحث عن مصارع، اختبار، فريق...",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    viewProfile: "الملف الكامل",
    viewHistory: "سجل الأداء",
    allCategories: "جميع الفئات",
    allTeams: "جميع الفرق",
    allWeights: "جميع الأوزان",
    quickEntry: "مصفوفة الإدخال السريع",
    confirm: "تأكيد",
    close: "إغلاق",
    
    totalAthletes: "إجمالي المصارعين",
    activeAthletes: "النشطون على البساط",
    coaches: "الجهاز الفني",
    teams: "الفرق",
    upcomingTests: "الاختبار القادم",
    upcomingCompetitions: "البطولة القادمة",
    attendanceRate: "نسبة الحضور",
    improvingAthletes: "في تحسن مستمر",
    needsAttention: "يحتاج لمتابعة دقيقة",
    avgPhysicalScore: "متوسط المؤشر البدني",
    avgWrestlingScore: "متوسط المؤشر الفني",
    
    grecoRoman: "المصارعة الرومانية",
    takedowns: "الإسقاطات والجر",
    throws: "الرميات الخلفية والسوبليس",
    clinch: "الالتحام وحزام الخصر",
    parTerre: "الوضع الأرضي (بارتير)",
    gutWrench: "التقليب بالخصر (Gut Wrench)",
    passivity: "إدارة السلبية والتكتيك",
    technicalSuperiority: "التفوق الفني (فارق 8 نقاط)",
    fall: "الفوز بالتثبيت (توش)",
    points: "الفوز بالنقاط",
    cautions: "الإنذارات",
    
    strength: "القوة",
    power: "القدرة الانفجارية",
    speed: "السرعة",
    agility: "الرشاقة",
    endurance: "التحمل",
    mobility: "الحركية",
    flexibility: "المرونة",
    reaction: "سرعة الاستجابة",
    
    statusActive: "نشط",
    statusInjured: "مصاب / تحت التأهيل",
    statusResting: "راحة",
    statusInactive: "غير نشط",
    
    noAthletes: "لا يوجد مصارعون مسجلون.",
    noAthletesDesc: "أضف مصارعي النادي لبدء متابعة القياسات البدنية والفنية وسجل الأوزان.",
    noTests: "لا توجد اختبارات بدنية.",
    noCompetitions: "لا توجد بطولات مجدولة.",
  }
};

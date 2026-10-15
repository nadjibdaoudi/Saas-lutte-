/**
 * WrestleLab - TypeScript Core Definitions
 * Greco-Roman Wrestling Performance Management SaaS
 * Fully aligned with Supabase schema, RLS policies, Views & RPCs
 */

// =====================================================================
// 1. ENUMS & CORE UNION TYPES
// =====================================================================

export type UserRole = 'super_admin' | 'club_admin' | 'coach' | 'athlete';

export type MembershipRole = 
  | 'owner' 
  | 'admin' 
  | 'head_coach' 
  | 'coach' 
  | 'assistant' 
  | 'physio' 
  | 'doctor' 
  | 'athlete' 
  | 'parent';

export type AgeCategory = 'u15' | 'u17_cadet' | 'u20_junior' | 'u23' | 'senior' | 'veterans';

export type WrestlingStyle = 'greco_roman' | 'freestyle' | 'women_wrestling';

export type DominantSide = 'left' | 'right' | 'ambidextrous';

export type TestCategory = 
  | 'strength' 
  | 'power' 
  | 'speed' 
  | 'agility' 
  | 'endurance' 
  | 'mobility' 
  | 'flexibility' 
  | 'reaction' 
  | 'anthropometry' 
  | 'recovery';

export type PerformanceDirection = 'higher_is_better' | 'lower_is_better';

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late';

export type InjuryStatus = 'active' | 'recovering' | 'cleared' | 'restricted';

export type InjurySeverity = 'mild' | 'moderate' | 'severe';

export type MatchResultType = 
  | 'vfa'   // Victory by Fall
  | 'vsu'   // Technical Superiority 8-0 (Greco-Roman rule: 8 pts difference)
  | 'vsu1'  // Technical Superiority with opponent score
  | 'vpo'   // Points without opponent score
  | 'vpo1'  // Points with opponent score
  | 'vin'   // Injury
  | 'vca'   // Cautions (3 cautions / passivity in Greco-Roman)
  | 'vfo'   // Forfeit / Walkover
  | 'dsq';  // Disqualification

export type SubscriptionTier = 'free_trial' | 'coach' | 'club' | 'pro' | 'national_team';

export type WeighInType = 'morning_fasted' | 'pre_practice' | 'post_practice' | 'official_tournament_weighin' | 'general';

export type HydrationStatus = 'optimal' | 'dehydrated' | 'severely_dehydrated' | 'untested';

export type DocumentType = 
  | 'medical_clearance' 
  | 'federation_license' 
  | 'passport_id' 
  | 'anti_doping_cert' 
  | 'insurance' 
  | 'parental_consent' 
  | 'contract' 
  | 'other';

export type MatchEventType = 
  | 'takedown' 
  | 'throw_4pt' 
  | 'throw_5pt' 
  | 'gut_wrench' 
  | 'par_terre_lift' 
  | 'reversal' 
  | 'passivity_ordered' 
  | 'passivity_par_terre' 
  | 'caution' 
  | 'challenge_won' 
  | 'challenge_lost' 
  | 'out_of_bounds' 
  | 'penalty_point' 
  | 'verbal_warning';

export type GoalCategory = 
  | 'competition_medal' 
  | 'technical_mastery' 
  | 'weight_target' 
  | 'physical_benchmark' 
  | 'attendance' 
  | 'tactical';

export type NotificationType = 
  | 'weight_alert' 
  | 'upcoming_test' 
  | 'competition' 
  | 'injury_update' 
  | 'assessment_due' 
  | 'announcement' 
  | 'general';

// =====================================================================
// 2. IDENTITY & SAAS
// =====================================================================

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
  preferredLanguage: 'en' | 'fr' | 'ar';
  role: UserRole;
  organizationId: string;
  organizationName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  monthlyPriceCents: number;
  annualPriceCents: number;
  currency: string;
  maxAthletes: number;
  maxCoaches: number;
  maxTeams: number;
  features: Record<string, boolean | number | string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  country: string;
  city: string;
  contactEmail: string;
  contactPhone?: string;
  wrestlingFederation?: string;
  subscriptionPlan: SubscriptionTier;
  subscriptionStatus: string;
  maxAthletes: number;
  maxCoaches: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  title?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
  organization?: Organization;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: MembershipRole;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy?: string;
  expiresAt: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================================
// 3. PEOPLE & ROSTER
// =====================================================================

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  ageCategory: AgeCategory;
  description?: string;
  headCoachId?: string;
  headCoachName?: string;
  athleteCount?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  organizationId: string;
  teamId: string;
  athleteId: string;
  role: 'captain' | 'member' | 'reserve';
  joinedAt: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  athlete?: Athlete;
}

export interface Athlete {
  id: string;
  organizationId: string;
  teamId?: string;
  teamName?: string;
  userId?: string;
  coachId?: string;
  coachName?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'male' | 'female';
  nationality: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  weightCategory: string; // e.g. "60 kg", "67 kg", "77 kg", "87 kg", "97 kg", "130 kg"
  ageCategory: AgeCategory;
  wrestlingStyle: 'greco_roman';
  dominantSide: DominantSide;
  gripPreference: string;
  experienceLevel: string;
  licenseNumber?: string;
  joinDate: string;
  status: 'active' | 'injured' | 'resting' | 'inactive';
  notes?: string;
  
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;

  // Computed scores for UI reactivity & backwards compatibility
  performanceScore?: number;
  physicalScore?: number;
  wrestlingScore?: number;
  attendanceRate?: number;
  trend?: 'improving' | 'stable' | 'declining';
  recentTestCount?: number;
}

export interface Guardian {
  id: string;
  organizationId: string;
  userId?: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email?: string;
  phone: string;
  address?: string;
  isEmergencyContact: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteGuardian {
  id: string;
  organizationId: string;
  athleteId: string;
  guardianId: string;
  relationshipType?: string;
  isPrimary: boolean;
  canPickup: boolean;
  emergencyPriority: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  guardian?: Guardian;
}

export interface AthleteDocument {
  id: string;
  organizationId: string;
  athleteId?: string;
  title: string;
  documentType: DocumentType;
  fileUrl: string;
  fileSizeBytes?: number;
  mimeType?: string;
  issueDate?: string;
  expiryDate?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================================
// 4. WEIGHT MANAGEMENT
// =====================================================================

export interface WeightClass {
  id: string;
  organizationId?: string;
  federation: string;
  ageCategory: AgeCategory;
  gender: 'male' | 'female';
  wrestlingStyle: WrestlingStyle;
  name: string;
  minWeightKg?: number;
  maxWeightKg: number;
  isOlympic: boolean;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeightRecord {
  id: string;
  organizationId: string;
  athleteId: string;
  athleteName?: string;
  recordDate: string;
  weightKg: number;
  targetWeightKg: number;
  weightCategory: string;
  deltaToTarget: number; // weightKg - targetWeightKg
  weighInType?: WeighInType;
  hydrationStatus?: HydrationStatus;
  urineSpecificGravity?: number; // e.g. 1.015
  notes?: string;
  recordedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WeightPlan {
  id: string;
  organizationId: string;
  athleteId: string;
  targetWeightCategory: string;
  startingWeightKg: number;
  targetWeightKg: number;
  targetDate: string;
  safeWeeklyLossRateKg: number;
  caloriesTarget?: number;
  nutritionGuidelines?: string;
  hydrationProtocol?: string;
  status: 'active' | 'completed' | 'paused' | 'aborted';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================================
// 5. TRAINING, PERIODIZATION & WELLNESS
// =====================================================================

export interface Exercise {
  id: string;
  organizationId?: string;
  name: string;
  category: string;
  muscleGroup?: string;
  description?: string;
  equipment?: string;
  instructions?: string;
  videoUrl?: string;
  isSystemExercise?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Technique {
  id: string;
  organizationId?: string;
  name: string;
  wrestlingStyle: WrestlingStyle;
  position: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite_olympic';
  pointsPotential?: number;
  keyCues?: string[];
  counters?: string[];
  defenseGuidelines?: string;
  videoUrl?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingPlan {
  id: string;
  organizationId: string;
  title: string;
  phase?: string;
  macrocyclePhase?: string;
  description: string;
  targetCategory?: AgeCategory;
  targetFocus?: string;
  teamId?: string;
  teamName?: string;
  startDate: string;
  endDate: string;
  sessionCount?: number;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingExercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  weightLoad?: string;
  durationSeconds?: number;
  restSeconds: number;
  intensityRpe: number;
  instructions?: string;
  videoUrl?: string;
  displayOrder?: number;
}

export interface SessionExercise extends TrainingExercise {
  organizationId?: string;
  trainingSessionId?: string;
  exerciseId?: string;
  techniqueId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingSession {
  id: string;
  organizationId: string;
  trainingPlanId?: string;
  planId?: string;
  teamId?: string;
  teamName?: string;
  title: string;
  sessionDate?: string;
  scheduledDate?: string;
  startTime?: string;
  durationMinutes: number;
  category?: string;
  sessionType?: string;
  intensityRpe?: number; // 1-10
  rpeTarget?: number;
  leadCoachId?: string;
  leadCoachName?: string;
  objectives: string;
  notes?: string;
  exercises?: TrainingExercise[];
  assignedAthleteIds?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionLog {
  id: string;
  organizationId: string;
  trainingSessionId: string;
  athleteId: string;
  durationMinutes: number;
  rpe: number;
  sessionLoad?: number; // duration * rpe
  completionStatus: 'assigned' | 'completed' | 'modified' | 'skipped';
  athleteFeedbackRpe?: number;
  athleteNotes?: string;
  coachNotes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WellnessCheck {
  id: string;
  organizationId: string;
  athleteId: string;
  checkDate: string;
  sleepQuality: number; // 1-10
  fatigueLevel: number; // 1-10
  muscleSoreness: number; // 1-10
  stressLevel: number; // 1-10
  moodScore: number; // 1-10
  restingHeartRate?: number;
  hrvRmssd?: number;
  sorenessBodyParts?: string[];
  readinessScore?: number; // 0-100
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// =====================================================================
// 6. ATTENDANCE
// =====================================================================

export interface AttendanceRecord {
  id: string;
  organizationId: string;
  athleteId: string;
  athleteName?: string;
  teamId?: string;
  trainingSessionId?: string;
  sessionTitle?: string;
  sessionName?: string;
  date?: string;
  attendanceDate?: string;
  status: AttendanceStatus;
  reason?: string;
  arrivalTime?: string;
  recordedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================================
// 7. COMPETITIONS, MATCHES & TACTICAL ANALYSIS
// =====================================================================

export interface Competition {
  id: string;
  organizationId: string;
  name: string;
  competitionType: string;
  tier?: string;
  location: string;
  country: string;
  city?: string;
  startDate: string;
  endDate: string;
  organizer: string;
  uwwSanctioned?: boolean;
  weighInDatetime?: string;
  notes?: string;
  participantCount?: number;
  matchCount?: number;
  medalCount?: { gold: number; silver: number; bronze: number };
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Opponent {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  country: string;
  club?: string;
  weightCategory: string;
  wrestlingStyle?: WrestlingStyle;
  dominantSide?: DominantSide;
  favoriteAttacks?: string[];
  parTerreTendencies?: string;
  scoutingNotes?: string;
  videoLinks?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompetitionEntry {
  id: string;
  organizationId: string;
  competitionId: string;
  athleteId: string;
  weightCategory: string;
  seedNumber?: number;
  weighInWeightKg?: number;
  weighInPassed: boolean;
  finalPlacement?: number;
  medal?: 'gold' | 'silver' | 'bronze' | 'none';
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchRecord {
  id: string;
  organizationId: string;
  competitionId: string;
  competitionName?: string;
  athleteId: string;
  athleteName?: string;
  opponentId?: string;
  opponentName: string;
  opponentCountry: string;
  opponentClub?: string;
  weightCategory: string;
  roundName: string; // "1/8 Final", "Quarter-Final", "Semi-Final", "Gold Final", etc.
  matchDate: string;
  matchOrder?: number;
  matNumber?: string;
  result: MatchResultType;
  isWin: boolean;
  athleteScore: number;
  opponentScore: number;
  period1ScoreAthlete: number;
  period1ScoreOpponent: number;
  period2ScoreAthlete: number;
  period2ScoreOpponent: number;
  matchDurationSeconds: number;
  
  // Tactical action metrics
  takedownAttempts: number;
  takedownSuccess: number;
  takedownDefenseSuccess: number;
  throwsExecuted: number;
  gutWrenchExecuted: number;
  parTerreLifts: number;
  passivityCallsReceived: number;
  passivityCallsOpponent: number;
  cautionsReceived: number;
  reversals: number;
  
  coachTacticalNotes?: string;
  videoAnalysisUrl?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchEvent {
  id: string;
  organizationId: string;
  matchId: string;
  period: 1 | 2;
  timestampSeconds: number;
  eventType: MatchEventType;
  pointsScored: number;
  awardedTo: 'athlete' | 'opponent';
  description?: string;
  videoTimestampSec?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================================
// 8. HEALTH & INJURIES
// =====================================================================

export interface InjuryRecord {
  id: string;
  organizationId: string;
  athleteId: string;
  athleteName?: string;
  injuryName: string;
  bodyArea: string; // Neck/Cervical, Shoulder, Ribs, Back, Knee, Ankle
  severity?: InjurySeverity;
  occurredDate: string;
  diagnosis?: string;
  initialTreatment?: string;
  status: InjuryStatus;
  restrictions: string;
  estimatedDaysOut?: number;
  returnToMatDate?: string;
  clearedDate?: string;
  clearedBy?: string;
  medicalStaffNotes?: string;
  recordedBy?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InjuryNote {
  id: string;
  organizationId: string;
  injuryId: string;
  authorId?: string;
  authorName?: string;
  noteType: 'progress_note' | 'treatment' | 'medical_imaging' | 'physio_evaluation' | 'doctor_clearance';
  notes: string;
  painScale?: number; // 0-10
  mobilityAssessment?: string;
  attachmentUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReturnToPlayStep {
  id: string;
  organizationId: string;
  injuryId: string;
  stepOrder: number;
  stepName: string;
  description?: string;
  criteria?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================================
// 9. ASSESSMENTS, PHYSICAL TESTS & GOALS
// =====================================================================

export interface PhysicalTest {
  id: string;
  organizationId?: string;
  name: string;
  category: TestCategory;
  description: string;
  unit: string;
  measurementType: 'numeric' | 'time' | 'distance' | 'reps' | 'level';
  performanceDirection: PerformanceDirection;
  minValue: number;
  maxValue: number;
  scoringMethod: 'normalized' | 'inverse_normalized' | 'custom_benchmark';
  instructions: string;
  videoUrl?: string;
  isSystemTest: boolean;
  isActive: boolean;
  benchmarkValue?: number; // Target elite benchmark for senior wrestling
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TestTemplate = PhysicalTest;

export interface TestSession {
  id: string;
  organizationId: string;
  teamId?: string;
  teamName?: string;
  name: string;
  sessionDate: string;
  location: string;
  leadCoachId?: string;
  leadCoachName?: string;
  status: 'planned' | 'in_progress' | 'completed';
  notes?: string;
  testIds: string[];
  athleteIds?: string[];
  resultsCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestResult {
  id: string;
  organizationId: string;
  athleteId: string;
  athleteName?: string;
  testId: string;
  testName?: string;
  testCategory?: TestCategory;
  unit?: string;
  testSessionId?: string;
  sessionName?: string;
  recordedBy?: string;
  recordedDate: string;
  rawValue: number;
  calculatedScore: number; // 0 to 100
  previousValue?: number;
  improvementPercentage?: number;
  isPersonalBest?: boolean;
  notes?: string;
  mediaUrl?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WrestlingAssessment {
  id: string;
  organizationId: string;
  athleteId: string;
  athleteName?: string;
  evaluatorId?: string;
  evaluatorName?: string;
  assessmentDate: string;
  scaleType: '1_to_5' | '1_to_10';
  
  // Technical (Greco-Roman specific)
  takedownTechnique: number;
  throwingTechnique: number;     // Souplesse, arm throws, chest throws
  clinchUnderhook: number;       // Pummeling, bodylock, over-under control
  groundParTerreOffense: number; // Gut wrench, roll, lift execution
  positioningStance: number;     // Head position, upright stance integrity
  
  // Defense
  takedownDefense: number;
  groundParTerreDefense: number; // Flat base, hip defense, gut wrench block
  clinchPummelingDefense: number;
  balanceRecovery: number;
  
  // Physical Wrestling Attributes
  explosiveness: number;
  gripEndurance: number;
  isometricTrunkStrength: number;
  anaerobicPower: number;
  
  // Tactical & Match Sense
  passivityManagement: number;   // Key UWW Greco rule: forcing passivity & par terre choice
  matZoneControl: number;        // Center control vs red zone
  decisionMaking: number;
  periodTempoStrategy: number;
  
  // Mental / Behavioral
  discipline: number;
  gritMentalToughness: number;
  coachability: number;
  competitionFocus: number;
  
  // Computed overall
  overallTechnicalScore: number;
  overallWrestlingScore: number;
  strengths: string;
  areasForImprovement: string;
  coachFeedback: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  id: string;
  organizationId: string;
  athleteId: string;
  title: string;
  category: GoalCategory;
  targetDate: string;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  status: 'not_started' | 'in_progress' | 'achieved' | 'abandoned';
  actionPlan?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// =====================================================================
// 10. PLATFORM, NOTIFICATIONS, AUDIT & AI
// =====================================================================

export interface ReportRecord {
  id: string;
  organizationId: string;
  athleteId?: string;
  teamId?: string;
  title: string;
  reportType: 'athlete_performance' | 'team_summary' | 'injury_audit' | 'competition_debrief' | 'weight_management' | 'attendance_census';
  dateRangeStart?: string;
  dateRangeEnd?: string;
  contentJson: Record<string, any>;
  pdfUrl?: string;
  generatedBy?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLogItem {
  id: string;
  organizationId: string;
  userName: string;
  userRole: UserRole | MembershipRole;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string | Record<string, any>;
  timestamp: string;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  organizationId?: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt?: string;
}

export interface Announcement {
  id: string;
  organizationId: string;
  teamId?: string;
  authorId?: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  isPinned: boolean;
  expiresAt?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  organizationId: string;
  teamId?: string;
  title: string;
  eventType: 'training' | 'competition' | 'weigh_in' | 'medical_screening' | 'test_session' | 'team_meeting' | 'travel' | 'camp';
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AiConversation {
  id: string;
  organizationId: string;
  userId: string;
  athleteId?: string;
  title: string;
  contextType: 'tactical_scouting' | 'training_periodization' | 'injury_protocol' | 'performance_analysis' | 'general_coach_chat';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  organizationId: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  tokenCount: number;
  citations?: any[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiUsage {
  id: string;
  organizationId: string;
  userId?: string;
  conversationId?: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  recordedDate: string;
  createdAt: string;
}

// =====================================================================
// 11. ANALYTICAL VIEWS & RPC TYPINGS
// =====================================================================

export interface AthleteOverviewView {
  athleteId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photoUrl?: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female';
  nationality: string;
  weightCategory: string;
  currentWeightKg: number;
  targetWeightKg: number;
  weightDelta: number;
  ageCategory: AgeCategory;
  wrestlingStyle: string;
  dominantSide: DominantSide;
  athleteStatus: string;
  teamId?: string;
  teamName?: string;
  activeInjuriesCount: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRatePercentage: number;
  attendanceRate90d: number;
  latestWrestlingScore?: number;
  latestTechnicalScore?: number;
}

export interface WeeklyTrainingLoadRPC {
  athlete_id: string;
  athlete_name: string;
  acute_load: number;     // 7-day total sRPE load
  chronic_load: number;   // 28-day weekly average load
  acwr: number;           // Acute:Chronic Workload Ratio
  risk_category: 'undertrained' | 'optimal' | 'danger_zone' | 'high_spike' | 'insufficient_data';
  last_session_date: string;
}

export interface WeightTrendRPC {
  record_date: string;
  weight_kg: number;
  target_weight_kg: number;
  delta_to_target: number;
  rolling_7d_avg_weight: number;
  weigh_in_type: WeighInType;
  hydration_status: HydrationStatus;
}

export interface AttendanceRateRPC {
  athlete_id: string;
  athlete_name: string;
  team_name: string;
  total_sessions: number;
  present_count: number;
  absent_count: number;
  excused_count: number;
  late_count: number;
  attendance_percentage: number;
}

export interface MedalTableRPC {
  athlete_id: string;
  athlete_name: string;
  team_name: string;
  weight_category: string;
  gold_count: number;
  silver_count: number;
  bronze_count: number;
  total_medals: number;
  total_matches: number;
  wins: number;
  losses: number;
  win_rate_percentage: number;
  points_scored: number;
  points_conceded: number;
}

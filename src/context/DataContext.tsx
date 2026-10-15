import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Athlete, Team, PhysicalTest, TestSession, TestResult, 
  WrestlingAssessment, TrainingPlan, TrainingSession, AttendanceRecord, 
  WeightRecord, InjuryRecord, Competition, MatchRecord, 
  AuditLogItem, NotificationItem 
} from '../types';
import { 
  initialAthletes, initialTeams, initialTests, 
  initialTestSessions, initialTestResults, initialWrestlingAssessments, 
  initialTrainingPlans, initialTrainingSessions, initialAttendance, initialWeightRecords, 
  initialInjuries, initialCompetitions, initialMatches, 
  initialAuditLogs, initialNotifications 
} from '../data/seedData';
import { useAuth } from './AuthContext';

interface DataContextType {
  athletes: Athlete[];
  teams: Team[];
  tests: PhysicalTest[];
  testSessions: TestSession[];
  testResults: TestResult[];
  wrestlingAssessments: WrestlingAssessment[];
  trainingPlans: TrainingPlan[];
  trainingSessions: TrainingSession[];
  attendanceRecords: AttendanceRecord[];
  weightRecords: WeightRecord[];
  injuries: InjuryRecord[];
  competitions: Competition[];
  matches: MatchRecord[];
  auditLogs: AuditLogItem[];
  notifications: NotificationItem[];
  
  // Athlete actions
  addAthlete: (athlete: Omit<Athlete, 'id' | 'organizationId'>) => void;
  updateAthlete: (id: string, updates: Partial<Athlete>) => void;
  deleteAthlete: (id: string) => void;
  
  // Team actions
  addTeam: (team: Omit<Team, 'id' | 'organizationId' | 'createdAt'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  
  // Test & Session actions
  addTest: (test: Omit<PhysicalTest, 'id'>) => void;
  updateTest: (id: string, updates: Partial<PhysicalTest>) => void;
  addTestSession: (session: Omit<TestSession, 'id' | 'organizationId'>) => string;
  updateTestSession: (id: string, updates: Partial<TestSession>) => void;
  recordTestResult: (result: Omit<TestResult, 'id' | 'organizationId'>) => void;
  recordBatchResults: (results: Array<Omit<TestResult, 'id' | 'organizationId'>>) => void;
  
  // Wrestling Assessment actions
  saveWrestlingAssessment: (assessment: Omit<WrestlingAssessment, 'id' | 'organizationId'>) => void;
  
  // Training actions
  addTrainingPlan: (plan: Omit<TrainingPlan, 'id' | 'organizationId'>) => void;
  updateTrainingPlan: (id: string, updates: Partial<TrainingPlan>) => void;
  addTrainingSession: (session: Omit<TrainingSession, 'id' | 'organizationId'>) => void;
  updateTrainingSession: (id: string, updates: Partial<TrainingSession>) => void;
  
  // Attendance actions
  recordAttendance: (record: Omit<AttendanceRecord, 'id' | 'organizationId'>) => void;
  markAttendanceBatch: (records: Array<Omit<AttendanceRecord, 'id' | 'organizationId'>>) => void;
  
  // Weight actions
  recordWeight: (weight: Omit<WeightRecord, 'id' | 'organizationId'>) => void;
  
  // Injury actions
  addInjury: (injury: Omit<InjuryRecord, 'id' | 'organizationId'>) => void;
  recordInjury: (injury: Omit<InjuryRecord, 'id' | 'organizationId'>) => void;
  updateInjury: (id: string, updates: Partial<InjuryRecord>) => void;
  updateInjuryStatus: (id: string, status: any) => void;
  
  // Competition & Match actions
  addCompetition: (comp: Omit<Competition, 'id' | 'organizationId'>) => void;
  addMatch: (match: Omit<MatchRecord, 'id' | 'organizationId'>) => void;
  updateMatch: (id: string, updates: Partial<MatchRecord>) => void;
  
  // Notification actions
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Calculation helpers
  calculateTestScore: (test: PhysicalTest, rawValue: number) => number;
  getAthleteSummary: (athleteId: string) => {
    physicalScore: number;
    wrestlingScore: number;
    overallScore: number;
    recentResults: TestResult[];
    recentMatches: MatchRecord[];
    weightHistory: WeightRecord[];
    latestAssessment?: WrestlingAssessment;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organization } = useAuth();

  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('wrestlelab_athletes');
    return saved ? JSON.parse(saved) : initialAthletes;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('wrestlelab_teams');
    return saved ? JSON.parse(saved) : initialTeams;
  });

  const [tests, setTests] = useState<PhysicalTest[]>(() => {
    const saved = localStorage.getItem('wrestlelab_tests');
    return saved ? JSON.parse(saved) : initialTests;
  });

  const [testSessions, setTestSessions] = useState<TestSession[]>(() => {
    const saved = localStorage.getItem('wrestlelab_sessions');
    return saved ? JSON.parse(saved) : initialTestSessions;
  });

  const [testResults, setTestResults] = useState<TestResult[]>(() => {
    const saved = localStorage.getItem('wrestlelab_results');
    return saved ? JSON.parse(saved) : initialTestResults;
  });

  const [wrestlingAssessments, setWrestlingAssessments] = useState<WrestlingAssessment[]>(() => {
    const saved = localStorage.getItem('wrestlelab_assessments');
    return saved ? JSON.parse(saved) : initialWrestlingAssessments;
  });

  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>(() => {
    const saved = localStorage.getItem('wrestlelab_plans');
    return saved ? JSON.parse(saved) : initialTrainingPlans;
  });

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(() => {
    const saved = localStorage.getItem('wrestlelab_training');
    return saved ? JSON.parse(saved) : initialTrainingSessions;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('wrestlelab_attendance');
    return saved ? JSON.parse(saved) : initialAttendance;
  });

  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>(() => {
    const saved = localStorage.getItem('wrestlelab_weights');
    return saved ? JSON.parse(saved) : initialWeightRecords;
  });

  const [injuries, setInjuries] = useState<InjuryRecord[]>(() => {
    const saved = localStorage.getItem('wrestlelab_injuries');
    return saved ? JSON.parse(saved) : initialInjuries;
  });

  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    const saved = localStorage.getItem('wrestlelab_competitions');
    return saved ? JSON.parse(saved) : initialCompetitions;
  });

  const [matches, setMatches] = useState<MatchRecord[]>(() => {
    const saved = localStorage.getItem('wrestlelab_matches');
    return saved ? JSON.parse(saved) : initialMatches;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('wrestlelab_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('wrestlelab_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Sync to local storage
  useEffect(() => { localStorage.setItem('wrestlelab_athletes', JSON.stringify(athletes)); }, [athletes]);
  useEffect(() => { localStorage.setItem('wrestlelab_teams', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('wrestlelab_tests', JSON.stringify(tests)); }, [tests]);
  useEffect(() => { localStorage.setItem('wrestlelab_sessions', JSON.stringify(testSessions)); }, [testSessions]);
  useEffect(() => { localStorage.setItem('wrestlelab_results', JSON.stringify(testResults)); }, [testResults]);
  useEffect(() => { localStorage.setItem('wrestlelab_assessments', JSON.stringify(wrestlingAssessments)); }, [wrestlingAssessments]);
  useEffect(() => { localStorage.setItem('wrestlelab_plans', JSON.stringify(trainingPlans)); }, [trainingPlans]);
  useEffect(() => { localStorage.setItem('wrestlelab_training', JSON.stringify(trainingSessions)); }, [trainingSessions]);
  useEffect(() => { localStorage.setItem('wrestlelab_attendance', JSON.stringify(attendanceRecords)); }, [attendanceRecords]);
  useEffect(() => { localStorage.setItem('wrestlelab_weights', JSON.stringify(weightRecords)); }, [weightRecords]);
  useEffect(() => { localStorage.setItem('wrestlelab_injuries', JSON.stringify(injuries)); }, [injuries]);
  useEffect(() => { localStorage.setItem('wrestlelab_competitions', JSON.stringify(competitions)); }, [competitions]);
  useEffect(() => { localStorage.setItem('wrestlelab_matches', JSON.stringify(matches)); }, [matches]);
  useEffect(() => { localStorage.setItem('wrestlelab_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('wrestlelab_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Performance scoring formula calculation
  const calculateTestScore = (test: PhysicalTest, rawValue: number): number => {
    const { minValue, maxValue, performanceDirection } = test;
    if (minValue === maxValue) return 50;
    
    let normalized = 0;
    if (performanceDirection === 'higher_is_better') {
      normalized = ((rawValue - minValue) / (maxValue - minValue)) * 100;
    } else {
      // Lower is better (e.g. sprint time, reaction time)
      normalized = ((maxValue - rawValue) / (maxValue - minValue)) * 100;
    }
    return Math.min(100, Math.max(0, Math.round(normalized)));
  };

  const addAuditLog = (action: string, resourceType: string, resourceId?: string, details?: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      organizationId: organization.id,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Coach User',
      userRole: user?.role || 'coach',
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Athlete CRUD
  const addAthlete = (athleteData: Omit<Athlete, 'id' | 'organizationId'>) => {
    const newAthlete: Athlete = {
      ...athleteData,
      id: `ath-${Date.now()}`,
      organizationId: organization.id,
      performanceScore: 80,
      physicalScore: 80,
      wrestlingScore: 80,
      attendanceRate: 100,
      trend: 'stable',
      recentTestCount: 0
    };
    setAthletes(prev => [newAthlete, ...prev]);
    addAuditLog('athlete.created', 'athlete', newAthlete.id, `Added athlete ${newAthlete.firstName} ${newAthlete.lastName}`);
  };

  const updateAthlete = (id: string, updates: Partial<Athlete>) => {
    setAthletes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    addAuditLog('athlete.updated', 'athlete', id, `Updated athlete profile`);
  };

  const deleteAthlete = (id: string) => {
    setAthletes(prev => prev.filter(a => a.id !== id));
    addAuditLog('athlete.deleted', 'athlete', id, `Removed athlete from roster`);
  };

  // Team actions
  const addTeam = (teamData: Omit<Team, 'id' | 'organizationId' | 'createdAt'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}`,
      organizationId: organization.id,
      athleteCount: 0,
      createdAt: new Date().toISOString()
    };
    setTeams(prev => [...prev, newTeam]);
    addAuditLog('team.created', 'team', newTeam.id, `Created team ${newTeam.name}`);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    addAuditLog('team.updated', 'team', id, `Updated team details`);
  };

  // Physical Tests
  const addTest = (testData: Omit<PhysicalTest, 'id'>) => {
    const newTest: PhysicalTest = {
      ...testData,
      id: `test-${Date.now()}`,
      organizationId: organization.id
    };
    setTests(prev => [...prev, newTest]);
    addAuditLog('test.created', 'test', newTest.id, `Created test ${newTest.name}`);
  };

  const updateTest = (id: string, updates: Partial<PhysicalTest>) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Test Sessions
  const addTestSession = (sessionData: Omit<TestSession, 'id' | 'organizationId'>): string => {
    const id = `sess-${Date.now()}`;
    const newSession: TestSession = {
      ...sessionData,
      id,
      organizationId: organization.id,
      resultsCount: 0
    };
    setTestSessions(prev => [newSession, ...prev]);
    addAuditLog('test_session.created', 'test_session', id, `Created session ${newSession.name}`);
    return id;
  };

  const updateTestSession = (id: string, updates: Partial<TestSession>) => {
    setTestSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const recordTestResult = (resultData: Omit<TestResult, 'id' | 'organizationId'>) => {
    const test = tests.find(t => t.id === resultData.testId);
    const score = test ? calculateTestScore(test, resultData.rawValue) : 80;
    
    // Find previous result for this athlete and test
    const previous = testResults
      .filter(r => r.athleteId === resultData.athleteId && r.testId === resultData.testId)
      .sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime())[0];

    let impPct = 0;
    if (previous && previous.rawValue) {
      if (test?.performanceDirection === 'lower_is_better') {
        impPct = ((previous.rawValue - resultData.rawValue) / previous.rawValue) * 100;
      } else {
        impPct = ((resultData.rawValue - previous.rawValue) / previous.rawValue) * 100;
      }
    }

    const newResult: TestResult = {
      ...resultData,
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      organizationId: organization.id,
      calculatedScore: score,
      previousValue: previous?.rawValue,
      improvementPercentage: Number(impPct.toFixed(2)),
      isPersonalBest: !previous || (test?.performanceDirection === 'lower_is_better' ? resultData.rawValue < previous.rawValue : resultData.rawValue > previous.rawValue)
    };

    setTestResults(prev => [newResult, ...prev]);
    addAuditLog('test_result.recorded', 'test_result', newResult.id, `Recorded result for test ${resultData.testName}`);
  };

  const recordBatchResults = (resultsList: Array<Omit<TestResult, 'id' | 'organizationId'>>) => {
    const prepared: TestResult[] = resultsList.map(r => {
      const test = tests.find(t => t.id === r.testId);
      const score = test ? calculateTestScore(test, r.rawValue) : 80;
      return {
        ...r,
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        organizationId: organization.id,
        calculatedScore: score
      };
    });

    setTestResults(prev => [...prepared, ...prev]);
    addAuditLog('test_results.batch', 'test_session', undefined, `Batch recorded ${prepared.length} test scores from matside`);
  };

  // Wrestling Assessments
  const saveWrestlingAssessment = (assessData: Omit<WrestlingAssessment, 'id' | 'organizationId'>) => {
    const techAverage = (
      assessData.takedownTechnique + 
      assessData.throwingTechnique + 
      assessData.clinchUnderhook + 
      assessData.groundParTerreOffense + 
      assessData.positioningStance
    ) / 5 * 10;

    const overall = (
      techAverage + 
      ((assessData.takedownDefense + assessData.groundParTerreDefense + assessData.clinchPummelingDefense + assessData.balanceRecovery) / 4 * 10) +
      ((assessData.explosiveness + assessData.gripEndurance + assessData.isometricTrunkStrength + assessData.anaerobicPower) / 4 * 10) +
      ((assessData.passivityManagement + assessData.matZoneControl + assessData.decisionMaking + assessData.periodTempoStrategy) / 4 * 10) +
      ((assessData.discipline + assessData.gritMentalToughness + assessData.coachability + assessData.competitionFocus) / 4 * 10)
    ) / 5;

    const newAssessment: WrestlingAssessment = {
      ...assessData,
      id: `assess-${Date.now()}`,
      organizationId: organization.id,
      overallTechnicalScore: Number(techAverage.toFixed(1)),
      overallWrestlingScore: Number(overall.toFixed(1))
    };

    setWrestlingAssessments(prev => [newAssessment, ...prev.filter(a => a.athleteId !== assessData.athleteId || a.assessmentDate !== assessData.assessmentDate)]);
    
    // Update athlete profile score
    setAthletes(prev => prev.map(a => a.id === assessData.athleteId ? {
      ...a,
      wrestlingScore: Math.round(overall),
      performanceScore: Math.round(((a.physicalScore || 80) + overall) / 2)
    } : a));

    addAuditLog('wrestling_assessment.created', 'wrestling_assessment', newAssessment.id, `Saved technical rubric for athlete`);
  };

  // Training Plans & Sessions
  const addTrainingPlan = (planData: Omit<TrainingPlan, 'id' | 'organizationId'>) => {
    const newPlan: TrainingPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      organizationId: organization.id
    };
    setTrainingPlans(prev => [...prev, newPlan]);
    addAuditLog('training_plan.created', 'training_plan', newPlan.id, `Created plan: ${newPlan.title}`);
  };

  const updateTrainingPlan = (id: string, updates: Partial<TrainingPlan>) => {
    setTrainingPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addTrainingSession = (sessionData: Omit<TrainingSession, 'id' | 'organizationId'>) => {
    const newSession: TrainingSession = {
      ...sessionData,
      id: `train-${Date.now()}`,
      organizationId: organization.id
    };
    setTrainingSessions(prev => [newSession, ...prev]);
    addAuditLog('training_session.created', 'training_session', newSession.id, `Created training: ${newSession.title}`);
  };

  const updateTrainingSession = (id: string, updates: Partial<TrainingSession>) => {
    setTrainingSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Attendance
  const recordAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'organizationId'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      organizationId: organization.id
    };
    setAttendanceRecords(prev => [newRecord, ...prev]);
    addAuditLog('attendance.recorded', 'attendance', newRecord.id, `Marked attendance for athlete ${recordData.athleteName || recordData.athleteId}`);
  };

  const markAttendanceBatch = (records: Array<Omit<AttendanceRecord, 'id' | 'organizationId'>>) => {
    const newRecords: AttendanceRecord[] = records.map(r => ({
      ...r,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      organizationId: organization.id
    }));
    setAttendanceRecords(prev => [...newRecords, ...prev]);
    addAuditLog('attendance.marked', 'attendance', undefined, `Marked attendance for ${newRecords.length} athletes`);
  };

  // Weight Tracking
  const recordWeight = (weightData: Omit<WeightRecord, 'id' | 'organizationId'>) => {
    const delta = weightData.weightKg - weightData.targetWeightKg;
    const newRecord: WeightRecord = {
      ...weightData,
      id: `wt-${Date.now()}`,
      organizationId: organization.id,
      deltaToTarget: Number(delta.toFixed(2))
    };
    setWeightRecords(prev => [newRecord, ...prev]);
    
    // Update athlete current weight
    setAthletes(prev => prev.map(a => a.id === weightData.athleteId ? {
      ...a,
      currentWeightKg: weightData.weightKg
    } : a));

    addAuditLog('weight.recorded', 'weight_record', newRecord.id, `Recorded weight: ${weightData.weightKg} kg`);
  };

  // Injuries
  const addInjury = (injuryData: Omit<InjuryRecord, 'id' | 'organizationId'>) => {
    const newInjury: InjuryRecord = {
      ...injuryData,
      id: `inj-${Date.now()}`,
      organizationId: organization.id
    };
    setInjuries(prev => [newInjury, ...prev]);
    
    // Update athlete status to injured/restricted
    setAthletes(prev => prev.map(a => a.id === injuryData.athleteId ? {
      ...a,
      status: 'injured'
    } : a));

    addAuditLog('injury.created', 'injury', newInjury.id, `Recorded medical note: ${injuryData.injuryName}`);
  };

  const recordInjury = (injuryData: Omit<InjuryRecord, 'id' | 'organizationId'>) => {
    addInjury(injuryData);
  };

  const updateInjury = (id: string, updates: Partial<InjuryRecord>) => {
    setInjuries(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const updateInjuryStatus = (id: string, status: any) => {
    setInjuries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (status === 'cleared') {
      const inj = injuries.find(i => i.id === id);
      if (inj) {
        setAthletes(prev => prev.map(a => a.id === inj.athleteId ? { ...a, status: 'active' } : a));
      }
    }
    addAuditLog('injury.status_updated', 'injury', id, `Updated injury status to ${status}`);
  };

  // Competitions & Matches
  const addCompetition = (compData: Omit<Competition, 'id' | 'organizationId'>) => {
    const newComp: Competition = {
      ...compData,
      id: `comp-${Date.now()}`,
      organizationId: organization.id
    };
    setCompetitions(prev => [newComp, ...prev]);
    addAuditLog('competition.created', 'competition', newComp.id, `Created competition: ${compData.name}`);
  };

  const addMatch = (matchData: Omit<MatchRecord, 'id' | 'organizationId'>) => {
    const newMatch: MatchRecord = {
      ...matchData,
      id: `match-${Date.now()}`,
      organizationId: organization.id
    };
    setMatches(prev => [newMatch, ...prev]);
    addAuditLog('match.recorded', 'match', newMatch.id, `Recorded match vs ${matchData.opponentName}`);
  };

  const updateMatch = (id: string, updates: Partial<MatchRecord>) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Detailed Summary Helper
  const getAthleteSummary = (athleteId: string) => {
    const athleteResults = testResults.filter(r => r.athleteId === athleteId);
    const athleteMatches = matches.filter(m => m.athleteId === athleteId);
    const athleteWeights = weightRecords.filter(w => w.athleteId === athleteId);
    const latestAssess = wrestlingAssessments
      .filter(a => a.athleteId === athleteId)
      .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())[0];

    const avgPhysScore = athleteResults.length > 0
      ? Math.round(athleteResults.reduce((acc, r) => acc + (r.calculatedScore || 80), 0) / athleteResults.length)
      : 80;

    const wrestScore = latestAssess?.overallWrestlingScore ? Math.round(latestAssess.overallWrestlingScore) : 80;
    const overall = Math.round((avgPhysScore + wrestScore) / 2);

    return {
      physicalScore: avgPhysScore,
      wrestlingScore: wrestScore,
      overallScore: overall,
      recentResults: athleteResults,
      recentMatches: athleteMatches,
      weightHistory: athleteWeights,
      latestAssessment: latestAssess
    };
  };

  return (
    <DataContext.Provider value={{
      athletes,
      teams,
      tests,
      testSessions,
      testResults,
      wrestlingAssessments,
      trainingPlans,
      trainingSessions,
      attendanceRecords,
      weightRecords,
      injuries,
      competitions,
      matches,
      auditLogs,
      notifications,
      addAthlete,
      updateAthlete,
      deleteAthlete,
      addTeam,
      updateTeam,
      addTest,
      updateTest,
      addTestSession,
      updateTestSession,
      recordTestResult,
      recordBatchResults,
      saveWrestlingAssessment,
      addTrainingPlan,
      updateTrainingPlan,
      addTrainingSession,
      updateTrainingSession,
      recordAttendance,
      markAttendanceBatch,
      recordWeight,
      addInjury,
      recordInjury,
      updateInjury,
      updateInjuryStatus,
      addCompetition,
      addMatch,
      updateMatch,
      markNotificationAsRead,
      clearNotifications,
      calculateTestScore,
      getAthleteSummary
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

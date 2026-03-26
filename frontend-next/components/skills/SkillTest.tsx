"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";

interface SkillTestProps {
  skillId: string;
  skillName: string;
  onBack: () => void;
  onRefresh?: () => Promise<any> | void;
}

interface Question {
  id: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  question: string;
  options: string[];
}

interface TestResult {
  isPassed: boolean;
  finalLevel: string;
  scores: {
    Beginner: number;
    Intermediate: number;
    Advanced: number;
  };
}

const TEST_DURATION_MINUTES = 10;

export default function SkillTest({
  skillId,
  skillName,
  onBack,
  onRefresh,
}: SkillTestProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answersRef = useRef<Record<number, string>>({});
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // action เป้าหมาย (เช่น กดปุ่ม Go Back ของเราเอง)
  const [pendingAction, setPendingAction] = useState<"URL" | "BACK" | null>(null);

  const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MINUTES * 60);

  const submitTest = useCallback(async (finalAnswers: Record<number, string>) => {
    if (isSubmitting || isFinished) return;
    setIsSubmitting(true);
    try {
      const response = await apiFetch<TestResult>(
        "/api/candidates/skills/submit-test",
        {
          method: "POST",
          body: JSON.stringify({
            skillName,
            answers: finalAnswers,
            userSkillId: skillId,
          }),
        },
      );
      setTestResult(response);
      setIsFinished(true);

      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [skillName, skillId, isSubmitting, isFinished, onRefresh]);

  // Fetch Questions Logic
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<{ questions: Question[]; error?: string }>(
          "/api/candidates/skills/generate-test",
          {
            method: "POST",
            body: JSON.stringify({ skillName }),
          },
        );

        if (data.error) {
          alert(data.error);
          onBack();
          return;
        }
        
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          throw new Error("No questions found");
        }
      } catch (error: any) {
        onBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [skillName, onBack]);

  // Timer Logic
  useEffect(() => {
    if (isLoading || isFinished || questions.length === 0 || isQuitModalOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, isFinished, questions.length, submitTest, isQuitModalOpen]);

  const executeQuitAndNavigate = async () => {
    setIsQuitModalOpen(false);
    
    // บังคับส่งข้อสอบและรอจนกว่าจะเสร็จ
    await submitTest(answersRef.current);
    
    if (pendingAction === "URL" && pendingUrl) {
      window.location.href = pendingUrl;
    } else {
      // ให้ onBack() ทำงาน (กลับไปหน้า Skills) ซึ่งข้อมูลถูก Refetch ไปแล้วตอน submitTest ทำงานเสร็จ
      onBack();
    }
  };

  const handleReturn = async () => {
    if (onRefresh) await onRefresh();
    onBack(); 
  };

  const confirmQuit = () => {
    setIsQuitModalOpen(false);
    submitTest(answersRef.current);
    
    if (pendingUrl) {
      window.location.href = pendingUrl;
    } else {
      handleReturn();
    }
  };

  // --- ระบบป้องกันการออก และ Auto-submit ขั้นเด็ดขาด ---
  const isFinishedRef = useRef(isFinished);
  const isLoadingRef = useRef(isLoading);
  const hasForceSubmittedRef = useRef(false); // กันไม่ให้มันเผลอส่งซ้ำ 2 รอบ
  
  useEffect(() => {
    isFinishedRef.current = isFinished;
    isLoadingRef.current = isLoading;
  }, [isFinished, isLoading]);

  useEffect(() => {
    const forceSubmitBeacon = () => {
      if (isLoadingRef.current || isFinishedRef.current || hasForceSubmittedRef.current) return;
      hasForceSubmittedRef.current = true;

      const payload = JSON.stringify({
        skillName,
        answers: answersRef.current,
        userSkillId: skillId,
      });

      let token = "";
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^| )auth=([^;]+)/);
        if (match) token = match[2];
        if (!token) token = localStorage.getItem("token") || "";
      }
      
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const targetUrl = `${backendUrl}/api/candidates/skills/submit-test`;

      fetch(targetUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}) 
        },
        body: payload,
        keepalive: true, 
        credentials: "include",
      }).catch(console.error);
    };

    // 2. ดัก F5 (โชว์ Pop-up มาตรฐาน)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isLoadingRef.current && !isFinishedRef.current) {
        e.preventDefault();
        e.returnValue = "If you leave now, you will lose 1 test attempt."; 
      }
    };

    // 3. ดักตอนที่ผู้ใช้กดยืนยันว่าจะ "Refresh/ปิดแท็บ" จริงๆ
    const handlePageHide = () => {
      forceSubmitBeacon(); // ยิงข้อมูลก่อนหน้าจอดับ
    };

    const handleAnchorClick = (e: MouseEvent) => {
      if (isLoadingRef.current || isFinishedRef.current || hasForceSubmittedRef.current) return;
      const target = (e.target as HTMLElement).closest("a");
      
      if (target && target.href && target.href !== window.location.href && !target.target) {
        e.preventDefault(); 
        setPendingUrl(target.href);
        setPendingAction("URL");
        setIsQuitModalOpen(true);   
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide); // สำคัญมากตัวนี้!
    document.addEventListener("click", handleAnchorClick, { capture: true });

    // Cleanup: ตอนเปลี่ยน Component
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      
      // ถ้าเปลี่ยนหน้าผ่าน React Router ก็ให้ส่งข้อมูลด้วย
      forceSubmitBeacon();
    };
  }, [skillName, skillId]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!isLoadingRef.current && !isFinishedRef.current && !hasForceSubmittedRef.current) {
        // ยกเลิกการเปลี่ยนหน้าของ Browser
        window.history.pushState(null, "", window.location.href);
        // เปิด Modal ของเราขึ้นมาแทน
        setPendingAction("BACK");
        setIsQuitModalOpen(true);
      }
    };

    // บังคับให้ History ปัจจุบันมีสถานะ เพื่อให้ event popstate ทำงาน
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswerChange = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) setCurrentStep(currentStep + 1);
    else submitTest(answers);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else setIsQuitModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-16 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px] flex flex-col items-center justify-center transition-colors">
        <div className="w-14 h-14 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mb-8"></div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">AI is generating your test</h2>
        <p className="text-slate-500 dark:text-slate-400">Customizing specialized questions for <strong className="text-blue-600 dark:text-blue-400">{skillName}</strong>...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm transition-colors">
        <p className="text-red-500 dark:text-red-400 mb-4 font-bold">Questions could not be loaded.</p>
        <button onClick={handleReturn} className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 dark:hover:text-blue-300">Go Back</button>
      </div>
    );
  }

  if (isFinished && testResult) {
    const isPassed = testResult.isPassed;
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 md:p-16 text-center border-t-8 transition-colors ${isPassed ? "border-green-500" : "border-red-500"}`}>
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner ${isPassed ? "bg-green-50 dark:bg-green-900/20 text-green-500" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
            {isPassed ? "🏆" : "⚠️"}
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">
            {isPassed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium">
            Your verified proficiency level for {skillName} is <span className="text-slate-900 dark:text-white font-black underline decoration-blue-500">{testResult.finalLevel}</span>.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            {["Beginner", "Intermediate", "Advanced"].map((lv) => (
              <div key={lv} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-2 tracking-widest">{lv}</p>
                <p className={`text-2xl font-black ${testResult.scores[lv as keyof typeof testResult.scores] >= 2 ? "text-green-600 dark:text-green-400" : "text-slate-400 dark:text-slate-600"}`}>
                  {testResult.scores[lv as keyof typeof testResult.scores]}/3
                </p>
              </div>
            ))}
          </div>
          
          <button onClick={handleReturn} className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-500/25 active:scale-95">
            RETURN TO SKILLS
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const diffColors = { 
    Beginner: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400", 
    Intermediate: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", 
    Advanced: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" 
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-sans animate-in fade-in duration-700">
      {/* Quiz Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Mini-Quiz</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{skillName} Assessment</p>
          </div>
          <div className={`px-6 py-3 rounded-2xl border-2 font-black text-xl transition-all shadow-sm flex items-center gap-3 ${timeLeft < 60 ? "border-red-500 text-red-500 animate-pulse bg-red-50 dark:bg-red-900/10" : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50"}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m4.5 5.5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-3 px-1">
            <p className="text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-tighter">Question {currentStep + 1} of {questions.length}</p>
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${diffColors[currentQ.difficulty]}`}>{currentQ.difficulty}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(37,99,235,0.4)]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-12 relative transition-colors">
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-10">{currentQ.question}</h3>
          <div className="grid grid-cols-1 gap-4">
            {currentQ.options?.map((option, idx) => {
              const isSelected = answers[currentQ.id] === option;
              return (
                <label 
                  key={idx} 
                  onClick={() => handleAnswerChange(currentQ.id, option)} 
                  className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 group
                    ${isSelected 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md translate-x-1" 
                      : "border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all flex-shrink-0 
                    ${isSelected ? "border-blue-600 bg-blue-600" : "border-slate-200 dark:border-slate-700 bg-transparent group-hover:border-blue-400"}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                  </div>
                  <span className={`ml-4 text-[17px] leading-snug transition-all ${isSelected ? "text-blue-900 dark:text-blue-100 font-bold" : "text-slate-700 dark:text-slate-300 font-medium"}`}>{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handlePrevious} disabled={isSubmitting} className="flex-1 max-w-[160px] py-4 text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50 text-xs">
            {currentStep === 0 ? "Quit" : "Previous"}
          </button>
          
          <button 
            onClick={handleNext} 
            disabled={!answers[currentQ.id] || isSubmitting} 
            className={`flex-1 max-w-[240px] py-4.5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg
              ${answers[currentQ.id] 
                ? "bg-blue-600 text-white shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"}`}
          >
            {isSubmitting ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {currentStep === questions.length - 1 ? "Submit" : "Next"} 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quit Modal (Dark Mode) */}
      {isQuitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsQuitModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 text-center border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Quit the Test?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-sm font-medium leading-relaxed">
              If you leave now, you will <strong className="text-red-500">lose 1 attempt</strong> and current progress will be submitted as-is.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setIsQuitModalOpen(false)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-2xl transition-all">
                RESUME
              </button>
              <button onClick={confirmQuit} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-500/20">
                YES, QUIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
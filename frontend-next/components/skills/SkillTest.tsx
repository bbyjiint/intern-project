"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";

interface SkillTestProps {
  skillId: string;
  skillName: string;
  onBack: () => void;
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
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit test. Your progress might not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }, [skillName, skillId, isSubmitting, isFinished]);

  // 1. Fetch Questions
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
          throw new Error("No questions found in response");
        }
      } catch (error: any) {
        console.error("Error fetching AI questions:", error);
        alert(error.message || "Failed to generate test. Please try again.");
        onBack();
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [skillName, onBack]);

  // 2. Timer Logic
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

  const confirmQuit = () => {
    setIsQuitModalOpen(false);
    submitTest(answersRef.current);
    
    if (pendingUrl) {
      window.location.href = pendingUrl;
    } else {
      onBack();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAnswerChange = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitTest(answers);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setIsQuitModalOpen(true);
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
    // 1. สร้างฟังก์ชัน "ส่งข้อสอบฉุกเฉิน" แยกออกมา
    const forceSubmitTest = () => {
      // ถ้าโหลดอยู่ หรือสอบเสร็จแล้ว หรือเคยส่งฉุกเฉินไปแล้ว ให้ข้ามเลย
      if (isLoadingRef.current || isFinishedRef.current || hasForceSubmittedRef.current) return;
      hasForceSubmittedRef.current = true;

      const getCookie = (name: string) => {
        if (typeof document === "undefined") return "";
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';')?.[0] || "";
        return "";
      };
      
      const token = getCookie("auth"); // ดึง Cookie ชื่อ "auth" ตามที่คุณตั้งไว้
      const payload = JSON.stringify({
        skillName,
        answers: answersRef.current,
        userSkillId: skillId,
      });

      // ระบุ URL Backend แบบเต็มๆ ป้องกัน URL พังตอน Refresh
      // (แก้ URL ให้ตรงกับ Backend ของคุณ ถ้าไม่ใช่พอร์ต 5001)
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      const targetUrl = `${backendUrl}/api/candidates/skills/submit-test${token ? `?token=${token}` : ''}`;

      const blob = new Blob([payload], { type: "application/json" });

      // ใช้ sendBeacon เป็นอันดับแรก เพราะบราวเซอร์ออกแบบมาเพื่อใช้ตอนปิดหน้าเว็บโดยเฉพาะ
      if (navigator.sendBeacon && navigator.sendBeacon(targetUrl, blob)) {
        console.log("Auto-submit via Beacon successful");
      } else {
        // แผนสำรอง
        fetch(targetUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}) 
          },
          body: payload,
          keepalive: true,
          credentials: "include",
        }).catch(() => {});
      }
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
      forceSubmitTest(); // ยิงข้อมูลก่อนหน้าจอดับ
    };

    // 4. ดักการคลิกเมนู Next.js
    const handleAnchorClick = (e: MouseEvent) => {
      if (isLoadingRef.current || isFinishedRef.current) return;
      const target = (e.target as HTMLElement).closest("a");
      if (target && target.href && target.href !== window.location.href) {
        e.preventDefault(); 
        setPendingUrl(target.href); 
        setIsQuitModalOpen(true);   
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide); // 💡 สำคัญมากตัวนี้!
    document.addEventListener("click", handleAnchorClick, { capture: true });

    // Cleanup: ตอนเปลี่ยน Component
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      
      // ถ้าเปลี่ยนหน้าผ่าน React Router ก็ให้ส่งข้อมูลด้วย
      forceSubmitTest();
    };
  }, [skillName, skillId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-16 text-center animate-in fade-in duration-500 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#0066CC] rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI is preparing your test</h2>
        <p className="text-gray-500">Generating specialized questions for <strong>{skillName}</strong>...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-20 bg-white rounded-xl shadow-sm">
        <p className="text-red-500 mb-4">Questions could not be loaded.</p>
        <button onClick={onBack} className="text-blue-600 font-bold underline">Go Back</button>
      </div>
    );
  }

  if (isFinished && testResult) {
    return (
      <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className={`bg-white rounded-2xl shadow-xl p-10 md:p-16 text-center border-t-8 ${testResult.isPassed ? "border-green-500" : "border-red-500"}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ${testResult.isPassed ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"}`}>
            {testResult.isPassed ? "✅" : "❌"}
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">
            {testResult.isPassed ? "Test Passed!" : "Test Failed"}
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Your verified proficiency level for {skillName} is <strong className="text-black">{testResult.finalLevel}</strong>.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-10">
            {["Beginner", "Intermediate", "Advanced"].map((lv) => (
              <div key={lv} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-1">{lv}</p>
                <p className={`text-xl font-bold ${testResult.scores[lv as keyof typeof testResult.scores] >= 2 ? "text-green-600" : "text-red-500"}`}>
                  {testResult.scores[lv as keyof typeof testResult.scores]}/3
                </p>
              </div>
            ))}
          </div>
          <button onClick={onBack} className="px-12 py-4 bg-[#0066CC] text-white rounded-xl font-black text-lg hover:bg-blue-700 hover:scale-105 transition-all shadow-lg">
            RETURN TO SKILLS
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const diffColors = { Beginner: "bg-green-100 text-green-700", Intermediate: "bg-blue-100 text-blue-700", Advanced: "bg-purple-100 text-purple-700" };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 font-sans animate-in fade-in duration-700">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#0066CC]" />
        <div className="flex justify-between items-start mb-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-[#0066CC] mb-1">Mini-Quiz</h1>
            <p className="text-gray-500 text-sm font-medium">Skill: {skillName}</p>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-bold text-lg flex items-center gap-2 ${timeLeft < 60 ? "border-red-500 text-red-500 animate-pulse" : "border-gray-200 text-gray-700"}`}>
             {formatTime(timeLeft)}
          </div>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[#0066CC] font-bold text-sm">Question {currentStep + 1} of {questions.length}</p>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${diffColors[currentQ.difficulty]}`}>{currentQ.difficulty}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
            <div className="h-full bg-[#0066CC] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-10 relative">
        <div className="mb-10">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-relaxed mb-8">{currentQ.question}</h3>
          <div className="space-y-3">
            {currentQ.options?.map((option, idx) => {
              const isSelected = answers[currentQ.id] === option;
              return (
                <label key={idx} onClick={() => handleAnswerChange(currentQ.id, option)} className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}>
                  <div className="flex-shrink-0 pt-0.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-500" : "border-gray-300"}`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                  </div>
                  <span className={`ml-3 text-base ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}>{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-100">
          <button onClick={handlePrevious} disabled={isSubmitting} className="flex-1 max-w-[160px] py-3.5 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50">
            {currentStep === 0 ? "Quit" : "Previous"}
          </button>
          <button onClick={handleNext} disabled={!answers[currentQ.id] || isSubmitting} className={`flex-1 max-w-[200px] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${answers[currentQ.id] ? "bg-[#0066CC] text-white shadow-md hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : currentStep === questions.length - 1 ? "Submit Test" : "Next ›"}
          </button>
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      {isQuitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsQuitModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quit the Test?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              If you leave now, you will <strong className="text-red-500">lose 1 test attempt</strong> and your current answers will be submitted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsQuitModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                Resume
              </button>
              <button onClick={confirmQuit} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
                Yes, Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
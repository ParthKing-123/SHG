import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { GraduationCap, BookOpen, Video, FileText, CheckCircle2, Lock, PlayCircle, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { doc, setDoc, updateDoc, getDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useEffect } from "react";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  locked: boolean;
  category: "basic" | "advanced" | "business";
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  videoUrl: string;
}

export function FinancialLiteracy() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Record<string, number[]>>({});
  const { uid } = useAuth();
  const [moduleProgress, setModuleProgress] = useState<any>({});

  const buildInitialModules = () => {
    const result: any = {};

    modules.forEach((m) => {
      result[m.id] = {
        completedLessons: [],
        progress: 0,
        completed: false,
        locked: m.locked,
        updatedAt: serverTimestamp(),
      };
    });

    return result;
  };

  useEffect(() => {
  if (!uid) return;

  const initLearningDoc = async () => {
    const ref = doc(db, "FinancialLiteracy", uid);
    const snap = await getDoc(ref);

    // 🔥 Only create document if it does NOT exist
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        overallProgress: 0,
        modules: buildInitialModules(),
        lastUpdated: serverTimestamp(),
      });
    }
  };

  initLearningDoc();
}, [uid]);

  useEffect(() => {
    if (!uid) return;

    const loadProgress = async () => {
      const snap = await getDoc(doc(db, "FinancialLiteracy", uid));
      if (!snap.exists()) return;

      const data = snap.data();

      if (data.modules) {
        const lessonMap: Record<string, number[]> = {};

        Object.entries(data.modules).forEach(([moduleId, mod]: any) => {
          lessonMap[moduleId] = mod.completedLessons || [];
        });

        setCompletedLessons(lessonMap);
        setModuleProgress(data.modules);
      }
    };

    loadProgress();
  }, [uid]);

  const lessonData: Record<string, Lesson[]> = {
    "1": [
      {
        id: 1,
        title: "What is Saving?",
        content:
          "Saving means setting aside a portion of your income regularly for future needs such as emergencies or goals.",
        videoUrl: "https://www.youtube.com/embed/wXHQjScKPzc",
      },
      {
        id: 2,
        title: "Why Saving is Important",
        content:
          "Savings provide financial security, help manage emergencies, and support future plans.",
        videoUrl: "https://www.youtube.com/embed/JqYoLQXO7j4",
      },
      {
        id: 3,
        title: "Types of Savings",
        content:
          "Learn about short-term savings, long-term savings, and emergency funds.",
        videoUrl: "https://www.youtube.com/embed/1JvW4K0nYyU",
      },
      {
        id: 4,
        title: "Building a Saving Habit",
        content:
          "Understand practical steps to develop a consistent saving habit.",
        videoUrl: "https://www.youtube.com/embed/5r2zG4lZ6zI",
      },
    ],

    "2": [
      {
        id: 1,
        title: "What is a Loan?",
        content:
          "A loan is borrowed money that must be repaid over time, usually with interest.",
        videoUrl: "https://www.youtube.com/embed/2n9bZQYzZ7U",
      },
      {
        id: 2,
        title: "Understanding Interest",
        content:
          "Interest is the cost of borrowing money, calculated as a percentage of the loan.",
        videoUrl: "https://www.youtube.com/embed/8yZ9c2C7YzE",
      },
      {
        id: 3,
        title: "What is EMI?",
        content:
          "EMI stands for Equated Monthly Installment — a fixed payment made every month.",
        videoUrl: "https://www.youtube.com/embed/Lr3B6zJ2V9M",
      },
      {
        id: 4,
        title: "Responsible Borrowing",
        content:
          "Learn how to borrow responsibly and avoid falling into debt traps.",
        videoUrl: "https://www.youtube.com/embed/Vk1n3YpZ0RQ",
      },
    ],

    "3": [
      {
        id: 1,
        title: "What is a Budget?",
        content:
          "A budget is a plan that tracks income and expenses over a period of time.",
        videoUrl: "https://www.youtube.com/embed/HQzoZfc3GwQ",
      },
      {
        id: 2,
        title: "Tracking Expenses",
        content:
          "Learn how to track daily expenses to understand spending patterns.",
        videoUrl: "https://www.youtube.com/embed/fh7Y1G6W9dE",
      },
      {
        id: 3,
        title: "Needs vs Wants",
        content:
          "Understand the difference between essential needs and optional wants.",
        videoUrl: "https://www.youtube.com/embed/p9n9N1zqT0U",
      },
      {
        id: 4,
        title: "Reducing Unnecessary Expenses",
        content:
          "Practical tips to cut down unnecessary spending and save more.",
        videoUrl: "https://www.youtube.com/embed/2M4GZPj8T6k",
      },
    ],

    "4": [
      {
        id: 1,
        title: "What is a Trust Score?",
        content:
          "Trust score reflects your reliability in repayments, attendance, and participation.",
        videoUrl: "https://www.youtube.com/embed/YF0ZzYxkQn8",
      },
      {
        id: 2,
        title: "Factors Affecting Trust Score",
        content:
          "Learn what actions increase or decrease your trust score.",
        videoUrl: "https://www.youtube.com/embed/9BvW7fXk0N4",
      },
      {
        id: 3,
        title: "Improving Your Trust Score",
        content:
          "Simple habits that help improve your trust score over time.",
        videoUrl: "https://www.youtube.com/embed/RcN3Gk2Yy9U",
      },
      {
        id: 4,
        title: "Trust Score Benefits",
        content:
          "Higher trust scores unlock better loan eligibility and opportunities.",
        videoUrl: "https://www.youtube.com/embed/0pL4Tg2GZs8",
      },
    ],

    "5": [
      {
        id: 1,
        title: "What is a Small Business?",
        content:
          "A small business is independently owned and operated with limited scale.",
        videoUrl: "https://www.youtube.com/embed/6k8H8N7C3jY",
      },
      {
        id: 2,
        title: "Identifying Business Ideas",
        content:
          "Learn how to identify viable business ideas in your community.",
        videoUrl: "https://www.youtube.com/embed/4Z4z6P3V0cQ",
      },
      {
        id: 3,
        title: "Managing Business Expenses",
        content:
          "Track and manage expenses to keep your business profitable.",
        videoUrl: "https://www.youtube.com/embed/wz7Wn2Z4XQk",
      },
      {
        id: 4,
        title: "Growing Your Business",
        content:
          "Strategies to gradually grow and expand your business.",
        videoUrl: "https://www.youtube.com/embed/G7E1pZxJc6U",
      },
    ],

    "6": [
      {
        id: 1,
        title: "What is Financial Planning?",
        content:
          "Financial planning helps you manage income, expenses, and savings effectively.",
        videoUrl: "https://www.youtube.com/embed/F3zQZ6T9YgU",
      },
      {
        id: 2,
        title: "Cash Flow Management",
        content:
          "Learn how to manage money flowing in and out of your business.",
        videoUrl: "https://www.youtube.com/embed/ZJ0V0n1kZgM",
      },
      {
        id: 3,
        title: "Handling Business Risks",
        content:
          "Understand financial risks and how to prepare for them.",
        videoUrl: "https://www.youtube.com/embed/W8Zp5x8kKJk",
      },
      {
        id: 4,
        title: "Planning for Growth",
        content:
          "Prepare financial plans to support business expansion.",
        videoUrl: "https://www.youtube.com/embed/2C7R9p6B0H8",
      },
    ],

    "7": [
      {
        id: 1,
        title: "What is Investment?",
        content:
          "Investment means putting money into assets to generate future returns.",
        videoUrl: "https://www.youtube.com/embed/6t0dK0k3Y2U",
      },
      {
        id: 2,
        title: "Types of Investments",
        content:
          "Learn about fixed deposits, mutual funds, and safe investments.",
        videoUrl: "https://www.youtube.com/embed/9Hf8G1C5M2Y",
      },
      {
        id: 3,
        title: "Risk vs Return",
        content:
          "Understand how risk and return are related in investments.",
        videoUrl: "https://www.youtube.com/embed/ZzQ1cP4GZK8",
      },
      {
        id: 4,
        title: "Safe Investment Practices",
        content:
          "Tips to avoid fraud and choose safe investment options.",
        videoUrl: "https://www.youtube.com/embed/Vm2C8pJ7YkE",
      },
    ],

    "8": [
      {
        id: 1,
        title: "What is Insurance?",
        content:
          "Insurance provides financial protection against unexpected losses.",
        videoUrl: "https://www.youtube.com/embed/6ZP5kJZz9Lk",
      },
      {
        id: 2,
        title: "Types of Insurance",
        content:
          "Learn about health, life, and asset insurance.",
        videoUrl: "https://www.youtube.com/embed/3B5pZJH0P9Q",
      },
      {
        id: 3,
        title: "Why Insurance is Important",
        content:
          "Insurance helps protect your family and financial future.",
        videoUrl: "https://www.youtube.com/embed/Q9N1Z2x6XGk",
      },
      {
        id: 4,
        title: "Choosing the Right Insurance",
        content:
          "Tips to select insurance plans that suit your needs.",
        videoUrl: "https://www.youtube.com/embed/WkF0GZ2VZ5Y",
      },
    ],
  };


  const modules: Module[] = [
    {
      id: "1",
      title: "Introduction to Savings",
      description: "Learn the fundamentals of saving money and building a financial cushion",
      duration: "30 mins",
      lessons: 4,
      locked: false,
      category: "basic"
    },
    {
      id: "2",
      title: "Understanding Loans & Interest",
      description: "Master the basics of borrowing, interest rates, and EMI calculations",
      duration: "45 mins",
      lessons: 4,
      
      locked: false,
      
      category: "basic"
    },
    {
      id: "3",
      title: "Budgeting & Expense Management",
      description: "Create and maintain a household budget effectively",
      duration: "40 mins",
      lessons: 4,
      
      locked: false,
      
      category: "basic"
    },
    {
      id: "4",
      title: "Trust Score & Credit History",
      description: "Understand how trust scores work and how to improve yours",
      duration: "25 mins",
      lessons: 4,
      
      locked: false,
      
      category: "basic"
    },
    {
      id: "5",
      title: "Starting a Small Business",
      description: "Learn the essentials of starting and managing a small business",
      duration: "60 mins",
      lessons: 4,
      
      locked: false,
      
      category: "business"
    },
    {
      id: "6",
      title: "Business Financial Planning",
      description: "Create business plans, track expenses, and manage cash flow",
      duration: "55 mins",
      lessons: 4,
      
      locked: true,
     
      category: "business"
    },
    {
      id: "7",
      title: "Investment Basics",
      description: "Introduction to safe investment options and wealth building",
      duration: "50 mins",
      lessons: 4,
      
      locked: false,
      category: "advanced"
    },
    {
      id: "8",
      title: "Insurance & Risk Management",
      description: "Protect your family and assets with proper insurance",
      duration: "35 mins",
      lessons: 4,
      
      locked: true,
      
      category: "advanced"
    }
  ];

  const completedModules = modules.filter(
    m => moduleProgress[m.id]?.completed
  ).length;

  const totalModules = modules.length;

  const overallProgress = totalModules === 0
    ? 0
    : (completedModules / totalModules) * 100;


  const handleModuleClick = (module: Module) => {
  const progressData = moduleProgress[module.id];

  if (!progressData?.locked) {
    setSelectedModule(module);
    setIsModuleOpen(true);
  }
};

const renderModuleCard = (module: Module) => {
  const progressData = moduleProgress[module.id] || {};

  return (
    <Card
      key={module.id}
      className={`cursor-pointer transition-all hover:shadow-md
        ${progressData.locked ? 'opacity-60 cursor-not-allowed' : ''}
        ${progressData.completed ? 'border-green-300 bg-green-50/30' : ''}
      `}
      onClick={() => {
        if (!progressData.locked) {
          handleModuleClick(module);
        }
      }}
    >

      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {moduleProgress[module.id]?.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {moduleProgress[module.id]?.locked && <Lock className="w-5 h-5 text-gray-400" />}

              {module.title}
            </CardTitle>
            <CardDescription className="mt-2">{module.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Video className="w-4 h-4" />
            <span>{module.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{module.lessons} lessons</span>
          </div>
        </div>

        {!moduleProgress[module.id]?.locked &&
          moduleProgress[module.id]?.progress > 0 && (

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span>{moduleProgress[module.id]?.progress ?? 0}%</span>
              </div>
              <Progress value={moduleProgress[module.id]?.progress ?? 0} />
            </div>
          )}

        <div className="flex gap-2">
          {moduleProgress[module.id]?.completed && (
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
          )}

          {moduleProgress[module.id]?.locked && (
            <Badge variant="secondary">Complete prerequisites</Badge>
          )}

          {!moduleProgress[module.id]?.completed &&
          !moduleProgress[module.id]?.locked &&
          moduleProgress[module.id]?.progress > 0 && (
            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
          )}

          {!moduleProgress[module.id]?.completed &&
            !moduleProgress[module.id]?.locked &&
            (moduleProgress[module.id]?.progress ?? 0) === 0 && (
              <Badge variant="outline">Not Started</Badge>
            )}
        </div>
      </CardContent>
    </Card>
  );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Financial Literacy</h2>
        <p className="text-gray-600">Build your financial knowledge and skills</p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl text-gray-900">{overallProgress.toFixed(0)}%</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl text-gray-900">{completedModules}/{totalModules}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl text-gray-900">
                  {Object.values(moduleProgress).filter(
                      (m: any) => m.progress > 0 && m.progress < 100
                    ).length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Certificates</p>
                <p className="text-2xl text-gray-900">{completedModules}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Learning Journey</span>
              <span className="text-gray-900">{completedModules} of {totalModules} modules completed</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Module Categories */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Modules</TabsTrigger>
          <TabsTrigger value="basic">Basic Skills</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map(renderModuleCard)}
          </div>
        </TabsContent>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.filter(m => m.category === "basic").map(renderModuleCard)}
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.filter(m => m.category === "business").map(renderModuleCard)}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.filter(m => m.category === "advanced").map(renderModuleCard)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Module Details Dialog */}
      <Dialog open={isModuleOpen} onOpenChange={setIsModuleOpen}>
        <DialogContent className="max-w-3xl">
          {selectedModule && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  {moduleProgress[selectedModule.id]?.completed && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}

                  {selectedModule.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <p className="text-gray-600">{selectedModule.description}</p>

                <div className="flex gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span>{selectedModule.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{selectedModule.lessons} lessons</span>
                  </div>
                </div>

                {moduleProgress[selectedModule.id]?.progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Your Progress</span>
                      <span className="text-gray-900">{moduleProgress[selectedModule.id]?.progress ?? 0}%</span>
                    </div>
                    <Progress value={moduleProgress[selectedModule.id]?.progress ?? 0} />
                  </div>
                )}

                {/* Lesson List */}
                <div className="space-y-3">
                  <h4 className="text-gray-900">Course Content</h4>
                  <div className="space-y-2">
                    {Array.from({ length: selectedModule.lessons }).map((_, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          const lesson = lessonData[selectedModule.id]?.[index];
                          if (lesson) {
                            setSelectedLesson(lesson);
                            setIsLessonOpen(true);
                          }
                        }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                ${completedLessons[selectedModule.id]?.includes(index + 1)
                              ? "bg-teal-100"
                              : "bg-red-100"}`}
                          >
                            {completedLessons[selectedModule.id]?.includes(index + 1) ? (
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>

                          <span className="text-gray-900">Lesson {index + 1}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.floor(parseInt(selectedModule.duration) / selectedModule.lessons)} mins
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <PlayCircle className="w-4 h-4" />
                  {(moduleProgress[selectedModule.id]?.progress ?? 0) === 0
                    ? 'Start Course'
                    : 'Continue Learning'}

                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isLessonOpen} onOpenChange={setIsLessonOpen}>
        <DialogContent className="max-w-4xl">
          {selectedLesson && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedLesson.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* YouTube Video */}
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={selectedLesson.videoUrl}
                    title="Lesson Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Lesson Content */}
                <div className="text-gray-700 leading-relaxed">
                  {selectedLesson.content}
                </div>

                {/* <Button
            className="w-full"
            onClick={() => {
              if (!selectedLesson || !selectedModule) return;

              setCompletedLessons((prev) => {
                const moduleId = selectedModule.id;
                const lessonId = selectedLesson.id;

                const existing = prev[moduleId] || [];

                if (existing.includes(lessonId)) return prev;

                return {
                  ...prev,
                  [moduleId]: [...existing, lessonId],
                };
              });

              setIsLessonOpen(false);
            }}
          >
            Mark Lesson as Completed
    </Button> */}
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!uid || !selectedLesson || !selectedModule) return;

                    const moduleId = selectedModule.id;
                    const lessonId = selectedLesson.id;
                    const totalLessons = lessonData[moduleId].length;

                    // 🔥 FIX: Calculate BEFORE state update
                    const currentCompleted =
                      completedLessons[moduleId]?.length || 0;

                    const newCompletedCount = currentCompleted + 1;
                    const progress = Math.round((newCompletedCount / totalLessons) * 100);

                    // ✅ Update LOCAL completedLessons
                    setCompletedLessons((prev) => ({
                      ...prev,
                      [moduleId]: [...(prev[moduleId] || []), lessonId],
                    }));

                    // 🔥 UPDATE LOCAL moduleProgress (THIS WAS MISSING)
                    setModuleProgress((prev: any) => ({
                      ...prev,
                      [moduleId]: {
                        ...prev[moduleId],
                        progress,
                        completed: progress === 100,
                        updatedAt: new Date(),
                      },
                    }));

                    // ✅ Update Firestore
                    await updateDoc(doc(db, "FinancialLiteracy", uid), {
                      [`modules.${moduleId}.completedLessons`]: arrayUnion(lessonId),
                      [`modules.${moduleId}.progress`]: progress,
                      [`modules.${moduleId}.completed`]: progress === 100,
                      [`modules.${moduleId}.updatedAt`]: serverTimestamp(),
                      lastUpdated: serverTimestamp(),
                    });

                    setIsLessonOpen(false);
                  }}

                >
                  Mark Lesson as Completed
                </Button>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Why Learn Section */}
      <Card className="border-teal-200 bg-teal-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-teal-600" />
            Why Financial Literacy Matters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Make informed decisions about savings, loans, and investments</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Improve your trust score by understanding financial principles</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Start and grow your own business with confidence</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Achieve financial independence and security for your family</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Become a resource for others in your community</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Target, Plus, TrendingUp, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { collection, addDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
//  import { useContext } from "react";
//  import { AuthContext } from "../AuthContext";
//import { useAuth } from "../AuthContext";
interface Goal {
  id: string;
  goalName: string;
  targetAmount: number;
  targetDate: string;
  goalAchieved: boolean;
}

interface SavingsGoalsProps {
  totalSavings: number;
  userId: string;
}

export function SavingsGoals({ totalSavings, userId }: SavingsGoalsProps) {



//  const authData = useContext(AuthContext);
 //const {uid} = useAuth() ;

const [goals, setGoals] = useState<Goal[]>([]);


  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    deadline: ""
  });

 
  

  const handleCreateGoal = async () => {
  if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
    toast.error("Please fill in all fields");
    return;
  }

  await addDoc(
    collection(db, "savingGoal", userId, "goals"),
    {
      goalName: newGoal.name,
      targetAmount: Number(newGoal.target),
      targetDate: newGoal.deadline,
      goalAchieved: false
    }
  );

  toast.success("New goal created!");
  setIsDialogOpen(false);
  setNewGoal({ name: "", target: "", deadline: "" });
};



  const calculateMonthsRemaining = (deadline: string) => {
  if (!deadline) return 0;

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) return 0;

  const today = new Date();
  return Math.max(
    0,
    Math.ceil(
      (deadlineDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24 * 30)
    )
  );
};

useEffect(() => {
  if (!userId) return;

  const goalsRef = collection(db, "savingGoal", userId , "goals");

  const unsubscribe = onSnapshot(goalsRef, (snapshot) => {
    const fetchedGoals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Goal[];

    setGoals(fetchedGoals);
  });

  return () => unsubscribe();
}, [userId]);

// ✅ return AFTER all hooks
if (!userId) {
  return <div className="p-6">Loading goals...</div>;
}

  




  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl text-gray-900 mb-2">Savings Goals</h2>
          <p className="text-gray-600">Track and achieve your financial milestones</p>
        </div>

    
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Savings Goal</DialogTitle>
              <DialogDescription>
                Set a new financial goal to keep yourself motivated
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target Amount (₹)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  placeholder="50000"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Target Date</Label>
                <Input
                  id="goal-deadline"
                  type="month"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl text-gray-900">₹{(totalSavings ?? 0).toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-2xl text-gray-900">{goals.filter(g => !g.goalAchieved).length
}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Goals Achieved</p>
                <p className="text-2xl text-gray-900">
                  {goals.filter(g => g.goalAchieved).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
  const isCompleted = goal.goalAchieved;
  const progress = goal.goalAchieved ? 100 : 0;

  const monthsRemaining = calculateMonthsRemaining(goal.targetDate);


  return (
    <Card key={goal.id} className={isCompleted ? "border-green-300 bg-green-50/30" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {goal.goalName}
              {isCompleted && <Award className="w-5 h-5 text-green-600" />}
            </CardTitle>

            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              Target: {goal.targetDate}
              {!isCompleted && monthsRemaining > 0 && (
                <span className="text-orange-600">
                  ({monthsRemaining} months remaining)
                </span>
              )}
            </CardDescription>
          </div>

          {!isCompleted && (
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await updateDoc(
                  doc(db, "savingGoal", userId, "goals" , goal.id),
                  { goalAchieved: true }
                );
              }}
            >
              ✓
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="text-gray-900">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-sm text-gray-600">Target</p>
            <p className="text-xl text-gray-900">
              {(goal.targetAmount ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
})}

      </div>

      {/* Tips Section */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Tips for Achieving Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>Set realistic and specific goals with clear deadlines</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>Make regular contributions, even small amounts add up over time</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>Review and adjust your goals quarterly based on your progress</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600">•</span>
              <span>Celebrate milestones to stay motivated on your journey</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

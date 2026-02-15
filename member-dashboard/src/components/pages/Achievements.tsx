import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Award, Lock, CheckCircle2, TrendingUp, Target } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  date: string;
  icon: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  trustScore: number;
}

export function Achievements({ achievements, trustScore }: AchievementsProps) {
  const earnedCount = achievements.filter(a => a.earned).length;
  const totalCount = achievements.length;
  const progressPercentage = (earnedCount / totalCount) * 100;

  const milestones = [
    { score: 70, title: "Good Standing", achieved: trustScore >= 70, icon: "🌟" },
    { score: 80, title: "Trusted Member", achieved: trustScore >= 80, icon: "⭐" },
    { score: 90, title: "Exemplary Member", achieved: trustScore >= 90, icon: "🏆" },
    { score: 95, title: "Star Performer", achieved: trustScore >= 95, icon: "💎" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Achievements & Milestones</h2>
        <p className="text-gray-600">Track your progress and celebrate your success</p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-3xl">
                🏆
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Achievements</p>
                <p className="text-3xl text-gray-900">{earnedCount}/{totalCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Trust Score</p>
                <p className="text-3xl text-teal-600">{trustScore}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl text-gray-900">{progressPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-gray-900">{earnedCount} achievements unlocked</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Trust Score Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600" />
            Trust Score Milestones
          </CardTitle>
          <CardDescription>Unlock rewards as your trust score grows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  milestone.achieved 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  milestone.achieved ? 'bg-green-100' : 'bg-gray-200'
                }`}>
                  {milestone.achieved ? milestone.icon : '🔒'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-gray-900">{milestone.title}</h4>
                    {milestone.achieved && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {milestone.achieved 
                      ? `Achieved! Your trust score is ${trustScore}` 
                      : `Reach trust score of ${milestone.score} to unlock`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl text-gray-900">{milestone.score}</div>
                  <div className="text-xs text-gray-500">Points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="space-y-4">
        <h3 className="text-xl text-gray-900">Your Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id}
              className={achievement.earned 
                ? "border-green-300 bg-green-50/30" 
                : "opacity-60"
              }
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${
                    achievement.earned ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    {achievement.earned ? achievement.icon : '🔒'}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {achievement.title}
                      {achievement.earned && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {achievement.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {achievement.earned ? (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Earned</Badge>
                    <span className="text-sm text-gray-500">{achievement.date}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Locked</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <Card className="border-teal-200 bg-teal-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            Benefits of Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Achievements boost your credibility within the group</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Higher trust scores unlock better loan terms and higher amounts</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Top performers may be invited to leadership roles</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Completing achievements demonstrates financial discipline</span>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-600">•</span>
              <span>Your success inspires and motivates other members</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Upcoming Achievements */}
      <Card className="border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Next Achievements to Unlock
          </CardTitle>
          <CardDescription>Keep going! Here's what you can earn next</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements
              .filter(a => !a.earned)
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{achievement.title}</p>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

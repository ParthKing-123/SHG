import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // adjust path if needed
import { onSnapshot, query, orderBy } from "firebase/firestore";
import { useState , useEffect } from "react";
import { useAuth } from "../../AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Plus } from "lucide-react";

interface Round {
  id: string;
  roundName: string;
  amount: number;
}

export function MonthlyRound() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [form, setForm] = useState({
    roundName: "",
    amount: "",
  });
  const {shgId} = useAuth();
  const activeShgId = shgId!;


  const handleCreateRound = async () => {
  if (!form.roundName || !form.amount) return;

  try {
    await addDoc(
      collection(db, "ShgGroups", activeShgId, "monthlyRounds"),
      {
        roundName: form.roundName,
        amount: Number(form.amount),
        createdAt: serverTimestamp(),
      }
    );

    setForm({ roundName: "", amount: "" });
  } catch (err) {
    console.error("Error creating round:", err);
  }
};

useEffect(() => {
  if (!activeShgId) return;

  const q = query(
    collection(db, "ShgGroups", activeShgId, "monthlyRounds"),
    orderBy("createdAt", "desc")
  );

  const unsub = onSnapshot(q, (snap) => {
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Round[];

    setRounds(data);
  });

  return () => unsub();
}, [activeShgId]);



  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Monthly Round
          </h1>
          <p className="text-gray-600">
            Manage monthly savings rounds
          </p>
        </div>

        {/* ✅ CORRECT Dialog Structure */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Round
            </Button>
          </DialogTrigger>

          {/* 🔥 FIXED WIDTH + CENTERED */}
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Create Monthly Round</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label>Round Name</Label>
                <Input
                  placeholder="January Round"
                  value={form.roundName}
                  onChange={(e) =>
                    setForm({ ...form, roundName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={handleCreateRound}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rounds List */}
      {rounds.length === 0 ? (
        <p className="text-gray-500">No rounds created yet</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {rounds.map((round) => (
    <Card
      key={round.id}
      className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
    >
      <CardContent className="p-6 space-y-2">
        {/* Month Name */}
        <p className="text-gray-900 font-semibold text-lg capitalize">
          {round.roundName}
        </p>

        {/* Amount */}
        <p className="text-teal-600 text-xl font-bold">
          ₹{round.amount.toLocaleString("en-IN")}
        </p>
      </CardContent>
    </Card>
  ))}
</div>

      )}
    </div>
  );
}

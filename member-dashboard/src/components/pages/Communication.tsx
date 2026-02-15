import { useState, useEffect, useContext } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { MessageSquare, Send, Clock } from "lucide-react";

interface Message {
  id: string;
  sender: string;
  role: string;
  message: string;
  timestamp: string;
}

interface CommunicationProps {
  groupName: string;
}

export function Communication({ groupName }: CommunicationProps) {
  // ✅ Hooks ONLY inside component
  const authData = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  if (!authData || !authData.shgId) {
    return <div className="p-6">Loading messages...</div>;
  }

  // const shgId = authData.shgId;
  // const userName = authData.name;
  // const userRole = authData.role;
  const shgId = authData.shgId;
const userName = authData.name || "Unknown";
const userRole = authData.role || "member";


  // 🔥 SEND MESSAGE (creates messages subcollection automatically)
  const handleSendMessage = async () => {
     console.log("SEND BUTTON CLICKED");
  console.log("Send clicked");

  if (!newMessage.trim()) {
    console.log("Empty message");
    return;
  }

  console.log("SHG ID:", shgId);
  console.log("User:", userName, userRole);
  console.log("Message:", newMessage);

  try {
    await addDoc(
      collection(db, "ShgGroups", shgId, "messages"),
      {
        name: userName,
        role: userRole,
        message: newMessage,
        timestamp: serverTimestamp()
      }
    );

    console.log("Message written to Firestore");
    setNewMessage("");
  } catch (err) {
    console.error("Firestore error:", err);
  }
};


  // 🔥 READ MESSAGES (real-time)
  useEffect(() => {
    const q = query(
      collection(db, "ShgGroups", shgId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          sender: d.name,
          role: d.role,
          message: d.message,
          timestamp: d.timestamp
            ? d.timestamp.toDate().toLocaleString("en-IN")
            : "Just now"
        };
      });

      setMessages(data);
    });

    return () => unsubscribe();
  }, [shgId]);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Group Communication</h2>

      <Card>
        <CardHeader>
          <CardTitle>{groupName} Chat</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <ScrollArea className="h-[400px]">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm">No messages yet</p>
            ) : (
              messages.map(m => (
                <div key={m.id} className="flex gap-3 mb-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(m.sender)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex gap-2 items-center">
                      <span>{m.sender}</span>
                      <Badge>{m.role}</Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {m.timestamp}
                      </span>
                    </div>
                    <p className="text-sm">{m.message}</p>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <Button type="button" onClick={handleSendMessage}>

              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

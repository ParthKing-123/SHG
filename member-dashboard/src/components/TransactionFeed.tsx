import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowRight } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: "verified" | "pending";
}

interface TransactionFeedProps {
  transactions: Transaction[];
}

export function TransactionFeed({ transactions }: TransactionFeedProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and contributions</CardDescription>
          </div>
          <Button variant="outline" className="gap-2">
            View Full Ledger
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell className="text-right">₹{transaction.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={transaction.status === "verified" ? "default" : "secondary"}
                      className={
                        transaction.status === "verified" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      }
                    >
                      {transaction.status === "verified" ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, Download } from "lucide-react";
import { getAuthToken } from "@/lib/auth-context";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VendorReceipt } from "@shared/schema";

export default function VendorReceipts() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: receipts = [], isLoading } = useQuery<VendorReceipt[]>({
    queryKey: ["/api/vendors/receipts"],
    queryFn: async () => {
      const token = getAuthToken();
      const res = await fetch("/api/vendors/receipts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch receipts");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = getAuthToken();
      const res = await fetch("/api/vendors/receipts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create receipt");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/receipts"] });
      setIsOpen(false);
      toast({ title: "Receipt created successfully" });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      receiptNumber: formData.get("receiptNumber"),
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      amount: formData.get("amount"),
      items: [{ name: "General Sale", quantity: 1, price: formData.get("amount") }],
      status: "issued"
    };
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Receipts</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Receipt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Receipt</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input id="receiptNumber" name="receiptNumber" required placeholder="REC-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" name="customerName" required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input id="customerEmail" name="customerEmail" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Receipt"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading receipts...</TableCell>
                </TableRow>
              ) : receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No receipts found</TableCell>
                </TableRow>
              ) : (
                receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">{receipt.receiptNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{receipt.customerName}</p>
                        <p className="text-xs text-muted-foreground">{receipt.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{parseFloat(receipt.amount as any).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="capitalize px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {receipt.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(receipt.issuedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

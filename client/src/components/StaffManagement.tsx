import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, User, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { StaffAccount } from "@shared/schema";

export function StaffManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newStaff, setNewStaff] = useState({
    username: "",
    password: "",
  });

  const { data: staffAccounts = [], isLoading } = useQuery<StaffAccount[]>({
    queryKey: ["/api/admin/staff"],
    queryFn: async () => {
      const response = await fetch("/api/admin/staff", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch staff accounts");
      return response.json();
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create staff account");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      setNewStaff({ username: "", password: "" });
      setIsCreateDialogOpen(false);
      toast({
        title: "Staff account created",
        description: "Account has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete staff account");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff"] });
      toast({
        title: "Staff account deleted",
        description: "The staff account has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewStaff(prev => ({ ...prev, password }));
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.username || !newStaff.password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }

    createStaffMutation.mutate(newStaff);
  };

  const handleDeleteStaff = (id: string) => {
    deleteStaffMutation.mutate(id);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${type} copied to clipboard`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Staff Management
            </CardTitle>
            <CardDescription>
              Create and manage staff accounts for vendor monitoring
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Staff Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Staff Account</DialogTitle>
                <DialogDescription>
                  Create a new staff account for vendor monitoring access
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      required
                    />
                    <Button type="button" variant="outline" onClick={generatePassword}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Account</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {staffAccounts.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Staff Accounts</h3>
            <p className="text-muted-foreground mb-4">
              Create staff accounts to give your team access to vendor monitoring
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffAccounts.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{staff.username}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(staff.username, "Username")}
                        className="h-6 w-6 p-0"
                      >
                        📋
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {showPasswords[staff.id] ? staff.password : "••••••••••••"}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePasswordVisibility(staff.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showPasswords[staff.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(staff.password, "Password")}
                        className="h-6 w-6 p-0"
                      >
                        📋
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(staff.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {staff.lastLogin ? new Date(staff.lastLogin).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={staff.isActive ? "default" : "secondary"}>
                      {staff.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Vendor Management Access</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Staff can access the vendor monitoring dashboard at:
          </p>
          <code className="text-sm bg-background px-2 py-1 rounded border">
            {window.location.origin}/vendor-management
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Share this URL along with the username and password with your staff members.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
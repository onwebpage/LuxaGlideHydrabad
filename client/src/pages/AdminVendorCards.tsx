import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const iconOptions = [
  "TrendingUp",
  "Users",
  "Gem",
  "Zap",
  "Package",
  "HeartHandshake",
  "Award",
  "Shield",
  "Star",
  "Sparkles",
];

export default function AdminVendorCards() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/admin/cms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.vendorPageCards?.cards) {
          setCards(data.vendorPageCards.cards);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/cms/vendor-cards", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ cards }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Vendor page cards updated successfully",
        });
      } else {
        throw new Error("Failed to update cards");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor page cards",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addCard = () => {
    const newCard = {
      id: Date.now().toString(),
      icon: "Star",
      title: "New Card",
      description: "Card description",
      displayOrder: cards.length,
      isVisible: true,
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (id: string, field: string, value: any) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const deleteCard = (id: string) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const moveCard = (index: number, direction: "up" | "down") => {
    const newCards = [...cards];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCards.length) return;
    
    [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];
    newCards.forEach((card, idx) => {
      card.displayOrder = idx;
    });
    setCards(newCards);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Page Cards</h1>
          <p className="text-muted-foreground">
            Manage the "Why On-Board Queen4feet?" section cards
          </p>
        </div>
        <Button onClick={addCard}>
          <Plus className="w-4 h-4 mr-2" />
          Add Card
        </Button>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <Card key={card.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Card {index + 1}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveCard(index, "up")}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveCard(index, "down")}
                    disabled={index === cards.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCard(card.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={card.icon}
                    onValueChange={(value) =>
                      updateCard(card.id, "icon", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visible</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      checked={card.isVisible}
                      onCheckedChange={(checked) =>
                        updateCard(card.id, "isVisible", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={card.title}
                  onChange={(e) =>
                    updateCard(card.id, "title", e.target.value)
                  }
                  placeholder="Card title"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={card.description}
                  onChange={(e) =>
                    updateCard(card.id, "description", e.target.value)
                  }
                  placeholder="Card description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}

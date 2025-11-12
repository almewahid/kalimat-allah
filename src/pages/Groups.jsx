import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, LogIn, Crown, Loader2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";

function generateJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Groups() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const allGroups = await base44.entities.Group.list();
      const userGroups = allGroups.filter(g => 
        g.leader_email === currentUser.email || 
        (g.members && g.members.includes(currentUser.email))
      );
      
      setGroups(allGroups);
      setMyGroups(userGroups);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      toast({ title: "⚠️ الرجاء إدخال اسم المجموعة", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const groupData = {
        name: newGroup.name,
        description: newGroup.description,
        join_code: generateJoinCode(),
        leader_email: user.email,
        members: [user.email],
        is_active: true
      };

      await base44.entities.Group.create(groupData);
      
      toast({ 
        title: "✅ تم إنشاء المجموعة بنجاح",
        className: "bg-green-100 text-green-800"
      });
      
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "" });
      loadData();
    } catch (error) {
      console.error("Error creating group:", error);
      toast({ title: "❌ خطأ في إنشاء المجموعة", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      toast({ title: "⚠️ الرجاء إدخال كود الانضمام", variant: "destructive" });
      return;
    }

    setIsJoining(true);
    try {
      const foundGroup = await base44.entities.Group.filter({ join_code: joinCode.toUpperCase() });
      
      if (foundGroup.length === 0) {
        toast({ title: "❌ كود غير صحيح", variant: "destructive" });
        return;
      }

      const group = foundGroup[0];
      
      if (group.members && group.members.includes(user.email)) {
        toast({ title: "ℹ️ أنت عضو بالفعل في هذه المجموعة" });
        return;
      }

      const updatedMembers = [...(group.members || []), user.email];
      await base44.entities.Group.update(group.id, { members: updatedMembers });
      
      toast({ 
        title: "✅ تم الانضمام للمجموعة بنجاح",
        className: "bg-green-100 text-green-800"
      });
      
      setShowJoinModal(false);
      setJoinCode("");
      loadData();
    } catch (error) {
      console.error("Error joining group:", error);
      toast({ title: "❌ خطأ في الانضمام للمجموعة", variant: "destructive" });
    } finally {
      setIsJoining(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({ title: "✅ تم نسخ الكود" });
    setTimeout(() => setCopiedCode(""), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">المجموعات والتحديات</h1>
            <p className="text-foreground/70">انضم إلى مجموعة أو أنشئ مجموعتك الخاصة</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowJoinModal(true)}
              variant="outline"
              className="gap-2"
            >
              <LogIn className="w-5 h-5" />
              انضم لمجموعة
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-primary-foreground gap-2"
            >
              <Plus className="w-5 h-5" />
              إنشاء مجموعة
            </Button>
          </div>
        </div>

        {/* My Groups */}
        <Card className="mb-8 bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="w-6 h-6" />
              مجموعاتي ({myGroups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myGroups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-foreground/70 mb-4">لم تنضم لأي مجموعة بعد</p>
                <Button onClick={() => setShowJoinModal(true)} variant="outline">
                  <LogIn className="w-4 h-4 ml-2" />
                  انضم لمجموعة
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={createPageUrl(`GroupDetail?id=${group.id}`)}>
                      <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            {group.leader_email === user.email && (
                              <Badge className="bg-amber-100 text-amber-700">
                                <Crown className="w-3 h-3 ml-1" />
                                رئيس
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-bold text-lg text-foreground mb-2">{group.name}</h3>
                          <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                            {group.description || "لا يوجد وصف"}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground/70">
                              {group.members?.length || 0} عضو
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault();
                                copyToClipboard(group.join_code);
                              }}
                              className="gap-1"
                            >
                              {copiedCode === group.join_code ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              {group.join_code}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Group Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مجموعة جديدة</DialogTitle>
              <DialogDescription>
                أنشئ مجموعة خاصة وادع أصدقاءك للانضمام
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">اسم المجموعة *</Label>
                <Input
                  id="group-name"
                  placeholder="مثال: مجموعة حفظ جزء عم"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="group-desc">الوصف (اختياري)</Label>
                <Textarea
                  id="group-desc"
                  placeholder="اكتب وصفاً مختصراً للمجموعة..."
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateGroup}
                  disabled={isCreating}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {isCreating ? (
                    <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جارٍ الإنشاء...</>
                  ) : (
                    <><Plus className="w-4 h-4 ml-2" />إنشاء المجموعة</>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Group Modal */}
        <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>الانضمام لمجموعة</DialogTitle>
              <DialogDescription>
                أدخل كود الانضمام الذي حصلت عليه من رئيس المجموعة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="join-code">كود الانضمام</Label>
                <Input
                  id="join-code"
                  placeholder="مثال: ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleJoinGroup}
                  disabled={isJoining}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {isJoining ? (
                    <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جارٍ الانضمام...</>
                  ) : (
                    <><LogIn className="w-4 h-4 ml-2" />انضم الآن</>
                  )}
                </Button>
                <Button
                  onClick={() => setShowJoinModal(false)}
                  variant="outline"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
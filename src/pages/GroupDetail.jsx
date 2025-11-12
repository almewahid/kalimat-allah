import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Users, Trophy, Plus, Calendar, Target, Loader2, Copy, Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";

import CreateChallengeModal from "../components/challenges/CreateChallengeModal";
import ChallengeCard from "../components/challenges/ChallengeCard";

export default function GroupDetail() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('id');

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const groupData = await base44.entities.Group.filter({ id: groupId });
      if (groupData.length === 0) {
        toast({ title: "❌ المجموعة غير موجودة", variant: "destructive" });
        return;
      }

      const currentGroup = groupData[0];
      setGroup(currentGroup);

      const groupChallenges = await base44.entities.GroupChallenge.filter({ group_id: groupId });
      setChallenges(groupChallenges);

      // Load member details
      const allUsers = await base44.entities.User.list();
      const groupMembers = allUsers.filter(u => currentGroup.members?.includes(u.email));
      setMembers(groupMembers);

    } catch (error) {
      console.error("Error loading group data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(group.join_code);
    setCopiedCode(true);
    toast({ title: "✅ تم نسخ كود الانضمام" });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isLeader = user && group && group.leader_email === user.email;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>المجموعة غير موجودة</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Groups")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold gradient-text">{group.name}</h1>
              {isLeader && (
                <Badge className="bg-amber-100 text-amber-700">
                  <Crown className="w-3 h-3 ml-1" />
                  رئيس
                </Badge>
              )}
            </div>
            <p className="text-foreground/70">{group.description}</p>
          </div>
          <Button
            onClick={copyJoinCode}
            variant="outline"
            className="gap-2"
          >
            {copiedCode ? (
              <><Check className="w-4 h-4 text-green-600" />تم النسخ</>
            ) : (
              <><Copy className="w-4 h-4" />{group.join_code}</>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card shadow-md">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">{members.length}</div>
              <p className="text-sm text-foreground/70">عضو</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md">
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">{challenges.length}</div>
              <p className="text-sm text-foreground/70">تحدي</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-foreground">
                {challenges.filter(c => c.is_active).length}
              </div>
              <p className="text-sm text-foreground/70">تحدي نشط</p>
            </CardContent>
          </Card>
        </div>

        {/* Challenges Section */}
        <Card className="mb-8 bg-card shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                التحديات
              </CardTitle>
              {isLeader && (
                <Button
                  onClick={() => setShowCreateChallenge(true)}
                  className="bg-primary text-primary-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء تحدي
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-foreground/70 mb-4">لا توجد تحديات بعد</p>
                {isLeader && (
                  <Button onClick={() => setShowCreateChallenge(true)} variant="outline">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء أول تحدي
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {challenges.map((challenge, index) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    index={index}
                    userEmail={user.email}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members Section */}
        <Card className="bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="w-6 h-6" />
              الأعضاء ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member, index) => (
                <motion.div
                  key={member.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-background-soft rounded-lg"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{member.full_name || member.email}</p>
                    {member.email === group.leader_email && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        <Crown className="w-3 h-3 ml-1" />
                        رئيس
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Challenge Modal */}
        {isLeader && (
          <CreateChallengeModal
            isOpen={showCreateChallenge}
            onClose={() => setShowCreateChallenge(false)}
            groupId={groupId}
            onSuccess={loadGroupData}
          />
        )}
      </motion.div>
    </div>
  );
}
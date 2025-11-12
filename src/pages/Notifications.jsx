import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * 🔔 صفحة الإشعارات (Notifications)
 * 
 * 📍 أين تظهر: من القائمة الجانبية → "الإشعارات"
 * 🕐 متى تظهر: دائماً متاحة
 * 👥 لمن: جميع المستخدمين المسجلين
 * 💡 الفكرة: عرض جميع الإشعارات (طلبات صداقة، تذكيرات، إنجازات، تحديات)
 */

export default function Notifications() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const allNotifications = await base44.entities.Notification.filter({
        user_email: currentUser.email
      });

      allNotifications.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setNotifications(allNotifications);

    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await base44.entities.Notification.update(notificationId, { is_read: true });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      for (const notification of unreadNotifications) {
        await base44.entities.Notification.update(notification.id, { is_read: true });
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      toast({
        title: "✅ تم",
        description: "تم تعليم جميع الإشعارات كمقروءة",
        className: "bg-green-100 text-green-800"
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await base44.entities.Notification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: "تم الحذف",
        description: "تم حذف الإشعار",
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case "friend_request":
      case "friend_accepted":
        return "border-blue-200 bg-blue-50";
      case "achievement":
        return "border-amber-200 bg-amber-50";
      case "reminder":
        return "border-purple-200 bg-purple-50";
      case "challenge":
        return "border-green-200 bg-green-50";
      case "streak_warning":
        return "border-red-200 bg-red-50";
      default:
        return "border-border bg-card";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">🔔 الإشعارات</h1>
            <p className="text-foreground/70">
              لديك {unreadCount} إشعار غير مقروء
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="w-4 h-4 ml-2" />
              تعليم الكل كمقروء
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
              <h3 className="text-xl font-bold mb-2">لا توجد إشعارات</h3>
              <p className="text-foreground/70">ستظهر هنا جميع إشعاراتك</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card
                    className={`${getNotificationStyle(notification.notification_type)} border-2 ${
                      !notification.is_read ? 'shadow-md' : 'opacity-75'
                    } transition-all hover:shadow-lg cursor-pointer`}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-3xl">{notification.icon || "📢"}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold">{notification.title}</h3>
                              {!notification.is_read && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  جديد
                                </Badge>
                              )}
                            </div>
                            <p className="text-foreground/80 text-sm mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-foreground/60">
                              {formatDistanceToNow(new Date(notification.created_date), {
                                addSuffix: true,
                                locale: ar
                              })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
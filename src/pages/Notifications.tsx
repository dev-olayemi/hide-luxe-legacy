/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  PackageIcon,
  Gift,
  MessageSquare,
  Trash2,
  Filter,
} from "lucide-react";

const NotificationsPage = () => {
  const { notifications, markAsRead, removeNotification, refreshNotifications } = useNotifications();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    refreshNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <PackageIcon className="w-6 h-6 text-blue-500" />;
      case "refund":
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case "bespoke":
        return <Gift className="w-6 h-6 text-purple-500" />;
      case "admin":
        return <MessageSquare className="w-6 h-6 text-green-500" />;
      case "payment":
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      default:
        return <Bell className="w-6 h-6 text-slate-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order":
        return "bg-blue-100 text-blue-800";
      case "refund":
        return "bg-amber-100 text-amber-800";
      case "bespoke":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-green-100 text-green-800";
      case "payment":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatDateTime = (date: any) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (date: any) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  let filteredNotifications = notifications;

  if (filter === "unread") {
    filteredNotifications = filteredNotifications.filter((n) => !n.read);
  } else if (filter === "read") {
    filteredNotifications = filteredNotifications.filter((n) => n.read);
  }

  if (typeFilter !== "all") {
    filteredNotifications = filteredNotifications.filter((n) => n.type === typeFilter);
  }

  const types = Array.from(new Set(notifications.map((n) => n.type)));

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-12">
        <div className="mb-8">
          <BackButton className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              {notifications.some((n) => !n.read) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    notifications.forEach((n) => {
                      if (!n.read) markAsRead(n.id);
                    });
                  }}
                  className="text-xs md:text-sm"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs md:text-sm"
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="text-xs md:text-sm"
            >
              Unread
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
              className="text-xs md:text-sm"
            >
              Read
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === "all" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
              className="text-xs md:text-sm"
            >
              <Filter className="w-3 h-3 mr-1" /> All Types
            </Button>
            {types.map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "secondary" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
                className="text-xs md:text-sm"
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No notifications</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : filter === "read"
                  ? "No read notifications yet."
                  : "You'll see notifications here about your orders and account updates."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-0 shadow-md hover:shadow-lg transition cursor-pointer ${
                  notification.read ? "bg-white" : "bg-blue-50 border-l-4 border-l-blue-500"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 p-3 bg-slate-100 rounded-lg">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${notification.read ? "text-slate-700" : "text-foreground"}`}>
                            {notification.title}
                          </h3>
                          <Badge className={`text-xs ${getTypeColor(notification.type)}`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </Badge>
                          {!notification.read && (
                            <Badge className="bg-blue-500 text-white text-xs">New</Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(notification.createdAt)}
                          <span className="text-muted-foreground/50 ml-1">({formatTime(notification.createdAt)})</span>
                        </span>

                        <div className="flex gap-2">
                          {notification.actionUrl && notification.actionLabel && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                              className="text-xs h-8"
                            >
                              {notification.actionLabel}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-xs h-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;

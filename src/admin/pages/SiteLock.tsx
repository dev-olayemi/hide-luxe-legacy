/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getSiteLockStatus, lockSite, unlockSite } from "@/firebase/firebaseUtils";
import { auth } from "@/firebase/firebaseConfig";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Lock, Unlock, AlertCircle, Clock } from "lucide-react";

interface SiteLockStatus {
  isLocked: boolean;
  reason: string;
  expectedLiftTime: Date | null;
  lockedBy: string;
  lockedAt: Date | null;
}

const SiteLock = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [lockStatus, setLockStatus] = useState<SiteLockStatus>({
    isLocked: false,
    reason: "",
    expectedLiftTime: null,
    lockedBy: "",
    lockedAt: null,
  });

  const [formData, setFormData] = useState({
    reason: "",
    expectedLiftTime: "",
  });

  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    fetchLockStatus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!lockStatus.isLocked || !lockStatus.expectedLiftTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const liftTime = new Date(lockStatus.expectedLiftTime!).getTime();
      const difference = liftTime - now;

      if (difference <= 0) {
        setCountdown("Expired");
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setCountdown(
          `${days}d ${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockStatus.isLocked, lockStatus.expectedLiftTime]);

  const fetchLockStatus = async () => {
    try {
      const status = await getSiteLockStatus();
      setLockStatus(status);
    } catch (error) {
      console.error("Error fetching lock status:", error);
      toast({ title: "Failed to fetch lock status", variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  const handleLockSite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      toast({ title: "Please enter a reason for locking the site", variant: "destructive" });
      return;
    }

    if (!formData.expectedLiftTime) {
      toast({ title: "Please select an expected lift time", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const adminEmail = auth.currentUser?.email || "unknown";
      const liftTime = new Date(formData.expectedLiftTime);

      const success = await lockSite(formData.reason, liftTime, adminEmail);

      if (success) {
        toast({ title: "Site has been locked successfully!" });
        setFormData({ reason: "", expectedLiftTime: "" });
        await fetchLockStatus();
      } else {
        toast({ title: "Failed to lock site", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error locking site:", error);
      toast({ title: "Error locking site", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockSite = async () => {
    if (!confirm("Are you sure you want to unlock the site?")) return;

    setLoading(true);

    try {
      const success = await unlockSite();

      if (success) {
        toast({ title: "Site has been unlocked successfully!" });
        await fetchLockStatus();
      } else {
        toast({ title: "Failed to unlock site", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error unlocking site:", error);
      toast({ title: "Error unlocking site", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Lock className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Site Lock Management</h1>
          <p className="text-muted-foreground">Control public access to your site</p>
        </div>
      </div>

      {/* Current Status */}
      <Card className={lockStatus.isLocked ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lockStatus.isLocked ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-red-700">Site is Locked</CardTitle>
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-green-700">Site is Active</CardTitle>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lockStatus.isLocked && (
            <>
              <div>
                <Label className="text-sm font-semibold">Reason:</Label>
                <p className="text-sm mt-1">{lockStatus.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Expected Lift Time:</Label>
                  <p className="text-sm mt-1">
                    {lockStatus.expectedLiftTime
                      ? new Date(lockStatus.expectedLiftTime).toLocaleString()
                      : "Not specified"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Countdown:
                  </Label>
                  <p className="text-sm mt-1 font-mono font-bold">{countdown}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold">Locked By:</Label>
                <p className="text-sm mt-1">{lockStatus.lockedBy}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold">Locked At:</Label>
                <p className="text-sm mt-1">
                  {lockStatus.lockedAt
                    ? new Date(lockStatus.lockedAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>

              <Button
                onClick={handleUnlockSite}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Unlock className="mr-2 h-4 w-4" />
                Unlock Site Now
              </Button>
            </>
          )}

          {!lockStatus.isLocked && (
            <p className="text-sm text-gray-600">
              Your site is currently available for public access. Use the form below to lock it when needed.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Lock Form */}
      {!lockStatus.isLocked && (
        <Card>
          <CardHeader>
            <CardTitle>Lock Site</CardTitle>
            <CardDescription>
              Lock the site to prevent public access. Fill in the reason and expected time when the site will be back online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLockSite} className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason for Lock</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Scheduled maintenance, system updates, inventory check..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="mt-1 min-h-24"
                />
              </div>

              <div>
                <Label htmlFor="expectedLiftTime">Expected Lift Time</Label>
                <Input
                  id="expectedLiftTime"
                  type="datetime-local"
                  value={formData.expectedLiftTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedLiftTime: e.target.value,
                    })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  When do you expect the site to be back online?
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Lock className="mr-2 h-4 w-4" />
                {loading ? "Locking..." : "Lock Site"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SiteLock;

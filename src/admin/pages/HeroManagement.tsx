import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Megaphone, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface HeroContent {
  subtitle: string;
  title: string;
  ctaText: string;
  ctaLink: string;
  ctaButtonColor: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

interface NoticeBoard {
  enabled: boolean;
  message: string;
  type: 'info' | 'warning' | 'success';
  link?: string;
}

const HeroManagement = () => {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    subtitle: "Premium Leather",
    title: "Luxury. Leather. Legacy.",
    ctaText: "Shop New Arrivals",
    ctaLink: "/new-arrivals",
    ctaButtonColor: "#eab308",
    secondaryCtaText: "Our Story",
    secondaryCtaLink: "/our-story"
  });

  const [noticeBoard, setNoticeBoard] = useState<NoticeBoard>({
    enabled: false,
    message: "",
    type: 'info',
    link: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const heroDoc = await getDoc(doc(db, 'siteSettings', 'hero'));
      const noticeDoc = await getDoc(doc(db, 'siteSettings', 'noticeBoard'));

      if (heroDoc.exists()) {
        setHeroContent(heroDoc.data() as HeroContent);
      }

      if (noticeDoc.exists()) {
        setNoticeBoard(noticeDoc.data() as NoticeBoard);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const saveHeroContent = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', 'hero'), heroContent);
      toast.success('Hero content updated successfully!');
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error('Failed to save hero content');
    } finally {
      setSaving(false);
    }
  };

  const saveNoticeBoard = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', 'noticeBoard'), noticeBoard);
      toast.success('Notice board updated successfully!');
    } catch (error) {
      console.error('Error saving notice board:', error);
      toast.error('Failed to save notice board');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Hero & Notice Management</h1>
        <p className="text-muted-foreground">
          Manage your homepage hero section and attention board
        </p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="notice">Notice Board</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Hero Content
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={heroContent.subtitle}
                  onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
                  placeholder="Premium Leather"
                />
              </div>

              <div>
                <Label htmlFor="title">Main Title</Label>
                <Input
                  id="title"
                  value={heroContent.title}
                  onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
                  placeholder="Luxury. Leather. Legacy."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">Primary CTA Text</Label>
                  <Input
                    id="ctaText"
                    value={heroContent.ctaText}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaText: e.target.value })}
                    placeholder="Shop New Arrivals"
                  />
                </div>
                <div>
                  <Label htmlFor="ctaLink">Primary CTA Link</Label>
                  <Input
                    id="ctaLink"
                    value={heroContent.ctaLink}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaLink: e.target.value })}
                    placeholder="/new-arrivals"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ctaButtonColor">Primary Button Color</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    type="color"
                    id="ctaButtonColor"
                    value={heroContent.ctaButtonColor}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaButtonColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={heroContent.ctaButtonColor}
                    onChange={(e) => setHeroContent({ ...heroContent, ctaButtonColor: e.target.value })}
                    placeholder="#eab308"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondaryCtaText">Secondary CTA Text</Label>
                  <Input
                    id="secondaryCtaText"
                    value={heroContent.secondaryCtaText}
                    onChange={(e) => setHeroContent({ ...heroContent, secondaryCtaText: e.target.value })}
                    placeholder="Our Story"
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryCtaLink">Secondary CTA Link</Label>
                  <Input
                    id="secondaryCtaLink"
                    value={heroContent.secondaryCtaLink}
                    onChange={(e) => setHeroContent({ ...heroContent, secondaryCtaLink: e.target.value })}
                    placeholder="/our-story"
                  />
                </div>
              </div>

              <Button onClick={saveHeroContent} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Hero Content'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notice" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Notice Board / Attention Banner
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="noticeEnabled">Enable Notice Board</Label>
                  <p className="text-sm text-muted-foreground">
                    Display an attention banner on the homepage
                  </p>
                </div>
                <Switch
                  id="noticeEnabled"
                  checked={noticeBoard.enabled}
                  onCheckedChange={(checked) => setNoticeBoard({ ...noticeBoard, enabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="noticeMessage">Notice Message</Label>
                <Textarea
                  id="noticeMessage"
                  value={noticeBoard.message}
                  onChange={(e) => setNoticeBoard({ ...noticeBoard, message: e.target.value })}
                  placeholder="🎉 New Collection Launch! Premium leather jackets now available. Shop Now →"
                  rows={3}
                />
              </div>

              <div>
                <Label>Notice Type</Label>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setNoticeBoard({ ...noticeBoard, type: 'info' })}
                    className={`flex-1 p-3 rounded-lg border-2 transition ${
                      noticeBoard.type === 'info' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-border'
                    }`}
                  >
                    <Badge className="bg-blue-500">Info</Badge>
                  </button>
                  <button
                    onClick={() => setNoticeBoard({ ...noticeBoard, type: 'warning' })}
                    className={`flex-1 p-3 rounded-lg border-2 transition ${
                      noticeBoard.type === 'warning' 
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' 
                        : 'border-border'
                    }`}
                  >
                    <Badge className="bg-yellow-500">Warning</Badge>
                  </button>
                  <button
                    onClick={() => setNoticeBoard({ ...noticeBoard, type: 'success' })}
                    className={`flex-1 p-3 rounded-lg border-2 transition ${
                      noticeBoard.type === 'success' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                        : 'border-border'
                    }`}
                  >
                    <Badge className="bg-green-500">Success</Badge>
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="noticeLink">Optional Link (leave empty for no link)</Label>
                <Input
                  id="noticeLink"
                  value={noticeBoard.link}
                  onChange={(e) => setNoticeBoard({ ...noticeBoard, link: e.target.value })}
                  placeholder="/new-arrivals"
                />
              </div>

              {noticeBoard.enabled && noticeBoard.message && (
                <div className="mt-6">
                  <Label>Preview</Label>
                  <div
                    className={`mt-2 p-4 rounded-lg ${
                      noticeBoard.type === 'info' ? 'bg-blue-100 dark:bg-blue-950 border-blue-500' :
                      noticeBoard.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-950 border-yellow-500' :
                      'bg-green-100 dark:bg-green-950 border-green-500'
                    } border-l-4`}
                  >
                    <p className="text-sm font-medium">{noticeBoard.message}</p>
                  </div>
                </div>
              )}

              <Button onClick={saveNoticeBoard} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Notice Board'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeroManagement;

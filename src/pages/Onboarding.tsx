import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Sparkles, Palette, ShoppingBag } from "lucide-react";

const STEPS = 3;

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    style: "",
    colors: [] as string[],
    categories: [] as string[],
  });
  const navigate = useNavigate();

  const styles = [
    { value: "classic", label: "Classic & Timeless", description: "Traditional elegance" },
    { value: "modern", label: "Modern & Bold", description: "Contemporary style" },
    { value: "casual", label: "Casual & Comfortable", description: "Everyday wear" },
    { value: "luxury", label: "Luxury & Premium", description: "High-end sophistication" },
  ];

  const colors = [
    { value: "black", label: "Black", hex: "#000000" },
    { value: "brown", label: "Brown", hex: "#8B4513" },
    { value: "tan", label: "Tan", hex: "#D2B48C" },
    { value: "burgundy", label: "Burgundy", hex: "#800020" },
    { value: "navy", label: "Navy", hex: "#000080" },
    { value: "cognac", label: "Cognac", hex: "#A0522D" },
  ];

  const categories = [
    { value: "footwear", label: "Footwear", icon: "👞" },
    { value: "bags", label: "Bags & Accessories", icon: "👜" },
    { value: "jackets", label: "Jackets & Outerwear", icon: "🧥" },
    { value: "furniture", label: "Furniture", icon: "🛋️" },
    { value: "automotive", label: "Automotive", icon: "🚗" },
  ];

  const handleColorToggle = (color: string) => {
    setPreferences((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !preferences.style) {
      toast({ title: "Please select your style preference", variant: "destructive" });
      return;
    }
    if (step === 2 && preferences.colors.length === 0) {
      toast({ title: "Please select at least one color", variant: "destructive" });
      return;
    }
    if (step < STEPS) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (preferences.categories.length === 0) {
      toast({ title: "Please select at least one category", variant: "destructive" });
      return;
    }

    toast({ title: "Welcome to 28TH HIDE LUXE! 🎉", description: "Your preferences have been saved." });
    navigate("/");
  };

  const progress = (step / STEPS) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Welcome to 28TH HIDE LUXE</h1>
            <p className="text-muted-foreground">Let's personalize your experience</p>
          </div>

          <Progress value={progress} className="mb-8" />

          <Card className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">What's your style?</h2>
                    <p className="text-muted-foreground">Choose the style that resonates with you</p>
                  </div>
                </div>

                <RadioGroup value={preferences.style} onValueChange={(value) => setPreferences({ ...preferences, style: value })}>
                  <div className="grid gap-4">
                    {styles.map((style) => (
                      <Label
                        key={style.value}
                        htmlFor={style.value}
                        className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors"
                      >
                        <RadioGroupItem value={style.value} id={style.value} />
                        <div className="flex-1">
                          <div className="font-semibold">{style.label}</div>
                          <div className="text-sm text-muted-foreground">{style.description}</div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">Favorite Colors</h2>
                    <p className="text-muted-foreground">Select the colors you love (choose at least one)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {colors.map((color) => (
                    <Label
                      key={color.value}
                      htmlFor={color.value}
                      className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors ${
                        preferences.colors.includes(color.value) ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Checkbox
                        id={color.value}
                        checked={preferences.colors.includes(color.value)}
                        onCheckedChange={() => handleColorToggle(color.value)}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="font-medium">{color.label}</span>
                    </Label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold">What interests you?</h2>
                    <p className="text-muted-foreground">Select categories you'd like to explore</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {categories.map((category) => (
                    <Label
                      key={category.value}
                      htmlFor={category.value}
                      className={`flex items-center gap-4 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors ${
                        preferences.categories.includes(category.value) ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Checkbox
                        id={category.value}
                        checked={preferences.categories.includes(category.value)}
                        onCheckedChange={() => handleCategoryToggle(category.value)}
                      />
                      <span className="text-3xl">{category.icon}</span>
                      <span className="font-medium text-lg">{category.label}</span>
                    </Label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button onClick={handleNext}>
                {step === STEPS ? "Complete" : "Next"}
              </Button>
            </div>
          </Card>

          <div className="text-center mt-6">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Skip for now
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Onboarding;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, AlertTriangle, Package, Tag, Loader2 } from "lucide-react";

type VerifyState = "idle" | "loading" | "found" | "not-found";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [serial, setSerial] = useState(searchParams.get("s") || "");
  const [state, setState] = useState<VerifyState>("idle");
  const [product, setProduct] = useState<any>(null);

  // Auto-verify if serial comes from QR/URL
  useEffect(() => {
    const s = searchParams.get("s");
    if (s) handleVerify(s.trim().toUpperCase());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (override?: string) => {
    const trimmed = (override ?? serial).trim().toUpperCase();
    if (!trimmed) return;
    if (!override) setSerial(trimmed);
    setState("loading");
    try {
      const q = query(collection(db, "products"), where("serialNumber", "==", trimmed));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setProduct({ id: snap.docs[0].id, ...snap.docs[0].data() });
        setState("found");
      } else {
        setProduct(null);
        setState("not-found");
      }
    } catch {
      setState("not-found");
    }
  };

  const image = product?.image || product?.images?.[0] || product?.thumbnail || null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 px-4 text-center border-b">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-gray-900">
              Product Verification
            </h1>
            <p className="text-gray-500 text-lg mb-10">
              Enter the serial number found on your product tag to verify its authenticity.
            </p>

            {/* Search */}
            <div className="flex gap-2 max-w-lg mx-auto">
              <Input
                value={serial}
                onChange={(e) => { setSerial(e.target.value); setState("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                placeholder="e.g. HLX-2024-AB3F9K"
                className="h-12 text-base border-gray-300"
              />
              <Button
                onClick={() => handleVerify()}
                disabled={state === "loading" || !serial.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold h-12 px-6"
              >
                {state === "loading"
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Search className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </section>

        {/* Result */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto">

            {/* Authentic */}
            {state === "found" && product && (
              <div className="rounded-2xl border-2 border-green-500 overflow-hidden shadow-xl">
                {/* Green banner */}
                <div className="bg-green-500 text-white px-6 py-4 flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-lg">Authentic Product Verified</p>
                    <p className="text-green-100 text-sm">This product is genuine and certified by 28TH HIDE LUXE</p>
                  </div>
                </div>

                {/* Product info */}
                <div className="p-6 flex gap-6">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="w-32 h-32 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h2>
                    {product.category && (
                      <Badge variant="secondary" className="mb-3 capitalize">{product.category}</Badge>
                    )}
                    {product.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">{product.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {product.serialNumber}
                      </span>
                      {product.serialGeneratedAt && (
                        <span>Registered: {new Date(product.serialGeneratedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer stamp */}
                <div className="bg-gray-50 border-t px-6 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">28TH HIDE LUXE — Luxury. Leather. Legacy.</span>
                  <span className="text-xs font-mono text-gray-400">{product.serialNumber}</span>
                </div>
              </div>
            )}

            {/* Not found */}
            {state === "not-found" && (
              <div className="rounded-2xl border-2 border-red-400 overflow-hidden shadow-lg">
                <div className="bg-red-500 text-white px-6 py-4 flex items-center gap-3">
                  <AlertTriangle className="w-7 h-7 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-lg">Product Not Found</p>
                    <p className="text-red-100 text-sm">This serial number is not in our records. The product may be counterfeit.</p>
                  </div>
                </div>
                <div className="p-6 text-center text-gray-600">
                  <p className="mb-2">Serial number searched: <span className="font-mono font-semibold text-gray-900">{serial.trim().toUpperCase()}</span></p>
                  <p className="text-sm">If you believe this is an error, please <a href="/contact" className="text-yellow-600 underline">contact us</a>.</p>
                </div>
              </div>
            )}

            {/* Idle hint */}
            {state === "idle" && (
              <div className="text-center text-gray-400 py-8">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Enter a serial number above to verify your product</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Verify;

/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext"; // added
import { jsPDF } from "jspdf";

const API_BASE = import.meta.env.VITE_API_URL || "";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { cartItems, clearCart } = useCart(); // use cart items
  const { user } = useAuth(); // get user to read saved address

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          setVerifyError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setVerifyError("Error fetching order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    // if redirected with tx_ref or transaction_id, try server-side verification
    const search = new URLSearchParams(window.location.search);
    const txRef = search.get("tx_ref");
    const transactionId = search.get("transaction_id");

    if ((txRef || transactionId) && !order) {
      (async () => {
        setLoading(true);
        setVerifyError(null);
        try {
          // get last delivery details from localStorage (if user is signed in)
          let deliveryDetails = null;
          try {
            if (user) {
              const raw = localStorage.getItem(
                `lastDeliveryDetails_${user.uid}`
              );
              deliveryDetails = raw ? JSON.parse(raw) : null;
            }
          } catch {
            deliveryDetails = null;
          }

          const res = await fetch(`${API_BASE}/api/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tx_ref: txRef,
              transaction_id: transactionId,
              cartItems: cartItems || [],
              deliveryDetails,
              userId: user?.uid ?? null,
            }),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => "");
            console.error("/api/verify-payment failed", res.status, text);
            // fallback: create a pending order client-side so user can see it
            setVerifyError(`Verification failed (${res.status})`);
            try {
              // if server couldn't verify, check if order was already created earlier
              const existing = await findExistingOrderByTx(
                txRef,
                transactionId,
                user?.uid ?? null
              );
              if (existing) {
                setOrder({ id: existing.id, ...existing.data });
                try {
                  clearCart();
                } catch {}
                setLoading(false);
                return;
              }

              // build payload (same as before)
              const items = Array.isArray(cartItems)
                ? cartItems.map((it: any) => ({
                    id: it.id,
                    name: it.name,
                    price: it.price,
                    quantity: it.quantity,
                    image: it.image || null,
                    category: it.category || null,
                  }))
                : [];

              const totalAmount =
                items.reduce(
                  (s: number, i: any) => s + (i.price || 0) * (i.quantity || 1),
                  0
                ) || null;

              const payload = {
                userId: user?.uid ?? null,
                userEmail: deliveryDetails?.email || user?.email || null,
                items,
                totalAmount,
                deliveryDetails: {
                  ...(deliveryDetails || {}),
                  createdAt: serverTimestamp(),
                },
                status: "pending",
                paymentStatus: "pending",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                txRef: txRef || null,
                paymentDetails: {
                  transactionId: transactionId || null,
                  flwRef: null,
                  amount: totalAmount,
                  status: "pending",
                },
              };

              // If there's no authenticated user: save locally instead of attempting Firestore write
              if (!user || !user.uid) {
                console.warn(
                  "User not authenticated — saving fallback order to localStorage"
                );
                const pending = JSON.parse(
                  localStorage.getItem("pendingOrders") || "[]"
                );
                const localId = `local_${Date.now().toString(36)}`;
                const localEntry = {
                  id: localId,
                  ...payload,
                  savedAt: new Date().toISOString(),
                };
                pending.unshift(localEntry);
                localStorage.setItem(
                  "pendingOrders",
                  JSON.stringify(pending.slice(0, 20))
                );
                setOrder(localEntry);
                // clear cart locally so UX is consistent
                try {
                  clearCart();
                } catch {}
                setVerifyError(
                  "Payment verified but you are not signed in — order saved locally. Sign in to sync to your account."
                );
                setLoading(false);
                return;
              }

              // Authenticated user: attempt Firestore write (may fail if rules / server conditions not met)
              try {
                const orderRef = await addDoc(
                  collection(db, "orders"),
                  payload
                );
                const orderDoc = await getDoc(doc(db, "orders", orderRef.id));
                if (orderDoc.exists()) {
                  const loaded = { id: orderDoc.id, ...orderDoc.data() };
                  setOrder(loaded);
                  try {
                    clearCart();
                  } catch {}
                } else {
                  setVerifyError("Saved order but could not load it");
                }
              } catch (writeErr: any) {
                console.error("Fallback save failed", writeErr);
                // permission problem or other write error — instruct developer / operator
                setVerifyError(
                  writeErr?.code === "permission-denied"
                    ? "Saved locally: Firestore rejected the write (missing permissions). Run the verify API server or adjust Firestore rules for authenticated writes."
                    : "Verification failed and local save unsuccessful (check server / Firestore)."
                );
                // also save locally as last-resort so user can still see receipt
                try {
                  const pending = JSON.parse(
                    localStorage.getItem("pendingOrders") || "[]"
                  );
                  const localId = `local_${Date.now().toString(36)}`;
                  const localEntry = {
                    id: localId,
                    ...payload,
                    savedAt: new Date().toISOString(),
                  };
                  pending.unshift(localEntry);
                  localStorage.setItem(
                    "pendingOrders",
                    JSON.stringify(pending.slice(0, 20))
                  );
                  setOrder(localEntry);
                } catch (e) {
                  console.error("local fallback also failed", e);
                }
              }
            } catch (err) {
              console.error("Fallback save failed", err);
              // likely Firestore rules prevented write (missing permissions)
              setVerifyError(
                "Verification failed and local save unsuccessful (check Firestore rules / server)."
              );
            } finally {
              setLoading(false);
            }
            return;
          }

          const data = await res.json().catch((e) => {
            console.error("Failed to parse verify response", e);
            return null;
          });

          if (data?.orderId) {
            // load the created order to show in UI
            const orderDoc = await getDoc(doc(db, "orders", data.orderId));
            if (orderDoc.exists()) {
              const loaded = { id: orderDoc.id, ...orderDoc.data() };
              setOrder(loaded);
              // clear cart now that order persisted
              try {
                clearCart();
              } catch (e) {
                // ignore if cart context not present
              }
            } else {
              setVerifyError("Order saved but could not be loaded");
            }
          } else {
            console.error("verify-payment returned no orderId", data);
            setVerifyError("Verification did not return an order");
          }
        } catch (err) {
          console.error("verify error", err);
          // network/fetch failed — attempt client-side save fallback
          setVerifyError("Verification error");
          try {
            // fallback client-side save (same as above)
            const items = Array.isArray(cartItems)
              ? cartItems.map((it: any) => ({
                  id: it.id,
                  name: it.name,
                  price: it.price,
                  quantity: it.quantity,
                  image: it.image || null,
                  category: it.category || null,
                }))
              : [];

            const totalAmount =
              items.reduce(
                (s: number, i: any) => s + (i.price || 0) * (i.quantity || 1),
                0
              ) || null;

            let deliveryDetails = null;
            try {
              if (user) {
                const raw = localStorage.getItem(
                  `lastDeliveryDetails_${user.uid}`
                );
                deliveryDetails = raw ? JSON.parse(raw) : null;
              }
            } catch {
              deliveryDetails = null;
            }

            const payload = {
              userId: user?.uid ?? null,
              userEmail: deliveryDetails?.email || user?.email || null,
              items,
              totalAmount,
              deliveryDetails: {
                ...(deliveryDetails || {}),
                createdAt: serverTimestamp(),
              },
              status: "pending",
              paymentStatus: "pending",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              txRef: txRef || null,
              paymentDetails: {
                transactionId: transactionId || null,
                flwRef: null,
                amount: totalAmount,
                status: "pending",
              },
            };

            const orderRef = await addDoc(collection(db, "orders"), payload);
            const orderDoc = await getDoc(doc(db, "orders", orderRef.id));
            if (orderDoc.exists()) {
              const loaded = { id: orderDoc.id, ...orderDoc.data() };
              setOrder(loaded);
              try {
                clearCart();
              } catch {}
            } else {
              setVerifyError("Saved order but could not load it");
            }
          } catch (err2) {
            console.error("Fallback save failed", err2);
            setVerifyError("Verification and local save failed");
          } finally {
            setLoading(false);
          }
        } finally {
          // no-op here; individual branches handle setLoading
        }
      })();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, API_BASE, cartItems, user]);

  const txRef =
    new URLSearchParams(window.location.search).get("tx_ref") ?? undefined;
  const transactionId =
    new URLSearchParams(window.location.search).get("transaction_id") ??
    undefined;

  const downloadReceipt = () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const left = 40;
      let y = 60;

      doc.setFontSize(18);
      doc.text("28th Hide Luxe — Receipt", left, y);
      y += 26;

      doc.setFontSize(11);
      doc.text(`Date: ${new Date().toLocaleString()}`, left, y);
      y += 16;
      doc.text(`Order ID: ${order?.id ?? "—"}`, left, y);
      y += 16;
      doc.text(`tx_ref: ${txRef ?? "—"}`, left, y);
      y += 16;
      doc.text(`transaction_id: ${transactionId ?? "—"}`, left, y);
      y += 20;

      // User info (from auth or deliveryDetails)
      const userName =
        user?.displayName || order?.deliveryDetails?.fullName || "—";
      const userEmail = user?.email || order?.deliveryDetails?.email || "—";
      const userPhone = order?.deliveryDetails?.phoneNumber || "—";
      doc.text(`Customer: ${userName}`, left, y);
      y += 14;
      doc.text(`Email: ${userEmail}`, left, y);
      y += 14;
      doc.text(`Phone: ${userPhone}`, left, y);
      y += 18;

      // Delivery address
      const addr = order?.deliveryDetails;
      if (addr) {
        doc.text("Delivery Address:", left, y);
        y += 14;
        const addrLines = [
          addr.address || "",
          `${addr.city || ""}${addr.state ? ", " + addr.state : ""}`.trim(),
          addr.country || "",
        ].filter(Boolean);
        addrLines.forEach((ln: string) => {
          doc.text(ln, left + 10, y);
          y += 12;
        });
        y += 6;
      }

      // Items table header
      doc.setFontSize(12);
      doc.text("Items", left, y);
      y += 14;
      doc.setFontSize(10);
      const items = order?.items || [];
      if (items.length === 0 && cartItems?.length) {
        // fallback to client cartItems if order has none
        items.push(
          ...cartItems.map((it: any) => ({
            name: it.name,
            quantity: it.quantity,
            price: it.price,
          }))
        );
      }

      items.forEach((it: any, idx: number) => {
        const line = `${it.quantity ?? 1} x ${it.name} — ₦${(
          it.price ?? 0
        ).toLocaleString()}`;
        // page break
        if (y > 740) {
          doc.addPage();
          y = 60;
        }
        doc.text(line, left + 6, y);
        y += 14;
      });

      y += 8;
      const total =
        order?.totalAmount ??
        cartItems?.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
      doc.setFontSize(12);
      doc.text(`Total: ₦${Number(total ?? 0).toLocaleString()}`, left, y);
      y += 20;

      doc.setFontSize(9);
      doc.text(
        "Thank you for your purchase. If you have questions contact support.",
        left,
        y
      );

      const filename = `receipt_${txRef ?? order?.id ?? Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("Failed to create PDF receipt", err);
      // fallback: trigger JSON download
      const fallback = {
        orderId: order?.id ?? null,
        txRef,
        transactionId,
        amount: order?.totalAmount ?? null,
        date: new Date().toISOString(),
        deliveryDetails: order?.deliveryDetails ?? null,
        paymentDetails: order?.paymentDetails ?? null,
      };
      const blob = new Blob([JSON.stringify(fallback, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${txRef ?? order?.id ?? "receipt"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h1 className="font-playfair text-3xl font-bold mb-4">
            {order ? "Order Successful!" : "Payment Received"}
          </h1>

          <p className="text-muted-foreground mb-6">
            {order
              ? "Thank you for your order. We'll send you updates about your delivery."
              : verifyError
              ? `Payment verified but order not found: ${verifyError}`
              : "We received payment. Verifying..."}
          </p>

          <div className="text-left mb-6">
            <h2 className="font-semibold mb-2">Order / Payment Details:</h2>
            <p>Order ID: {order?.id ?? "—"}</p>
            <p>Amount: ₦{order?.totalAmount?.toLocaleString() ?? "—"}</p>
            <p>Status: {order?.status ?? "—"}</p>
            <p>tx_ref: {txRef ?? "—"}</p>
            <p>transaction_id: {transactionId ?? "—"}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={downloadReceipt}>Download Receipt</Button>
            <Button variant="outline" asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
            <Button asChild>
              <Link to="/dashboard">View Order Status</Link>
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;

// helper: try to find existing order by txRef or transaction id
async function findExistingOrderByTx(
  txRef?: string | null,
  transactionId?: string | null,
  userId?: string | null
) {
  try {
    const ordersCol = collection(db, "orders");
    if (txRef) {
      const q = query(ordersCol, where("txRef", "==", txRef));
      const snap = await getDocs(q);
      if (!snap.empty)
        return { id: snap.docs[0].id, data: snap.docs[0].data() };
    }
    if (transactionId) {
      // check paymentDetails.transactionId
      const q2 = query(
        ordersCol,
        where("paymentDetails.transactionId", "==", transactionId)
      );
      const snap2 = await getDocs(q2);
      if (!snap2.empty)
        return { id: snap2.docs[0].id, data: snap2.docs[0].data() };
    }
    // optional: fallback to user + amount + recent window (not implemented)
    return null;
  } catch (e) {
    console.error("findExistingOrderByTx error", e);
    return null;
  }
}

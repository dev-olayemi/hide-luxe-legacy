/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
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
import { db, createNotification } from "@/firebase/firebaseUtils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { jsPDF } from "jspdf";
import { useCurrency } from "@/contexts/CurrencyContext";
import { calculateDeliveryFee, formatDeliveryFee } from "@/config/deliveryConfig";
import { calculateStorePointsValue } from "@/config/storePointsConfig";
import logoPath from "@/assets/logo-full-new.png";
import { addDays, format as formatDateFn } from "date-fns";

const API_BASE = import.meta.env.VITE_API_URL || "";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

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
                  // create notification for the user linking to the order
                  try {
                    await createNotification({
                      userId: user.uid,
                      type: "order",
                      title: "Order Received",
                      message: `Your order ${orderRef.id} was received. Tap to view details.`,
                      actionUrl: `/order-success/${orderRef.id}`,
                      actionLabel: "View Order",
                      read: false,
                      metadata: { orderId: orderRef.id, amount: totalAmount },
                    });
                  } catch (e) {
                    console.warn("Failed to create order notification", e);
                  }
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
              // notify user
              try {
                await createNotification({
                  userId: user.uid,
                  type: "order",
                  title: "Order Received",
                  message: `Your order ${orderRef.id} was received. Tap to view details.`,
                  actionUrl: `/order-success/${orderRef.id}`,
                  actionLabel: "View Order",
                  read: false,
                  metadata: { orderId: orderRef.id, amount: totalAmount },
                });
              } catch (e) {
                console.warn("Failed to create order notification", e);
              }
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

  // compute delivery fee for display/use across the component
  const deliveryFee = useMemo(() => {
    try {
      if (!order) return 0;
      // prefer stored `deliveryFee`, then deliveryDetails.deliveryFee,
      // otherwise recalculate from deliveryDetails.state (for Nigeria)
      const fee = order?.deliveryFee ?? order?.deliveryDetails?.deliveryFee;
      const st = order?.deliveryDetails?.state || order?.deliveryDetails?.region || order?.deliveryDetails?.stateName;
      const country = order?.deliveryDetails?.country || order?.deliveryDetails?.countryName;
      if (
        (fee == null || Number(fee) === 0) &&
        order?.deliveryOption !== 'pickup' &&
        st &&
        country &&
        country.toLowerCase() === "nigeria"
      ) {
        try {
          return calculateDeliveryFee(st, country) || 0;
        } catch (e) {
          return 0;
        }
      }
      return Number(fee || 0);
    } catch (e) {
      return 0;
    }
  }, [order]);

  const downloadReceipt = async () => {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      const left = 40;
      let y = 40;

      // helper to convert image url / local import to dataURL
      const loadImageAsDataUrl = async (src: string) => {
        try {
          const res = await fetch(src);
          const blob = await res.blob();
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn("Could not load image for PDF", src, e);
          return null;
        }
      };

      // Header: logo + business details
      try {
        const logoData = await loadImageAsDataUrl(logoPath as string);
        if (logoData) {
          doc.addImage(logoData, "PNG", left, y, 120, 40);
        }
      } catch (e) {
        console.warn("logo add failed", e);
      }

      doc.setFontSize(14);
      doc.text("28th Hide Luxe", left + 140, y + 16);
      doc.setFontSize(9);
      doc.text("Support: 28hideluxe@gmail.com | +234 903 197 6895", left + 140, y + 50);
      y += 70;

      // Order metadata
      const orderDate = parseOrderDate(order?.createdAt) || new Date();
      const paymentDate = parseOrderDate(order?.paymentDetails?.paidAt) ||
        parseOrderDate(order?.paymentDetails?.createdAt) ||
        new Date();
      const expectedDelivery = addDays(orderDate, 5);

      doc.setFontSize(10);
      doc.text(`Date: ${formatDateFn(orderDate, "PPpp")}`, left, y);
      doc.text(`Order ID: ${order?.id ?? "—"}`, left + 260, y);
      y += 14;
      doc.text(`Payment Date: ${formatDateFn(paymentDate, "PPpp")}`, left, y);
      doc.text(`Expected Delivery: ${formatDateFn(expectedDelivery, "PPP")}`, left + 260, y);
      y += 18;

      doc.text(`tx_ref: ${txRef ?? "—"}`, left, y);
      doc.text(`transaction_id: ${transactionId ?? "—"}`, left + 260, y);
      y += 18;

      // Customer + delivery details
      const userName = user?.displayName || order?.deliveryDetails?.fullName || "—";
      const userEmail = user?.email || order?.deliveryDetails?.email || "—";
      const userPhone = order?.deliveryDetails?.phoneNumber || "—";

      doc.text(`Customer: ${userName}`, left, y);
      doc.text(`Email: ${userEmail}`, left + 260, y);
      y += 14;
      doc.text(`Phone: ${userPhone}`, left, y);
      y += 14;

      const addr = order?.deliveryDetails;
      if (addr) {
        const addrLines = [
          addr.address || "",
          `${addr.city || ""}${addr.state ? ", " + addr.state : ""}`.trim(),
          addr.country || "",
        ].filter(Boolean);
        doc.text("Delivery Address:", left, y);
        y += 12;
        addrLines.forEach((ln: string) => {
          doc.text(ln, left + 8, y);
          y += 12;
        });
        y += 6;
      }

      // Items table
      doc.setFontSize(11);
      doc.text("Items", left, y);
      y += 14;

      const items = Array.isArray(order?.items) && order.items.length > 0
        ? order.items
        : (Array.isArray(cartItems) ? cartItems : []);

      // table headers
      doc.setFontSize(9);
      const colX = { img: left, name: left + 60, qty: left + 330, unit: left + 380, line: left + 460 };
      doc.text("Product", colX.name, y);
      doc.text("Qty", colX.qty, y);
      doc.text("Unit", colX.unit, y);
      doc.text("Total", colX.line, y);
      y += 12;

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        // add page if needed
        if (y > 720) {
          doc.addPage();
          y = 40;
        }

        // image (if present)
        if (it.image) {
          try {
             
            const imgData = await loadImageAsDataUrl(it.image);
            if (imgData) {
              doc.addImage(imgData, "JPEG", colX.img, y - 6, 40, 40);
            }
          } catch (e) {
            // ignore image errors
          }
        }

        doc.text(it.name || "—", colX.name, y + 12);
        doc.text(String(it.quantity ?? 1), colX.qty, y + 12);
        doc.text(formatPrice(Number(it.price ?? 0)), colX.unit, y + 12);
        const lineTotal = (Number(it.price ?? 0) * Number(it.quantity ?? 1)) || 0;
        doc.text(formatPrice(lineTotal), colX.line, y + 12);
        y += 48;
      }

      // totals
      const subtotal = order?.subtotalAmount ?? order?.subtotal ?? order?.items?.reduce?.((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0) ?? 0;
      // use component-level deliveryFee (computed via useMemo)
      const pdfDeliveryFee = Number(deliveryFee || 0);
      const discount = order?.storePointsDiscount ?? calculateStorePointsValue(order?.storePointsRedeemed ?? 0);
      const paid = order?.paymentDetails?.amount ?? order?.totalAmount ?? (subtotal + pdfDeliveryFee - discount);

      doc.setFontSize(11);
      doc.text(`Subtotal: ${formatPrice(Number(subtotal))}`, left + 340, y);
      y += 14;
      doc.text(`Delivery: ${formatPrice(Number(pdfDeliveryFee || 0))}`, left + 340, y);
      y += 14;
      if (discount > 0) {
        doc.text(`Discount: -${formatPrice(Number(discount))}`, left + 340, y);
        y += 14;
      }
      doc.setFontSize(12);
      doc.text(`Total Paid: ${formatPrice(Number(paid))}`, left + 340, y);
      y += 20;

      doc.setFontSize(9);
      doc.text("Thank you for your purchase. If you have questions contact support:", left, y);
      y += 12;
      doc.text("Email: 28hideluxe@gmail.com | Phone: +234 903 197 6895", left, y);

      const filename = `order_${order?.id ?? txRef ?? Date.now()}.pdf`;
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
          <Card className="max-w-4xl w-full mx-auto p-6 text-center">
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
            <h2 className="font-semibold mb-2">Order Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Order ID:</strong> {order?.id ?? "—"}</p>
                <p><strong>Status:</strong> {order?.status ?? "—"}</p>
                <p><strong>tx_ref:</strong> {txRef ?? "—"}</p>
                <p><strong>transaction_id:</strong> {transactionId ?? "—"}</p>
              </div>
              <div>
                <p><strong>Order Date:</strong> {formatDateDisplay(parseOrderDate(order?.createdAt) || new Date())}</p>
                <p><strong>Payment Date:</strong> {formatDateDisplay(parseOrderDate(order?.paymentDetails?.paidAt) || parseOrderDate(order?.paymentDetails?.createdAt) || new Date())}</p>
                <p><strong>Expected Delivery:</strong> {formatDateDisplay(addDays(parseOrderDate(order?.createdAt) || new Date(), 5))}</p>
                <p><strong>Support:</strong> 28hideluxe@gmail.com | +234 903 197 6895</p>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Delivery / Pickup</h3>
            {order?.deliveryOption === 'pickup' || order?.deliveryDetails?.pickup ? (
              <div className="mb-4">
                <p><strong>Pickup:</strong> {order?.deliveryDetails?.address ?? order?.deliveryDetails?.pickupLocation ?? 'Pickup at store'}</p>
                <p><strong>Delivery Fee:</strong> {formatPrice(Number(deliveryFee || 0))}</p>
              </div>
            ) : (
              <div className="mb-4">
                <p><strong>Delivery To:</strong> {order?.deliveryDetails?.fullName || order?.deliveryDetails?.name || order?.deliveryDetails?.firstName || order?.userEmail || '—'}</p>
                <p>{order?.deliveryDetails?.address || order?.deliveryDetails?.street || order?.deliveryDetails?.line1 || ''}</p>
                <p>{order?.deliveryDetails?.city || order?.deliveryDetails?.town || ''} {order?.deliveryDetails?.state ? ', ' + (order.deliveryDetails.state || order.deliveryDetails.stateName) : ''}</p>
                <p><strong>Delivery Fee:</strong> {formatPrice(Number(deliveryFee || 0))}</p>
              </div>
            )}

            <h3 className="font-semibold mb-2">Items</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2">Item</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Unit</th>
                    <th className="py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(order?.items) && order.items.length > 0 ? order.items : []).map((it: any) => (
                    <tr key={it.id ?? it.name} className="border-t">
                      <td className="py-2">
                        <div className="flex items-center gap-3">
                          {it.image ? <img src={it.image} alt={it.name} className="w-12 h-12 object-cover" /> : null}
                          <div>
                            <div className="font-medium">{it.name}</div>
                            {it.category ? <div className="text-xs text-muted-foreground">{it.category}</div> : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-2">{it.quantity ?? 1}</td>
                      <td className="py-2">{formatPrice(Number(it.price ?? 0))}</td>
                      <td className="py-2">{formatPrice(Number((it.price ?? 0) * (it.quantity ?? 1)))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right">
              <p><strong>Subtotal:</strong> {formatPrice(order?.subtotalAmount ?? order?.subtotal ?? order?.items?.reduce?.((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0) ?? 0)}</p>
              <p><strong>Delivery:</strong> {formatPrice(Number(deliveryFee || order?.deliveryFee || order?.deliveryDetails?.deliveryFee || 0))}</p>
              {order?.storePointsRedeemed > 0 && (
                <p className="text-green-600"><strong>Points Discount:</strong> -{formatPrice(order?.storePointsDiscount ?? calculateStorePointsValue(order?.storePointsRedeemed))}</p>
              )}
              <p className="text-lg font-semibold">Total: {formatPrice(order?.totalAmount ?? order?.paymentDetails?.amount ?? 0)}</p>
            </div>
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

// helper: normalize various timestamp shapes (Firestore Timestamp, ISO string, number)
function parseOrderDate(input: any): Date | null {
  if (!input) return null;
  // Firestore Timestamp (has toDate)
  if (typeof input === "object" && typeof input.toDate === "function") {
    try {
      return input.toDate();
    } catch (e) {
      return null;
    }
  }
  // Firestore-like object with seconds
  if (typeof input === "object" && typeof input.seconds === "number") {
    try {
      return new Date(input.seconds * 1000);
    } catch (e) {
      return null;
    }
  }
  // ISO string or numeric
  if (typeof input === "string" || typeof input === "number") {
    const d = new Date(input as any);
    if (!isNaN(d.getTime())) return d;
    return null;
  }
  return null;
}

function formatDateDisplay(d: Date | null) {
  if (!d) return "—";
  try {
    return formatDateFn(d, "PPpp");
  } catch (e) {
    return d.toLocaleString();
  }
}
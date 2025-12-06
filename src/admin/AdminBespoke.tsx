/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getAllBespokeRequests,
  updateBespokeRequest,
} from "@/firebase/firebaseUtils";
import { X, Edit, Save, Trash, Send } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';

const UPLOADCARE_PUB_KEY = import.meta.env.VITE_UPLOADCARE_PUB_KEY as string;
const UPLOADCARE_CDN_BASE = import.meta.env.VITE_UPLOADCARE_CDN_BASE as string;


const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminBespoke: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getAllBespokeRequests();
    setRequests(
      data.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
    );
    setLoading(false);
  };

  const openView = (r: any) => {
    setSelected(r);
    setEditing({ ...r });
    setMainImageIndex(0);
  };
  const closeView = () => {
    setSelected(null);
    setEditing(null);
    setMainImageIndex(0);
  };

  // Upload helper -> Uploadcare base endpoint (keeps same pattern as Bespoke page)
  const uploadFileToCDN = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUB_KEY);
    fd.append("UPLOADCARE_STORE", "auto");
    try {
      const res = await fetch("https://upload.uploadcare.com/base/", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      const fileId = data.file || Object.values(data)[0];
      const filename = file.name ? encodeURIComponent(file.name) : "";
      return filename
        ? `${UPLOADCARE_CDN_BASE}/${fileId}/${filename}`
        : `${UPLOADCARE_CDN_BASE}/${fileId}/`;
    } catch (err) {
      console.error("upload error", err);
      throw err;
    }
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editing) return;
    toast({ title: "Uploading...", description: `${files.length} file(s)` });
    try {
      const urls = await Promise.all(
        Array.from(files).map((f) => uploadFileToCDN(f))
      );
      setEditing({ ...editing, images: [...(editing.images || []), ...urls] });
      toast({
        title: "Uploaded",
        description: `${urls.length} image(s) added`,
      });
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  const addImageUrl = (url: string) => {
    if (!editing || !url) return;
    setEditing({ ...editing, images: [...(editing.images || []), url] });
  };

  const removeImageAt = (idx: number) => {
    if (!editing) return;
    const imgs = [...(editing.images || [])];
    imgs.splice(idx, 1);
    setEditing({ ...editing, images: imgs });
    if (mainImageIndex >= imgs.length)
      setMainImageIndex(Math.max(0, imgs.length - 1));
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      toast({ title: "Saving...", description: "Updating request" });
      const { id, ...payload } = editing;
      await updateBespokeRequest(id, payload);
      toast({ title: "Saved" });
      await load();
      closeView();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Save failed",
        variant: "destructive",
        description: err?.message || "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Bespoke Requests
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {requests.length} total
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => load()}>
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-24">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No bespoke requests yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((r) => (
                <Card key={r.id} className="overflow-hidden">
                  <div className="grid grid-cols-3 gap-0">
                    {/* left: thumbnail stack */}
                    <div className="col-span-1 bg-gradient-to-b from-white to-gray-50 p-3 flex flex-col gap-2 items-center">
                      {r.images && r.images.length > 0 ? (
                        <>
                          <div className="h-36 w-full rounded overflow-hidden mb-2">
                            <img
                              src={r.images[0]}
                              alt="thumb"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-full flex gap-1">
                            {r.images
                              .slice(0, 3)
                              .map((img: string, i: number) => (
                                <div
                                  key={i}
                                  className="h-12 flex-1 rounded overflow-hidden border"
                                >
                                  <img
                                    src={img}
                                    className="w-full h-full object-cover"
                                    alt={`mini-${i}`}
                                  />
                                </div>
                              ))}
                          </div>
                        </>
                      ) : (
                        <div className="h-36 w-full rounded bg-gray-100 flex items-center justify-center text-sm text-muted-foreground">
                          No images
                        </div>
                      )}
                    </div>

                    {/* right: details */}
                    <div className="col-span-2 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            {r.productType || "Custom item"}
                          </CardTitle>
                          <div className="text-sm text-muted-foreground mt-1">
                            {r.category}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              statusColors[r.status] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {r.status || "pending"}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {new Date(
                              r.createdAt || Date.now()
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-muted-foreground line-clamp-4">
                        {r.description}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Budget
                          </div>
                          <div className="font-medium">{r.budget ? formatPrice(Number(r.budget)) : "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Timeline
                          </div>
                          <div className="font-medium">{r.timeline ?? "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Contact
                          </div>
                          <div className="font-medium">
                            {r.contactName ?? r.contactEmail ?? r.userId}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Phone / Email
                          </div>
                          <div className="font-medium">
                            {r.contactPhone ?? r.contactEmail ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => openView(r)}>
                            <Edit className="w-4 h-4 mr-2" /> Manage
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              window.open(`mailto:${r.contactEmail || ""}`)
                            }
                          >
                            <Send className="w-4 h-4 mr-2" /> Email
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          ID: <span className="font-mono">{r.id}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal / panel */}
      {selected && editing && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closeView} />

          <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
            {/* Gallery column */}
            <div className="p-4 bg-gray-50 md:col-span-1 flex flex-col gap-3">
              <div className="h-72 rounded overflow-hidden bg-white flex items-center justify-center border">
                {editing.images && editing.images.length > 0 ? (
                  <img
                    src={editing.images[mainImageIndex]}
                    alt="main"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground">No images</div>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {(editing.images || []).map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setMainImageIndex(i)}
                    className={`h-20 w-20 rounded overflow-hidden border ${
                      i === mainImageIndex ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`thumb-${i}`}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-2">
                <Label>Upload files</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-2"
                  onChange={handleFiles}
                />
                <div className="mt-3 flex gap-2">
                  <Input id="admin-img-url" placeholder="Image URL" />
                  <Button
                    onClick={() => {
                      const el = document.getElementById(
                        "admin-img-url"
                      ) as HTMLInputElement | null;
                      if (!el) return;
                      const v = el.value.trim();
                      if (!v) return;
                      addImageUrl(v);
                      el.value = "";
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // remove all images
                      setEditing({ ...editing, images: [] });
                      setMainImageIndex(0);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Edit / details */}
            <div className="p-6 md:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {editing.productType || "Custom item"}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {editing.category}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      statusColors[editing.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {editing.status}
                  </span>
                  <Button variant="ghost" onClick={closeView}>
                    <X />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Type</Label>
                  <Input
                    value={editing.productType || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, productType: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editing.category || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={4}
                    value={editing.description || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Specifications</Label>
                  <Textarea
                    rows={3}
                    value={editing.specifications || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, specifications: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Budget</Label>
                  <Input
                    value={editing.budget || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, budget: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Timeline</Label>
                  <Input
                    value={editing.timeline || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, timeline: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Contact Name</Label>
                  <Input
                    value={editing.contactName || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, contactName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Contact Email</Label>
                  <Input
                    value={editing.contactEmail || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, contactEmail: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={editing.contactPhone || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, contactPhone: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditing({ ...selected })}
                  >
                    Revert
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" /> Save & Resubmit
                  </Button>
                </div>
              </div>

              <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">
                <div>
                  <strong>Request ID:</strong>{" "}
                  <span className="font-mono">{editing.id}</span>
                </div>
                <div className="mt-1">
                  <strong>Submitted:</strong>{" "}
                  {new Date(editing.createdAt || Date.now()).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBespoke;

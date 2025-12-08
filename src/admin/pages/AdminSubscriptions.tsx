/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Trash2, Copy, Search } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface NewsletterSubscription {
  id?: string;
  email: string;
  subscribedAt: any;
  status?: string;
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subsSnapshot = await getDocs(collection(db, 'newsletterSubscriptions'));
      const subsData = subsSnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setSubscriptions(subsData);
      toast.success(`Loaded ${subsData.length} subscribers`);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    try {
      await deleteDoc(doc(db, 'newsletterSubscriptions', id));
      setSubscriptions((subs) => subs.filter((s) => s.id !== id));
      toast.success('Subscriber removed');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to remove subscriber');
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success('Email copied!');
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your newsletter subscriber list
          </p>
        </div>
        <Button onClick={loadSubscriptions}>Refresh</Button>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{subscriptions.length}</div>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {subscriptions.length}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {filteredSubscriptions.length}
              </div>
              <p className="text-sm text-muted-foreground">Search Results</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Subscribers List */}
      {filteredSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <Mail className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No subscribers found matching your search' : 'No subscribers yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border overflow-hidden bg-background">
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-muted font-semibold text-sm border-b">
              <div className="md:col-span-6">Email</div>
              <div className="md:col-span-3">Subscribed</div>
              <div className="md:col-span-3">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border-b hover:bg-muted/50 transition-colors items-center"
              >
                <div className="md:col-span-6 flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`mailto:${sub.email}`}
                    className="text-blue-600 hover:underline truncate text-sm"
                  >
                    {sub.email}
                  </a>
                </div>

                <div className="md:col-span-3 text-sm text-muted-foreground">
                  {formatDistance(
                    new Date(sub.subscribedAt?.toDate?.() || sub.subscribedAt),
                    new Date(),
                    { addSuffix: true }
                  )}
                </div>

                <div className="md:col-span-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyEmail(sub.email)}
                    className="flex-1 md:flex-none"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(sub.id!, sub.email)}
                    className="flex-1 md:flex-none"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="text-sm text-muted-foreground text-center p-4">
            Showing {filteredSubscriptions.length} of {subscriptions.length} subscribers
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;

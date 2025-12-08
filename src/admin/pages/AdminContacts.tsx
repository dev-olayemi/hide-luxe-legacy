/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import {
  getAllContactSubmissions,
  updateContactSubmission,
  deleteContactSubmission,
  markContactAsReplied,
  type ContactSubmission,
} from '@/firebase/firebaseUtils';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Phone,
  Trash2,
  Eye,
  Reply,
  Search,
  MessageSquare,
  Copy,
} from 'lucide-react';
import { formatDistance } from 'date-fns';

interface NewsletterSubscription {
  id?: string;
  email: string;
  subscribedAt: any;
}

const AdminContacts = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('contacts');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const submissionsData = await getAllContactSubmissions();
        setSubmissions(submissionsData || []);

        const subsSnapshot = await getDocs(collection(db, 'newsletterSubscriptions'));
        const subsData = subsSnapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setSubscriptions(subsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchData = async () => {
    try {
      const submissionsData = await getAllContactSubmissions();
      setSubmissions(submissionsData || []);

      const subsSnapshot = await getDocs(collection(db, 'newsletterSubscriptions'));
      const subsData = subsSnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setSubscriptions(subsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to refresh data');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    try {
      await deleteContactSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      await markContactAsReplied(id, replyText);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: 'replied', adminNotes: replyText } : s
        )
      );
      setReplyText('');
      setIsReplyDialogOpen(false);
      toast.success('Reply saved');
    } catch (error) {
      toast.error('Failed to save reply');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Messages & Subscriptions</h1>
        <Button onClick={fetchData}>Refresh</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contacts">Contacts ({submissions.length})</TabsTrigger>
          <TabsTrigger value="subscriptions">Newsletter ({subscriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold">{submissions.length}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-red-500">
                  {submissions.filter((s) => s.status === 'unread').length}
                </div>
                <p className="text-sm text-muted-foreground">Unread</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {submissions.filter((s) => s.status === 'read').length}
                </div>
                <p className="text-sm text-muted-foreground">Read</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500">
                  {submissions.filter((s) => s.status === 'replied').length}
                </div>
                <p className="text-sm text-muted-foreground">Replied</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  No submissions found
                </CardContent>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{submission.name}</h3>
                          <Badge>{submission.status}</Badge>
                        </div>
                        <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline text-sm">
                          {submission.email}
                        </a>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {submission.message}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{submission.name}</DialogTitle>
                              <DialogDescription>
                                Contact details and message
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div>
                                <Label>Email</Label>
                                <a href={`mailto:${submission.email}`} className="text-blue-600">
                                  {submission.email}
                                </a>
                              </div>
                              <div>
                                <Label>Message</Label>
                                <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Reply
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reply to {submission.name}</DialogTitle>
                              <DialogDescription>
                                Send a response to this contact message
                              </DialogDescription>
                            </DialogHeader>
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                            />
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={() => handleReply(submission.id!)}>
                                Send
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(submission.id!)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{subscriptions.length}</div>
              <p className="text-sm text-muted-foreground">Subscribers</p>
            </CardContent>
          </Card>

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No subscribers yet
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">{sub.email}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(sub.email);
                            toast.success('Copied!');
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (!confirm('Unsubscribe?')) return;
                            try {
                              await deleteDoc(doc(db, 'newsletterSubscriptions', sub.id!));
                              setSubscriptions((s) => s.filter((x) => x.id !== sub.id));
                              toast.success('Removed');
                            } catch (error) {
                              toast.error('Failed to remove');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContacts;

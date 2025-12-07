/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  getAllContactSubmissions,
  updateContactSubmission,
  deleteContactSubmission,
  markContactAsReplied,
  type ContactSubmission,
} from '@/firebase/firebaseUtils';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from 'lucide-react';
import { formatDistance } from 'date-fns';

const AdminContacts = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getAllContactSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to fetch contact submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    try {
      await deleteContactSubmission(id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: 'Success',
        description: 'Contact submission deleted',
      });
    } catch (error) {
      console.error('Failed to delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete submission',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateContactSubmission(id, { status: 'read' });
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'read' } : s))
      );
      toast({
        title: 'Success',
        description: 'Marked as read',
      });
    } catch (error) {
      console.error('Failed to update:', error);
      toast({
        title: 'Error',
        description: 'Failed to update submission',
        variant: 'destructive',
      });
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reply message',
        variant: 'destructive',
      });
      return;
    }

    try {
      await markContactAsReplied(id, replyText);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: 'replied',
                adminNotes: replyText,
                respondedAt: new Date(),
              }
            : s
        )
      );
      setReplyText('');
      setIsReplyDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Reply saved',
      });
    } catch (error) {
      console.error('Failed to reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reply',
        variant: 'destructive',
      });
    }
  };

  const openViewDialog = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (submission.status === 'unread') {
      handleMarkAsRead(submission.id!);
    }
    setIsViewDialogOpen(true);
  };

  const openReplyDialog = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setReplyText(submission.adminNotes || '');
    setIsReplyDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      unread: { variant: 'destructive', label: 'Unread' },
      read: { variant: 'secondary', label: 'Read' },
      replied: { variant: 'default', label: 'Replied' },
    };
    const config = variants[status] || variants.unread;
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold">Contact Submissions</h1>
          <p className="text-muted-foreground">
            Manage customer messages and inquiries
          </p>
        </div>
        <Button variant="outline" onClick={fetchSubmissions}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{submissions.length}</div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">
                {submissions.filter((s) => s.status === 'unread').length}
              </div>
              <p className="text-sm text-muted-foreground">Unread</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {submissions.filter((s) => s.status === 'read').length}
              </div>
              <p className="text-sm text-muted-foreground">Read</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {submissions.filter((s) => s.status === 'replied').length}
              </div>
              <p className="text-sm text-muted-foreground">Replied</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No submissions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card
              key={submission.id}
              className={`overflow-hidden transition-all ${
                submission.status === 'unread' ? 'ring-2 ring-red-300' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Main Info */}
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">{submission.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDistance(
                              new Date(submission.createdAt || new Date()),
                              new Date(),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${submission.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {submission.email}
                        </a>
                      </div>
                      {submission.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={`tel:${submission.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {submission.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {submission.message}
                    </p>

                    {submission.adminNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          Admin Notes:
                        </p>
                        <p className="text-sm text-blue-800">
                          {submission.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-4 flex gap-2 justify-end">
                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewDialog(submission)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Contact Details</DialogTitle>
                        </DialogHeader>
                        {selectedSubmission && (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-xs">From:</Label>
                              <p className="font-semibold">{selectedSubmission.name}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Email:</Label>
                              <a
                                href={`mailto:${selectedSubmission.email}`}
                                className="text-blue-600 hover:underline"
                              >
                                {selectedSubmission.email}
                              </a>
                            </div>
                            {selectedSubmission.phone && (
                              <div>
                                <Label className="text-xs">Phone:</Label>
                                <a
                                  href={`tel:${selectedSubmission.phone}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedSubmission.phone}
                                </a>
                              </div>
                            )}
                            <div>
                              <Label className="text-xs">Message:</Label>
                              <p className="text-sm whitespace-pre-wrap">
                                {selectedSubmission.message}
                              </p>
                            </div>
                            {selectedSubmission.adminNotes && (
                              <div>
                                <Label className="text-xs">Admin Notes:</Label>
                                <p className="text-sm whitespace-pre-wrap">
                                  {selectedSubmission.adminNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReplyDialog(submission)}
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Reply to {submission.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="reply">Your Response</Label>
                            <Textarea
                              id="reply"
                              placeholder="Type your response here..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={6}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setIsReplyDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() =>
                                handleReply(submission.id!)
                              }
                            >
                              Save Reply
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(submission.id!)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContacts;

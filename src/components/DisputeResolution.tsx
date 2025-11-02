import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, MessageSquare, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

type DisputeType = 'payment' | 'behavior' | 'safety' | 'cancellation' | 'other';
type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed';

interface Dispute {
  id: string;
  booking_id: string;
  reported_by: string;
  dispute_type: DisputeType;
  description: string;
  status: DisputeStatus;
  created_at: string;
  resolved_at?: string;
  resolution?: string;
}

export function DisputeResolution({ userId }: { userId: string }) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    bookingId: '',
    disputeType: 'other' as DisputeType,
    description: '',
    evidence: null as File | null
  });

  useEffect(() => {
    loadDisputes();
  }, [userId]);

  const loadDisputes = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('reported_by', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDisputes(data);
    }
  };

  const handleSubmitDispute = async () => {
    if (!supabase) return;
    if (!formData.bookingId || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let evidenceUrl = null;

      // Upload evidence if provided
      if (formData.evidence) {
        const fileName = `${userId}/dispute_${Date.now()}_${formData.evidence.name}`;
        const { error: uploadError } = await supabase.storage
          .from('disputes')
          .upload(fileName, formData.evidence);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('disputes')
            .getPublicUrl(fileName);
          evidenceUrl = publicUrl;
        }
      }

      // Create dispute
      const { error } = await supabase.from('disputes').insert({
        booking_id: formData.bookingId,
        reported_by: userId,
        dispute_type: formData.disputeType,
        description: formData.description,
        evidence_url: evidenceUrl,
        status: 'open'
      });

      if (error) throw error;

      toast.success('Dispute submitted successfully. Our team will review it within 24 hours.');
      setShowForm(false);
      setFormData({ bookingId: '', disputeType: 'other', description: '', evidence: null });
      loadDisputes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit dispute');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Dispute Resolution</h1>
          <p className="text-muted-foreground">Report and track issues with your trips</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'File Dispute'}
        </Button>
      </div>

      {/* Dispute Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>File a Dispute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Booking/Trip ID *</Label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter booking or trip ID"
                value={formData.bookingId}
                onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
              />
            </div>

            <div>
              <Label>Dispute Type *</Label>
              <Select value={formData.disputeType} onValueChange={(value: DisputeType) => setFormData({ ...formData, disputeType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment Issue</SelectItem>
                  <SelectItem value="behavior">Inappropriate Behavior</SelectItem>
                  <SelectItem value="safety">Safety Concern</SelectItem>
                  <SelectItem value="cancellation">Cancellation Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
            </div>

            <div>
              <Label>Evidence (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.files?.[0] || null })}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload screenshots, photos, or documents
                </p>
              </div>
            </div>

            <Button onClick={handleSubmitDispute} className="w-full">
              Submit Dispute
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Disputes List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your Disputes</h2>
        {disputes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No disputes filed yet</p>
            </CardContent>
          </Card>
        ) : (
          disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        dispute.status === 'resolved' ? 'default' :
                        dispute.status === 'investigating' ? 'secondary' :
                        'outline'
                      }>
                        {dispute.status}
                      </Badge>
                      <Badge variant="outline">{dispute.dispute_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Booking ID: {dispute.booking_id}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(dispute.created_at).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-sm mb-4">{dispute.description}</p>

                {dispute.resolution && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="size-4 text-primary" />
                      <p className="text-sm font-medium">Resolution</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
                  </div>
                )}

                {dispute.status === 'open' && (
                  <p className="text-sm text-muted-foreground mt-4">
                    ⏱️ Our team will review this within 24 hours
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Response time: 24-48 hours for most disputes</p>
          <p>• Provide as much detail and evidence as possible</p>
          <p>• You'll receive updates via notifications</p>
          <p>• For urgent safety issues, use the Safety Center</p>
        </CardContent>
      </Card>
    </div>
  );
}

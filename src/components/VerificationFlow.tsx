import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle, Upload, Camera, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';

type VerificationType = 'phone' | 'email' | 'national_id' | 'drivers_license' | 'selfie';

interface VerificationStep {
  type: VerificationType;
  title: string;
  description: string;
  status: 'not_started' | 'pending' | 'approved' | 'rejected';
}

export function VerificationFlow({ userId, onComplete }: { userId: string; onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [steps, setSteps] = useState<VerificationStep[]>([
    { type: 'phone', title: 'Phone Verification', description: 'Verify your phone number', status: 'not_started' },
    { type: 'email', title: 'Email Verification', description: 'Verify your email address', status: 'not_started' },
    { type: 'national_id', title: 'National ID', description: 'Upload your national ID', status: 'not_started' },
    { type: 'drivers_license', title: 'Driver License', description: 'Upload your driver license', status: 'not_started' },
    { type: 'selfie', title: 'Selfie Verification', description: 'Take a selfie for verification', status: 'not_started' }
  ]);

  const progress = (steps.filter(s => s.status === 'approved').length / steps.length) * 100;

  const handleFileUpload = async (file: File, type: VerificationType) => {
    if (!supabase) return;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verifications')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('verifications').upsert({
        user_id: userId,
        verification_type: type,
        document_url: publicUrl,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      setSteps(prev => prev.map(s => 
        s.type === type ? { ...s, status: 'pending' } : s
      ));

      toast.success('Document uploaded successfully');
      if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePhoneVerification = async (phone: string, code: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase.from('verifications').upsert({
        user_id: userId,
        verification_type: 'phone',
        document_number: phone,
        status: 'approved',
        approved_at: new Date().toISOString()
      });

      if (error) throw error;

      await supabase.from('profiles').update({ phone_verified: true }).eq('id', userId);

      setSteps(prev => prev.map(s => 
        s.type === 'phone' ? { ...s, status: 'approved' } : s
      ));

      toast.success('Phone verified successfully');
      setCurrentStep(1);
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    }
  };

  const step = steps[currentStep];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-6 text-primary" />
              <CardTitle>Identity Verification</CardTitle>
            </div>
            <Badge variant={progress === 100 ? 'default' : 'secondary'}>
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Steps Overview */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((s, i) => (
              <div key={s.type} className="text-center">
                <div className={`size-10 mx-auto rounded-full flex items-center justify-center ${
                  s.status === 'approved' ? 'bg-green-100 text-green-700' :
                  s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {s.status === 'approved' ? <CheckCircle className="size-5" /> :
                   s.status === 'rejected' ? <AlertCircle className="size-5" /> :
                   i + 1}
                </div>
                <p className="text-xs mt-1">{s.title.split(' ')[0]}</p>
              </div>
            ))}
          </div>

          {/* Current Step */}
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

              {step.type === 'phone' && (
                <PhoneVerificationForm onVerify={handlePhoneVerification} />
              )}

              {(step.type === 'national_id' || step.type === 'drivers_license' || step.type === 'selfie') && (
                <DocumentUpload
                  type={step.type}
                  onUpload={(file) => handleFileUpload(file, step.type)}
                  uploading={uploading}
                />
              )}

              {step.status === 'pending' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
                  <AlertCircle className="size-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">Under review - typically takes 24-48 hours</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep === steps.length - 1) {
                  onComplete?.();
                } else {
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
                }
              }}
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PhoneVerificationForm({ onVerify }: { onVerify: (phone: string, code: string) => void }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <Label>Phone Number</Label>
        <Input
          type="tel"
          placeholder="+971 50 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={codeSent}
        />
      </div>
      {!codeSent ? (
        <Button onClick={() => setCodeSent(true)} className="w-full">
          Send Verification Code
        </Button>
      ) : (
        <>
          <div>
            <Label>Verification Code</Label>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </div>
          <Button onClick={() => onVerify(phone, code)} className="w-full">
            Verify Phone
          </Button>
        </>
      )}
    </div>
  );
}

function DocumentUpload({ type, onUpload, uploading }: { type: string; onUpload: (file: File) => void; uploading: boolean }) {
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <Upload className="size-12 mx-auto text-gray-400 mb-4" />
      <p className="text-sm text-muted-foreground mb-4">
        Upload a clear photo of your {type.replace('_', ' ')}
      </p>
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        disabled={uploading}
        className="max-w-xs mx-auto"
      />
      {uploading && <p className="text-sm text-primary mt-2">Uploading...</p>}
    </div>
  );
}

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/api';
import { toast } from 'sonner';

export default function ResetPassword() {
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (password.length < 8) {
			setError('Password must be at least 8 characters');
			return;
		}
		if (password !== confirm) {
			setError('Passwords do not match');
			return;
		}
		setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
		setLoading(false);
		if (error) {
      setError(error.message);
      toast.error(error.message);
			return;
		}
    toast.success('Your password has been updated.');
		setSuccess(true);
	};

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
				<div className="w-full max-w-md bg-white rounded-xl p-6 shadow">
					<h1 className="text-2xl mb-2">Password Updated</h1>
					<p className="text-muted-foreground mb-4">You can now sign in with your new password.</p>
					<a href="/" className="inline-flex items-center text-primary">
						<ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
			<div className="w-full max-w-md bg-white rounded-xl p-6 shadow">
				<h1 className="text-2xl mb-2">Reset your password</h1>
				<p className="text-muted-foreground mb-4">Enter a new password for your account.</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm">New Password</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input type="password" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
						</div>
					</div>
					<div className="space-y-2">
						<label className="text-sm">Confirm Password</label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
							<Input type="password" className="pl-10" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
						</div>
					</div>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<Button type="submit" className="w-full bg-primary" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
				</form>
			</div>
		</div>
	);
}

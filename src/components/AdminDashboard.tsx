import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, Car, DollarSign, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTrips: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    todayTrips: 0,
    todayRevenue: 0
  });

  const [verifications, setVerifications] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!supabase) return;

    // Get stats
    const [users, trips, transactions, pendingVerifs] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('trips').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('transactions').select('amount').eq('payment_status', 'completed'),
      supabase.from('verifications').select('*').eq('status', 'pending')
    ]);

    setStats({
      totalUsers: users.count || 0,
      activeTrips: trips.count || 0,
      totalRevenue: transactions.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
      pendingVerifications: pendingVerifs.data?.length || 0,
      todayTrips: 0,
      todayRevenue: 0
    });

    setVerifications(pendingVerifs.data || []);

    // Get safety incidents
    const { data: incidentsData } = await supabase
      .from('safety_incidents')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(10);

    setIncidents(incidentsData || []);
  };

  const handleVerification = async (verificationId: string, approved: boolean) => {
    if (!supabase) return;

    await supabase.from('verifications').update({
      status: approved ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString()
    }).eq('id', verificationId);

    loadDashboardData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1>Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Car className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrips}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED {stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <AlertTriangle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="verifications">
        <TabsList>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="incidents">Safety Incidents</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verifications.map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{verification.verification_type}</p>
                      <p className="text-sm text-muted-foreground">User ID: {verification.user_id}</p>
                      {verification.document_url && (
                        <a href={verification.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary">
                          View Document
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleVerification(verification.id, true)}>
                        <CheckCircle className="size-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleVerification(verification.id, false)}>
                        <XCircle className="size-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {verifications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No pending verifications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Open Safety Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div key={incident.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {incident.severity}
                        </Badge>
                        <p className="font-medium mt-2">{incident.incident_type}</p>
                      </div>
                      <Button size="sm" variant="outline">Investigate</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reported: {new Date(incident.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {incidents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No open incidents</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card>
            <CardHeader>
              <CardTitle>Trip Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Trip management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

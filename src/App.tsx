import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useAuth } from '@/lib/auth';
import { Login } from '@/pages/Login';
import { SignUp } from '@/pages/SignUp';
import { CustomerBooking } from '@/pages/CustomerBooking';
import { MyReservations } from '@/pages/MyReservations';
import { Menu } from '@/pages/Menu';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { MenuUpload } from '@/pages/MenuUpload';
import { Settings } from '@/pages/Settings';
import { LogOut, UtensilsCrossed } from 'lucide-react';

type View = 'booking' | 'reservations' | 'menu' | 'admin' | 'menu-upload' | 'settings';

function App() {
  const { user, loading, logout, isAdmin, isCustomer, refreshUser } = useAuth();
  const [currentView, setCurrentView] = useState<View>(isAdmin ? 'admin' : 'booking');
  const [authKey, setAuthKey] = useState(0);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const handleLoginSuccess = () => {
    setAuthKey((prev) => prev + 1);
    // Refresh auth state from localStorage so `user`, `isAdmin`, and `isCustomer` update
    refreshUser();
    setCurrentView(isAdmin ? 'admin' : 'booking');
  };

  const handleLogout = async () => {
    await logout();
    setAuthKey((prev) => prev + 1);
  };

  const handleBookingSuccess = () => {
    setCurrentView('reservations');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authView === 'login' ? (
          <Login key={authKey} onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={() => setAuthView('signup')} />
        ) : (
          <SignUp onSignUpSuccess={handleLoginSuccess} onSwitchToLogin={() => setAuthView('login')} />
        )}
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6" />
              <h1 className="text-xl font-bold">Restaurant Booking</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.name} ({user.role})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as View)}>
          <TabsList className="mb-6">
            {isCustomer && (
              <>
                <TabsTrigger value="booking">Book a Table</TabsTrigger>
                <TabsTrigger value="reservations">My Reservations</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </>
            )}
            {isAdmin && (
              <>
                <TabsTrigger value="admin">Dashboard</TabsTrigger>
                <TabsTrigger value="menu-upload">Menu Upload</TabsTrigger>
                <TabsTrigger value="menu">View Menu</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </>
            )}
          </TabsList>

          {isCustomer && (
            <>
              <TabsContent value="booking">
                <CustomerBooking onBookingSuccess={handleBookingSuccess} />
              </TabsContent>
              <TabsContent value="reservations">
                <MyReservations />
              </TabsContent>
              <TabsContent value="menu">
                <Menu />
              </TabsContent>
              <TabsContent value="settings">
                <Settings />
              </TabsContent>
            </>
          )}

          {isAdmin && (
            <>
              <TabsContent value="admin">
                <AdminDashboard />
              </TabsContent>
              <TabsContent value="menu-upload">
                <MenuUpload />
              </TabsContent>
              <TabsContent value="menu">
                <Menu />
              </TabsContent>
              <TabsContent value="settings">
                <Settings />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <Toaster />
    </div>
  );
}

export default App;

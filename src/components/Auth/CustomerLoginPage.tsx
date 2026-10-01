import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Flame,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  User,
  Zap,
} from 'lucide-react';
import { INITIAL_CUSTOMERS, useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';

interface CustomerLoginPageProps {
  onSuccess: () => void;
  onNavigatePortal: (portal: 'customer' | 'restaurant' | 'driver' | 'dispatch') => void;
}

export const CustomerLoginPage: React.FC<CustomerLoginPageProps> = ({
  onSuccess,
  onNavigatePortal,
}) => {
  const { loginAsCustomer, signUpCustomer, switchDemoAccount, customers } = useAuth();
  const { setActiveRole } = useDelivery();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regNotes, setRegNotes] = useState('');

  const quickAddresses = [
    { label: 'Financial District', address: '333 Bush Street, Apt 14B, Financial District', notes: 'Call box #1402, leave at door' },
    { label: 'Russian Hill', address: '1420 Hyde Street, Russian Hill', notes: 'Ring bell on left gate' },
    { label: 'Telegraph Hill', address: '550 Union Street, Telegraph Hill', notes: 'Lockbox code 4491' },
    { label: 'SoMa Tech Corridor', address: '680 Folsom Street, Apt 502, SoMa', notes: 'Front desk reception concierge' },
  ];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const success = loginAsCustomer(email, password);
    if (success) {
      setActiveRole('customer');
      onSuccess();
    } else {
      setErrorMessage('Unable to log in with these credentials.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regAddress.trim()) {
      setErrorMessage('Please fill in all required profile fields.');
      return;
    }

    signUpCustomer({
      name: regName.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      address: regAddress.trim(),
      defaultDeliveryNotes: regNotes.trim(),
    });
    setActiveRole('customer');
    onSuccess();
  };

  const handleQuickDemo = (id: string) => {
    switchDemoAccount('customer', id);
    setActiveRole('customer');
    onSuccess();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Portal Category Switcher Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase px-2">
            Select Portal:
          </span>
          <button
            onClick={() => onNavigatePortal('customer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Customer Portal</span>
          </button>
          <button
            onClick={() => onNavigatePortal('restaurant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>Kitchen & KDS</span>
          </button>
          <button
            onClick={() => onNavigatePortal('driver')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>Courier Fleet</span>
          </button>
          <button
            onClick={() => onNavigatePortal('dispatch')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>City Operations</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
          Customer Account & Live Tracking Portal
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Branding, Customer Benefits & Live Tracker Preview */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Velocita Customer Experience</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
                Precision Food Delivery with Live GPS Corridor Tracking
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Order from San Francisco's top artisan kitchens and monitor your courier in real time on high-detail Leaflet maps with dynamic street-level arrival predictions.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <Navigation className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                    Live Telemetry
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time driver speed, distance remaining, and turn-by-turn road corridors.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                    Adaptive 30-Min SLA
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Algorithmic prep batching guarantees kitchen-to-doorstep freshness.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Tag className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                    Exclusive Specials
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant promo codes (PIZZA25, SMASH30, RAMEN20) with one-click discounts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <ShieldCheck className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                    Direct Driver Chat
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Masked phone line & in-app chat for gate codes and doorstep instructions.
                </p>
              </div>
            </div>

            {/* Quick Demo Customer Profiles */}
            <div className="pt-2">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                Quick Demo Customer Profiles (1-Click Login):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {customers.slice(0, 3).map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => handleQuickDemo(cust.id)}
                    className="flex flex-col items-start p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {cust.name}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
                      {cust.email}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-1 truncate w-full">
                      📍 {cust.address.split(',')[1]?.trim() || cust.address.split(',')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Encrypted Session Storage</span>
            <span>San Francisco Metropolitan Service Hub</span>
          </div>
        </div>

        {/* Right Side: Dedicated Customer Login & Registration Form */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          {/* Form Switcher Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 mb-6">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Customer Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Create New Account
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          {mode === 'signin' ? (
            /* Sign In Mode */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sophia@example.com"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                    Demo Mode: Any password works
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Access Customer Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            /* Register Mode */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Jordan Hayes"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (415) 555-0199"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="jordan@example.com"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Delivery Address *
                  </label>
                  <span className="text-[10px] text-slate-400">San Francisco Bay Area</span>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g. 500 Howard Street, Apt 8A"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Quick SF Address Fill */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Presets:</span>
                  {quickAddresses.map((qa, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setRegAddress(qa.address);
                        setRegNotes(qa.notes);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Doorstep / Gate Notes (Optional)
                </label>
                <input
                  type="text"
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder="Gate code #1234, ring buzzer, leave on porch"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                <span>Create Account & Start Ordering</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Quick Switch to Other Portals footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Not a customer?{' '}
            </span>
            <button
              onClick={() => onNavigatePortal('restaurant')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Kitchen Login
            </button>
            <span className="text-slate-300 dark:text-slate-700 mx-2">·</span>
            <button
              onClick={() => onNavigatePortal('driver')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Driver Fleet Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

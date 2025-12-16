import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Crown,
  Diamond,
  Upload,
  Loader2,
  CheckCircle,
  Clock,
  Wallet,
  QrCode,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

const PRICES = {
  premium: 30000,
  vip: 50000,
};

const PAYMENT_METHODS = [
  { id: 'dana', name: 'DANA', number: '083824299082', icon: Wallet },
  { id: 'gopay', name: 'GoPay', number: '083824299082', icon: Wallet },
  { id: 'qris', name: 'QRIS', icon: QrCode },
];

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState<'select' | 'pay' | 'confirm'>('select');
  const [selectedPackage, setSelectedPackage] = useState<'premium' | 'vip' | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Confirmation form
  const [confirmForm, setConfirmForm] = useState({
    name: '',
    email: '',
    package: '',
  });

  useEffect(() => {
    checkUser();
    const pkg = searchParams.get('package');
    if (pkg === 'premium' || pkg === 'vip') {
      setSelectedPackage(pkg);
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setConfirmForm({
        name: data.username || '',
        email: session.user.email || '',
        package: '',
      });
    }
  };

  const handleSelectPackage = (pkg: 'premium' | 'vip') => {
    setSelectedPackage(pkg);
    setConfirmForm(prev => ({ ...prev, package: pkg.toUpperCase() }));
  };

  const handleSelectMethod = (method: string) => {
    setSelectedMethod(method);
    setStep('pay');
  };

  const handleUploadProof = async () => {
    if (!proofFile || !selectedPackage || !selectedMethod || !profile) return;

    setLoading(true);

    // Upload proof image
    const fileExt = proofFile.name.split('.').pop();
    const fileName = `${profile.user_id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('yokoso')
      .upload(`payments/${fileName}`, proofFile);

    if (uploadError) {
      setLoading(false);
      toast({ title: 'Error', description: 'Gagal upload bukti pembayaran', variant: 'destructive' });
      return;
    }

    const { data: urlData } = supabase.storage.from('yokoso').getPublicUrl(`payments/${fileName}`);

    // Create transaction
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: profile.user_id,
        package_type: selectedPackage,
        amount: PRICES[selectedPackage],
        payment_method: selectedMethod,
        proof_url: urlData.publicUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (txError) {
      setLoading(false);
      toast({ title: 'Error', description: txError.message, variant: 'destructive' });
      return;
    }

    setTransactionId(txData.id);
    setLoading(false);
    setStep('confirm');
    toast({ title: 'Berhasil!', description: 'Bukti pembayaran berhasil diupload' });
  };

  const handleSendConfirmation = async () => {
    if (!transactionId || !confirmForm.name || !confirmForm.email) return;

    setLoading(true);

    // Call edge function to send telegram notification
    const { error } = await supabase.functions.invoke('send-telegram', {
      body: {
        type: 'payment_confirmation',
        data: {
          transaction_id: transactionId,
          name: confirmForm.name,
          email: confirmForm.email,
          package: selectedPackage?.toUpperCase(),
          amount: PRICES[selectedPackage!],
          payment_method: selectedMethod,
        },
      },
    });

    if (error) {
      setLoading(false);
      toast({ title: 'Error', description: 'Gagal mengirim konfirmasi', variant: 'destructive' });
      return;
    }

    // Update transaction
    await supabase
      .from('transactions')
      .update({ telegram_notified: true })
      .eq('id', transactionId);

    setLoading(false);
    toast({
      title: 'Konfirmasi Terkirim!',
      description: 'Admin akan segera memproses pembayaran Anda',
    });
    navigate('/dashboard');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="Buy Access" className="text-xl" glitch={false} />
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'select' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
            <div className="h-0.5 w-8 bg-muted" />
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'pay' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
            <div className="h-0.5 w-8 bg-muted" />
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
          </div>
        </div>

        {/* Step 1: Select Package */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-display text-primary text-center mb-6">Pilih Paket</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Premium Package */}
              <button
                onClick={() => handleSelectPackage('premium')}
                className={`cyber-border rounded-lg p-6 text-left transition-all ${selectedPackage === 'premium' ? 'border-purple-500 bg-purple-500/10' : 'bg-card/80'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Diamond className="h-8 w-8 text-purple-400" />
                  <div>
                    <h3 className="font-display text-purple-400">PREMIUM</h3>
                    <p className="text-2xl font-bold text-foreground">{formatPrice(PRICES.premium)}</p>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Akses tools premium</li>
                  <li>• Buat akun member</li>
                  <li>• Kelola user member</li>
                </ul>
              </button>

              {/* VIP Package */}
              <button
                onClick={() => handleSelectPackage('vip')}
                className={`cyber-border rounded-lg p-6 text-left transition-all ${selectedPackage === 'vip' ? 'border-yellow-500 bg-yellow-500/10' : 'bg-card/80'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-8 w-8 text-yellow-400" />
                  <div>
                    <h3 className="font-display text-yellow-400">VIP</h3>
                    <p className="text-2xl font-bold text-foreground">{formatPrice(PRICES.vip)}</p>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Semua akses premium</li>
                  <li>• Akses tools VIP</li>
                  <li>• Broadcast notification</li>
                  <li>• Buat akun premium/member</li>
                </ul>
              </button>
            </div>

            {selectedPackage && (
              <div className="space-y-4">
                <h3 className="text-lg font-display text-primary text-center">Pilih Metode Pembayaran</h3>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleSelectMethod(method.id)}
                      className="cyber-border rounded-lg p-4 bg-card/80 hover:bg-card transition-all text-center"
                    >
                      <method.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <span className="text-sm">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Payment */}
        {step === 'pay' && selectedPackage && selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Button variant="ghost" onClick={() => setStep('select')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>

            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6 text-center">
              <h3 className="text-lg font-display text-primary mb-4">
                Transfer {formatPrice(PRICES[selectedPackage])}
              </h3>

              {selectedMethod === 'qris' ? (
                <div className="space-y-4">
                  <img
                    src="/qris.png"
                    alt="QRIS"
                    className="mx-auto max-w-xs rounded-lg border border-border"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scan QR code di atas untuk pembayaran
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Transfer ke nomor:</p>
                  <p className="text-2xl font-mono text-primary">
                    {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    a.n {selectedMethod.toUpperCase()}
                  </p>
                </div>
              )}
            </div>

            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6">
              <h3 className="text-lg font-display text-primary mb-4">Upload Bukti Transfer</h3>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="bg-input/50"
                />
                {proofFile && (
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {proofFile.name}
                  </p>
                )}
                <Button
                  onClick={handleUploadProof}
                  disabled={!proofFile || loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload & Lanjutkan
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Clock className="h-4 w-4" />
              Status: <span className="text-yellow-400">Menunggu Upload</span>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 text-green-400 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-display">Bukti Berhasil Diupload!</span>
              </div>
              
              <h3 className="text-lg font-display text-primary mb-4">Konfirmasi ke Admin</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Isi form di bawah untuk mengirim konfirmasi ke admin via Telegram
              </p>
              
              <div className="space-y-4">
                <Input
                  placeholder="Nama / Username"
                  value={confirmForm.name}
                  onChange={(e) => setConfirmForm({ ...confirmForm, name: e.target.value })}
                  className="bg-input/50"
                />
                <Input
                  placeholder="Email"
                  value={confirmForm.email}
                  onChange={(e) => setConfirmForm({ ...confirmForm, email: e.target.value })}
                  className="bg-input/50"
                />
                <Input
                  placeholder="Paket yang dibeli"
                  value={selectedPackage?.toUpperCase() || ''}
                  readOnly
                  className="bg-input/50"
                />
                <Button
                  onClick={handleSendConfirmation}
                  disabled={loading || !confirmForm.name || !confirmForm.email}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Kirim Konfirmasi
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Clock className="h-4 w-4" />
              Status: <span className="text-yellow-400">Pending</span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Payment;

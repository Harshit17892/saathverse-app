import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Zap, Clock, IndianRupee, X, CreditCard, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DAILY_LIMIT = 25;

interface ChatLimitState {
  messagesUsed: number;
  bonusMessages: number;
  lastResetAt: string;
  loading: boolean;
}

export const useChatLimit = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ChatLimitState>({
    messagesUsed: 0,
    bonusMessages: 0,
    lastResetAt: new Date().toISOString(),
    loading: true,
  });

  const fetchLimit = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("chat_limits")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setState(s => ({ ...s, loading: false }));
      return;
    }

    if (!data) {
      // Create initial record
      const { data: newRow } = await supabase
        .from("chat_limits")
        .insert({ user_id: user.id, messages_used: 0, bonus_messages: 0 })
        .select()
        .single();
      if (newRow) {
        setState({ messagesUsed: 0, bonusMessages: 0, lastResetAt: newRow.last_reset_at, loading: false });
      } else {
        setState(s => ({ ...s, loading: false }));
      }
      return;
    }

    // Check if 24h have passed since last reset
    const hoursSinceReset = (Date.now() - new Date(data.last_reset_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceReset >= 24) {
      // Reset
      await supabase
        .from("chat_limits")
        .update({ messages_used: 0, last_reset_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      setState({ messagesUsed: 0, bonusMessages: data.bonus_messages, lastResetAt: new Date().toISOString(), loading: false });
    } else {
      setState({
        messagesUsed: data.messages_used,
        bonusMessages: data.bonus_messages,
        lastResetAt: data.last_reset_at,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchLimit();
  }, [user]);

  const remaining = Math.max(0, DAILY_LIMIT - state.messagesUsed + state.bonusMessages);
  const isExhausted = remaining <= 0;

  const resetTimeLeft = () => {
    const resetAt = new Date(state.lastResetAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = resetAt - Date.now();
    if (diff <= 0) return "Resetting...";
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  };

  const incrementUsage = async () => {
    if (!user) return false;
    if (isExhausted) return false;
    await supabase
      .from("chat_limits")
      .update({ messages_used: state.messagesUsed + 1, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    setState(s => ({ ...s, messagesUsed: s.messagesUsed + 1 }));
    return true;
  };

  const addBonusMessages = async () => {
    if (!user) return;
    await supabase
      .from("chat_limits")
      .update({ bonus_messages: state.bonusMessages + 25, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    setState(s => ({ ...s, bonusMessages: s.bonusMessages + 25 }));
  };

  return { ...state, remaining, isExhausted, resetTimeLeft, incrementUsage, addBonusMessages, DAILY_LIMIT };
};

// Payment Modal
export const PaymentModal = ({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Mock payment - simulate Razorpay
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-card border border-border/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {success ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground mt-1">25 messages added to your account</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-bold text-lg text-foreground">Buy More Messages</h3>
                  <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Zap className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-foreground">25 Messages Pack</p>
                      <p className="text-xs text-muted-foreground">Use anytime, no expiry</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-5 w-5 text-foreground" />
                    <span className="text-3xl font-display font-bold text-foreground">10</span>
                    <span className="text-sm text-muted-foreground">/pack</span>
                  </div>
                </div>

                <div className="space-y-2 mb-5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-primary" /> 25 additional messages</div>
                  <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure payment via Razorpay</div>
                  <div className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-primary" /> UPI, Cards, Net Banking accepted</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-display font-bold text-sm shadow-lg shadow-primary/30 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <motion.div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay ₹10
                    </>
                  )}
                </motion.button>
                <p className="text-[10px] text-center text-muted-foreground mt-3">Powered by Razorpay • Mock Payment</p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Banner Component
const ChatLimitBanner = ({ remaining, isExhausted, resetTimeLeft, onBuyMore }: {
  remaining: number;
  isExhausted: boolean;
  resetTimeLeft: string;
  onBuyMore: () => void;
}) => {
  const percentage = (remaining / DAILY_LIMIT) * 100;
  const isLow = remaining <= 5 && remaining > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border px-3 py-2.5 flex items-center justify-between gap-3 ${
        isExhausted
          ? "bg-destructive/10 border-destructive/30"
          : isLow
            ? "bg-amber-500/10 border-amber-500/30"
            : "bg-primary/5 border-primary/20"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
          isExhausted ? "bg-destructive/20" : isLow ? "bg-amber-500/20" : "bg-primary/15"
        }`}>
          <MessageCircle className={`h-4 w-4 ${
            isExhausted ? "text-destructive" : isLow ? "text-amber-500" : "text-primary"
          }`} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {isExhausted ? "Daily limit reached" : `${remaining} messages left`}
            </span>
            {!isExhausted && (
              <div className="h-1.5 w-20 rounded-full bg-secondary/60 overflow-hidden hidden sm:block">
                <motion.div
                  className={`h-full rounded-full ${isLow ? "bg-amber-500" : "bg-primary"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            <span>Resets in {resetTimeLeft}</span>
          </div>
        </div>
      </div>

      {isExhausted && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBuyMore}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20"
        >
          <Zap className="h-3.5 w-3.5" />
          Buy 25 for ₹10
        </motion.button>
      )}
    </motion.div>
  );
};

export default ChatLimitBanner;

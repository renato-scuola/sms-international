'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Phone, Loader2, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Validation schema
const smsSchema = z.object({
  countryCode: z.string()
    .min(1, 'Country code required')
    .max(5, 'Country code too long')
    .regex(/^\+\d{1,4}$/, 'Invalid country code (e.g. +39)'),
  phoneNumber: z.string()
    .min(6, 'Number too short')
    .max(15, 'Number too long')
    .regex(/^\d+$/, 'Only numbers allowed'),
  message: z.string()
    .min(1, 'Message required')
    .max(160, 'Message too long (max 160 characters)'),
});

type SMSFormData = z.infer<typeof smsSchema>;

export default function SMSForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const phoneNumberRef = useRef<HTMLInputElement>(null);

  // Mouse tracking for hover effects
  const updateMousePosition = (e: React.MouseEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    element.style.setProperty('--mouse-x', `${x}%`);
    element.style.setProperty('--mouse-y', `${y}%`);
  };

  // Form initialization
  useEffect(() => {
    console.log('✅ SMS Form initialized');
    
    // Try to get user's IP for logging (optional)
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        console.log('🌍 User IP:', data.ip);
      })
      .catch(() => {
        console.log('🌍 IP detection failed');
      });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm<SMSFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      countryCode: '+39',
      phoneNumber: '',
      message: ''
    }
  });

  const watchedMessage = watch('message');
  const messageLength = watchedMessage?.length || 0;

  // SMS sending function
  const sendSMS = async (data: SMSFormData) => {
    console.log('🚀 Sending SMS:', {
      phone: `${data.countryCode}${data.phoneNumber}`,
      messageLength: data.message.length
    });
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `${data.countryCode}${data.phoneNumber}`,
          message: data.message
        }),
      });

      console.log('📨 Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Result:', result);

      if (result && result.success) {
        console.log('✅ SMS sent successfully!');
        setIsSent(true);
        toast.success('SMS sent successfully!');
        
        setTimeout(() => {
          setIsSent(false);
          reset();
        }, 3000);
      } else {
        throw new Error(result?.error || 'SMS sending failed');
      }
    } catch (error) {
      console.error('❌ SMS Error:', error);
      
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryCodeComplete = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      phoneNumberRef.current?.focus();
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Automatically add + if not present
    if (value && !value.startsWith('+')) {
      value = '+' + value;
    }
    
    // Limit to numbers after +
    value = value.replace(/[^\+\d]/g, '');
    setValue('countryCode', value);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setValue('phoneNumber', value);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValue('message', value);
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        {/* Form Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center mb-3">
            <MessageSquare className="w-8 h-8 text-white mr-2" />
            <h1 className="text-2xl font-bold text-white">International SMS</h1>
          </div>
          <p className="text-gray-300 text-sm">Send SMS to any country for free</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(sendSMS)} className="space-y-4">
          {/* Country Code + Phone Number Row */}
          <div className="flex gap-3">
            {/* Country Code */}
            <motion.div 
              className="relative w-24"
              whileFocus={{ scale: 1.02 }}
            >
              <div className="relative">
                <input
                  {...register('countryCode')}
                  onChange={handleCountryCodeChange}
                  onKeyDown={handleCountryCodeComplete}
                  placeholder="+39"
                  className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 text-center font-mono text-sm focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                />
              </div>
              {errors.countryCode && (
                <p className="text-red-400 text-xs mt-1">{errors.countryCode.message}</p>
              )}
            </motion.div>

            {/* Phone Number */}
            <motion.div 
              className="relative flex-1"
              whileFocus={{ scale: 1.02 }}
            >
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  {...register('phoneNumber')}
                  ref={phoneNumberRef}
                  onChange={handlePhoneNumberChange}
                  placeholder="3755459706"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-400 text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </motion.div>
          </div>

          {/* Message */}
          <motion.div 
            className="relative"
            whileFocus={{ scale: 1.02 }}
          >
            <textarea
              {...register('message')}
              onChange={handleMessageChange}
              placeholder="Type your message here..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {messageLength}/160
            </div>
            {errors.message && (
              <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>
            )}
          </motion.div>

          {/* Send Button */}
          <motion.button
            type="submit"
            disabled={isLoading || isSent}
            className="w-full relative overflow-hidden bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl px-6 py-4 text-white font-medium transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseMove={(e) => updateMousePosition(e, e.currentTarget)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                 style={{
                   background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.1), transparent 50%)`
                 }} 
            />
            
            <div className="relative flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </motion.div>
                ) : isSent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center text-green-400"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Sent!
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send SMS
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </form>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.6,
            duration: 0.8,
            ease: "easeOut"
          }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Free SMS via Textbelt API
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}

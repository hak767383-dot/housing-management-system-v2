import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { User, Lock } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/const';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Page Component
 * 
 * Student login page with form validation and API integration.
 */
export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setGeneralError(null);
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/student/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'فشل تسجيل الدخول';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status-based message
          if (response.status === 401) {
            errorMessage = 'بيانات المستخدم أو كلمة المرور غير صحيحة';
          } else if (response.status === 404) {
            errorMessage = 'هذا الحساب غير موجود';
          } else if (response.status >= 500) {
            errorMessage = 'خطأ في الخادم. حاول لاحقاً';
          }
        }
        
        setGeneralError(errorMessage);
        return;
      }

      // Navigate to home on successful login
      navigate('/');
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_RESET')) {
          setGeneralError('خطأ في الاتصال. تأكد من أن الخادم متصل بالإنترنت');
        } else if (error.message.includes('CORS')) {
          setGeneralError('خطأ في الاتصال بسبب سياسة الأمان. يرجى التواصل مع الدعم الفني');
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('حدث خطأ غير متوقع. حاول مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="مرحباً بعودتك"
      subtitle="سجل دخولك للوصول إلى حسابك والاستمتاع بخدماتنا"
    >
      {/* General Error */}
      {generalError && (
        <div className="mb-6">
          <AlertBox
            type="error"
            title="خطأ في تسجيل الدخول"
            message={generalError}
            onClose={() => setGeneralError(null)}
          />
        </div>
      )}

      {/* Demo Mode Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">📌 نمط العرض التوضيحي:</span> استخدم بيانات الحساب المسجلة مسبقاً
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Username Field */}
        <FormInput
          label="اسم المستخدم"
          placeholder="أدخل اسم المستخدم"
          icon={<User size={20} />}
          error={errors.username?.message}
          required
          {...register('username')}
        />

        {/* Password Field */}
        <FormInput
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={20} />}
          error={errors.password?.message}
          required
          showPasswordToggle
          onPasswordToggle={setShowPassword}
          {...register('password')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
        </Button>
      </form>

      {/* Signup Link */}
      <div className="mt-6 text-center">
        <p className="text-[#619cba] text-sm">
          ليس لديك حساب؟{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[#0d5a7a] font-semibold hover:underline transition-colors"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

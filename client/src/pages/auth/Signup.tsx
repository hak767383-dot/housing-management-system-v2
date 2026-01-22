import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { User, Lock, IdCard } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/const';

// Validation schema - Only required fields for registration
const signupSchema = z.object({
  username: z.string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'اسم المستخدم لا يمكن أن يتجاوز 50 حرف'),
  studentId: z.string().min(1, 'الرقم الجامعي مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Signup Page Component
 * 
 * Student registration page with form validation and API integration.
 */
export default function Signup() {
  const [, navigate] = useLocation();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setGeneralError(null);
      setIsLoading(true);
      
      // Send registration data to Backend
      // Maps form fields to backend RegisterDto schema
      const response = await fetch(`${API_BASE_URL}/student/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userName: data.username,
          password: data.password,
          role: "student",
          studentId: parseInt(data.studentId) || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'فشل التسجيل' }));
        // Display server error message or fallback message
        const errorMessage = errorData.message || errorData.error || 'فشل التسجيل';
        setGeneralError(errorMessage);
        return;
      }

      // Navigate to login on successful registration
      navigate('/login');
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="سجل بياناتك للانضمام إلى منصة المدن الجامعية"
    >
      {/* General Error */}
      {generalError && (
        <div className="mb-6">
          <AlertBox
            type="error"
            title="خطأ في إنشاء الحساب"
            message={generalError}
            onClose={() => setGeneralError(null)}
          />
        </div>
      )}

      {/* Signup Form */}
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

        {/* Student ID Field */}
        <FormInput
          label="الرقم الجامعي (Student ID)"
          type="number"
          placeholder="أدخل الرقم الجامعي"
          icon={<IdCard size={20} />}
          error={errors.studentId?.message}
          required
          {...register('studentId')}
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
          {...register('password')}
        />

        {/* Confirm Password Field */}
        <FormInput
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={20} />}
          error={errors.confirmPassword?.message}
          required
          showPasswordToggle
          {...register('confirmPassword')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-[#619cba] text-sm">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#0d5a7a] font-semibold hover:underline transition-colors"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

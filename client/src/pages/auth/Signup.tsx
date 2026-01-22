import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { AlertCircle } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

/**
 * Signup Page Component
 * 
 * Demo mode: Signup is disabled. Users must use existing credentials.
 * Redirects to login page with information message.
 */
export default function Signup() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to login after a short delay for UX
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthLayout
      title="وضع العرض التوضيحي"
      subtitle="التسجيل معطل حالياً"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <AlertCircle className="h-5 w-5" />
            تم تعطيل التسجيل
          </CardTitle>
          <CardDescription>
            نحن في وضع العرض التوضيحي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
            <p className="text-sm text-yellow-900">
              <span className="font-semibold">📌 نمط العرض:</span>
            </p>
            <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
              <li>التسجيل معطل حالياً</li>
              <li>استخدم بيانات الحساب المسجلة مسبقاً</li>
              <li>سيتم توجيهك إلى صفحة تسجيل الدخول</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              هل لديك بيانات دخول موجودة؟
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              انتقل إلى تسجيل الدخول
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            سيتم التوجيه تلقائياً خلال 3 ثوان...
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

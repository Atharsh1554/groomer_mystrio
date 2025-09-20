import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Scissors, Sparkles, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { auth } from '../utils/supabase/client';
import { User as UserType } from '../types';
import logoImage from 'figma:asset/c797bd506da08fa515a696a1c063bd0b0178a7ef.png';

interface AuthFormProps {
  onAuthSuccess: (user: UserType) => void;
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await auth.signIn(formData.email, formData.password);
        if (error) throw error;
        if (data.session?.access_token) {
          onAuthSuccess(data.user);
        }
      } else {
        const result = await auth.signUp(formData.email, formData.password, formData.name);
        if (result.user) {
          // After signup, automatically sign in
          const { data, error } = await auth.signIn(formData.email, formData.password);
          if (error) throw error;
          if (data.session?.access_token) {
            onAuthSuccess(data.user);
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-20 mb-4 flex items-center justify-center">
              <img 
                src={logoImage} 
                alt="Groomer" 
                className="h-full w-auto object-contain opacity-80"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {isLogin ? 'Welcome back! Sign in to book your appointment.' : 'Create an account to get started.'}
            </p>
          </div>

          {/* Auth Toggle */}
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <Button
              type="button"
              variant={isLogin ? 'default' : 'ghost'}
              className="flex-1 h-9"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={!isLogin ? 'default' : 'ghost'}
              className="flex-1 h-9"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Sign Up
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-purple-600 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-purple-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
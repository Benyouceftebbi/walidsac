"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase-config"

type LoginEvent = React.FormEvent<HTMLFormElement>;

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: LoginEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    console.log("[auth] Login attempt:", { email });
  
    if (!email || !password) {
      setError("Veuillez remplir tous les champs / الرجاء ملء جميع الحقول");
      setLoading(false);
      return;
    }
  
    try {
 const singin= await signInWithEmailAndPassword(auth, email, password);
 console.log(singin.user);
 

      router.push("/dashboard");
    } catch (err: any) {
      console.error("[auth] Login error:", err?.code || err);
      const code = err?.code as string;
  
      // Friendly bilingual errors
      const msg =
        code === "auth/invalid-email"
          ? "Email invalide / بريد إلكتروني غير صالح"
          : code === "auth/user-disabled"
          ? "Compte désactivé / الحساب معطل"
          : code === "auth/user-not-found" || code === "auth/wrong-password"
          ? "Email ou mot de passe incorrect / البريد الإلكتروني أو كلمة المرور غير صحيحة"
          : code === "auth/too-many-requests"
          ? "Trop de tentatives, réessayez plus tard / محاولات كثيرة جدًا، أعد المحاولة لاحقًا"
          : "Erreur de connexion / خطأ في تسجيل الدخول";
  
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-indigo-900">Noest Parcels</CardTitle>
          <CardDescription className="text-base">Connexion / تسجيل الدخول</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email / البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@noest.com"
                className="h-11"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe / كلمة المرور
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="h-11"
                disabled={loading}
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter / دخول"}
            </Button>
            <div className="text-xs text-center text-gray-500 mt-2">Demo: admin@noest.com / admin123</div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

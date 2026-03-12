import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const Auth: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase não está configurado.');
      return;
    }
    
    setError(null);
    setMessage(null);
    setLoading(true);

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            email: email, // Enviando o e-mail também nos metadados
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Cadastro realizado! Se o login automático falhar, verifique se o e-mail de confirmação é necessário.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError('E-mail ou senha incorretos.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isRegistering ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-slate-500 mt-2">
            {isRegistering 
              ? 'Junte-se a nós hoje mesmo' 
              : 'Acesse sua conta segura'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded animate-pulse">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">
                Nome Completo
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Ex: João Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">
              E-mail
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wider">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processando...' : isRegistering ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setMessage(null);
            }}
            className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm transition-colors"
          >
            {isRegistering 
              ? 'Já tem uma conta? Entre aqui' 
              : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

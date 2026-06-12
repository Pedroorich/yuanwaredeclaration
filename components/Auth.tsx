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

      // ======= VALIDAÇÃO DE COMPRA DA CAKTO =======
      const { data: isPurchased, error: checkError } = await supabase.rpc('check_email_purchased', { user_email: email });
      
      if (checkError) {
        console.error('Erro na verificação:', checkError);
        setError('Erro ao verificar autorização no banco de dados. Tente novamente.');
        setLoading(false);
        return;
      }

      if (!isPurchased) {
        setError('Conta não autorizada. Por favor, crie a conta utilizando o EXATO MESMO E-MAIL que você usou para comprar o acesso no gateway.');
        setLoading(false);
        return;
      }
      // ===========================================

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
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 border border-slate-200/80">
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/10 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {isRegistering ? 'Criar Conta' : 'Acesse o Yuanware'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            {isRegistering 
              ? 'Inscreva-se com o mesmo e-mail da sua compra' 
              : 'Faça login na plataforma de declaração'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
                placeholder="Ex: João Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegistering && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-sm text-slate-700 placeholder-slate-400"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md shadow-slate-950/10 transition-all active:scale-[0.98] disabled:opacity-50 text-sm mt-2"
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
            className="text-indigo-650 hover:text-indigo-800 font-semibold text-xs transition-colors"
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

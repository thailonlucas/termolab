import React, { useState } from 'react';
import { BRAND, TOP, BOT, VESTRA_LOGO } from '../constants';
import { Field, PrimaryBtn, GhostBtn } from './shared';
import { supabase } from '../lib/supabase';

type View = 'signin' | 'signup' | 'forgot';

export function Login() {
  const [view, setView]       = useState<View>('signin');
  const [email, setEmail]     = useState('');
  const [pwd, setPwd]         = useState('');
  const [pwdConf, setPwdConf] = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const reset = (v: View) => {
    setView(v);
    setError('');
    setSuccess('');
  };

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) setError(error.message);
  };

  const handleSignUp = async () => {
    setError('');
    if (pwd !== pwdConf) { setError('As senhas não coincidem.'); return; }
    if (pwd.length < 6)  { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
  };

  const handleForgot = async () => {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess('Link enviado! Verifique sua caixa de entrada.');
  };

  return (
    <div style={{
      flex: 1, padding: `${TOP} 24px ${BOT}`,
      display: 'flex', flexDirection: 'column', background: BRAND.bg, overflow: 'auto',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <img src={VESTRA_LOGO} alt="Vestra" style={{ height: 120, width: 'auto' }} />
      </div>

      {/* Heading */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <h1 style={{
          margin: 0, fontWeight: 600, fontSize: 40,
          letterSpacing: -1.2, lineHeight: 0.98, color: BRAND.ink,
        }}>
          TermoLab{' '}
          <span style={{ fontWeight: 300, fontStyle: 'italic', color: BRAND.ink2 }}>Track</span>
        </h1>
        <p style={{
          fontSize: 13, color: BRAND.ink3, marginTop: 14, lineHeight: 1.5,
          maxWidth: 280, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {view === 'signin' && 'Manuseio rastreável de cargas refrigeradas, do primeiro lacre ao canhoto.'}
          {view === 'signup' && 'Crie sua conta para começar a rastrear manuseios.'}
          {view === 'forgot' && 'Informe seu e-mail e enviaremos um link para redefinir sua senha.'}
        </p>
      </div>

      {/* Fields */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {view === 'signup' && (
          <Field label="Nome completo" value={name} onChange={setName} placeholder="Ana Coutinho" />
        )}
        <Field label="E-mail" value={email} onChange={setEmail} placeholder="seu@email.com" />
        {view !== 'forgot' && (
          <Field label="Senha" value={pwd} onChange={setPwd} secure placeholder="••••••••" />
        )}
        {view === 'signup' && (
          <Field label="Confirmar senha" value={pwdConf} onChange={setPwdConf} secure placeholder="••••••••" />
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div style={{
          marginTop: 14, padding: '10px 14px', borderRadius: 10,
          background: 'oklch(0.95 0.05 25)', color: 'oklch(0.45 0.18 25)',
          fontSize: 13, lineHeight: 1.4,
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          marginTop: 14, padding: '10px 14px', borderRadius: 10,
          background: 'oklch(0.95 0.08 165)', color: 'oklch(0.40 0.14 165)',
          fontSize: 13, lineHeight: 1.4,
        }}>
          {success}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {view === 'signin' && (
          <>
            <PrimaryBtn onClick={handleSignIn} disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </PrimaryBtn>
            <GhostBtn onClick={() => reset('signup')}>Criar conta</GhostBtn>
            <button
              onClick={() => reset('forgot')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'center', fontSize: 13, color: BRAND.ink3, padding: '4px 0',
              }}
            >
              Esqueceu a senha?
            </button>
          </>
        )}

        {view === 'signup' && (
          <>
            <PrimaryBtn onClick={handleSignUp} disabled={loading}>
              {loading ? 'Criando conta…' : 'Criar conta'}
            </PrimaryBtn>
            <GhostBtn onClick={() => reset('signin')}>Já tenho conta</GhostBtn>
          </>
        )}

        {view === 'forgot' && (
          <>
            <PrimaryBtn onClick={handleForgot} disabled={loading || !!success}>
              {loading ? 'Enviando…' : 'Enviar link de recuperação'}
            </PrimaryBtn>
            <GhostBtn onClick={() => reset('signin')}>Voltar para o login</GhostBtn>
          </>
        )}
      </div>
    </div>
  );
}

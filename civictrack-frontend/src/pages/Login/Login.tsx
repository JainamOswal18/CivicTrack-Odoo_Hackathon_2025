import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

type Form = { email:string; password:string; };

const Login: React.FC = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState:{ errors } } = useForm<Form>();
  const [apiError, setApiError] = useState('');
  const nav = useNavigate();
  const from = (useLocation().state as any)?.from?.pathname || '/dashboard';

  const onSubmit = async (data: Form) => {
    try {
      await login(data.email, data.password);
      nav(from, { replace: true });
    } catch (e:any) {
      setApiError(e.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register('email',{ required:'Required' })} error={errors.email?.message}/>
          <Input label="Password" type="password" {...register('password',{ required:'Required' })} error={errors.password?.message}/>
          {apiError && <p style={{ color:'#e53e3e' }}>{apiError}</p>}
          <Button variant="primary" type="submit">Login</Button>
        </form>
        <p style={{ marginTop:'1rem' }}>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;

// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useAuth } from '../../context/AuthContext';
// import { Input } from '../../components/common/Input';
// import { Button } from '../../components/common/Button';
// import styles from './Register.module.css';
// import { useNavigate, Link } from 'react-router-dom';

// type Form = { email:string; username:string; password:string; number : string;};

// const Register: React.FC = () => {
//   const { register: signup } = useAuth();
//   const { register, handleSubmit, formState:{ errors } } = useForm<Form>();
//   const [apiError, setApiError] = useState('');
//   const nav = useNavigate();

//   const onSubmit = async (data: Form) => {
//     try {
//       await signup(data.email, data.password, data.username, data.number);
//       nav('/dashboard');
//     } catch (e:any) {
//       setApiError(e.message);
//     }
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.card}>
//         <h2 className={styles.title}>Register</h2>
//         <form onSubmit={handleSubmit(onSubmit)}>
          
          
//           <Input label="Username" {...register('username',{ required:'Required' })} error={errors.username?.message}/>
//           <Input label="Email" type="email" {...register('email',{ required:'Required' })} error={errors.email?.message}/>
//           <Input label="Phone" type="number" {...register('number',{ required:'Required' })} error={errors.email?.message}/>
//           <Input label="Password" type="password" {...register('password',{ required:'Required', minLength:{value:6,message:'Min 6 chars'} })} error={errors.password?.message}/>
//           {apiError && <p style={{ color:'#e53e3e' }}>{apiError}</p>}
//           <Button variant="primary" type="submit">Sign Up</Button>
//         </form>
//         <p style={{ marginTop:'1rem' }}>Have an account? <Link to="/login">Login</Link></p>
//       </div>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

type Form = {
  email: string;
  username: string;
  password: string;
  number: string;  // You already added this correctly
};

const Register: React.FC = () => {
  const { register: signup } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Form>();
  const [apiError, setApiError] = useState('');
  const nav = useNavigate();

  const onSubmit = async (data: Form) => {
    try {
      await signup(data.email, data.password, data.username, data.number);
      nav('/dashboard');
    } catch (e: any) {
      setApiError(e.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Username"
            {...register('username', { required: 'Required' })}
            error={errors.username?.message}
          />
          <Input
            label="Email"
            type="email"
            {...register('email', { required: 'Required' })}
            error={errors.email?.message}
          />
          <Input
            label="Phone"
            type="number"
            {...register('number', {
              required: 'Required',
              minLength: { value: 10, message: 'Enter a valid phone number' },
              maxLength: { value: 10, message: 'Enter a valid phone number' },
            })}
            error={errors.number?.message} // 🔧 Corrected this line
          />
          <Input
            label="Password"
            type="password"
            {...register('password', {
              required: 'Required',
              minLength: { value: 6, message: 'Min 6 chars' }
            })}
            error={errors.password?.message}
          />
          {apiError && <p style={{ color: '#e53e3e' }}>{apiError}</p>}
          <Button variant="primary" type="submit">
            Sign Up
          </Button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


import styles from './page.module.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

async function loginAction(formData: FormData) {
  'use server'
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  const admin = await prisma.adminUser.findUnique({
    where: { email: email }
  });

  if (admin && admin.password === password) {
    (await cookies()).set('casa_admin_auth', 'authenticated', { 
      path: '/', 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 * 7 
    });
    redirect('/admin');
  }
}

export default function LoginPage() {
  return (
    <div className={styles.loginContainer}>
      <form action={loginAction} className={styles.loginForm}>
        <div className={styles.brand}>Casa Judah</div>
        <h1 className={styles.title}>Admin Panel</h1>
        
        <input 
          type="text" 
          name="email" 
          placeholder="Usuario" 
          required 
          defaultValue="admin"
          className={styles.input}
        />

        <input 
          type="password" 
          name="password" 
          placeholder="Contraseña" 
          required 
          className={styles.input}
        />
        
        <button type="submit" className={styles.submitBtn}>
          Enter
        </button>
      </form>
    </div>
  );
}

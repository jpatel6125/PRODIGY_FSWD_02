import { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4 box-border">
      <div className="bg-card-bg rounded-custom w-full max-w-[500px] p-8 shadow-custom border border-white/10 my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-2 font-bold text-text-primary">
            Employee Management
          </h1>
          <p className="text-text-secondary">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>
        
        <div className="flex bg-input-bg rounded-md relative mb-8 p-1">
          <button 
            className={`flex-1 border-none p-3 z-[2] transition-colors duration-200 ${isLogin ? 'text-text-primary bg-accent-primary' : 'text-text-secondary bg-transparent'} font-medium rounded-md`}
            onClick={() => setIsLogin(true)}
            type="button"
          >
            Login
          </button>
          <button 
            className={`flex-1 border-none p-3 z-[2] transition-colors duration-200 ${!isLogin ? 'text-text-primary bg-accent-primary' : 'text-text-secondary bg-transparent'} font-medium rounded-md`}
            onClick={() => setIsLogin(false)}
            type="button"
          >
            Register
          </button>
        </div>
        
        <div className="relative w-full">
          {isLogin ? <Login /> : <Register setIsLogin={setIsLogin} />}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

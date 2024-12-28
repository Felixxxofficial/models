import { LoginButton } from "@/components/LoginButton";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-pink-600">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <img 
            src="/em-purple2.webp" 
            alt="Elite Models Logo" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
        
        <LoginButton />
      </div>
    </div>
  );
} 
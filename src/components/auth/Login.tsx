import React from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "../AuthModal";

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f2fcf9] flex items-center justify-center p-4">
      <AuthModal isOpen={true} onClose={() => navigate("/")} />
    </div>
  );
};

export default Login;

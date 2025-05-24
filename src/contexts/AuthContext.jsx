import React, { createContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('videoUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('videoUser');
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('videoTrackerUsers') || '[]');
          const existingUser = users.find(u => u.email === email);

          if (existingUser && existingUser.password === password) {
            const userData = { email: existingUser.email, id: existingUser.id, name: existingUser.name };
            localStorage.setItem('videoUser', JSON.stringify(userData));
            setUser(userData);
            toast({ title: "Login Successful", description: `Welcome back, ${userData.name || userData.email}!` });
            setLoading(false);
            resolve(userData);
          } else {
            toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
            setLoading(false);
            reject(new Error("Invalid credentials"));
          }
        } catch (error) {
          console.error("Login error:", error);
          toast({ variant: "destructive", title: "Login Error", description: "An unexpected error occurred." });
          setLoading(false);
          reject(error);
        }
      }, 500);
    });
  };

  const register = (name, email, password) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let users = JSON.parse(localStorage.getItem('videoTrackerUsers') || '[]');
          if (users.find(u => u.email === email)) {
            toast({ variant: "destructive", title: "Registration Failed", description: "Email already exists." });
            setLoading(false);
            reject(new Error("Email already exists"));
            return;
          }
          const newUser = { id: Date.now().toString(), name, email, password };
          users.push(newUser);
          localStorage.setItem('videoTrackerUsers', JSON.stringify(users));
          
          const userData = { email: newUser.email, id: newUser.id, name: newUser.name };
          localStorage.setItem('videoUser', JSON.stringify(userData));
          setUser(userData);
          toast({ title: "Registration Successful", description: `Welcome, ${name}!` });
          setLoading(false);
          resolve(userData);
        } catch (error) {
          console.error("Registration error:", error);
          toast({ variant: "destructive", title: "Registration Error", description: "An unexpected error occurred." });
          setLoading(false);
          reject(error);
        }
      }, 500);
    });
  };

  const logout = () => {
    localStorage.removeItem('videoUser');
    setUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
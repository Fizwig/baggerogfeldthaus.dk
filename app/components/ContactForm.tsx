'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: data.name,
          from_email: data.email,
          message: data.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      setSubmitStatus('success');
      reset();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={`max-w-md mx-auto transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <div className="mb-6 relative">
        <label 
          htmlFor="name" 
          className="block text-gray-700 mb-2 text-lg font-medium transition-all duration-300"
        >
          Navn
        </label>
        <input
          {...register('name', { required: 'Navn er påkrævet' })}
          type="text"
          className="w-full px-5 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white bg-opacity-70 shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Indtast dit navn"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1 absolute -bottom-5 left-0">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="mb-6 relative">
        <label 
          htmlFor="email" 
          className="block text-gray-700 mb-2 text-lg font-medium transition-all duration-300"
        >
          Email
        </label>
        <input
          {...register('email', {
            required: 'Email er påkrævet',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Ugyldig email adresse'
            }
          })}
          type="email"
          className="w-full px-5 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white bg-opacity-70 shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Indtast din email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1 absolute -bottom-5 left-0">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="mb-6 relative">
        <label 
          htmlFor="message" 
          className="block text-gray-700 mb-2 text-lg font-medium transition-all duration-300"
        >
          Besked
        </label>
        <textarea
          {...register('message', { required: 'Besked er påkrævet' })}
          rows={4}
          className="w-full px-5 py-3 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white bg-opacity-70 shadow-sm transition-all duration-300 hover:shadow-md resize-none"
          placeholder="Hvad vil du gerne fortælle os?"
        />
        {errors.message && (
          <p className="text-red-500 text-sm mt-1 absolute -bottom-5 left-0">
            {errors.message.message}
          </p>
        )}
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:-translate-y-1 active:shadow-neumorphic-pressed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sender...
            </span>
          ) : (
            'Send Besked'
          )}
        </button>
      </div>

      {submitStatus === 'success' && (
        <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg text-green-700 animate-pulse">
          <p className="font-medium">Tak for din besked!</p>
          <p>Vi vender tilbage hurtigst muligt.</p>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 rounded-lg text-red-700">
          <p className="font-medium">Der opstod en fejl.</p>
          <p>Prøv venligst igen senere eller kontakt os direkte på email.</p>
        </div>
      )}
    </form>
  );
} 
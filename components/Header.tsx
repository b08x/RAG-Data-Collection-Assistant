
import React from 'react';
import { BotMessageSquareIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="text-center border-b border-slate-200 dark:border-slate-700 pb-6">
      <div className="flex items-center justify-center gap-3">
        <BotMessageSquareIcon className="w-8 h-8 text-blue-500"/>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          RAG Data Collection Assistant
        </h1>
      </div>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
        An interactive guide to streamline data gathering for the Radiology IT Support Generative AI Tool.
      </p>
    </header>
  );
};

export default Header;

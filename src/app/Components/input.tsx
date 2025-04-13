"use client";

import React, { useState } from 'react';

interface InputProps {
    type?: string;
    placeholder?: string;
    name?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

function Input({ 
    type = 'text', 
    placeholder = '', 
    name = '', 
    value,
    onChange,
    required,
    disabled,
    className = '',
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full px-4 py-3 rounded-lg text-sm text-text bg-primary border ${
                isFocused ? 'border-accent shadow-input' : 'border-border'
            } focus:outline-none transition-all duration-200 ${className}`}
        />
    );
}

export default Input;

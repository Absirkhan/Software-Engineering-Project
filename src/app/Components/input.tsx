
"use client";

import React, { useState } from 'react';
import { colors, shadows } from './colors';

interface InputProps {
    type?: string;
    placeholder?: string;
    style?: React.CSSProperties;
    name?: string;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
}

function Input({ 
    type = 'text', 
    placeholder = '', 
    name = '', 
    style,
    className,
    value,
    onChange,
    required,
    disabled
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <input
            type={type}
            className={className}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
                border: `1px solid ${isFocused ? colors.accent : colors.border}`,
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '15px',
                color: colors.text,
                transition: 'all 0.2s ease',
                boxShadow: isFocused ? shadows.input : 'none',
                outline: 'none',
                backgroundColor: colors.primary,
                width: '100%',
                ...style,
            }}
        />
    );
}

export default Input;

import React from 'react';

interface InputProps {
    type?: string; // Optional
    placeholder?: string; // Optional
    style?: React.CSSProperties;
    name?: string;
    className?: string;
}

function Input({ type = 'text', placeholder = '', name='', style,className }: InputProps) {
    return <input type={type} className={className} name={name} placeholder={placeholder} style={style} />;
}

export default Input;

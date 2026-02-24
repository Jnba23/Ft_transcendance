import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "context/AuthContext";
import { userAPI } from "api/user.api";
import { twoFaAPI } from "api/2fa.api";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";

function AlertBox({
    message,
    type,
    onClose,
}: {
    message: string,
    type: 'success' | 'error',
    onClose: () => void;
}) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose])

    const colors = type === 'success'
        ? 'bg-green-500/10 border-green-500/30 text-green-400'
        : 'bg-red-500/10 border-red-500/30 text-red-400';

    return (
        <div 
            role="alert"
            className={`${colors} border rounded-lg px-4 py-3 text-sm flex items-center justify-between`}
        >
            <span>{message}</span>
            <button
              onClick={onClose}
              className="ml-4 hover:opacity-70"
              aria-label="Close alert"
            >
                ✕
            </button>
        </div>
    )
}

function Settings() {
    return (
        <div>Settings</div>
    )
}

export default Settings;
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { userAPI, MyProfileRes } from "api/user.api";
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
    const { user, checkAuth } = useAuth();

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Back link */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    to='/dashboard'
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                    ← Back to Dashboard
                </Link>
            </div>

            <div>
                {/* -- Section 1: Profile -- */}
                <ProfileSction user={user!} onSaved={checkAuth} />
            </div>
        </div>
    )
}

export default Settings;

function ProfileSction({
    user,
    onSaved,
}: {
    user: MyProfileRes,
    onSaved: () => Promise<void>;
}) {
    const [username, setUsername] = useState(user.username);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);
    
    useEffect(() => {
        if (user.username)
            setUsername(user.username);
    }, [user.username]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const getErrorMessage = (error: unknown): string => {
        if (error instanceof AxiosError && error.response?.data?.message) {
            return error.response.data.message;
        }
        return 'Something went wrong. Please try again.';
    }

    return (
        <div></div>
    )
}

// function SecuritySection({
//     is2faEnabled,
//     onChanged,
// }: {
//     is2faEnabled: boolean;
//     onChanged: () => Promise<void>;
// }) {
//     return (
//         <div></div>
//     )
// }
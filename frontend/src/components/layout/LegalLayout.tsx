import { Outlet } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';

function LegalLayout() {
    const { isLoading } = useAuth();

    // While determining auth state, show a blank dark screen
    if (isLoading) {
        return <div className="min-h-screen bg-[#101622]"></div>;
    }

    // Pure public layout
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#101622] p-4 font-sans text-[#EFEFEF] overflow-y-auto">
            <Outlet />
        </div>
    );
}

export default LegalLayout;

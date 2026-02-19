import Avatar from '@ui/Avatar';
import boy from '@assets/boy.jpg';
import { useAuth } from '@context/AuthContext';

type UserMenuBtnProps = {
  isOpen: boolean;
  onClick: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
};

function UserMenuBtn({ isOpen, onClick: toggle, buttonRef }: UserMenuBtnProps) {
  const { user }= useAuth();
 
  return (
    <button
      className={[
        'flex items-center gap-3',
        'bg-[#16213E]/50 rounded-full',
        'border border-white/10',
        'p-1 pr-4 hover:bg-white/10',
        'transition-[background-color]',
      ].join(' ')}
      onClick={toggle}
      ref={buttonRef}
    >
      <Avatar path={boy} section="userMenu" />
      <div className="flex items-center gap-1">
        <span className="text-white text-sm font-medium">
          {user?.username}
        </span>
        <span
          className={[
            `${isOpen && 'rotate-180'}`,
            'material-symbols-outlined',
            'text-white/70',
            'transition-transform',
          ].join(' ')}
        >
          expand_more
        </span>
      </div>
    </button>
  );
}

export default UserMenuBtn;

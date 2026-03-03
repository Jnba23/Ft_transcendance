import { useParams } from 'react-router';
import ProfileBadge from './ProfileBadge/ProfileBadge';
import FriendsBtn from './Friends/FriendsBtn';
import Friends from './Friends/Friends';
import { useRef } from 'react';

function Profile() {
  const { id } = useParams();
  const friendsBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={[
        'bg-[#16213E]/50 flex justify-between p-6',
        'gap-6 items-center border border-white/10',
        'rounded-xl',
      ].join(' ')}
    >
      <ProfileBadge />
      <div className="relative">
        <FriendsBtn btnRef={friendsBtnRef} userId={parseInt(id!)} />
        <Friends btnRef={friendsBtnRef} />
      </div>
    </div>
  );
}

export default Profile;

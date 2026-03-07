import ProfileBadge from '../ProfileBadge/ProfileBadge';
import FriendsBtn from '../Friends/FriendsBtn';
import Friends from '../Friends/Friends';
import { useRef } from 'react';
import { UserStats } from 'types/userStats';

type ProfileBannerProps = {
  userId: number;
  stats: UserStats;
};

function ProfileBanner({ userId, stats }: ProfileBannerProps) {
  const friendsBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={[
        'bg-[#16213E]/50 flex md:justify-between p-6',
        'gap-6 items-center border border-white/10',
        'rounded-xl flex-col md:flex-row',
      ].join(' ')}
    >
      <ProfileBadge {...stats} userId={userId} />
      <div className="relative">
        <FriendsBtn
          btnRef={friendsBtnRef}
          userId={userId}
          username={stats.username}
        />
        <Friends btnRef={friendsBtnRef} />
      </div>
    </div>
  );
}

export default ProfileBanner;

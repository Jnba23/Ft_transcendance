import Avatar from '@components/ui/Avatar';

type ProfileBadgeProps = {
  userId: number,
  username: string,
  level: number,
  created_at: string,
}

function ProfileBadge({ userId, username, level, created_at }: ProfileBadgeProps) {
  const date = new Date(created_at.split(' ')[0]);
  const month = date.toLocaleString("en-US", { month: "long" })
  const year = date.toLocaleString("en-US", { year: "numeric" });
  const joined_at = `${month} ${year}`;

  return (
    <div className={[
      "flex items-center gap-6 flex-col md:flex-row",
      "text-center md:text-start"
    ].join(' ')}>
      <div className="relative">
        {' '}
        {/* avatar */}
        <div className="border-4 border-primary rounded-full">
          <Avatar userId={userId} section="profile" />
        </div>
        <div
          className={[
            'bg-background-dark rounded-full absolute',
            '-bottom-1 -right-1 px-2 py-0.5 border border-white/10',
          ].join(' ')}
        >
          <span className={[
            'text-xs flex items-center gap-1',
            'font-bold text-yellow-400'
          ].join(' ')}>
            <span className='material-symbols-outlined !text-[14px]'>
              trophy
            </span>
              Rating {level}
          </span>
        </div>
      </div>
      <div>
        {' '}
        {/*text */}
        <h1 className="text-3xl font-bold tracking-right text-[#EFEFEF]">
          {username}
        </h1>
        <p className="text-white/60 mt-1">Joined: {joined_at}</p>
      </div>
    </div>
  );
}

export default ProfileBadge;

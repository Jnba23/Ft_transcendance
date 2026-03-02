import boy from '@assets/boy.jpg'
import Avatar from '@components/ui/Avatar';

function ProfileBadge() {
	return (
	<div className='flex items-center gap-6'>
		<div className='relative'> {/* avatar */}
			<div className='border-4 border-primary rounded-full'>
            	<Avatar path={boy} section='profile'/>
          	</div>
			<div className={[
			'bg-background-dark rounded-full absolute',
			'-bottom-1 -right-1 px-2 py-0.5 border border-white/10',
			].join(' ')}>
				<span className={[
					'text-xs',
					'font-bold text-yellow-400',
				].join(' ')}>
					Lv.24
				</span>
			</div>
        </div>
        <div> {/*text */}
			<h1 className='text-3xl font-bold tracking-right text-[#EFEFEF]'>
			Alex_Gamer99
			</h1>
			<p className='text-white/60 mt-1'>
			Joined: July 2024
			</p>
        </div>
	</div>
	);
}

export default ProfileBadge;
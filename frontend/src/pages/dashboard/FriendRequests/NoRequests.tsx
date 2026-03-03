import getTransitionClasses from "@utils/transitionStyles";
import { useEffect, useState } from "react";

type NoRequestsProps = {
	reqType: 'sent' | 'received';
}

function NoRequests({ reqType } : NoRequestsProps) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(true);
	}, []);

	return (
		<div className={[
			`${visible ? 'opacity-100' : 'opacity-0'}`,
			'h-48 flex items-center justify-center',
			'text-center px-6 transition-opacity duration-200'
		].join(' ')}>
        <div className='flex flex-col items-center gap-2'>
          <span className='material-symbols-outlined text-white/20 !text-5xl mb-1'>
            {reqType === 'sent' ? 'outgoing_mail' : 'mark_email_unread'}
          </span>
          <h4 className='text-white font-medium'>
            No requests yet
          </h4>
          <p className='text-[#A0A6BD] text-xs max-w-[240px]'>
            When you have friend requests, they will appear here
          </p>
        </div>
      </div>
	);
}

export default NoRequests;
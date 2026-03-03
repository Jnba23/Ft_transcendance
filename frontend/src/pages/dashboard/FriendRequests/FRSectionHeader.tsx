import TwoOptionsToggle from '@ui/TwoOptionsToggle';

type FRSectionHeaderProps = {
  setReqType: (reqType: 'received' | 'sent') => void;
};

function FRSectionHeader({ setReqType }: FRSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {' '}
      {/* Header: Title + Toggle */}
      <h3
        className={[
          'text-white text-lg font-bold',
          'leading-tight tracking-tight',
        ].join(' ')}
      >
        Friend Requests
      </h3>
      <TwoOptionsToggle
        opt1="Received"
        opt2="Sent"
        onOpt1Select={() => setReqType('received')}
        onOpt2Select={() => setReqType('sent')}
      />
    </div>
  );
}

export default FRSectionHeader;

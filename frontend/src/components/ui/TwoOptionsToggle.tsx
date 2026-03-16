import React from 'react';

type SectionStyles = {
  dashboard: string;
  profile: string;
};

const sectionStyles = {
  dashboard: 'flex-1',
  profile: '',
} satisfies SectionStyles;

type TwoOptionsToggleProps = {
  opt1: string;
  opt2: string;
  onOpt1Select?: () => void;
  onOpt2Select?: () => void;
  section: keyof SectionStyles;
};

function TwoOptionsToggle({
  opt1,
  opt2,
  onOpt1Select,
  onOpt2Select,
  section,
}: TwoOptionsToggleProps) {
  const [isOpt1Active, setIsOpt1Active] = React.useState(true);

  return (
    <div className="flex gap-2 items-center bg-black/20 rounded-lg p-1">
      <OptionButton
        label={opt1}
        isActive={isOpt1Active}
        onClick={() => {
          setIsOpt1Active(true);
          onOpt1Select?.();
        }}
        section={section}
      />
      <OptionButton
        label={opt2}
        isActive={!isOpt1Active}
        onClick={() => {
          setIsOpt1Active(false);
          onOpt2Select?.();
        }}
        section={section}
      />
    </div>
  );
}

function OptionButton({
  label,
  isActive,
  onClick,
  section,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  section: keyof SectionStyles;
}) {
  return (
    <button
      className={[
        `${sectionStyles[section]}`,
        'py-1 px-3 rounded-md transition-colors',
        'text-sm font-semibold text-white/60',
        'hover:bg-white/10 hover:text-white',
        'aria-pressed:bg-primary aria-pressed:text-white',
      ].join(' ')}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}
export default TwoOptionsToggle;

import RockSvg from '@assets/icon-rock.svg?react';
import PaperSvg from '@assets/icon-paper.svg?react';
import ScissorsSvg from '@assets/icon-scissors.svg?react';

interface ChoiceIconProps {
  choice: 'rock' | 'paper' | 'scissors';
  size?: number;
  className?: string;
}

export default function ChoiceIcon({
  choice,
  size = 64,
  className = '',
}: ChoiceIconProps) {
  const icons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    rock: RockSvg,
    paper: PaperSvg,
    scissors: ScissorsSvg,
  };

  const Icon = icons[choice];
  if (!Icon) {
    return <div>?</div>;
  }
  return <Icon width={size} height={size} className={className} />;
}

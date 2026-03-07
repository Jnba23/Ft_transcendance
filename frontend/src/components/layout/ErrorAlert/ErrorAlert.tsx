import { useErrorStore } from '@stores/error.store';
import getTransitionClasses from '@utils/transitionStyles';

function ErrorAlert() {
  const error = useErrorStore((state) => state.error);

  return (
    <div
      className={[
        `${getTransitionClasses(!!error, 'error')}`,
        'absolute top-4 left-1/2 -translate-x-1/2',
        'z-[50] max-w-md w-full px-4 pointer-events-none',
      ].join(' ')}
    >
      <div
        className={[
          'bg-[#16213E] gap-3 flex items-center',
          'border border-white/10',
          'border-l-4 border-l-loss p-4 rounded-lg',
          'shadow-2xl',
        ].join(' ')}
      >
        <span className="material-symbols-outlined text-loss !text-xl shrink-0">
          warning
        </span>
        <p className="flex-1 text-white text-sm font-medium text-center">
          {error}
        </p>
      </div>
    </div>
  );
}

export default ErrorAlert;

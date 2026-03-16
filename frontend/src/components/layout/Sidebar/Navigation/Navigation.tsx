import Logo from '@components/ui/Logo';
import NavItem from './NavItem';
import { useLayoutStore } from '@stores/layout.store';

function Navigation() {
  const hideSidebar = useLayoutStore((state) => state.hideSidebar);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex gap-4 items-center justify-between">
          <Logo />
          <button
            className={[
              'flex items-center justify-center size-7',
              'rounded-lg text-white/60 hover:text-white',
              'hover:bg-white/10 transition-colors md:hidden',
            ].join(' ')}
            onClick={hideSidebar}
          >
            <span className="material-symbols-outlined !text-xl">close</span>
          </button>
        </div>
      </div>
      <nav className="flex flex-col gap-8">
        <NavItem icon="dashboard" label="Dashboard" path="/dashboard" />
        <div className="pt-2">
          <h2
            className={[
              'text-white/60 text-xs font-bold',
              'mb-2 px-3 tracking-wider',
            ].join(' ')}
          >
            GAMES
          </h2>
          <NavItem icon="sports_tennis" label="Pong" path="/start_game/Pong" />
          <NavItem icon="sign_language" label="Rps" path="/start_game/Rps" />
        </div>
      </nav>
    </div>
  );
}

export default Navigation;

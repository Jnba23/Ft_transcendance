import logo from '@assets/logo.png';
import NavItem from './NavItem';

function Navigation() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3 px-3 h-10">
        <img src={logo} alt="logo" className="size-12" />
        <span className="text-white text-lg font-semibold">Pongoose</span>
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
          <NavItem icon="sports_tennis" label="Pong" path="/start_game" />
          <NavItem icon="sign_language" label="Rps" path="/start_rps" />
        </div>
      </nav>
    </div>
  );
}

export default Navigation;

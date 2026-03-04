import logo from '@assets/logo.png';

function Logo() {
	return (
	<div className="flex items-center gap-2 md:gap-3 md:px-3 h-10">
        <img src={logo} alt="logo" className="size-12" />
        <span className="text-white text-lg font-semibold">Pongoose</span>
      </div>
	);
}

export default Logo;
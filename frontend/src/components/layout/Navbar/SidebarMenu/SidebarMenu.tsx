import { useLayoutStore } from '@stores/layout.store';

function SidebarMenu() {
  const showSidebar = useLayoutStore((state) => state.showSidebar);

  return (
    <button
      className={[
        'flex items-center justify-center size-10',
        'bg-[#16213E]/50 border border-white/10 rounded-lg',
        'hover:bg-white/10 transition-colors text-white/80',
        'md:hidden',
      ].join(' ')}
      onClick={showSidebar}
    >
      <span className="material-symbols-outlined">menu</span>
    </button>
  );
}

export default SidebarMenu;

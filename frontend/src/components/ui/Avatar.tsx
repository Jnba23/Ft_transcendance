// add [secion_name: section_size_utility_class] mapping for
// the section where you wish to use this component

type SectionSizes = {
  // section_name: string
  userMenu: string;
  DM: string;
  chat: string;
  msg: string;
  friendRequest: string;
  profile: string;
  friends: string;
};

const sectionSizes = {
  // section_name: section_size
  userMenu: 'size-8',
  DM: 'size-8',
  chat: 'size-10',
  msg: 'size-8',
  friendRequest: 'size-10',
  profile: 'size-32',
  friends: 'size-8',
} satisfies SectionSizes;

type AvatarProps = {
  path: string;
  section: keyof SectionSizes;
  size?: string;
};

function Avatar({ path, section = 'userMenu', size }: AvatarProps) {
  return (
    <div
      className={[
        `${size || sectionSizes[section]}`,
        'rounded-full',
        'overflow-hidden',
        'aspect-square',
      ].join(' ')}
    >
      <img
        src={path}
        alt="User avatar"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Avatar;

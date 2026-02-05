import SectionHeader from './shared/SectionHeader';
import InputField from '@ui/InputField';
import UserList from './shared/UserList';
import type { User } from '@utils/types.ts';

type DirecMessagesProps = {
  users: User[];
  switchSection: () => void;
  setOpenChatUserId: (id: string) => void;
};

function DirecMessages({
  users,
  switchSection,
  setOpenChatUserId,
}: DirecMessagesProps) {
  return (
    <div className="w-full flex-shrink-0">
      <SectionHeader
        icon="person_search"
        label="direct messages"
        switchSection={switchSection}
      />
      <InputField placeholder="Find a friend" icon="search" />
      <UserList users={users} setOpenChatUserId={setOpenChatUserId} />
    </div>
  );
}

export default DirecMessages;

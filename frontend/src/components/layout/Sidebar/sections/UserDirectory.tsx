import SectionHeader from "./shared/SectionHeader";
import InputField from "@ui/InputField";
import UserList from "./shared/UserList";
import type { User } from "@utils/types.ts"

type UserDirectoryProps = {
	users: User[],
	switchSection: () => void,
	setOpenChatUserId: (id: string) => void,

}

function UserDirectory({
	users,
	switchSection,
	setOpenChatUserId,
} : UserDirectoryProps) {
	return (
		<div className="w-full flex-shrink-0">
			<SectionHeader
				icon="close"
				label="user directory"
				switchSection={switchSection}
			/>
			<InputField placeholder="Find users" icon="search"/>
			<UserList
				users={users}
				setOpenChatUserId={setOpenChatUserId}
			/> {/*send extra option in users */}
		</div>
	);
}

export default UserDirectory;
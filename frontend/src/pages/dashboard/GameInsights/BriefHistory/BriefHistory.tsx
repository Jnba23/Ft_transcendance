import { useErrorStore } from "@stores/error.store";
import HistoryCard from "./HistoryCard";
import { useEffect, useState } from "react";
import { GameHistoryItem } from "types/gameHistory";
import { gamesAPI } from "@api/games.api";
import { useUserDirectoryStore } from "@stores/userDirectory.store";

type BriefHistoryProps = {
	section: string
}

function BriefHistory({ section }: BriefHistoryProps) {
	const me = useUserDirectoryStore((state) => state.me);
	const showError = useErrorStore((state) => state.showError);
	const [games, setGames] = useState<GameHistoryItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!me?.id) return ;

		const fetchGames = async () => {
			try {
				const response = await gamesAPI.getGameHistory(me?.id, 1, 5, section === 'Pong' ? 'pong' : section);
				const data = response.data.games;
				setGames(data.filter(game => game.game_type.toLowerCase() === section.toLowerCase()));
			} catch {
				showError('Failed to fetch brief game history');
			} finally {
				setLoading(false);
			}
		};

		fetchGames();
	}, [section, me?.id]);

	if (loading) return <div></div>

	return (
		<HistoryCard name={section} history={games} />
	);
}

export default BriefHistory;
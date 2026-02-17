import FriendRequests from "./FriendRequests/FriendRequests";

function Dashboard() {
  return (
    <div>
      <div className="flex flex-col gap-12">
        <article>
          <div className={[
            'grid gap-8 grid-cols-1 lg:grid-cols-2',
            'bg-[#16213E]/50 p-6 rounded-lg',
            'border border-white/10',
          ].join(' ')}>
            <FriendRequests />
          </div>
        </article>
      </div>
    </div>
  );
}

export default Dashboard;

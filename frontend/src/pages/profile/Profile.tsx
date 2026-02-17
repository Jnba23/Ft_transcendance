import { useParams } from 'react-router'

function Profile() {
  const { id } = useParams();

  return <div className='text-white text-xl'>{id}</div>;
}

export default Profile;

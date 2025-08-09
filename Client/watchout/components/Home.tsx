import { Link } from '@react-navigation/native';
import { Text } from 'components/Base/Text';

export const Home = () => {
  return (
    <>
      <Text className="text-2xl font-bold mb-4">Welcome to WatchOut!</Text>
      <Text className='font-medium'>
        This is the home screen of your app. You can start building your features from here.ddd
      </Text>
      <Link screen='EventTypes' params={{}}>
        Go to Event Types
      </Link>
    </>
  );
}
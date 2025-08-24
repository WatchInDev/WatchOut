import { Text } from '../Base/Text';

export const ErrorDisplay = () => (
  <>
    <Text className='text-3xl font-bold text-center mt-12 mb-4'>Wystąpił problem!</Text>
    <Text className='text-gray-500 text-lg text-center'>
      Spróbuj ponownie za chwilę.
    </Text>
    <Text className='text-gray-500 text-lg text-center'>
      Pracujemy nad rozwiązaniem problemu!
    </Text>
  </>
)
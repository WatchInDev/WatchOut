import { Appbar } from "react-native-paper";
import { Button, getHeaderTitle } from '@react-navigation/elements';

export const NavigationBar = ({ route, options }: any) => {
  const title = getHeaderTitle(options, route.name);
  
  return (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => route?.navigation?.goBack()} />
      <Appbar.Content title={title} />
      <Appbar.Action icon="magnify" onPress={() => { }} />
      <Appbar.Action icon="dots-vertical" onPress={() => { }} />
    </Appbar.Header>
  )
}
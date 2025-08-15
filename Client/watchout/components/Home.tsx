import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE} from 'react-native-maps';

const styles = StyleSheet.create({
 container: {
   ...StyleSheet.absoluteFillObject,
   width: Dimensions.get('window').width,
   height: Dimensions.get('window').height,
   justifyContent: 'flex-end',
   alignItems: 'center',
 },
 map: {
   ...StyleSheet.absoluteFillObject,
 },
});

export const Home = () => (
   <View style={styles.container}>
     <MapView
       style={styles.map}
       provider={PROVIDER_GOOGLE}
       region={{
         latitude: 37.78825,
         longitude: -122.4324,
         latitudeDelta: 0.015,
         longitudeDelta: 0.0121,
       }}
     >
     </MapView>
   </View>
);
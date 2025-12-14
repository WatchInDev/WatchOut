import { Row } from 'components/Base/Row';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { theme } from 'utils/theme';
import { EventDetails } from 'features/events/details/EventDetails';
import { Event } from 'utils/types';
import { Text } from 'components/Base/Text';
import { Button } from 'react-native-paper';

type UserEventEntryProps = {
  event: Event;
  isActive: boolean;
  navigateToMap: (event: Event) => void;
  handleEventDeactivate: (eventId: number) => void;
};

export const UserEventEntry = ({
  event,
  isActive: isEventActive,
  navigateToMap,
  handleEventDeactivate,
}: UserEventEntryProps) => {

  return (
    <CustomSurface
      color={isEventActive ? undefined : '#c5c5c5'}
      bordered={isEventActive}
      style={{ padding: 10, marginVertical: 5 }}>
      {!isEventActive && (
        <Row
          style={{
            justifyContent: 'center',
            marginBottom: 10,
            paddingBottom: 5,
            borderBottomWidth: 2,
            borderStyle: 'dashed',
            borderBottomColor: theme.palette.tertiary,
          }}>
          <Text color="tertiary" variant="h5">
            Zdarzenie zakończone
          </Text>
        </Row>
      )}
      <EventDetails event={event} />
      <Row style={{ marginTop: 10, justifyContent: 'space-between' }}>
        {isEventActive && (
          <>
            <Button
              mode="outlined"
              style={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}
              icon="map"
              onPress={() => {
                navigateToMap(event);
              }}>
              Zobacz na mapie
            </Button>
            <Button
              mode="contained"
              style={{ backgroundColor: theme.palette.error }}
              onPress={() => {
                handleEventDeactivate(event.id);
              }}>
              Usuń zdarzenie
            </Button>
          </>
        )}
      </Row>
    </CustomSurface>
  );
};

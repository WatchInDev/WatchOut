import { StyleProp, View, ViewStyle } from 'react-native';
import { theme } from 'utils/theme';
import { Text } from 'components/Base/Text';
import { Button, Icon } from 'react-native-paper';

type EventRatingProps = {
  isUpVoted: boolean | null;
  onRate: (isUpvote: boolean) => void;
};

export const EventRating = ({ isUpVoted, onRate }: EventRatingProps) => {
  return (
    <View style={{ gap: 8 }}>
      {isUpVoted != null ? (
        <View style={{ alignItems: 'center', gap: 12 }}>
            <Icon
              source={isUpVoted ? 'thumb-up' : 'thumb-down'}
              size={64}
              color={isUpVoted ? `${theme.palette.primary}80` : `${theme.palette.error}80`}
            />
          <Text variant="body2" color="primary" style={{ textAlign: 'center' }}>
            {isUpVoted === true
              ? 'Potwierdziłeś autentyczność zdarzenia!'
              : ' Zaprzeczyłeś autentyczności zdarzenia.'}
          </Text>
        </View>
      ) : (
        <>
          <Text variant="body2" color="secondary" style={{ textAlign: 'center' }}>
            Czy potwierdzasz, że zdarzenie nadal ma miejsce?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', gap: 12 }}>
            <Button
              mode="contained"
              onPress={() => onRate(true)}
              style={[{ flex: 1, padding: 0 }, voteOpacity(isUpVoted, true)]}>
              Tak
            </Button>
            <Button
              mode="contained"
              style={[
                { flex: 1, backgroundColor: theme.palette.error },
                voteOpacity(isUpVoted, false),
              ]}
              onPress={() => onRate(false)}>
              Nie
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

const voteOpacity = (isUpVoted: boolean | null, buttonIsUpvote: boolean): StyleProp<ViewStyle> => {
  if (isUpVoted === null) return { opacity: 1 };
  return { opacity: isUpVoted === buttonIsUpvote ? 1 : 0.5 };
};

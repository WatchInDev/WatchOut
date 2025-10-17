import { View } from 'react-native';
import { useComments } from './useComments';
import { Text } from 'components/Base/Text';
import { CustomSurface } from 'components/Layout/CustomSurface';
import { Icon } from 'react-native-paper';
import { ScrollView, FlatList } from 'react-native-gesture-handler';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

type CommentListProps = {
  eventId: number;
};

export const CommentList = ({ eventId }: CommentListProps) => {
  const { data: comments, isFetching } = useComments(eventId);

  if (isFetching) {
    return <Text>Ładowanie komentarzy...</Text>;
  }

  return (
    <>
      <Text style={{ fontWeight: 'bold', fontSize: 24 }}>Komentarze ({comments?.length})</Text>
      {comments?.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Icon source={'comment'} size={64} color="#bbb" />
          <Text>Jeszcze nikt nie skomentował tego zdarzenia</Text>
        </View>
      ) : (
        <BottomSheetFlatList
          style={{ marginVertical: 16, paddingHorizontal: 12 }}
          scrollEnabled={true}
          keyExtractor={(item) => item.id.toString()}
          data={comments}
          renderItem={({ item }) => (
            <CustomSurface style={{ padding: 12, marginBottom: 12 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>{item.author.name}</Text>
              <Text>{item.content}</Text>
              <Text style={{ fontSize: 12, color: '#666' }}>
                {new Date(item.createdOn).toLocaleString()}
              </Text>
            </CustomSurface>
          )}
        />
      )}
    </>
  );
};
